import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Home,
  User,
  FolderOpen,
  Search,
  FileText,
  Mail,
  CreditCard,
  DollarSign,
  Star,
  Settings,
  LogOut,
  X,
  Menu,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Award,
  Calendar,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Sidebar Navigation Items for Freelancer
const sidebarNavItems = [
  {
    icon: Home,
    label: "Dashboard",
    href: "/freelancer/dashboard",
    active: false,
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
    active: true,
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

// Mock applications data
const applicationsData = [
  {
    id: 1,
    projectTitle: "E-commerce Product Video",
    client: "TechMart Solutions",
    appliedDate: "Dec 18, 2024",
    budget: { min: 15000, max: 25000 },
    status: "pending",
    proposedRate: 22000,
    coverLetter: "I have extensive experience in product videography...",
    deadline: "5 days",
  },
  {
    id: 2,
    projectTitle: "Corporate Explainer Animation",
    client: "InnovateCorp",
    appliedDate: "Dec 15, 2024",
    budget: { min: 30000, max: 45000 },
    status: "accepted",
    proposedRate: 40000,
    coverLetter: "As a motion graphics specialist with 5 years...",
    deadline: "2 weeks",
  },
  {
    id: 3,
    projectTitle: "YouTube Channel Intro",
    client: "TechReview Pro",
    appliedDate: "Dec 14, 2024",
    budget: { min: 5000, max: 10000 },
    status: "pending",
    proposedRate: 8000,
    coverLetter: "I create dynamic intros that capture attention...",
    deadline: "7 days",
  },
  {
    id: 4,
    projectTitle: "Wedding Highlight Reel",
    client: "Moments Photography",
    appliedDate: "Dec 10, 2024",
    budget: { min: 20000, max: 35000 },
    status: "rejected",
    proposedRate: 30000,
    coverLetter: "I specialize in cinematic wedding videos...",
    deadline: "14 days",
  },
  {
    id: 5,
    projectTitle: "Social Media Ad Campaign",
    client: "Brand Boost Agency",
    appliedDate: "Dec 8, 2024",
    budget: { min: 8000, max: 15000 },
    status: "withdrawn",
    proposedRate: 12000,
    coverLetter: "I have created numerous successful ad campaigns...",
    deadline: "10 days",
  },
];

const statusTabs = [
  { id: "all", label: "All", count: applicationsData.length },
  {
    id: "pending",
    label: "Pending",
    count: applicationsData.filter((a) => a.status === "pending").length,
  },
  {
    id: "accepted",
    label: "Accepted",
    count: applicationsData.filter((a) => a.status === "accepted").length,
  },
  {
    id: "rejected",
    label: "Rejected",
    count: applicationsData.filter((a) => a.status === "rejected").length,
  },
];

const FreelancerApplications = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [subscriptionPlan] = useState<"Pro" | "Free">("Pro");

  const filteredApplications =
    activeTab === "all"
      ? applicationsData
      : applicationsData.filter((app) => app.status === activeTab);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "pending":
        return { bg: "bg-gold/10", text: "text-gold", icon: Clock };
      case "accepted":
        return {
          bg: "bg-success-green/10",
          text: "text-success-green",
          icon: CheckCircle,
        };
      case "rejected":
        return { bg: "bg-red-100", text: "text-red-500", icon: XCircle };
      case "withdrawn":
        return {
          bg: "bg-slate-100",
          text: "text-slate-500",
          icon: AlertCircle,
        };
      default:
        return {
          bg: "bg-slate-100",
          text: "text-slate-500",
          icon: AlertCircle,
        };
    }
  };

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

          {/* Subscription Badge */}
          <div className="px-4 pb-2">
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg",
                subscriptionPlan === "Free" ? "bg-slate-500/20" : "bg-gold/20",
              )}
            >
              <Award
                size={16}
                className={
                  subscriptionPlan === "Free" ? "text-slate-400" : "text-gold"
                }
              />
              <span
                className={cn(
                  "text-xs font-semibold",
                  subscriptionPlan === "Free" ? "text-slate-400" : "text-gold",
                )}
              >
                {subscriptionPlan} Plan
              </span>
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
              <button className="text-white/50 hover:text-white transition-colors">
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
                  My Applications
                </h1>
                <p className="text-sm text-slate-500 hidden sm:block">
                  Track and manage your project applications
                </p>
              </div>
            </div>

            <Link to="/projects">
              <Button className="bg-teal hover:bg-teal-light text-white">
                <Search size={18} className="mr-2" />
                Browse Projects
              </Button>
            </Link>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-4 lg:p-8 space-y-6">
          {/* Status Tabs */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
            <div className="flex overflow-x-auto scrollbar-hide">
              {statusTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-all",
                    activeTab === tab.id
                      ? "border-teal text-teal"
                      : "border-transparent text-slate-500 hover:text-navy hover:border-slate-200",
                  )}
                >
                  {tab.label}
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
                </button>
              ))}
            </div>
          </div>

          {/* Applications List */}
          <div className="space-y-4">
            {filteredApplications.map((application) => {
              const statusStyle = getStatusStyles(application.status);
              const StatusIcon = statusStyle.icon;

              return (
                <div
                  key={application.id}
                  className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                          <Briefcase size={20} className="text-slate-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-navy">
                              {application.projectTitle}
                            </h3>
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                                statusStyle.bg,
                                statusStyle.text,
                              )}
                            >
                              <StatusIcon size={12} />
                              {application.status}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 mt-1">
                            {application.client}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              Applied: {application.appliedDate}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              Deadline: {application.deadline}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Your Bid</p>
                        <p className="text-lg font-bold text-navy">
                          ₹{application.proposedRate.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-400">
                          Budget: ₹{application.budget.min.toLocaleString()} - ₹
                          {application.budget.max.toLocaleString()}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-200"
                        >
                          <ExternalLink size={14} className="mr-1" />
                          View
                        </Button>
                        {application.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-200 text-red-500 hover:bg-red-50"
                          >
                            Withdraw
                          </Button>
                        )}
                        {application.status === "accepted" && (
                          <Link to="/freelancer/messages">
                            <Button
                              size="sm"
                              className="bg-teal hover:bg-teal-light text-white"
                            >
                              <Mail size={14} className="mr-1" />
                              Message
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredApplications.length === 0 && (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-navy mb-2">
                No applications found
              </h3>
              <p className="text-slate-500 mb-4">
                Start applying to projects to see them here
              </p>
              <Link to="/projects">
                <Button className="bg-teal hover:bg-teal-light text-white">
                  <Search size={18} className="mr-2" />
                  Browse Projects
                </Button>
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default FreelancerApplications;
