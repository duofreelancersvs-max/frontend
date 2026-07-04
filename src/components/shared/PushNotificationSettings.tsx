import { Bell, BellOff, Info, AlertTriangle } from "lucide-react";
import { useWebPush } from "@/hooks/useWebPush";
import { cn } from "@/lib/utils";

export const PushNotificationSettings = () => {
  const {
    isSupported,
    isSubscribed,
    permission,
    pushError,
    subscribe,
    unsubscribe,
  } = useWebPush();

  if (!isSupported) {
    return (
      <div className="p-4 rounded-xl border border-border bg-muted/30">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-foreground">
              Push Notifications Unavailable
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              Your browser does not support push notifications, or they are
              blocked.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleToggle = () => {
    // Fire and forget — state updates are optimistic inside the hook
    if (isSubscribed) {
      unsubscribe();
    } else {
      subscribe();
    }
  };

  return (
    <div className="space-y-3">
      <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-base font-semibold text-foreground flex items-center gap-2">
              {isSubscribed ? (
                <Bell size={18} className="text-primary" />
              ) : (
                <BellOff size={18} className="text-muted-foreground" />
              )}
              Browser Push Notifications
            </h4>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              Receive real-time alerts even when the app is closed.
              {permission === "denied" && (
                <span className="block text-destructive mt-1">
                  You have blocked notifications in your browser settings.
                  Please allow them to subscribe.
                </span>
              )}
            </p>
          </div>

          <button
            onClick={handleToggle}
            disabled={permission === "denied"}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
              isSubscribed ? "bg-primary" : "bg-muted",
            )}
            role="switch"
            aria-checked={isSubscribed}
          >
            <span className="sr-only">Toggle push notifications</span>
            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                isSubscribed ? "translate-x-5" : "translate-x-0",
              )}
            />
          </button>
        </div>
      </div>

      {pushError && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <span>{pushError}</span>
        </div>
      )}
    </div>
  );
};
