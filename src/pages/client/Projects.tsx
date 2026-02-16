import { useState, useEffect } from "react";
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
  X,
  Menu,
  MoreVertical,
  Grid3X3,
  List,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Copy,
  Eye,
  CheckCircle,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { projectService } from "@/services";
import type { Project } from "@/services";

// Sidebar Navigation Items
const sidebarNavItems = [
  { icon: Home, label: "Dashboard", href: "/client/dashboard", active: false },
  {
    icon: Folder,
    label: "My Projects",
    href: "/client/projects",
    active: true,
  },
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

// Tabs
const tabs = [
  { id: "all", label: "All", count: null },
  { id: "open", label: "Open", count: 3 },
  { id: "in-progress", label: "In Progress", count: 2 },
  { id: "completed", label: "Completed", count: 15 },
  { id: "drafts", label: "Drafts", count: 1 },
  { id: "cancelled", label: "Cancelled", count: null },
];

// Mock Projects Data
const projectsData = [
  {
    id: 1,
    title: "E-commerce Product Video",
    category: "Video Editing",
    description:
      "Need a professional product video for our new e-commerce store. Must include product shots, lifestyle scenes, and a compelling call-to-action.",
    status: "in-progress",
    budget: { min: 15000, max: 25000 },
    applications: 12,
    deadline: "5 days",
    skills: ["Adobe Premiere Pro", "After Effects", "Color Grading"],
    freelancer: { name: "Arun Kumar", avatar: "AK" },
    createdAt: "2 days ago",
  },
  {
    id: 2,
    title: "Corporate Explainer Animation",
    category: "Motion Graphics",
    description:
      "Looking for an experienced animator to create a 2-minute explainer video for our enterprise software product.",
    status: "in-progress",
    budget: { min: 30000, max: 45000 },
    applications: 8,
    deadline: "2 days",
    skills: ["After Effects", "Cinema 4D", "Illustration"],
    freelancer: { name: "Priya Sharma", avatar: "PS" },
    createdAt: "5 days ago",
  },
  {
    id: 3,
    title: "YouTube Channel Intro",
    category: "Motion Graphics",
    description:
      "Need a catchy 10-second intro for my tech review YouTube channel. Modern, sleek, and professional.",
    status: "open",
    budget: { min: 5000, max: 10000 },
    applications: 24,
    deadline: "7 days",
    skills: ["After Effects", "Motion Graphics"],
    freelancer: null,
    createdAt: "1 day ago",
  },
  {
    id: 4,
    title: "Wedding Highlight Video",
    category: "Video Editing",
    description:
      "Beautiful wedding highlight video from our destination wedding in Goa. Cinematic style with drone footage integration.",
    status: "open",
    budget: { min: 20000, max: 35000 },
    applications: 18,
    deadline: "14 days",
    skills: ["Premiere Pro", "DaVinci Resolve", "Drone Editing"],
    freelancer: null,
    createdAt: "3 days ago",
  },
  {
    id: 5,
    title: "Social Media Ad Creatives",
    category: "Video Editing",
    description:
      "Create 5 short-form video ads for Instagram and Facebook campaigns. Each video 15-30 seconds.",
    status: "open",
    budget: { min: 8000, max: 15000 },
    applications: 31,
    deadline: "10 days",
    skills: ["Premiere Pro", "After Effects"],
    freelancer: null,
    createdAt: "6 hours ago",
  },
  {
    id: 6,
    title: "Product 3D Renders",
    category: "3D Design",
    description:
      "Need photorealistic 3D renders of our new furniture line. 5 products, multiple angles each.",
    status: "completed",
    budget: { min: 40000, max: 60000 },
    applications: 15,
    deadline: "Completed",
    skills: ["Blender", "Cinema 4D", "V-Ray"],
    freelancer: { name: "Vikram R.", avatar: "VR" },
    createdAt: "2 weeks ago",
  },
  {
    id: 7,
    title: "App Promo Video",
    category: "Motion Graphics",
    description:
      "Create an engaging app promo video showcasing our new fitness app features and user interface.",
    status: "completed",
    budget: { min: 25000, max: 40000 },
    applications: 22,
    deadline: "Completed",
    skills: ["After Effects", "Figma", "UI Animation"],
    freelancer: { name: "Meera Reddy", avatar: "MR" },
    createdAt: "3 weeks ago",
  },
  {
    id: 8,
    title: "Brand Identity Animation",
    category: "Motion Graphics",
    description:
      "Animate our new brand identity including logo animation and brand guidelines motion pack.",
    status: "draft",
    budget: { min: 15000, max: 25000 },
    applications: 0,
    deadline: "Not set",
    skills: ["After Effects", "Illustrator"],
    freelancer: null,
    createdAt: "1 week ago",
  },
];

const ClientProjects = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [openMenuId, setOpenMenuId] = useState<string | number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await projectService.getMyClientProjects();
        setProjects(data.projects || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const itemsPerPage = 6;

  // Filter projects based on active tab
  const filteredProjects = projects
    .filter((project) => {
      if (activeTab === "all") return true;
      if (activeTab === "open") return project.status === "open";
      if (activeTab === "in-progress") return project.status === "in-progress";
      if (activeTab === "completed") return project.status === "completed";
      if (activeTab === "drafts") return project.status === "draft";
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
    if (sortBy === "budget-high") return b.budget.max - a.budget.max;
    if (sortBy === "budget-low") return a.budget.min - b.budget.min;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedProjects.length / itemsPerPage);
  const paginatedProjects = sortedProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Format project for display
  const projectsData = paginatedProjects.map(p => ({
    id: Number(p.id) || 0,
    title: p.title,
    category: p.category,
    description: p.description,
    status: p.status,
    budget: p.budget,
    applications: p.applications || 0,
    deadline: p.deadline,
    skills: p.skills || [],
    freelancer: p.freelancer ? { name: p.freelancer.fullName, avatar: p.freelancer.fullName.split(" ").map(n => n[0]).join("") } : null,
    createdAt: new Date(p.createdAt).toLocaleDateString(),
  }));

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
                      key={project.id}
                      className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col h-full"
                    >
                      {/* Card Header */}
                      <div className="p-5 flex-1 flex flex-col">
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
                              onClick={() =>
                                setOpenMenuId(
                                  openMenuId === project.id ? null : project.id,
                                )
                              }
                              className="p-1 text-slate-400 hover:text-navy hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <MoreVertical size={18} />
                            </button>
                            {openMenuId === project.id && (
                              <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-10">
                                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                                  <Edit2 size={14} /> Edit
                                </button>
                                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                                  <Copy size={14} /> Duplicate
                                </button>
                                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50">
                                  <Trash2 size={14} /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <h3 className="font-semibold text-navy mb-1 line-clamp-1 text-lg">
                          {project.title}
                        </h3>
                        <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-500 rounded-md text-xs font-medium mb-3 w-fit">
                          {project.category}
                        </span>
                        <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">
                          {project.description}
                        </p>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {project.skills.slice(0, 3).map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 bg-white border border-slate-200 text-slate-600 rounded-md text-xs font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                          {project.skills.length > 3 && (
                            <span className="px-2 py-0.5 bg-slate-50 text-slate-400 rounded-md text-xs border border-transparent">
                              +{project.skills.length - 3}
                            </span>
                          )}
                        </div>

                        {/* Freelancer Section - consistently sized placeholder if empty */}
                        <div className="mt-auto pt-3 border-t border-slate-50/50">
                          {project.freelancer ? (
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal to-royal-blue flex items-center justify-center text-white text-xs font-bold shadow-sm ring-2 ring-white">
                                {project.freelancer.avatar}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs text-slate-400 font-medium">
                                  Assigned to
                                </span>
                                <span className="text-sm font-semibold text-navy leading-none">
                                  {project.freelancer.name}
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
                      <div className="px-5 py-4 bg-slate-50/50 border-t border-slate-100 backdrop-blur-sm">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-4">
                          <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-slate-200/50 shadow-sm">
                            <CreditCard size={12} className="text-slate-400" />
                            <span className="text-navy">
                              ₹{project.budget.max.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users size={12} />
                            {project.applications} applicants
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock size={12} />
                            {project.deadline}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Link
                            to={`/client/project/${project.id}`}
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
                              to={`/client/project/${project.id}/applications`}
                              className="flex-1"
                            >
                              <Button className="w-full h-9 text-xs bg-teal hover:bg-teal-light text-white shadow-sm shadow-teal/20">
                                <Users size={14} className="mr-1.5" />{" "}
                                Applications
                              </Button>
                            </Link>
                          ) : project.status === "in-progress" ? (
                            <Button className="flex-1 h-9 text-xs bg-royal-blue hover:bg-royal-blue/90 text-white shadow-sm shadow-royal-blue/20">
                              <CheckCircle size={14} className="mr-1.5" />{" "}
                              Complete
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
                            key={project.id}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-medium text-navy">
                                  {project.title}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {project.category}
                                </p>
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
                                ₹{project.budget.min.toLocaleString()} - ₹
                                {project.budget.max.toLocaleString()}
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
                                <Clock size={14} className="text-slate-400" />
                                {project.deadline}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Link to={`/client/project/${project.id}`}>
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
                                >
                                  <Trash2 size={16} />
                                </Button>
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
                <div className="flex items-center justify-between">
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
    </div>
  );
};

export default ClientProjects;
