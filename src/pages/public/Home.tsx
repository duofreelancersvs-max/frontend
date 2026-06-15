import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Film,
  Sparkles,
  Star,
  ArrowRight,
  Users,
  Layout,
  User,
  Zap,
  Search,
  BadgeCheck,
  Building,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import PublicNavbar from "@/components/shared/PublicNavbar";
import PublicFooter from "@/components/shared/PublicFooter";
import freelancerService from "@/services/freelancer.service";
import type { FreelancerProfile } from "@/services/freelancer.service";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

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

const Home = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [searchFocused, setSearchFocused] = useState(false);
  const [heroQuery, setHeroQuery] = useState("");
  const [heroResults, setHeroResults] = useState<FreelancerProfile[]>([]);
  const [heroSearching, setHeroSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Redirect admins away from the public home page
  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Debounced API call for Hero Search
  useEffect(() => {
    if (!heroQuery.trim()) {
      setHeroResults([]);
      setShowDropdown(false);
      return;
    }
    setHeroSearching(true);
    setShowDropdown(true);
    const timer = setTimeout(async () => {
      try {
        const res = await freelancerService.search({
          search: heroQuery.trim(),
          limit: 5,
        });
        const data = (res as any).data || res;
        setHeroResults(data.profiles || []);
      } catch {
        setHeroResults([]);
      } finally {
        setHeroSearching(false);
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [heroQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") setShowDropdown(false);
      if (e.key === "Enter") {
        e.preventDefault();
        if (heroQuery.trim()) {
          navigate(
            `/freelancers?search=${encodeURIComponent(heroQuery.trim())}`,
          );
          setShowDropdown(false);
        }
      }
    },
    [heroQuery, navigate],
  );

  const handleSearchSubmit = () => {
    if (heroQuery.trim()) {
      navigate(`/freelancers?search=${encodeURIComponent(heroQuery.trim())}`);
      setShowDropdown(false);
    }
  };

  const categories = [
    {
      name: "Video Editing",
      count: 127,
      icon: Film,
      color: "from-blue-500 to-blue-600",
      desc: "Professional cuts, transitions & storytelling",
    },
    {
      name: "CA Charted Accountant",
      count: 89,
      icon: Building,
      color: "from-purple-500 to-pink-500",
      desc: "Financial audits, taxation & business advisory",
    },
    {
      name: "Web Development",
      count: 156,
      icon: Layout,
      color: "from-teal to-emerald-500",
      desc: "Custom websites, e-commerce & web apps",
    },
    {
      name: "VFX & Motion",
      count: 64,
      icon: Sparkles,
      color: "from-orange-500 to-red-500",
      desc: "Cinematic visual effects & motion graphics",
    },
  ];

  const plans = [
    {
      name: "Free",
      description: "Perfect for getting started",
      monthlyPrice: 0,
      highlighted: false,
      buttonText: "Get Started",
      features: ["Create profile", "5 applications/month", "Basic support"],
    },
    {
      name: "Pro",
      description: "For serious freelancers",
      monthlyPrice: 399,
      highlighted: true,
      buttonText: "Subscribe Now",
      features: [
        "Unlimited applications",
        "Priority support",
        "Top priority in search",
      ],
    },
  ];

  const testimonials = [
    {
      quote:
        "Found an incredible VFX artist who understood the Telugu film aesthetic perfectly.",
      author: "Rajesh Kumar",
      role: "Film Director",
      avatar: "RK",
    },
    {
      quote:
        "The quality of video editors here is exceptional. Every project exceeded expectations.",
      author: "Priya Sharma",
      role: "YouTube Content Creator",
      avatar: "PS",
    },
  ];

  const [topFreelancers, setTopFreelancers] = useState<FreelancerProfile[]>([]);
  const [isLoadingFreelancers, setIsLoadingFreelancers] = useState(true);

  useEffect(() => {
    const fetchTopFreelancers = async () => {
      try {
        const response = await freelancerService.getTopRated();
        const data = (response as any).data || response;
        setTopFreelancers(data.profiles?.slice(0, 4) || []);
      } catch (error) {
        console.error("Failed to fetch top freelancers:", error);
      } finally {
        setIsLoadingFreelancers(false);
      }
    };
    fetchTopFreelancers();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050B15] font-sans text-slate-900 dark:text-white overflow-x-hidden">
      {/* Floating Scroll Progress */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-100 dark:bg-white/10 z-[100]">
        <div
          className="h-full bg-gradient-to-r from-teal to-royal-blue transition-all duration-150"
          style={{
            width: `${Math.min(((typeof window !== "undefined" ? window.scrollY : 0) / (document.documentElement.scrollHeight - window.innerHeight)) * 100, 100)}%`,
          }}
        />
      </div>

      <PublicNavbar dark />

      {/* 2. HERO SECTION - CLEAN & PROFESSIONAL */}
      <section className="relative min-h-[75vh] md:min-h-[90vh] flex items-center pt-32 md:pt-40 pb-12 bg-white dark:bg-[#050B15] z-30">
        {/* Subtle Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Main Gradient Surface */}
          <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-blue-50/30 dark:from-[#050B15] dark:via-[#0A1628] dark:to-[#112240]" />

          {/* Floating Decorative Blobs - Light Mode Accent */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-royal-blue/5 dark:bg-royal-blue/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal/5 dark:bg-teal/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-30">
          <div className="max-w-4xl mx-auto text-center">
            {/* Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-navy dark:text-white leading-tight md:leading-[1.1] mb-6 tracking-tight">
              {isAuthenticated ? (
                <>
                  Welcome,{" "}
                  <span className="text-teal">
                    {user?.fullName || user?.email?.split("@")[0] || "User"}
                  </span>
                </>
              ) : (
                <>
                  Welcome to the <br className="hidden sm:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal to-royal-blue">
                    Empire of Freelancers
                  </span>
                </>
              )}
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed px-2 font-medium">
              "Your Work. Your Money. Always..."
            </p>

            {/* Hero CTAs - Mobile-first unified layout */}
            <div className="mt-8 mb-12 w-full max-w-lg mx-auto px-4 sm:px-0 space-y-3">
              {isAuthenticated ? (
                <>
                  <Link
                    to={
                      user?.role === "client"
                        ? "/client/dashboard"
                        : "/freelancer/dashboard"
                    }
                    className="block"
                  >
                    <Button
                      size="lg"
                      className="w-full h-14 bg-teal hover:bg-[#128a7f] text-white text-base font-bold rounded-2xl shadow-lg shadow-teal/20 transition-all duration-200 active:scale-[0.98]"
                    >
                      Go to Dashboard
                    </Button>
                  </Link>
                  <Link
                    to={user?.role === "client" ? "/freelancers" : "/projects"}
                    className="block"
                  >
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full h-14 border-2 border-navy/15 dark:border-white/15 text-navy dark:text-white hover:bg-navy/5 dark:hover:bg-white/5 text-base font-bold rounded-2xl transition-all duration-200 active:scale-[0.98]"
                    >
                      {user?.role === "client"
                        ? "Find Freelancers"
                        : "Browse Projects"}
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  {/* Primary: Role selection */}
                  <Link to="/freelancers" className="block">
                    <Button
                      size="lg"
                      className="w-full h-14 bg-teal hover:bg-[#128a7f] text-white text-base font-bold rounded-2xl shadow-lg shadow-teal/20 transition-all duration-200 active:scale-[0.98]"
                    >
                      I want to Hire Talent
                    </Button>
                  </Link>
                  <Link to="/projects" className="block">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full h-14 border-2 border-navy/15 dark:border-white/15 text-navy dark:text-white hover:bg-navy/5 dark:hover:bg-white/5 text-base font-bold rounded-2xl transition-all duration-200 active:scale-[0.98]"
                    >
                      Earn money as a Freelancer
                    </Button>
                  </Link>

                  {/* Separator */}
                  <div className="flex items-center gap-4 py-1">
                    <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      or
                    </span>
                    <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
                  </div>

                  {/* Secondary: Auth */}
                  <div className="grid grid-cols-2 gap-3">
                    <Link to="/login" className="block">
                      <Button
                        variant="outline"
                        className="w-full h-14 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:border-teal hover:text-teal dark:hover:border-teal dark:hover:text-teal text-base font-bold rounded-2xl transition-all duration-200 active:scale-[0.98]"
                      >
                        Log In
                      </Button>
                    </Link>
                    <Link to="/register" className="block">
                      <Button className="w-full h-14 bg-teal/10 dark:bg-teal/20 text-teal dark:text-teal-light hover:bg-teal hover:text-white border-none text-base font-bold rounded-2xl transition-all duration-200 active:scale-[0.98]">
                        Create account
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Search Bar - POSITIONED LOWER FOR THUMB ZONE ON MOBILE */}
            <div
              ref={searchContainerRef}
              className={cn(
                "relative max-w-2xl mx-auto transition-all duration-300 px-2 sm:px-0",
                searchFocused ? "scale-[1.02]" : "",
              )}
            >
              <div
                className={cn(
                  "flex items-center bg-white dark:bg-white/10 backdrop-blur-xl rounded-2xl border transition-all duration-300 overflow-hidden",
                  searchFocused
                    ? "border-teal shadow-2xl shadow-teal/20"
                    : "border-slate-200 dark:border-white/20 shadow-lg",
                )}
              >
                <div className="flex items-center gap-3 px-5 flex-1">
                  <Search className="text-slate-400" size={20} />
                  <input
                    type="text"
                    value={heroQuery}
                    onChange={(e) => setHeroQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Search skills (e.g. Video Editing, CA, Web Dev...)"
                    className="w-full py-5 bg-transparent text-navy dark:text-white placeholder:text-slate-400 focus:outline-none text-base md:text-lg"
                    onFocus={() => {
                      setSearchFocused(true);
                      if (heroQuery.trim()) setShowDropdown(true);
                    }}
                    onBlur={() => setSearchFocused(false)}
                  />
                </div>
                <Button
                  onClick={handleSearchSubmit}
                  className="hidden sm:flex m-2 bg-navy dark:bg-white text-white dark:text-navy hover:bg-teal dark:hover:bg-teal hover:text-white dark:hover:text-white px-8 py-6 rounded-xl font-bold transition-all duration-300 shadow-md"
                >
                  Search
                </Button>
              </div>

              {/* Search Dropdown */}
              {showDropdown && (
                <div className="absolute top-full left-4 right-4 sm:left-0 sm:right-0 mt-2 bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden z-50 text-left">
                  {heroSearching ? (
                    <div className="flex items-center gap-3 px-5 py-6 text-slate-500 dark:text-slate-400">
                      <Loader2 className="w-5 h-5 animate-spin text-teal" />
                      Searching...
                    </div>
                  ) : heroResults.length > 0 ? (
                    <div className="py-2">
                      {heroResults.map((f) => (
                        <Link
                          key={f._id}
                          to={`/freelancer/${f._id}`}
                          className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center font-bold text-navy dark:text-white shrink-0">
                            {f.profilePicture ? (
                              <img
                                src={f.profilePicture}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              f.firstName[0]
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-navy dark:text-white truncate">
                              {f.displayName || `${f.firstName} ${f.lastName}`}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {f.headline || f.category}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="px-5 py-6 text-center text-slate-500 dark:text-slate-400">
                      No results found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. BROWSE BY CATEGORY - MOVED UP & UPDATED */}
      <section className="py-24 bg-white dark:bg-[#050B15] relative z-20 border-b border-slate-200 dark:border-white/5">
        <div className="container mx-auto px-4 lg:px-8">
          <AnimatedSection>
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
              <div className="max-w-2xl">
                <span className="text-teal font-bold tracking-widest uppercase text-sm mb-4 block">
                  Top Skills
                </span>
                <h2 className="text-3xl md:text-5xl font-bold text-navy dark:text-white">
                  Browse by Top Category
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-lg mt-4">
                  Find expert professionals across various domains to fuel your
                  growth.
                </p>
              </div>
              <Link to="/categories">
                <Button
                  variant="outline"
                  className="border-slate-300 dark:border-white/20 text-navy dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl px-8 h-14 font-bold transition-all shadow-sm"
                >
                  Browse All Categories
                </Button>
              </Link>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((cat, idx) => (
              <AnimatedSection key={cat.name} delay={idx * 100}>
                <Link
                  to={`/freelancers?category=${encodeURIComponent(cat.name)}`}
                  className="group bg-white dark:bg-white/5 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-white/5 hover:border-teal/20 dark:hover:border-teal/20 hover:bg-slate-50 dark:hover:bg-white/10 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:scale-[1.01] block h-full shadow-sm dark:shadow-none"
                >
                  <div
                    className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg bg-gradient-to-br transition-all group-hover:scale-110 group-hover:-rotate-3",
                      cat.color,
                    )}
                  >
                    <cat.icon size={28} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-navy dark:text-white mb-2">
                    {cat.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2">
                    {cat.desc}
                  </p>
                  <div className="flex items-center text-teal font-bold text-sm">
                    {cat.count}+ Pros{" "}
                    <ArrowRight
                      size={16}
                      className="ml-2 group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FEATURED FREELANCERS */}
      <section
        className="py-24 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5"
        id="find-talent"
      >
        <div className="container mx-auto px-4 lg:px-8">
          <AnimatedSection>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
              <div>
                <span className="inline-block px-4 py-2 bg-gold/10 text-gold rounded-full text-sm font-semibold mb-4">
                  Top Talent
                </span>
                <h2 className="text-3xl md:text-5xl font-bold text-navy dark:text-white mb-2">
                  Featured Professionals
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-lg">
                  Work with our top-rated creative experts in the region.
                </p>
              </div>
              <Link to="/freelancers">
                <Button className="bg-teal hover:bg-[#128a7f] text-white px-6 group rounded-xl py-6 font-bold transition-all shadow-lg shadow-teal/10 hover:shadow-teal/30">
                  View All Freelancers
                  <ArrowRight
                    size={16}
                    className="ml-2 group-hover:translate-x-1 transition-transform"
                  />
                </Button>
              </Link>
            </div>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoadingFreelancers ? (
              <div className="col-span-full flex justify-center py-12">
                <Loader2 className="w-10 h-10 animate-spin text-teal" />
              </div>
            ) : (
              topFreelancers.map((freelancer, idx) => {
                const name =
                  freelancer.displayName ||
                  `${freelancer.firstName} ${freelancer.lastName}`;
                const initials = `${freelancer.firstName[0]}${freelancer.lastName[0]}`;

                return (
                  <AnimatedSection key={freelancer._id} delay={idx * 100}>
                    <div className="group bg-white dark:bg-transparent dark:glass-card rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-slate-100 dark:border-white/5 h-full flex flex-col hover:-translate-y-2">
                      {/* Header Gradient */}
                      <div className="h-24 bg-gradient-to-r from-navy to-royal-blue relative">
                        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-1 rounded-full">
                          <Star size={12} className="text-gold fill-gold" />
                          <span className="text-white text-xs font-semibold">
                            {freelancer.averageRating.toFixed(1)}
                          </span>
                        </div>
                      </div>

                      {/* Profile */}
                      <div className="px-6 pb-8 -mt-12 relative flex-1 flex flex-col">
                        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-teal to-royal-blue flex items-center justify-center text-white font-bold text-2xl border-4 border-white dark:border-[#050B15] shadow-xl mb-4 group-hover:scale-110 transition-transform overflow-hidden">
                          {freelancer.profilePicture ? (
                            <img
                              src={freelancer.profilePicture}
                              alt={name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            initials
                          )}
                        </div>
                        <h3 className="font-bold text-navy dark:text-white text-xl mb-1 group-hover:text-teal transition-colors">
                          {name}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 line-clamp-1 h-4">
                          {freelancer.headline || freelancer.category}
                        </p>

                        <div className="flex flex-wrap gap-1.5 mb-6">
                          {freelancer.skills.slice(0, 3).map((skill) => (
                            <span
                              key={
                                typeof skill === "string" ? skill : skill.name
                              }
                              className="text-xxs bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-full font-semibold border border-slate-100 dark:border-white/5"
                            >
                              {typeof skill === "string" ? skill : skill.name}
                            </span>
                          ))}
                        </div>

                        <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
                          <div className="text-lg font-black text-navy dark:text-white">
                            ₹{freelancer.hourlyRate}
                            <span className="text-slate-400 dark:text-slate-500 font-normal text-sm">
                              /hr
                            </span>
                          </div>
                          <Link to={`/freelancer/${freelancer._id}`}>
                            <Button
                              variant="ghost"
                              className="text-teal font-bold hover:bg-teal/10 rounded-xl px-4"
                            >
                              View Profile
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </AnimatedSection>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* 4. PLANS & PRICING PREVIEW */}
      <section className="py-24 bg-white dark:bg-[#050B15] overflow-hidden relative border-b border-slate-200 dark:border-white/5">
        <div className="container mx-auto px-4 lg:px-8">
          <AnimatedSection>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-royal-blue font-bold tracking-widest uppercase text-sm mb-4 block">
                Hiring Made Easy
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-navy dark:text-white mb-6">
                Affordable Plans for Everyone
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                Choose the perfect plan to unlock the full potential of our
                marketplace.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan, idx) => (
              <AnimatedSection key={plan.name} delay={idx * 100}>
                <div
                  className={cn(
                    "bg-white dark:bg-white/5 p-5 md:p-6 rounded-2xl border transition-all duration-500 h-full flex flex-col items-center text-center",
                    plan.highlighted
                      ? "border-teal dark:border-teal shadow-xl dark:shadow-none scale-105 z-10"
                      : "border-slate-100 dark:border-white/10 hover:shadow-lg dark:hover:shadow-none hover:border-teal/20 dark:hover:border-teal/30",
                  )}
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                      plan.name === "Pro"
                        ? "bg-teal/10 dark:bg-teal/20 text-teal dark:text-teal-light"
                        : "bg-slate-100 dark:bg-white/10 text-slate-400 dark:text-white/40",
                    )}
                  >
                    {plan.name === "Pro" ? (
                      <Zap size={24} />
                    ) : (
                      <User size={24} />
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-navy dark:text-white mb-0.5">
                    {plan.name}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xxs mb-3">
                    {plan.description}
                  </p>
                  <div className="mb-4">
                    <span className="text-2xl font-bold text-navy dark:text-white">
                      ₹{plan.monthlyPrice}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-xs">
                      /mo
                    </span>
                  </div>
                  <ul className="space-y-2 mb-6 flex-1">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs font-medium text-left"
                      >
                        <Check
                          size={14}
                          className="text-teal dark:text-teal-light shrink-0"
                        />{" "}
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link to="/pricing" className="w-full">
                    <Button
                      className={cn(
                        "w-full py-5 rounded-lg font-bold text-sm transition-all",
                        plan.highlighted
                          ? "bg-teal hover:bg-[#128a7f] text-white shadow-lg shadow-teal/10"
                          : "bg-slate-50 dark:bg-white/5 text-navy dark:text-white hover:bg-slate-100 dark:hover:bg-white/10",
                      )}
                    >
                      {plan.buttonText}
                    </Button>
                  </Link>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section className="py-24 bg-slate-50 dark:bg-white/5 relative border-b border-slate-200 dark:border-white/5">
        <div className="container mx-auto px-4 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-16">
              <span className="text-royal-blue font-bold tracking-widest uppercase text-sm mb-4 block">
                Process
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-navy dark:text-white">
                How It Works
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg mt-4">
                Three simple steps to build your dream team or find your next
                gig.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {[
              {
                icon: Layout,
                title: "Post a Job",
                desc: "Share your project details and requirements with our community of experts.",
              },
              {
                icon: Users,
                title: "Hire Pros",
                desc: "Browse portfolios or let top-tier talent apply to your open projects directly.",
              },
              {
                icon: BadgeCheck,
                title: "Get Results",
                desc: "Collaborate securely and get your high-quality work delivered on time.",
              },
            ].map((step, idx) => (
              <AnimatedSection
                key={idx}
                delay={idx * 150}
                className="text-center group"
              >
                <div className="w-20 h-20 bg-royal-blue/5 dark:bg-royal-blue/10 text-royal-blue rounded-full flex items-center justify-center mx-auto mb-8 text-2xl font-black italic relative transition-all duration-300 group-hover:scale-110 group-hover:bg-royal-blue group-hover:text-white border border-royal-blue/10">
                  <step.icon size={32} />
                  <div className="absolute -top-1 -right-1 w-8 h-8 bg-white dark:bg-[#121A2A] border-2 border-royal-blue rounded-full text-sm flex items-center justify-center not-italic shadow-sm text-navy dark:text-white">
                    {idx + 1}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-navy dark:text-white mb-4 transition-colors group-hover:text-royal-blue">
                  {step.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CLIENT REVIEWS - FINAL SECTION */}
      <section className="py-24 bg-white dark:bg-[#050B15] relative overflow-hidden border-t border-slate-200 dark:border-none">
        <div className="absolute inset-0 bg-plus-pattern opacity-[0.03] dark:opacity-[0.03]" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <AnimatedSection>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-royal-blue dark:text-teal-light font-bold tracking-widest uppercase text-sm mb-4 block">
                Satisfaction
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-navy dark:text-white mb-6">
                Success Stories
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                See why thousands of businesses trust us for their
                mission-critical creative needs.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {testimonials.map((t, idx) => (
              <AnimatedSection key={idx} delay={idx * 100}>
                <div className="bg-slate-50 dark:bg-white/5 backdrop-blur-xl p-10 rounded-[2.5rem] border border-slate-200 dark:border-white/10 h-full flex flex-col transition-all duration-300 hover:bg-white dark:hover:bg-white/10 hover:border-teal/20 dark:hover:border-white/20 hover:-translate-y-2 hover:shadow-2xl dark:hover:shadow-white/5 group shadow-sm dark:shadow-none">
                  <div className="flex gap-1 mb-6 text-gold group-hover:scale-110 transition-transform origin-left">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-xl text-slate-700 dark:text-white/90 leading-relaxed mb-10 flex-1 group-hover:text-navy dark:group-hover:text-white transition-colors">
                    "{t.quote}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal to-royal-blue flex items-center justify-center text-white font-bold text-lg group-hover:rotate-6 transition-transform shadow-lg">
                      {t.avatar}
                    </div>
                    <div>
                      <div className="text-navy dark:text-white font-bold text-lg group-hover:text-teal dark:group-hover:text-teal-light transition-colors">
                        {t.author}
                      </div>
                      <div className="text-slate-500 dark:text-slate-500">
                        {t.role}
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection delay={300}>
            <div className="mt-20 text-center">
              <Link to="/register">
                <Button
                  size="lg"
                  className="bg-teal hover:bg-teal-light text-white px-12 py-8 text-xl font-bold rounded-2xl shadow-2xl shadow-teal/20 transition-all hover:-translate-y-1"
                >
                  Join the Community Today{" "}
                  <ArrowRight size={20} className="ml-2" />
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <PublicFooter />

      {/* Custom CSS for Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 5s ease-in-out infinite;
          animation-delay: 1s;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Home;
