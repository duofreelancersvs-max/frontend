import { Link, useOutletContext, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type { ClientLayoutContext } from "@/layouts/ClientLayout";
import {
  Folder,
  PlusCircle,
  Search,
  Star,
  ArrowRight,
  Clock,
  MessageSquare,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Sparkles,
  CreditCard,
  User,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/shared/Skeleton";
import DashboardHeader from "@/components/layouts/DashboardHeader";
import { cn, formatBudget } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useClientProjects } from "@/hooks/queries/useProjects";
import {
  useTopRatedFreelancers,
  useConversations,
  useMyUser,
  useMyClientApplications,
  useHireFreelancer,
  useCreateConversation
} from "@/hooks/queries/useClientDashboardQueries";

// Mock Data

const ClientDashboard = () => {
  const { setSidebarOpen } = useOutletContext<ClientLayoutContext>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: projectsData, isLoading: loadingProjects } = useClientProjects({ limit: 100 });
  const { data: appsData, isLoading: loadingApps } = useMyClientApplications();
  const { data: freeData, isLoading: loadingFreelancers } = useTopRatedFreelancers();
  const { data: convData, isLoading: loadingConversations } = useConversations();
  const { data: userData, isLoading: loadingUser } = useMyUser();
  const loading = loadingProjects || loadingApps || loadingFreelancers || loadingConversations || loadingUser;

  const projects = projectsData?.projects || [];
  const applications = appsData?.applications || [];
  const freelancers = (freeData as any)?.profiles || (freeData as any)?.freelancers || [];
  const conversations = convData?.conversations || [];
  const userFullName = userData?.fullName || "";

  const hireMutation = useHireFreelancer();
  const createConvMutation = useCreateConversation();

  const getClientName = () => {
    if (userFullName) return userFullName;
    return user?.email?.split("@")[0] || "Client";
  };

  const clientName = getClientName();

  const activeProjects = (projects || [])
    .filter((p) => p.status === "in-progress")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)
    .map((p) => ({
      id: p._id,
      name: p.title,
      status: p.status === "in-progress" ? "In Progress" : p.status,
      freelancer: {
        name: p.freelancer?.fullName || "TBD",
        avatar:
          p.freelancer?.fullName
            ?.split(" ")
            .map((n: string) => n[0])
            .join("") || "?",
      },
      progress: 50,
      deadline: p.deadline
        ? new Date(p.deadline).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "No deadline",
      budget: formatBudget(p.budget?.minAmount, p.budget?.maxAmount),
    }));

  const pendingApplications = (applications || []).filter(
    (a) => a.status === "pending",
  );

  const completedProjects = (projects || []).filter(
    (p) => p.status === "completed"
  ).length;

  const handleHireFreelancer = async (applicationId: string) => {
    try {
      await hireMutation.mutateAsync(applicationId);
      toast.success("Freelancer hired successfully!");
    } catch (error) {
      console.error("Error hiring freelancer:", error);
      toast.error("Failed to hire freelancer. Please try again.");
    }
  };

  const handleMessageFreelancer = async (
    freelancerId: string,
    projectId?: string
  ) => {
    try {
      const conv = await createConvMutation.mutateAsync({
        participantId: freelancerId,
        projectId,
      });
      navigate(`/client/messages`, { state: { conversationId: conv.id } });
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast.error("Failed to start conversation. Please try again.");
    }
  };


  const statsData = [
    {
      label: "Active Projects",
      value: String(
        projects.filter((p) => p.status === "in-progress").length,
      ),
      icon: Folder,
      color: "bg-primary",
      change: "+1 this month",
    },
    {
      label: "Completed Projects",
      value: String(completedProjects),
      icon: CheckCircle,
      color: "bg-teal-primary",
      change: "+3 this month",
    },

    {
      label: "Pending Reviews",
      value: String(pendingApplications.length),
      icon: Star,
      color: "bg-gold",
      change: "Leave feedback",
    },
  ];

  const recentApplications = (applications || [])
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)
    .map((app) => ({
      id: app._id || app.id,
      freelancerId: app.freelancerId || (app.freelancer as any)?._id || (app.freelancer as any)?.id,
      projectId: app.projectId || (app.project as any)?._id || (app.project as any)?.id,
      freelancer: {
        name: app.freelancer?.fullName || "Unknown",
        avatar:
          app.freelancer?.fullName
            ?.split(" ")
            .map((n: string) => n[0])
            .join("") || "?",
        title: "Freelancer",
      },
      project: app.project?.title || "Project",
      appliedDate: new Date(app.createdAt).toLocaleDateString("en-US", {
        day: "numeric",
        hour: "2-digit",
      }),
      status: app.status.charAt(0).toUpperCase() + app.status.slice(1),
      rawStatus: app.status,
    }));

  const recommendedFreelancers = (freelancers || []).slice(0, 3).map((f: any) => ({
    id: f._id || f.id,
    name: f.userId,
    avatar:
      f.title
        ?.split(" ")
        .map((n: string) => n[0])
        .join("") || "F",
    title: f.title || "Freelancer",
    skills: (f.skills || []).map((s: any) => typeof s === 'string' ? s : s.name || 'Skill'),
    rating: f.rating || 0,
    reviews: f.totalReviews || 0,
  }));

  const recentMessages = (conversations || []).slice(0, 3).map((conv) => ({
    id: conv.id || (conv as any)._id,
    name: conv.participants?.[0]?.fullName || "Unknown",
    avatar:
      conv.participants?.[0]?.fullName
        ?.split(" ")
        .map((n: string) => n[0])
        .join("") || "?",
    message: conv.lastMessage?.content || "No messages",
    time: conv.lastMessage
      ? new Date(conv.lastMessage.createdAt).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "",
    unread: conv.unreadCount > 0,
  }));

  const activityFeed = [
    {
      id: 1,
      action: "New project created",
      project: "Dashboard",
      time: "Just now",
      type: "submission",
    },
    {
      id: 2,
      action: "Freelancer hired",
      project: "Recent",
      time: "Today",
      type: "payment",
    },
    {
      id: 3,
      action: "New application received",
      project: "Projects",
      time: "Today",
      type: "application",
    },
    {
      id: 4,
      action: "Welcome to ConnectMe",
      project: "Getting Started",
      time: "Welcome",
      type: "reminder",
    },
  ];

  if (loading) {
    return (
      <div className="flex-1 space-y-8 p-8 pt-6 min-h-screen bg-background">
        <div className="flex items-center justify-between space-y-2">
          <Skeleton className="h-9 w-[200px]" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-9 w-[150px]" />
            <Skeleton className="h-9 w-[150px]" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-[140px] rounded-2xl" />
          <Skeleton className="h-[140px] rounded-2xl" />
          <Skeleton className="h-[140px] rounded-2xl" />
          <Skeleton className="h-[140px] rounded-2xl" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <Skeleton className="col-span-4 h-[400px] rounded-2xl" />
          <Skeleton className="col-span-3 h-[400px] rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full overflow-y-auto overflow-x-hidden bg-background transition-colors duration-300">
      {/* MAIN CONTENT */}
      <div className="min-h-full">
        <DashboardHeader
          title="Dashboard"
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Main Content Area */}
        <main className="px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8">
          {/* WELCOME BANNER */}
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-navy via-[#0f2445] to-royal-blue p-6 lg:p-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal/20 rounded-full blur-[80px] translate-x-1/3 -translate-y-1/2" />
            <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-royal-blue/30 rounded-full blur-[60px]" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                  Welcome back, {clientName}! 👋
                </h2>
                <p className="text-white/80">
                  You have{" "}
                  <span className="text-teal-light font-semibold">
                    {projects.filter((p) => p.status === "in-progress").length} active project{projects.filter((p) => p.status === "in-progress").length !== 1 ? 's' : ''}
                  </span>{" "}
                  and{" "}
                  <span className="text-gold font-semibold">
                    {pendingApplications.length} new application{pendingApplications.length !== 1 ? 's' : ''}
                  </span>{" "}
                  to review.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/client/post-project">
                  <Button className="bg-white text-navy hover:bg-slate-100 font-semibold">
                    <PlusCircle size={18} className="mr-2" />
                    Post New Project
                  </Button>
                </Link>
                <Link to="/client/freelancers">
                  <Button
                    variant="outline"
                    className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white hover:border-white/50"
                  >
                    <Search size={18} className="mr-2" />
                    Find Freelancers
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* STATS CARDS */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {statsData.map((stat, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-white/5 rounded-2xl p-5 lg:p-6 border border-slate-100 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow"
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
                  <TrendingUp size={16} className="text-green-500" />
                </div>
                <p className="text-2xl lg:text-3xl font-bold text-navy dark:text-white mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{stat.change}</p>
              </div>
            ))}
          </section>

          {/* ACTIVE PROJECTS */}
          <section className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm">
            <div className="flex items-center justify-between p-5 lg:p-6 border-b border-slate-100 dark:border-white/10">
              <h3 className="text-lg font-bold text-navy dark:text-white">Active Projects</h3>
              <Link
                to="/client/projects"
                className="text-sm text-teal font-medium hover:underline flex items-center gap-1"
              >
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="p-5 lg:p-6 grid gap-4 lg:grid-cols-3">
              {activeProjects.map((project) => (
                <div
                  key={project.id}
                  className="p-4 rounded-xl border border-slate-100 dark:border-white/10 hover:border-teal/30 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-navy dark:text-white text-sm">
                      {project.name}
                    </h4>
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-semibold",
                        project.status === "In Progress" &&
                          "bg-teal/10 text-teal",
                        project.status === "In Review" &&
                          "bg-gold/10 text-gold",
                        project.status === "Just Started" &&
                          "bg-royal-blue/10 text-royal-blue",
                      )}
                    >
                      {project.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal to-royal-blue flex items-center justify-center text-white text-xs font-bold">
                      {project.freelancer.avatar}
                    </div>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {project.freelancer.name}
                    </span>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500 dark:text-slate-400">Progress</span>
                      <span className="font-semibold text-navy dark:text-white">
                        {project.progress}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal to-teal-light rounded-full transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full min-w-0">
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <Clock size={12} />
                      {project.deadline === "No deadline"
                        ? "No deadline"
                        : `Due in ${project.deadline}`}
                    </div>
                    <Link to={`/client/project/${project.id}`}>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-royal-blue hover:bg-royal-blue/10 text-xs h-7 px-2"
                      >
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* RECENT APPLICATIONS */}
          <section className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-5 lg:p-6 border-b border-slate-100 dark:border-white/10">
              <h3 className="text-lg font-bold text-navy dark:text-white">
                Recent Applications
              </h3>
              <Link
                to="/client/applications"
                className="text-sm text-teal font-medium hover:underline flex items-center gap-1"
              >
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-white/5 text-left">
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                      Freelancer
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                      Project
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
                <tbody className="divide-y divide-slate-100">
                  {recentApplications.map((app) => (
                    <tr
                      key={app.id}
                      className="hover:bg-slate-50 dark:hover:bg-white/5 border-b border-slate-100 dark:border-white/5 transition-colors last:border-0"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal to-royal-blue flex items-center justify-center text-white text-xs font-bold">
                            {app.freelancer.avatar}
                          </div>
                          <div>
                             <p className="font-medium text-navy dark:text-white text-sm">
                              {app.freelancer.name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {app.freelancer.title}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {app.project}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                        {app.appliedDate}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-semibold",
                            app.rawStatus === "pending" && "bg-slate-100 text-slate-600",
                            app.rawStatus === "shortlisted" && "bg-gold/10 text-gold",
                            (app.rawStatus === "accepted" || app.rawStatus === "hired") && "bg-teal/10 text-teal",
                            app.rawStatus === "rejected" && "bg-red-50 text-red-600",
                          )}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-xs"
                            onClick={() => navigate(`/client/project/${app.projectId}`)}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-xs text-teal"
                            onClick={() => handleMessageFreelancer(app.freelancerId, app.projectId)}
                          >
                            <MessageSquare size={14} />
                          </Button>
                          <Button
                            size="sm"
                            disabled={app.rawStatus === "hired" || app.rawStatus === "accepted"}
                            className={cn(
                              "h-8 px-3 text-xs",
                              (app.rawStatus === "hired" || app.rawStatus === "accepted") 
                                ? "bg-slate-100 text-slate-500 cursor-not-allowed border-none shadow-none" 
                                : "bg-teal hover:bg-teal-light text-white"
                            )}
                            onClick={() => (app.rawStatus !== "hired" && app.rawStatus !== "accepted") && handleHireFreelancer(app.id)}
                          >
                            {(app.rawStatus === "hired" || app.rawStatus === "accepted") ? "Hired" : "Hire"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* TWO COLUMN LAYOUT */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* LEFT - RECOMMENDED FREELANCERS */}
            <section className="lg:col-span-2 bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm min-w-0">
              <div className="flex items-center justify-between p-5 lg:p-6 border-b border-slate-100 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-gold" />
                  <h3 className="text-lg font-bold text-navy dark:text-white">
                    Recommended for You
                  </h3>
                </div>
                <Link
                  to="/client/freelancers"
                  className="text-sm text-teal font-medium hover:underline flex items-center gap-1"
                >
                  View All <ArrowRight size={14} />
                </Link>
              </div>
              <div className="p-5 lg:p-6 flex gap-4 overflow-x-auto pb-4">
                {recommendedFreelancers.map((freelancer: any) => (
                   <div
                    key={freelancer.id}
                    className="min-w-[260px] p-4 rounded-xl border border-slate-100 dark:border-white/10 hover:border-teal/30 hover:shadow-md transition-all flex-shrink-0"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal to-royal-blue flex items-center justify-center text-white font-bold">
                        {freelancer.avatar}
                      </div>
                      <div>
                         <h4 className="font-semibold text-navy dark:text-white">
                          {freelancer.name}
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {freelancer.title}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {freelancer.skills.slice(0, 2).map((skill: string) => (
                        <span
                          key={skill}
                           className="px-2 py-1 bg-slate-100 dark:bg-white/10 rounded-md text-xs font-medium text-slate-600 dark:text-slate-400"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-end pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-gold fill-gold" />
                         <span className="text-sm font-semibold text-navy dark:text-white">
                          {freelancer.rating}
                        </span>
                        <span className="text-xs text-slate-400">
                          ({freelancer.reviews})
                        </span>
                      </div>
                    </div>
                    <Link to={`/freelancer/${freelancer.id}`}>
                      <Button
                        variant="outline"
                        className="w-full mt-4 border-royal-blue text-royal-blue hover:bg-royal-blue hover:text-white text-sm"
                      >
                        View Profile
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </section>

            {/* RIGHT - RECENT MESSAGES */}
            <section className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-white/10">
                <h3 className="text-lg font-bold text-navy dark:text-white">Recent Messages</h3>
                <Link
                  to="/client/messages"
                  className="text-sm text-teal font-medium hover:underline"
                >
                  Go to Inbox
                </Link>
              </div>
              <div className="divide-y divide-slate-100">
                {recentMessages.map((msg) => (
                   <Link
                    key={msg.id}
                    to="/client/messages"
                    state={{ conversationId: msg.id }}
                    className={cn(
                      "block p-4 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors border-b border-slate-100 dark:border-white/5 last:border-0",
                      msg.unread && "bg-teal/5 dark:bg-teal/10",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal to-royal-blue flex items-center justify-center text-white text-xs font-bold">
                          {msg.avatar}
                        </div>
                         {msg.unread && (
                          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-teal rounded-full border-2 border-white dark:border-[#0F172A]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p
                            className={cn(
                               "text-sm font-semibold",
                              msg.unread ? "text-navy dark:text-white" : "text-slate-600 dark:text-slate-400",
                            )}
                          >
                            {msg.name}
                          </p>
                          <span className="text-xs text-slate-400">
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
              <div className="p-4">
                <Link to="/client/messages">
                   <Button
                    variant="outline"
                    className="w-full border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
                  >
                    <Mail size={16} className="mr-2" />
                    Open Inbox
                  </Button>
                </Link>
              </div>
            </section>
          </div>

          {/* BOTTOM ROW */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* QUICK ACTIONS */}
            <section className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-5 lg:p-6">
              <h3 className="text-lg font-bold text-navy dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                 <Link
                  to="/client/post-project"
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-white/5 hover:border-teal hover:bg-teal/5 dark:hover:bg-teal/10 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-teal/10 dark:bg-teal/20 flex items-center justify-center text-teal group-hover:bg-teal group-hover:text-white transition-colors">
                    <PlusCircle size={20} />
                  </div>
                  <div>
                     <p className="font-semibold text-navy dark:text-white text-sm">
                      Post New Project
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Create a new job listing
                    </p>
                  </div>
                  <ArrowRight
                    size={16}
                    className="ml-auto text-slate-300 group-hover:text-teal"
                  />
                </Link>
                <Link
                  to="/client/freelancers"
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-white/10 hover:border-royal-blue hover:bg-royal-blue/5 dark:hover:bg-royal-blue/10 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-royal-blue/10 dark:bg-royal-blue/20 flex items-center justify-center text-royal-blue group-hover:bg-royal-blue group-hover:text-white transition-colors">
                    <Search size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-navy dark:text-white text-sm">
                      Browse Freelancers
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Find the perfect talent
                    </p>
                  </div>
                  <ArrowRight
                    size={16}
                    className="ml-auto text-slate-300 group-hover:text-royal-blue"
                  />
                </Link>
                <Link
                  to="/contact"
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-white/10 hover:border-gold hover:bg-gold/5 dark:hover:bg-gold/10 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-gold/10 dark:bg-gold/20 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-colors">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-navy dark:text-white text-sm">
                      Get Support
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">We're here to help</p>
                  </div>
                  <ArrowRight
                    size={16}
                    className="ml-auto text-slate-300 group-hover:text-gold"
                  />
                </Link>
              </div>
            </section>

            {/* ACTIVITY FEED */}
             <section className="lg:col-span-2 bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-5 lg:p-6">
              <h3 className="text-lg font-bold text-navy dark:text-white mb-4">
                Recent Activity
              </h3>
               <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100 dark:bg-white/10" />
                <div className="space-y-4">
                  {activityFeed.map((activity) => (
                     <div key={activity.id} className="relative pl-10">
                      <div
                        className={cn(
                          "absolute left-2 w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center",
                          activity.type === "submission" && "bg-teal",
                          activity.type === "payment" && "bg-green-500",
                          activity.type === "application" && "bg-royal-blue",
                          activity.type === "reminder" && "bg-gold",
                        )}
                      >
                        {activity.type === "submission" && (
                          <CheckCircle size={10} className="text-white" />
                        )}
                        {activity.type === "payment" && (
                          <CreditCard size={10} className="text-white" />
                        )}
                        {activity.type === "application" && (
                          <User size={10} className="text-white" />
                        )}
                        {activity.type === "reminder" && (
                          <AlertCircle size={10} className="text-white" />
                        )}
                      </div>
                       <div className="bg-slate-50 dark:bg-white/5 rounded-lg p-3">
                        <p className="text-sm text-navy dark:text-white">{activity.action}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-royal-blue font-medium">
                            {activity.project}
                          </span>
                          <span className="text-xs text-slate-400">
                            {activity.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClientDashboard;
