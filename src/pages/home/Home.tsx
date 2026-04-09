import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Folder,
  PlusCircle,
  Search,
  Mail,
  Briefcase,
  FileText,
  LogOut,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Award,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUnreadStore } from "@/stores/unread.store";
import { cn } from "@/lib/utils";
import Logo from "@/components/shared/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useThemeStore } from "@/stores/theme.store";
import { projectService, applicationService } from "@/services";

interface ActionItem {
  icon: React.ElementType;
  label: string;
  description: string;
  href: string;
  hasBadge?: boolean;
}

const clientActions: ActionItem[] = [
  { icon: Folder, label: "My Projects", description: "View and manage your active projects", href: "/client/projects" },
  { icon: PlusCircle, label: "Post Project", description: "Hire talent and start something new", href: "/client/post-project" },
  { icon: Search, label: "Find Freelancers", description: "Discover top-rated talent worldwide", href: "/client/freelancers" },
  { icon: Mail, label: "Messages", description: "Chat and collaborate with teams", href: "/client/messages", hasBadge: true },
];

const freelancerActions: ActionItem[] = [
  { icon: Briefcase, label: "Browse Projects", description: "Find the perfect project for your skills", href: "/freelancer/projects" },
  { icon: FileText, label: "My Applications", description: "Track your proposals and interviews", href: "/freelancer/applications" },
  { icon: Mail, label: "Messages", description: "Communicate with your clients", href: "/freelancer/messages", hasBadge: true },
];

const HomePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const unreadCount = useUnreadStore((s) => s.totalUnreadCount);
  const [showMenu, setShowMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme } = useThemeStore();
  const isDark = theme === "dark";
  const [statsCount, setStatsCount] = useState<number>(0);
  const [loadingStats, setLoadingStats] = useState(true);

  const isClient = user?.role === "client";
  const isFreelancer = user?.role === "freelancer";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        if (isClient) {
          const stats = await projectService.getMyClientStats();
          setStatsCount(stats.inProgress);
        } else if (isFreelancer) {
          const res = await applicationService.getMyApplications();
          setStatsCount(res.applications.length);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };
    if (user) fetchStats();
  }, [isClient, isFreelancer, user]);

  const userName = user?.fullName?.split(" ")[0] || user?.email?.split("@")[0] || "User";

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const actions = isClient ? clientActions : isFreelancer ? freelancerActions : [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background relative overflow-hidden font-sans transition-colors duration-300">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-primary/10 dark:bg-teal-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[30%] h-[50%] bg-royal-blue/10 dark:bg-royal-blue/15 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20200%20200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22noiseFilter%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.65%22%20numOctaves%3D%223%22%20stitchTiles%3D%22stitch%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23noiseFilter)%22%2F%3E%3C%2Fsvg%3E')] opacity-[0.03] dark:opacity-[0.05] pointer-events-none mix-blend-overlay"></div>

      {/* Header */}
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300 border-b border-transparent",
          isScrolled
            ? "bg-white/80 dark:bg-background/80 backdrop-blur-xl border-slate-200 dark:border-white/10 shadow-lg"
            : "bg-transparent py-2"
        )}
      >
        <div className="container max-w-5xl mx-auto flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate(-1)}
              className="hidden sm:flex p-2 -ml-2 rounded-xl bg-slate-200/50 dark:bg-white/5 hover:bg-slate-300/50 dark:hover:bg-white/10 transition-colors group mr-2"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-white/70 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
            </button>
            <Logo size="sm" isDark={isDark} />
          </div>

          <div className="relative flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:block">
              <ThemeToggle className="mr-2" />
            </div>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 sm:gap-3 p-1 rounded-full bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 dark:hover:border-white/10 transition-all shadow-sm group"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary to-teal-primary p-0.5 shadow-md active-scale">
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden border border-white/20">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || userName)}&background=0F172A&color=fff&font-size=0.33&bold=true`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <span className="text-slate-700 dark:text-white font-semibold text-sm hidden sm:block ml-1">{userName}</span>
              <ChevronDown className={cn("w-3 h-3 sm:w-4 sm:h-4 text-slate-500 dark:text-white/50 transition-transform duration-300 mr-2", showMenu && "rotate-180")} />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-3 w-64 bg-white dark:glass-card rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 shadow-xl border border-slate-200 dark:border-0 dark:border-white/10">
                <div className="px-5 py-4 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 backdrop-blur-md">
                  <p className="text-slate-900 dark:text-white font-semibold">{user?.fullName || userName}</p>
                  <p className="text-slate-500 dark:text-white/60 text-xs mt-0.5 truncate">{user?.email}</p>
                </div>
                <div className="p-2 space-y-1">
                  <div className="sm:hidden px-3 py-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors">
                    <span className="text-sm font-medium text-slate-700 dark:text-white/70">Theme</span>
                    <ThemeToggle />
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-3 py-2.5 text-left text-sm text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-400/10 rounded-xl flex items-center gap-3 transition-colors group"
                  >
                    <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-5xl mx-auto px-4 py-12 pb-24 relative z-10">
        {/* Welcome Hero */}
        <div className="flex flex-col md:flex-row gap-8 items-start justify-between mb-16">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-primary/10 border border-teal-primary/20 backdrop-blur-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-teal-light animate-pulse shadow-[0_0_8px_rgba(20,184,166,0.8)]" />
              <span className="text-teal-primary dark:text-teal-light text-xs font-semibold tracking-wide uppercase">
                {isClient ? "Client Portal" : "Freelancer Portal"}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight leading-tight">
              Welcome back,<br />
              <span className="text-gradient">{userName}</span>
            </h1>
            <p className="text-slate-600 dark:text-white/60 text-lg">
              {isClient
                ? "Here is what's happening with your projects today."
                : "Explore new opportunities and manage your ongoing work."}
            </p>
          </div>
          
          {/* Stats Snippet / Quick Insight */}
          <div className="bg-white dark:glass-card rounded-2xl p-6 w-full md:w-auto flex items-center gap-6 min-w-[280px] shadow-lg dark:shadow-none border border-slate-100 dark:border-white/10">
            <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-xl">
               {isClient ? <TrendingUp className="w-8 h-8 text-teal-primary dark:text-teal-light" /> : <Award className="w-8 h-8 text-teal-primary dark:text-teal-light" />}
            </div>
            <div>
               <p className="text-slate-500 dark:text-white/50 text-sm font-medium mb-1 uppercase tracking-wider">{isClient ? 'Active Projects' : 'Proposals sent'}</p>
               <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                 {loadingStats ? "..." : statsCount}
               </h3>
               {!loadingStats && (
                 <p className="text-teal-primary dark:text-teal-light text-xs font-medium mt-1">
                   {isClient ? "Manage ongoing work" : "Track your applications"}
                 </p>
               )}
            </div>
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {actions.map((action) => (
            <button
              key={action.href}
              onClick={() => navigate(action.href)}
              className="group relative flex flex-col items-start p-6 rounded-3xl bg-white dark:glass-card hover-glow text-left overflow-hidden transition-all duration-300 transform hover:-translate-y-1 shadow-md dark:shadow-none border border-slate-200 dark:border-white/10"
            >
              {/* Card gradient effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-teal-primary/0 to-teal-primary/0 group-hover:from-teal-primary/5 group-hover:to-transparent transition-all duration-500 rounded-3xl" />
              
              <div className="relative mb-5">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center group-hover:bg-primary/10 dark:group-hover:bg-primary/20 group-hover:border-primary/30 transition-all duration-300 shadow-sm dark:shadow-lg">
                  <action.icon className="w-6 h-6 text-slate-600 dark:text-white group-hover:text-primary dark:group-hover:text-teal-light transition-colors duration-300" />
                </div>
                {action.hasBadge && unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(239,68,68,0.5)] border-2 border-white dark:border-[#050B15]">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <h3 className="text-slate-900 dark:text-white font-semibold text-lg mb-2 group-hover:text-primary dark:group-hover:text-teal-light transition-colors">
                {action.label}
              </h3>
              <p className="text-slate-500 dark:text-white/50 text-sm leading-relaxed mb-4">
                {action.description}
              </p>
              
              <div className="mt-auto flex items-center text-sm font-medium text-slate-400 dark:text-white/40 group-hover:text-primary dark:group-hover:text-teal-light transition-colors">
                <span>View</span>
                <ArrowRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </div>
            </button>
          ))}
        </div>

        {/* Quick Link */}
        <div className="flex justify-center">
          <button
            onClick={() => navigate(isClient ? "/client/dashboard" : "/freelancer/dashboard")}
            className="group flex items-center gap-2 px-6 py-3 rounded-full bg-white dark:glass-card hover:bg-slate-50 dark:hover:bg-white/10 transition-all border border-slate-200 dark:border-white/10 hover:border-teal-primary/30 dark:hover:border-teal-primary/50 text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white font-medium shadow-sm dark:shadow-none"
          >
            Access Full Dashboard
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </main>

      {/* Backdrop */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/20 dark:bg-black/20 backdrop-blur-sm transition-opacity" 
          onClick={() => setShowMenu(false)} 
        />
      )}
    </div>
  );
};

export default HomePage;
