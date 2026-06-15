import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "@/components/shared/Logo";
import { adminService } from "@/services";
import type { AdminStats } from "@/services/admin.service";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Briefcase,
  Star,
  FileText,
  MessageSquare,
  FolderTree,
  History,
  LogOut,
  PlusCircle,
  Flag,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string; size?: number | string }>;
  badge?: string | number;
  badgeColor?: "amber" | "rose" | "indigo";
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const AdminSidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch sidebar stats:", error);
      }
    };
    fetchStats();
    // Refresh stats every 30 seconds for real-time feel
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const navSections: NavSection[] = [
    {
      title: "MAIN",
      items: [
        { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      title: "MANAGEMENT",
      items: [
        {
          name: "Users",
          path: "/admin/users",
          icon: Users,
          badge: stats ? stats.totalUsers : undefined,
          badgeColor: "indigo",
        },
        {
          name: "Projects",
          path: "/admin/projects",
          icon: Briefcase,
          badge: stats ? stats.totalProjects : undefined,
          badgeColor: "indigo",
        },
        {
          name: "Post Project",
          path: "/admin/post-project",
          icon: PlusCircle,
        },
        {
          name: "Applications",
          path: "/admin/applications",
          icon: FileText,
        },
        {
          name: "Reviews",
          path: "/admin/reviews",
          icon: Star,
        },

        { name: "Subscriptions", path: "/admin/subscriptions", icon: CreditCard },
      ],
    },
    {
      title: "MARKETPLACE",
      items: [
        { name: "Categories", path: "/admin/categories", icon: FolderTree },
      ],
    },
    {
      title: "COMMUNICATION",
      items: [
        { name: "Conversations", path: "/admin/conversations", icon: MessageSquare },
      ],
    },
    {
      title: "ADMIN PROJECTS",
      items: [
        { name: "My Projects", path: "/admin/my-projects", icon: Briefcase },
      ],
    },
    {
      title: "SYSTEM",
      items: [
        { name: "Reports", path: "/admin/reports", icon: Flag },
        { name: "Audit Logs", path: "/admin/audit-logs", icon: History },
      ],
    },
  ];

  return (
    <aside className="w-64 min-h-screen bg-[#18181b] border-r border-white/5 flex flex-col fixed left-0 top-0 bottom-0 z-50 transition-all duration-300">
      {/* Logo */}
      <div className="px-6 py-8 border-b border-white/5">
        <Logo isDark size="sm" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
        {navSections.map((section) => (
          <div key={section.title} className="flex flex-col gap-1">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-widest px-4 mb-2">
              {section.title}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group",
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                      : "text-white hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon 
                    size={20} 
                    className={cn(
                      isActive
                        ? "text-white"
                        : "text-white group-hover:text-white transition-colors"
                    )} 
                  />
                  <span>{item.name}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`ml-auto px-2 py-0.5 rounded-full text-xxs font-bold tracking-wide ${
                        item.badgeColor === "indigo"
                          ? "bg-indigo-500/20 text-indigo-400"
                          : item.badgeColor === "rose"
                          ? "bg-rose-500/20 text-rose-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Admin Profile */}
      <div className="p-4 border-t border-white/5 bg-[#18181b]/50">
        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 transition-all">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20 ring-1 ring-white/10">
            SA
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-semibold truncate">Super Admin</div>
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Online</span>
            </div>
          </div>
          <button
            onClick={() => logout()}
            title="Logout"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all flex-shrink-0"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
