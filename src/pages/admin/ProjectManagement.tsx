import { useState, useEffect, useRef, useCallback } from "react";
import { adminService } from "@/services";
import type { PaginationMeta } from "@/services/admin.service";
import {
  Briefcase,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Loader2,
  FolderOpen,
  CheckCircle,
  Clock,
  EyeOff,
  type LucideIcon,
} from "lucide-react";
import { toast } from "react-toastify";

// ============ TYPES ============

type StatusTab = "all" | "open" | "in-progress" | "completed" | "cancelled";

interface ProjectRow {
  _id: string;
  title: string;
  description?: string;
  status: string;
  categories?: string[];
  clientName?: string;
  clientId: string;

  deadline?: string;
  createdAt: string;
  completedAt?: string;
  hiredFreelancerId?: string;
}

// ============ HELPER COMPONENTS ============

const StatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, { label: string; className: string }> = {
    open: { label: "Open", className: "open" },
    "in-progress": { label: "In Progress", className: "in-progress" },
    completed: { label: "Completed", className: "completed" },
    cancelled: { label: "Cancelled", className: "cancelled" },
    draft: { label: "Draft", className: "pending" },
  };
  const c = config[status] || { label: status, className: "pending" };
  return <span className={`admin-status-badge ${c.className}`}>{c.label}</span>;
};

const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
}) => (
  <div className={`um-stat-card ${color}`}>
    <div className="um-stat-icon">
      <Icon size={20} />
    </div>
    <div className="um-stat-info">
      <div className="um-stat-value">{value}</div>
      <div className="um-stat-label">{label}</div>
    </div>
  </div>
);

// ============ MAIN COMPONENT ============

const ProjectManagement = () => {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [viewProject, setViewProject] = useState<ProjectRow | null>(null);
  const [editProject, setEditProject] = useState<ProjectRow | null>(null);
  const [editForm, setEditForm] = useState({ status: "", categories: [] as string[], title: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const limit = 12;

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = { page: currentPage, limit };
      if (activeTab !== "all") params.status = activeTab;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      const data = await adminService.getAllProjects(params);
      const sorted = (data.projects || []).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setProjects(sorted);
      setPagination(data.pagination || null);
    } catch (err) {
      console.error("Failed to load projects:", err);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeTab, searchQuery]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Reset page when tab/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  // Stats from pagination
  const total = pagination?.totalItems ?? projects.length;

  const handleDelete = async (projectId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this project and all associated applications? This action cannot be undone.")) return;
    try {
      setDeleting(projectId);
      await adminService.deleteProject(projectId);
      toast.success("Project deleted successfully");
      setActionMenuId(null);
      fetchProjects();
    } catch (err) {
      console.error("Failed to delete project:", err);
      toast.error("Failed to delete project");
    } finally {
      setDeleting(null);
    }
  };

  const handleHide = async (projectId: string) => {
    if (!window.confirm("Are you sure you want to hide this project? It will be set to invite-only visibility.")) return;
    try {
      await adminService.updateProject(projectId, { visibility: 'invite-only' });
      toast.success("Project hidden successfully");
      setActionMenuId(null);
      fetchProjects();
    } catch (err) {
      console.error("Failed to hide project:", err);
      toast.error("Failed to hide project");
    }
  };

  const handleEditOpen = (project: ProjectRow) => {
    setEditProject(project);
    setEditForm({
      status: project.status,
      categories: project.categories || [],
      title: project.title,
      description: project.description || "",
    });
    setActionMenuId(null);
  };

  const handleEditSave = async () => {
    if (!editProject) return;
    try {
      setSaving(true);
      await adminService.updateProject(editProject._id, editForm);
      toast.success("Project updated successfully");
      setEditProject(null);
      fetchProjects();
    } catch (err) {
      console.error("Failed to update project:", err);
      toast.error("Failed to update project");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };



  const tabs: { key: StatusTab; label: string }[] = [
    { key: "all", label: "All Projects" },
    { key: "open", label: "Open" },
    { key: "in-progress", label: "In Progress" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
  ];

  return (
    <>
      <div className="admin-content">
        {/* Stats Row */}
        <div className="admin-metrics-grid" style={{ marginBottom: "1.5rem" }}>
          <StatCard label="Total Projects" value={total} icon={Briefcase} color="indigo" />
          <StatCard label="Open" value={projects.filter(p => p.status === "open").length || "—"} icon={FolderOpen} color="emerald" />
          <StatCard label="In Progress" value={projects.filter(p => p.status === "in-progress").length || "—"} icon={Clock} color="amber" />
          <StatCard label="Completed" value={projects.filter(p => p.status === "completed").length || "—"} icon={CheckCircle} color="rose" />
        </div>

        {/* Main Card */}
        <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
          {/* Tabs + Search Bar */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.5rem", borderBottom: "1px solid var(--admin-border)", gap: "1rem" }}>
            {/* Tabs */}
            <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", flexWrap: "nowrap", paddingBottom: "0.25rem", WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={activeTab === tab.key ? "admin-btn admin-btn-primary admin-btn-sm" : "admin-btn admin-btn-outline admin-btn-sm"}
                  style={{ borderRadius: "9999px", fontSize: "0.8125rem", whiteSpace: "nowrap", flexShrink: 0 }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div style={{ position: "relative", minWidth: 220 }}>
              <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--admin-cloud-gray)" }} />
              <input
                type="text"
                placeholder="Search projects…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="admin-search-input"
                style={{ paddingLeft: "2.5rem", width: "100%" }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--admin-cloud-gray)", cursor: "pointer" }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "4rem 0" }}>
              <Loader2 size={32} style={{ color: "var(--admin-indigo)", animation: "spin 1s linear infinite" }} />
            </div>
          ) : projects.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 1.5rem" }}>
              <FolderOpen size={48} style={{ color: "var(--admin-cloud-gray)", margin: "0 auto 1rem", display: "block" }} />
              <p style={{ color: "var(--admin-white)", fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.5rem" }}>No projects found</p>
              <p style={{ color: "var(--admin-cloud-gray)", fontSize: "0.875rem" }}>Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="admin-table admin-table-responsive" style={{ minWidth: 900 }}>
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Client</th>
                    <th>Category</th>
                    <th>Status</th>

                    <th>Deadline</th>
                    <th>Created</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <ProjectTableRow
                      key={project._id}
                      project={project}
                      actionMenuId={actionMenuId}
                      setActionMenuId={setActionMenuId}
                      onView={() => { setViewProject(project); setActionMenuId(null); }}
                      onEdit={() => handleEditOpen(project)}
                      onHide={() => handleHide(project._id)}
                      onDelete={() => handleDelete(project._id)}
                      deleting={deleting === project._id}
                      formatDate={formatDate}

                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.5rem", borderTop: "1px solid var(--admin-border)" }}>
              <span style={{ color: "var(--admin-cloud-gray)", fontSize: "0.875rem" }}>
                Page {pagination.page} of {pagination.totalPages} ({pagination.totalItems} total)
              </span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  className="admin-btn admin-btn-outline admin-btn-sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft size={16} /> Prev
                </button>
                <button
                  className="admin-btn admin-btn-outline admin-btn-sm"
                  disabled={currentPage >= pagination.totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* VIEW MODAL */}
      {viewProject && (
        <div className="um-slideover-overlay open" onClick={() => setViewProject(null)}>
          <div className="um-slideover open" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="um-slideover-header" style={{ borderBottom: "1px solid var(--admin-border)", paddingBottom: "1rem" }}>
              <button className="um-slideover-close" onClick={() => setViewProject(null)}>
                <X size={20} />
              </button>
              <h3 style={{ color: "var(--admin-white)", fontSize: "1.25rem", fontWeight: 700, marginBottom: 4 }}>
                {viewProject.title}
              </h3>
              <StatusBadge status={viewProject.status} />
            </div>

            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem", overflowY: "auto", flex: 1 }}>
              <DetailRow label="Client" value={viewProject.clientName || "Unknown"} />
              <DetailRow label="Categories" value={(viewProject.categories || []).join(", ") || "—"} />

              <DetailRow label="Deadline" value={formatDate(viewProject.deadline)} />
              <DetailRow label="Created" value={formatDate(viewProject.createdAt)} />
              {viewProject.completedAt && <DetailRow label="Completed" value={formatDate(viewProject.completedAt)} />}
              {viewProject.description && (
                <div>
                  <span style={{ color: "var(--admin-cloud-gray)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Description</span>
                  <p style={{ color: "var(--admin-white)", fontSize: "0.875rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{viewProject.description}</p>
                </div>
              )}
            </div>

            <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid var(--admin-border)", display: "flex", gap: "0.75rem" }}>
              <button className="admin-btn admin-btn-primary admin-btn-sm" style={{ flex: 1 }} onClick={() => { handleEditOpen(viewProject); setViewProject(null); }}>
                <Edit size={14} /> Edit Project
              </button>
              <button className="admin-btn admin-btn-outline admin-btn-sm" style={{ flex: 1, color: "var(--admin-rose)", borderColor: "var(--admin-rose)" }} onClick={() => { handleDelete(viewProject._id); setViewProject(null); }}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editProject && (
        <div className="um-slideover-overlay open" onClick={() => setEditProject(null)}>
          <div className="um-slideover open" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="um-slideover-header" style={{ borderBottom: "1px solid var(--admin-border)", paddingBottom: "1rem" }}>
              <button className="um-slideover-close" onClick={() => setEditProject(null)}>
                <X size={20} />
              </button>
              <h3 style={{ color: "var(--admin-white)", fontSize: "1.25rem", fontWeight: 700 }}>
                Edit Project
              </h3>
            </div>

            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem", overflowY: "auto", flex: 1 }}>
              {/* Title */}
              <div>
                <label style={{ color: "var(--admin-cloud-gray)", fontSize: "0.8125rem", fontWeight: 600, display: "block", marginBottom: 6 }}>Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                  className="admin-search-input"
                  style={{ width: "100%" }}
                />
              </div>

              {/* Status */}
              <div>
                <label style={{ color: "var(--admin-cloud-gray)", fontSize: "0.8125rem", fontWeight: 600, display: "block", marginBottom: 6 }}>Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                  className="admin-select"
                  style={{ width: "100%" }}
                >
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label style={{ color: "var(--admin-cloud-gray)", fontSize: "0.8125rem", fontWeight: 600, display: "block", marginBottom: 6 }}>Categories (comma separated)</label>
                <input
                  type="text"
                  value={editForm.categories.join(", ")}
                  onChange={(e) => setEditForm((f) => ({ ...f, categories: e.target.value.split(",").map(c => c.trim()).filter(Boolean) }))}
                  className="admin-search-input"
                  style={{ width: "100%" }}
                />
              </div>

              {/* Description */}
              <div>
                <label style={{ color: "var(--admin-cloud-gray)", fontSize: "0.8125rem", fontWeight: 600, display: "block", marginBottom: 6 }}>Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                  className="admin-search-input"
                  style={{ width: "100%", minHeight: 120, resize: "vertical" }}
                />
              </div>
            </div>

            <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid var(--admin-border)", display: "flex", gap: "0.75rem" }}>
              <button className="admin-btn admin-btn-outline admin-btn-sm" style={{ flex: 1 }} onClick={() => setEditProject(null)}>Cancel</button>
              <button className="admin-btn admin-btn-primary admin-btn-sm" style={{ flex: 1 }} onClick={handleEditSave} disabled={saving}>
                {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <CheckCircle size={14} />}
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ============ TABLE ROW ============

const ProjectTableRow = ({
  project,
  actionMenuId,
  setActionMenuId,
  onView,
  onEdit,
  onHide,
  onDelete,
  deleting,
  formatDate,

}: {
  project: ProjectRow;
  actionMenuId: string | null;
  setActionMenuId: (id: string | null) => void;
  onView: () => void;
  onEdit: () => void;
  onHide: () => void;
  onDelete: () => void;
  deleting: boolean;
  formatDate: (d?: string) => string;

}) => {
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
        if (actionMenuId === project._id) setActionMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [actionMenuId, project._id, setActionMenuId]);

  return (
    <tr>
      <td data-label="Project">
        <div style={{ display: "flex", flexDirection: "column", gap: 2, textAlign: "right", alignItems: "flex-end" }}>
          <span style={{ fontWeight: 600, color: "var(--admin-white)", fontSize: "0.875rem" }}>{project.title}</span>
        </div>
      </td>
      <td data-label="Client">
        <span style={{ color: "var(--admin-cloud-gray)", fontSize: "0.875rem" }}>{project.clientName || "Unknown"}</span>
      </td>
      <td data-label="Category">
        <span style={{ color: "var(--admin-cloud-gray)", fontSize: "0.8125rem" }}>{(project.categories || []).join(", ") || "—"}</span>
      </td>
      <td data-label="Status"><StatusBadge status={project.status} /></td>

      <td data-label="Deadline">
        <span style={{ color: "var(--admin-cloud-gray)", fontSize: "0.8125rem" }}>{formatDate(project.deadline)}</span>
      </td>
      <td data-label="Created">
        <span style={{ color: "var(--admin-cloud-gray)", fontSize: "0.8125rem" }}>{formatDate(project.createdAt)}</span>
      </td>
      <td data-label="Actions">
        <div className="um-actions-wrapper" ref={actionsRef} style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            className="um-actions-btn"
            onClick={() => setActionMenuId(actionMenuId === project._id ? null : project._id)}
          >
            <MoreHorizontal size={18} />
          </button>
          {actionMenuId === project._id && (
            <div className="um-actions-dropdown">
              <button onClick={onView}>
                <Eye size={14} /> View Details
              </button>
              <button onClick={onEdit}>
                <Edit size={14} /> Edit Project
              </button>
              <button onClick={onHide}>
                <EyeOff size={14} /> Hide Project
              </button>
              <div className="um-actions-divider"></div>
              <button className="danger" onClick={onDelete} disabled={deleting}>
                {deleting ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Trash2 size={14} />}
                {deleting ? "Deleting…" : "Delete Project"}
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

// ============ DETAIL ROW HELPER ============

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div>
    <span style={{ color: "var(--admin-cloud-gray)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>{label}</span>
    <span style={{ color: "var(--admin-white)", fontSize: "0.9375rem" }}>{value}</span>
  </div>
);

export default ProjectManagement;
