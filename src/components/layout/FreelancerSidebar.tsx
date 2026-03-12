import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
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
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { freelancerService, subscriptionService } from "@/services";
import type { FreelancerProfile, Subscription } from "@/services";
import { useUnreadStore } from "@/stores/unread.store";
import Logo from "@/components/shared/Logo";

const sidebarNavItems = [
  {
    icon: Home,
    label: "Dashboard",
    href: "/freelancer/dashboard",
    badge: null,
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
    badge: null,
  },
  { icon: Mail, label: "Messages", href: "/freelancer/messages", id: "messages" },
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

export interface FreelancerSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const FreelancerSidebar = ({ isOpen, onClose }: FreelancerSidebarProps) => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const unreadCount = useUnreadStore((s) => s.totalUnreadCount);

  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        const [profileData, subData] = await Promise.allSettled([
          freelancerService.getMyProfile(),
          subscriptionService.getMySubscription(),
        ]);
        if (profileData.status === "fulfilled") setProfile(profileData.value);
        if (subData.status === "fulfilled") setSubscription(subData.value);
      } catch (error) {
        console.error("Error fetching sidebar data:", error);
      }
    };
    fetchSidebarData();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const profileCompletion = profile
    ? Math.round(
        (!!profile.title ? 10 : 0) +
          (!!profile.bio ? 10 : 0) +
          ((profile.portfolio?.length || 0) > 0 ? 15 : 0) +
          (!!profile.hourlyRate ? 15 : 0) +
          ((profile.skills?.length || 0) > 0 ? 15 : 0) +
          ((profile.workExperience?.length || 0) > 0 ? 15 : 0) +
          ((profile.education?.length || 0) > 0 ? 10 : 0) +
          (profile.availability ? 10 : 0),
      )
    : 0;

  const subscriptionPlan = subscription?.plan || "free";
  const freelancerName = user?.email?.split("@")[0] || "Freelancer";
  const avatarInitial = freelancerName.charAt(0).toUpperCase();

  return (
    <>
      {/* SIDEBAR */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 bg-navy transition-transform duration-300 lg:translate-x-0 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10 shrink-0">
          <Logo isDark withText size="sm" />
          <button
            onClick={onClose}
            className="lg:hidden ml-auto text-white/60 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto min-h-0">
          {sidebarNavItems.map((item) => {
            const isActive =
              location.pathname === item.href ||
              location.pathname.startsWith(item.href + "/");
            const itemBadge =
              item.id === "messages" && unreadCount > 0 ? unreadCount : null;

            return (
              <Link
                key={item.label}
                to={item.href}
                onClick={() => {
                  // Close sidebar on mobile after clicking a link
                  if (window.innerWidth < 1024) onClose();
                }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white",
                )}
              >
                <item.icon size={20} />
                <span className="flex-1">{item.label}</span>
                {itemBadge && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-teal text-white rounded-full">
                    {itemBadge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section (Fixed) */}
        <div className="shrink-0 pt-2 pb-4">
          {/* Profile Completeness Indicator */}
          <div className="px-4 py-2 border-t border-white/10">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-white/70">
                  Profile Complete
                </span>
                <span className="text-sm font-bold text-teal-light">
                  {profileCompletion}%
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal to-teal-light rounded-full transition-all"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
            </div>
          </div>

          {/* Subscription Badge */}
          <div className="px-4 pb-2">
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg",
                subscriptionPlan === "free"
                  ? "bg-slate-500/20"
                  : subscriptionPlan === "pro"
                    ? "bg-royal-blue/20"
                    : "bg-gold/20",
              )}
            >
              <Award
                size={16}
                className={cn(
                  subscriptionPlan === "free"
                    ? "text-slate-400"
                    : subscriptionPlan === "pro"
                      ? "text-royal-blue"
                      : "text-gold",
                )}
              />
              <span
                className={cn(
                  "text-xs font-semibold",
                  subscriptionPlan === "free"
                    ? "text-slate-400"
                    : subscriptionPlan === "pro"
                      ? "text-royal-blue"
                      : "text-gold",
                )}
              >
                {subscriptionPlan.charAt(0).toUpperCase() +
                  subscriptionPlan.slice(1)}{" "}
                Plan
              </span>
              {subscriptionPlan === "free" && (
                <Link
                  to="/freelancer/subscription"
                  className="ml-auto text-xs text-teal-light hover:underline"
                >
                  Upgrade
                </Link>
              )}
            </div>
          </div>

          {/* User Profile Card */}
          <div className="px-4 pt-2 border-t border-white/10">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-royal-blue to-teal flex items-center justify-center text-white font-bold text-sm shrink-0">
                {avatarInitial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {freelancerName}
                </p>
                <p className="text-xs text-white/50 truncate">Freelancer</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-white/50 hover:text-white transition-colors shrink-0"
                title="Log Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* SIDEBAR OVERLAY (Mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
};

export default FreelancerSidebar;
