import { useState, useEffect } from "react";
import { Link, useNavigate, useOutletContext, useSearchParams } from "react-router-dom";
import type { ClientLayoutContext } from "@/layouts/ClientLayout";
import {
  User,
  PlusCircle,
  Search,
  MoreVertical,
  Grid3X3,
  List,
  Calendar,
  Users,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  Briefcase,
  MapPin,
  Loader2,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { projectService } from "@/services";
import { useSocket } from "@/hooks/useSocket";
import type { Project, ProjectStats } from "@/services";
import ReviewProjectModal from "@/components/modals/ReviewProjectModal";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import DashboardHeader from "@/components/layouts/DashboardHeader";
import { toast } from "react-toastify";
import { useIsMdUp } from "@/hooks/useMediaQuery";

// Helper to format deadline as a clean date string
const formatDeadline = (deadline: string) => {
  try {
    return new Date(deadline).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return deadline;
  }
};

const ClientProjects = () => {
  const { setSidebarOpen } = useOutletContext<ClientLayoutContext>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "all");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setCurrentPage(1);
    setSearchParams({ tab: tabId }, { replace: true });
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [openMenuId, setOpenMenuId] = useState<string | number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [projectToReview, setProjectToReview] = useState<Project | null>(null);
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [projectToComplete, setProjectToComplete] = useState<string | null>(null);
  const navigate = useNavigate();
  const isMdUp = useIsMdUp();

  useEffect(() => {
    if (!isMdUp && viewMode === "list") {
      setViewMode("grid");
    }
  }, [isMdUp, viewMode]);

  // Build tabs dynamically from stats
  const tabs = [
    { id: "all", label: "All", count: stats?.total ?? null },
    { id: "open", label: "Open", count: stats?.open ?? null },
    {
      id: "in-progress",
      label: "In Progress",
      count: stats?.inProgress ?? null,
    },
    { id: "completed", label: "Completed", count: stats?.completed ?? null },
    { id: "cancelled", label: "Cancelled", count: stats?.cancelled ?? null },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [projectsData, statsData] = await Promise.all([
          projectService.getMyClientProjects({ limit: 100 }),
          projectService.getMyClientStats(),
        ]);
        setProjects(projectsData.projects || []);
        setStats(statsData);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Listen for real-time application updates
  const { socket } = useSocket();
  useEffect(() => {
    if (!socket) return;
    
    const handleNewApplication = (data: { projectId: string; applicationId: string }) => {
      setProjects((prev) => 
        prev.map((p) => 
          p._id === data.projectId 
            ? { ...p, applications: (p.applications || 0) + 1 } 
            : p
        )
      );
    };

    socket.on("application:new", handleNewApplication);
    return () => {
      socket.off("application:new", handleNewApplication);
    };
  }, [socket]);

  const handleDeleteClick = (projectId: string) => {
    setProjectToDelete(projectId);
    setDeleteModalOpen(true);
    setOpenMenuId(null);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    try {
      setDeletingId(projectToDelete);
      await projectService.delete(projectToDelete);
      setProjects(projects.filter((p) => p._id !== projectToDelete));
      toast.success("Project deleted successfully");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project. Please try again.");
    } finally {
      setDeletingId(null);
      setDeleteModalOpen(false);
      setProjectToDelete(null);
    }
  };

  const handleEdit = (projectId: string) => {
    setOpenMenuId(null);
    navigate(`/client/project/${projectId}/edit`);
  };

  const handleCompleteClick = (projectId: string) => {
    setProjectToComplete(projectId);
    setCompleteModalOpen(true);
    setOpenMenuId(null);
  };

  const handleConfirmComplete = async () => {
    if (!projectToComplete) return;
    try {
      setCompletingId(projectToComplete);
      await projectService.complete(projectToComplete);

      setProjects(
        projects.map((p) =>
          p._id === projectToComplete ? { ...p, status: "completed" } : p,
        ),
      );
      toast.success("Project marked as completed");

      if (stats) {
        setStats({
          ...stats,
          inProgress: Math.max(0, (stats.inProgress || 0) - 1),
          completed: (stats.completed || 0) + 1,
        });
      }
    } catch (error) {
      console.error("Error completing project:", error);
      toast.error("Failed to complete project. Please try again.");
    } finally {
      setCompletingId(null);
      setCompleteModalOpen(false);
      setProjectToComplete(null);
    }
  };

  const handleOpenReview = (project: Project) => {
    setProjectToReview(project);
    setReviewModalOpen(true);
  };

  const itemsPerPage = 6;

  // Filter projects based on active tab
  const filteredProjects = projects
    .filter((project) => {
      if (activeTab === "all") return true;
      if (activeTab === "open") return project.status === "open";
      if (activeTab === "in-progress") return project.status === "in-progress";
      if (activeTab === "completed") return project.status === "completed";
      if (activeTab === "cancelled") return project.status === "cancelled";
      return true;
    })
    .filter(
      (project) =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.categories || []).some(c => c.toLowerCase().includes(searchQuery.toLowerCase())),
    );

  // Sort projects
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Pagination
  const totalPages = Math.ceil(sortedProjects.length / itemsPerPage);
  const paginatedProjects = sortedProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal"></div>
      </div>
    );
  }

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "open":
        return "bg-teal/10 text-teal";
      case "in-progress":
        return "bg-royal-blue/10 text-royal-blue";
      case "completed":
        return "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400";
      case "draft":
        return "bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400";
      case "cancelled":
        return "bg-red-100 dark:bg-red-900/20 text-red-500 dark:text-red-400";
      default:
        return "bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open":
        return "Open";
      case "in-progress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "draft":
        return "Draft";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-50 dark:bg-background font-sans">
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Project"
        description="Are you sure you want to delete this project? This action cannot be undone."
        isLoading={!!deletingId}
      />
      <ConfirmationModal
        isOpen={completeModalOpen}
        onClose={() => setCompleteModalOpen(false)}
        onConfirm={handleConfirmComplete}
        title="Complete Project"
        description="Are you sure you want to mark this project as completed?"
        isLoading={!!completingId}
      />
      {/* MAIN CONTENT */}
      <div>
      <DashboardHeader
        title="My Projects"
        onMenuClick={() => setSidebarOpen(true)}
      />

        {/* Main Content Area */}
        <main className="dashboard-content">
           {/* TABS */}
          <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm">
            <div className="flex overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-all",
                    activeTab === tab.id
                      ? "border-teal text-teal"
                      : "border-transparent text-slate-500 dark:text-slate-400 hover:text-navy dark:hover:text-white hover:border-slate-200 dark:hover:border-white/10",
                  )}
                >
                  {tab.label}
                  {tab.count !== null && (
                    <span
                      className={cn(
                        "px-2 py-0.5 text-xs font-bold rounded-full",
                        activeTab === tab.id
                          ? "bg-teal/10 text-teal"
                          : "bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400",
                      )}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* FILTER BAR */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-1 gap-3 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:max-w-xs">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                 <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 border-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-white focus:border-teal focus:ring-teal"
                />
              </div>

              {/* Sort */}
               <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-10 px-3 rounded-lg border border-slate-200 dark:border-white/10 text-sm text-navy dark:text-white bg-white dark:bg-white/5 focus:border-teal focus:ring-1 focus:ring-teal"
              >
                <option value="recent" className="dark:bg-[#121A2A]">Recent</option>
              </select>
            </div>

             {/* View Toggle — list view desktop only */}
            <div className="hidden md:flex bg-slate-100 dark:bg-white/5 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md transition-all",
                  viewMode === "grid"
                    ? "bg-white dark:bg-[#121A2A] text-navy dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-navy dark:hover:text-white",
                )}
                aria-label="Grid view"
              >
                <Grid3X3 size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md transition-all",
                  viewMode === "list"
                    ? "bg-white dark:bg-[#121A2A] text-navy dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-navy dark:hover:text-white",
                )}
                aria-label="List view"
              >
                <List size={18} />
              </button>
            </div>
          </div>

          {/* PROJECTS */}
          {paginatedProjects.length > 0 ? (
            <>
              {/* GRID VIEW */}
              {viewMode === "grid" && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                  {paginatedProjects.map((project) => (
                     <div
                      key={project._id}
                      className="group bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col h-full"
                    >
                      {/* Card Header */}
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-start justify-between mb-3">
                          <span
                            className={cn(
                              "px-2.5 py-1 rounded-full text-xs font-semibold",
                              getStatusStyles(project.status),
                            )}
                          >
                            {getStatusLabel(project.status)}
                          </span>
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(
                                  openMenuId === project._id
                                    ? null
                                    : project._id,
                                );
                              }}
                              className="p-1 text-slate-400 hover:text-navy hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <MoreVertical size={18} />
                            </button>
                            {openMenuId === project._id && (
                              <div
                                className="absolute right-0 mt-1 w-40 bg-white dark:bg-[#121A2A] rounded-xl shadow-lg border border-slate-100 dark:border-white/10 py-1 z-50"
                                onClick={(e) => e.stopPropagation()}
                              >
                                 <button
                                  onClick={() => handleEdit(project._id)}
                                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
                                >
                                  <Edit2 size={14} /> Edit
                                </button>
                                 <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDeleteClick(project._id);
                                  }}
                                  disabled={deletingId === project._id}
                                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                                >
                                  <Trash2 size={14} />{" "}
                                  {deletingId === project._id
                                    ? "Deleting..."
                                    : "Delete"}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                         <h3 className="font-semibold text-navy dark:text-white mb-1 line-clamp-1 text-lg">
                          {project.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                           {(project.categories || []).map((cat) => (
                             <span key={cat} className="inline-block px-2.5 py-0.5 bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 rounded-md text-xs font-medium w-fit">
                              {cat}
                            </span>
                           ))}
                          {project.location &&
                            (project.location.city ||
                              project.location.country) && (
                               <span className="inline-flex items-center px-2.5 py-0.5 bg-teal/5 text-teal border border-teal/10 dark:border-teal/20 rounded-md text-xs font-medium w-fit">
                                <MapPin size={12} className="mr-1" />
                                {project.location.city}
                                {project.location.city &&
                                project.location.country
                                  ? ", "
                                  : ""}
                                {project.location.country}
                              </span>
                            )}
                        </div>
                         <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-4">
                          {project.description}
                        </p>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {(project.requiredSkills || []).slice(0, 3).map((skill) => (
                             <span
                              key={skill}
                              className="px-2 py-0.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 rounded-md text-xs font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                          {(project.requiredSkills || []).length > 3 && (
                             <span className="px-2 py-0.5 bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-slate-500 rounded-md text-xs border border-transparent">
                              +{(project.requiredSkills || []).length - 3}
                            </span>
                          )}
                        </div>

                         {/* Freelancer Section - consistently sized placeholder if empty */}
                        <div className="mt-auto pt-3 border-t border-slate-50/50 dark:border-white/5">
                          {project.freelancer ? (
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal to-royal-blue flex items-center justify-center text-white text-xs font-bold shadow-sm ring-2 ring-white">
                                {project.freelancer.avatar ||
                                  project.freelancer.fullName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                                  Assigned to
                                </span>
                                <span className="text-sm font-semibold text-navy dark:text-white leading-none">
                                  {project.freelancer.fullName}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2.5 opacity-50 grayscale">
                               <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-slate-500">
                                <User size={14} />
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                                  Status
                                </span>
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-none">
                                  Not Assigned
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="px-5 py-4 bg-slate-50/50 dark:bg-white/5 border-t border-slate-100 dark:border-white/10">
                        <div className="grid grid-cols-2 gap-3 mb-4 divide-x divide-slate-200/60 dark:divide-white/5">
                           <div className="flex flex-col items-center text-center">
                            <span className="text-xxs uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                              Applicants
                            </span>
                            <span className="text-sm font-semibold text-navy dark:text-white">
                              {project.applications}
                            </span>
                          </div>
                          <div className="flex flex-col items-center text-center">
                            <span className="text-xxs uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                              Deadline
                            </span>
                            <span className="text-sm font-semibold text-navy dark:text-white">
                              {formatDeadline(project.deadline)}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Link
                            to={`/client/project/${project._id}`}
                            className="flex-1 min-w-0"
                          >
                             <Button
                              variant="outline"
                              className="w-full h-9 px-2 text-xs border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-navy dark:hover:text-white hover:bg-white dark:hover:bg-white/5 bg-white dark:bg-white/5 hover:border-slate-300 dark:hover:border-white/20 shadow-sm"
                            >
                              <Eye size={14} className="mr-1.5 shrink-0" /> <span className="truncate">View Details</span>
                            </Button>
                          </Link>

                          {project.status === "open" ? (
                            <Link
                              to={`/client/project/${project._id}/applications`}
                              className="flex-1 min-w-0"
                            >
                              <Button className="w-full h-9 px-2 text-xs bg-teal hover:bg-teal-light text-white shadow-sm shadow-teal/20">
                                <Users size={14} className="mr-1.5 shrink-0" />{" "}
                                <span className="truncate">Applicants</span>
                              </Button>
                            </Link>
                          ) : project.status === "in-progress" ? (
                            <Button
                              className="flex-1 h-9 px-2 text-xs bg-royal-blue hover:bg-royal-blue/90 text-white shadow-sm shadow-royal-blue/20"
                              onClick={() => handleCompleteClick(project._id)}
                              disabled={completingId === project._id}
                            >
                              {completingId === project._id ? (
                                <Loader2
                                  size={14}
                                  className="mr-1.5 shrink-0 animate-spin"
                                />
                              ) : (
                                <CheckCircle size={14} className="mr-1.5" />
                              )}{" "}
                              {completingId === project._id
                                ? "Completing..."
                                : "Complete"}
                            </Button>
                          ) : project.status === "completed" && project.freelancer ? (
                            <Button
                              className="flex-1 h-9 text-xs bg-gold hover:bg-gold/90 text-navy shadow-sm"
                              onClick={() => handleOpenReview(project)}
                            >
                              <Star size={14} className="mr-1.5 fill-navy" />{" "}
                              Leave Review
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              className="flex-1 h-9 text-xs text-slate-400 cursor-default hover:bg-transparent"
                            >
                              No Actions
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* LIST VIEW — desktop only */}
              {viewMode === "list" && (
                <div className="hidden md:block bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-white/5 text-left">
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                            Project
                          </th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                            Status
                          </th>

                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                            Applications
                          </th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                            Deadline
                          </th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {paginatedProjects.map((project) => (
                          <tr
                            key={project._id}
                            className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-medium text-navy dark:text-white">
                                  {project.title}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                                    {(project.categories || []).join(", ")}
                                  </p>
                                  {project.location &&
                                    (project.location.city ||
                                      project.location.country) && (
                                      <span className="flex items-center text-xs text-teal bg-teal/5 dark:bg-teal/10 border border-teal/10 dark:border-teal/20 px-1.5 py-0.5 rounded">
                                        <MapPin size={10} className="mr-1" />
                                        {project.location.city}
                                        {project.location.city &&
                                        project.location.country
                                          ? ", "
                                          : ""}
                                        {project.location.country}
                                      </span>
                                    )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={cn(
                                  "px-2.5 py-1 rounded-full text-xs font-semibold",
                                  getStatusStyles(project.status),
                                )}
                              >
                                {getStatusLabel(project.status)}
                              </span>
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                                <Users size={14} className="text-slate-400 dark:text-slate-500" />
                                {project.applications}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                                <Calendar
                                  size={14}
                                  className="text-slate-400 dark:text-slate-500"
                                />
                                {formatDeadline(project.deadline)}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Link to={`/client/project/${project._id}`}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2"
                                  >
                                    <Eye size={16} />
                                  </Button>
                                </Link>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2"
                                >
                                  <Edit2 size={16} />
                                </Button>
                                 <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDeleteClick(project._id);
                                  }}
                                  disabled={deletingId === project._id}
                                >
                                  <Trash2 size={16} />
                                </Button>
                                {project.status === "in-progress" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2 text-royal-blue hover:text-royal-blue/90 hover:bg-royal-blue/10"
                                    onClick={() => handleCompleteClick(project._id)}
                                    disabled={completingId === project._id}
                                    title="Mark as Complete"
                                  >
                                    {completingId === project._id ? (
                                      <Loader2
                                        size={16}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <CheckCircle size={16} />
                                    )}
                                  </Button>
                                )}
                                {project.status === "completed" && project.freelancer && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2 text-gold hover:text-gold/90 hover:bg-gold/10"
                                    onClick={() => handleOpenReview(project)}
                                    title="Leave Review"
                                  >
                                    <Star size={16} className="fill-gold" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between w-full min-w-0">
                  <p className="text-sm text-slate-500">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(
                      currentPage * itemsPerPage,
                      sortedProjects.length,
                    )}{" "}
                    of {sortedProjects.length} projects
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="h-9 px-3"
                    >
                      <ChevronLeft size={16} />
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={cn(
                            "h-9 w-9",
                            currentPage === page &&
                              "bg-teal hover:bg-teal-light",
                          )}
                        >
                          {page}
                        </Button>
                      ),
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="h-9 px-3"
                    >
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* EMPTY STATE */
            <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center mx-auto mb-6">
                <Briefcase size={40} className="text-slate-300 dark:text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-navy dark:text-white mb-2">
                No projects yet
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
                {activeTab === "all"
                  ? "Get started by posting your first project and find amazing freelancers."
                  : `You don't have any ${activeTab.replace("-", " ")} projects.`}
              </p>
              <Link to="/client/post-project">
                <Button className="bg-teal hover:bg-teal-light text-white">
                  <PlusCircle size={18} className="mr-2" />
                  Post Your First Project
                </Button>
              </Link>
            </div>
          )}
        </main>
      </div>

      {/* Click outside to close menu */}
      {openMenuId && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setOpenMenuId(null)}
        />
      )}

      {/* REVIEW MODAL */}
      {projectToReview && (
        <ReviewProjectModal
          isOpen={reviewModalOpen}
          onClose={() => {
            setReviewModalOpen(false);
            setProjectToReview(null);
          }}
          projectId={projectToReview._id}
          projectTitle={projectToReview.title}
          freelancerId={projectToReview.freelancer?.id || ""}
          freelancerName={projectToReview.freelancer?.fullName || "Freelancer"}
        />
      )}
    </div>
  );
};

export default ClientProjects;
