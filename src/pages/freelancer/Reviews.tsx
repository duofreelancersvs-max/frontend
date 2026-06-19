import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Star,
  ThumbsUp,
  MessageCircle,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { reviewService } from "@/services";
import type { Review } from "@/services";
import type { FreelancerLayoutContext } from "@/layouts/FreelancerLayout";
import DashboardHeader from "@/components/layouts/DashboardHeader";

const FreelancerReviews = () => {
  const { setSidebarOpen } = useOutletContext<FreelancerLayoutContext>();


  const [reviews, setReviews] = useState<Review[]>([]);
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await reviewService.getMyReviews();
        const sortedReviews = (data.reviews || []).sort(
          (a: Review, b: Review) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setReviews(sortedReviews);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };
    fetchReviews();
  }, []);

  const reviewsData = reviews.map((r: any) => ({
    id: r.id,
    projectTitle: r.project?.title || "Project",
    client: {
      name: r.reviewer?.fullName || "Client",
      company: "Client's Company",
      avatar: (r.reviewer?.fullName || "C").substring(0, 2).toUpperCase(),
    },
    rating: r.rating,
    review: r.comment || "",
    date: new Date(r.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    helpful: 0,
  }));

  const totalReviews = reviewsData.length;
  const averageRating =
    totalReviews > 0
      ? reviewsData.reduce((acc: any, r: any) => acc + r.rating, 0) /
        totalReviews
      : 0;

  return (
    <div className="w-full bg-slate-50 dark:bg-background flex-1 h-full overflow-y-auto">
      <div className="w-full">
        <DashboardHeader
          title="My Reviews"
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="dashboard-content">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10 p-5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center mb-3">
                <Star size={20} className="text-gold fill-gold" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Average Rating</p>
              <p className="text-2xl font-bold text-navy dark:text-white">
                {averageRating.toFixed(1)}
              </p>
            </div>
            <div className="bg-white dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10 p-5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center mb-3">
                <MessageCircle size={20} className="text-teal" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total Reviews</p>
              <p className="text-2xl font-bold text-navy dark:text-white">{totalReviews}</p>
            </div>
            <div className="bg-white dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10 p-5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-success-green/10 flex items-center justify-center mb-3">
                <TrendingUp size={20} className="text-success-green" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">5-Star Reviews</p>
              <p className="text-2xl font-bold text-navy dark:text-white">
                {reviewsData.filter((r: any) => r.rating === 5).length}
              </p>
            </div>
            <div className="bg-white dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10 p-5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-royal-blue/10 flex items-center justify-center mb-3">
                <ThumbsUp size={20} className="text-royal-blue" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Helpful Votes</p>
              <p className="text-2xl font-bold text-navy dark:text-white">
                {reviewsData.reduce((acc: any, r: any) => acc + r.helpful, 0)}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-navy dark:text-white">All Reviews</h2>
            {reviewsData.map((review: any) => (
              <div
                key={review.id}
                className="bg-white dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10 p-6 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-royal-blue to-teal flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {review.client.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div>
                        <p className="font-semibold text-navy dark:text-white">
                          {review.client.name}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {review.client.company}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={
                                i < review.rating
                                  ? "text-gold fill-gold"
                                  : "text-slate-200"
                              }
                            />
                          ))}
                        </div>
                        <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Calendar size={12} />
                          {review.date}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                      Project: {review.projectTitle}
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 mb-3">{review.review}</p>
                    <button className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-teal transition-colors">
                      <ThumbsUp size={14} />
                      {review.helpful} found this helpful
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default FreelancerReviews;
