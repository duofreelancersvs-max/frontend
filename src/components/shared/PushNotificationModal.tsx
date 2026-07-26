import { useState, useEffect } from "react";
import { BellRing, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWebPush } from "@/hooks/useWebPush";
import { useAuthStore } from "@/stores/auth.store";

import { toast } from "@/components/ui/use-toast";

export const PushNotificationModal = () => {
  const { isSupported, isSubscribed, permission, subscribe } = useWebPush();
  const { user } = useAuthStore();
  const [dismissed, setDismissed] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    if (!user) {
      setDismissed(true);
      return;
    }

    const checkDismissedState = () => {
      try {
        const isDismissed = sessionStorage.getItem("pushBannerDismissed") === "true";

        // Show modal if supported, not subscribed, permission is default, and not dismissed
        if (
          isSupported &&
          !isSubscribed &&
          permission === "default" &&
          !isDismissed
        ) {
          setDismissed(false);
        } else {
          setDismissed(true);
        }
      } catch (error) {
        // Fallback to hiding if session storage fails
        setDismissed(true);
      }
    };

    if (isSupported && !isSubscribed && permission === "default") {
      checkDismissedState();
    } else {
      setDismissed(true);
    }
  }, [isSupported, isSubscribed, permission, user]);

  const handleEnable = async () => {
    setIsSubscribing(true);
    try {
      const success = await subscribe();
      if (success) {
        toast({
          title: "Notifications Enabled!",
          description:
            "You will now receive alerts even when the app is closed.",
        });
        setDismissed(true);
      } else {
        toast({
          title: "Setup Incomplete",
          description:
            "We couldn't enable push notifications. Check your browser settings.",
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
      setDismissed(true);
      try {
        sessionStorage.setItem("pushBannerDismissed", "true");
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem("pushBannerDismissed", "true");
    } catch (error) {
      console.error("Failed to update session storage", error);
    }
  };

  // Don't render if dismissed, subscribed, unsupported, or if permission is already granted/denied
  if (dismissed || isSubscribed || !isSupported || permission !== "default") return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="relative p-8 text-center flex flex-col items-center">
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground bg-muted hover:bg-accent rounded-full p-1.5 transition-colors"
          >
            <X size={16} />
          </button>

          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 ring-8 ring-primary/5">
            <BellRing className="w-8 h-8 text-primary" />
          </div>

          <h2 className="text-xl font-bold text-foreground mb-3 tracking-tight">
            Enable Notifications
          </h2>
          <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
            Get instant alerts for new messages, project updates, and important
            announcements.
          </p>

          <div className="w-full flex flex-col gap-3">
            <Button
              onClick={handleEnable}
              disabled={isSubscribing}
              variant="default"
              className="w-full rounded-xl h-11 font-medium"
            >
              {isSubscribing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Allow Notifications"
              )}
            </Button>
            <Button
              onClick={handleDismiss}
              variant="ghost"
              className="w-full rounded-xl h-11 font-medium"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
