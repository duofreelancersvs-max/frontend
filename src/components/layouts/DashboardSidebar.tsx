import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  PieChart,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "@/components/shared/Logo";
import { UsageIndicator } from "@/components/feature-gate";

interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/freelancer/dashboard" },
  { label: "Find Work", icon: Briefcase, href: "/projects" },
  { label: "Messages", icon: MessageSquare, href: "/freelancer/messages" },
  { label: "Subscription", icon: PieChart, href: "/freelancer/subscription" },
  { label: "Profile", icon: Settings, href: "/freelancer/profile" },
];

const DashboardSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const role = user?.role || "freelancer";

  return (
    <aside
      className={cn(
        "bg-white dark:bg-[#050B15] h-[100dvh] fixed left-0 top-0 z-40 flex flex-col transition-all duration-300 ease-in-out border-r border-slate-100 dark:border-white/5",
        isCollapsed ? "w-20" : "w-[280px]",
      )}
    >
      {/* Logo Area */}
      <div className="h-20 flex items-center px-6 shrink-0">
        <Logo size="sm" withText={!isCollapsed} />
      </div>

      {/* User Profile Card */}
      <div className="px-4 mb-4 mt-2 shrink-0">
        <div
          className={cn(
            "bg-slate-50 dark:bg-white/5 rounded-3xl p-4 transition-all border border-slate-100 dark:border-white/5 group/profile relative",
            isCollapsed ? "p-2 items-center" : "",
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3",
              isCollapsed ? "flex-col" : "",
            )}
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal to-royal-blue p-0.5 shadow-lg shrink-0">
              <div className="w-full h-full rounded-[0.85rem] bg-white dark:bg-navy flex items-center justify-center overflow-hidden">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || "User")}&background=0D9488&color=fff`}
                  alt="User"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-navy dark:text-white truncate uppercase tracking-tight">
                  {user?.fullName?.split(" ")[0] || "User"}
                </p>
                <p className="text-xxs font-bold text-slate-400 uppercase tracking-widest">
                  {role}
                </p>
              </div>
            )}

            {!isCollapsed && (
              <button
                onClick={() => logout()}
                className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all border border-slate-100 dark:border-white/5 flex items-center justify-center shadow-sm"
                title="Log Out"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Usage Indicator */}
      <div
        className={cn(
          "px-4 mb-2 transition-all duration-300",
          isCollapsed ? "hidden" : "block",
        )}
      >
        <UsageIndicator compact={true} hideCta={true} className="w-full" />
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-2 overflow-y-auto no-scrollbar pb-6">
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.label}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative",
                  isActive
                    ? "bg-teal/10 text-teal shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-navy dark:hover:text-white",
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                    isActive
                      ? "bg-teal text-white shadow-lg shadow-teal/20"
                      : "bg-slate-50 dark:bg-white/5 text-slate-400 group-hover:bg-white dark:group-hover:bg-white/10 group-hover:text-teal",
                  )}
                >
                  <item.icon size={20} />
                </div>

                {!isCollapsed && (
                  <span className="font-bold text-sm tracking-tight">
                    {item.label}
                  </span>
                )}

                {isActive && !isCollapsed && (
                  <div className="absolute right-4 w-1.5 h-1.5 bg-teal rounded-full" />
                )}

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-4 px-3 py-2 bg-navy text-white text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 shadow-xl">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Usage Indicator */}
      <div className="p-4 mt-auto">
        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-4 top-24 bg-white dark:bg-navy text-navy dark:text-white border border-slate-100 dark:border-white/10 rounded-xl p-2 shadow-xl hover:bg-slate-50 dark:hover:bg-white/5 hover:scale-110 transition-all z-50 hidden md:flex"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
