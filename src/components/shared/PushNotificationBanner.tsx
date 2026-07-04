import { useState, useEffect } from "react";
import { BellRing, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWebPush } from "@/hooks/useWebPush";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { settingsService } from "@/services/settings.service";

export const PushNotificationBanner = ({ className }: { className?: string }) => {
  const { isSupported, isSubscribed, permission, subscribe } = useWebPush();
  const [dismissed, setDismissed] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    // Check backend settings for dismissed state
    const checkDismissedState = async () => {
      try {
        const settings = await settingsService.getSettings();
        const isDismissed = settings?.notifications?.pushBannerDismissed === true;
        
        if (isSupported && !isSubscribed && permission !== "denied" && !isDismissed) {
          setDismissed(false);
        } else {
          setDismissed(true);
        }
      } catch (error) {
        // Fallback to hiding if settings fetch fails
        setDismissed(true);
      }
    };
    
    if (isSupported && !isSubscribed && permission !== "denied") {
      checkDismissedState();
    } else {
      setDismissed(true);
    }
  }, [isSupported, isSubscribed, permission]);

  const handleDismiss = async () => {
    setDismissed(true);
    try {
      await settingsService.updateSettings({
        notifications: {
          pushBannerDismissed: true,
        },
      } as any);
    } catch (error) {
      console.error("Failed to dismiss banner", error);
    }
  };

  const handleEnable = async () => {
    setIsSubscribing(true);
    try {
      const success = await subscribe();
      if (success) {
        toast({
          title: "Notifications Enabled!",
          description: "You will now receive alerts even when the app is closed.",
        });
      } else {
        toast({
          title: "Setup Incomplete",
          description: "We couldn't enable push notifications. Check your browser settings.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  // Don't render if dismissed, subscribed, or unsupported
  if (dismissed || isSubscribed || !isSupported) return null;

  return (
    <div
      className={cn(
        "relative flex items-center justify-between gap-2 rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/10 py-2.5 pl-3 pr-8 sm:pr-4",
        className
      )}
    >
      <div className="flex items-center gap-2.5 overflow-hidden">
        <BellRing className="w-4 h-4 text-primary shrink-0" />
        <span className="text-xs sm:text-sm font-medium text-foreground truncate">
          Get instantly notified of new messages & updates
        </span>
      </div>
      
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <Button 
          onClick={handleEnable} 
          disabled={isSubscribing}
          size="sm"
          className="h-7 px-3 text-xs whitespace-nowrap"
        >
          {isSubscribing ? (
            <>
              <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
              Wait...
            </>
          ) : (
            "Turn On"
          )}
        </Button>

        <button
          onClick={handleDismiss}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 sm:static sm:translate-y-0 p-1 text-muted-foreground hover:text-foreground hover:bg-background/50 rounded-md transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
