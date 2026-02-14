import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Home,
  Folder,
  PlusCircle,
  Search,
  Mail,
  CreditCard,
  Star,
  Settings,
  Bell,
  ChevronDown,
  LogOut,
  User,
  ArrowRight,
  Clock,
  MessageSquare,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Sparkles,
  X,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

// Sidebar Navigation Items
const sidebarNavItems = [
  { icon: Home, label: "Dashboard", href: "/client/dashboard", active: true },
  { icon: Folder, label: "My Projects", href: "/client/projects", badge: null },
  {
    icon: PlusCircle,
    label: "Post Project",
    href: "/client/post-project",
    badge: null,
  },
  {
    icon: Search,
    label: "Find Freelancers",
    href: "/freelancers",
    badge: null,
  },
  { icon: Mail, label: "Messages", href: "/client/messages", badge: "3" },
  {
    icon: CreditCard,
    label: "Payments",
    href: "/client/payments",
    badge: null,
  },
  { icon: Star, label: "Reviews", href: "/client/reviews", badge: null },
  { icon: Settings, label: "Settings", href: "/client/settings", badge: null },
];

// Mock Data
const statsData = [
  {
    label: "Active Projects",
    value: "2",
    icon: Folder,
    color: "bg-royal-blue",
    change: "+1 this month",
  },
  {
    label: "Completed Projects",
    value: "15",
    icon: CheckCircle,
    color: "bg-teal",
    change: "+3 this month",
  },
  {
    label: "Total Spent",
    value: "₹45,000",
    icon: CreditCard,
    color: "bg-navy",
    change: "₹12,000 this month",
  },
  {
    label: "Pending Reviews",
    value: "3",
    icon: Star,
    color: "bg-gold",
    change: "Leave feedback",
  },
];

const activeProjects = [
  {
    id: 1,
    name: "E-commerce Product Video",
    status: "In Progress",
    freelancer: { name: "Arun Kumar", avatar: "AK" },
    progress: 65,
    deadline: "5 days",
    budget: "₹15,000",
  },
  {
    id: 2,
    name: "Corporate Explainer Animation",
    status: "In Review",
    freelancer: { name: "Priya Sharma", avatar: "PS" },
    progress: 90,
    deadline: "2 days",
    budget: "₹25,000",
  },
  {
    id: 3,
    name: "Social Media Ad Creatives",
    status: "Just Started",
    freelancer: { name: "Vikram R.", avatar: "VR" },
    progress: 20,
    deadline: "10 days",
    budget: "₹8,000",
  },
];

const recentApplications = [
  {
    id: 1,
    freelancer: { name: "Meera Reddy", avatar: "MR", title: "Video Editor" },
    project: "YouTube Channel Intro",
    appliedDate: "2 hours ago",
    status: "Pending",
  },
  {
    id: 2,
    freelancer: { name: "Karthik S.", avatar: "KS", title: "3D Designer" },
    project: "Product 3D Renders",
    appliedDate: "5 hours ago",
    status: "Shortlisted",
  },
  {
    id: 3,
    freelancer: { name: "Lakshmi P.", avatar: "LP", title: "Motion Designer" },
    project: "App Promo Video",
    appliedDate: "1 day ago",
    status: "Pending",
  },
];

const recommendedFreelancers = [
  {
    id: 1,
    name: "Rahul Verma",
    avatar: "RV",
    title: "Senior VFX Artist",
    skills: ["After Effects", "Nuke", "Houdini"],
    rating: 4.9,
    reviews: 127,
  },
  {
    id: 2,
    name: "Ananya Singh",
    avatar: "AS",
    title: "Motion Graphics Expert",
    skills: ["Cinema 4D", "After Effects"],
    rating: 4.8,
    reviews: 89,
  },
  {
    id: 3,
    name: "Dev Patel",
    avatar: "DP",
    title: "Video Editor",
    skills: ["Premiere Pro", "DaVinci"],
    rating: 5.0,
    reviews: 156,
  },
];

const recentMessages = [
  {
    id: 1,
    name: "Arun Kumar",
    avatar: "AK",
    message: "I've uploaded the first draft for your review...",
    time: "5 min ago",
    unread: true,
  },
  {
    id: 2,
    name: "Priya Sharma",
    avatar: "PS",
    message: "The revisions are complete. Please check!",
    time: "1 hour ago",
    unread: true,
  },
  {
    id: 3,
    name: "Vikram R.",
    avatar: "VR",
    message: "Started working on the project today.",
    time: "3 hours ago",
    unread: false,
  },
];

const activityFeed = [
  {
    id: 1,
    action: "Arun Kumar submitted first draft",
    project: "E-commerce Video",
    time: "30 min ago",
    type: "submission",
  },
  {
    id: 2,
    action: "You approved milestone payment",
    project: "Corporate Animation",
    time: "2 hours ago",
    type: "payment",
  },
  {
    id: 3,
    action: "New application received",
    project: "YouTube Intro",
    time: "4 hours ago",
    type: "application",
  },
  {
    id: 4,
    action: "Project deadline reminder",
    project: "Social Media Ads",
    time: "Yesterday",
    type: "reminder",
  },
];

const ClientDashboard = () => {
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

  const clientName = "Rajesh";

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

          {/* User Profile Card */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-royal-blue to-teal flex items-center justify-center text-white font-bold text-sm">
                RK
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  Rajesh Kumar
                </p>
                <p className="text-xs text-white/50">Client Account</p>
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
                  Welcome back, {clientName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-4">
              {/* Search */}
              <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg hidden sm:flex">
                <Search size={20} />
              </button>

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
                      <p className="text-sm text-slate-500">
                        rajesh@company.com
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
                  Welcome back, {clientName}! 👋
                </h2>
                <p className="text-white/80">
                  You have{" "}
                  <span className="text-teal-light font-semibold">
                    2 active projects
                  </span>{" "}
                  and{" "}
                  <span className="text-gold font-semibold">
                    3 new applications
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
                <Link to="/freelancers">
                  <Button
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
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
                  <TrendingUp size={16} className="text-green-500" />
                </div>
                <p className="text-2xl lg:text-3xl font-bold text-navy mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="text-xs text-slate-400 mt-2">{stat.change}</p>
              </div>
            ))}
          </section>

          {/* ACTIVE PROJECTS */}
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between p-5 lg:p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-navy">Active Projects</h3>
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
                  className="p-4 rounded-xl border border-slate-100 hover:border-teal/30 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-navy text-sm">
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
                    <span className="text-sm text-slate-600">
                      {project.freelancer.name}
                    </span>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500">Progress</span>
                      <span className="font-semibold text-navy">
                        {project.progress}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal to-teal-light rounded-full transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock size={12} />
                      Due in {project.deadline}
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
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-5 lg:p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-navy">
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
                  <tr className="bg-slate-50 text-left">
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                      Freelancer
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                      Project
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
                  {recentApplications.map((app) => (
                    <tr
                      key={app.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal to-royal-blue flex items-center justify-center text-white text-xs font-bold">
                            {app.freelancer.avatar}
                          </div>
                          <div>
                            <p className="font-medium text-navy text-sm">
                              {app.freelancer.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {app.freelancer.title}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {app.project}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {app.appliedDate}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-semibold",
                            app.status === "Pending" && "bg-gold/10 text-gold",
                            app.status === "Shortlisted" &&
                              "bg-teal/10 text-teal",
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
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-xs text-teal"
                          >
                            <MessageSquare size={14} />
                          </Button>
                          <Button
                            size="sm"
                            className="h-8 px-3 text-xs bg-teal hover:bg-teal-light text-white"
                          >
                            Hire
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
            <section className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between p-5 lg:p-6 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-gold" />
                  <h3 className="text-lg font-bold text-navy">
                    Recommended for You
                  </h3>
                </div>
                <Link
                  to="/freelancers"
                  className="text-sm text-teal font-medium hover:underline flex items-center gap-1"
                >
                  View All <ArrowRight size={14} />
                </Link>
              </div>
              <div className="p-5 lg:p-6 flex gap-4 overflow-x-auto pb-4">
                {recommendedFreelancers.map((freelancer) => (
                  <div
                    key={freelancer.id}
                    className="min-w-[260px] p-4 rounded-xl border border-slate-100 hover:border-teal/30 hover:shadow-md transition-all flex-shrink-0"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal to-royal-blue flex items-center justify-center text-white font-bold">
                        {freelancer.avatar}
                      </div>
                      <div>
                        <h4 className="font-semibold text-navy">
                          {freelancer.name}
                        </h4>
                        <p className="text-sm text-slate-500">
                          {freelancer.title}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {freelancer.skills.slice(0, 2).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 bg-slate-100 rounded-md text-xs font-medium text-slate-600"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-end pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-gold fill-gold" />
                        <span className="text-sm font-semibold text-navy">
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
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <h3 className="text-lg font-bold text-navy">Recent Messages</h3>
                <Link
                  to="/client/messages"
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
                <Link to="/client/messages">
                  <Button
                    variant="outline"
                    className="w-full border-slate-200 text-slate-600 hover:bg-slate-50"
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
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 lg:p-6">
              <h3 className="text-lg font-bold text-navy mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link
                  to="/client/post-project"
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-teal hover:bg-teal/5 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center text-teal group-hover:bg-teal group-hover:text-white transition-colors">
                    <PlusCircle size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-navy text-sm">
                      Post New Project
                    </p>
                    <p className="text-xs text-slate-500">
                      Create a new job listing
                    </p>
                  </div>
                  <ArrowRight
                    size={16}
                    className="ml-auto text-slate-300 group-hover:text-teal"
                  />
                </Link>
                <Link
                  to="/freelancers"
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-royal-blue hover:bg-royal-blue/5 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-royal-blue/10 flex items-center justify-center text-royal-blue group-hover:bg-royal-blue group-hover:text-white transition-colors">
                    <Search size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-navy text-sm">
                      Browse Freelancers
                    </p>
                    <p className="text-xs text-slate-500">
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
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-gold hover:bg-gold/5 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-colors">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-navy text-sm">
                      Get Support
                    </p>
                    <p className="text-xs text-slate-500">We're here to help</p>
                  </div>
                  <ArrowRight
                    size={16}
                    className="ml-auto text-slate-300 group-hover:text-gold"
                  />
                </Link>
              </div>
            </section>

            {/* ACTIVITY FEED */}
            <section className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 lg:p-6">
              <h3 className="text-lg font-bold text-navy mb-4">
                Recent Activity
              </h3>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100" />
                <div className="space-y-4">
                  {activityFeed.map((activity) => (
                    <div key={activity.id} className="relative pl-10">
                      <div
                        className={cn(
                          "absolute left-2 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center",
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
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-sm text-navy">{activity.action}</p>
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
