import { useState, useEffect, useCallback } from "react";
import { useOutletContext, useNavigate, useLocation } from "react-router-dom";
import {
  Search,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import PublicNavbar from "@/components/shared/PublicNavbar";
import ProjectApplicationModal from "@/components/modals/ProjectApplicationModal";
import { TermsModal } from "@/components/modals/TermsModal";
import { projectService, conversationService } from "@/services";
import type { Project } from "@/services";
import type { FreelancerLayoutContext } from "@/layouts/FreelancerLayout";
import DashboardHeader from "@/components/layouts/DashboardHeader";

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

const FindWork = () => {
  const { setSidebarOpen } = useOutletContext<FreelancerLayoutContext>();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"browse" | "saved">("browse");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("newest");
  const { user } = useAuth();

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
      const result = await projectService.search({ limit: 50 });
      setProjects(result.projects || []);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      setError("Failed to load projects. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const location = useLocation();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleApplyClick = useCallback(
    (project: Project) => {
      if (!user) {
        navigate("/login", { state: { from: "/freelancer/projects" } });
        return;
      }
      setSelectedProject(project);
      setShowTermsForApply(true);
    },
    [user, navigate],
  );

  // Handle direct apply from dashboard
  useEffect(() => {
    const state = location.state as { applyToProjectId?: string } | null;
    if (state?.applyToProjectId && projects.length > 0) {
      const project = projects.find(
        (p) => (p._id || p.id) === state.applyToProjectId,
      );
      if (project) {
        handleApplyClick(project);
        // Clear state to prevent re-triggering
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location.state, projects, navigate, location.pathname, handleApplyClick]);

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
        !(project.requiredSkills || []).some((s) => s.toLowerCase().includes(query))
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
    <div className="w-full bg-slate-50 dark:bg-background min-h-screen">
      {!user && <PublicNavbar variant="white" />}
      <div className={cn("w-full", !user && "pt-[72px]")}>
        {/* Header Bar */}
        {user && (
          <DashboardHeader
            title="Find Work"
            onMenuClick={() => setSidebarOpen(true)}
          />
        )}

        {/* Main Content Area */}
        <main className="px-6 lg:px-8 py-6 lg:py-8 space-y-4 lg:space-y-6">
          {/* Tabs */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 p-1 rounded-xl w-full md:w-fit overflow-x-auto scrollbar-hide hide-scrollbar mb-6">
            <button
              onClick={() => setActiveTab("browse")}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-all flex-1 md:flex-none whitespace-nowrap",
                activeTab === "browse"
                  ? "bg-white dark:bg-teal text-navy dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-navy dark:hover:text-white",
              )}
            >
              <Search size={16} className="inline mr-2" />
              Browse
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 flex-1 md:flex-none whitespace-nowrap",
                activeTab === "saved"
                  ? "bg-white dark:bg-teal text-navy dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-navy dark:hover:text-white",
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
          {/* LOADING STATE */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal"></div>
              <span className="ml-3 text-slate-500 dark:text-slate-400">Loading projects...</span>
            </div>
          )}

          {/* ERROR STATE */}
          {!loading && error && (
            <div className="bg-white dark:bg-white/5 rounded-2xl border border-red-100 dark:border-red-900/20 shadow-sm p-8 text-center">
              <AlertCircle size={40} className="mx-auto text-red-400 mb-3" />
              <p className="text-red-600 dark:text-red-400 font-medium mb-4">{error}</p>
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
              <section className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-4 lg:p-6">
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
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy dark:text-white bg-white dark:bg-white/5"
                    />
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(
                      "flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-medium transition-all w-full sm:w-auto",
                      showFilters
                        ? "bg-teal/5 dark:bg-teal/10 border-teal text-teal"
                        : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 bg-white dark:bg-white/5 hover:border-slate-300 dark:hover:border-white/20",
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
                  <div className="pt-4 border-t border-slate-100 dark:border-white/10">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                      {/* Category */}
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">
                          Category
                        </label>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 text-sm text-navy dark:text-white bg-white dark:bg-[#111827] focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none min-h-[44px]"
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
                            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 text-sm text-navy dark:text-white bg-white dark:bg-[#111827] focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none min-h-[44px]"
                          />
                          <input
                            type="number"
                            value={budgetMax}
                            onChange={(e) => setBudgetMax(e.target.value)}
                            placeholder="Max"
                            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 text-sm text-navy dark:text-white bg-white dark:bg-[#111827] focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none min-h-[44px]"
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
                          className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 text-sm text-navy dark:text-white bg-white dark:bg-[#111827] focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none min-h-[44px]"
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
                          className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 text-sm text-navy dark:text-white bg-white dark:bg-[#111827] focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none min-h-[44px]"
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
                          className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 text-sm text-navy dark:text-white bg-white dark:bg-[#111827] focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none min-h-[44px]"
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
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-navy dark:text-white">
                    {filteredProjects.length}
                  </span>{" "}
                  projects found
                  {activeTab === "saved" && " in saved"}
                </p>

                {/* Sort */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Sort by:</span>
                  <div className="flex overflow-x-auto scrollbar-hide bg-slate-100 dark:bg-white/5 rounded-lg p-0.5">
                    {sortOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setSortBy(opt.value)}
                        className={cn(
                          "px-3 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap",
                          sortBy === opt.value
                            ? "bg-white dark:bg-teal text-navy dark:text-white shadow-sm"
                            : "text-slate-500 dark:text-slate-400 hover:text-navy dark:hover:text-white",
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
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                  {paginatedProjects.map((project) => (
                    <div
                      key={project._id || project.id}
                      className="flex flex-col bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm hover:shadow-md hover:border-teal/20 dark:hover:border-teal/30 transition-all overflow-hidden"
                    >
                      {/* Card Header */}
                      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 shrink-0">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Clock size={14} />
                          {new Date(project.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                            },
                          )}
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
                        <h3 className="text-lg font-semibold text-navy dark:text-white mb-3 line-clamp-2 hover:text-royal-blue dark:hover:text-teal transition-colors">
                          {project.title}
                        </h3>

                        {/* Client Info */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold">
                            {project.client?.fullName?.charAt(0) ?? "C"}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-medium text-navy dark:text-white">
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
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-4">
                          {project.description}
                        </p>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {project.requiredSkills.slice(0, 4).map((skill, index) => (
                            <span
                              key={`${project._id}-${skill}-${index}`}
                              className={cn(
                                "px-2 py-1 rounded-md text-xs font-medium",
                                userSkills.includes(skill)
                                  ? "bg-teal/10 text-teal border border-teal/20"
                                  : "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400",
                              )}
                            >
                              {skill}
                            </span>
                          ))}
                          {project.requiredSkills.length > 4 && (
                            <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded-md text-xs">
                              +{project.requiredSkills.length - 4}
                            </span>
                          )}
                        </div>

                        {/* Footer Info */}
                        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4 pb-4 border-b border-slate-100 dark:border-white/5">
                          <div className="flex items-center gap-1">
                            <DollarSign size={14} />
                            <span className="font-semibold text-navy dark:text-white">
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
                            {project.location?.type === "remote"
                              ? "Remote"
                              : project.location?.type === "onsite"
                                ? "Onsite"
                                : project.location?.type === "hybrid"
                                  ? "Hybrid"
                                  : (project.location?.type
                                      ?.charAt(0)
                                      .toUpperCase() ?? "R")}
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
                <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-12 text-center text-navy dark:text-white">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-100 dark:bg-white/10 flex items-center justify-center">
                    <Briefcase size={40} className="text-slate-300 dark:text-slate-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-navy dark:text-white mb-2">
                    {activeTab === "saved"
                      ? "No saved projects yet"
                      : "No projects match your filters"}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-6">
                    {activeTab === "saved"
                      ? "Click the bookmark icon on any project to save it for later."
                      : "Try adjusting your search criteria or clearing some filters."}
                  </p>
                  {activeTab === "browse" && hasActiveFilters && (
                    <Button
                      variant="outline"
                      onClick={clearAllFilters}
                      className="border-teal text-teal hover:bg-teal hover:text-white dark:bg-transparent"
                    >
                      Clear All Filters
                    </Button>
                  )}
                  {activeTab === "saved" && (
                    <Button
                      onClick={() => setActiveTab("browse")}
                      className="bg-teal hover:bg-teal-light text-white font-bold"
                    >
                      Browse All Projects
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
                      "p-2 rounded-lg border transition-colors bg-white dark:bg-white/5",
                      currentPage === 1
                        ? "border-slate-100 dark:border-white/5 text-slate-300 dark:text-slate-700 cursor-not-allowed"
                        : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10",
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
                            ? "bg-teal text-white shadow-lg shadow-teal/20"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5",
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
                      "p-2 rounded-lg border transition-colors bg-white dark:bg-white/5",
                      currentPage === totalPages
                        ? "border-slate-100 dark:border-white/5 text-slate-300 dark:text-slate-700 cursor-not-allowed"
                        : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10",
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
          applicationsRemaining={5}
          subscriptionPlan="Free"
        />
      )}
    </div>
  );
};

export default FindWork;
