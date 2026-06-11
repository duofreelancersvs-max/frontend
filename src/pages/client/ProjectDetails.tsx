import { useState, useEffect } from "react";
import {
  Link,
  useParams,
  useOutletContext,
  useNavigate,
  useLocation,
} from "react-router-dom";
import type { ClientLayoutContext } from "@/layouts/ClientLayout";
import {

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
  ThumbsDown,
  Award,
  Loader2,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { projectService, applicationService } from "@/services";
import type { Project, Application } from "@/services";
import ReviewProjectModal from "@/components/modals/ReviewProjectModal";
import DashboardHeader from "@/components/layouts/DashboardHeader";

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setSidebarOpen } = useOutletContext<ClientLayoutContext>();
  const location = useLocation();
  
  const [activeTab, setActiveTab] = useState(
    location.pathname.endsWith("applications") ? "applications" : "details"
  );
  
  const [applicationFilter, setApplicationFilter] = useState("all");
  const [applicationSort, setApplicationSort] = useState("recent");
  const [project, setProject] = useState<Project | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

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
    freelancerId?: string,
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

      // If hired, update the project status locally to reflect the change immediately
      if (status === "accepted" && project) {
        setProject({
          ...project,
          status: "in-progress",
          freelancerId: freelancerId, // Now we have the freelancerId
        });
      }

      // Redirect to messages after hiring
      if (status === "accepted") {
        navigate("/client/messages");
      }
    } catch (err) {
      console.error(`Failed to update application to ${status}:`, err);
      alert(`Failed to update application. Please try again.`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async () => {
    if (!project || !id) return;
    if (!window.confirm("Are you sure you want to mark this project as completed?")) return;
    try {
      setCompleting(true);
      await projectService.complete(id);
      setProject({ ...project, status: "completed" });
    } catch (err) {
      console.error("Error completing project:", err);
      alert("Failed to mark project as completed.");
    } finally {
      setCompleting(false);
    }
  };

  const handleCancel = async () => {
    if (!project || !id) return;
    if (!window.confirm("Are you sure you want to close this project?")) return;
    try {
      setCanceling(true);
      await projectService.cancel(id);
      setProject({ ...project, status: "cancelled" });
    } catch (err) {
      console.error("Error closing project:", err);
      alert("Failed to close project.");
    } finally {
      setCanceling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-background flex flex-col items-center justify-center">
        <p className="text-slate-600 dark:text-slate-400 mb-4">{error || "Project not found"}</p>
        <Link to="/client/projects">
          <Button variant="outline" className="dark:border-white/10 dark:text-white dark:hover:bg-white/5">Back to Projects</Button>
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
        return "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900/30";
      default:
        return "bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10";
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
      case "cancelled":
        return "Cancelled/Closed";
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
    <div className="flex-1 h-full overflow-y-auto bg-slate-50 dark:bg-background font-sans">
      <DashboardHeader
        title="Project Details"
        onMenuClick={() => setSidebarOpen(true)}
      />

      {/* Main Content Area */}
      <main className="px-6 lg:px-8 py-6 lg:py-8 space-y-6">
         {/* PROJECT HEADER CARD */}
        <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-6 lg:p-8">
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
                <span className="px-3 py-1 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 rounded-lg text-sm font-medium">
                  {project.category}
                </span>
              </div>
               <h1 className="text-2xl lg:text-3xl font-bold text-navy dark:text-white">
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
                  {applications.length} applications
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
               <Button
                variant="outline"
                className="border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 dark:hover:bg-white/5"
              >
                <Share2 size={16} className="mr-2" />
                Share
              </Button>
              {project.status === "open" && (
                 <Link to={`/client/project/${id}/edit`}>
                  <Button
                    variant="outline"
                    className="border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 dark:hover:bg-white/5"
                  >
                    <Edit2 size={16} className="mr-2" />
                    Edit Project
                  </Button>
                </Link>
              )}
              {project.status === "open" && (
                <Button
                  variant="outline"
                  className="border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={handleCancel}
                  disabled={canceling}
                >
                  {canceling ? <Loader2 size={16} className="mr-2 animate-spin" /> : <XCircle size={16} className="mr-2" />}
                  Close Project
                </Button>
              )}
              {project.status === "in-progress" && (
                <Button
                  className="bg-royal-blue hover:bg-royal-blue/90 text-white shadow-sm"
                  onClick={handleComplete}
                  disabled={completing}
                >
                  {completing ? <Loader2 size={16} className="mr-2 animate-spin" /> : <CheckCircle size={16} className="mr-2" />}
                  Mark as Completed
                </Button>
              )}
              {project.status === "completed" && project.freelancer && (
                <Button
                  className="bg-gold hover:bg-gold/90 text-navy shadow-sm"
                  onClick={() => setReviewModalOpen(true)}
                >
                  <Star size={16} className="mr-2 fill-navy" />
                  Leave Review
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex border-b border-slate-200 dark:border-white/10 mt-6">
          <button
            onClick={() => setActiveTab("details")}
            className={cn(
              "px-6 py-3 font-medium text-sm border-b-2 transition-colors",
              activeTab === "details"
                ? "border-teal text-teal"
                : "border-transparent text-slate-500 hover:text-navy dark:text-slate-400 dark:hover:text-white"
            )}
          >
            Project Details
          </button>
          {project.status === "open" && (
            <button
              onClick={() => setActiveTab("applications")}
              className={cn(
                "flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors",
                activeTab === "applications"
                  ? "border-teal text-teal"
                  : "border-transparent text-slate-500 hover:text-navy dark:text-slate-400 dark:hover:text-white"
              )}
            >
              Applications
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs",
                  activeTab === "applications"
                    ? "bg-teal/10 text-teal"
                    : "bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400"
                )}
              >
                {applications.length}
              </span>
            </button>
          )}
        </div>

        {/* PROJECT DETAILS GRID */}
        {activeTab === "details" && (
        <div className="grid lg:grid-cols-3 gap-6 mt-6">
          {/* LEFT COLUMN - Project Details */}
          <div className="lg:col-span-2 space-y-6">
             {/* Description */}
            <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-6 lg:p-8">
              <h2 className="text-xl font-bold text-navy dark:text-white mb-6 flex items-center gap-2">
                <FileText size={24} className="text-teal" />
                About the Project
              </h2>

              <div className="space-y-6 text-slate-600 dark:text-slate-400 leading-relaxed">
                <p className="text-lg whitespace-pre-line">
                  {project.description}
                </p>
              </div>
            </div>

             {/* Skills */}
            <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-6 lg:p-8">
              <h2 className="text-xl font-bold text-navy dark:text-white mb-6 flex items-center gap-2">
                <Award size={24} className="text-teal" />
                Skills Required
              </h2>
              <div className="flex flex-wrap gap-2">
                {(project.requiredSkills || []).map((skill: string) => (
                  <span
                    key={skill}
                    className="px-4 py-2 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-400 rounded-xl text-sm font-medium border border-slate-200 dark:border-white/10"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Info Card (Sticky) */}
           <div className="space-y-6">
            <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-bold text-navy dark:text-white mb-6 border-b border-slate-100 dark:border-white/10 pb-4">
                Project Details
              </h2>
              <div className="space-y-6">

                <div className="flex items-center justify-between w-full min-w-0">
                  <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                    <div className="p-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-lg">
                      <MapPin size={18} />
                    </div>
                    <span className="text-sm font-medium">Location</span>
                  </div>
                  <span className="font-semibold text-navy dark:text-white">
                    {project.location?.type || "Remote"}
                  </span>
                </div>

                <div className="flex items-center justify-between w-full min-w-0">
                  <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                    <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg">
                      <Calendar size={18} />
                    </div>
                    <span className="text-sm font-medium">Deadline</span>
                  </div>
                  <span className="font-semibold text-navy dark:text-white">
                    {formatDeadline(project.deadline)}
                  </span>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-white/10">
                  <div className="p-4 bg-teal/5 dark:bg-teal/10 rounded-xl border border-teal/10 dark:border-teal/20 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-teal font-semibold uppercase tracking-wider mb-1">
                        Total Applications
                      </p>
                      <p className="text-2xl font-bold text-navy dark:text-white">
                        {applications.length}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-white dark:bg-[#121A2A] rounded-full flex items-center justify-center text-teal shadow-sm">
                      <Users size={20} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* APPLICATIONS SECTION */}
        {activeTab === "applications" && project.status === "open" && (
          <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm overflow-hidden mt-6">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                 <h2 className="text-xl font-bold text-navy dark:text-white flex items-center gap-2">
                  <Users size={24} className="text-teal" />
                  Applications
                  <span className="px-2.5 py-0.5 bg-teal/10 dark:bg-teal/20 text-teal rounded-full text-sm">
                    {applications.length}
                  </span>
                </h2>
                <div className="flex items-center gap-3">
                   {/* Filter */}
                  <div className="flex bg-slate-100 dark:bg-white/10 rounded-lg p-1">
                    {["all", "shortlisted", "new"].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setApplicationFilter(filter)}
                        className={cn(
                          "px-3 py-1.5 rounded-md text-sm font-medium transition-all capitalize",
                          applicationFilter === filter
                            ? "bg-white dark:bg-[#121A2A] text-navy dark:text-white shadow-sm"
                            : "text-slate-500 dark:text-slate-400 hover:text-navy dark:hover:text-white",
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
                    className="h-9 px-3 rounded-lg border border-slate-200 dark:border-white/10 text-sm text-navy dark:text-white bg-white dark:bg-white/5"
                  >
                    <option value="recent" className="dark:bg-[#121A2A]">Recent</option>
                    <option value="rating" className="dark:bg-[#121A2A]">Rating</option>
                  </select>
                </div>
              </div>
            </div>

             {/* Applications List */}
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredApplications.length > 0 ? (
                filteredApplications.map((application, index) => (
                   <div
                    key={application.id || String(index)}
                    className="p-6 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Avatar */}
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-royal-blue to-teal flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-sm">
                        {application.freelancer?.avatar ? (
                          <img
                            src={application.freelancer.avatar}
                            alt="Avatar"
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          application.freelancer?.fullName?.charAt(0) || "?"
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                             <h3 className="text-base font-bold text-navy dark:text-white">
                                {application.freelancer?.fullName ||
                                  "Unknown Freelancer"}
                              </h3>
                              {(application.status === "accepted" ||
                                application.status === "hired" ||
                                application.status === "shortlisted") && (
                                <span className="px-2 py-0.5 rounded-full text-xxs font-semibold bg-orange-50 dark:bg-orange-900/20 text-orange-500 dark:text-orange-400 border border-orange-100 dark:border-orange-900/30">
                                   {application.status === "shortlisted"
                                    ? "Shortlisted"
                                    : "Hired"}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                              {application.freelancer?.title || "Freelancer"}
                            </p>
                          </div>

                          {/* Right Side Info & Actions Header */}
                           <div className="flex flex-col sm:items-end text-sm text-slate-500 dark:text-slate-400">
                            <span className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">
                              Applied
                            </span>
                            <span className="font-medium text-navy dark:text-white">
                              {new Date(
                                application.createdAt,
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Cover Letter */}
                         <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                          {application.coverLetter}
                        </p>

                        {/* Footer Info & Actions */}
                         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                            <span>
                              Proposed:{" "}
                              <strong className="text-slate-700 dark:text-slate-200 font-semibold">
                                ₹
                                {application.proposedRate?.toLocaleString() ||
                                  "N/A"}
                              </strong>
                            </span>
                            <span>
                              Target Date:{" "}
                              <strong className="text-slate-700 dark:text-slate-200 font-semibold">
                                {application.estimatedCompletionDate
                                  ? new Date(application.estimatedCompletionDate).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })
                                  : "N/A"}
                              </strong>
                            </span>
                          </div>

                          <div className="flex items-center gap-4">
                            {application.status !== "rejected" && (
                              <button
                                disabled={
                                  actionLoading ===
                                  `${application._id || application.id}-rejected`
                                }
                                onClick={() =>
                                  handleApplicationAction(
                                    application._id || application.id,
                                    "rejected",
                                    application.freelancerId
                                  )
                                }
                                className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
                              >
                                <ThumbsDown size={14} /> Handle Reject
                              </button>
                            )}

                             <Link to="/client/messages">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-9 px-4 border-slate-200 dark:border-white/10 text-navy dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 shadow-sm font-medium bg-white dark:bg-white/5"
                              >
                                <MessageSquare
                                  size={16}
                                  className="mr-2 text-slate-400 dark:text-slate-500"
                                />
                                Message
                              </Button>
                            </Link>

                            {/* Additional Actions (Hire/Shortlist) if pending/viewed and project is open */}
                            {project.status === "open" &&
                              (application.status === "pending" ||
                                application.status === "viewed") && (
                                <Button
                                  size="sm"
                                  disabled={
                                    actionLoading ===
                                    `${application._id || application.id}-shortlisted`
                                  }
                                  className="h-9 bg-gold hover:bg-gold/90 text-white shadow-sm"
                                  onClick={() =>
                                    handleApplicationAction(
                                      application._id || application.id,
                                      "shortlisted",
                                      application.freelancerId
                                    )
                                  }
                                >
                                  <Heart size={14} className="mr-1.5" /> Shortlist
                                </Button>
                              )}
                            {project.status === "open" &&
                              (application.status === "pending" ||
                                application.status === "viewed" ||
                                application.status === "shortlisted") && (
                                <Button
                                  size="sm"
                                  disabled={
                                    actionLoading ===
                                    `${application._id || application.id}-accepted`
                                  }
                                  className="h-9 bg-teal hover:bg-teal-light text-white shadow-sm"
                                  onClick={() =>
                                    handleApplicationAction(
                                      application._id || application.id,
                                      "accepted",
                                      application.freelancerId
                                    )
                                  }
                                >
                                  <CheckCircle size={14} className="mr-1.5" />{" "}
                                  Hire
                                </Button>
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                 <div className="p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <Users size={28} className="text-slate-300 dark:text-slate-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-navy dark:text-white mb-1">
                    No applications yet
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Applications will appear here when freelancers apply to your
                    project.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* REVIEW MODAL */}
      {project.freelancer && project.status === "completed" && (
        <ReviewProjectModal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          projectId={project._id || project.id || ""}
          projectTitle={project.title}
          freelancerId={project.freelancer.id || project.freelancerId || ""}
          freelancerName={project.freelancer.fullName || "Freelancer"}
        />
      )}
    </div>
  );
};

export default ProjectDetails;
