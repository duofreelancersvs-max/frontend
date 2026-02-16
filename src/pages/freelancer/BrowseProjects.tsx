import { useState, useEffect } from "react";
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
  Award,
  X,
  Menu,
  Bookmark,
  BookmarkCheck,
  MapPin,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  Briefcase,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ProjectApplicationModal from "@/components/modals/ProjectApplicationModal";
import { projectService } from "@/services";
import type { Project } from "@/services";

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
  { icon: Search, label: "Browse Projects", href: "/projects", active: true },
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

// Filter options
const categories = [
  "All Categories",
  "Video Editing",
  "Motion Graphics",
  "3D Animation",
  "VFX",
  "Color Grading",
  "Audio Editing",
  "Graphic Design",
];

const experienceLevels = [
  "All Levels",
  "Entry Level",
  "Intermediate",
  "Expert",
];

const locationTypes = ["All Locations", "Remote", "On-site", "Hybrid"];

const postedDateOptions = [
  "Any Time",
  "Last 24 Hours",
  "Last Week",
  "Last Month",
];

const sortOptions = [
  { value: "relevance", label: "Relevance" },
  { value: "newest", label: "Newest" },
  { value: "budget-high", label: "Budget (High-Low)" },
  { value: "budget-low", label: "Budget (Low-High)" },
];

// Mock projects data
const mockProjects = [
  {
    id: 1,
    title: "E-commerce Product Video Editing",
    description:
      "Looking for an experienced video editor to create compelling product videos for our e-commerce platform. Must have experience with color grading and motion graphics.",
    client: {
      name: "TechMart Solutions",
      rating: 4.8,
      reviews: 45,
      verified: true,
    },
    budget: { type: "Fixed", min: 15000, max: 20000 },
    skills: [
      "Premiere Pro",
      "After Effects",
      "Color Grading",
      "Motion Graphics",
    ],
    location: "Remote",
    proposals: "5-10",
    postedTime: "2 hours ago",
    experienceLevel: "Intermediate",
    saved: false,
  },
  {
    id: 2,
    title: "Corporate Explainer Animation",
    description:
      "We need a motion graphics expert to create a 2-minute explainer video for our SaaS product. Looking for clean, modern animation style.",
    client: {
      name: "InnovateCorp",
      rating: 4.9,
      reviews: 72,
      verified: true,
    },
    budget: { type: "Fixed", min: 25000, max: 35000 },
    skills: ["After Effects", "Motion Graphics", "2D Animation", "Illustrator"],
    location: "Remote",
    proposals: "10-15",
    postedTime: "5 hours ago",
    experienceLevel: "Expert",
    saved: true,
  },
  {
    id: 3,
    title: "YouTube Channel Intro & Outro",
    description:
      "Need creative intro and outro animations for a tech review YouTube channel. Should be modern, engaging, and under 10 seconds each.",
    client: {
      name: "TechReview Pro",
      rating: 4.5,
      reviews: 28,
      verified: false,
    },
    budget: { type: "Fixed", min: 5000, max: 8000 },
    skills: ["After Effects", "Motion Graphics", "Logo Animation"],
    location: "Remote",
    proposals: "15-20",
    postedTime: "1 day ago",
    experienceLevel: "Entry Level",
    saved: false,
  },
  {
    id: 4,
    title: "Wedding Highlight Reel Editing",
    description:
      "Looking for a skilled editor to create cinematic wedding highlight reels. Must have experience with color grading and audio syncing.",
    client: {
      name: "Moments Photography",
      rating: 4.7,
      reviews: 56,
      verified: true,
    },
    budget: { type: "Hourly", min: 800, max: 1200 },
    skills: [
      "Premiere Pro",
      "DaVinci Resolve",
      "Color Grading",
      "Audio Editing",
    ],
    location: "Hybrid",
    proposals: "3-5",
    postedTime: "3 hours ago",
    experienceLevel: "Intermediate",
    saved: false,
  },
  {
    id: 5,
    title: "Social Media Ad Creatives",
    description:
      "Need multiple short video ads (15-30 seconds) for Instagram and Facebook. Fast turnaround required. Experience with vertical video format preferred.",
    client: {
      name: "Brand Boost Agency",
      rating: 4.6,
      reviews: 89,
      verified: true,
    },
    budget: { type: "Fixed", min: 10000, max: 15000 },
    skills: ["Premiere Pro", "After Effects", "Social Media", "Video Ads"],
    location: "Remote",
    proposals: "20+",
    postedTime: "6 hours ago",
    experienceLevel: "Intermediate",
    saved: true,
  },
  {
    id: 6,
    title: "3D Product Visualization",
    description:
      "Looking for a 3D artist to create photorealistic product renders and animations for our furniture catalog. Cinema 4D or Blender expertise required.",
    client: {
      name: "Modern Furnishings",
      rating: 4.9,
      reviews: 34,
      verified: true,
    },
    budget: { type: "Fixed", min: 40000, max: 60000 },
    skills: ["Cinema 4D", "Blender", "3D Modeling", "Product Visualization"],
    location: "Remote",
    proposals: "5-10",
    postedTime: "2 days ago",
    experienceLevel: "Expert",
    saved: false,
  },
];

// User's skills for matching
const userSkills = [
  "Premiere Pro",
  "After Effects",
  "Color Grading",
  "Motion Graphics",
  "DaVinci Resolve",
];

const BrowseProjects = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"browse" | "saved">("browse");
  const [showFilters, setShowFilters] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("relevance");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [selectedExperience, setSelectedExperience] = useState("All Levels");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedPostedDate, setSelectedPostedDate] = useState("Any Time");

  // Saved projects state
  const [savedProjects, setSavedProjects] = useState<(string | number)[]>([]);

  // Application modal state
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const params: any = { status: "open" };
        if (searchQuery) params.search = searchQuery;
        if (selectedCategory !== "All Categories") params.category = selectedCategory;
        if (budgetMin) params.minBudget = Number(budgetMin);
        if (budgetMax) params.maxBudget = Number(budgetMax);
        
        const data = await projectService.search(params);
        setProjects(data.projects || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [searchQuery, selectedCategory, budgetMin, budgetMax]);

  const subscriptionPlan = "Free";

  const handleApplyClick = (project: (typeof mockProjects)[0]) => {
    setSelectedProject(project);
    setShowApplicationModal(true);
  };

  const toggleSaveProject = (projectId: number) => {
    setSavedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId],
    );
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All Categories");
    setBudgetMin("");
    setBudgetMax("");
    setSelectedExperience("All Levels");
    setSelectedLocation("All Locations");
    setSelectedPostedDate("Any Time");
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== "All Categories" ||
    budgetMin ||
    budgetMax ||
    selectedExperience !== "All Levels" ||
    selectedLocation !== "All Locations" ||
    selectedPostedDate !== "Any Time";

  // Filter projects
  const filteredProjects = mockProjects.filter((project) => {
    if (activeTab === "saved" && !savedProjects.includes(project.id))
      return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !project.title.toLowerCase().includes(query) &&
        !project.description.toLowerCase().includes(query) &&
        !project.skills.some((s) => s.toLowerCase().includes(query))
      ) {
        return false;
      }
    }

    if (
      selectedCategory !== "All Categories" &&
      !project.skills.includes(selectedCategory)
    ) {
      // Simplified category filter
    }

    if (
      selectedExperience !== "All Levels" &&
      project.experienceLevel !== selectedExperience
    ) {
      return false;
    }

    if (
      selectedLocation !== "All Locations" &&
      project.location !== selectedLocation
    ) {
      return false;
    }

    return true;
  });

  const projectsPerPage = 6;
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * projectsPerPage,
    currentPage * projectsPerPage,
  );

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
                  Browse Projects
                </h1>
                <p className="text-sm text-slate-500 hidden sm:block">
                  Find work that matches your skills
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab("browse")}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-all",
                  activeTab === "browse"
                    ? "bg-white text-navy shadow-sm"
                    : "text-slate-500 hover:text-navy",
                )}
              >
                <Search size={16} className="inline mr-2" />
                Browse
              </button>
              <button
                onClick={() => setActiveTab("saved")}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2",
                  activeTab === "saved"
                    ? "bg-white text-navy shadow-sm"
                    : "text-slate-500 hover:text-navy",
                )}
              >
                <Bookmark size={16} />
                Saved
                {savedProjects.length > 0 && (
                  <span className="px-1.5 py-0.5 text-xs font-bold bg-teal text-white rounded-full">
                    {savedProjects.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-4 lg:p-8 space-y-6">
          {/* SEARCH & FILTER BAR */}
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 lg:p-6">
            {/* Search Row */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <Search
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects by title, skills, or keywords..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 rounded-xl border font-medium transition-all",
                  showFilters
                    ? "bg-teal/5 border-teal text-teal"
                    : "border-slate-200 text-slate-600 hover:border-slate-300",
                )}
              >
                <SlidersHorizontal size={18} />
                Filters
                {hasActiveFilters && (
                  <span className="w-2 h-2 bg-teal rounded-full" />
                )}
              </button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="pt-4 border-t border-slate-100">
                <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-navy bg-white focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Budget Range */}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">
                      Budget Range (₹)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={budgetMin}
                        onChange={(e) => setBudgetMin(e.target.value)}
                        placeholder="Min"
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-navy focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none"
                      />
                      <input
                        type="number"
                        value={budgetMax}
                        onChange={(e) => setBudgetMax(e.target.value)}
                        placeholder="Max"
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-navy focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none"
                      />
                    </div>
                  </div>

                  {/* Experience Level */}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">
                      Experience Level
                    </label>
                    <select
                      value={selectedExperience}
                      onChange={(e) => setSelectedExperience(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-navy bg-white focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none"
                    >
                      {experienceLevels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">
                      Location Type
                    </label>
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-navy bg-white focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none"
                    >
                      {locationTypes.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Posted Date */}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">
                      Posted Date
                    </label>
                    <select
                      value={selectedPostedDate}
                      onChange={(e) => setSelectedPostedDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-navy bg-white focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none"
                    >
                      {postedDateOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-teal hover:underline font-medium"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* RESULTS BAR */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-navy">
                {filteredProjects.length}
              </span>{" "}
              projects found
              {activeTab === "saved" && " in saved"}
            </p>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Sort by:</span>
              <div className="flex bg-slate-100 rounded-lg p-0.5">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSortBy(opt.value)}
                    className={cn(
                      "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                      sortBy === opt.value
                        ? "bg-white text-navy shadow-sm"
                        : "text-slate-500 hover:text-navy",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* PROJECT CARDS GRID */}
          {paginatedProjects.length > 0 ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginatedProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-teal/20 transition-all overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between px-5 py-3 border-b border-slate-50 bg-slate-50/50">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Clock size={14} />
                      {project.postedTime}
                    </div>
                    <button
                      onClick={() => toggleSaveProject(project.id)}
                      className={cn(
                        "p-1.5 rounded-lg transition-colors",
                        savedProjects.includes(project.id)
                          ? "text-gold hover:bg-gold/10"
                          : "text-slate-400 hover:text-gold hover:bg-slate-100",
                      )}
                    >
                      {savedProjects.includes(project.id) ? (
                        <BookmarkCheck size={18} />
                      ) : (
                        <Bookmark size={18} />
                      )}
                    </button>
                  </div>

                  {/* Card Content */}
                  <div className="p-5">
                    {/* Title */}
                    <h3 className="text-lg font-semibold text-navy mb-3 line-clamp-2 hover:text-royal-blue cursor-pointer transition-colors">
                      {project.title}
                    </h3>

                    {/* Client Info */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold">
                        {project.client.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium text-navy">
                            {project.client.name}
                          </span>
                          {project.client.verified && (
                            <BadgeCheck size={14} className="text-teal" />
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star size={12} className="text-gold fill-gold" />
                          <span className="text-xs text-slate-600">
                            {project.client.rating} ({project.client.reviews}{" "}
                            reviews)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                      {project.description}
                    </p>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {project.skills.slice(0, 4).map((skill) => (
                        <span
                          key={skill}
                          className={cn(
                            "px-2 py-1 rounded-md text-xs font-medium",
                            userSkills.includes(skill)
                              ? "bg-teal/10 text-teal border border-teal/20"
                              : "bg-slate-100 text-slate-600",
                          )}
                        >
                          {skill}
                        </span>
                      ))}
                      {project.skills.length > 4 && (
                        <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded-md text-xs">
                          +{project.skills.length - 4}
                        </span>
                      )}
                    </div>

                    {/* Footer Info */}
                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-4 pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-1">
                        <DollarSign size={14} />
                        <span className="font-semibold text-navy">
                          ₹{project.budget.min.toLocaleString()} - ₹
                          {project.budget.max.toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-400">
                          ({project.budget.type})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Users size={14} />
                        {project.proposals} proposals
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        {project.location}
                      </div>
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-medium">
                        {project.experienceLevel}
                      </span>
                    </div>

                    {/* Apply Button */}
                    <Button
                      className="w-full bg-teal hover:bg-teal-light text-white"
                      onClick={() => handleApplyClick(project)}
                    >
                      Apply Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* EMPTY STATE */
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-100 flex items-center justify-center">
                <Briefcase size={40} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-semibold text-navy mb-2">
                {activeTab === "saved"
                  ? "No saved projects yet"
                  : "No projects match your filters"}
              </h3>
              <p className="text-slate-500 mb-6">
                {activeTab === "saved"
                  ? "Click the bookmark icon on any project to save it for later."
                  : "Try adjusting your search criteria or clearing some filters."}
              </p>
              {activeTab === "browse" && hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="border-teal text-teal hover:bg-teal hover:text-white"
                >
                  Clear All Filters
                </Button>
              )}
              {activeTab === "saved" && (
                <Button
                  onClick={() => setActiveTab("browse")}
                  className="bg-teal hover:bg-teal-light text-white"
                >
                  Browse Projects
                </Button>
              )}
            </div>
          )}

          {/* PAGINATION */}
          {filteredProjects.length > projectsPerPage && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={cn(
                  "p-2 rounded-lg border transition-colors",
                  currentPage === 1
                    ? "border-slate-100 text-slate-300 cursor-not-allowed"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50",
                )}
              >
                <ChevronLeft size={18} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "w-10 h-10 rounded-lg font-medium transition-colors",
                      currentPage === page
                        ? "bg-teal text-white"
                        : "text-slate-600 hover:bg-slate-100",
                    )}
                  >
                    {page}
                  </button>
                ),
              )}

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className={cn(
                  "p-2 rounded-lg border transition-colors",
                  currentPage === totalPages
                    ? "border-slate-100 text-slate-300 cursor-not-allowed"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50",
                )}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Project Application Modal */}
      {selectedProject && (
        <ProjectApplicationModal
          isOpen={showApplicationModal}
          onClose={() => {
            setShowApplicationModal(false);
            setSelectedProject(null);
          }}
          project={{
            id: selectedProject.id,
            title: selectedProject.title,
            client: selectedProject.client,
            budget: selectedProject.budget,
            deadline: "2 weeks",
            questions: [
              "What is your experience with similar projects?",
              "What tools will you use for this project?",
            ],
          }}
          userHourlyRate={1200}
          applicationsRemaining={5}
          subscriptionPlan="Free"
        />
      )}
    </div>
  );
};

export default BrowseProjects;
