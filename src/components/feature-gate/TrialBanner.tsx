/**
 * TrialBanner
 *
 * Surfaces the trial countdown prominently above the fold of the
 * freelancer dashboard. Three visual states:
 *   1. Active trial with plenty of time (info / sky)
 *   2. Trial ending within 48h        (warning / gold)
 *   3. Trial already expired          (destructive / red)
 *
 * The `expired` derivation lives in `useFeatureGate` (no persisted
 * boolean — the trial is over iff the user was granted any days and
 * `trialEndDate <= now` and they haven't paid).
 */
import { useNavigate } from "react-router-dom";
import { Sparkles, Clock, Crown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import { cn } from "@/lib/utils";

interface TrialBannerProps {
  onDismiss?: () => void;
  className?: string;
}

const TrialBanner = ({ onDismiss, className }: TrialBannerProps) => {
  const navigate = useNavigate();
  const {
    showTrialBanner,
    inTrial,
    trialExpired,
    trialDaysRemaining,
    trialProgressPct,
    usage,
  } = useFeatureGate();

  if (!showTrialBanner && !trialExpired) return null;

  const appsRunningOut = !!(usage && usage.limit > 0 && usage.remaining <= 5);
  const expiringSoon = inTrial && (trialDaysRemaining <= 2 || appsRunningOut);
  const expired = trialExpired;

  let bannerText = "You're on a Pro-tier free trial";
  const timeExpired = trialDaysRemaining === 0;

  if (timeExpired) {
    bannerText = `Trial time expired. You have ${usage?.remaining ?? 0} application${usage?.remaining === 1 ? "" : "s"} left`;
  } else if (expiringSoon) {
    if (appsRunningOut && trialDaysRemaining > 2) {
      bannerText = `Only ${usage!.remaining} application${usage!.remaining === 1 ? "" : "s"} left in trial`;
    } else {
      bannerText = `Trial ends in ${trialDaysRemaining} day${trialDaysRemaining === 1 ? "" : "s"} (${usage?.remaining ?? 0} apps left)`;
    }
  }

  if (expired) {
    return (
      <div
        role="alert"
        aria-live="polite"
        className={cn(
          "relative flex items-center justify-between gap-2 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 py-2.5 pl-3 pr-8 sm:pr-4",
          className,
        )}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <Crown className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold text-red-900 dark:text-red-300 truncate">
            Trial time expired. {usage?.remaining ?? 0} applications left.
          </span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <Button
            size="sm"
            variant="destructive"
            onClick={() => navigate("/freelancer/subscription")}
            className="h-7 px-3 text-xs whitespace-nowrap"
          >
            Upgrade
          </Button>
          {onDismiss && (
            <button
              onClick={onDismiss}
              aria-label="Dismiss banner"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 sm:static sm:translate-y-0 p-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded transition-colors"
            >
              <X className="w-4 h-4 text-red-500" />
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!inTrial) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "relative flex items-center justify-between gap-2 rounded-xl border py-2.5 pl-3 pr-8 sm:pr-4",
        expiringSoon
          ? "border-gold/30 bg-gold/10"
          : "border-sky-blue/30 bg-sky-blue/10",
        className,
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5 overflow-hidden flex-1">
        <div className="flex items-center gap-2.5">
          {expiringSoon ? (
            <Clock className="w-4 h-4 text-gold shrink-0" />
          ) : (
            <Sparkles className="w-4 h-4 text-royal-blue shrink-0" />
          )}
          <span
            className={cn(
              "text-xs sm:text-sm font-semibold truncate",
              expiringSoon ? "text-gold" : "text-royal-blue",
            )}
          >
            {bannerText}
          </span>
        </div>
        
        <div className="hidden sm:flex items-center gap-2 w-full sm:w-auto max-w-[150px]">
          <div className="flex-1 h-1.5 bg-white/50 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full",
                expiringSoon ? "bg-gold" : "bg-royal-blue",
              )}
              style={{ width: `${Math.min(100, trialProgressPct)}%` }}
            />
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate("/freelancer/subscription")}
          className="h-7 px-3 text-xs whitespace-nowrap border-current text-current hover:bg-white/30"
        >
          View plans
        </Button>
        {onDismiss && (
          <button
            onClick={onDismiss}
            aria-label="Dismiss banner"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 sm:static sm:translate-y-0 p-1 hover:bg-white/30 dark:hover:bg-white/5 rounded transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        )}
      </div>
    </div>
  );
};

export default TrialBanner;
