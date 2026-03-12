import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Logo from "@/components/shared/Logo";
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
  Users,
  Frown,
  Twitter,
  Linkedin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

// Mock freelancer data
const generateFreelancers = () => [
  {
    id: 1,
    name: "Vikram Sharma",
    title: "Senior Video Editor",
    avatar: "VS",
    rating: 4.9,
    reviews: 127,
    rate: 800,
    location: "Hyderabad, Telangana",
    skills: ["Premiere Pro", "After Effects", "DaVinci"],
    category: "Video Editing",
    experience: "Expert",
    verified: true,
  },
  {
    id: 2,
    name: "Priya Reddy",
    title: "VFX Artist & Compositor",
    avatar: "PR",
    rating: 4.8,
    reviews: 89,
    rate: 1200,
    location: "Vijayawada, AP",
    skills: ["Nuke", "Houdini", "After Effects"],
    category: "VFX",
    experience: "Expert",
    verified: true,
  },
  {
    id: 3,
    name: "Arjun Kumar",
    title: "3D Generalist",
    avatar: "AK",
    rating: 5.0,
    reviews: 43,
    rate: 1000,
    location: "Visakhapatnam, AP",
    skills: ["Blender", "Maya", "ZBrush"],
    category: "3D Design",
    experience: "Intermediate",
    verified: true,
  },
  {
    id: 4,
    name: "Sneha Rao",
    title: "Motion Graphics Designer",
    avatar: "SR",
    rating: 4.7,
    reviews: 156,
    rate: 600,
    location: "Hyderabad, Telangana",
    skills: ["After Effects", "Cinema 4D", "Lottie"],
    category: "VFX",
    experience: "Intermediate",
    verified: false,
  },
  {
    id: 5,
    name: "Karthik Menon",
    title: "Color Grading Specialist",
    avatar: "KM",
    rating: 4.9,
    reviews: 78,
    rate: 900,
    location: "Hyderabad, Telangana",
    skills: ["DaVinci Resolve", "Baselight"],
    category: "Video Editing",
    experience: "Expert",
    verified: true,
  },
  {
    id: 6,
    name: "Lakshmi Devi",
    title: "Video Editor",
    avatar: "LD",
    rating: 4.6,
    reviews: 34,
    rate: 400,
    location: "Warangal, Telangana",
    skills: ["Premiere Pro", "Final Cut"],
    category: "Video Editing",
    experience: "Entry",
    verified: false,
  },
  {
    id: 7,
    name: "Ravi Teja",
    title: "3D Animator",
    avatar: "RT",
    rating: 4.8,
    reviews: 67,
    rate: 1100,
    location: "Guntur, AP",
    skills: ["Maya", "Blender", "Unity"],
    category: "3D Design",
    experience: "Expert",
    verified: true,
  },
  {
    id: 8,
    name: "Anjali Krishnan",
    title: "VFX Supervisor",
    avatar: "AK",
    rating: 5.0,
    reviews: 23,
    rate: 1500,
    location: "Hyderabad, Telangana",
    skills: ["Nuke", "Flame", "After Effects"],
    category: "VFX",
    experience: "Expert",
    verified: true,
  },
  {
    id: 9,
    name: "Suresh Babu",
    title: "Video Editor & Colorist",
    avatar: "SB",
    rating: 4.5,
    reviews: 45,
    rate: 500,
    location: "Tirupati, AP",
    skills: ["Premiere Pro", "DaVinci"],
    category: "Video Editing",
    experience: "Intermediate",
    verified: false,
  },
  {
    id: 10,
    name: "Meera Nair",
    title: "Motion Designer",
    avatar: "MN",
    rating: 4.7,
    reviews: 91,
    rate: 700,
    location: "Hyderabad, Telangana",
    skills: ["After Effects", "Illustrator"],
    category: "VFX",
    experience: "Intermediate",
    verified: true,
  },
  {
    id: 11,
    name: "Aditya Rao",
    title: "3D Modeler",
    avatar: "AR",
    rating: 4.4,
    reviews: 28,
    rate: 600,
    location: "Karimnagar, Telangana",
    skills: ["Blender", "3ds Max"],
    category: "3D Design",
    experience: "Entry",
    verified: false,
  },
  {
    id: 12,
    name: "Pooja Sharma",
    title: "Video Editor",
    avatar: "PS",
    rating: 4.8,
    reviews: 112,
    rate: 550,
    location: "Nellore, AP",
    skills: ["Premiere Pro", "After Effects"],
    category: "Video Editing",
    experience: "Intermediate",
    verified: true,
  },
];

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

  const allFreelancers = generateFreelancers();

  // Filter freelancers
  const filteredFreelancers = allFreelancers.filter((freelancer) => {
    const matchesSearch =
      searchQuery === "" ||
      freelancer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      freelancer.skills.some((skill) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    const matchesCategory =
      category === "All" || freelancer.category === category;
    const matchesExperience =
      experience === "All" || freelancer.experience === experience;
    const matchesLocation =
      location === "All" ||
      (location === "Telangana" && freelancer.location.includes("Telangana")) ||
      (location === "Andhra Pradesh" && freelancer.location.includes("AP"));

    const matchesRate =
      rateRange === "All" ||
      (rateRange === "0-500" && freelancer.rate <= 500) ||
      (rateRange === "500-1000" &&
        freelancer.rate > 500 &&
        freelancer.rate <= 1000) ||
      (rateRange === "1000+" && freelancer.rate > 1000);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesExperience &&
      matchesLocation &&
      matchesRate
    );
  });

  const totalPages = Math.ceil(filteredFreelancers.length / itemsPerPage);
  const paginatedFreelancers = filteredFreelancers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

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
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm py-4">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between">
            <Logo size="sm" />

            <div className="hidden md:flex items-center gap-6">
              <Link
                to="/"
                className="text-sm font-medium text-slate-600 hover:text-navy transition-colors"
              >
                Home
              </Link>
              <Link
                to="/freelancers"
                className="text-sm font-medium text-royal-blue"
              >
                Find Talent
              </Link>
              <Link
                to="/how-it-works"
                className="text-sm font-medium text-slate-600 hover:text-navy transition-colors"
              >
                How It Works
              </Link>
              <Link
                to="/pricing"
                className="text-sm font-medium text-slate-600 hover:text-navy transition-colors"
              >
                Pricing
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" className="text-royal-blue font-semibold">
                Log In
              </Button>
              <Button className="bg-teal hover:bg-teal-light text-white font-semibold px-6">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* 1. PAGE HEADER */}
      <section className="relative py-16 bg-[#050B15] overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#050B15] via-navy to-royal-blue" />
        <div className="absolute inset-0 bg-plus-pattern opacity-[0.05]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-royal-blue/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-teal/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-6">
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight size={16} />
            <span className="text-white">Find Talent</span>
          </nav>

          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Find Creative{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-light to-sky-blue">
                Talent
              </span>
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed">
              Browse 500+ verified freelancers specializing in Video Editing,
              VFX, and 3D Design
            </p>
          </div>
        </div>
      </section>

      {/* 2. SEARCH & FILTER BAR */}
      <section className="sticky top-[72px] z-40 bg-white border-b border-slate-100 shadow-sm py-4">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Search Row */}
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by name or skill..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Filter Toggle (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50"
            >
              <Filter size={18} />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-teal rounded-full" />
              )}
            </button>

            {/* Desktop Filters */}
            <div className="hidden lg:flex items-center gap-3 flex-wrap">
              {/* Category */}
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none px-4 py-3 pr-10 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  <option value="Video Editing">Video Editing</option>
                  <option value="VFX">VFX & Motion</option>
                  <option value="3D Design">3D Design</option>
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  size={16}
                />
              </div>

              {/* Experience */}
              <div className="relative">
                <select
                  value={experience}
                  onChange={(e) => {
                    setExperience(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none px-4 py-3 pr-10 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal cursor-pointer"
                >
                  <option value="All">All Levels</option>
                  <option value="Entry">Entry Level</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Expert">Expert</option>
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  size={16}
                />
              </div>

              {/* Rate Range */}
              <div className="relative">
                <select
                  value={rateRange}
                  onChange={(e) => {
                    setRateRange(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none px-4 py-3 pr-10 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal cursor-pointer"
                >
                  <option value="All">Any Rate</option>
                  <option value="0-500">₹0 - ₹500/hr</option>
                  <option value="500-1000">₹500 - ₹1000/hr</option>
                  <option value="1000+">₹1000+/hr</option>
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  size={16}
                />
              </div>

              {/* Location */}
              <div className="relative">
                <select
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none px-4 py-3 pr-10 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal cursor-pointer"
                >
                  <option value="All">All Locations</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  size={16}
                />
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-royal-blue hover:text-royal-blue/80 font-medium"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="hidden lg:flex items-center gap-1 bg-slate-100 rounded-lg p-1 ml-auto">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === "grid"
                    ? "bg-white shadow-sm text-navy"
                    : "text-slate-400 hover:text-slate-600",
                )}
              >
                <Grid3X3 size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === "list"
                    ? "bg-white shadow-sm text-navy"
                    : "text-slate-400 hover:text-slate-600",
                )}
              >
                <List size={18} />
              </button>
            </div>
          </div>

          {/* Mobile Filters Dropdown */}
          <div
            className={cn(
              "lg:hidden overflow-hidden transition-all duration-300",
              showFilters ? "max-h-60 mt-4" : "max-h-0",
            )}
          >
            <div className="grid grid-cols-2 gap-3">
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-3 border border-slate-200 rounded-xl bg-white text-sm"
              >
                <option value="All">All Categories</option>
                <option value="Video Editing">Video Editing</option>
                <option value="VFX">VFX & Motion</option>
                <option value="3D Design">3D Design</option>
              </select>
              <select
                value={experience}
                onChange={(e) => {
                  setExperience(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-3 border border-slate-200 rounded-xl bg-white text-sm"
              >
                <option value="All">All Levels</option>
                <option value="Entry">Entry Level</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Expert">Expert</option>
              </select>
              <select
                value={rateRange}
                onChange={(e) => {
                  setRateRange(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-3 border border-slate-200 rounded-xl bg-white text-sm"
              >
                <option value="All">Any Rate</option>
                <option value="0-500">₹0 - ₹500/hr</option>
                <option value="500-1000">₹500 - ₹1000/hr</option>
                <option value="1000+">₹1000+/hr</option>
              </select>
              <select
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-3 border border-slate-200 rounded-xl bg-white text-sm"
              >
                <option value="All">All Locations</option>
                <option value="Telangana">Telangana</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
              </select>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-full mt-3 text-sm text-royal-blue font-medium"
              >
                Clear All Filters
              </button>
            )}
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mt-4 text-sm">
            <span className="text-slate-500">
              Showing{" "}
              <span className="font-semibold text-navy">
                {filteredFreelancers.length}
              </span>{" "}
              freelancers
            </span>
          </div>
        </div>
      </section>

      {/* 3. FREELANCER GRID */}
      <section className="py-8 bg-slate-50 min-h-[60vh]">
        <div className="container mx-auto px-4 lg:px-8">
          {paginatedFreelancers.length > 0 ? (
            <div
              className={cn(
                "grid gap-6",
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1",
              )}
            >
              {paginatedFreelancers.map((freelancer, idx) => (
                <AnimatedSection key={freelancer.id} delay={idx * 50}>
                  <div
                    className={cn(
                      "bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-500 group",
                      viewMode === "list" && "flex",
                    )}
                  >
                    {/* Cover/Header */}
                    <div
                      className={cn(
                        "bg-gradient-to-r from-navy to-royal-blue relative",
                        viewMode === "grid" ? "h-20" : "w-32 flex-shrink-0",
                      )}
                    >
                      {freelancer.verified && (
                        <div
                          className={cn(
                            "absolute bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1",
                            viewMode === "grid"
                              ? "top-3 right-3"
                              : "top-2 left-2",
                          )}
                        >
                          <BadgeCheck
                            size={12}
                            className="text-gold fill-gold"
                          />
                          <span className="text-xs text-white font-medium">
                            Verified
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div
                      className={cn(
                        "p-5 relative",
                        viewMode === "grid" ? "-mt-10" : "flex-1",
                      )}
                    >
                      {/* Avatar */}
                      <div
                        className={cn(
                          "rounded-xl bg-gradient-to-br from-teal to-teal-light flex items-center justify-center text-white font-bold border-4 border-white shadow-lg group-hover:scale-110 transition-transform",
                          viewMode === "grid"
                            ? "w-16 h-16 text-lg mb-3"
                            : "w-12 h-12 text-base absolute -left-6 top-1/2 -translate-y-1/2",
                        )}
                      >
                        {freelancer.avatar}
                      </div>

                      <div className={viewMode === "list" ? "ml-8" : ""}>
                        {/* Name & Title */}
                        <h3 className="font-bold text-navy text-lg group-hover:text-royal-blue transition-colors">
                          {freelancer.name}
                        </h3>
                        <p className="text-slate-500 text-sm mb-3">
                          {freelancer.title}
                        </p>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1">
                            <Star size={14} className="text-gold fill-gold" />
                            <span className="text-sm font-semibold text-navy">
                              {freelancer.rating}
                            </span>
                          </div>
                          <span className="text-slate-400 text-sm">
                            ({freelancer.reviews} reviews)
                          </span>
                        </div>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {freelancer.skills.slice(0, 3).map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-1 bg-teal/10 text-teal rounded-md text-xs font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>

                        {/* Rate & Location */}
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <span className="text-xl font-bold text-navy">
                              ₹{freelancer.rate}
                            </span>
                            <span className="text-slate-400 text-sm">/hr</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-500 text-sm">
                            <MapPin size={14} />
                            <span>{freelancer.location.split(",")[0]}</span>
                          </div>
                        </div>

                        {/* CTA */}
                        <Button
                          variant="outline"
                          className="w-full border-royal-blue text-royal-blue hover:bg-royal-blue hover:text-white"
                        >
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          ) : (
            /* 5. EMPTY STATE */
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <Frown size={48} className="text-slate-300" />
              </div>
              <h3 className="text-2xl font-bold text-navy mb-2">
                No freelancers found
              </h3>
              <p className="text-slate-500 mb-6 max-w-md">
                Try adjusting your filters or search query to find the perfect
                creative professional.
              </p>
              <Button
                onClick={clearFilters}
                className="bg-teal hover:bg-teal-light text-white"
              >
                Clear All Filters
              </Button>
            </div>
          )}

          {/* 4. PAGINATION */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="border-slate-200"
              >
                <ChevronLeft size={16} />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        "w-10 h-10 rounded-lg text-sm font-medium transition-colors",
                        currentPage === page
                          ? "bg-teal text-white"
                          : "text-slate-600 hover:bg-slate-100",
                      )}
                    >
                      {page}
                    </button>
                  ),
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="border-slate-200"
              >
                Next
                <ChevronRight size={16} />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* 6. CTA SECTION */}
      <section className="py-20 bg-gradient-to-r from-teal to-teal-light relative overflow-hidden">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <AnimatedSection>
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users size={32} className="text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Are You a Creative Professional?
              </h2>
              <p className="text-white/90 text-xl mb-8 leading-relaxed">
                Join 500+ freelancers earning on ConnectMeIndia. Showcase your
                skills and connect with clients in your region.
              </p>
              <Button
                size="lg"
                className="bg-white text-teal hover:bg-slate-100 font-bold text-lg px-10 py-7 rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
              >
                Join as Freelancer
                <ArrowRight size={20} className="ml-2" />
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="bg-navy text-white pt-20 pb-8">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="mb-6">
                <Logo isDark size="sm" />
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                The premier marketplace for creative professionals in Telangana
                and Andhra Pradesh.
              </p>
              <div className="flex gap-3">
                {[Twitter, Linkedin].map((Icon, idx) => (
                  <a
                    key={idx}
                    href="#"
                    className="w-10 h-10 rounded-lg bg-white/5 hover:bg-teal flex items-center justify-center transition-colors"
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            {[
              {
                title: "For Clients",
                links: ["Find Talent", "Post Project", "Pricing", "Enterprise"],
              },
              {
                title: "For Freelancers",
                links: [
                  "Create Profile",
                  "Browse Jobs",
                  "Subscription",
                  "Resources",
                ],
              },
              {
                title: "Support",
                links: ["Contact Us", "Help Center", "Privacy Policy", "Terms"],
              },
            ].map((section) => (
              <div key={section.title}>
                <h3 className="font-bold text-lg mb-6">{section.title}</h3>
                <ul className="space-y-4">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-slate-400 hover:text-teal transition-colors text-sm"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © 2024 ConnectMeIndia. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <MapPin size={14} />
              <span>Made with ❤️ in Hyderabad</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FreelancerDirectory;
