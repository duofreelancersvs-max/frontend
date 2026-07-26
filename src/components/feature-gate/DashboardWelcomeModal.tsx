import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Target, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import { cn } from "@/lib/utils";

const SESSION_KEY = "dashboard_welcome_dismissed";

const DashboardWelcomeModal = () => {
  const navigate = useNavigate();
  const { isLoading, isLimited, remainingApplications, usage } =
    useFeatureGate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    // Pro / unlimited users — never show
    if (!isLimited || remainingApplications === -1) return;

    // Already dismissed this session
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "true") return;
    } catch {
      return;
    }

    setOpen(true);
  }, [isLoading, isLimited, remainingApplications]);

  const handleClose = () => {
    setOpen(false);
    try {
      sessionStorage.setItem(SESSION_KEY, "true");
    } catch {
      /* ignore */
    }
  };

  const handleViewPlans = () => {
    handleClose();
    navigate("/freelancer/subscription");
  };

  if (isLoading || !isLimited || remainingApplications === -1) return null;

  const limit = usage?.limit ?? 0;
  const used = usage?.used ?? 0;
  const remaining = Math.max(0, remainingApplications);
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;

  const isAtCap = remaining === 0;
  const isWarning = !isAtCap && remaining <= 1;

  const barColor = isAtCap
    ? "bg-red-500"
    : isWarning
      ? "bg-gold"
      : "bg-success-green";

  const resetsAt = usage?.resetsAt
    ? new Date(usage.resetsAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => (v ? setOpen(true) : handleClose())}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2 rounded-xl shrink-0",
                isAtCap ? "bg-red-500/10 text-red-500" : "bg-teal/10 text-teal",
              )}
            >
              <Target size={22} />
            </div>
            <div>
              <DialogTitle className="text-xl">Welcome back!</DialogTitle>
              <DialogDescription className="mt-1">
                Here's your monthly application usage.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Usage Card */}
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex items-end justify-between mb-2">
            <div>
              <p className="text-sm text-muted-foreground">Applications used</p>
              <p className="text-2xl font-bold text-foreground">
                {used}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  / {limit === -1 ? "∞" : limit}
                </span>
              </p>
            </div>
            <p
              className={cn(
                "text-sm font-medium",
                isAtCap
                  ? "text-red-500"
                  : isWarning
                    ? "text-gold"
                    : "text-success-green",
              )}
            >
              {isAtCap ? "Limit reached" : `${remaining} left`}
            </p>
          </div>
          <div className="h-2 bg-white/50 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", barColor)}
              style={{ width: `${pct}%` }}
            />
          </div>
          {resetsAt && (
            <p className="text-xs text-muted-foreground mt-2">
              Resets on {resetsAt}
            </p>
          )}
        </div>

        {/* Upgrade nudge */}
        {isAtCap || isWarning ? (
          <div className="rounded-xl border border-teal/20 bg-teal/5 p-3">
            <p className="text-sm text-foreground">
              {isAtCap
                ? "You've used all your applications this month."
                : "Running low on applications?"}{" "}
              <span className="text-muted-foreground">
                Upgrade to Pro for unlimited applications.
              </span>
            </p>
          </div>
        ) : null}

        <div className="flex flex-col-reverse sm:flex-row gap-2">
          <Button variant="ghost" onClick={handleClose} className="sm:flex-1">
            Maybe later
          </Button>
          <Button
            variant="teal"
            onClick={handleViewPlans}
            className="sm:flex-1"
          >
            <Sparkles size={14} className="mr-1" /> View Plans
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardWelcomeModal;
