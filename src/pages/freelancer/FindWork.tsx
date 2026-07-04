import { useState, useEffect, useCallback, useRef } from "react";
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
  AlertCircle,
  Star,
  CheckCircle2,
  XCircle,
  Hourglass,
  Sparkles,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import PublicNavbar from "@/components/shared/PublicNavbar";
import ProjectApplicationModal from "@/components/modals/ProjectApplicationModal";
import ProfileCompletionModal from "@/components/modals/ProfileCompletionModal";
import { TermsModal } from "@/components/modals/TermsModal";
import { useProjects } from "@/hooks/queries/useProjects";
import { useCategories } from "@/hooks/queries/useCategories";
import { useMyApplications, useMyFreelancerProfile } from "@/hooks/queries/useFreelancerDashboardQueries";
import type { Project } from "@/services";
import type { FreelancerLayoutContext } from "@/layouts/FreelancerLayout";
import DashboardHeader from "@/components/layouts/DashboardHeader";
import { TrialBanner } from "@/components/feature-gate";

/**
 * Application state for a single project card. Drives both the status
 * badge ("Applied" / "Shortlisted" / etc.) and the behaviour of the
 * primary CTA ("Apply" vs disabled).
 */
type ApplicationVisualState =
  | "not_applied"
  | "pending"
  | "viewed"
  | "shortlisted"
  | "hired"
  | "accepted"
  | "rejected"
  | "withdrawn";

const APPLICATION_VISUAL: Record<
  ApplicationVisualState,
  {
    badgeLabel: string;
    badgeClasses: string;
    applyLabel: string;
    applyDisabled: boolean;
    canMessage: boolean;
  }
> = {
  not_applied: {
    badgeLabel: "",
    badgeClasses: "",
    applyLabel: "Apply",
    applyDisabled: false,
    canMessage: false,
  },
  pending: {
    badgeLabel: "Applied",
    badgeClasses:
      "bg-success-green/10 text-success-green border border-success-green/30",
    applyLabel: "Applied",
    applyDisabled: true,
    canMessage: false,
  },
  viewed: {
    badgeLabel: "Viewed by client",
    badgeClasses: "bg-sky-blue/10 text-royal-blue border border-sky-blue/30",
    applyLabel: "Applied",
    applyDisabled: true,
    canMessage: false,
  },
  shortlisted: {
    badgeLabel: "Shortlisted",
    badgeClasses: "bg-royal-blue/10 text-royal-blue border border-royal-blue/30",
    applyLabel: "Shortlisted",
    applyDisabled: true,
    canMessage: true,
  },
  hired: {
    badgeLabel: "Hired",
    badgeClasses: "bg-gold/10 text-gold border border-gold/30",
    applyLabel: "Hired",
    applyDisabled: true,
    canMessage: true,
  },
  accepted: {
    badgeLabel: "Accepted",
    badgeClasses: "bg-teal/10 text-teal border border-teal/30",
    applyLabel: "Accepted",
    applyDisabled: true,
    canMessage: true,
  },
  rejected: {
    badgeLabel: "Not selected",
    badgeClasses: "bg-red-50 text-red-500 border border-red-200",
    applyLabel: "Rejected",
    applyDisabled: true,
    canMessage: false,
  },
  withdrawn: {
    badgeLabel: "",
    badgeClasses: "",
    applyLabel: "Apply again",
    applyDisabled: false,
    canMessage: false,
  },
};

const ApplicationStatusBadge = ({
  state,
}: {
  state: ApplicationVisualState;
}) => {
  const cfg = APPLICATION_VISUAL[state];
  if (!cfg.badgeLabel) return null;

  const Icon =
    state === "pending" || state === "viewed" || state === "accepted"
      ? CheckCircle2
      : state === "shortlisted"
        ? Sparkles
        : state === "hired"
          ? Crown
          : state === "rejected"
            ? XCircle
            : Hourglass;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xxs font-semibold uppercase tracking-wide",
        cfg.badgeClasses,
      )}
      role="status"
      aria-label={`Application status: ${cfg.badgeLabel}`}
    >
      <Icon size={11} />
      {cfg.badgeLabel}
    </div>
  );
};


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
  const { data: projectsData, isLoading: loadingProjects, error: projectsError } = useProjects({ limit: 50 });
  const projects = projectsData?.projects || [];
  const error = projectsError ? "Failed to load projects. Please try again." : null;

  const { data: myAppsData } = useMyApplications();
  const { data: profileData } = useMyFreelancerProfile();
  const profile = profileData || null;
  const myApplications = myAppsData?.applications || [];
  const appStatusByProjectId = new Map(
    myApplications.map((app) => [
      app.project?.id || app.project?._id || app.projectId,
      app.status as ApplicationVisualState | undefined,
    ]),
  );

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

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

  // Profile completion gate
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileModalMessage, setProfileModalMessage] = useState("");
  const pendingApplyRef = useRef<Project | null>(null);

  const navigate = useNavigate();

  // Categories Query
  const { data: categoriesData } = useCategories();
  const categories = ["All Categories", ...(categoriesData?.map(c => c.name) || [])];

  const location = useLocation();

  const handleApplyClick = useCallback(
    (project: Project) => {
      if (!user) {
        navigate("/login", { state: { from: "/freelancer/projects" } });
        return;
      }
      // Gate: profile must be complete before applying
      const incomplete =
        !profile?.categories?.length ||
        !profile?.skills?.length ||
        !profile?.headline?.trim();
      if (incomplete) {
        pendingApplyRef.current = project;
        setProfileModalMessage("You need to complete your profile before you can apply to projects.");
        setShowProfileModal(true);
        return;
      }
      if (!profile?.contactInfo) {
        pendingApplyRef.current = project;
        setProfileModalMessage("Please add a contact email or phone number to your profile before applying.");
        setShowProfileModal(true);
        return;
      }
      // Block re-application when the freelancer already has a live
      // application for this project. Withdrawn is allowed (re-apply).
      const projectId = project._id || project.id || "";
      const status = appStatusByProjectId.get(projectId);
      if (
        status &&
        status !== "withdrawn" &&
        status !== "rejected"
      ) {
        return;
      }
      setSelectedProject(project);
      setShowTermsForApply(true);
    },
    [user, navigate, appStatusByProjectId, profile],
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
        setSelectedProject(project);
        setShowTermsForApply(true);
      }
    }
  }, [profile]);

  const handleTermsAccepted = () => {
    setShowTermsForApply(false);
    setShowApplicationModal(true);
  };

  const handleApplicationSuccess = async (convId?: string) => {
    setShowApplicationModal(false);
    setSelectedProject(null);
    if (convId) {
      navigate("/freelancer/messages", {
        state: { conversationId: convId },
      });
    } else {
      navigate("/freelancer/messages");
    }
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
    setSelectedLocation("All Locations");
    setSelectedPostedDate("Any Time");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== "All Categories" ||
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
        !(project.requiredSkills || []).some((s) =>
          s.toLowerCase().includes(query),
        )
      ) {
        return false;
      }
    }

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
    <div className="w-full bg-slate-50 dark:bg-background flex-1 h-full overflow-x-hidden overflow-y-auto">
      {!user && <PublicNavbar variant="white" />}
      <div className={cn("w-full", !user && "pt-20")}>
        {/* Header Bar */}
        {user && (
          <DashboardHeader
            title="Find Work"
            onMenuClick={() => setSidebarOpen(true)}
          />
        )}

        {/* Main Content Area */}
        <main className="dashboard-content">
          {/* TRIAL BANNER */}
          <TrialBanner />

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
          {loadingProjects && (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal"></div>
              <span className="ml-3 text-slate-500 dark:text-slate-400">
                Loading projects...
              </span>
            </div>
          )}

          {/* ERROR STATE */}
          {!loadingProjects && error && (
            <div className="bg-white dark:bg-white/5 rounded-2xl border border-red-100 dark:border-red-900/20 shadow-sm p-8 text-center">
              <AlertCircle size={40} className="mx-auto text-red-400 mb-3" />
              <p className="text-red-600 dark:text-red-400 font-medium mb-4">
                {error}
              </p>
            </div>
          )}

          {/* CONTENT (only shown when not loading) */}
          {!loadingProjects && !error && (
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
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Category */}
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">
                          Category
                        </label>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 text-sm text-navy dark:text-white bg-white dark:bg-[#111827] focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none min-h-11"
                        >
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
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
                          className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 text-sm text-navy dark:text-white bg-white dark:bg-[#111827] focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none min-h-11"
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
                          className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 text-sm text-navy dark:text-white bg-white dark:bg-[#111827] focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none min-h-11"
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
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Sort by:
                  </span>
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
                      <div className="p-4 sm:p-5 flex-1 flex flex-col">
                        {/* Title, status badge & Client */}
                        <div className="mb-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-navy dark:text-white line-clamp-2 hover:text-royal-blue dark:hover:text-teal transition-colors min-h-[3.5rem]">
                              {project.title}
                            </h3>
                            <ApplicationStatusBadge
                              state={
                                (appStatusByProjectId.get(
                                  project._id || project.id || "",
                                ) as ApplicationVisualState) ?? "not_applied"
                              }
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 text-xs font-bold shrink-0">
                              {project.client?.fullName?.charAt(0) ?? "C"}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-navy dark:text-white truncate">
                                {project.client?.fullName ?? "Client"}
                              </p>
                              <div className="flex items-center gap-1">
                                {(() => {
                                  // Use the real rating from the backend if available and > 0
                                  if (project.client?.rating && project.client.rating > 0) {
                                    return (
                                      <>
                                        <Star size={10} className="text-gold fill-gold" />
                                        <span className="text-xxs text-slate-500">{project.client.rating.toFixed(1)}</span>
                                      </>
                                    );
                                  }

                                  // Fallback to generated pseudo-rating if no real rating yet
                                  const str = project.client?.id || project._id || "123";
                                  let hash = 0;
                                  for (let i = 0; i < str.length; i++) {
                                    hash = str.charCodeAt(i) + ((hash << 5) - hash);
                                  }
                                  const randomStr = Math.abs(hash).toString();
                                  const rating = (4.0 + (parseInt(randomStr.substring(0, 2)) % 10) / 10).toFixed(1);
                                  const reviews = parseInt(randomStr.substring(2, 4)) % 50 + 1;
                                  return (
                                    <>
                                      <Star size={10} className="text-gold fill-gold" />
                                      <span className="text-xxs text-slate-500">{rating} ({reviews} reviews)</span>
                                    </>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Description Wrapper */}
                        <div className="mb-4 flex-1 min-h-0">
                          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                            {project.description}
                          </p>
                        </div>

                        {/* Skills */}
                        <div className="flex flex-wrap items-center gap-1.5 mb-5 min-h-[2.5rem]">
                          {project.requiredSkills
                            .slice(0, 3)
                            .map((skill, index) => (
                              <span
                                key={`${project._id}-${skill}-${index}`}
                                className={cn(
                                  "inline-flex items-center justify-center px-2 py-1 rounded-md text-xxs font-medium leading-none",
                                  userSkills.includes(skill)
                                    ? "bg-teal/10 text-teal border border-teal/20"
                                    : "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 border border-transparent",
                                )}
                              >
                                {skill}
                              </span>
                            ))}
                          {project.requiredSkills.length > 3 && (
                            <span className="inline-flex items-center justify-center px-2 py-1 bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 rounded-md text-xxs font-medium leading-none border border-transparent">
                              +{project.requiredSkills.length - 3}
                            </span>
                          )}
                        </div>

                        {/* Footer Info Area */}
                        <div className="mt-auto space-y-4">

                          <div className="flex items-center justify-between text-xs text-slate-500 pb-2">
                            <div className="flex items-center gap-1.5">
                              <Users size={14} />
                              <span>
                                {project.applications} applicant
                                {project.applications !== 1 ? "s" : ""}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin size={14} />
                              <span>
                                {project.location?.type === "remote"
                                  ? "Remote"
                                  : project.location?.type === "onsite"
                                    ? "Onsite"
                                    : project.location?.type === "hybrid"
                                      ? "Hybrid"
                                      : project.location?.type}
                                {project.location?.city ? `, ${project.location.city}` : ""}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {(() => {
                              const projectId = project._id || project.id || "";
                              const visual = (appStatusByProjectId.get(
                                projectId,
                              ) as ApplicationVisualState) ?? "not_applied";
                              const cfg = APPLICATION_VISUAL[visual];
                              const isAppliedVisual =
                                visual === "pending" ||
                                visual === "viewed" ||
                                visual === "shortlisted" ||
                                visual === "hired" ||
                                visual === "accepted";
                              return (
                                <>
                                  <Button
                                    className={cn(
                                      "w-full py-2.5 rounded-xl font-bold transition-all shadow-sm hover:shadow-md active:scale-[0.98]",
                                      isAppliedVisual
                                        ? "bg-success-green/10 text-success-green border border-success-green/20 cursor-default shadow-none hover:shadow-none active:scale-100"
                                        : visual === "rejected"
                                          ? "bg-slate-100 dark:bg-white/5 text-slate-500 border border-slate-200 dark:border-white/10 cursor-default shadow-none hover:shadow-none active:scale-100"
                                          : "bg-teal hover:bg-teal-light text-white",
                                    )}
                                    onClick={() => handleApplyClick(project)}
                                    disabled={cfg.applyDisabled}
                                    aria-disabled={cfg.applyDisabled}
                                    title={
                                      cfg.applyDisabled
                                        ? `You have already applied (${cfg.applyLabel})`
                                        : undefined
                                    }
                                  >
                                    {isAppliedVisual && (
                                      <CheckCircle2 size={16} className="mr-1.5" />
                                    )}
                                    {visual === "rejected" && (
                                      <XCircle size={16} className="mr-1.5" />
                                    )}
                                    {cfg.applyLabel}
                                  </Button>

                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-teal hover:bg-teal/5 hover:text-teal dark:hover:text-teal py-2.5 rounded-xl transition-all shadow-sm",
                                      cfg.canMessage ? "sm:col-span-2 order-last" : ""
                                    )}
                                    onClick={() => navigate(`/freelancer/project/${projectId}`)}
                                  >
                                    View Details
                                  </Button>

                                  {cfg.canMessage && (
                                    <Button
                                      className="w-full bg-royal-blue hover:bg-royal-blue/90 text-white py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                                      onClick={() => navigate(`/freelancer/messages?projectId=${projectId}`)}
                                    >
                                      Message Now
                                    </Button>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* EMPTY STATE */
                <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-12 text-center text-navy dark:text-white">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-100 dark:bg-white/10 flex items-center justify-center">
                    <Briefcase
                      size={40}
                      className="text-slate-300 dark:text-slate-600"
                    />
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

export default FindWork;
