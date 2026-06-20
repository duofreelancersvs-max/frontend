import { useState, useEffect, useCallback } from "react";
import { adminService } from "@/services";
import type { AdminProject } from "@/services/admin.service";
import {
  Briefcase,
  Search,
  X,
  Loader2,
  FolderOpen,
  Clock,
  CheckCircle,
  User,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// ─── Status badge ────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  open: { label: "Open", cls: "admin-status-badge open" },
  "in-progress": { label: "In Progress", cls: "admin-status-badge in-progress" },
  completed: { label: "Completed", cls: "admin-status-badge completed" },
  cancelled: { label: "Cancelled", cls: "admin-status-badge cancelled" },
  draft: { label: "Draft", cls: "admin-status-badge pending" },
};

const StatusBadge = ({ status }: { status: string }) => {
  const c = STATUS_CONFIG[status] ?? { label: status, cls: "admin-status-badge pending" };
  return <span className={c.cls}>{c.label}</span>;
};

// ─── Main component ──────────────────────────────────────────────

const LIMIT = 12;

const MyProjects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch a large page so we can client-side filter by customClientName
      const data = await adminService.getAllProjects({ page: currentPage, limit: LIMIT });
      const all: AdminProject[] = data.projects || [];

      // Keep only projects posted by admin (they have a customClientName)
      const adminProjects = all.filter((p) => !!p.customClientName);

      const filtered = searchQuery.trim()
        ? adminProjects.filter(
            (p) =>
              p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (p.customClientName ?? "").toLowerCase().includes(searchQuery.toLowerCase())
          )
        : adminProjects;

      setProjects(filtered);
      setTotalPages(data.pagination?.totalPages ?? 1);
      setTotalItems(filtered.length);
    } catch (err) {
      console.error("Failed to load admin projects:", err);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="um-page-wrapper">
      {/* Header */}
      <div className="um-page-header">
        <div className="um-page-title-group">
          <div className="um-page-icon">
            <Briefcase size={22} />
          </div>
          <div>
            <h1 className="um-page-title">My Projects</h1>
            <p className="um-page-subtitle">
              Projects posted by admin with custom client identities
            </p>
          </div>
        </div>
        <button
          className="admin-btn admin-btn-primary"
          onClick={() => navigate("/admin/post-project")}
        >
          + Post New Project
        </button>
      </div>

      {/* Stats strip */}
      <div className="um-stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: "1.5rem" }}>
        <div className="um-stat-card indigo">
          <div className="um-stat-icon"><Briefcase size={20} /></div>
          <div className="um-stat-info">
            <div className="um-stat-value">{totalItems}</div>
            <div className="um-stat-label">Total Admin Projects</div>
          </div>
        </div>
        <div className="um-stat-card amber">
          <div className="um-stat-icon"><Clock size={20} /></div>
          <div className="um-stat-info">
            <div className="um-stat-value">
              {projects.filter((p) => p.status === "open" || p.status === "in-progress").length}
            </div>
            <div className="um-stat-label">Active</div>
          </div>
        </div>
        <div className="um-stat-card emerald">
          <div className="um-stat-icon"><CheckCircle size={20} /></div>
          <div className="um-stat-info">
            <div className="um-stat-value">
              {projects.filter((p) => p.status === "completed").length}
            </div>
            <div className="um-stat-label">Completed</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="um-filters-bar" style={{ marginBottom: "1.5rem" }}>
        <div className="um-search-wrapper" style={{ flex: 1 }}>
          <Search size={16} className="um-search-icon" />
          <input
            className="um-search-input"
            placeholder="Search by project title or client name…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="um-search-clear" onClick={() => setSearchQuery("")}>
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={36} className="animate-spin text-indigo-400" />
        </div>
      ) : projects.length === 0 ? (
        <div className="um-empty-state">
          <FolderOpen size={48} />
          <p>No admin-posted projects found</p>
          <span>
            {searchQuery
              ? "Try a different search term."
              : 'Use "Post New Project" to add your first project.'}
          </span>
        </div>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1rem",
            }}
          >
            {projects.map((project) => (
              <div
                key={project._id}
                className="um-user-card"
                style={{ cursor: "default" }}
              >
                {/* Card header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                  <h3
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      color: "var(--um-text-primary)",
                      lineHeight: 1.4,
                      flex: 1,
                      marginRight: "0.5rem",
                    }}
                  >
                    {project.title}
                  </h3>
                  <StatusBadge status={project.status} />
                </div>

                {/* Description */}
                {project.description && (
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--um-text-muted)",
                      marginBottom: "0.75rem",
                      lineHeight: 1.5,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {project.description}
                  </p>
                )}

                {/* Meta */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.78rem", color: "var(--um-text-muted)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <User size={13} />
                    <span>Posted as: <strong style={{ color: "var(--um-accent)" }}>{project.customClientName}</strong></span>
                  </div>
                  {project.categories && project.categories.length > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <Briefcase size={13} />
                      <span>{project.categories.join(", ")}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <CalendarDays size={13} />
                    <span>
                      Created:{" "}
                      {new Date(project.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  {project.deadline && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <Clock size={13} />
                      <span>
                        Deadline:{" "}
                        {new Date(project.deadline).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="um-pagination" style={{ marginTop: "1.5rem" }}>
              <button
                className="um-page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft size={16} />
              </button>
              <span className="um-page-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="um-page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyProjects;
