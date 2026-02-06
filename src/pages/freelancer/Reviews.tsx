import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Home,
  User,
  FolderOpen,
  Search,
  FileText,
  Mail,
  CreditCard,
  DollarSign,
  Star,
  Settings,
  LogOut,
  X,
  Menu,
  ThumbsUp,
  MessageCircle,
  Award,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarNavItems = [
  {
    icon: Home,
    label: "Dashboard",
    href: "/freelancer/dashboard",
    active: false,
  },
  { icon: User, label: "My Profile", href: "/freelancer/profile", badge: null },
  {
    icon: FolderOpen,
    label: "Portfolio",
    href: "/freelancer/portfolio",
    badge: null,
  },
  { icon: Search, label: "Browse Projects", href: "/projects", badge: null },
  {
    icon: FileText,
    label: "My Applications",
    href: "/freelancer/applications",
    badge: "3",
  },
  { icon: Mail, label: "Messages", href: "/freelancer/messages", badge: "5" },
  {
    icon: CreditCard,
    label: "Subscription",
    href: "/freelancer/subscription",
    badge: null,
  },
  {
    icon: DollarSign,
    label: "Earnings",
    href: "/freelancer/earnings",
    badge: null,
  },
  {
    icon: Star,
    label: "Reviews",
    href: "/freelancer/reviews",
    active: true,
    badge: null,
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/freelancer/settings",
    badge: null,
  },
];

const reviewsData = [
  {
    id: 1,
    projectTitle: "E-commerce Product Video",
    client: {
      name: "Rahul Sharma",
      company: "TechMart Solutions",
      avatar: "RS",
    },
    rating: 5,
    review:
      "Exceptional work! Arun delivered a stunning product video that exceeded our expectations.",
    date: "Dec 18, 2024",
    helpful: 12,
  },
  {
    id: 2,
    projectTitle: "Corporate Explainer",
    client: { name: "Priya Patel", company: "InnovateCorp", avatar: "PP" },
    rating: 5,
    review:
      "Arun is incredibly talented and professional. He understood our brand perfectly.",
    date: "Dec 10, 2024",
    helpful: 8,
  },
  {
    id: 3,
    projectTitle: "YouTube Channel Intro",
    client: { name: "Vikram Reddy", company: "TechReview Pro", avatar: "VR" },
    rating: 4,
    review:
      "Great intro animation! Arun was responsive and made revisions quickly.",
    date: "Nov 28, 2024",
    helpful: 5,
  },
  {
    id: 4,
    projectTitle: "Wedding Highlight Reel",
    client: { name: "Sneha & Arjun", company: "Personal", avatar: "SA" },
    rating: 5,
    review:
      "We are so grateful to Arun for capturing our special day so beautifully!",
    date: "Nov 15, 2024",
    helpful: 23,
  },
];

const FreelancerReviews = () => {
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
          <div className="px-4 pb-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gold/20">
              <Award size={16} className="text-gold" />
              <span className="text-xs font-semibold text-gold">Pro Plan</span>
            </div>
          </div>
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-royal-blue to-teal flex items-center justify-center text-white font-bold text-sm">
                AK
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  Arun Kumar
                </p>
                <p className="text-xs text-white/50">Freelancer</p>
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
                See what clients are saying about your work
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
              <p className="text-sm text-slate-500 mb-1">Average Rating</p>
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
            <h2 className="text-lg font-bold text-navy">All Reviews</h2>
            {reviewsData.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-xl border border-slate-100 p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-royal-blue to-teal flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {review.client.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div>
                        <p className="font-semibold text-navy">
                          {review.client.name}
                        </p>
                        <p className="text-sm text-slate-500">
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
                        <span className="text-sm text-slate-500 flex items-center gap-1">
                          <Calendar size={12} />
                          {review.date}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 mb-2">
                      Project: {review.projectTitle}
                    </p>
                    <p className="text-slate-600 mb-3">{review.review}</p>
                    <button className="flex items-center gap-1 text-sm text-slate-500 hover:text-teal">
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
