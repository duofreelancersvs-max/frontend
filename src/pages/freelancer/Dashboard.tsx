import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Home,
  User,
  Briefcase,
  Search,
  FileText,
  Mail,
  CreditCard,
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
  X,
  Menu,
  Eye,
  DollarSign,
  MessageSquare,
  FolderOpen,
  Award,
  Zap,
  Plus,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

// Sidebar Navigation Items for Freelancer
const sidebarNavItems = [
  {
    icon: Home,
    label: "Dashboard",
    href: "/freelancer/dashboard",
    active: true,
  },
  { icon: User, label: "My Profile", href: "/freelancer/profile", badge: null },
  {
    icon: FolderOpen,
    label: "Portfolio",
    href: "/freelancer/portfolio",
    badge: null,
  },
  { icon: Search, label: "Browse Projects", href: "/projects", badge: null },
  {
    icon: FileText,
    label: "My Applications",
    href: "/freelancer/applications",
    badge: "3",
  },
  { icon: Mail, label: "Messages", href: "/freelancer/messages", badge: "5" },
  {
    icon: CreditCard,
    label: "Subscription",
    href: "/freelancer/subscription",
    badge: null,
  },
  {
    icon: DollarSign,
    label: "Earnings",
    href: "/freelancer/earnings",
    badge: null,
  },
  { icon: Star, label: "Reviews", href: "/freelancer/reviews", badge: null },
  {
    icon: Settings,
    label: "Settings",
    href: "/freelancer/settings",
    badge: null,
  },
];

// Mock Data
const statsData = [
  {
    label: "Profile Views",
    value: "45",
    icon: Eye,
    color: "bg-royal-blue",
    change: "+12 this week",
    trend: "up",
  },
  {
    label: "Active Applications",
    value: "3",
    icon: FileText,
    color: "bg-teal",
    change: "2 pending",
    trend: "neutral",
  },
  {
    label: "Total Earnings",
    value: "₹25,000",
    icon: DollarSign,
    color: "bg-success-green",
    change: "+₹8,000 this month",
    trend: "up",
  },
  {
    label: "New Messages",
    value: "5",
    icon: MessageSquare,
    color: "bg-gold",
    change: "3 unread",
    trend: "neutral",
  },
];

const profileCompletionItems = [
  { label: "Add profile photo", completed: true },
  { label: "Write bio description", completed: true },
  { label: "Add portfolio items", completed: false },
  { label: "Verify phone number", completed: true },
  { label: "Add skills", completed: true },
  { label: "Set hourly rate", completed: false },
  { label: "Upload ID verification", completed: false },
];

const recommendedProjects = [
  {
    id: 1,
    title: "E-commerce Product Video Editing",
    client: { name: "TechMart Solutions", rating: 4.8 },
    budget: "₹15,000 - ₹20,000",
    skillsMatch: 92,
    postedTime: "2 hours ago",
    skills: ["Premiere Pro", "After Effects", "Color Grading"],
  },
  {
    id: 2,
    title: "Corporate Explainer Animation",
    client: { name: "InnovateCorp", rating: 4.9 },
    budget: "₹25,000 - ₹35,000",
    skillsMatch: 88,
    postedTime: "5 hours ago",
    skills: ["After Effects", "Motion Graphics", "2D Animation"],
  },
  {
    id: 3,
    title: "Social Media Ad Creatives",
    client: { name: "Brand Boost Agency", rating: 4.7 },
    budget: "₹8,000 - ₹12,000",
    skillsMatch: 85,
    postedTime: "1 day ago",
    skills: ["Premiere Pro", "Photoshop", "Video Editing"],
  },
];

const applicationStatuses = [
  {
    id: 1,
    project: "YouTube Channel Intro Animation",
    client: "Creative Studios",
    appliedDate: "Jan 28, 2026",
    status: "Shortlisted",
    budget: "₹10,000",
  },
  {
    id: 2,
    project: "Product Launch Video",
    client: "StartupXYZ",
    appliedDate: "Jan 27, 2026",
    status: "Pending",
    budget: "₹18,000",
  },
  {
    id: 3,
    project: "Event Highlight Reel",
    client: "EventPro",
    appliedDate: "Jan 25, 2026",
    status: "Viewed",
    budget: "₹12,000",
  },
  {
    id: 4,
    project: "Training Video Series",
    client: "EduTech Inc",
    appliedDate: "Jan 20, 2026",
    status: "Hired",
    budget: "₹45,000",
  },
];

const recentMessages = [
  {
    id: 1,
    name: "Rajesh Kumar",
    avatar: "RK",
    message: "Hi! I reviewed your portfolio and would like to discuss...",
    time: "10 min ago",
    unread: true,
  },
  {
    id: 2,
    name: "Priya Sharma",
    avatar: "PS",
    message: "Thank you for applying! Can you share more samples?",
    time: "1 hour ago",
    unread: true,
  },
  {
    id: 3,
    name: "TechMart Solutions",
    avatar: "TS",
    message: "Your application has been reviewed positively.",
    time: "3 hours ago",
    unread: false,
  },
];

const earningsData = [
  { month: "Aug", amount: 12000 },
  { month: "Sep", amount: 18000 },
  { month: "Oct", amount: 15000 },
  { month: "Nov", amount: 22000 },
  { month: "Dec", amount: 19000 },
  { month: "Jan", amount: 25000 },
];

const getStatusBadgeStyle = (status: string) => {
  switch (status) {
    case "Pending":
      return "bg-gold/10 text-gold";
    case "Viewed":
      return "bg-royal-blue/10 text-royal-blue";
    case "Shortlisted":
      return "bg-teal/10 text-teal";
    case "Hired":
      return "bg-success-green/10 text-success-green";
    case "Rejected":
      return "bg-red-100 text-red-600";
    default:
      return "bg-slate-100 text-slate-600";
  }
};

const FreelancerDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const freelancerName = "Arun";
  const profileCompletion = 85;
  const subscriptionPlan = "Free";
  const subscriptionExpiry = null;

  // Get time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const maxEarning = Math.max(...earningsData.map((d) => d.amount));

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* SIDEBAR */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 bg-navy transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal to-teal-light flex items-center justify-center text-white font-bold text-lg">
              C
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white tracking-tight">
                ConnectMe
              </span>
              <span className="text-[10px] font-semibold tracking-widest uppercase -mt-1 text-teal-light">
                India
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden ml-auto text-white/60 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {sidebarNavItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  item.active
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white",
                )}
              >
                <item.icon size={20} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-teal text-white rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Profile Completeness Indicator */}
          <div className="px-4 py-4 border-t border-white/10">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-white/70">
                  Profile Complete
                </span>
                <span className="text-sm font-bold text-teal-light">
                  {profileCompletion}%
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal to-teal-light rounded-full transition-all"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
            </div>
          </div>

          {/* Subscription Badge */}
          <div className="px-4 pb-2">
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg",
                subscriptionPlan === "Free"
                  ? "bg-slate-500/20"
                  : subscriptionPlan === "Pro"
                    ? "bg-royal-blue/20"
                    : "bg-gold/20",
              )}
            >
              <Award
                size={16}
                className={cn(
                  subscriptionPlan === "Free"
                    ? "text-slate-400"
                    : subscriptionPlan === "Pro"
                      ? "text-royal-blue"
                      : "text-gold",
                )}
              />
              <span
                className={cn(
                  "text-xs font-semibold",
                  subscriptionPlan === "Free"
                    ? "text-slate-400"
                    : subscriptionPlan === "Pro"
                      ? "text-royal-blue"
                      : "text-gold",
                )}
              >
                {subscriptionPlan} Plan
              </span>
              {subscriptionPlan === "Free" && (
                <Link
                  to="/freelancer/subscription"
                  className="ml-auto text-xs text-teal-light hover:underline"
                >
                  Upgrade
                </Link>
              )}
            </div>
          </div>

          {/* User Profile Card */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-royal-blue to-teal flex items-center justify-center text-white font-bold text-sm">
                AK
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  Arun Kumar
                </p>
                <p className="text-xs text-white/50">Freelancer</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-white/50 hover:text-white transition-colors"
                title="Log Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* SIDEBAR OVERLAY (Mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* MAIN CONTENT */}
      <div className="lg:ml-64">
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
                    AK
                  </div>
                  <ChevronDown
                    size={16}
                    className="text-slate-500 hidden sm:block"
                  />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="font-semibold text-navy">Arun Kumar</p>
                      <p className="text-sm text-slate-500">arun@email.com</p>
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
                      className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
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
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {profileCompletionItems.map((item, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-colors",
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
              {recommendedProjects.map((project) => (
                <div
                  key={project.id}
                  className="p-4 rounded-xl border border-slate-100 hover:border-teal/30 hover:shadow-md transition-all"
                >
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
                    subscriptionPlan === "Free"
                      ? "bg-slate-100"
                      : subscriptionPlan === "Pro"
                        ? "bg-royal-blue/10"
                        : "bg-gold/10",
                  )}
                >
                  <Award
                    size={28}
                    className={cn(
                      subscriptionPlan === "Free"
                        ? "text-slate-500"
                        : subscriptionPlan === "Pro"
                          ? "text-royal-blue"
                          : "text-gold",
                    )}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-navy">
                    {subscriptionPlan} Plan
                  </h3>
                  <p className="text-sm text-slate-500">
                    {subscriptionPlan === "Free"
                      ? "Limited features - Upgrade to unlock more"
                      : subscriptionExpiry
                        ? `Expires on ${subscriptionExpiry}`
                        : "Active subscription"}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                {subscriptionPlan === "Free" ? (
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
