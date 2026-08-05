import { SEO } from '@/components/SEO/SEO';
import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PublicNavbar from "@/components/shared/PublicNavbar";
import PublicFooter from "@/components/shared/PublicFooter";
import PublicMain from "@/components/shared/PublicMain";
import { AdUnit } from "@/components/shared/AdUnit";
import { BadgeCheck, ChevronLeft, ChevronRight, Frown, Grid3X3, List, Search, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import freelancerService from "@/services/freelancer.service";
import type {
  FreelancerProfile,
  FreelancerFilters,
} from "@/services/freelancer.service";

const FREELANCER_CATEGORIES = [
  "All",
  "Editing",
  "VFX",
  "3D Design",
  "Motion Graphics",
  "Admin & support",
  "Design & creative",
  "Marketing",
  "Writing & content",
  "AI & emerging tech",
  "Development & tech",
  "Video, audio & animation",
  "Finance & Accounting",
  "Photography",
  "Videography",
  "Wedding & Events",
  "Thumbnail Design",
  "Education",
];

// Custom hook for intersection observer animations
const useInView = (options = {}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.1, ...options },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isInView };
};

// Animated section wrapper
const AnimatedSection = ({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => {
  const { ref, isInView } = useInView();

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700",
        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className,
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <SEO title="Browse Freelancers | ConnectMeIndia" description="Browse and hire the best freelance talent in India for your next project." canonical="/freelancers" />
      {children}
    </div>
  );
};

const FreelancerDirectory = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [freelancers, setFreelancers] = useState<FreelancerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Sync state with URL params when they change
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlCategory = searchParams.get("category") || "All";
    
    setSearchQuery(urlSearch);
    setCategory(urlCategory);
  }, [searchParams]);

  useEffect(() => {
    const fetchFreelancers = async () => {
      setIsLoading(true);
      try {
        const filters: FreelancerFilters = {
          page: currentPage,
          limit: itemsPerPage,
          search: searchQuery || undefined,
          category: category !== "All" ? category : undefined,
        };

        const response = await freelancerService.searchPublic(filters);
        const data = (response as any).data || response;
        setFreelancers(data.profiles || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.totalItems || 0);
      } catch (error) {
        console.error("Failed to fetch freelancers:", error);
      } finally {
        setIsLoading(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchFreelancers();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, category, currentPage]);

  const clearFilters = () => {
    setSearchQuery("");
    setCategory("All");
    setCurrentPage(1);
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050B15] font-sans text-slate-900 dark:text-white overflow-x-hidden">
      <PublicNavbar dark />
      <PublicMain>

      {/* 1. HERO SECTION */}
      <section className="relative pt-20 pb-10 md:pt-32 md:pb-20 overflow-hidden bg-white dark:bg-[#050B15]">
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <AnimatedSection>
            <div className="max-w-3xl">
              <span className="inline-block px-3 py-1 bg-teal/5 border border-teal/10 rounded-full text-xxs font-black text-teal uppercase tracking-[0.2em] mb-6">
                Verified Talent Network
              </span>
              <h1 className="text-4xl md:text-7xl font-black mb-6 text-navy dark:text-white leading-[1.1] tracking-tighter">
                Find the best <br />
                <span className="text-teal">Expert Freelancers</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 leading-relaxed mb-8 max-w-xl font-medium">
                Direct access to top-tier production talent. Curated, verified,
                and ready to scale your next project.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* 2. SEARCH & COMPACT FILTER BAR */}
      <section className="sticky top-0 z-40 bg-white/95 dark:bg-[#050B15]/95 backdrop-blur-xl border-b border-slate-100 dark:border-white/5 py-3 shadow-sm">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 group">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal transition-colors"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search skills, names..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-11 pr-4 py-3 bg-slate-100 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal/10 focus:border-teal transition-all text-sm font-medium"
                />
              </div>
            </div>

            {/* Category Chips Scroll */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
              {FREELANCER_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "px-4 py-1.5 rounded-full border text-xxs font-black uppercase tracking-widest whitespace-nowrap transition-all",
                    category === cat
                      ? "bg-teal/10 text-teal border-teal/20"
                      : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 hover:border-teal/30",
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Ad: Below Filter Bar */}
      <div className="bg-slate-50 dark:bg-[#050B15] py-4">
        <div className="container mx-auto px-4 lg:px-8">
          <AdUnit adSlot="6579276787" format="auto" />
        </div>
      </div>

      {/* 3. MAIN CONTENT AREA */}
      <section className="py-12 pb-32">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Status Bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="text-sm font-bold text-slate-500">
              Analysis found{" "}
              <span className="text-navy dark:text-white font-black">
                {totalCount}
              </span>{" "}
              elite professionals
            </div>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewMode === "grid"
                    ? "bg-white dark:bg-teal text-teal dark:text-white shadow-sm"
                    : "text-slate-400",
                )}
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewMode === "list"
                    ? "bg-white dark:bg-teal text-teal dark:text-white shadow-sm"
                    : "text-slate-400",
                )}
              >
                <List size={16} />
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="w-12 h-12 border-2 border-teal/20 border-t-teal rounded-full animate-spin" />
              <div className="text-xxs font-black uppercase tracking-[0.2em] text-slate-500">
                Querying Database
              </div>
            </div>
          ) : freelancers.length > 0 ? (
            <div
              className={cn(
                "grid gap-6 sm:gap-8",
                viewMode === "grid"
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1",
              )}
            >
              {freelancers.map((f, idx) => {
                const name = f.displayName || `${f.firstName} ${f.lastName}`;
                return (
                  <AnimatedSection key={f._id} delay={idx * 50}>
                    <Link
                      to={`/freelancer/${f._id}`}
                      className="block group h-full"
                    >
                      <div
                        className={cn(
                          "bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-6 sm:p-8 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-none hover:border-teal/30 transition-all duration-500 relative flex flex-col h-full",
                          viewMode === "list" &&
                            "sm:flex-row gap-8 sm:items-center",
                        )}
                      >
                        <div
                          className={cn(
                            "flex items-start gap-5 mb-6",
                            viewMode === "list" && "sm:mb-0 sm:w-1/3",
                          )}
                        >
                          <div className="relative shrink-0">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[1.5rem] overflow-hidden border-4 border-white dark:border-white/5 shadow-2xl">
                              {f.profilePicture ? (
                                <img
                                  src={f.profilePicture}
                                  alt={name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-teal to-royal-blue flex items-center justify-center text-white text-2xl font-black">
                                  {f.firstName[0]}
                                  {f.lastName[0]}
                                </div>
                              )}
                            </div>
                            {f.isVerified && (
                              <div className="absolute -top-2 -right-2 bg-white dark:bg-teal p-1.5 rounded-full shadow-lg border-2 border-teal dark:border-white/10">
                                <BadgeCheck
                                  size={14}
                                  className="text-teal dark:text-white"
                                />
                              </div>
                            )}
                            {f.featuredProfile && (
                              <div
                                data-testid="featured-ribbon"
                                className="absolute -bottom-2 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-2 py-0.5 bg-teal-500 text-white rounded-full text-xxs font-bold uppercase tracking-wide shadow-md"
                                title="Top of search results"
                              >
                                <Zap size={10} className="fill-white" />
                                Featured
                              </div>
                            )}
                            {f.isProActive && (
                              <div
                                data-testid="pro-member-badge"
                                className="absolute -top-2 -left-2 inline-flex items-center gap-1 px-1.5 py-0.5 bg-white border border-teal-500/30 text-teal-700 rounded-full text-[9px] font-bold shadow-md"
                                title="Pro Member"
                              >
                                <Zap size={9} className="fill-teal-500 text-teal-500" />
                                Pro
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1 pt-2">
                            <h3 className="text-xl sm:text-2xl font-black text-navy dark:text-white truncate group-hover:text-teal transition-colors">
                              {name}
                            </h3>
                            <p className="text-xs font-black text-teal uppercase tracking-widest mb-1 truncate">
                              {f.categories?.[0]}
                            </p>
                            <div className="flex items-center gap-1.5 mt-2">
                              <div className="flex items-center gap-0.5">
                                <Star
                                  size={14}
                                  className="text-yellow-400 fill-yellow-400"
                                />
                                <span className="text-sm font-black text-navy dark:text-white">
                                  {f.averageRating.toFixed(1)}
                                </span>
                              </div>
                              <span className="text-xxs font-bold text-slate-400 uppercase">
                                ({f.reviewCount})
                              </span>
                            </div>
                          </div>
                        </div>

                        <div
                          className={cn(
                            "flex-1 flex flex-col",
                            viewMode === "list" && "sm:justify-center",
                          )}
                        >
                          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 mb-6 font-medium">
                            {f.headline ||
                              "Seasoned creative professional specializing in high-end production and visual storytelling."}
                          </p>

                          <div className="flex flex-wrap gap-2 mb-8">
                            {f.skills.slice(0, 3).map((skill) => (
                              <span
                                key={skill.name}
                                className="px-3 py-1.5 bg-slate-50 dark:bg-white/10 border border-slate-100 dark:border-white/5 rounded-xl text-xxs font-black uppercase text-slate-500 dark:text-slate-300"
                              >
                                {skill.name}
                              </span>
                            ))}
                            {f.skills.length > 3 && (
                              <span className="text-xxs font-bold text-slate-400 self-center">
                                + {f.skills.length - 3}
                              </span>
                            )}
                          </div>

                          <div className="mt-auto pt-6 border-t border-slate-100 dark:border-white/5">
                            <div className="h-12 px-6 bg-navy dark:bg-teal text-white rounded-2xl flex items-center justify-center font-black text-xxs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-navy/10 dark:shadow-teal/20">
                              View Profile
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </AnimatedSection>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-3xl flex items-center justify-center mb-8 border border-slate-200 dark:border-white/10 group animate-pulse">
                <Frown size={48} className="text-slate-400" />
              </div>
              <h3 className="text-3xl font-black mb-4 text-navy dark:text-white leading-tight">
                No Mastery Matches
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-10 font-medium">
                We couldn't find professionals matching these specific
                credentials. Try broadening your criteria.
              </p>
              <Button
                onClick={clearFilters}
                className="h-14 px-10 rounded-2xl bg-teal text-white font-black uppercase tracking-widest"
              >
                Clear Filters
              </Button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-20">
              <Button
                variant="ghost"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="h-12 px-6 rounded-xl font-black text-xxs uppercase tracking-widest text-slate-500 disabled:opacity-20"
              >
                <ChevronLeft size={16} className="mr-2" />
                Previous
              </Button>

              <div className="flex items-center gap-2 max-w-full overflow-x-auto no-scrollbar px-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        "w-10 h-10 rounded-xl transition-all text-xs font-black",
                        currentPage === page
                          ? "bg-teal text-white shadow-xl shadow-teal/20"
                          : "text-slate-400 hover:text-navy dark:hover:text-white",
                      )}
                    >
                      {page}
                    </button>
                  ),
                )}
              </div>

              <Button
                variant="ghost"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="h-12 px-6 rounded-xl font-black text-xxs uppercase tracking-widest text-slate-500 disabled:opacity-20"
              >
                Next
                <ChevronRight size={16} className="ml-2" />
              </Button>
            </div>
          )}
        </div>
      </section>



      </PublicMain>
      <PublicFooter />
    </div>
  );
};

export default FreelancerDirectory;
