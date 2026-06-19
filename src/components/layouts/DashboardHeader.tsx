import { useUnreadStore } from "@/stores/unread.store";
import { useAuth } from "@/hooks/useAuth";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, Menu, MessageSquare, Search, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import Logo from "@/components/shared/Logo";

function MobileUsagePill() {
  const { user } = useAuth();
  const { showUsageIndicator, usage, context } = useFeatureGate(
    user?.role === "freelancer",
  );

  if (user?.role !== "freelancer" || !showUsageIndicator || !usage) {
    return null;
  }

  const planLabel = (context?.planName || "Free").split(" ")[0];

  if (usage.limit === -1) {
    return (
      <Link
        to="/freelancer/subscription"
        className="lg:hidden inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-teal/10 text-teal border border-teal/30 shrink-0 min-h-[32px]"
        aria-label="Pro plan with unlimited applications"
      >
        {planLabel} ∞
      </Link>
    );
  }

  const remaining = Math.max(0, usage.remaining);

  return (
    <Link
      to="/freelancer/subscription"
      className="lg:hidden inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-secondary border border-border text-foreground shrink-0 min-h-[26px] sm:min-h-[32px]"
      aria-label={`${remaining} of ${usage.limit} applications remaining this month`}
    >
      <span className="truncate max-w-[70px] sm:max-w-none">{planLabel} {remaining}/{usage.limit}</span>
    </Link>
  );
}

interface DashboardHeaderProps {
  title: string;
  onMenuClick?: () => void;
  className?: string;
}

const SEARCH_LINKS: { label: string; href: (role: string) => string }[] = [
  { label: "Dashboard", href: (r) => `/${r}/dashboard` },
  { label: "Messages", href: (r) => `/${r}/messages` },
  { label: "Settings", href: (r) => `/${r}/settings` },
  { label: "My Profile", href: (r) => `/${r}/profile` },
  { label: "Find Freelancers", href: () => "/client/freelancers" },
  { label: "Post Project", href: () => "/client/post-project" },
  { label: "My Projects", href: () => "/client/projects" },
  { label: "Find Work", href: () => "/freelancer/find-work" },
  { label: "My Applications", href: () => "/freelancer/applications" },
  { label: "Reviews", href: (r) => `/${r}/reviews` },
];

const DashboardHeader: React.FC<React.PropsWithChildren<DashboardHeaderProps>> = ({
  title,
  onMenuClick,
  className,
  children,
}) => {
  const { user, logout } = useAuth();
  const { context, inTrial } = useFeatureGate(user?.role === "freelancer");
  const isPro = context?.tier === "pro";
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const totalUnreadCount = useUnreadStore((s) => s.totalUnreadCount);

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : (user?.email?.[0] || "U").toUpperCase();
  const role = user?.role === "freelancer" ? "freelancer" : "client";

  // Filter only links relevant to the current role
  const filteredLinks = SEARCH_LINKS.filter((l) => {
    const href = l.href(role);
    if (role === "client" && href.startsWith("/freelancer")) return false;
    if (role === "freelancer" && href.startsWith("/client")) return false;
    return true;
  });

  const searchResults = searchQuery.trim()
    ? filteredLinks.filter((l) =>
        l.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredLinks;

  const openSearch = () => {
    setIsSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const handleResultClick = (href: string) => {
    navigate(href);
    closeSearch();
  };

  // Close on Escape
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSearch();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <header
        className={cn(
          "h-14 md:h-16 lg:h-20 bg-background/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-3 sm:px-6 lg:px-8 sticky top-0 z-30 transition-all shadow-sm",
          className,
        )}
      >
        {/* Left Section — ProdMatch-style: hamburger + logo on mobile, title on desktop */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-xl transition-all shrink-0"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="lg:hidden shrink-0">
            <Logo size="sm" className="h-8 sm:h-10 w-auto" />
          </div>
          <h1 className="hidden lg:block text-xl font-heading font-semibold text-foreground tracking-tight truncate">
            {title}
          </h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          <MobileUsagePill />
          {children}

          <div className="flex items-center gap-1.5 mr-1 md:mr-2">
            <ThemeToggle className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl" />
          </div>

          <div className="flex items-center gap-0.5 sm:gap-1.5 px-1 sm:px-2 py-1 bg-secondary/50 dark:bg-secondary/20 rounded-2xl border border-border shrink-0">
            {/* Search */}
            <button
              onClick={openSearch}
              className="w-9 h-9 sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background rounded-lg transition-all shrink-0"
              title="Search (press /)"
            >
              <Search size={18} />
            </button>

            {/* Messages */}
            <Link to={`/${role}/messages`} className="relative w-9 h-9 sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background rounded-lg transition-all shrink-0" aria-label="Messages">
              <MessageSquare size={18} />

              {totalUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-primary text-primary-foreground text-xxs font-bold rounded-full border-2 border-background flex items-center justify-center">
                  {totalUnreadCount}
                </span>
              )}
            </Link>
          </div>

          <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={cn(
                "flex items-center gap-2 p-1 rounded-2xl transition-all border border-transparent min-h-[44px]",
                isProfileOpen
                  ? "bg-accent border-border"
                  : "hover:bg-accent hover:border-border"
              )}
              aria-label="Open profile menu"
              aria-expanded={isProfileOpen}
            >
              <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center overflow-hidden border border-border shadow-sm">
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
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-heading font-semibold text-foreground leading-none">
                    {user?.fullName || user?.email?.split("@")[0] || "Member"}
                  </p>
                  {isPro && !inTrial && (
                    <span
                      data-testid="pro-member-badge"
                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-700 text-[9px] font-bold uppercase tracking-wider"
                      title="Pro Member"
                    >
                      <Zap size={8} className="fill-teal-500 text-teal-500" />
                      Pro
                    </span>
                  )}
                  {inTrial && (
                    <span
                      data-testid="trial-member-badge"
                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-700 text-[9px] font-bold uppercase tracking-wider"
                      title="Free Trial"
                    >
                      <Zap size={8} className="fill-blue-500 text-blue-500" />
                      Free Trial
                    </span>
                  )}
                </div>
                <p className="text-xxs font-medium text-muted-foreground mt-1 uppercase tracking-wider">
                  {user?.role || "Member"} &bull; {context?.planName || "Free"}
                </p>
              </div>
              <ChevronDown
                size={14}
                className={cn(
                  "text-muted-foreground transition-transform duration-300 hidden md:block",
                  isProfileOpen && "rotate-180"
                )}
              />
            </button>

            {isProfileOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsProfileOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                  <div className="px-5 py-4 border-b border-border bg-muted/30">
                    <p className="text-sm font-bold text-foreground leading-none mb-1">
                      {user?.fullName || "Member"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <div className="p-2">
                    <Link
                      to={role === "freelancer" ? "/freelancer/profile" : "/client/profile"}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 text-sm rounded-xl hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      My Profile
                    </Link>
                    <Link
                      to={role === "freelancer" ? "/freelancer/settings" : "/client/settings"}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 text-sm rounded-xl hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      Settings
                    </Link>
                    <div className="h-px bg-border my-1.5 mx-2" />
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

      {/* Global Search Overlay */}
      {isSearchOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={closeSearch}
          />

          {/* Search Modal */}
          <div className="fixed top-[10%] left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <Search size={18} className="text-muted-foreground shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search pages..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
                <button
                  onClick={closeSearch}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Close search"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-72 overflow-y-auto py-2">
                {searchResults.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No results for "{searchQuery}"
                  </p>
                ) : (
                  searchResults.map((item) => {
                    const href = item.href(role);
                    return (
                      <button
                        key={href}
                        onClick={() => handleResultClick(href)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors text-left"
                      >
                        <Search size={14} className="text-muted-foreground shrink-0" />
                        {item.label}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Footer hint */}
              <div className="px-4 py-2 border-t border-border bg-muted/20 flex items-center gap-3 text-xs text-muted-foreground">
                <span><kbd className="font-mono bg-muted px-1.5 py-0.5 rounded text-xxs">↵</kbd> to select</span>
                <span><kbd className="font-mono bg-muted px-1.5 py-0.5 rounded text-xxs">Esc</kbd> to close</span>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default DashboardHeader;
