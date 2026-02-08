import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Menu,
  X,
  Search,
  CheckCircle,
  Film,
  Sparkles,
  Box,
  Palette,
  Star,
  ArrowRight,
  Play,
  Users,
  Layout,
  ChevronDown,
  MapPin,
  Shield,
  Zap,
  Heart,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
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

// Animated counter component
const AnimatedCounter = ({
  end,
  duration = 2000,
  suffix = "",
}: {
  end: number;
  duration?: number;
  suffix?: string;
}) => {
  const [count, setCount] = useState(0);
  const { ref, isInView } = useInView();

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
};

const Home = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const testimonials = [
    {
      quote:
        "Found an incredible VFX artist who understood the Telugu film aesthetic perfectly. Our project was delivered 2 days early!",
      author: "Rajesh Kumar",
      role: "Film Director, Hyderabad",
      avatar: "RK",
      rating: 5,
    },
    {
      quote:
        "The quality of video editors here is exceptional. I've hired 5 freelancers and every project exceeded expectations.",
      author: "Priya Sharma",
      role: "YouTube Content Creator",
      avatar: "PS",
      rating: 5,
    },
    {
      quote:
        "As a startup, finding affordable yet talented 3D designers was crucial. ConnectMeIndia made it possible.",
      author: "Venkat Reddy",
      role: "CEO, TechVentures",
      avatar: "VR",
      rating: 5,
    },
  ];

  const categories = [
    {
      name: "Video Editing",
      count: 127,
      icon: Film,
      color: "from-blue-500 to-blue-600",
      desc: "Professional cuts, transitions & storytelling",
    },
    {
      name: "VFX & Motion",
      count: 89,
      icon: Sparkles,
      color: "from-purple-500 to-pink-500",
      desc: "Visual effects & motion graphics",
    },
    {
      name: "3D Design",
      count: 64,
      icon: Box,
      color: "from-orange-500 to-red-500",
      desc: "Models, renders & animations",
    },
    {
      name: "Color Grading",
      count: 45,
      icon: Palette,
      color: "from-teal to-emerald-500",
      desc: "Cinematic color correction",
    },
  ];

  const freelancers = [
    {
      name: "Arun Kumar",
      title: "Senior VFX Artist",
      rating: 4.9,
      reviews: 89,
      skills: ["After Effects", "Nuke", "Houdini"],
      avatar: "AK",
    },
    {
      name: "Meera Reddy",
      title: "Video Editor",
      rating: 4.8,
      reviews: 156,
      skills: ["Premiere Pro", "DaVinci"],
      avatar: "MR",
    },
    {
      name: "Karthik S.",
      title: "3D Generalist",
      rating: 5.0,
      reviews: 43,
      skills: ["Blender", "Maya", "C4D"],
      avatar: "KS",
    },
    {
      name: "Lakshmi P.",
      title: "Motion Designer",
      rating: 4.9,
      reviews: 78,
      skills: ["After Effects", "Lottie"],
      avatar: "LP",
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">
      {/* Floating Scroll Progress */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-100 z-[100]">
        <div
          className="h-full bg-gradient-to-r from-teal to-royal-blue transition-all duration-150"
          style={{
            width: `${Math.min(((typeof window !== "undefined" ? window.scrollY : 0) / (document.documentElement.scrollHeight - window.innerHeight)) * 100, 100)}%`,
          }}
        />
      </div>

      {/* 1. NAVIGATION BAR */}
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          isScrolled
            ? "bg-white/95 backdrop-blur-xl shadow-lg shadow-slate-200/50 py-3"
            : "bg-transparent py-5",
        )}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a href="/" className="flex items-center gap-3 group">
              <div
                className={cn(
                  "w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg transition-all duration-300 shadow-lg",
                  isScrolled
                    ? "bg-gradient-to-br from-navy to-royal-blue"
                    : "bg-white/20 backdrop-blur-sm border border-white/30",
                )}
              >
                <span className="group-hover:scale-110 transition-transform">
                  C
                </span>
              </div>
              <div className="flex flex-col">
                <span
                  className={cn(
                    "text-lg font-bold tracking-tight transition-colors",
                    isScrolled ? "text-navy" : "text-white",
                  )}
                >
                  ConnectMe
                </span>
                <span
                  className={cn(
                    "text-[10px] font-semibold tracking-widest uppercase -mt-1 transition-colors",
                    isScrolled ? "text-teal" : "text-teal-light",
                  )}
                >
                  India
                </span>
              </div>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {[
                { label: "Find Talent", href: "/freelancers" },
                { label: "How It Works", href: "/how-it-works" },
                { label: "Pricing", href: "/pricing" },
                { label: "About", href: "/about" },
              ].map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative group",
                    isScrolled
                      ? "text-slate-600 hover:text-navy hover:bg-slate-100"
                      : "text-white/80 hover:text-white hover:bg-white/10",
                  )}
                >
                  {item.label}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-teal group-hover:w-1/2 transition-all duration-300" />
                </Link>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <Link to="/login">
                <Button
                  variant="ghost"
                  className={cn(
                    "font-semibold transition-all duration-300",
                    isScrolled
                      ? "text-royal-blue hover:bg-royal-blue/10 hover:text-royal-blue"
                      : "text-white hover:bg-white/10 hover:text-white",
                  )}
                >
                  Log In
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  className={cn(
                    "font-semibold px-6 transition-all duration-300 hover:scale-105 hover:shadow-lg",
                    isScrolled
                      ? "bg-teal hover:bg-teal-light text-white shadow-teal/25"
                      : "bg-white text-navy hover:bg-white hover:text-navy",
                  )}
                >
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className={cn(
                "lg:hidden p-2 rounded-lg transition-colors",
                isScrolled
                  ? "text-navy hover:bg-slate-100"
                  : "text-white hover:bg-white/10",
              )}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "lg:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 shadow-xl transition-all duration-300 overflow-hidden",
            mobileMenuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <div className="p-4 space-y-2">
            {[
              { label: "Find Talent", href: "/freelancers" },
              { label: "How It Works", href: "/how-it-works" },
              { label: "Pricing", href: "/pricing" },
              { label: "About", href: "/about" },
              { label: "Contact", href: "/contact" },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="block px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-navy font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <Link to="/login">
                <Button
                  variant="outline"
                  className="w-full border-royal-blue text-royal-blue"
                >
                  Log In
                </Button>
              </Link>
              <Link to="/register">
                <Button className="w-full bg-teal text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-navy">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-navy via-[#0f2445] to-royal-blue" />
          <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-royal-blue/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-teal/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />
          <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2" />

          {/* Grid Pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 animate-fade-in-up">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal"></span>
                </span>
                <span className="text-sm font-medium text-white/90">
                  #1 Creative Marketplace in AP & Telangana
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] mb-6">
                Find Your Perfect{" "}
                <span className="relative">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-light via-sky-blue to-teal-light animate-gradient">
                    Creative Partner
                  </span>
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
                    viewBox="0 0 300 12"
                    fill="none"
                  >
                    <path
                      d="M2 10C50 4 100 2 150 6C200 10 250 4 298 8"
                      stroke="url(#gradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient
                        id="gradient"
                        x1="0"
                        y1="0"
                        x2="300"
                        y2="0"
                      >
                        <stop offset="0%" stopColor="#14B8A6" />
                        <stop offset="100%" stopColor="#38BDF8" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Connect with{" "}
                <span className="text-white font-semibold">500+ expert</span>{" "}
                Video Editors, VFX Artists, and 3D Designers in Telangana &
                Andhra Pradesh.
              </p>

              {/* Search Bar */}
              <div
                className={cn(
                  "relative max-w-lg mx-auto lg:mx-0 mb-10 transition-all duration-300",
                  searchFocused ? "scale-[1.02]" : "",
                )}
              >
                <div
                  className={cn(
                    "flex items-center bg-white/10 backdrop-blur-xl rounded-2xl border transition-all duration-300 overflow-hidden",
                    searchFocused
                      ? "border-teal shadow-lg shadow-teal/20"
                      : "border-white/20",
                  )}
                >
                  <div className="flex items-center gap-3 px-5 flex-1">
                    <Search className="text-slate-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search skills (e.g., Video Editing, VFX...)"
                      className="w-full py-4 bg-transparent text-white placeholder:text-slate-400 focus:outline-none text-base"
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setSearchFocused(false)}
                    />
                  </div>
                  <Button className="m-2 bg-teal hover:bg-teal-light text-white px-6 py-6 rounded-xl font-semibold transition-all hover:scale-105">
                    Search
                  </Button>
                </div>

                {/* Popular Searches */}
                <div className="flex flex-wrap gap-2 mt-4 justify-center lg:justify-start">
                  <span className="text-slate-400 text-sm">Popular:</span>
                  {["Video Editor", "VFX Artist", "3D Designer"].map((tag) => (
                    <button
                      key={tag}
                      className="text-sm text-white/70 hover:text-white px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 transition-all"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-white/70 text-sm">
                <div className="flex items-center gap-2">
                  <Shield size={18} className="text-teal" />
                  <span>Verified Profiles</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap size={18} className="text-gold" />
                  <span>Fast Hiring</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart size={18} className="text-pink-400" />
                  <span>95% Satisfaction</span>
                </div>
              </div>
            </div>

            {/* Right: Floating Cards */}
            <div className="hidden lg:block relative h-[600px]">
              {/* Main Card */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] bg-white rounded-3xl shadow-2xl p-6 transform hover:scale-105 transition-all duration-500 z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal to-royal-blue flex items-center justify-center text-white font-bold text-xl">
                    VK
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-navy text-lg">Vikram K.</h3>
                    <p className="text-slate-500 text-sm">Senior VFX Artist</p>
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          size={12}
                          className="text-gold fill-gold"
                        />
                      ))}
                      <span className="text-xs text-slate-400 ml-1">
                        5.0 (127)
                      </span>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-teal/10 text-teal rounded-full text-xs font-semibold">
                    Top Rated
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="aspect-video rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden group cursor-pointer">
                    <div className="w-full h-full flex items-center justify-center bg-navy/5 group-hover:bg-navy/10 transition-colors">
                      <Play
                        size={24}
                        className="text-royal-blue opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all"
                      />
                    </div>
                  </div>
                  <div className="aspect-video rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden group cursor-pointer">
                    <div className="w-full h-full flex items-center justify-center bg-navy/5 group-hover:bg-navy/10 transition-colors">
                      <Box
                        size={24}
                        className="text-purple-500 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    
                  </div>
                  <Link to="/freelancer/1">
                    <Button className="bg-royal-blue hover:bg-royal-blue-hover text-white px-6">
                      View Profile
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute top-10 left-0 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 animate-float">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy">
                    Project Completed!
                  </p>
                  <p className="text-xs text-slate-400">Just now</p>
                </div>
              </div>

              <div className="absolute bottom-20 right-0 bg-white rounded-2xl shadow-xl p-4 animate-float-delayed">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 border-2 border-white"
                      />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500">
                    +12 hired today
                  </span>
                </div>
                <p className="text-sm font-semibold text-navy">
                  Join 500+ Happy Clients
                </p>
              </div>

              <div className="absolute top-1/3 right-0 bg-gradient-to-r from-gold to-orange-500 rounded-2xl shadow-xl p-4 text-white animate-float">
                <div className="flex items-center gap-2">
                  <Star className="fill-white" size={20} />
                  <span className="font-bold text-lg">4.9</span>
                </div>
                <p className="text-xs opacity-90">Avg. Rating</p>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 animate-bounce">
            <span className="text-xs uppercase tracking-widest">Scroll</span>
            <ChevronDown size={20} />
          </div>
        </div>
      </section>

      {/* 3. TRUSTED BY */}
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="container mx-auto px-4">
          <p className="text-center text-slate-400 text-sm font-medium mb-10 uppercase tracking-widest">
            Trusted by 50+ companies across South India
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16">
            {[
              "TechCorp",
              "MediaHouse",
              "FilmStudio",
              "AdAgency",
              "StartupX",
            ].map((company) => (
              <div key={company} className="group relative">
                <div className="h-12 w-32 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 font-bold text-sm grayscale hover:grayscale-0 hover:bg-slate-50 transition-all duration-500 cursor-pointer">
                  {company}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS - Quick Preview */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-teal/10 text-teal rounded-full text-sm font-semibold mb-4">
              Simple Process
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-navy mb-4">
              How It Works
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto mb-8">
              Get your creative project done in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative mb-12">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

            {[
              {
                step: "01",
                title: "Post Your Project",
                icon: Layout,
                color: "from-royal-blue to-blue-600",
              },
              {
                step: "02",
                title: "Review Proposals",
                icon: Users,
                color: "from-teal to-emerald-500",
              },
              {
                step: "03",
                title: "Hire & Collaborate",
                icon: CheckCircle,
                color: "from-gold to-orange-500",
              },
            ].map((item) => (
              <div key={item.step} className="text-center relative">
                <div
                  className={cn(
                    "w-14 h-14 mx-auto rounded-xl flex items-center justify-center text-white mb-4 shadow-lg bg-gradient-to-br",
                    item.color,
                  )}
                >
                  <item.icon size={24} />
                </div>
                <div className="text-xs font-bold text-slate-400 mb-1">
                  STEP {item.step}
                </div>
                <h3 className="text-lg font-bold text-navy">{item.title}</h3>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/how-it-works">
              <Button className="bg-teal hover:bg-teal-light text-white px-8 group">
                Learn More
                <ArrowRight
                  size={16}
                  className="ml-2 group-hover:translate-x-1 transition-transform"
                />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. CATEGORIES */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div>
              <span className="inline-block px-4 py-2 bg-royal-blue/10 text-royal-blue rounded-full text-sm font-semibold mb-4">
                Explore Skills
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-navy mb-2">
                Browse by Category
              </h2>
              <p className="text-slate-500 text-lg">
                Find the perfect creative professional for your needs
              </p>
            </div>
            <Link to="/freelancers">
              <Button
                variant="outline"
                className="group border-royal-blue text-royal-blue hover:bg-royal-blue hover:text-white px-6"
              >
                View All Categories
                <ArrowRight
                  size={16}
                  className="ml-2 group-hover:translate-x-1 transition-transform"
                />
              </Button>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to="/freelancers"
                className="group relative bg-white p-6 rounded-2xl border border-slate-100 hover:border-transparent hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden block"
              >
                {/* Background Gradient on Hover */}
                <div
                  className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity bg-gradient-to-br",
                    cat.color,
                  )}
                />

                <div
                  className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center text-white mb-5 shadow-lg bg-gradient-to-br transition-all group-hover:scale-110 group-hover:-rotate-6",
                    cat.color,
                  )}
                >
                  <cat.icon size={26} />
                </div>

                <h3 className="text-lg font-bold text-navy mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-navy group-hover:to-royal-blue transition-all">
                  {cat.name}
                </h3>
                <p className="text-sm text-slate-400 mb-3">{cat.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-teal">
                    {cat.count}+ Freelancers
                  </span>
                  <ArrowRight
                    size={16}
                    className="text-slate-300 group-hover:text-royal-blue group-hover:translate-x-1 transition-all"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FEATURED FREELANCERS */}
      <section className="py-24 bg-slate-50" id="find-talent">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div>
              <span className="inline-block px-4 py-2 bg-gold/10 text-gold rounded-full text-sm font-semibold mb-4">
                Top Talent
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-navy mb-2">
                Featured Freelancers
              </h2>
              <p className="text-slate-500 text-lg">
                Work with the best creative professionals in the region
              </p>
            </div>
            <Link to="/freelancers">
              <Button className="bg-teal hover:bg-teal-light text-white px-6 group">
                View All Freelancers
                <ArrowRight
                  size={16}
                  className="ml-2 group-hover:translate-x-1 transition-transform"
                />
              </Button>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {freelancers.map((freelancer, idx) => (
              <div
                key={freelancer.name}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100"
              >
                {/* Header Gradient */}
                <div className="h-20 bg-gradient-to-r from-navy to-royal-blue relative">
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-1 rounded-full">
                    <Star size={12} className="text-gold fill-gold" />
                    <span className="text-white text-xs font-semibold">
                      {freelancer.rating}
                    </span>
                  </div>
                </div>

                {/* Profile */}
                <div className="px-6 pb-6 -mt-10 relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal to-royal-blue flex items-center justify-center text-white font-bold text-xl border-4 border-white shadow-lg mb-4 group-hover:scale-110 transition-transform">
                    {freelancer.avatar}
                  </div>

                  <h3 className="font-bold text-navy text-lg">
                    {freelancer.name}
                  </h3>
                  <p className="text-slate-500 text-sm mb-3">
                    {freelancer.title}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {freelancer.skills.slice(0, 2).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-slate-100 rounded-md text-xs font-medium text-slate-600"
                      >
                        {skill}
                      </span>
                    ))}
                    {freelancer.skills.length > 2 && (
                      <span className="px-2 py-1 bg-slate-100 rounded-md text-xs font-medium text-slate-400">
                        +{freelancer.skills.length - 2}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-end pt-4 border-t border-slate-100">
                    <Link to={`/freelancer/${idx + 1}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-royal-blue text-royal-blue hover:bg-royal-blue hover:text-white"
                      >
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-pink-100 text-pink-600 rounded-full text-sm font-semibold mb-4">
              <Heart size={14} className="inline mr-1" />
              Success Stories
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-navy mb-4">
              What Clients Say
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              Join thousands of satisfied clients who found their perfect
              creative match
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* Main Testimonial */}
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl p-8 md:p-12 border border-slate-100 shadow-xl relative overflow-hidden">
              {/* Quote Icon */}
              <div className="absolute top-6 left-6 text-royal-blue/10">
                <svg
                  width="60"
                  height="60"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.0166 21L5.0166 18C5.0166 16.8954 5.91203 16 7.0166 16H10.0166C10.5689 16 11.0166 15.5523 11.0166 15V9C11.0166 8.44772 10.5689 8 10.0166 8H6.0166C5.46432 8 5.0166 8.44772 5.0166 9V11C5.0166 11.5523 4.56889 12 4.0166 12H3.0166V5H13.0166V15C13.0166 18.3137 10.3303 21 7.0166 21H5.0166Z" />
                </svg>
              </div>

              <div className="relative z-10">
                <div className="flex justify-center mb-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={24} className="text-gold fill-gold" />
                  ))}
                </div>

                <p className="text-xl md:text-2xl text-navy text-center font-medium leading-relaxed mb-8 transition-opacity duration-500">
                  "{testimonials[activeTestimonial].quote}"
                </p>

                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-royal-blue to-teal flex items-center justify-center text-white font-bold text-xl mb-3">
                    {testimonials[activeTestimonial].avatar}
                  </div>
                  <h4 className="font-bold text-navy">
                    {testimonials[activeTestimonial].author}
                  </h4>
                  <p className="text-slate-500 text-sm">
                    {testimonials[activeTestimonial].role}
                  </p>
                </div>
              </div>
            </div>

            {/* Dots Navigation */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTestimonial(idx)}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all duration-300",
                    activeTestimonial === idx
                      ? "bg-teal w-8"
                      : "bg-slate-300 hover:bg-slate-400",
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8. PRICING TEASER */}
      <section className="py-24 bg-gradient-to-b from-navy to-royal-blue text-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-semibold mb-4">
              Pricing Plans
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-10">
              Choose the plan that fits your freelancing journey. Start free and
              upgrade as you grow.
            </p>

            {/* Quick Price Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
                <h3 className="text-lg font-bold mb-2">Free</h3>
                <div className="text-3xl font-bold mb-1">₹0</div>
                <p className="text-slate-400 text-sm">Perfect to get started</p>
              </div>
              <div className="bg-white text-navy rounded-2xl p-6 text-center shadow-xl relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-teal to-teal-light text-white text-xs font-bold rounded-full">
                  POPULAR
                </div>
                <h3 className="text-lg font-bold mb-2">Pro</h3>
                <div className="text-3xl font-bold mb-1">
                  ₹499
                  <span className="text-sm font-normal text-slate-400">
                    /mo
                  </span>
                </div>
                <p className="text-slate-500 text-sm">
                  For serious freelancers
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
                <h3 className="text-lg font-bold mb-2">Premium</h3>
                <div className="text-3xl font-bold mb-1">
                  ₹999
                  <span className="text-sm font-normal text-slate-400">
                    /mo
                  </span>
                </div>
                <p className="text-slate-400 text-sm">For top performers</p>
              </div>
            </div>

            <Link to="/pricing">
              <Button className="bg-white text-royal-blue hover:bg-slate-100 font-bold px-8 py-6 text-lg group">
                View All Plans
                <ArrowRight
                  size={18}
                  className="ml-2 group-hover:translate-x-1 transition-transform"
                />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 9. STATS */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 500, suffix: "+", label: "Freelancers", icon: Users },
              {
                value: 1000,
                suffix: "+",
                label: "Projects Done",
                icon: CheckCircle,
              },
              { value: 50, suffix: "+", label: "Happy Clients", icon: Heart },
              { value: 4.9, suffix: "", label: "Avg. Rating", icon: Star },
            ].map((stat, idx) => (
              <div key={idx} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <stat.icon size={28} className="text-teal" />
                </div>
                <div className="text-4xl lg:text-5xl font-bold text-navy mb-2">
                  {stat.suffix ? (
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  ) : (
                    <span>{stat.value}</span>
                  )}
                </div>
                <div className="text-slate-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. CTA */}
      <section className="py-24 bg-gradient-to-r from-teal to-teal-light relative overflow-hidden">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to Find Your Creative Partner?
            </h2>
            <p className="text-white/90 text-xl mb-10 leading-relaxed">
              Join thousands of businesses and freelancers transforming the
              creative landscape of South India.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button
                  size="lg"
                  className="bg-white text-teal hover:bg-slate-100 font-bold text-lg px-10 py-7 rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
                >
                  Find Work
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 font-bold text-lg px-10 py-7 rounded-xl"
                >
                  Hire Talent
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 11. FOOTER */}
      <footer className="bg-navy text-white pt-20 pb-8">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal to-teal-light flex items-center justify-center text-white font-bold text-lg">
                  C
                </div>
                <div>
                  <span className="text-lg font-bold">ConnectMeIndia</span>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                The premier marketplace for creative professionals in Telangana
                and Andhra Pradesh.
              </p>
              <div className="flex gap-3">
                {[Twitter, Linkedin, Instagram, Youtube].map((Icon, idx) => (
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
                links: [
                  { label: "Find Talent", href: "/freelancers" },
                  { label: "How It Works", href: "/how-it-works" },
                  { label: "Pricing", href: "/pricing" },
                  { label: "About Us", href: "/about" },
                ],
              },
              {
                title: "For Freelancers",
                links: [
                  { label: "Create Profile", href: "/register" },
                  { label: "Browse Jobs", href: "/freelancers" },
                  { label: "Subscription", href: "/pricing" },
                  { label: "Resources", href: "/how-it-works" },
                ],
              },
              {
                title: "Support",
                links: [
                  { label: "Contact Us", href: "/contact" },
                  { label: "Help Center", href: "/contact" },
                  { label: "Privacy Policy", href: "/" },
                  { label: "Terms", href: "/" },
                ],
              },
            ].map((section) => (
              <div key={section.title}>
                <h3 className="font-bold text-lg mb-6">{section.title}</h3>
                <ul className="space-y-4">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.href}
                        className="text-slate-400 hover:text-teal transition-colors text-sm"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}{" "}
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
