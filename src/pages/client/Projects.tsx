import { useState, useEffect } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import type { ClientLayoutContext } from "@/layouts/ClientLayout";
import { useUnreadStore } from "@/stores/unread.store";
import {
  MessageSquare,
  PlusCircle,
  Search,
  ChevronDown,
  LogOut,
  User,
  Menu,
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
  Bell,
  Settings,
  MapPin,
  Loader2,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { projectService } from "@/services";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import type { Project, ProjectStats } from "@/services";
import ReviewProjectModal from "@/components/modals/ReviewProjectModal";

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
  const totalUnreadCount = useUnreadStore((s) => s.totalUnreadCount);
  const { setSidebarOpen } = useOutletContext<ClientLayoutContext>();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

  const handleDelete = async (projectId: string) => {
    if (!window.confirm("Are you sure you want to delete this project?"))
      return;

    try {
      setDeletingId(projectId);
      await projectService.delete(projectId);
      setProjects(projects.filter((p) => p._id !== projectId));
      setOpenMenuId(null);
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Failed to delete project. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (projectId: string) => {
    setOpenMenuId(null);
    navigate(`/client/project/${projectId}/edit`);
  };

  const handleComplete = async (projectId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to mark this project as completed?",
      )
    ) {
      return;
    }

    try {
      setCompletingId(projectId);
      await projectService.complete(projectId);

      // Update local state instantly
      setProjects((prev) =>
        prev.map((p) =>
          p._id === projectId ? { ...p, status: "completed" } : p,
        ),
      );

      if (stats) {
        setStats({
          ...stats,
          inProgress: Math.max(0, (stats.inProgress || 0) - 1),
          completed: (stats.completed || 0) + 1,
        });
      }
    } catch (error) {
      console.error("Error completing project:", error);
      alert("Failed to mark project as completed. Please try again.");
    } finally {
      setCompletingId(null);
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
        project.category.toLowerCase().includes(searchQuery.toLowerCase()),
    );

  // Sort projects
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === "budget-high")
      return (b.budget?.maxAmount || 0) - (a.budget?.maxAmount || 0);
    if (sortBy === "budget-low")
      return (a.budget?.minAmount || 0) - (b.budget?.minAmount || 0);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Pagination
  const totalPages = Math.ceil(sortedProjects.length / itemsPerPage);
  const paginatedProjects = sortedProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Format project for display

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
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
        return "bg-green-100 text-green-600";
      case "draft":
        return "bg-slate-100 text-slate-500";
      case "cancelled":
        return "bg-red-100 text-red-500";
      default:
        return "bg-slate-100 text-slate-500";
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
    <div className="flex-1 h-full overflow-y-auto bg-slate-50 font-sans">
      {/* MAIN CONTENT */}
      <div>
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <Menu size={24} />
              </button>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-navy">
                  My Projects
                </h1>
                <p className="text-sm text-slate-500 hidden sm:block">
                  Manage and track all your projects
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-4">
              <Link to="/client/post-project">
                <Button className="bg-teal hover:bg-teal-light text-white hidden sm:flex">
                  <PlusCircle size={18} className="mr-2" />
                  Post New Project
                </Button>
                <Button className="bg-teal hover:bg-teal-light text-white sm:hidden p-2">
                  <PlusCircle size={20} />
                </Button>
              </Link>

              <Link
                to="/client/messages"
                className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg flex"
              >
                <MessageSquare size={20} />
                {totalUnreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-teal rounded-full border-2 border-white" />
                )}
              </Link>

              <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg flex">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1 pr-2 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-royal-blue to-teal flex items-center justify-center text-white font-bold text-sm">
                    {user?.fullName
                      ? user.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                      : (user?.email?.[0] || "U").toUpperCase()}
                  </div>
                  <ChevronDown
                    size={16}
                    className="text-slate-500 hidden sm:block"
                  />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="font-semibold text-navy">
                        {user?.fullName || user?.email?.split("@")[0] || "User"}
                      </p>
                      <p className="text-sm text-slate-500">
                        {user?.email}
                      </p>
                    </div>
                    <Link
                      to="/client/profile"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      <User size={16} />
                      My Profile
                    </Link>
                    <Link
                      to="/client/settings"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      <Settings size={16} />
                      Settings
                    </Link>
                    <hr className="my-2 border-slate-100" />
                    <button
                      onClick={logout}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-4 lg:p-8 space-y-6">
          {/* TABS */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-all",
                    activeTab === tab.id
                      ? "border-teal text-teal"
                      : "border-transparent text-slate-500 hover:text-navy hover:border-slate-200",
                  )}
                >
                  {tab.label}
                  {tab.count !== null && (
                    <span
                      className={cn(
                        "px-2 py-0.5 text-xs font-bold rounded-full",
                        activeTab === tab.id
                          ? "bg-teal/10 text-teal"
                          : "bg-slate-100 text-slate-500",
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
                  className="pl-10 h-10 border-slate-200 focus:border-teal focus:ring-teal"
                />
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-10 px-3 rounded-lg border border-slate-200 text-sm text-navy bg-white focus:border-teal focus:ring-1 focus:ring-teal"
              >
                <option value="recent">Recent</option>
                <option value="budget-high">Budget (High-Low)</option>
                <option value="budget-low">Budget (Low-High)</option>
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded-md transition-all",
                  viewMode === "grid"
                    ? "bg-white text-navy shadow-sm"
                    : "text-slate-500 hover:text-navy",
                )}
              >
                <Grid3X3 size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 rounded-md transition-all",
                  viewMode === "list"
                    ? "bg-white text-navy shadow-sm"
                    : "text-slate-500 hover:text-navy",
                )}
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
                      className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col h-full"
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
                                className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => handleEdit(project._id)}
                                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                                >
                                  <Edit2 size={14} /> Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(project._id)}
                                  disabled={deletingId === project._id}
                                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 disabled:opacity-50"
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

                        <h3 className="font-semibold text-navy mb-1 line-clamp-1 text-lg">
                          {project.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-500 rounded-md text-xs font-medium w-fit">
                            {project.category}
                          </span>
                          {project.location &&
                            (project.location.city ||
                              project.location.country) && (
                              <span className="inline-flex items-center px-2.5 py-0.5 bg-teal/5 text-teal border border-teal/10 rounded-md text-xs font-medium w-fit">
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
                        <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">
                          {project.description}
                        </p>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {(project.skills || []).slice(0, 3).map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 bg-white border border-slate-200 text-slate-600 rounded-md text-xs font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                          {(project.skills || []).length > 3 && (
                            <span className="px-2 py-0.5 bg-slate-50 text-slate-400 rounded-md text-xs border border-transparent">
                              +{(project.skills || []).length - 3}
                            </span>
                          )}
                        </div>

                        {/* Freelancer Section - consistently sized placeholder if empty */}
                        <div className="mt-auto pt-3 border-t border-slate-50/50">
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
                                <span className="text-xs text-slate-400 font-medium">
                                  Assigned to
                                </span>
                                <span className="text-sm font-semibold text-navy leading-none">
                                  {project.freelancer.fullName}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2.5 opacity-50 grayscale">
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                <User size={14} />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs text-slate-400 font-medium">
                                  Status
                                </span>
                                <span className="text-sm font-medium text-slate-600 leading-none">
                                  Not Assigned
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100">
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="flex flex-col items-center text-center">
                            <span className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                              Budget
                            </span>
                            <span className="text-sm font-semibold text-navy">
                              ₹
                              {(
                                project.budget?.maxAmount || 0
                              ).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex flex-col items-center text-center border-x border-slate-200/60">
                            <span className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                              Applicants
                            </span>
                            <span className="text-sm font-semibold text-navy">
                              {project.applications}
                            </span>
                          </div>
                          <div className="flex flex-col items-center text-center">
                            <span className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                              Deadline
                            </span>
                            <span className="text-sm font-semibold text-navy">
                              {formatDeadline(project.deadline)}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Link
                            to={`/client/project/${project._id}`}
                            className="flex-1"
                          >
                            <Button
                              variant="outline"
                              className="w-full h-9 text-xs border-slate-200 text-slate-600 hover:text-navy hover:bg-white bg-white hover:border-slate-300 shadow-sm"
                            >
                              <Eye size={14} className="mr-1.5" /> View Details
                            </Button>
                          </Link>

                          {project.status === "open" ? (
                            <Link
                              to={`/client/project/${project._id}/applications`}
                              className="flex-1"
                            >
                              <Button className="w-full h-9 text-xs bg-teal hover:bg-teal-light text-white shadow-sm shadow-teal/20">
                                <Users size={14} className="mr-1.5" />{" "}
                                Applications
                              </Button>
                            </Link>
                          ) : project.status === "in-progress" ? (
                            <Button
                              className="flex-1 h-9 text-xs bg-royal-blue hover:bg-royal-blue/90 text-white shadow-sm shadow-royal-blue/20"
                              onClick={() => handleComplete(project._id)}
                              disabled={completingId === project._id}
                            >
                              {completingId === project._id ? (
                                <Loader2
                                  size={14}
                                  className="mr-1.5 animate-spin"
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

              {/* LIST VIEW */}
              {viewMode === "list" && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                      <thead>
                        <tr className="bg-slate-50 text-left">
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                            Project
                          </th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                            Status
                          </th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                            Budget
                          </th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                            Applications
                          </th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                            Deadline
                          </th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {paginatedProjects.map((project) => (
                          <tr
                            key={project._id}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-medium text-navy">
                                  {project.title}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-xs text-slate-500">
                                    {project.category}
                                  </p>
                                  {project.location &&
                                    (project.location.city ||
                                      project.location.country) && (
                                      <span className="flex items-center text-xs text-teal bg-teal/5 border border-teal/10 px-1.5 py-0.5 rounded">
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
                              <p className="text-sm font-medium text-navy">
                                {project.budget?.minAmount !== undefined &&
                                project.budget?.maxAmount !== undefined
                                  ? `₹${project.budget.minAmount.toLocaleString()} - ₹${project.budget.maxAmount.toLocaleString()}`
                                  : "Budget not set"}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1 text-sm text-slate-600">
                                <Users size={14} className="text-slate-400" />
                                {project.applications}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1 text-sm text-slate-600">
                                <Calendar
                                  size={14}
                                  className="text-slate-400"
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
                                  className="h-8 px-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                                  onClick={() => handleDelete(project._id)}
                                  disabled={deletingId === project._id}
                                >
                                  <Trash2 size={16} />
                                </Button>
                                {project.status === "in-progress" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2 text-royal-blue hover:text-royal-blue/90 hover:bg-royal-blue/10"
                                    onClick={() => handleComplete(project._id)}
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
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6">
                <Briefcase size={40} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-navy mb-2">
                No projects yet
              </h3>
              <p className="text-slate-500 mb-6 max-w-sm mx-auto">
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
