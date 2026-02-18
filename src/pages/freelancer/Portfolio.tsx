import { useState, useEffect } from "react";
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
  Plus,
  ExternalLink,
  Edit2,
  Trash2,
  Eye,
  MoreVertical,
  Award,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { freelancerService } from "@/services";
import type { PortfolioItem } from "@/services";

// Sidebar Navigation Items for Freelancer
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
    active: true,
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
  { icon: Star, label: "Reviews", href: "/freelancer/reviews", badge: null },
  {
    icon: Settings,
    label: "Settings",
    href: "/freelancer/settings",
    badge: null,
  },
];

// Mock portfolio data
const portfolioItems = [
  {
    id: 1,
    title: "E-commerce Product Video",
    type: "video",
    thumbnail:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400",
    views: 1234,
    likes: 89,
    category: "Product Videos",
    client: "TechMart Solutions",
  },
  {
    id: 2,
    title: "Corporate Brand Animation",
    type: "video",
    thumbnail:
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400",
    views: 856,
    likes: 67,
    category: "Motion Graphics",
    client: "InnovateCorp",
  },
  {
    id: 3,
    title: "Wedding Highlight Reel",
    type: "video",
    thumbnail:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400",
    views: 2341,
    likes: 156,
    category: "Wedding Videos",
    client: "Personal Project",
  },
  {
    id: 4,
    title: "Social Media Ad Campaign",
    type: "image",
    thumbnail:
      "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400",
    views: 567,
    likes: 45,
    category: "Social Media",
    client: "Brand Boost Agency",
  },
  {
    id: 5,
    title: "YouTube Channel Intro",
    type: "video",
    thumbnail:
      "https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=400",
    views: 3456,
    likes: 234,
    category: "Intros & Outros",
    client: "TechReview Pro",
  },
  {
    id: 6,
    title: "Real Estate Walkthrough",
    type: "video",
    thumbnail:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400",
    views: 789,
    likes: 56,
    category: "Real Estate",
    client: "Premium Properties",
  },
];

const categories = [
  "All",
  "Product Videos",
  "Motion Graphics",
  "Wedding Videos",
  "Social Media",
  "Intros & Outros",
  "Real Estate",
];

const FreelancerPortfolio = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscriptionPlan] = useState<"pro" | "free">("pro");

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        const profile = await freelancerService.getMyProfile();
        setPortfolioItems(profile.portfolio || []);
      } catch (error) {
        console.error("Error fetching portfolio:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, []);

  const filteredItems =
    selectedCategory === "All"
      ? portfolioItems
      : portfolioItems.filter((item) => item.title === selectedCategory);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* SIDEBAR */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 bg-navy transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
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

          {/* Navigation */}
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

          {/* Subscription Badge */}
          <div className="px-4 pb-2">
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg",
                subscriptionPlan === "free" ? "bg-slate-500/20" : "bg-gold/20",
              )}
            >
              <Award
                size={16}
                className={
                  subscriptionPlan === "free" ? "text-slate-400" : "text-gold"
                }
              />
              <span
                className={cn(
                  "text-xs font-semibold",
                  subscriptionPlan === "free" ? "text-slate-400" : "text-gold",
                )}
              >
                {subscriptionPlan} Plan
              </span>
            </div>
          </div>

          {/* User Profile Card */}
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

      {/* SIDEBAR OVERLAY (Mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* MAIN CONTENT */}
      <div className="lg:ml-64">
        {/* Header Bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <Menu size={24} />
              </button>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-navy">
                  My Portfolio
                </h1>
                <p className="text-sm text-slate-500 hidden sm:block">
                  Showcase your best work to attract clients
                </p>
              </div>
            </div>

            <Button className="bg-teal hover:bg-teal-light text-white">
              <Plus size={18} className="mr-2" />
              Add Project
            </Button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-4 lg:p-8 space-y-6">
          {/* Category Filter */}
          <div className="flex overflow-x-auto scrollbar-hide gap-2 pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                  selectedCategory === category
                    ? "bg-teal text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-teal hover:text-teal",
                )}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Portfolio Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-100 p-4">
              <p className="text-sm text-slate-500 mb-1">Total Projects</p>
              <p className="text-2xl font-bold text-navy">
                {portfolioItems.length}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-4">
              <p className="text-sm text-slate-500 mb-1">Total Views</p>
              <p className="text-2xl font-bold text-navy">
                {portfolioItems
                  .reduce((acc, item) => acc + item.views, 0)
                  .toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-4">
              <p className="text-sm text-slate-500 mb-1">Total Likes</p>
              <p className="text-2xl font-bold text-navy">
                {portfolioItems.reduce((acc, item) => acc + item.likes, 0)}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-4">
              <p className="text-sm text-slate-500 mb-1">Categories</p>
              <p className="text-2xl font-bold text-navy">
                {categories.length - 1}
              </p>
            </div>
          </div>

          {/* Portfolio Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-lg transition-all"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-slate-100">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button className="p-2 bg-white rounded-full text-navy hover:bg-teal hover:text-white transition-colors">
                      <Eye size={18} />
                    </button>
                    <button className="p-2 bg-white rounded-full text-navy hover:bg-teal hover:text-white transition-colors">
                      <Edit2 size={18} />
                    </button>
                  </div>
                  {item.type === "video" && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/60 text-white text-xs px-2 py-1 rounded">
                      <Play size={12} />
                      Video
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === item.id ? null : item.id);
                        }}
                        className="p-1.5 bg-white/90 rounded-lg text-slate-600 hover:bg-white transition-colors"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {openMenuId === item.id && (
                        <div
                          className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-50"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                            <Edit2 size={14} /> Edit
                          </button>
                          <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                            <ExternalLink size={14} /> Share
                          </button>
                          <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50">
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-xs font-medium mb-2">
                    {item.category}
                  </span>
                  <h3 className="font-semibold text-navy mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-500 mb-3">
                    Client: {item.client}
                  </p>

                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Eye size={14} /> {item.views.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star size={14} /> {item.likes}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <FolderOpen size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-navy mb-2">
                No projects in this category
              </h3>
              <p className="text-slate-500 mb-4">
                Start adding your work to build your portfolio
              </p>
              <Button className="bg-teal hover:bg-teal-light text-white">
                <Plus size={18} className="mr-2" />
                Add Your First Project
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default FreelancerPortfolio;
