import { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import type { ClientLayoutContext } from "@/layouts/ClientLayout";
import { useUnreadStore } from "@/stores/unread.store";
import {
  Star,
  Menu,
  ThumbsUp,
  Calendar,
  MessageCircle,
  TrendingUp,
  MessageSquare,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { reviewService, type Review } from "@/services";
import { toast } from "react-toastify";

const ClientReviews = () => {
  const totalUnreadCount = useUnreadStore((s) => s.totalUnreadCount);
  const { setSidebarOpen } = useOutletContext<ClientLayoutContext>();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await reviewService.getMyReviews();
        setReviews(response.reviews || []);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        toast.error("Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews
      : 0;

  const fiveStarReviews = reviews.filter((r) => r.rating === 5).length;
  const helpfulVotes = 0; // Keeping it 0 as per backend currently

  const formatDate = (dateString: string) => {
    try {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(dateString));
    } catch {
      return dateString;
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-50 font-sans">
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 lg:px-8 py-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-navy">
                My Reviews
              </h1>
              <p className="text-sm text-slate-500 hidden sm:block">
                Reviews you've given to freelancers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <Link
              to="/client/messages"
              className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg hidden sm:flex"
            >
              <MessageSquare size={20} />
              {totalUnreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-teal rounded-full border-2 border-white" />
              )}
            </Link>
            
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg hidden sm:flex">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1 pr-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-royal-blue to-teal flex items-center justify-center text-white font-bold text-sm">
                  {user?.fullName
                    ? user.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                    : (user?.email?.[0] || "U").toUpperCase()}
                </div>
                <ChevronDown
                  size={16}
                  className="text-slate-500 hidden sm:block"
                />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="font-semibold text-navy">
                      {user?.fullName || user?.email?.split("@")[0] || "Client"}
                    </p>
                    <p className="text-sm text-slate-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <Link
                    to="/client/profile"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                  >
                    <User size={16} />
                    My Profile
                  </Link>
                  <Link
                    to="/client/settings"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                  >
                    <Settings size={16} />
                    Settings
                  </Link>
                  <hr className="my-2 border-slate-100" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="p-4 lg:p-8 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center mb-3">
              <Star size={20} className="text-gold fill-gold" />
            </div>
            <p className="text-sm text-slate-500 mb-1">Average Rating Given</p>
            <p className="text-2xl font-bold text-navy">
              {averageRating.toFixed(1)}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center mb-3">
              <MessageCircle size={20} className="text-teal" />
            </div>
            <p className="text-sm text-slate-500 mb-1">Total Reviews</p>
            <p className="text-2xl font-bold text-navy">{totalReviews}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mb-3">
              <TrendingUp size={20} className="text-green-600" />
            </div>
            <p className="text-sm text-slate-500 mb-1">5-Star Reviews</p>
            <p className="text-2xl font-bold text-navy">
              {fiveStarReviews}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <div className="w-10 h-10 rounded-xl bg-royal-blue/10 flex items-center justify-center mb-3">
              <ThumbsUp size={20} className="text-royal-blue" />
            </div>
            <p className="text-sm text-slate-500 mb-1">Helpful Votes</p>
            <p className="text-2xl font-bold text-navy">
              {helpfulVotes}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal mb-4"></div>
            <p className="text-slate-500">Loading your reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-100 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
              <Star size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-navy mb-2">No reviews yet</h3>
            <p className="text-slate-500 mb-6">You haven't given any reviews to freelancers yet.</p>
            <Link to="/client/projects">
              <Button className="bg-teal hover:bg-teal-light text-white">
                View Projects
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-navy">Your Reviews</h2>
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-xl border border-slate-100 p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-royal-blue to-teal flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {review.reviewer?.avatar || review.reviewer?.fullName?.charAt(0) || "F"}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div>
                        <p className="font-semibold text-navy">
                          {review.reviewer?.fullName || "Freelancer"}
                        </p>
                        <p className="text-sm text-slate-500">
                          Project: {review.project?.title || "Untitled Project"}
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
                        <span className="text-sm text-slate-500 flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-600 mb-3">{review.comment}</p>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-teal hover:bg-teal/10"
                      >
                        <MessageCircle size={14} className="mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ClientReviews;
