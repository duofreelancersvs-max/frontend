import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import PublicNavbar from "@/components/shared/PublicNavbar";
import PublicFooter from "@/components/shared/PublicFooter";
import {
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Search,
  X,
  Star,
  MapPin,
  BadgeCheck,
  Filter,
  Grid3X3,
  List,
  ArrowRight,
  Frown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import freelancerService from "@/services/freelancer.service";
import type {
  FreelancerProfile,
  FreelancerFilters,
} from "@/services/freelancer.service";

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
      {children}
    </div>
  );
};

const FreelancerDirectory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [experience, setExperience] = useState("All");
  const [rateRange, setRateRange] = useState("All");
  const [location, setLocation] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 8;

  const [freelancers, setFreelancers] = useState<FreelancerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchFreelancers = async () => {
      setIsLoading(true);
      try {
        const filters: FreelancerFilters = {
          page: currentPage,
          limit: itemsPerPage,
          search: searchQuery || undefined,
          category: category !== "All" ? category : undefined,
          experienceLevel:
            experience !== "All"
              ? (experience.toLowerCase() as any)
              : undefined,
        };

        if (rateRange !== "All") {
          if (rateRange === "0-500") filters.maxRate = 500;
          else if (rateRange === "500-1000") {
            filters.minRate = 501;
            filters.maxRate = 1000;
          } else if (rateRange === "1000+") {
            filters.minRate = 1001;
          }
        }

        if (location !== "All") {
          filters.location = location as any;
        }

        const response = await freelancerService.search(filters);
        const data = (response as any).data || response;
        setFreelancers(data.profiles || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.totalItems || 0);
      } catch (error) {
        console.error("Failed to fetch freelancers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchFreelancers();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, category, experience, rateRange, location, currentPage]);

  const clearFilters = () => {
    setSearchQuery("");
    setCategory("All");
    setExperience("All");
    setRateRange("All");
    setLocation("All");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchQuery ||
    category !== "All" ||
    experience !== "All" ||
    rateRange !== "All" ||
    location !== "All";

  return (
    <div className="min-h-screen bg-[#050B15] font-sans text-white overflow-x-hidden">
      <PublicNavbar />

      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-16 md:pt-48 md:pb-24 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-plus-pattern opacity-[0.03]" />
        <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-royal-blue/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <AnimatedSection>
            <div className="max-w-3xl">
              <span className="inline-block px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-xs font-bold text-teal-light mb-8 uppercase tracking-widest">
                The Network
              </span>
              <h1 className="text-5xl md:text-7xl font-bold mb-8">
                Elite Creative <br />
                <span className="text-gradient">Powerhouse</span>
              </h1>
              <p className="text-xl text-slate-400 leading-relaxed mb-10 max-w-2xl">
                Source high-end production talent. Each professional in our
                directory undergoes a rigorous 5-point verification process.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* 2. SEARCH & FILTER BAR */}
      <section className="sticky top-0 z-50 py-4 bg-[#050B15]/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md group">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal transition-colors"
                size={20}
              />
              <input
                type="text"
                placeholder="Search talent or mastery..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all text-sm placeholder:text-slate-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Desktop Filters */}
            <div className="hidden lg:flex items-center gap-3">
              {[
                {
                  value: category,
                  setter: setCategory,
                  options: ["All", "Video Editing", "VFX", "3D Design"],
                  label: "Capability",
                },
                {
                  value: experience,
                  setter: setExperience,
                  options: ["All", "Entry", "Intermediate", "Expert"],
                  label: "Tier",
                },
                {
                  value: rateRange,
                  setter: setRateRange,
                  options: ["All", "0-500", "500-1000", "1000+"],
                  label: "Investment",
                },
              ].map((filter, idx) => (
                <div key={idx} className="relative group">
                  <select
                    value={filter.value}
                    onChange={(e) => {
                      filter.setter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="appearance-none px-5 py-3 pr-10 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-teal/50 hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <option value="All" className="bg-[#050B15]">
                      All {filter.label}s
                    </option>
                    {filter.options
                      .filter((o) => o !== "All")
                      .map((opt) => (
                        <option key={opt} value={opt} className="bg-[#050B15]">
                          {opt}
                        </option>
                      ))}
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-hover:text-white transition-colors"
                    size={14}
                  />
                </div>
              ))}

              {hasActiveFilters && (
                <Button
                  onClick={clearFilters}
                  variant="ghost"
                  className="text-xs font-bold text-royal-blue hover:text-royal-blue/80 hover:bg-transparent px-2"
                >
                  RESET
                </Button>
              )}
            </div>

            {/* View Mode */}
            <div className="hidden lg:flex items-center gap-1 bg-white/5 rounded-2xl p-1 ml-auto">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded-xl transition-all",
                  viewMode === "grid"
                    ? "bg-teal shadow-lg shadow-teal/20 text-white"
                    : "text-slate-500 hover:text-white",
                )}
              >
                <Grid3X3 size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 rounded-xl transition-all",
                  viewMode === "list"
                    ? "bg-teal shadow-lg shadow-teal/20 text-white"
                    : "text-slate-500 hover:text-white",
                )}
              >
                <List size={18} />
              </button>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center justify-center gap-2 px-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-white/10"
            >
              <Filter size={18} />
              Refine
              {hasActiveFilters && (
                <div className="w-1.5 h-1.5 bg-teal rounded-full animate-pulse" />
              )}
            </button>
          </div>
        </div>
      </section>

      {/* 3. MAIN CONTENT AREA */}
      <section className="py-12 pb-32">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Status Bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="text-sm text-slate-400">
              Analysis found{" "}
              <span className="text-white font-bold">{totalCount}</span> elite
              professionals
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="w-12 h-12 border-2 border-teal/20 border-t-teal rounded-full animate-spin" />
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Querying Database
              </div>
            </div>
          ) : freelancers.length > 0 ? (
            <div
              className={cn(
                "grid gap-8",
                viewMode === "grid"
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1",
              )}
            >
              {freelancers.map((f, idx) => {
                const name = f.displayName || `${f.firstName} ${f.lastName}`;
                return (
                  <AnimatedSection key={f._id} delay={idx * 50}>
                    <Link to={`/freelancer/${f._id}`} className="block group">
                      <div
                        className={cn(
                          "glass-card rounded-[2rem] border-white/5 hover:border-white/10 hover:bg-white/[0.07] transition-all duration-500 overflow-hidden relative",
                          viewMode === "list" && "flex h-64",
                        )}
                      >
                        {/* Card Header/Preview */}
                        <div
                          className={cn(
                            "relative bg-gradient-to-br from-royal-blue/20 to-[#050B15]",
                            viewMode === "grid" ? "h-24" : "w-1/3",
                          )}
                        >
                          {f.isVerified && (
                            <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full flex items-center gap-1.5 border border-white/10">
                              <BadgeCheck size={12} className="text-teal" />
                              <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                                Verified Artist
                              </span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-plus-pattern opacity-[0.05]" />
                        </div>

                        {/* Card Content */}
                        <div
                          className={cn(
                            "p-8 pt-0 relative",
                            viewMode === "grid"
                              ? "-mt-10"
                              : "flex-1 flex flex-col justify-center pt-8",
                          )}
                        >
                          {/* Avatar */}
                          <div
                            className={cn(
                              "relative mb-6",
                              viewMode === "list" && "mb-4",
                            )}
                          >
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal to-royal-blue p-0.5 group-hover:scale-105 transition-transform duration-500 shadow-xl shadow-black/40">
                              <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-[#050B15] bg-navy">
                                {f.profilePicture ? (
                                  <img
                                    src={f.profilePicture}
                                    alt={name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white/20">
                                    {f.firstName[0]}
                                    {f.lastName[0]}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-teal rounded-full border-4 border-[#121A2A] flex items-center justify-center shadow-lg">
                              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                            </div>
                          </div>

                          <h3 className="text-xl font-bold mb-1 group-hover:text-teal-light transition-colors">
                            {name}
                          </h3>
                          <p className="text-sm text-slate-400 mb-4 line-clamp-1">
                            {f.headline || f.category}
                          </p>

                          <div className="flex items-center gap-4 mb-6">
                            <div className="flex items-center gap-1.5">
                              <Star size={14} className="text-teal fill-teal" />
                              <span className="text-sm font-bold">
                                {f.averageRating.toFixed(1)}
                              </span>
                            </div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                              {f.reviewCount} Reports
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-8">
                            {f.skills.slice(0, 2).map((skill) => (
                              <span
                                key={skill.name}
                                className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-300 border border-white/5"
                              >
                                {skill.name}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center justify-between border-t border-white/5 pt-6 mt-auto">
                            <div>
                              <span className="text-xl font-bold">
                                ₹{f.hourlyRate}
                              </span>
                              <span className="text-xs text-slate-500 font-bold ml-1">
                                /HR
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
                              <MapPin size={12} className="text-teal" />
                              {f.category.split(" ")[0]}
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
              <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mb-8 border border-white/10 group animate-pulse">
                <Frown
                  size={48}
                  className="text-slate-600 group-hover:text-teal transition-colors"
                />
              </div>
              <h3 className="text-3xl font-bold mb-4">No Mastery Matches</h3>
              <p className="text-slate-400 max-w-md mx-auto mb-10 leading-relaxed">
                We couldn't find professionals matching these specific
                credentials. Try broadening your criteria.
              </p>
              <Button
                onClick={clearFilters}
                className="h-14 px-10 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10"
              >
                Clear Filters
              </Button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-20">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="h-14 px-6 rounded-2xl border-white/5 bg-white/5 hover:bg-white/10 text-white disabled:opacity-20"
              >
                <ChevronLeft size={20} className="mr-2" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        "w-12 h-12 rounded-2xl border transition-all text-sm font-bold",
                        currentPage === page
                          ? "bg-teal border-teal shadow-lg shadow-teal/20 text-white"
                          : "bg-white/5 border-white/10 text-slate-500 hover:text-white hover:border-teal/50",
                      )}
                    >
                      {page}
                    </button>
                  ),
                )}
              </div>

              <Button
                variant="outline"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="h-14 px-6 rounded-2xl border-white/5 bg-white/5 hover:bg-white/10 text-white disabled:opacity-20"
              >
                Next
                <ChevronRight size={20} className="ml-2" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="py-24 border-t border-white/5 bg-gradient-to-t from-teal/10 to-transparent">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <AnimatedSection>
            <h2 className="text-4xl font-bold mb-6">
              Are You a Creative Elite?
            </h2>
            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
              Join our private network of high-end professionals and get matched
              with production-level projects.
            </p>
            <Link to="/register">
              <Button className="h-16 px-12 rounded-2xl bg-teal hover:bg-teal-light text-white font-bold text-lg shadow-2xl shadow-teal/20 transition-all hover:-translate-y-1">
                Apply for Roster
                <ArrowRight size={20} className="ml-2" />
              </Button>
            </Link>
          </AnimatedSection>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default FreelancerDirectory;
