import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, BadgeCheck, Heart, MapPin, MessageSquare, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { freelancerService, reviewService } from "@/services";
import type { FreelancerProfile, Review } from "@/services";
import { getCategoryStyle } from "@/lib/category-styles";
import DashboardHeader from "@/components/layouts/DashboardHeader";
import { ReportModal } from "@/components/common/ReportModal";

const FreelancerProfileView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [freelancer, setFreelancer] = useState<FreelancerProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        setLoading(true);
        
        // First get profile to get the userId
        const profileData = await freelancerService.getById(id);
        setFreelancer(profileData);
        
        // Then get reviews using the userId
        if (profileData.userId) {
          const reviewsData = await reviewService.getForUser(profileData.userId);
          setReviews(reviewsData.reviews || []);
        }
      } catch (error) {
        console.error("Error fetching freelancer profile data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal"></div>
      </div>
    );
  }

  if (!freelancer) {
    return (
      <div className="p-8 text-center text-slate-500">
        <h2 className="text-xl font-bold mb-4 text-navy">
          Freelancer not found
        </h2>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50 dark:bg-background">
      <DashboardHeader
        title="Freelancer Profile"
        onMenuClick={() => navigate(-1)}
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-navy dark:hover:text-white transition-colors mr-4"
        >
          <ArrowLeft size={18} />
          <span className="hidden sm:inline">Back</span>
        </button>
      </DashboardHeader>

      {/* Header Info */}
      <div className="bg-white dark:bg-background border-b border-slate-200 dark:border-white/5">
        <div className="dashboard-content">

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-gradient-to-br from-royal-blue to-teal flex items-center justify-center text-white font-bold text-4xl shadow-xl">
                {(freelancer.displayName ||
                  freelancer.firstName ||
                  "F")[0].toUpperCase()}
              </div>
              {freelancer.isVerified && (
                <div className="absolute -bottom-3 -right-3 bg-yellow-400 text-navy px-2 py-1 rounded-full text-xxs font-bold flex items-center gap-1 shadow-lg border-2 border-white">
                  <BadgeCheck size={12} strokeWidth={3} />
                  VERIFIED
                </div>
              )}
              {freelancer.featuredProfile && (
                <div
                  data-testid="featured-ribbon"
                  className="absolute -bottom-3 left-4 inline-flex items-center gap-1 px-2 py-1 bg-teal-500 text-white rounded-full text-xxs font-bold uppercase tracking-wide shadow-lg border-2 border-white"
                  title="Top of search results"
                >
                  <Zap size={10} className="fill-white" />
                  Featured
                </div>
              )}
              {freelancer.isProActive && (
                <div
                  data-testid="pro-member-badge"
                  className="absolute -top-3 -left-3 inline-flex items-center gap-1 px-2 py-1 bg-white border border-teal-500/30 text-teal-700 rounded-full text-xxs font-bold shadow-lg border-2 border-white"
                  title="Pro Member"
                >
                  <Zap size={10} className="fill-teal-500 text-teal-500" />
                  Pro
                </div>
              )}
            </div>

            {/* Main Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-navy dark:text-white mb-1">
                    {freelancer.displayName ||
                      `${freelancer.firstName} ${freelancer.lastName}`}
                  </h1>
                  <p className="text-xl text-teal font-medium">
                    {freelancer.headline || "Professional Creative"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    className="text-red-500 border-red-200 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20"
                    onClick={() => setIsReportModalOpen(true)}
                  >
                    Report
                  </Button>
                  <Button 
                    className="bg-teal hover:bg-teal-light text-white font-semibold shadow-sm"
                    onClick={() => navigate(`/client/messages`, { state: { freelancerId: id } })}
                  >
                    <MessageSquare size={18} className="mr-2" />
                    Connect Me
                  </Button>
                  <Button
                    variant="ghost"
                    className={cn(
                      "bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-400 hover:text-pink-500",
                      isSaved && "text-pink-500 border-pink-100 bg-pink-50 dark:bg-pink-500/10",
                    )}
                    onClick={() => setIsSaved(!isSaved)}
                  >
                    <Heart
                      size={20}
                      className={cn(isSaved && "fill-pink-500")}
                    />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <MapPin size={16} />
                  <span>
                    {freelancer.availability === "available"
                      ? "Remote / Available"
                      : "Busy"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star size={16} className="text-yellow-400 fill-yellow-400" />
                  <span className="font-bold text-navy dark:text-white">
                    {freelancer.averageRating || 0}
                  </span>
                  <span>({freelancer.reviewCount || 0} reviews)</span>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="dashboard-content">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Portfolio Section */}
            <section className="bg-white dark:bg-white/5 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-white/10">
              <h2 className="text-xl font-bold text-navy dark:text-white mb-6">Portfolio</h2>
              {freelancer.portfolio && freelancer.portfolio.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {freelancer.portfolio.map((item) => (
                    <div
                      key={item._id}
                      className="group relative rounded-xl overflow-hidden border border-slate-100 shadow-sm transition-all hover:shadow-md"
                    >
                      <div className="aspect-video relative overflow-hidden bg-slate-100">
                        {item.thumbnail?.startsWith("gradient:") ||
                        !item.thumbnail ? (
                          (() => {
                            const category =
                              item.skills?.[0] ||
                              (item.thumbnail?.startsWith("gradient:")
                                ? item.thumbnail.split(":")[1]
                                : "Default") ||
                              "Default";
                            const style = getCategoryStyle(category);
                            const Icon = style.icon;
                            return (
                              <div
                                className={cn(
                                  "w-full h-full flex flex-col items-center justify-center text-white bg-gradient-to-br",
                                  style.gradient,
                                )}
                              >
                                <Icon size={40} className="mb-2 opacity-80" />
                                <span className="text-xxs font-bold uppercase tracking-wider opacity-60">
                                  {category}
                                </span>
                              </div>
                            );
                          })()
                        ) : (
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        )}
                        {item.projectUrl && (
                          <div className="absolute inset-0 bg-navy/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                              size="sm"
                              className="bg-white text-navy hover:bg-teal hover:text-white transition-all transform hover:scale-105"
                              onClick={() => window.open(item.projectUrl, '_blank')}
                            >
                              View Project
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-navy">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-slate-50 dark:bg-white/5 rounded-xl border-2 border-dashed border-slate-200 dark:border-white/10">
                  <p className="text-slate-400">
                    No portfolio projects to display yet.
                  </p>
                </div>
              )}
            </section>

            {/* About Section */}
            <section className="bg-white dark:bg-white/5 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-white/10">
              <h2 className="text-xl font-bold text-navy dark:text-white mb-4">About</h2>
              <div className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                {freelancer.bio ||
                  `I'm a dedicated ${freelancer.categories?.[0] || 'creative'} professional with a passion for excellence. I've worked on various projects and always aim to deliver high-quality results for my clients.`}
              </div>
            </section>

            <section className="bg-white dark:bg-white/5 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-white/10">
              <h2 className="text-xl font-bold text-navy dark:text-white mb-6">
                Client Reviews
              </h2>
              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-slate-50 last:border-0 pb-6 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold overflow-hidden">
                            {review.reviewer?.avatar ? (
                              <img src={review.reviewer.avatar} alt={review.reviewer.fullName} className="w-full h-full object-cover" />
                            ) : (
                              (review.reviewer?.fullName || "C")[0].toUpperCase()
                            )}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-navy">
                              {review.reviewer?.fullName || "Client"}
                            </h4>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={12}
                                  className={cn(
                                    i < review.rating
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-slate-200"
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-slate-400">
                          {new Date(review.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric"
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed mb-2 break-words whitespace-pre-wrap">
                        {review.comment}
                      </p>
                      {review.project && (
                        <p className="text-xs text-teal font-medium">
                          Project: {review.project.title}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-400">
                  <Star size={32} className="mx-auto mb-2 opacity-20" />
                  <p>No reviews yet.</p>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white dark:bg-white/5 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-white/10">
              <h3 className="font-bold text-navy dark:text-white mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Success Rate</span>
                  <span className="font-bold text-teal">
                    {freelancer.successRate}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Projects Completed</span>
                  <span className="font-bold text-navy dark:text-white">
                    {freelancer.totalProjects}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Member Since</span>
                  <span className="font-bold text-slate-600 dark:text-slate-300">
                    {new Date(freelancer.createdAt).getFullYear()}
                  </span>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white dark:bg-white/5 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-white/10">
              <h3 className="font-bold text-navy dark:text-white mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {freelancer.skills?.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-medium"
                  >
                    {typeof skill === "string" ? skill : skill.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Verification & Badges */}
            <div className="bg-teal/5 dark:bg-teal/10 rounded-2xl p-6 border border-teal/10 dark:border-teal/20">
              <h3 className="font-bold text-navy dark:text-white mb-4 flex items-center gap-2">
                <BadgeCheck className="text-teal" size={20} />
                Verification Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      freelancer.isVerified ? "bg-green-500" : "bg-slate-300",
                    )}
                  />
                  <span>ID Verified</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>Email Verified</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      freelancer.reviewCount > 0
                        ? "bg-green-500"
                        : "bg-slate-300",
                    )}
                  />
                  <span>Profile Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {freelancer && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          reportedUserId={freelancer.userId}
          reportedUserName={freelancer.displayName || `${freelancer.firstName} ${freelancer.lastName}`}
        />
      )}
    </div>
  );
};

export default FreelancerProfileView;
