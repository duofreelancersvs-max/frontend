import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Home,
  Folder,
  PlusCircle,
  Search,
  Mail,
  CreditCard,
  Star,
  Settings,
  LogOut,
  X,
  Menu,
  ThumbsUp,
  Calendar,
  MessageCircle,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const sidebarNavItems = [
  { icon: Home, label: "Dashboard", href: "/client/dashboard", active: false },
  { icon: Folder, label: "My Projects", href: "/client/projects", badge: null },
  {
    icon: PlusCircle,
    label: "Post Project",
    href: "/client/post-project",
    badge: null,
  },
  {
    icon: Search,
    label: "Find Freelancers",
    href: "/freelancers",
    badge: null,
  },
  { icon: Mail, label: "Messages", href: "/client/messages", badge: "3" },
  {
    icon: CreditCard,
    label: "Payments",
    href: "/client/payments",
    badge: null,
  },
  {
    icon: Star,
    label: "Reviews",
    href: "/client/reviews",
    active: true,
    badge: null,
  },
  { icon: Settings, label: "Settings", href: "/client/settings", badge: null },
];

const reviewsData = [
  {
    id: 1,
    projectTitle: "E-commerce Product Video",
    freelancer: { name: "Arun Kumar", avatar: "AK" },
    rating: 5,
    review: "Excellent work! Arun delivered exactly what we needed.",
    date: "Dec 18, 2024",
    helpful: 8,
  },
  {
    id: 2,
    projectTitle: "Corporate Explainer",
    freelancer: { name: "Priya Sharma", avatar: "PS" },
    rating: 5,
    review: "Very professional and creative. Would definitely hire again.",
    date: "Dec 10, 2024",
    helpful: 5,
  },
  {
    id: 3,
    projectTitle: "YouTube Channel Intro",
    freelancer: { name: "Vikram Reddy", avatar: "VR" },
    rating: 4,
    review: "Good work overall. Minor revisions needed but responsive.",
    date: "Nov 28, 2024",
    helpful: 3,
  },
  {
    id: 4,
    projectTitle: "Wedding Highlight Reel",
    freelancer: { name: "Meera Singh", avatar: "MS" },
    rating: 5,
    review: "Absolutely beautiful video! Captured all the emotions perfectly.",
    date: "Nov 15, 2024",
    helpful: 12,
  },
];

const ClientReviews = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const totalReviews = reviewsData.length;
  const averageRating =
    reviewsData.reduce((acc, r) => acc + r.rating, 0) / totalReviews;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 bg-navy transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal to-teal-light flex items-center justify-center text-white font-bold text-lg">
              C
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white tracking-tight">
                ConnectMe
              </span>
              <span className="text-[10px] font-semibold tracking-widest uppercase -mt-1 text-teal-light">
                India
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden ml-auto text-white/60 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {sidebarNavItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  item.active
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white",
                )}
              >
                <item.icon size={20} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-teal text-white rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-royal-blue to-teal flex items-center justify-center text-white font-bold text-sm">
                RK
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  Rajesh Kumar
                </p>
                <p className="text-xs text-white/50">Client Account</p>
              </div>
              <button className="text-white/50 hover:text-white transition-colors">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="lg:ml-64">
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 lg:px-8 py-4">
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
        </header>
        <main className="p-4 lg:p-8 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-100 p-5">
              <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center mb-3">
                <Star size={20} className="text-gold fill-gold" />
              </div>
              <p className="text-sm text-slate-500 mb-1">
                Average Rating Given
              </p>
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
              <div className="w-10 h-10 rounded-xl bg-success-green/10 flex items-center justify-center mb-3">
                <TrendingUp size={20} className="text-success-green" />
              </div>
              <p className="text-sm text-slate-500 mb-1">5-Star Reviews</p>
              <p className="text-2xl font-bold text-navy">
                {reviewsData.filter((r) => r.rating === 5).length}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-5">
              <div className="w-10 h-10 rounded-xl bg-royal-blue/10 flex items-center justify-center mb-3">
                <ThumbsUp size={20} className="text-royal-blue" />
              </div>
              <p className="text-sm text-slate-500 mb-1">Helpful Votes</p>
              <p className="text-2xl font-bold text-navy">
                {reviewsData.reduce((acc, r) => acc + r.helpful, 0)}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-navy">Your Reviews</h2>
            {reviewsData.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-xl border border-slate-100 p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-royal-blue to-teal flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {review.freelancer.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div>
                        <p className="font-semibold text-navy">
                          {review.freelancer.name}
                        </p>
                        <p className="text-sm text-slate-500">
                          Project: {review.projectTitle}
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
                          {review.date}
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-600 mb-3">{review.review}</p>
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-1 text-sm text-slate-500 hover:text-teal">
                        <ThumbsUp size={14} />
                        {review.helpful} found this helpful
                      </button>
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
        </main>
      </div>
    </div>
  );
};

export default ClientReviews;
