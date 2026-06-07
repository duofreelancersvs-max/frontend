import {
  Home,
  Folder,
  PlusCircle,
  Search,
  Mail,
  Star,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import {} from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useUnreadStore } from "@/stores/unread.store";
import Logo from "@/components/shared/Logo";

interface ClientSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const sidebarNavItems = [
  { icon: Home, label: "Dashboard", href: "/client/dashboard" },
  { icon: Folder, label: "My Projects", href: "/client/projects" },
  { icon: PlusCircle, label: "Post Project", href: "/client/post-project" },
  { icon: Search, label: "Find Freelancers", href: "/client/freelancers" },
  { icon: Mail, label: "Messages", href: "/client/messages", id: "messages" },
  { icon: Star, label: "Reviews", href: "/client/reviews" },
  { icon: Settings, label: "Settings", href: "/client/settings" },
];

const ClientSidebar = ({ isOpen, onClose }: ClientSidebarProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const unreadCount = useUnreadStore((s) => s.totalUnreadCount);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const clientName = user?.fullName || user?.email?.split("@")[0] || "Client";
  const clientInitial = (user?.fullName?.[0] || clientName[0]).toUpperCase();

  return (
    <>
      {/* SIDEBAR */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 bg-navy-dark border-r border-border transition-transform duration-300 lg:translate-x-0 lg:fixed flex-shrink-0 flex flex-col shadow-2xl",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 h-20 border-b border-border flex-shrink-0">
          <Logo isDark withText size="sm" />
          <button
            onClick={onClose}
            className="lg:hidden ml-auto text-muted-foreground hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {sidebarNavItems.map((item) => {
            const isActive = location.pathname === item.href;
            const itemBadge =
              item.id === "messages" && unreadCount > 0 ? unreadCount : null;

            return (
              <Link
                key={item.label}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-heading font-medium transition-all group",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-slate-400 hover:bg-white/5 hover:text-white",
                )}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
              >
                <item.icon size={20} className={cn(isActive ? "text-white" : "text-slate-500 group-hover:text-white transition-colors")} />
                <span className="flex-1">{item.label}</span>
                {itemBadge && (
                  <span className="px-2 py-0.5 text-xxs font-bold bg-primary-foreground text-primary rounded-full">
                    {itemBadge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Card */}
        <div className="p-4 border-t border-border flex-shrink-0">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-teal-primary flex items-center justify-center text-white font-heading font-bold text-sm shadow-lg">
              {clientInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-heading font-semibold text-white truncate">
                {clientName}
              </p>
              <p className="text-xxs font-medium text-slate-500 uppercase tracking-wider">Client Account</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-500 hover:text-destructive transition-colors p-1.5 hover:bg-destructive/10 rounded-lg active-scale"
              title="Log Out"
            >
              <LogOut size={18} />
            </button>
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

export default ClientSidebar;
