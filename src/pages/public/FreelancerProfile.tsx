import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getCategoryStyle } from "@/lib/category-styles";
import PublicNavbar from "@/components/shared/PublicNavbar";
import PublicFooter from "@/components/shared/PublicFooter";
import {
  ChevronRight,
  Star,
  MapPin,
  BadgeCheck,
  Heart,
  MessageSquare,
  Clock,
  Award,
  ExternalLink,
  Play,
  GraduationCap,
  Building,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { freelancerService, reviewService } from "@/services";
import type { FreelancerProfile as FreelancerProfileType, Review } from "@/services";

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

const FreelancerProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showFullBio, setShowFullBio] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [visibleReviews, setVisibleReviews] = useState(3);
  const [loading, setLoading] = useState(true);
  const [freelancerData, setFreelancerData] = useState<FreelancerProfileType | null>(null);
  const [reviewsData, setReviewsData] = useState<Review[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        setLoading(true);
        const profile = await freelancerService.getById(id);
        setFreelancerData(profile);
        
        if (profile.userId) {
          const reviews = await reviewService.getForUser(profile.userId);
          setReviewsData(reviews.reviews || []);
        }
      } catch (error) {
        console.error("Error fetching freelancer profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!freelancerData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold text-navy mb-4">Freelancer Not Found</h2>
        <Link to="/freelancers">
          <Button className="bg-teal text-white">Back to Directory</Button>
        </Link>
      </div>
    );
  }

  const freelancer = {
    name: freelancerData.displayName || `${freelancerData.firstName} ${freelancerData.lastName}`,
    title: freelancerData.headline || freelancerData.category || "Professional Freelancer",
    avatar: (freelancerData.displayName || freelancerData.firstName || "F")[0].toUpperCase(),
    location: freelancerData.location || "Hyderabad, India",
    rating: freelancerData.averageRating || 0,
    reviews: freelancerData.reviewCount || 0,
    projectsCompleted: freelancerData.totalProjects || 0,
    successRate: freelancerData.successRate || 100,
    memberSince: new Date(freelancerData.createdAt).getFullYear().toString(),
    verified: freelancerData.isVerified,
    bio: freelancerData.bio || "No bio provided.",
  };

  const skills = freelancerData.skills?.map(s => ({
    name: s.name,
    level: s.proficiency > 80 ? "Expert" : s.proficiency > 50 ? "Advanced" : "Intermediate",
    percentage: s.proficiency || 80
  })) || [];

  const portfolio = freelancerData.portfolio?.map((item, idx) => ({
    id: item._id || idx,
    title: item.title,
    category: item.skills?.[0] || "Project",
    thumbnail: (item.title || "P")[0].toUpperCase(),
    url: item.projectUrl
  })) || [];

  const experience = freelancerData.workExperience?.map((exp) => ({
    company: exp.company,
    role: exp.title,
    duration: `${new Date(exp.startDate).getFullYear()} - ${exp.endDate ? new Date(exp.endDate).getFullYear() : 'Present'}`,
    description: exp.description || "",
  })) || [];

  const education = freelancerData.education?.map((edu) => ({
    title: edu.degree || "Education",
    institution: edu.institution,
    year: edu.year?.toString() || "",
  })) || [];

  const reviews = reviewsData.map((r) => ({
    id: r.id,
    client: r.reviewer?.fullName || "Client",
    avatar: (r.reviewer?.fullName || "C")[0].toUpperCase(),
    project: r.project?.title || "Work Project",
    rating: r.rating,
    text: r.comment,
    date: new Date(r.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
  }));

  const similarFreelancers = [
    {
      id: 1,
      name: "Karthik M.",
      title: "Video Editor",
      avatar: "KM",
      rating: 4.8,
      verified: true,
    },
    {
      id: 2,
      name: "Sneha R.",
      title: "Motion Designer",
      avatar: "SR",
      rating: 4.9,
      verified: true,
    },
    {
      id: 3,
      name: "Arun K.",
      title: "Video Editor",
      avatar: "AK",
      rating: 4.7,
      verified: false,
    },
  ];

  const ratingBreakdown = [
    { stars: 5, percentage: 85 },
    { stars: 4, percentage: 10 },
    { stars: 3, percentage: 3 },
    { stars: 2, percentage: 1 },
    { stars: 1, percentage: 1 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background font-sans text-slate-900 dark:text-white overflow-x-hidden">
      <PublicNavbar dark />

      {/* 1. PROFILE HEADER */}
      <section className="relative bg-navy dark:bg-[#03070C] pt-20">
        {/* Background Wrapper - stops horizontal overflow */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#050B15] via-navy to-royal-blue h-[120%]" />
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.05]" />

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-royal-blue/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3 pointer-events-none" />
        </div>

        {/* Cover Image Area */}
        <div className="h-48 md:h-64 relative z-10 w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-navy/60" />
          {/* Breadcrumb - Absolute positioned top left */}
          <div className="absolute top-4 left-4 md:left-8 z-20">
            <nav className="flex items-center gap-2 text-xs md:text-sm text-white/80 font-medium bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              <Link to="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <ChevronRight size={14} className="text-white/50" />
              <Link
                to="/freelancers"
                className="hover:text-white transition-colors"
              >
                Find Talent
              </Link>
              <ChevronRight size={14} className="text-white/50" />
              <span className="text-white">Profile</span>
            </nav>
          </div>
        </div>

        {/* Profile Info Content */}
        <div className="container mx-auto px-4 lg:px-8 relative z-20">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16 pb-8">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-32 h-32 md:w-44 md:h-44 rounded-2xl bg-gradient-to-br from-teal to-teal-light flex items-center justify-center text-white font-bold text-4xl md:text-6xl border-[6px] border-white shadow-2xl relative z-10">
                {freelancer.avatar}
              </div>
              {freelancer.verified && (
                <div className="absolute -bottom-3 -right-3 z-20 bg-gold text-navy px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg border border-white">
                  <BadgeCheck size={14} strokeWidth={3} />
                  Verified
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-white pt-2 md:pt-0 md:pb-2">
              <h1 className="text-3xl md:text-5xl font-bold mb-2 tracking-tight">
                {freelancer.name}
              </h1>
              <p className="text-teal-light text-lg md:text-xl font-medium mb-4 flex items-center gap-2">
                {freelancer.title}
              </p>

              <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-white/80">
                <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                  <MapPin size={16} className="text-teal-light" />
                  <span>{freelancer.location}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                  <Star size={16} className="text-gold fill-gold" />
                  <span className="font-bold text-white">
                    {freelancer.rating}
                  </span>
                  <span className="text-white/50">
                    ({freelancer.reviews} reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 w-full md:w-auto md:pb-2">
              <Button 
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate(`/login?role=client`, { state: { from: `/freelancer/${id}` } });
                  } else {
                    // Logic for authenticated contact
                    navigate(`/client/messages`, { state: { freelancerId: id } });
                  }
                }}
                className="flex-1 md:flex-none bg-teal hover:bg-teal-light text-white font-bold px-8 py-6 rounded-xl shadow-xl shadow-teal/20 transition-all hover:scale-105 active:scale-95 text-base border-0"
              >
                <MessageSquare size={20} className="mr-2" />
                Connect Me
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 px-4 py-6 rounded-xl transition-all hover:scale-105 active:scale-95",
                  isSaved && "bg-white/20 border-pink-400/50 text-pink-400",
                )}
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate(`/login?role=client`, { state: { from: `/freelancer/${id}` } });
                    return;
                  }
                  setIsSaved(!isSaved);
                }}
              >
                <Heart
                  size={24}
                  className={cn(
                    "transition-colors",
                    isSaved && "fill-pink-400",
                  )}
                />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. QUICK STATS BAR */}
      <section className="py-6 bg-white dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-navy dark:text-white">
                {freelancer.projectsCompleted}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Projects Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-navy dark:text-white">
                {freelancer.projectsCompleted}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Projects Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-teal dark:text-teal-light">
                {freelancer.successRate}%
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-navy dark:text-white">
                {freelancer.memberSince}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Member Since</div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* 3. ABOUT SECTION */}
            <AnimatedSection>
              <div className="bg-white dark:bg-transparent dark:glass-card rounded-2xl p-8 shadow-sm dark:shadow-none border border-slate-100 dark:border-white/5">
                <h2 className="text-xl font-bold text-navy dark:text-white mb-4">About</h2>
                <div
                  className={cn(
                    "text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line transition-all duration-300",
                    !showFullBio && "line-clamp-4",
                  )}
                >
                  {freelancer.bio}
                </div>
                <button
                  onClick={() => setShowFullBio(!showFullBio)}
                  className="text-royal-blue font-medium mt-3 hover:underline"
                >
                  {showFullBio ? "Show Less" : "Read More"}
                </button>
              </div>
            </AnimatedSection>

            {/* 4. SKILLS SECTION */}
            <AnimatedSection delay={100}>
              <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-8 border border-slate-100 dark:border-white/5">
                <h2 className="text-xl font-bold text-navy dark:text-white mb-6">Skills</h2>
                <div className="space-y-5">
                  {skills.map((skill, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-navy dark:text-white">
                          {skill.name}
                        </span>
                        <span
                          className={cn(
                            "text-xs font-semibold px-2 py-1 rounded-full",
                            skill.level === "Expert"
                              ? "bg-teal/10 dark:bg-teal/20 text-teal dark:text-teal-light"
                              : skill.level === "Advanced"
                                ? "bg-royal-blue/10 dark:bg-royal-blue/20 text-royal-blue dark:text-sky-blue"
                                : "bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400",
                          )}
                        >
                          {skill.level}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-1000",
                            skill.level === "Expert"
                              ? "bg-gradient-to-r from-teal to-teal-light"
                              : skill.level === "Advanced"
                                ? "bg-gradient-to-r from-royal-blue to-blue-500"
                                : "bg-gradient-to-r from-slate-400 to-slate-500",
                          )}
                          style={{ width: `${skill.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* 5. PORTFOLIO SECTION */}
            <AnimatedSection delay={200}>
              <div className="bg-white dark:bg-transparent dark:glass-card rounded-2xl p-8 shadow-sm dark:shadow-none border border-slate-100 dark:border-white/5">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-navy dark:text-white">Portfolio</h2>
                  <button className="text-royal-blue font-medium text-sm hover:underline flex items-center gap-1">
                    View All <ExternalLink size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {portfolio.map((item) => {
                    const style = getCategoryStyle(item.category);
                    const Icon = style.icon;
                    return (
                      <div
                        key={item.id}
                        className={cn(
                          "group relative aspect-video rounded-xl overflow-hidden cursor-pointer bg-gradient-to-br transition-all duration-300",
                          style.gradient
                        )}
                      >
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                          <Icon size={32} className="mb-2 opacity-80" />
                          <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                            {item.category}
                          </span>
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-navy/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-4">
                          <Play size={32} className="mb-2" />
                          <h4 className="font-semibold text-sm text-center">
                            {item.title}
                          </h4>
                          <span className="text-xs text-white/70 mt-1">
                            {item.category}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </AnimatedSection>

            {/* 6. WORK EXPERIENCE */}
            <AnimatedSection delay={300}>
              <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-8 border border-slate-100 dark:border-white/5">
                <h2 className="text-xl font-bold text-navy dark:text-white mb-6">
                  Work Experience
                </h2>
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />

                  <div className="space-y-8">
                    {experience.map((exp, idx) => (
                      <div key={idx} className="relative pl-14">
                        {/* Timeline Dot */}
                        <div className="absolute left-4 top-1 w-4 h-4 rounded-full bg-teal border-4 border-slate-50" />

                        <div className="flex items-start gap-3 mb-2">
                          <Building size={18} className="text-slate-400 dark:text-slate-500 mt-1" />
                          <div className="flex-1">
                            <h3 className="font-semibold text-navy dark:text-white">
                              {exp.role}
                            </h3>
                            <p className="text-teal dark:text-teal-light text-sm">{exp.company}</p>
                          </div>
                          <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Clock size={14} />
                            {exp.duration}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-sm ml-7">
                          {exp.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* 7. EDUCATION & CERTIFICATIONS */}
            <AnimatedSection delay={400}>
              <div className="bg-white dark:bg-transparent dark:glass-card rounded-2xl p-8 shadow-sm dark:shadow-none border border-slate-100 dark:border-white/5">
                <h2 className="text-xl font-bold text-navy dark:text-white mb-6">
                  Education & Certifications
                </h2>
                <div className="space-y-4">
                  {education.map((edu, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5"
                    >
                      <div className="w-10 h-10 rounded-lg bg-royal-blue/10 flex items-center justify-center flex-shrink-0">
                        {idx === 0 ? (
                          <GraduationCap
                            className="text-royal-blue"
                            size={20}
                          />
                        ) : (
                          <Award className="text-gold" size={20} />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-navy dark:text-white">{edu.title}</h4>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                          {edu.institution}
                        </p>
                      </div>
                      <span className="text-sm text-slate-400">{edu.year}</span>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* 8. REVIEWS SECTION */}
            <AnimatedSection delay={500}>
              <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-8 border border-slate-100 dark:border-white/5">
                <h2 className="text-xl font-bold text-navy dark:text-white mb-6">
                  Client Reviews
                </h2>

                {/* Rating Summary */}
                <div className="flex flex-col md:flex-row gap-8 mb-8 p-6 bg-white dark:bg-white/10 rounded-xl border border-slate-100 dark:border-white/5 shadow-sm dark:shadow-none">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-navy dark:text-white mb-2">
                      {freelancer.rating}
                    </div>
                    <div className="flex justify-center mb-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          size={18}
                          className="text-gold fill-gold"
                        />
                      ))}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {freelancer.reviews} reviews
                    </div>
                  </div>

                  <div className="flex-1 space-y-2">
                    {ratingBreakdown.map((rating) => (
                      <div
                        key={rating.stars}
                        className="flex items-center gap-3"
                      >
                        <span className="text-sm text-slate-500 dark:text-slate-400 w-8">
                          {rating.stars}★
                        </span>
                        <div className="flex-1 h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gold rounded-full"
                            style={{ width: `${rating.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-slate-500 dark:text-slate-400 w-10">
                          {rating.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Review Cards */}
                <div className="space-y-4">
                  {reviews.slice(0, visibleReviews).map((review) => (
                    <div key={review.id} className="bg-white dark:bg-white/5 p-6 rounded-xl border border-slate-100 dark:border-white/5 shadow-sm dark:shadow-none">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-royal-blue to-teal flex items-center justify-center text-white font-bold text-sm">
                            {review.avatar}
                          </div>
                          <div>
                            <h4 className="font-semibold text-navy dark:text-white">
                              {review.client}
                            </h4>
                            <p className="text-xs text-slate-500">
                              {review.project}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-slate-400">
                          {review.date}
                        </span>
                      </div>

                      <div className="flex mb-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            size={14}
                            className={
                              i <= review.rating
                                ? "text-gold fill-gold"
                                : "text-slate-200"
                            }
                          />
                        ))}
                      </div>

                      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                        {review.text}
                      </p>
                    </div>
                  ))}
                </div>

                {visibleReviews < reviews.length && (
                  <button
                    onClick={() => setVisibleReviews(reviews.length)}
                    className="w-full mt-6 py-3 text-royal-blue font-medium hover:bg-white rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    Load More Reviews
                    <ChevronDown size={18} />
                  </button>
                )}
              </div>
            </AnimatedSection>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Sticky Contact Card */}
            <div className="sticky top-24">
              <div className="bg-white dark:bg-transparent dark:glass-card rounded-2xl p-6 shadow-sm dark:shadow-none border border-slate-100 dark:border-white/5 mb-6">
                <div className="text-center mb-6">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Average response time: 2 hours
                  </p>
                </div>

                <Button 
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate(`/login?role=client`, { state: { from: `/freelancer/${id}` } });
                    } else {
                      navigate(`/client/messages`, { state: { freelancerId: id } });
                    }
                  }}
                  className="w-full bg-teal hover:bg-teal-light text-white font-semibold py-6 mb-3"
                >
                  <MessageSquare size={18} className="mr-2" />
                  Connect {freelancer.name.split(" ")[0]}
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-slate-200 dark:border-white/20 text-navy dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 py-6"
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate(`/login?role=client`, { state: { from: `/freelancer/${id}` } });
                      return;
                    }
                    setIsSaved(!isSaved);
                  }}
                >
                  <Heart
                    size={18}
                    className={cn(
                      "mr-2",
                      isSaved && "fill-pink-400 text-pink-400",
                    )}
                  />
                  {isSaved ? "Saved" : "Save to Favorites"}
                </Button>
              </div>

              {/* 9. SIMILAR FREELANCERS */}
              <div className="bg-white dark:bg-transparent dark:glass-card rounded-2xl p-6 shadow-sm dark:shadow-none border border-slate-100 dark:border-white/5">
                <h3 className="font-bold text-navy dark:text-white mb-4">
                  Similar Freelancers
                </h3>
                <div className="space-y-4">
                  {similarFreelancers.map((fl) => (
                    <Link
                      key={fl.id}
                      to={`/freelancer/${fl.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal to-royal-blue flex items-center justify-center text-white font-bold">
                        {fl.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-navy dark:text-white group-hover:text-royal-blue dark:group-hover:text-teal transition-colors">
                            {fl.name}
                          </h4>
                          {fl.verified && (
                            <BadgeCheck size={14} className="text-gold" />
                          )}
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{fl.title}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                          <Star size={12} className="text-gold fill-gold" />
                          <span>{fl.rating}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 10. CTA SECTION */}
      <section className="py-20 bg-gradient-to-r from-teal to-teal-light relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <AnimatedSection>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Work with {freelancer.name.split(" ")[0]}?
              </h2>
              <p className="text-white/90 text-xl mb-8 leading-relaxed">
                Start a conversation and bring your creative vision to life.
              </p>
               <Button
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate(`/login?role=client`, { state: { from: `/freelancer/${id}` } });
                  } else {
                    // Logic for hiring when authenticated as client
                    navigate(`/client/dashboard`);
                  }
                }}
                size="lg"
                className="bg-white text-teal hover:bg-slate-100 font-bold text-lg px-10 py-7 rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
              >
                Hire Now
                <ArrowRight size={20} className="ml-2" />
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* 11. FOOTER */}
      <PublicFooter />
      
      {/* MOBILE FIXED CONTACT BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#03070C]/95 backdrop-blur-xl border-t border-slate-100 dark:border-white/10 p-4 animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => {
              if (!isAuthenticated) {
                navigate(`/login?role=client`, { state: { from: `/freelancer/${id}` } });
              } else {
                navigate(`/client/messages`, { state: { freelancerId: id } });
              }
            }}
            className="flex-1 bg-teal hover:bg-teal-light text-white font-bold py-6 rounded-xl shadow-lg transition-all active:scale-95 text-base"
          >
            <MessageSquare size={20} className="mr-2" />
            Connect Me
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white px-4 py-6 rounded-xl transition-all active:scale-95",
              isSaved && "bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-900/30 text-pink-500",
            )}
            onClick={() => {
              if (!isAuthenticated) {
                navigate(`/login?role=client`, { state: { from: `/freelancer/${id}` } });
                return;
              }
              setIsSaved(!isSaved);
            }}
          >
            <Heart
              size={24}
              className={cn(
                "transition-colors",
                isSaved && "fill-pink-500",
              )}
            />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FreelancerProfile;
