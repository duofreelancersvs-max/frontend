import { useState, useEffect, useCallback } from "react";
import { useOutletContext, useNavigate, Link } from "react-router-dom";
import {
  Search,
  Menu,
  Bookmark,
  BookmarkCheck,
  MapPin,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  SlidersHorizontal,
  DollarSign,
  AlertCircle,
  MessageSquare,
  Bell,
  ChevronDown,
  User as UserIcon,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import ProjectApplicationModal from "@/components/modals/ProjectApplicationModal";
import { TermsModal } from "@/components/modals/TermsModal";
import { projectService, conversationService } from "@/services";
import type { Project } from "@/services";
import type { FreelancerLayoutContext } from "@/layouts/FreelancerLayout";
import { useUnreadStore } from "@/stores/unread.store";

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

// User's skills for matching
const userSkills = [
  "Premiere Pro",
  "After Effects",
  "Color Grading",
  "Motion Graphics",
  "DaVinci Resolve",
];

const BrowseProjects = () => {
  const { setSidebarOpen } = useOutletContext<FreelancerLayoutContext>();
  const totalUnreadCount = useUnreadStore((s) => s.totalUnreadCount);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"browse" | "saved">("browse");
  const [showFilters, setShowFilters] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("relevance");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // API state
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [selectedExperience, setSelectedExperience] = useState("All Levels");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedPostedDate, setSelectedPostedDate] = useState("Any Time");

  // Saved projects state
  const [savedProjects, setSavedProjects] = useState<string[]>([]);

  // Application modal state
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Terms & Conditions flow state
  const [showTermsForApply, setShowTermsForApply] = useState(false);

  const navigate = useNavigate();

  // Fetch real projects from backend
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await projectService.search({ status: "open", limit: 50 });
      setProjects(result.projects || []);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      setError("Failed to load projects. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleApplyClick = (project: Project) => {
    setSelectedProject(project);
    setShowTermsForApply(true);
  };

  const handleTermsAccepted = () => {
    setShowTermsForApply(false);
    setShowApplicationModal(true);
  };

  const handleApplicationSuccess = async () => {
    if (!selectedProject) return;
    try {
      // Create a conversation with the project client
      const clientId = selectedProject.client?.id || selectedProject.clientId;
      const projectId = selectedProject._id || selectedProject.id;
      if (clientId && projectId) {
        await conversationService.create({
          participantId: clientId,
          projectId,
        });
      }
    } catch (err) {
      console.error("Error creating conversation:", err);
    }
    setShowApplicationModal(false);
    setSelectedProject(null);
    // Redirect to messages inbox
    navigate("/freelancer/messages");
  };

  const toggleSaveProject = (projectId: string) => {
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
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== "All Categories" ||
    budgetMin ||
    budgetMax ||
    selectedExperience !== "All Levels" ||
    selectedLocation !== "All Locations" ||
    selectedPostedDate !== "Any Time";

  // Filter real projects from API
  const filteredProjects = projects.filter((project) => {
    const projectId = project._id || project.id || "";
    if (activeTab === "saved" && !savedProjects.includes(projectId))
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

    if (budgetMin && project.budget.minAmount < Number(budgetMin)) return false;
    if (budgetMax && project.budget.maxAmount > Number(budgetMax)) return false;

    if (
      selectedLocation !== "All Locations" &&
      project.location?.type !== selectedLocation
    ) {
      return false;
    }

    return true;
  });

  // Sort
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === "budget-high")
      return (b.budget.maxAmount || 0) - (a.budget.maxAmount || 0);
    if (sortBy === "budget-low")
      return (a.budget.minAmount || 0) - (b.budget.minAmount || 0);
    if (sortBy === "newest")
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return 0; // relevance — default order from API
  });

  const projectsPerPage = 6;
  const totalPages = Math.ceil(sortedProjects.length / projectsPerPage);
  const paginatedProjects = sortedProjects.slice(
    (currentPage - 1) * projectsPerPage,
    currentPage * projectsPerPage,
  );

  return (
    <div className="w-full bg-slate-50">
      <div className="w-full">
        {/* Header Bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between w-full">
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
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl hidden md:flex">
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

            <div className="flex items-center gap-2 lg:gap-4">
              <Link
                to="/freelancer/messages"
                className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg hidden sm:flex"
              >
                <MessageSquare size={20} />
                {totalUnreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-teal rounded-full border-2 border-white" />
                )}
              </Link>
              
              <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg hidden sm:flex">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

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
                      <UserIcon size={16} />
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
        <main className="p-4 lg:p-8 space-y-6">
          {/* LOADING STATE */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal"></div>
              <span className="ml-3 text-slate-500">Loading projects...</span>
            </div>
          )}

          {/* ERROR STATE */}
          {!loading && error && (
            <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8 text-center">
              <AlertCircle size={40} className="mx-auto text-red-400 mb-3" />
              <p className="text-red-600 font-medium mb-4">{error}</p>
              <button
                onClick={fetchProjects}
                className="px-6 py-2 bg-teal text-white rounded-lg hover:bg-teal-light transition-colors text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          )}

          {/* CONTENT (only shown when not loading) */}
          {!loading && !error && (
            <>
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
                          onChange={(e) =>
                            setSelectedExperience(e.target.value)
                          }
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
                          onChange={(e) =>
                            setSelectedPostedDate(e.target.value)
                          }
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
                      key={project._id || project.id}
                      className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-teal/20 transition-all overflow-hidden"
                    >
                      {/* Card Header */}
                      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-50 bg-slate-50/50">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Clock size={14} />
                          {new Date(project.createdAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <button
                          onClick={() =>
                            toggleSaveProject(project._id || project.id || "")
                          }
                          className={cn(
                            "p-1.5 rounded-lg transition-colors",
                            savedProjects.includes(
                              project._id || project.id || "",
                            )
                              ? "text-gold hover:bg-gold/10"
                              : "text-slate-400 hover:text-gold hover:bg-slate-100",
                          )}
                        >
                          {savedProjects.includes(
                            project._id || project.id || "",
                          ) ? (
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
                            {project.client?.fullName?.charAt(0) ?? "C"}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-medium text-navy">
                                {project.client?.fullName ?? "Client"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Briefcase size={12} className="text-slate-400" />
                              <span className="text-xs text-slate-500">
                                {project.applications} applicant
                                {project.applications !== 1 ? "s" : ""}
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
                              ₹{project.budget.minAmount?.toLocaleString() || 0}{" "}
                              - ₹
                              {project.budget.maxAmount?.toLocaleString() || 0}
                            </span>
                            <span className="text-xs text-slate-400">
                              ({project.budget.type})
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                          <div className="flex items-center gap-1">
                            <Users size={14} />
                            {project.applications} applicant
                            {project.applications !== 1 ? "s" : ""}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin size={14} />
                            {project.location?.type ?? "Remote"}
                            {project.location?.city
                              ? `, ${project.location.city}`
                              : ""}
                          </div>
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
            </>
          )}
        </main>
      </div>

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
            budget: selectedProject.budget,
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
