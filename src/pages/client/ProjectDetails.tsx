import { useState, useEffect } from "react";
import { Link, useParams, useOutletContext } from "react-router-dom";
import type { ClientLayoutContext } from "@/layouts/ClientLayout";
import {
  CreditCard,
  Star,
  Settings,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Menu,
  ChevronRight,
  Edit2,
  Share2,
  XCircle,
  FileText,
  Clock,
  Calendar,
  MapPin,
  Users,
  MessageSquare,
  Heart,
  CheckCircle,
  Eye,
  ThumbsDown,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { projectService, applicationService } from "@/services";
import type { Project, Application } from "@/services";

const ProjectDetails = () => {
  const { id } = useParams();
  const { setSidebarOpen } = useOutletContext<ClientLayoutContext>();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [applicationFilter, setApplicationFilter] = useState("all");
  const [applicationSort, setApplicationSort] = useState("recent");
  const [project, setProject] = useState<Project | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const [projectData, appsData] = await Promise.allSettled([
          projectService.getById(id),
          applicationService.getByProject(id),
        ]);

        if (projectData.status === "fulfilled") {
          setProject(projectData.value);
        } else {
          setError("Failed to load project details");
        }

        if (appsData.status === "fulfilled") {
          setApplications(appsData.value.applications || []);
        }
      } catch (err) {
        console.error("Error fetching project details:", err);
        setError("Failed to load project details");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleApplicationAction = async (
    applicationId: string,
    status: "accepted" | "rejected" | "shortlisted" | "hired",
  ) => {
    try {
      setActionLoading(`${applicationId}-${status}`);
      await applicationService.updateStatus(applicationId, status);
      // Update local state to reflect the change
      setApplications((prev) =>
        prev.map((app) =>
          app._id === applicationId || app.id === applicationId
            ? { ...app, status }
            : app,
        ),
      );
    } catch (err) {
      console.error(`Failed to update application to ${status}:`, err);
      alert(`Failed to update application. Please try again.`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <p className="text-slate-600 mb-4">{error || "Project not found"}</p>
        <Link to="/client/projects">
          <Button variant="outline">Back to Projects</Button>
        </Link>
      </div>
    );
  }

  // Filter applications
  const filteredApplications = applications.filter((app) => {
    if (applicationFilter === "all") return true;
    if (applicationFilter === "shortlisted") return app.status === "accepted";
    if (applicationFilter === "new") return app.status === "pending";
    return true;
  });

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "open":
        return "bg-teal/10 text-teal border-teal/20";
      case "in-progress":
        return "bg-royal-blue/10 text-royal-blue border-royal-blue/20";
      case "completed":
        return "bg-green-100 text-green-600 border-green-200";
      default:
        return "bg-slate-100 text-slate-500 border-slate-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open":
        return "Open for Applications";
      case "in-progress":
        return "In Progress";
      case "completed":
        return "Completed";
      default:
        return status;
    }
  };

  const formatDeadline = (deadline: string) => {
    try {
      return new Date(deadline).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return deadline;
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-50 font-sans">
      {/* Header Bar */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            {/* Breadcrumb */}
            <nav className="hidden sm:flex items-center gap-2 text-sm">
              <Link
                to="/client/dashboard"
                className="text-slate-500 hover:text-teal"
              >
                Dashboard
              </Link>
              <ChevronRight size={14} className="text-slate-400" />
              <Link
                to="/client/projects"
                className="text-slate-500 hover:text-teal"
              >
                My Projects
              </Link>
              <ChevronRight size={14} className="text-slate-400" />
              <span className="text-navy font-medium">{project.title}</span>
            </nav>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1 pr-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-royal-blue to-teal flex items-center justify-center text-white font-bold text-sm">
                  RK
                </div>
                <ChevronDown
                  size={16}
                  className="text-slate-500 hidden sm:block"
                />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="font-semibold text-navy">Rajesh Kumar</p>
                    <p className="text-sm text-slate-500">rajesh@company.com</p>
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
                  <button className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full">
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
        {/* PROJECT HEADER CARD */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-semibold border",
                    getStatusStyles(project.status),
                  )}
                >
                  {getStatusLabel(project.status)}
                </span>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium">
                  {project.category}
                </span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-navy">
                {project.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  Posted{" "}
                  {new Date(project.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
                <div className="flex items-center gap-1">
                  <Users size={14} />
                  {project.applications || 0} applications
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant="outline"
                className="border-slate-200 text-slate-600"
              >
                <Share2 size={16} className="mr-2" />
                Share
              </Button>
              <Link to={`/client/project/${id}/edit`}>
                <Button
                  variant="outline"
                  className="border-slate-200 text-slate-600"
                >
                  <Edit2 size={16} className="mr-2" />
                  Edit Project
                </Button>
              </Link>
              {project.status === "open" && (
                <Button
                  variant="outline"
                  className="border-red-200 text-red-500 hover:bg-red-50"
                >
                  <XCircle size={16} className="mr-2" />
                  Close Project
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* PROJECT DETAILS GRID */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN - Project Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8">
              <h2 className="text-xl font-bold text-navy mb-6 flex items-center gap-2">
                <FileText size={24} className="text-teal" />
                About the Project
              </h2>

              <div className="space-y-6 text-slate-600 leading-relaxed">
                <p className="text-lg whitespace-pre-line">
                  {project.description}
                </p>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8">
              <h2 className="text-xl font-bold text-navy mb-6 flex items-center gap-2">
                <Award size={24} className="text-teal" />
                Skills Required
              </h2>
              <div className="flex flex-wrap gap-2">
                {(project.skills || []).map((skill) => (
                  <span
                    key={skill}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium border border-slate-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Info Card (Sticky) */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-bold text-navy mb-6 border-b border-slate-100 pb-4">
                Project Details
              </h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-slate-500">
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                      <CreditCard size={18} />
                    </div>
                    <span className="text-sm font-medium">Budget</span>
                  </div>
                  <span className="font-bold text-navy text-right">
                    ₹{(project.budget?.minAmount || 0).toLocaleString()} - ₹
                    {(project.budget?.maxAmount || 0).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-slate-500">
                    <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                      <MapPin size={18} />
                    </div>
                    <span className="text-sm font-medium">Location</span>
                  </div>
                  <span className="font-semibold text-navy">
                    {project.location?.type || "Remote"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-slate-500">
                    <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                      <Calendar size={18} />
                    </div>
                    <span className="text-sm font-medium">Deadline</span>
                  </div>
                  <span className="font-semibold text-navy">
                    {formatDeadline(project.deadline)}
                  </span>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="p-4 bg-teal/5 rounded-xl border border-teal/10 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-teal font-semibold uppercase tracking-wider mb-1">
                        Total Applications
                      </p>
                      <p className="text-2xl font-bold text-navy">
                        {applications.length}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-teal shadow-sm">
                      <Users size={20} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* APPLICATIONS SECTION */}
        {project.status === "open" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-xl font-bold text-navy flex items-center gap-2">
                  <Users size={24} className="text-teal" />
                  Applications
                  <span className="px-2.5 py-0.5 bg-teal/10 text-teal rounded-full text-sm">
                    {applications.length}
                  </span>
                </h2>
                <div className="flex items-center gap-3">
                  {/* Filter */}
                  <div className="flex bg-slate-100 rounded-lg p-1">
                    {["all", "shortlisted", "new"].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setApplicationFilter(filter)}
                        className={cn(
                          "px-3 py-1.5 rounded-md text-sm font-medium transition-all capitalize",
                          applicationFilter === filter
                            ? "bg-white text-navy shadow-sm"
                            : "text-slate-500 hover:text-navy",
                        )}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                  {/* Sort */}
                  <select
                    value={applicationSort}
                    onChange={(e) => setApplicationSort(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-slate-200 text-sm text-navy bg-white"
                  >
                    <option value="recent">Recent</option>
                    <option value="rating">Rating</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Applications List */}
            <div className="divide-y divide-slate-100">
              {filteredApplications.length > 0 ? (
                filteredApplications.map((application, index) => (
                  <div
                    key={application.id || String(index)}
                    className="p-6 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Freelancer Info */}
                      <div className="flex gap-4 flex-1">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-royal-blue to-teal flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          {application.freelancer?.firstName?.[0]}
                          {application.freelancer?.lastName?.[0]}
                          {!application.freelancer?.firstName &&
                            !application.freelancer?.lastName &&
                            (application.freelancer?.fullName
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("") ||
                              "?")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-navy">
                              {application.freelancer?.firstName ||
                              application.freelancer?.lastName
                                ? `${application.freelancer?.firstName || ""} ${application.freelancer?.lastName || ""}`.trim()
                                : application.freelancer?.fullName ||
                                  "Unknown Freelancer"}
                            </h3>
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded-full text-xs font-semibold",
                                application.status === "accepted"
                                  ? "bg-gold/10 text-gold"
                                  : application.status === "pending"
                                    ? "bg-teal/10 text-teal"
                                    : "bg-slate-100 text-slate-500",
                              )}
                            >
                              {application.status === "accepted" ||
                              application.status === "hired"
                                ? "Hired"
                                : application.status === "shortlisted"
                                  ? "Shortlisted"
                                  : application.status === "pending"
                                    ? "New"
                                    : application.status}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 mb-2">
                            {application.freelancer?.title || "Freelancer"}
                          </p>
                          {application.freelancer?.rating && (
                            <div className="flex items-center gap-1 text-sm mb-3">
                              <Star size={14} className="text-gold fill-gold" />
                              <span className="font-medium text-navy">
                                {application.freelancer.rating}
                              </span>
                            </div>
                          )}
                          <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                            {application.coverLetter}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span>
                              Proposed: ₹
                              {application.proposedRate?.toLocaleString() ||
                                "N/A"}
                            </span>
                            <span>
                              Duration:{" "}
                              {application.estimatedDuration
                                ? `${application.estimatedDuration} days`
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="lg:text-right lg:min-w-[200px] flex lg:flex-col justify-between lg:justify-start gap-4">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Applied</p>
                          <p className="text-xs text-slate-400">
                            {new Date(application.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </p>
                        </div>
                        <div className="flex lg:flex-col gap-2">
                          {application.freelancer?.id && (
                            <Link
                              to={`/freelancer/${application.freelancer.id}`}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full border-slate-200"
                              >
                                <Eye size={14} className="mr-1" /> View Profile
                              </Button>
                            </Link>
                          )}
                          <Link to="/client/messages">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-slate-200"
                            >
                              <MessageSquare size={14} className="mr-1" />{" "}
                              Message
                            </Button>
                          </Link>
                          <div className="flex gap-2">
                            {application.status === "pending" && (
                              <Button
                                size="sm"
                                disabled={
                                  actionLoading ===
                                  `${application._id || application.id}-shortlisted`
                                }
                                className="flex-1 bg-gold hover:bg-gold/90 text-white"
                                onClick={() =>
                                  handleApplicationAction(
                                    application._id || application.id,
                                    "shortlisted",
                                  )
                                }
                              >
                                <Heart size={14} className="mr-1" /> Shortlist
                              </Button>
                            )}
                            {application.status !== "hired" &&
                              application.status !== "accepted" &&
                              application.status !== "rejected" && (
                                <Button
                                  size="sm"
                                  disabled={
                                    actionLoading ===
                                    `${application._id || application.id}-accepted`
                                  }
                                  className="flex-1 bg-teal hover:bg-teal-light text-white"
                                  onClick={() =>
                                    handleApplicationAction(
                                      application._id || application.id,
                                      "accepted",
                                    )
                                  }
                                >
                                  <CheckCircle size={14} className="mr-1" />{" "}
                                  Hire
                                </Button>
                              )}
                          </div>
                          {application.status !== "rejected" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={
                                actionLoading ===
                                `${application._id || application.id}-rejected`
                              }
                              className="text-red-500 hover:bg-red-50"
                              onClick={() =>
                                handleApplicationAction(
                                  application._id || application.id,
                                  "rejected",
                                )
                              }
                            >
                              <ThumbsDown size={14} className="mr-1" /> Reject
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <Users size={28} className="text-slate-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-navy mb-1">
                    No applications yet
                  </h3>
                  <p className="text-sm text-slate-500">
                    Applications will appear here when freelancers apply to your
                    project.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProjectDetails;
