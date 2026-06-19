import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useUnreadStore } from "@/stores/unread.store";
import type { NavItem } from "@/config/navigation";

interface BottomNavProps {
  items: NavItem[];
  /** Hide when scrolling down (feed-style pages). */
  hidden?: boolean;
}

const BottomNav = ({ items, hidden = false }: BottomNavProps) => {
  const location = useLocation();
  const unreadCount = useUnreadStore((s) => s.totalUnreadCount);

  const isActive = (href: string) => {
    if (href.endsWith("/dashboard")) {
      return location.pathname === href;
    }
    return (
      location.pathname === href ||
      location.pathname.startsWith(`${href}/`)
    );
  };

  return (
    <nav
      className={cn(
        "fixed bottom-0 inset-x-0 z-40 md:hidden bg-background/95 backdrop-blur-xl border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom,0px)] transition-transform duration-300 ease-out",
        hidden && "translate-y-full pointer-events-none",
      )}
      aria-label="Mobile navigation"
      aria-hidden={hidden}
    >
      <div className="flex items-stretch justify-around h-16 px-2 sm:px-6 max-w-lg mx-auto">
        {items.map((item) => {
          const active = isActive(item.href);
          const badge =
            item.id === "messages" && unreadCount > 0 ? unreadCount : null;

          return (
            <Link
              key={item.href}
              to={item.href}
              aria-label={`${item.shortLabel || item.label}${badge !== null ? `, ${badge} unread` : ""}`}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 gap-1 min-w-0 min-h-[48px] px-1 py-1 group",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="relative flex items-center justify-center transition-transform duration-200 group-active:scale-95">
                <item.icon
                  size={24}
                  strokeWidth={active ? 2.5 : 2}
                  className={cn(
                    "transition-all duration-200",
                    active && "-translate-y-0.5",
                  )}
                />
                {badge !== null && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center border-2 border-background shadow-sm">
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </span>
              <span
                className={cn(
                  "text-[10px] leading-none font-medium truncate max-w-full transition-all duration-200",
                  active ? "font-semibold translate-y-0" : "opacity-80",
                )}
              >
                {item.shortLabel || item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
