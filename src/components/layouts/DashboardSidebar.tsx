import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  PieChart,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "@/components/shared/Logo";

interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/freelancer/dashboard" },
  { label: "Browse Projects", icon: Briefcase, href: "/projects" },
  { label: "Messages", icon: MessageSquare, href: "/freelancer/messages" },
  { label: "Earnings", icon: Wallet, href: "/freelancer/earnings" },
  { label: "Subscription", icon: PieChart, href: "/freelancer/subscription" },
  { label: "Profile", icon: Settings, href: "/freelancer/profile" },
];

const DashboardSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        "bg-navy h-screen fixed left-0 top-0 z-40 flex flex-col transition-all duration-300 ease-in-out text-white",
        isCollapsed ? "w-20" : "w-[250px]",
      )}
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-navy-light/30">
        <Logo isDark size="sm" withText={!isCollapsed} />
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 overflow-y-auto custom-scrollbar">
        <nav className="flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.label}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative",
                  isActive
                    ? "bg-teal text-white shadow-lg shadow-teal/20"
                    : "text-slate-300 hover:bg-navy-light hover:text-white",
                )}
              >
                <item.icon
                  size={20}
                  className={cn(
                    "shrink-0",
                    isActive
                      ? "text-white"
                      : "text-slate-400 group-hover:text-white",
                  )}
                />
                {!isCollapsed && (
                  <span className="font-medium truncate">{item.label}</span>
                )}

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Profile & Collapse */}
      <div className="p-4 border-t border-navy-light/30 bg-navy-light/10">
        <div
          className={cn(
            "flex items-center gap-3",
            isCollapsed ? "justify-center" : "",
          )}
        >
          {/* Profile placeholder */}
          <div className="w-10 h-10 rounded-full bg-slate-600 shrink-0 border-2 border-slate-500 overflow-hidden">
            {/* Replace with actual user image */}
            <img
              src="https://ui-avatars.com/api/?name=User+Name&background=0D9488&color=fff"
              alt="User"
            />
          </div>

          {!isCollapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold truncate">Alex Johnson</p>
              <p className="text-xs text-slate-400 truncate">Freelancer</p>
            </div>
          )}

          {!isCollapsed && (
            <button className="text-slate-400 hover:text-white transition-colors">
              <LogOut size={18} />
            </button>
          )}
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 bg-white text-navy border border-slate-200 rounded-full p-1 shadow-md hover:bg-slate-50 transition-colors z-50 hidden md:flex"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
