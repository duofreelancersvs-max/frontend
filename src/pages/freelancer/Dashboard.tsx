import { useState, useCallback, useRef, useEffect } from "react";
import { Link, useOutletContext, useNavigate } from "react-router-dom";
import {
  User,
  Briefcase,
  Search,
  FileText,
  Star,
  ArrowRight,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Eye,
  MessageSquare,
  Award,
  Zap,
  Plus,
  ExternalLink,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/shared/Skeleton";
import DashboardHeader from "@/components/layouts/DashboardHeader";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import type { Application } from "@/services";
import { useProjects } from "@/hooks/queries/useProjects";
import {
  useMyFreelancerProfile,
  useMyApplications,
  useMySubscription,
  useMyConversations,
} from "@/hooks/queries/useFreelancerDashboardQueries";
import type { FreelancerLayoutContext } from "@/layouts/FreelancerLayout";
import { getCategoryStyle } from "@/lib/category-styles";
import { TrialBanner } from "@/components/feature-gate";
import { TermsModal } from "@/components/modals/TermsModal";
import ProjectApplicationModal from "@/components/modals/ProjectApplicationModal";
import ProfileCompletionModal from "@/components/modals/ProfileCompletionModal";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

const getStatusBadgeStyle = (status: string) => {
  switch (status) {
    case "pending":
    case "Pending":
      return "bg-gold/10 text-gold";
    case "accepted":
    case "Shortlisted":
      return "bg-primary/10 text-primary";
    case "rejected":
    case "Rejected":
      return "bg-destructive/10 text-destructive";
    case "withdrawn":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-secondary text-secondary-foreground";
  }
};

const FreelancerDashboard = () => {
  const { setSidebarOpen } = useOutletContext<FreelancerLayoutContext>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const freelancerName = user?.email?.split("@")[0] || "Freelancer";
  const queryClient = useQueryClient();

  const { data: profileData, isLoading: loadingProfile } =
    useMyFreelancerProfile();
  const { data: appsData, isLoading: loadingApps } = useMyApplications();
  const { data: projectsData, isLoading: loadingProjects } = useProjects({
    status: "open",
    limit: 3,
  });
  const { data: subData, isLoading: loadingSub } = useMySubscription();
  const { data: convData, isLoading: loadingConv } = useMyConversations();

  const loading =
    loadingProfile ||
    loadingApps ||
    loadingProjects ||
    loadingSub ||
    loadingConv;

  const profile = profileData || null;
  const applications = appsData?.applications || [];
  const recommendedProjects = projectsData?.projects || [];
  const subscription = subData || null;
  const conversations = convData?.conversations || [];

  const appStatusByProjectId = new Map(
    applications.map((app: any) => [
      app.project?.id || app.project?._id || app.projectId,
      app.status,
    ]),
  );

  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);

  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showTermsForApply, setShowTermsForApply] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileModalMessage, setProfileModalMessage] = useState("");
  const pendingApplyRef = useRef<any>(null);

  const handleApplyClick = useCallback(
    (project: any) => {
      const incomplete =
        !profile?.categories?.length ||
        !profile?.skills?.length ||
        !profile?.headline?.trim();
      if (incomplete) {
        pendingApplyRef.current = project;
        setProfileModalMessage(
          "You need to complete your profile before you can apply to projects.",
        );
        setShowProfileModal(true);
        return;
      }
      if (!profile?.contactInfo) {
        pendingApplyRef.current = project;
        setProfileModalMessage(
          "Please add a contact email or phone number to your profile before applying.",
        );
        setShowProfileModal(true);
        return;
      }
      // Find original project object if needed, or just pass the fullData if available.
      // recommendedProjects holds the full projects
      const fullProject =
        recommendedProjects.find(
          (p: any) => p._id === project.id || p.id === project.id,
        ) || project;
      setSelectedProject(fullProject);
      setShowTermsForApply(true);
    },
    [recommendedProjects, profile],
  );

  // Proceed with application once profile query updates and is complete
  useEffect(() => {
    if (pendingApplyRef.current && profile) {
      const isComplete =
        profile.categories?.length &&
        profile.skills?.length &&
        profile.headline?.trim() &&
        profile.contactInfo;

      if (isComplete) {
        const project = pendingApplyRef.current;
        pendingApplyRef.current = null;
        const fullProject =
          recommendedProjects.find(
            (p: any) => p._id === project.id || p.id === project.id,
          ) || project;
        setSelectedProject(fullProject);
        setShowTermsForApply(true);
      }
    }
  }, [profile, recommendedProjects]);

  const handleTermsAccepted = () => {
    setShowTermsForApply(false);
    setShowApplicationModal(true);
  };

  const handleApplicationSuccess = (convId?: string) => {
    setShowApplicationModal(false);
    setSelectedProject(null);
    queryClient.invalidateQueries({ queryKey: ["myApplications"] });
    toast.success("Application submitted successfully!");
    if (convId) {
      navigate("/freelancer/messages", {
        state: { conversationId: convId },
      });
    } else {
      navigate("/freelancer/messages");
    }
  };
  const profileCompletion = profile
    ? Math.round(
        (!!profile.title ? 10 : 0) +
          (!!profile.bio ? 10 : 0) +
          ((profile.portfolio?.length || 0) > 0 ? 15 : 0) +
          ((profile.skills?.length || 0) > 0 ? 20 : 0) +
          ((profile.workExperience?.length || 0) > 0 ? 20 : 0) +
          ((profile.education?.length || 0) > 0 ? 15 : 0) +
          (profile.availability ? 10 : 0),
      )
    : 0;

  const subscriptionPlan = subscription?.plan || "free";

  const daysRemaining = (() => {
    if (!subscription?.endDate || subscriptionPlan === "free") return null;
    const end = new Date(subscription.endDate).getTime();
    const now = Date.now();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  })();

  const unreadMessages = conversations.reduce(
    (acc, c) => acc + c.unreadCount,
    0,
  );
  const pendingApplications = applications.filter(
    (a) => a.status === "pending",
  ).length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const statsData = [
    {
      label: "Profile Completion",
      value: `${profileCompletion}%`,
      icon: Award,
      color: "bg-royal-blue",
      change:
        profileCompletion === 100
          ? "All set!"
          : `${100 - profileCompletion}% remaining`,
      trend: profileCompletion === 100 ? ("neutral" as const) : ("up" as const),
    },
    {
      label: "Active Applications",
      value: String(applications.filter((a) => a.status === "pending").length),
      icon: FileText,
      color: "bg-teal",
      change: `${pendingApplications} pending`,
      trend: "neutral" as const,
    },
    {
      label: "Email Verification",
      value: user?.isEmailVerified ? "Verified" : "Pending",
      icon: user?.isEmailVerified ? CheckCircle : AlertCircle,
      color: user?.isEmailVerified ? "bg-success-green" : "bg-gold",
      change: user?.isEmailVerified ? "Email confirmed" : "Verify now to apply",
      trend: "neutral" as const,
    },
    {
      label: "New Messages",
      value: String(unreadMessages),
      icon: MessageSquare,
      color: "bg-gold",
      change: `${unreadMessages} unread`,
      trend: "neutral" as const,
    },
  ];

  const profileCompletionItems = [
    { label: "Add profile photo", completed: false },
    { label: "Write bio description", completed: !!profile?.bio },
    {
      label: "Add portfolio items",
      completed: (profile?.portfolio?.length || 0) > 0,
    },
    { label: "Add skills", completed: (profile?.skills?.length || 0) > 0 },

    {
      label: "Add work experience",
      completed: (profile?.workExperience?.length || 0) > 0,
    },
    {
      label: "Add education",
      completed: (profile?.education?.length || 0) > 0,
    },
  ];

  const applicationStatuses = applications.slice(0, 5).map((app, index) => ({
    id: app._id || app.id || `app-${index}`,
    project: app.project?.title || "Untitled Project",
    client:
      (app.project as any)?.client?.fullName ||
      (app.project as any)?.client?.name ||
      (app.project as any)?.clientName ||
      (app.project?.clientId as any)?.fullName ||
      "Client",
    appliedDate: new Date(app.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    status: app.status.charAt(0).toUpperCase() + app.status.slice(1),
    fullData: app,
  }));

  const recommendedProjectsData = recommendedProjects.map((project, index) => ({
    id: project._id || project.id || `project-${index}`,
    title: project.title,
    client: { name: project.client?.fullName || "Unknown Client", rating: 4.5 },
    skillsMatch: 85,
    postedTime: new Date(project.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    skills: project.requiredSkills || [],
  }));

  const recentMessages = conversations.slice(0, 3).map((conv, index) => ({
    id: conv.id || (conv as any)._id || `msg-${index}`,
    name: conv.participants?.[0]?.fullName || "Unknown",
    avatar:
      conv.participants?.[0]?.fullName
        ?.split(" ")
        .map((n) => n[0])
        .join("") || "U",
    message: conv.lastMessage?.content || "No messages yet",
    time: conv.lastMessage
      ? new Date(conv.lastMessage.createdAt).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "",
    unread: conv.unreadCount > 0,
  }));

  return (
    <div className="flex-1 h-full overflow-y-auto overflow-x-hidden bg-background transition-colors duration-300">
      <div className="min-h-full">
        <DashboardHeader
          title="Dashboard"
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Main Content Area */}
        <main className="dashboard-content-loose">
          {loading ? (
            <div className="space-y-8">
              <div className="flex items-center justify-between space-y-2">
                <Skeleton className="h-9 w-[200px]" />
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-9 w-[150px]" />
                </div>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-[140px] rounded-2xl" />
                <Skeleton className="h-[140px] rounded-2xl" />
                <Skeleton className="h-[140px] rounded-2xl" />
                <Skeleton className="h-[140px] rounded-2xl" />
              </div>
              <div className="space-y-6">
                <Skeleton className="h-[200px] rounded-2xl" />
                <Skeleton className="h-[400px] rounded-2xl" />
              </div>
            </div>
          ) : (
            <>
              {/* TRIAL BANNER */}
              <TrialBanner />

              {/* WELCOME BANNER */}
              <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-navy via-[#0f2445] to-royal-blue p-4 sm:p-6 lg:p-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal/20 rounded-full blur-[80px] translate-x-1/3 -translate-y-1/2" />
                <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-royal-blue/30 rounded-full blur-[60px]" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                  <div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                      {getGreeting()}, {freelancerName}! 👋
                    </h2>
                    <p className="text-white/80">
                      Your profile is{" "}
                      <span className="text-teal-light font-semibold">
                        {profileCompletion}% complete
                      </span>
                      . Complete it to get more project invites!
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full lg:w-auto mt-4 lg:mt-0">
                    <Link to="/freelancer/profile" className="w-full sm:w-auto">
                      <Button className="bg-white text-navy hover:bg-slate-100 font-semibold w-full">
                        <User size={18} className="mr-2" />
                        Complete Profile
                      </Button>
                    </Link>
                    <Link
                      to={`/freelancer/${user?._id}`}
                      className="w-full sm:w-auto"
                    >
                      <Button
                        variant="outline"
                        className="w-full bg-white/20 border-white/40 text-white hover:bg-white/30 hover:border-white/50 transition-all font-semibold backdrop-blur-sm"
                      >
                        <Eye size={18} className="mr-2" />
                        Preview Profile
                      </Button>
                    </Link>
                    <Link
                      to="/freelancer/projects"
                      className="w-full sm:w-auto"
                    >
                      <Button
                        variant="outline"
                        className="w-full bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white hover:border-white/50 transition-all font-semibold"
                      >
                        <Search size={18} className="mr-2" />
                        Browse Projects
                      </Button>
                    </Link>
                  </div>
                </div>
              </section>

              {/* STATS CARDS */}
              <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
                {statsData.map((stat, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-white/5 rounded-2xl p-5 lg:p-6 border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center text-white",
                          stat.color,
                        )}
                      >
                        <stat.icon size={24} />
                      </div>
                      {stat.trend === "up" && (
                        <TrendingUp size={16} className="text-success-green" />
                      )}
                    </div>
                    <p className="text-2xl lg:text-3xl font-bold text-navy dark:text-white mb-1">
                      {stat.value}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {stat.label}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                      {stat.change}
                    </p>
                  </div>
                ))}
              </section>

              {/* PROFILE COMPLETENESS */}
              <section className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm p-5 lg:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-navy dark:text-white">
                    Complete Your Profile
                  </h3>
                  <span className="text-sm font-semibold text-teal dark:text-teal-light">
                    {profileCompletion}%
                  </span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-6">
                  <div
                    className="h-full bg-gradient-to-r from-teal to-teal-light rounded-full transition-all"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profileCompletionItems.map((item, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border transition-colors",
                        item.completed
                          ? "bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5"
                          : "bg-gold/5 dark:bg-gold/10 border-gold/20 hover:border-gold/40 cursor-pointer",
                      )}
                    >
                      {item.completed ? (
                        <CheckCircle
                          size={18}
                          className="text-success-green shrink-0"
                        />
                      ) : (
                        <AlertCircle size={18} className="text-gold shrink-0" />
                      )}
                      <span
                        className={cn(
                          "text-sm",
                          item.completed
                            ? "text-slate-500 line-through dark:text-slate-500"
                            : "text-navy dark:text-white font-medium",
                        )}
                      >
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-center">
                  <Link to="/freelancer/profile">
                    <Button className="bg-teal hover:bg-teal-light text-white">
                      <Zap size={16} className="mr-2" />
                      Complete Now
                    </Button>
                  </Link>
                </div>
              </section>

              {/* RECOMMENDED PROJECTS */}
              <section className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                <div className="flex items-center justify-between p-5 lg:p-6 border-b border-slate-100 dark:border-white/5">
                  <h3 className="text-lg font-bold text-navy dark:text-white">
                    Projects Matching Your Skills
                  </h3>
                  <Link
                    to="/freelancer/projects"
                    className="text-sm text-teal dark:text-teal-light font-medium hover:underline flex items-center gap-1"
                  >
                    View All <ArrowRight size={14} />
                  </Link>
                </div>
                <div className="p-4 sm:p-5 lg:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendedProjectsData.map((project) => (
                    <div
                      key={project.id}
                      className="group relative p-4 pt-6 rounded-xl border border-slate-100 dark:border-white/5 hover:border-teal/30 hover:shadow-md transition-all overflow-hidden bg-white dark:bg-white/5"
                    >
                      <div
                        className={cn(
                          "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r transition-all",
                          getCategoryStyle(
                            (project as any).category ||
                              project.skills?.[0] ||
                              "Default",
                          ).gradient,
                        )}
                      />
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-navy dark:text-white text-sm line-clamp-2">
                          {project.title}
                        </h4>
                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-success-green/10 text-success-green shrink-0 ml-2">
                          {project.skillsMatch}% match
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-navy text-xs font-bold">
                          {project.client.name.charAt(0)}
                        </div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {project.client.name}
                        </span>
                        <div className="flex items-center gap-0.5 ml-auto">
                          <Star size={12} className="text-gold fill-gold" />
                          <span className="text-xs font-medium text-slate-600">
                            {project.client.rating}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {project.skills.slice(0, 2).map((skill: string) => (
                          <span
                            key={skill}
                            className="px-2 py-1 bg-slate-100 dark:bg-white/5 rounded-md text-xs font-medium text-slate-600 dark:text-slate-400"
                          >
                            {skill}
                          </span>
                        ))}
                        {project.skills.length > 2 && (
                          <span className="px-2 py-1 bg-slate-100 rounded-md text-xs font-medium text-slate-400">
                            +{project.skills.length - 2}
                          </span>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-white/5">
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mb-4">
                          <Clock size={12} />
                          {project.postedTime}
                        </div>
                        {(() => {
                          const status = appStatusByProjectId.get(project.id);
                          const hasApplied =
                            status &&
                            status !== "withdrawn" &&
                            status !== "rejected";
                          const applyLabel = hasApplied
                            ? status === "shortlisted"
                              ? "Shortlisted"
                              : status === "hired"
                                ? "Hired"
                                : status === "accepted"
                                  ? "Accepted"
                                  : "Applied"
                            : "Apply Now";

                          return (
                            <Button
                              className={cn(
                                "w-full text-sm",
                                hasApplied
                                  ? "bg-slate-100 text-slate-500 hover:bg-slate-100 cursor-not-allowed dark:bg-white/5 dark:text-slate-400"
                                  : "bg-royal-blue hover:bg-royal-blue-hover text-white",
                              )}
                              disabled={!!hasApplied}
                              onClick={() =>
                                !hasApplied && handleApplyClick(project)
                              }
                            >
                              {applyLabel}
                            </Button>
                          );
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* APPLICATION STATUS */}
              <section className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-5 lg:p-6 border-b border-slate-100 dark:border-white/5">
                  <h3 className="text-lg font-bold text-navy dark:text-white">
                    Your Applications
                  </h3>
                  <Link
                    to="/freelancer/applications"
                    className="text-sm text-teal dark:text-teal-light font-medium hover:underline flex items-center gap-1"
                  >
                    View All <ArrowRight size={14} />
                  </Link>
                </div>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full mobile-table">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-white/5 text-left">
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                          Project
                        </th>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                          Client
                        </th>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                          Applied
                        </th>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {applicationStatuses.map((app) => (
                        <tr
                          key={app.id}
                          className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <p className="font-medium text-navy dark:text-white text-sm">
                              {app.project}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                            {app.client}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                            {app.appliedDate}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={cn(
                                "px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap",
                                getStatusBadgeStyle(app.status),
                              )}
                            >
                              {app.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 px-3 text-xs text-royal-blue dark:text-teal-light hover:bg-royal-blue/10 dark:hover:bg-white/5"
                              onClick={() =>
                                setSelectedApplication(app.fullData)
                              }
                            >
                              <ExternalLink size={14} className="mr-1" />
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden flex flex-col divide-y divide-slate-100 dark:divide-white/5">
                  {applicationStatuses.map((app) => (
                    <div
                      key={app.id}
                      className="p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h4 className="font-medium text-navy dark:text-white text-sm line-clamp-1">
                          {app.project}
                        </h4>
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap shrink-0",
                            getStatusBadgeStyle(app.status),
                          )}
                        >
                          {app.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                        {app.client}
                      </p>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50 dark:border-white/5">
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-500 mb-0.5">
                            Applied: {app.appliedDate}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-3 text-xs text-royal-blue dark:text-teal-light hover:bg-royal-blue/10 dark:hover:bg-white/5"
                          onClick={() => setSelectedApplication(app.fullData)}
                        >
                          <ExternalLink size={14} className="mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* BOTTOM TWO COLUMN LAYOUT */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* LEFT COLUMN: MESSAGES */}
                <section className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm h-full flex flex-col">
                  <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-white/5 shrink-0">
                    <h3 className="text-lg font-bold text-navy dark:text-white">
                      New Messages
                    </h3>
                    <Link
                      to="/freelancer/messages"
                      className="text-sm text-teal font-medium hover:underline"
                    >
                      Go to Inbox
                    </Link>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-white/5 flex-1 overflow-y-auto min-h-0">
                    {recentMessages.map((msg) => (
                      <Link
                        key={msg.id}
                        to="/freelancer/messages"
                        state={{ conversationId: msg.id }}
                        className={cn(
                          "block p-4 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors",
                          msg.unread && "bg-teal/5 dark:bg-teal/10",
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal to-royal-blue flex items-center justify-center text-white text-xs font-bold">
                              {msg.avatar}
                            </div>
                            {msg.unread && (
                              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-teal rounded-full border-2 border-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p
                                className={cn(
                                  "text-sm font-semibold",
                                  msg.unread
                                    ? "text-navy dark:text-white"
                                    : "text-slate-600 dark:text-slate-400",
                                )}
                              >
                                {msg.name}
                              </p>
                              <span className="text-xs text-slate-400 shrink-0 ml-2">
                                {msg.time}
                              </span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                              {msg.message}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="p-4 shrink-0 border-t border-slate-100 dark:border-white/5 mt-auto">
                    <Link to="/freelancer/messages">
                      <Button
                        variant="outline"
                        className="w-full border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
                      >
                        View All Messages
                      </Button>
                    </Link>
                  </div>
                </section>

                {/* RIGHT COLUMN: SUBSCRIPTION & QUICK ACTIONS */}
                <div className="flex flex-col gap-6">
                  {/* SUBSCRIPTION STATUS */}
                  <section className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm p-5 lg:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "w-14 h-14 rounded-xl flex items-center justify-center shrink-0",
                            subscriptionPlan === "free"
                              ? "bg-slate-100 dark:bg-white/10"
                              : subscriptionPlan === "pro"
                                ? "bg-royal-blue/10 dark:bg-royal-blue/20"
                                : "bg-gold/10 dark:bg-gold/20",
                          )}
                        >
                          <Award
                            size={28}
                            className={cn(
                              subscriptionPlan === "free"
                                ? "text-slate-500"
                                : subscriptionPlan === "pro"
                                  ? "text-royal-blue"
                                  : "text-gold",
                            )}
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-lg font-bold text-navy dark:text-white truncate">
                            {subscriptionPlan.charAt(0).toUpperCase() +
                              subscriptionPlan.slice(1)}{" "}
                            Plan
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                            {subscriptionPlan === "free"
                              ? "Limited features - Upgrade to unlock more"
                              : subscription?.endDate
                                ? `Expires on ${new Date(subscription.endDate).toLocaleDateString()}`
                                : "Active subscription"}
                          </p>
                          {daysRemaining !== null && (
                            <p
                              className={cn(
                                "text-xs font-semibold mt-1",
                                daysRemaining <= 3
                                  ? "text-red-500"
                                  : daysRemaining <= 7
                                    ? "text-amber-500"
                                    : "text-emerald-500",
                              )}
                            >
                              {daysRemaining === 0
                                ? "Expires today!"
                                : daysRemaining === 1
                                  ? "1 day remaining"
                                  : `${daysRemaining} days remaining`}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-3 shrink-0">
                        {subscriptionPlan === "free" ? (
                          <Link to="/freelancer/subscription">
                            <Button className="bg-gradient-to-r from-royal-blue to-teal text-white font-semibold w-full lg:w-auto">
                              <Zap size={16} className="mr-2" />
                              Upgrade Now
                            </Button>
                          </Link>
                        ) : (
                          <Link to="/freelancer/subscription">
                            <Button
                              variant="outline"
                              className="border-royal-blue text-royal-blue w-full lg:w-auto"
                            >
                              Manage Subscription
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* QUICK ACTIONS */}
                  <section className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm p-5 lg:p-6">
                    <h3 className="text-lg font-bold text-navy dark:text-white mb-4">
                      Quick Actions
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      <Link
                        to="/freelancer/profile"
                        className="w-full sm:w-auto flex-1"
                      >
                        <Button
                          variant="outline"
                          className="w-full border-slate-200 dark:border-white/10 dark:text-white hover:border-royal-blue dark:hover:border-royal-blue hover:text-royal-blue dark:hover:text-royal-blue dark:hover:bg-white/5 justify-start"
                        >
                          <User size={16} className="mr-2 shrink-0" />
                          Update Profile
                        </Button>
                      </Link>
                      <Link
                        to="/freelancer/portfolio"
                        className="w-full sm:w-auto flex-1"
                      >
                        <Button
                          variant="outline"
                          className="w-full border-slate-200 dark:border-white/10 dark:text-white hover:border-teal dark:hover:border-teal hover:text-teal dark:hover:text-teal dark:hover:bg-white/5 justify-start"
                        >
                          <Plus size={16} className="mr-2 shrink-0" />
                          Add Portfolio
                        </Button>
                      </Link>
                      <Link to="/projects" className="w-full sm:w-auto flex-1">
                        <Button
                          variant="outline"
                          className="w-full border-slate-200 dark:border-white/10 dark:text-white hover:border-success-green dark:hover:border-success-green hover:text-success-green dark:hover:text-success-green dark:hover:bg-white/5 justify-start"
                        >
                          <Briefcase size={16} className="mr-2 shrink-0" />
                          Browse Projects
                        </Button>
                      </Link>
                    </div>
                  </section>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Application Details Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0F172A] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 border border-white/10">
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 sm:p-8 border-b border-slate-100 dark:border-white/5">
              <div>
                <h2 className="text-2xl font-black text-navy dark:text-white tracking-tight">
                  Application Details
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium line-clamp-1">
                  {selectedApplication.project?.title || "Untitled Project"}
                </p>
              </div>
              <button
                onClick={() => setSelectedApplication(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors -mr-2 -mt-2"
              >
                <X size={24} className="text-slate-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
              {/* Cover Letter */}
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                  Cover Letter
                </h3>
                <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-wrap border border-slate-100 dark:border-white/5">
                  {selectedApplication.coverLetter ||
                    "No cover letter provided."}
                </div>
              </div>

              {/* Application Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-5 border border-slate-100 dark:border-white/5">
                  <p className="text-xxs font-black text-slate-400 uppercase tracking-widest mb-2">
                    Target Date
                  </p>
                  <div className="flex items-center gap-2 font-bold text-navy dark:text-white">
                    <div className="w-8 h-8 rounded-lg bg-royal-blue/10 flex items-center justify-center text-royal-blue">
                      <Clock size={16} />
                    </div>
                    {selectedApplication.estimatedCompletionDate
                      ? new Date(
                          selectedApplication.estimatedCompletionDate,
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "Not specified"}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-5 border border-slate-100 dark:border-white/5">
                  <p className="text-xxs font-black text-slate-400 uppercase tracking-widest mb-2">
                    Status
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border",
                        getStatusBadgeStyle(selectedApplication.status),
                      )}
                    >
                      {selectedApplication.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 sm:p-8 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex justify-end">
              <Button
                variant="outline"
                className="rounded-xl border-slate-200 dark:border-white/10 dark:text-white font-bold h-12 px-8"
                onClick={() => setSelectedApplication(null)}
              >
                Close Details
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Terms & Conditions Modal for Apply flow */}
      <TermsModal
        isOpen={showTermsForApply}
        onClose={() => {
          setShowTermsForApply(false);
          setSelectedProject(null);
        }}
        onAgree={handleTermsAccepted}
      />

      {/* Project Application Modal */}
      {selectedProject && (
        <ProjectApplicationModal
          isOpen={showApplicationModal}
          onClose={() => {
            setShowApplicationModal(false);
            setSelectedProject(null);
          }}
          onSuccess={handleApplicationSuccess}
          project={{
            id: selectedProject._id || selectedProject.id || "",
            title: selectedProject.title,
            client: {
              name: selectedProject.client?.fullName ?? "Client",
              rating: 0,
              reviews: 0,
              verified: false,
            },
          }}
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
    </div>
  );
};

export default FreelancerDashboard;
