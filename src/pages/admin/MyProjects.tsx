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
  open: { label: "Open", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  "in-progress": { label: "In Progress", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  completed: { label: "Completed", cls: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
  cancelled: { label: "Cancelled", cls: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
  draft: { label: "Draft", cls: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
};

const StatusBadge = ({ status }: { status: string }) => {
  const c = STATUS_CONFIG[status] ?? { label: status, cls: "bg-slate-500/10 text-slate-400 border-slate-500/20" };
  return <span className={`px-2.5 py-1 text-xs font-medium border rounded-full ${c.cls}`}>{c.label}</span>;
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

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    try {
      await adminService.updateProject(projectId, { status: newStatus });
      toast.success("Project status updated successfully");
      fetchProjects();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update project status");
    }
  };

  return (
    <div className="flex flex-col min-h-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-xl">
            <Briefcase className="text-indigo-400" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">My Projects</h1>
            <p className="text-slate-400 text-sm mt-1">
              Projects posted by admin with custom client identities
            </p>
          </div>
        </div>
        <button
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
          onClick={() => navigate("/admin/post-project")}
        >
          <span>+ Post New Project</span>
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Admin Projects */}
        <div className="bg-[#18181b] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400"><Briefcase size={24} /></div>
          <div>
            <div className="text-2xl font-bold text-white">{totalItems}</div>
            <div className="text-sm text-slate-400 mt-1">Total Admin Projects</div>
          </div>
        </div>
        {/* Active Projects */}
        <div className="bg-[#18181b] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400"><Clock size={24} /></div>
          <div>
            <div className="text-2xl font-bold text-white">
              {projects.filter((p) => p.status === "open" || p.status === "in-progress").length}
            </div>
            <div className="text-sm text-slate-400 mt-1">Active</div>
          </div>
        </div>
        {/* Completed Projects */}
        <div className="bg-[#18181b] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400"><CheckCircle size={24} /></div>
          <div>
            <div className="text-2xl font-bold text-white">
              {projects.filter((p) => p.status === "completed").length}
            </div>
            <div className="text-sm text-slate-400 mt-1">Completed</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="text-slate-500" size={18} />
        </div>
        <input
          type="text"
          className="w-full bg-[#18181b] border border-white/10 rounded-xl py-3 pl-10 pr-10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
          placeholder="Search by project title or client name…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button 
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white transition-colors"
            onClick={() => setSearchQuery("")}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-24">
            <Loader2 size={36} className="animate-spin text-indigo-400" />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <FolderOpen size={32} className="text-slate-400" />
            </div>
            <p className="text-lg font-medium text-white mb-2">No admin-posted projects found</p>
            <p className="text-slate-400 max-w-sm">
              {searchQuery
                ? "Try a different search term or clear the search filter."
                : 'Use the "Post New Project" button above to add your first project.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
              {projects.map((project) => (
                <div
                  key={project._id}
                  className="bg-[#18181b] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors flex flex-col"
                >
                  {/* Card header */}
                  <div className="flex justify-between items-start mb-4 gap-3">
                    <h3 className="text-base font-semibold text-white leading-snug line-clamp-2 break-words flex-1">
                      {project.title}
                    </h3>
                    <div className="shrink-0">
                      <StatusBadge status={project.status} />
                    </div>
                  </div>

                  {/* Description */}
                  {project.description && (
                    <p className="text-sm text-slate-400 mb-5 line-clamp-2 break-words leading-relaxed">
                      {project.description}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="flex flex-col gap-2.5 text-sm text-slate-400 mt-auto">
                    <div className="flex items-center gap-2.5">
                      <User size={14} className="text-slate-500" />
                      <span className="truncate">Posted as: <strong className="text-indigo-400 font-medium">{project.customClientName}</strong></span>
                    </div>
                    {project.categories && project.categories.length > 0 && (
                      <div className="flex items-center gap-2.5">
                        <Briefcase size={14} className="text-slate-500" />
                        <span className="truncate">{project.categories.join(", ")}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2.5">
                      <CalendarDays size={14} className="text-slate-500" />
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
                      <div className="flex items-center gap-2.5">
                        <Clock size={14} className="text-slate-500" />
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

                  {/* Actions */}
                  <div className="mt-5 pt-4 border-t border-white/5 flex justify-end items-center">
                    {project.status !== "completed" ? (
                      <button
                        onClick={() => handleStatusChange(project._id, "completed")}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg transition-colors"
                      >
                        <CheckCircle size={14} />
                        Mark as Completed
                      </button>
                    ) : (
                      <span className="text-sm text-slate-400 flex items-center gap-1.5 px-2 py-1">
                        <CheckCircle size={14} className="text-emerald-500" />
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-4">
                <button
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-sm font-medium text-slate-400">
                  Page <span className="text-white">{currentPage}</span> of <span className="text-white">{totalPages}</span>
                </span>
                <button
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyProjects;
