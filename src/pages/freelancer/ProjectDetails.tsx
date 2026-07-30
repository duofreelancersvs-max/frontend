import { useState, useEffect, useCallback, useRef } from "react";
import {
  Link,
  useParams,
  useOutletContext,
  useNavigate,
} from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import type { FreelancerLayoutContext } from "@/layouts/FreelancerLayout";
import {
  FileText,
  Clock,
  Calendar,
  MapPin,
  Users,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { projectService } from "@/services";
import type { Project } from "@/services";
import DashboardHeader from "@/components/layouts/DashboardHeader";
import { ReportModal } from "@/components/common/ReportModal";
import ProfileCompletionModal from "@/components/modals/ProfileCompletionModal";
import { TermsModal } from "@/components/modals/TermsModal";
import ProjectApplicationModal from "@/components/modals/ProjectApplicationModal";
import { useMyFreelancerProfile, useMyApplications } from "@/hooks/queries/useFreelancerDashboardQueries";
import { toast } from "react-toastify";

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

const ProjectDetails = () => {
  const { id } = useParams();
  const { setSidebarOpen } = useOutletContext<FreelancerLayoutContext>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileModalMessage, setProfileModalMessage] = useState("");
  const [showTermsForApply, setShowTermsForApply] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedProjectForApply, setSelectedProjectForApply] = useState<Project | null>(null);
  const pendingApplyRef = useRef<Project | null>(null);

  const { data: profileData } = useMyFreelancerProfile();
  const profile = profileData || null;

  const { data: myAppsData } = useMyApplications();
  const myApplications = myAppsData?.applications || [];

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const res = await projectService.getById(id);
        setProject(res);
      } catch (err) {
        console.error("Error fetching project details:", err);
        setError("Failed to load project details");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleApplyClick = useCallback(() => {
    if (!project) return;
    const incomplete =
      !profile?.categories?.length ||
      !profile?.skills?.length ||
      !profile?.headline?.trim();
    if (incomplete) {
      pendingApplyRef.current = project;
      setProfileModalMessage("You need to complete your profile before you can apply to this project.");
      setShowProfileModal(true);
      return;
    }
    if (!profile?.contactInfo) {
      pendingApplyRef.current = project;
      setProfileModalMessage("Please add a contact email or phone number to your profile before applying.");
      setShowProfileModal(true);
      return;
    }
    pendingApplyRef.current = project;
    setShowTermsForApply(true);
  }, [project, profile]);

  // Proceed with application once profile query updates and is complete
  useEffect(() => {
    if (pendingApplyRef.current && profile) {
      const isComplete =
        profile.categories?.length &&
        profile.skills?.length &&
        profile.headline?.trim() &&
        profile.contactInfo;

      if (isComplete) {
        pendingApplyRef.current = null;
        setShowTermsForApply(true);
      }
    }
  }, [profile]);

  const handleTermsAccepted = () => {
    setShowTermsForApply(false);
    setSelectedProjectForApply(pendingApplyRef.current);
    pendingApplyRef.current = null;
    setShowApplicationModal(true);
  };

  const handleApplicationSuccess = (convId?: string) => {
    setShowApplicationModal(false);
    setSelectedProjectForApply(null);
    toast.success("Application submitted successfully!");

    // Optimistically update the cache so the UI updates instantly
    queryClient.setQueryData(["myApplications"], (old: any) => {
      const newApp = {
        id: "temp-" + Date.now(),
        projectId: project?._id || project?.id || "",
        project: { _id: project?._id || project?.id || "" },
        status: "pending",
        createdAt: new Date().toISOString()
      };
      if (!old) return { applications: [newApp] };
      return {
        ...old,
        applications: [newApp, ...old.applications]
      };
    });

    queryClient.invalidateQueries({ queryKey: ["myApplications"] });
    if (project) {
      setProject({ ...project, applications: (project.applications || 0) + 1 });
    }
    if (convId) {
      navigate("/freelancer/messages", {
        state: { conversationId: convId },
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-50 dark:bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-50 dark:bg-background flex flex-col items-center justify-center">
        <p className="text-slate-600 dark:text-slate-400 mb-4">{error || "Project not found"}</p>
        <Link to="/freelancer/projects">
          <Button variant="outline" className="dark:border-white/10 dark:text-white dark:hover:bg-white/5">Back to Projects</Button>
        </Link>
      </div>
    );
  }

   return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-50 dark:bg-background font-sans">
      <DashboardHeader
        title="Project Details"
        onMenuClick={() => setSidebarOpen(true)}
      />

      <main className="dashboard-content">
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
                {(project.categories || []).map((cat) => (
                  <span key={cat} className="px-3 py-1 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 rounded-lg text-sm font-medium">
                    {cat}
                  </span>
                ))}
              </div>
               <h1 className="text-2xl lg:text-3xl font-bold text-navy dark:text-white break-words sm:break-normal" style={{ overflowWrap: 'anywhere' }}>
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
              {project.status === "open" && (() => {
                const projectId = project._id || project.id || "";
                const existingApp = myApplications.find(
                  (app) => {
                    const appId = app.project?.id || app.project?._id || app.projectId || app.project;
                    return appId === projectId;
                  }
                );
                if (existingApp && existingApp.status !== "withdrawn" && existingApp.status !== "rejected") {
                  const statusLabel: Record<string, string> = {
                    pending: "Applied",
                    viewed: "Viewed",
                    shortlisted: "Shortlisted",
                    hired: "Hired",
                    accepted: "Accepted",
                  };
                  return (
                    <span className="px-4 py-2 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 rounded-xl text-sm font-semibold border border-slate-200 dark:border-white/10">
                      {statusLabel[existingApp.status] || existingApp.status}
                    </span>
                  );
                }
                return (
                  <Button
                    onClick={handleApplyClick}
                    className="bg-teal hover:bg-[#128a7f] text-white font-bold rounded-xl px-6"
                  >
                    Apply Now
                  </Button>
                );
              })()}
              <Button
                variant="outline"
                className="text-red-500 border-red-200 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20"
                onClick={() => setIsReportModalOpen(true)}
              >
                Report Client
              </Button>
              <Link to="/freelancer/projects">
                <Button variant="outline" className="border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 dark:hover:bg-white/5">
                  Back
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-6 lg:p-8">
              <h2 className="text-xl font-bold text-navy dark:text-white mb-6 flex items-center gap-2">
                <FileText size={24} className="text-teal" />
                About the Project
              </h2>

              <div className="space-y-6 text-slate-600 dark:text-slate-400 leading-relaxed overflow-hidden">
                <p className="text-lg whitespace-pre-line break-words">
                  {project.description}
                </p>
              </div>
            </div>

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
                        {project.applications || 0}
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
      </main>

      {project && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          reportedUserId={project.clientId || (project as any).client?._id}
          reportedUserName={project.client?.fullName || 'Client'}
        />
      )}

      <ProfileCompletionModal
        isOpen={showProfileModal}
        message={profileModalMessage}
        onClose={() => {
          setShowProfileModal(false);
          setProfileModalMessage("");
          pendingApplyRef.current = null;
        }}
        onComplete={() => {
          setShowProfileModal(false);
          setProfileModalMessage("");
        }}
      />

      <TermsModal
        isOpen={showTermsForApply}
        onClose={() => {
          setShowTermsForApply(false);
          pendingApplyRef.current = null;
        }}
        onAgree={handleTermsAccepted}
      />

      {selectedProjectForApply && (
        <ProjectApplicationModal
          isOpen={showApplicationModal}
          onClose={() => {
            setShowApplicationModal(false);
            setSelectedProjectForApply(null);
          }}
          onSuccess={handleApplicationSuccess}
          project={{
            id: selectedProjectForApply._id || selectedProjectForApply.id || "",
            title: selectedProjectForApply.title,
            client: {
              name: selectedProjectForApply.client?.fullName ?? "Client",
              rating: 0,
              reviews: 0,
              verified: false,
            },
          }}
        />
      )}
    </div>
  );
};

export default ProjectDetails;
