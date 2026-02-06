import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  CreditCard,
  Wallet,
  Bell,
} from "lucide-react";

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: "amber" | "rose" | "indigo";
}

interface NavSection {
  title: string;
  items: NavItem[];
}

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
        badge: "1.2k",
        badgeColor: "indigo",
      },
      {
        name: "Verifications",
        path: "/admin/verifications",
        icon: ShieldCheck,
        badge: "15",
        badgeColor: "amber",
      },
      { name: "Subscriptions", path: "/admin/subscriptions", icon: CreditCard },
      { name: "Payments", path: "/admin/payments", icon: Wallet },
    ],
  },
  {
    title: "COMMUNICATION",
    items: [
      { name: "Notifications", path: "/admin/notifications", icon: Bell },
    ],
  },
];

const AdminSidebar = () => {
  const location = useLocation();

  return (
    <aside className="admin-sidebar">
      {/* Logo */}
      <div className="admin-sidebar-logo">
        <h1>
          <span className="logo-dot"></span>
          <span>ConnectMeIndia Admin</span>
        </h1>
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
                  {item.badge && (
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
