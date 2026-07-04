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
          "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 px-4 py-3",
          className,
        )}
      >
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/40 shrink-0">
            <Crown size={18} className="text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-red-900 dark:text-red-300">
              Your free trial has ended
            </p>
            <p className="text-xs text-red-700 dark:text-red-400/80 mt-0.5">
              Upgrade to Pro for unlimited applications. The Free plan allows up to 5 applications per month.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {onDismiss && (
            <button
              onClick={onDismiss}
              aria-label="Dismiss banner"
              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded transition-colors"
            >
              <X size={16} className="text-red-500" />
            </button>
          )}
          <Button
            size="sm"
            variant="destructive"
            onClick={() => navigate("/freelancer/subscription")}
          >
            Upgrade now
          </Button>
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
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border px-4 py-3",
        expiringSoon
          ? "border-gold/30 bg-gold/10"
          : "border-sky-blue/30 bg-sky-blue/10",
        className,
      )}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div
          className={cn(
            "p-1.5 rounded-lg shrink-0",
            expiringSoon ? "bg-gold/20" : "bg-sky-blue/20",
          )}
        >
          {expiringSoon ? (
            <Clock size={18} className="text-gold" />
          ) : (
            <Sparkles size={18} className="text-royal-blue" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-sm font-semibold",
              expiringSoon ? "text-gold" : "text-royal-blue",
            )}
          >
            {bannerText}
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-white/50 dark:bg-white/10 rounded-full overflow-hidden max-w-xs">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  expiringSoon ? "bg-gold" : "bg-royal-blue",
                )}
                style={{ width: `${Math.min(100, trialProgressPct)}%` }}
                aria-label={`${Math.round(trialProgressPct)}% of trial used`}
              />
            </div>
            <span
              className={cn(
                "text-xs font-medium shrink-0",
                expiringSoon ? "text-gold/80" : "text-royal-blue/80",
              )}
            >
              {timeExpired && usage && usage.limit > 0
                ? `${Math.round((usage.used / usage.limit) * 100)}% apps used`
                : `${Math.round(trialProgressPct)}% used`}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {onDismiss && (
          <button
            onClick={onDismiss}
            aria-label="Dismiss banner"
            className="p-1 hover:bg-white/30 dark:hover:bg-white/5 rounded transition-colors"
          >
            <X size={16} className="text-slate-500" />
          </button>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate("/freelancer/subscription")}
          className="border-current text-current hover:bg-white/30"
        >
          View plans
        </Button>
      </div>
    </div>
  );
};

export default TrialBanner;
