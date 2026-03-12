import { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  User,
  Briefcase,
  Search,
  FileText,
  Star,
  Settings,
  Bell,
  ChevronDown,
  LogOut,
  ArrowRight,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Menu,
  Eye,
  DollarSign,
  MessageSquare,
  Award,
  Zap,
  Plus,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import {
  freelancerService,
  applicationService,
  projectService,
  subscriptionService,
  conversationService,
} from "@/services";
import type {
  FreelancerProfile,
  Application,
  Project,
  Subscription,
  Conversation,
} from "@/services";
import type { FreelancerLayoutContext } from "@/layouts/FreelancerLayout";
import { useUnreadStore } from "@/stores/unread.store";
import { getCategoryStyle } from "@/lib/category-styles";

const getStatusBadgeStyle = (status: string) => {
  switch (status) {
    case "pending":
    case "Pending":
      return "bg-gold/10 text-gold";
    case "accepted":
    case "Shortlisted":
      return "bg-teal/10 text-teal";
    case "rejected":
    case "Rejected":
      return "bg-red-100 text-red-600";
    case "withdrawn":
      return "bg-slate-100 text-slate-600";
    default:
      return "bg-royal-blue/10 text-royal-blue";
  }
};

const FreelancerDashboard = () => {
  const totalUnreadCount = useUnreadStore((s) => s.totalUnreadCount);
  const { setSidebarOpen } = useOutletContext<FreelancerLayoutContext>();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [recommendedProjects, setRecommendedProjects] = useState<Project[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const { logout, user } = useAuth();
  const freelancerName = user?.email?.split("@")[0] || "Freelancer";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          profileData,
          appsData,
          projectsData,
          subData,
          convData,
        ] = await Promise.allSettled([
          freelancerService.getMyProfile().catch(() => null),
          applicationService
            .getMyApplications()
            .then((r) => r.applications)
            .catch(() => []),
          projectService
            .search({ status: "open", limit: 3 })
            .then((r) => r.projects)
            .catch(() => []),
          subscriptionService.getMySubscription().catch(() => null),
          conversationService
            .getAll()
            .then((r) => r.conversations)
            .catch(() => []),
        ]);

        if (profileData.status === "fulfilled") setProfile(profileData.value);
        if (appsData.status === "fulfilled") setApplications(appsData.value);
        if (projectsData.status === "fulfilled")
          setRecommendedProjects(projectsData.value);
        if (subData.status === "fulfilled") setSubscription(subData.value);
        if (convData.status === "fulfilled") setConversations(convData.value);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const profileCompletion = profile
    ? Math.round(
        (!!profile.title ? 10 : 0) +
          (!!profile.bio ? 10 : 0) +
          ((profile.portfolio?.length || 0) > 0 ? 15 : 0) +
          (!!profile.hourlyRate ? 15 : 0) +
          ((profile.skills?.length || 0) > 0 ? 15 : 0) +
          // @ts-expect-error type missing
          ((profile.experience?.length || 0) > 0 ? 15 : 0) +
          ((profile.education?.length || 0) > 0 ? 10 : 0) +
          (profile.availability ? 10 : 0),
      )
    : 0;

  const subscriptionPlan = subscription?.plan || "free";
  const unreadMessages = conversations.reduce(
    (acc, c) => acc + c.unreadCount,
    0,
  );
  const pendingApplications = applications.filter(
    (a) => a.status === "pending",
  ).length;
  const totalEarnings = profile?.completedProjects
    ? profile.completedProjects * (profile.hourlyRate || 0) * 10
    : 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const statsData = [
    {
      label: "Profile Views",
      value: String(profile?.totalReviews || 0),
      icon: Eye,
      color: "bg-royal-blue",
      change: "+12 this week",
      trend: "up" as const,
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
      label: "Total Earnings",
      value: `₹${(totalEarnings || 25000).toLocaleString()}`,
      icon: DollarSign,
      color: "bg-success-green",
      change: "+₹8,000 this month",
      trend: "up" as const,
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
    { label: "Set hourly rate", completed: !!profile?.hourlyRate },
    {
      label: "Add work experience",
      // @ts-expect-error type missing
      completed: (profile?.experience?.length || 0) > 0,
    },
    {
      label: "Add education",
      completed: (profile?.education?.length || 0) > 0,
    },
  ];

  const applicationStatuses = applications.slice(0, 5).map((app) => ({
    id: app.id,
    project: app.project?.title || "Untitled Project",
    client: app.freelancer?.fullName || "Unknown Client",
    appliedDate: new Date(app.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    status: app.status.charAt(0).toUpperCase() + app.status.slice(1),
    budget: app.project
      ? `₹${app.project.budget.minAmount?.toLocaleString() || 0} - ₹${app.project.budget.maxAmount?.toLocaleString() || 0}`
      : "N/A",
  }));

  const recommendedProjectsData = recommendedProjects.map((project) => ({
    id: project.id,
    title: project.title,
    client: { name: project.client?.fullName || "Unknown Client", rating: 4.5 },
    budget: `₹${project.budget.minAmount?.toLocaleString() || 0} - ₹${project.budget.maxAmount?.toLocaleString() || 0}`,
    skillsMatch: 85,
    postedTime: new Date(project.createdAt).toLocaleDateString("en-US", {
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    skills: project.skills || [],
  }));

  const recentMessages = conversations.slice(0, 3).map((conv) => ({
    id: conv.id,
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

  const earningsData = [
    { month: "Aug", amount: 12000 },
    { month: "Sep", amount: 18000 },
    { month: "Oct", amount: 15000 },
    { month: "Nov", amount: 22000 },
    { month: "Dec", amount: 19000 },
    { month: "Jan", amount: 25000 },
  ];

  const maxEarning = Math.max(...earningsData.map((d) => d.amount));

  if (loading) {
    return (
      <div className="w-full bg-slate-50 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50">
      <div className="w-full">
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
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-navy">
                  Dashboard
                </h1>
                <p className="text-sm text-slate-500 hidden sm:block">
                  Welcome back, {freelancerName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-4">
              {/* Notifications */}
              
              <Link to="/freelancer/messages" className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
                <MessageSquare size={20} />
                {totalUnreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-teal rounded-full" />
                )}
              </Link>
              <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {/* Profile Dropdown */}
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
                        {user?.fullName || user?.email?.split("@")[0] || "Freelancer"}
                      </p>
                      <p className="text-sm text-slate-500 truncate">
                        {user?.email}
                      </p>
                    </div>
                    <Link
                      to="/freelancer/profile"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      <User size={16} />
                      My Profile
                    </Link>
                    <Link
                      to="/freelancer/settings"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      <Settings size={16} />
                      Settings
                    </Link>
                    <hr className="my-2 border-slate-100" />
                    <button
                      onClick={handleLogout}
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
        <main className="p-4 lg:p-8 space-y-6 lg:space-y-8">
          {/* WELCOME BANNER */}
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-navy via-[#0f2445] to-royal-blue p-6 lg:p-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal/20 rounded-full blur-[80px] translate-x-1/3 -translate-y-1/2" />
            <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-royal-blue/30 rounded-full blur-[60px]" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
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
              <div className="flex flex-wrap gap-3">
                <Link to="/freelancer/profile">
                  <Button className="bg-white text-navy hover:bg-slate-100 font-semibold">
                    <User size={18} className="mr-2" />
                    Complete Profile
                  </Button>
                </Link>
                <Link to="/projects">
                  <Button
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    <Search size={18} className="mr-2" />
                    Browse Projects
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
                className="bg-white rounded-2xl p-5 lg:p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
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
                <p className="text-2xl lg:text-3xl font-bold text-navy mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="text-xs text-slate-400 mt-2">{stat.change}</p>
              </div>
            ))}
          </section>

          {/* PROFILE COMPLETENESS */}
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-navy">
                Complete Your Profile
              </h3>
              <span className="text-sm font-semibold text-teal">
                {profileCompletion}%
              </span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-6">
              <div
                className="h-full bg-gradient-to-r from-teal to-teal-light rounded-full transition-all"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {profileCompletionItems.map((item, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-lg border transition-colors",
                    item.completed
                      ? "bg-slate-50 border-slate-100"
                      : "bg-gold/5 border-gold/20 hover:border-gold/40 cursor-pointer",
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
                        ? "text-slate-500 line-through"
                        : "text-navy font-medium",
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
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between p-5 lg:p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-navy">
                Projects Matching Your Skills
              </h3>
              <Link
                to="/projects"
                className="text-sm text-teal font-medium hover:underline flex items-center gap-1"
              >
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="p-5 lg:p-6 grid gap-4 lg:grid-cols-3">
              {recommendedProjectsData.map((project) => (
                <div
                  key={project.id}
                  className="group relative p-4 pt-6 rounded-xl border border-slate-100 hover:border-teal/30 hover:shadow-md transition-all overflow-hidden"
                >
                  <div className={cn(
                    "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r transition-all",
                    getCategoryStyle(project.skills[0] || "Default").gradient
                  )} />
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-navy text-sm line-clamp-2">
                      {project.title}
                    </h4>
                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-success-green/10 text-success-green shrink-0 ml-2">
                      {project.skillsMatch}% match
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 text-xs font-bold">
                      {project.client.name.charAt(0)}
                    </div>
                    <span className="text-sm text-slate-600">
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
                    {project.skills.slice(0, 2).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-slate-100 rounded-md text-xs font-medium text-slate-600"
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

                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-navy">
                        {project.budget}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock size={12} />
                        {project.postedTime}
                      </div>
                    </div>
                    <Button className="w-full bg-royal-blue hover:bg-royal-blue-hover text-white text-sm">
                      Apply Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* APPLICATION STATUS */}
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-5 lg:p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-navy">Your Applications</h3>
              <Link
                to="/freelancer/applications"
                className="text-sm text-teal font-medium hover:underline flex items-center gap-1"
              >
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                      Project
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                      Client
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                      Budget
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                      Applied
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applicationStatuses.map((app) => (
                    <tr
                      key={app.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-navy text-sm">
                          {app.project}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {app.client}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-navy">
                        {app.budget}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {app.appliedDate}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-semibold",
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
                          className="h-8 px-3 text-xs text-royal-blue hover:bg-royal-blue/10"
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
          </section>

          {/* TWO COLUMN LAYOUT */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* LEFT - EARNINGS SUMMARY */}
            <section className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between p-5 lg:p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-navy">
                  Earnings Overview
                </h3>
                <Link
                  to="/freelancer/earnings"
                  className="text-sm text-teal font-medium hover:underline flex items-center gap-1"
                >
                  View Details <ArrowRight size={14} />
                </Link>
              </div>
              <div className="p-5 lg:p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">This Month</p>
                    <p className="text-3xl font-bold text-navy">₹25,000</p>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-success-green/10 rounded-full text-success-green text-sm font-semibold">
                    <TrendingUp size={14} />
                    +32%
                  </div>
                </div>

                {/* Simple Bar Chart */}
                <div className="flex items-end justify-between h-32 gap-2">
                  {earningsData.map((data, idx) => (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center gap-2"
                    >
                      <div
                        className={cn(
                          "w-full rounded-t-lg transition-all",
                          idx === earningsData.length - 1
                            ? "bg-gradient-to-t from-teal to-teal-light"
                            : "bg-slate-200",
                        )}
                        style={{
                          height: `${(data.amount / maxEarning) * 100}%`,
                          minHeight: "8px",
                        }}
                      />
                      <span className="text-xs text-slate-500">
                        {data.month}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* RIGHT - MESSAGES */}
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <h3 className="text-lg font-bold text-navy">New Messages</h3>
                <Link
                  to="/freelancer/messages"
                  className="text-sm text-teal font-medium hover:underline"
                >
                  Go to Inbox
                </Link>
              </div>
              <div className="divide-y divide-slate-100">
                {recentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "p-4 hover:bg-slate-50 cursor-pointer transition-colors",
                      msg.unread && "bg-teal/5",
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
                              msg.unread ? "text-navy" : "text-slate-600",
                            )}
                          >
                            {msg.name}
                          </p>
                          <span className="text-xs text-slate-400">
                            {msg.time}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 truncate">
                          {msg.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4">
                <Link to="/freelancer/messages">
                  <Button
                    variant="outline"
                    className="w-full border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    View All Messages
                  </Button>
                </Link>
              </div>
            </section>
          </div>

          {/* SUBSCRIPTION STATUS */}
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 lg:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center",
                    subscriptionPlan === "free"
                      ? "bg-slate-100"
                      : subscriptionPlan === "pro"
                        ? "bg-royal-blue/10"
                        : "bg-gold/10",
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
                <div>
                  <h3 className="text-lg font-bold text-navy">
                    {subscriptionPlan.charAt(0).toUpperCase() +
                      subscriptionPlan.slice(1)}{" "}
                    Plan
                  </h3>
                  <p className="text-sm text-slate-500">
                    {subscriptionPlan === "free"
                      ? "Limited features - Upgrade to unlock more"
                      : subscription?.endDate
                        ? `Expires on ${new Date(subscription.endDate).toLocaleDateString()}`
                        : "Active subscription"}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                {subscriptionPlan === "free" ? (
                  <Link to="/freelancer/subscription">
                    <Button className="bg-gradient-to-r from-royal-blue to-teal text-white font-semibold">
                      <Zap size={16} className="mr-2" />
                      Upgrade Now
                    </Button>
                  </Link>
                ) : (
                  <Link to="/freelancer/subscription">
                    <Button
                      variant="outline"
                      className="border-royal-blue text-royal-blue"
                    >
                      Manage Subscription
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </section>

          {/* QUICK ACTIONS */}
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 lg:p-6">
            <h3 className="text-lg font-bold text-navy mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Link to="/freelancer/profile">
                <Button
                  variant="outline"
                  className="border-slate-200 hover:border-royal-blue hover:text-royal-blue"
                >
                  <User size={16} className="mr-2" />
                  Update Profile
                </Button>
              </Link>
              <Link to="/freelancer/portfolio">
                <Button
                  variant="outline"
                  className="border-slate-200 hover:border-teal hover:text-teal"
                >
                  <Plus size={16} className="mr-2" />
                  Add Portfolio
                </Button>
              </Link>
              <Link to="/projects">
                <Button
                  variant="outline"
                  className="border-slate-200 hover:border-success-green hover:text-success-green"
                >
                  <Briefcase size={16} className="mr-2" />
                  Browse Projects
                </Button>
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default FreelancerDashboard;
