import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "@/components/shared/Logo";
import { adminService } from "@/services";
import type { AdminStats } from "@/services/admin.service";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  CreditCard,
  Wallet,
  Bell,
  Briefcase,
  Star,
  FileText,
  MessageSquare,
  FolderTree,
  History,
  DollarSign,
} from "lucide-react";

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeColor?: "amber" | "rose" | "indigo";
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const AdminSidebar = () => {
  const location = useLocation();
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
          name: "Applications",
          path: "/admin/applications",
          icon: FileText,
        },
        {
          name: "Reviews",
          path: "/admin/reviews",
          icon: Star,
        },
        {
          name: "Verifications",
          path: "/admin/verifications",
          icon: ShieldCheck,
          badge: stats && stats.pendingVerifications > 0 ? stats.pendingVerifications : undefined,
          badgeColor: "amber",
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
      title: "SYSTEM",
      items: [
        { name: "Audit Logs", path: "/admin/audit-logs", icon: History },
      ],
    },
  ];

  return (
    <aside className="admin-sidebar">
      {/* Logo */}
      <div className="px-6 py-8 border-b border-white/5">
        <Logo isDark size="sm" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.title} className="admin-nav-section">
            <div className="admin-nav-header">{section.title}</div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`admin-nav-item ${isActive ? "active" : ""}`}
                >
                  <Icon className="nav-icon" />
                  <span>{item.name}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`admin-nav-badge ${item.badgeColor || ""}`}
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
      <div className="admin-profile-card">
        <div className="admin-profile-inner">
          <div className="admin-avatar">SA</div>
          <div className="admin-profile-info">
            <div className="admin-profile-name">Super Admin</div>
            <div className="admin-profile-status">
              <span className="status-dot"></span>
              <span>Online</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
