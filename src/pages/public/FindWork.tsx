import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  MapPin,
  Briefcase,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatBudget } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import PublicNavbar from "@/components/shared/PublicNavbar";
import { projectService } from "@/services";
import { publicService } from "@/services/public.service";
import type { Project } from "@/services";

// We will fetch categories dynamically from the backend

const experienceLevels = ["All Levels", "Entry", "Intermediate", "Expert"];

const locationTypes = ["All Locations", "Remote", "On-site", "Hybrid"];

const FindWork = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // State
  const [projects, setProjects] = useState<Project[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "All Categories");
  const [selectedSkill, setSelectedSkill] = useState(searchParams.get("skill") || "");
  const [selectedLevel, setSelectedLevel] = useState("All Levels");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  // Sync state with URL params when they change
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlCategory = searchParams.get("category") || "All Categories";
    const urlSkill = searchParams.get("skill") || "";
    
    setSearchQuery(urlSearch);
    setSelectedCategory(urlCategory);
    setSelectedSkill(urlSkill);
  }, [searchParams]);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        limit,
        search: searchQuery || undefined,
        category:
          selectedCategory !== "All Categories" ? selectedCategory : undefined,
        skills: selectedSkill ? [selectedSkill] : undefined,
        locationType:
          selectedLocation !== "All Locations"
            ? selectedLocation.toLowerCase()
            : undefined,
      };

      const result = await projectService.searchPublic(params);
      setProjects(result.projects || []);
      setTotalCount(result.total || 0);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      setError("Unable to load projects. Please try refreshing.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, selectedCategory, selectedSkill, selectedLocation]);

  const [categories, setCategories] = useState<string[]>(["All Categories"]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await publicService.getCategoriesWithSkills();
      const catNames = data.map((c: any) => c.name);
      setCategories(["All Categories", ...catNames]);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
    fetchCategories();
  }, [fetchProjects, fetchCategories]);

  const handleApply = (projectId: string) => {
    if (!isAuthenticated) {
      navigate("/login?role=freelancer", { state: { from: `/projects` } });
      return;
    }
    navigate(`/freelancer/projects`, {
      state: { applyToProjectId: projectId },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050B15]">
      <PublicNavbar dark />

      {/* Hero/Header Section - White Background like Categories/Find Talent */}
      <section className="relative pt-28 pb-16 md:pt-32 md:pb-24 overflow-hidden bg-white dark:bg-[#050B15] border-b border-slate-200 dark:border-white/5">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.05]" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-royal-blue/5 dark:bg-royal-blue/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-10 border-b border-slate-100 dark:border-white/5">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-full text-xxs font-black text-teal dark:text-teal-light mb-6 uppercase tracking-[0.2em]">
                Opportunities
              </span>
              <h1 className="text-5xl md:text-7xl font-black text-navy dark:text-white mb-6 leading-tight">
                Find Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal to-royal-blue dark:from-teal-light dark:to-sky-blue">
                  Next Project
                </span>
              </h1>
              <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed font-medium">
                Browse thousands of high-quality freelance opportunities across
                all creative domains.
              </p>
            </div>
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 px-6 py-4 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none self-start md:self-auto flex items-center gap-4">
              <div className="w-12 h-12 bg-teal/10 rounded-2xl flex items-center justify-center text-teal">
                <Briefcase size={24} />
              </div>
              <div>
                <div className="text-2xl font-black text-navy dark:text-white tracking-tighter">
                  {totalCount}
                </div>
                <div className="text-xxs font-bold text-slate-400 uppercase tracking-widest">
                  Live Projects
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar integrated into header section */}
          <div className="relative group max-w-4xl">
            <Search
              size={22}
              className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal transition-colors"
            />
            <input
              type="text"
              placeholder="Search for projects, domains, or skills..."
              className="w-full pl-16 pr-6 py-6 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[2rem] focus:ring-8 focus:ring-teal/5 focus:border-teal outline-none transition-all dark:text-white font-sans text-xl shadow-xl shadow-slate-200/50 dark:shadow-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchProjects()}
            />
            <Button
              onClick={fetchProjects}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-teal hover:bg-teal-light text-white px-8 h-12 rounded-2xl font-bold hidden sm:flex shadow-lg shadow-teal/20"
            >
              Search
            </Button>
          </div>
        </div>
      </section>

      <main className="py-12 container mx-auto px-4 lg:px-8">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 px-1 no-scrollbar">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold whitespace-nowrap transition-all shrink-0",
                showFilters
                  ? "bg-navy text-white border-navy"
                  : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400",
              )}
            >
              <SlidersHorizontal size={14} />
              Filters
              {(selectedCategory !== "All Categories" ||
                selectedLevel !== "All Levels" ||
                selectedLocation !== "All Locations") && (
                <span className="w-2 h-2 bg-teal rounded-full" />
              )}
            </button>

            <div className="h-6 w-px bg-slate-200 dark:bg-white/10 mx-1 shrink-0" />

            {categories.slice(0, 5).map((cat) => (
              <button
                key={cat}
                onClick={() =>
                  setSelectedCategory(
                    cat === selectedCategory ? "All Categories" : cat,
                  )
                }
                className={cn(
                  "px-4 py-2 rounded-full border text-sm font-bold whitespace-nowrap transition-all shrink-0",
                  selectedCategory === cat
                    ? "bg-teal/10 text-teal border-teal/20"
                    : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-teal/30",
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Expanded Filters Drawer (Mobile-friendly Bottom/Top Section) */}
          {showFilters && (
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 animate-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xxs font-black text-slate-400 uppercase tracking-widest px-1">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl outline-none focus:border-teal dark:text-white text-sm font-semibold cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xxs font-black text-slate-400 uppercase tracking-widest px-1">
                    Experience Level
                  </label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl outline-none focus:border-teal dark:text-white text-sm font-semibold cursor-pointer"
                  >
                    {experienceLevels.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xxs font-black text-slate-400 uppercase tracking-widest px-1">
                    Location
                  </label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl outline-none focus:border-teal dark:text-white text-sm font-semibold cursor-pointer"
                  >
                    {locationTypes.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 dark:border-white/5 pt-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedCategory("All Categories");
                    setSelectedLevel("All Levels");
                    setSelectedLocation("All Locations");
                    setSearchQuery("");
                    setSelectedSkill("");
                    setSearchParams({});
                  }}
                >
                  Reset
                </Button>
                <Button
                  size="sm"
                  className="bg-teal text-white"
                  onClick={() => setShowFilters(false)}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="text-navy dark:text-white font-bold">
              {projects.length}
            </span>{" "}
            of{" "}
            <span className="text-navy dark:text-white font-bold">
              {totalCount}
            </span>{" "}
            projects
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase">
              Sort:
            </span>
            <select className="text-sm font-semibold bg-transparent border-none outline-none text-navy dark:text-white cursor-pointer">
              <option>Newest first</option>
              <option>Highest budget</option>
              <option>Lowest budget</option>
            </select>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 gap-6">
          {loading ? (
            Array(5)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 animate-pulse"
                >
                  <div className="h-6 w-1/3 bg-slate-100 dark:bg-white/10 rounded mb-4" />
                  <div className="h-4 w-full bg-slate-100 dark:bg-white/10 rounded mb-2" />
                  <div className="h-4 w-2/3 bg-slate-100 dark:bg-white/10 rounded" />
                </div>
              ))
          ) : error ? (
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-20 text-center text-red-500">
              {error}
            </div>
          ) : projects.length > 0 ? (
            projects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                onApply={() => handleApply(project._id)}
              />
            ))
          ) : (
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-20 text-center">
              <div className="w-20 h-20 bg-slate-50 dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={40} className="text-slate-300" />
              </div>
              <h3 className="text-2xl font-bold text-navy dark:text-white mb-2">
                No projects found
              </h3>
              <p className="text-slate-500 max-w-md mx-auto">
                Try adjusting your filters or search query to find more results.
              </p>
              <Button
                variant="outline"
                className="mt-8"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All Categories");
                  fetchProjects();
                }}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && totalCount > limit && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="rounded-xl"
            >
              <ChevronLeft size={18} className="mr-1" /> Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({
                length: Math.min(5, Math.ceil(totalCount / limit)),
              }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={cn(
                    "w-10 h-10 rounded-xl text-sm font-bold transition-all",
                    currentPage === i + 1
                      ? "bg-teal text-white shadow-lg shadow-teal/20"
                      : "text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10",
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              disabled={currentPage >= Math.ceil(totalCount / limit)}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="rounded-xl"
            >
              Next <ChevronRight size={18} className="ml-1" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

const ProjectCard = ({
  project,
  onApply,
}: {
  project: Project;
  onApply: () => void;
}) => {
  return (
    <div className="group bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 sm:p-8 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-none hover:border-teal/30 transition-all duration-500 relative">
      <div className="flex flex-col gap-5">
        <div>
          {/* Mobile Status Header */}
          <div className="flex items-center justify-between mb-4">
            <span className="px-3 py-1 bg-teal/10 text-teal dark:text-teal-light text-xxs font-black uppercase tracking-widest rounded-full border border-teal/20">
              {project.category}
            </span>
            <div className="flex items-center gap-1.5 text-xxs font-bold text-slate-400 uppercase tracking-wider">
              <Calendar size={12} className="text-slate-300" />
              {new Date(project.createdAt).toLocaleDateString()}
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-navy dark:text-white group-hover:text-teal transition-colors mb-3 leading-tight line-clamp-2">
            {project.title}
          </h2>

          <div className="flex flex-wrap items-center gap-y-3 gap-x-6 mb-5 text-sm sm:text-sm text-slate-600 dark:text-slate-400 font-bold">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal/5 flex items-center justify-center text-teal">
                <Wallet size={14} />
              </div>
              <span>
                {formatBudget(project.budget.minAmount, project.budget.maxAmount)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-royal-blue/5 flex items-center justify-center text-royal-blue">
                <Briefcase size={14} />
              </div>
              <span className="capitalize">
                {project.experienceLevel || "Intermediate"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-400">
                <MapPin size={14} />
              </div>
              <span className="capitalize">{project.location.type}</span>
            </div>
          </div>

          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed mb-6 line-clamp-3 font-medium">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-8">
            {project.requiredSkills.slice(0, 6).map((skill: string) => (
              <span
                key={skill}
                className="px-4 py-2 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-100 dark:border-white/5 shadow-sm"
              >
                {skill}
              </span>
            ))}
            {project.requiredSkills.length > 6 && (
              <span className="px-3 py-2 text-xs text-slate-400 font-black">
                +{project.requiredSkills.length - 6}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-white dark:border-[#050B15] bg-slate-100 dark:bg-white/10 flex items-center justify-center text-xxs font-bold text-slate-400"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <p className="text-xs font-bold text-slate-500">
              <span className="text-navy dark:text-white">
                {project.applications || 0}
              </span>{" "}
              proposals
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-500/10 text-green-600 text-xxs font-black uppercase tracking-wider">
              <CheckCircle2 size={12} />
              Payment Verified
            </div>
            <Button
              onClick={onApply}
              className="flex-1 sm:flex-none bg-teal hover:bg-teal-light text-white h-12 px-8 rounded-2xl font-black shadow-xl shadow-teal/20 transition-all hover:scale-105 active:scale-95 group"
            >
              Apply Now
              <ArrowRight
                size={18}
                className="ml-2 group-hover:translate-x-1 transition-transform"
              />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Internal ArrowRight helper
const ArrowRight = ({
  size,
  className,
}: {
  size: number;
  className?: string;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

export default FindWork;
