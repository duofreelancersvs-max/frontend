import { useUnreadStore } from "@/stores/unread.store";
import { useAuth } from "@/hooks/useAuth";
import React from "react";
import { Link } from "react-router-dom";
import { Search, Bell, MessageSquare, Menu, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface DashboardHeaderProps {
  title: string;
  onMenuClick?: () => void;
  className?: string;
}

const DashboardHeader: React.FC<React.PropsWithChildren<DashboardHeaderProps>> = ({
  title,
  onMenuClick,
  className,
  children,
}) => {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const totalUnreadCount = useUnreadStore((s) => s.totalUnreadCount);

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : (user?.email?.[0] || "U").toUpperCase();
  const role = user?.role === 'freelancer' ? 'freelancer' : 'client';
  
  return (
    <header
      className={cn(
        "h-20 bg-background/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-6 lg:px-8 sticky top-0 z-30 transition-all shadow-sm",
        className,
      )}
    >
      {/* Left Section: Title Only */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Trigger */}
        <button
          onClick={onMenuClick}
          className="lg:hidden w-10 h-10 flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-xl transition-all"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-heading font-semibold text-foreground tracking-tight">
          {title}
        </h1>
      </div>

      {/* Right Section: Actions & Profile */}
      <div className="flex items-center gap-3">
        {children}

        <div className="hidden lg:flex items-center gap-1.5 mr-2">
           <ThemeToggle className="w-10 h-10 rounded-xl" />
        </div>

        <div className="flex items-center gap-1.5 px-2 py-1 bg-secondary/50 dark:bg-secondary/20 rounded-2xl border border-border">
          {/* Search */}
          <button className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background rounded-lg transition-all">
            <Search size={18} />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background rounded-lg transition-all">
              <Bell size={18} />
            </button>
            <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-background"></span>
          </div>

          {/* Messages */}
          <Link to={`/${role}/messages`} className="relative">
            <button className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background rounded-lg transition-all">
              <MessageSquare size={18} />
            </button>
            {totalUnreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full border-2 border-background flex items-center justify-center">
                {totalUnreadCount}
              </span>
            )}
          </Link>
        </div>

        <div className="h-6 w-[1px] bg-border mx-1 hidden sm:block"></div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={cn(
              "flex items-center gap-2 p-1 rounded-2xl transition-all border border-transparent",
              isProfileOpen ? "bg-accent border-border" : "hover:bg-accent hover:border-border"
            )}
          >
            <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center overflow-hidden border border-border shadow-sm ring-2 ring-background ring-offset-0 group-hover:scale-105 transition-transform">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.fullName || "User"} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-bold text-primary">{initials}</span>
                )}
            </div>
            <div className="hidden md:block text-left pr-1">
              <p className="text-[13px] font-heading font-semibold text-foreground leading-none">
                {user?.fullName?.split(' ')[0] || "User"}
              </p>
              <p className="text-[10px] font-medium text-muted-foreground mt-1 uppercase tracking-wider">{user?.role || 'Member'}</p>
            </div>
            <ChevronDown
              size={14}
              className={cn(
                "text-muted-foreground transition-transform duration-300 hidden md:block",
                isProfileOpen && "rotate-180"
              )}
            />
          </button>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsProfileOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                <div className="px-5 py-4 border-b border-border bg-muted/30">
                   <p className="text-sm font-bold text-foreground leading-none mb-1">{user?.fullName || "Member"}</p>
                   <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <div className="p-2">
                  <Link 
                    to={role === 'freelancer' ? "/freelancer/profile" : "/client/profile"} 
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm rounded-xl hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    My Profile
                  </Link>
                  <Link 
                    to={role === 'freelancer' ? "/freelancer/settings" : "/client/settings"} 
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm rounded-xl hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    Settings
                  </Link>
                  <div className="h-[1px] bg-border my-1.5 mx-2" />
                  <button 
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-destructive font-medium rounded-xl hover:bg-destructive/10 transition-colors text-left"
                  >
                    Log out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
