import { useRef, useState, useEffect } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { useNotificationStore } from "@/stores/notification.store";
import { useAuthStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  } = useNotificationStore();

  const toggleDropdown = () => setIsOpen(!isOpen);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener("mousedown", handleClickOutside);
    }
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleNotificationClick = (id: string, actionUrl?: string) => {
    markAsRead(id);
    if (actionUrl) {
      setIsOpen(false);
      navigate(actionUrl);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={toggleDropdown}
        className={cn(
          "relative w-9 h-9 sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background rounded-lg transition-all shrink-0",
          isOpen && "bg-background text-foreground",
        )}
        aria-label="Notifications"
      >
        <div className="relative flex items-center justify-center">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2.5 min-w-[18px] h-[18px] px-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full border-2 border-background flex items-center justify-center leading-none shadow-sm">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
            <h3 className="text-sm font-semibold text-foreground">
              Notifications
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-primary hover:text-primary/80 font-medium transition-colors flex items-center gap-1"
                >
                  <Check size={14} />
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-[350px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Bell
                    size={20}
                    className="text-muted-foreground opacity-50"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  You have no notifications.
                </p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {notifications.map((notif) => {
                  const content = (
                    <div
                      className={cn(
                        "flex gap-3 px-4 py-3 hover:bg-accent/50 transition-colors text-left",
                        !notif.isRead && "bg-primary/5",
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p
                            className={cn(
                              "text-sm font-medium leading-tight truncate",
                              !notif.isRead
                                ? "text-foreground"
                                : "text-muted-foreground",
                            )}
                          >
                            {notif.title}
                          </p>
                          <span className="text-xxs text-muted-foreground whitespace-nowrap shrink-0 mt-0.5">
                            {formatDistanceToNow(new Date(notif.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notif.message}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                      )}
                    </div>
                  );

                  let finalActionUrl = notif.data?.actionUrl;
                  if (
                    finalActionUrl &&
                    (finalActionUrl.startsWith("/messages") ||
                      finalActionUrl.startsWith("/reviews")) &&
                    user?.role
                  ) {
                    finalActionUrl = `/${user.role}${finalActionUrl}`;
                  }

                  return finalActionUrl ? (
                    <button
                      key={notif._id}
                      onClick={() =>
                        handleNotificationClick(notif._id, finalActionUrl)
                      }
                      className="w-full text-left"
                    >
                      {content}
                    </button>
                  ) : (
                    <button
                      key={notif._id}
                      onClick={() => handleNotificationClick(notif._id)}
                      className="w-full"
                    >
                      {content}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-border bg-muted/20 flex justify-center">
              <button
                onClick={clearNotifications}
                className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
              >
                <Trash2 size={12} />
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
