import { useState, useEffect } from "react";
import { LogOut, X, Download } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { usePwaStore } from "@/stores/pwa.store";
import InstallAppModal from "../modals/InstallAppModal";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useUnreadStore } from "@/stores/unread.store";
import Logo from "@/components/shared/Logo";
import { clientSidebarNavItems } from "@/config/navigation";

interface ClientSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

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

  // PWA Install Logic
  const { isAppInstalled } = usePwaStore();
  const [isIOS, setIsIOS] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  useEffect(() => {
    // Detect iOS Safari
    const ua = window.navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    const isStandalone = (window.navigator as any).standalone === true;

    if (isIOS && !isStandalone) {
      setIsIOS(true);
    }
  }, []);

  const handleInstall = () => {
    setIsInstallModalOpen(true);
  };

  const clientName = user?.fullName || user?.email?.split("@")[0] || "Client";
  const clientInitial = (user?.fullName?.[0] || clientName[0]).toUpperCase();

  return (
    <>
      {/* SIDEBAR */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-[100dvh] w-64 bg-navy-dark border-r border-border transition-transform duration-300 lg:translate-x-0 lg:fixed flex-shrink-0 flex flex-col shadow-2xl",
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

        {/* User Profile Card */}
        <div className="px-4 py-4 border-b border-border flex-shrink-0 bg-white/5">
          <div className="flex items-center gap-3 p-2 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-teal-primary flex items-center justify-center text-white font-heading font-bold text-sm shadow-lg">
              {clientInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-heading font-semibold text-white truncate">
                {clientName}
              </p>
              <p className="text-xxs font-medium text-slate-400 uppercase tracking-wider">
                Client Account
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-destructive transition-colors p-1.5 hover:bg-destructive/10 rounded-lg active-scale"
              title="Log Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto min-h-0 pb-6 pt-4">
          {/* Install App Button */}
          {!isAppInstalled && (
            <div className="px-4 pb-4 shrink-0 border-b border-border/50 mb-2">
              <button
                onClick={handleInstall}
                className="w-full flex flex-col items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-teal to-teal-dark hover:from-teal-light hover:to-teal transition-all shadow-lg active-scale group"
              >
                <div className="flex items-center gap-2 text-white">
                  <Download
                    size={16}
                    className="group-hover:-translate-y-0.5 transition-transform"
                  />
                  <span className="text-sm font-bold tracking-wide">
                    Install App
                  </span>
                </div>
              </button>
            </div>
          )}

          {/* Navigation */}
          <nav className="px-3 py-2 space-y-1">
            {clientSidebarNavItems.map((item) => {
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
                      : "text-white hover:bg-white/5 hover:text-white",
                  )}
                  onClick={() => onClose()}
                >
                  <item.icon
                    size={20}
                    className={cn(
                      isActive
                        ? "text-white"
                        : "text-white group-hover:text-white transition-colors",
                    )}
                  />
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
        </div>
      </aside>

      {/* SIDEBAR OVERLAY (Mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        isIOS={isIOS}
      />
    </>
  );
};

export default ClientSidebar;
