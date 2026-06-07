/**
 * PlanLimitWarning
 *
 * Inline form-level warning rendered at the top of forms (e.g. the
 * ProjectApplicationModal) when the freelancer is at or near their
 * application limit. Closes the door politely *before* they fill the
 * form out, and offers an upgrade CTA inline.
 */
import { useNavigate } from "react-router-dom";
import { AlertCircle, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import { cn } from "@/lib/utils";

interface PlanLimitWarningProps {
  className?: string;
  /** When true, hides the upgrade CTA (e.g. for embed contexts). */
  hideCta?: boolean;
}

const PlanLimitWarning = ({ className, hideCta = false }: PlanLimitWarningProps) => {
  const navigate = useNavigate();
  const { showUsageIndicator, usage, featureGatesEnabled, context } = useFeatureGate();

  if (!featureGatesEnabled || !showUsageIndicator || !usage) return null;
  if (usage.limit === -1) return null;

  const used = usage.used;
  const limit = usage.limit;
  const remaining = Math.max(0, usage.remaining);
  const pct = limit > 0 ? (used / limit) * 100 : 0;
  const isAtCap = remaining === 0;
  const isWarning = !isAtCap && pct >= 80;

  if (!isAtCap && !isWarning) return null;

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border px-3 py-2.5",
        isAtCap
          ? "border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20"
          : "border-gold/30 bg-gold/10",
        className,
      )}
    >
      <div className="flex items-start gap-2.5 min-w-0">
        {isAtCap ? (
          <AlertCircle size={16} className="text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
        ) : (
          <TrendingUp size={16} className="text-gold mt-0.5 shrink-0" />
        )}
        <div className="min-w-0">
          <p
            className={cn(
              "text-xs font-semibold",
              isAtCap ? "text-red-700 dark:text-red-300" : "text-gold",
            )}
          >
            {isAtCap
              ? `You've used all ${limit} of your monthly application${limit === 1 ? "" : "s"}.`
              : `Only ${remaining} application${remaining === 1 ? "" : "s"} left this month.`}
          </p>
          <p
            className={cn(
              "text-xs mt-0.5",
              isAtCap
                ? "text-red-600/80 dark:text-red-400/80"
                : "text-gold/80",
            )}
          >
            {context?.inTrial
              ? "Pro features are unlocked during your trial."
              : "Upgrade to Pro for unlimited applications / month."}
          </p>
        </div>
      </div>
      {!hideCta && (
        <Button
          size="sm"
          variant={isAtCap ? "destructive" : "default"}
          onClick={() => navigate("/freelancer/subscription")}
          className="shrink-0"
        >
          <Sparkles size={14} className="mr-1" />
          Upgrade
        </Button>
      )}
    </div>
  );
};

export default PlanLimitWarning;
