/**
 * UsageIndicator
 *
 * Compact visual gauge of "X of N applications used this month".
 * Designed to live at the top of FindWork and the Freelancer Dashboard.
 *
 *   - Shows a colour-coded progress bar (green > gold > red)
 *   - Renders nothing for unlimited (Pro) users
 *   - Includes a tooltip with the reset date
 *   - Click-through CTA when the user is at/over the cap
 */
import { useNavigate } from "react-router-dom";
import { TrendingUp, AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import { cn } from "@/lib/utils";

interface UsageIndicatorProps {
  className?: string;
  /** Hide the "Upgrade" CTA — useful when embedded inside a header. */
  hideCta?: boolean;
  /** Compact pill style for tight spaces. */
  compact?: boolean;
}

const UsageIndicator = ({
  className,
  hideCta = false,
  compact = false,
}: UsageIndicatorProps) => {
  const navigate = useNavigate();
  const { showUsageIndicator, usage, context } = useFeatureGate();

  if (!showUsageIndicator || !usage) return null;

  const unlimited = usage.limit === -1;
  if (unlimited) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-success-green/10 border border-success-green/30",
          className,
        )}
        role="status"
      >
        <Sparkles size={14} className="text-success-green" />
        <span className="text-xs font-medium text-success-green">Unlimited applications</span>
      </div>
    );
  }

  const used = usage.used;
  const limit = usage.limit;
  const remaining = Math.max(0, usage.remaining);
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const isAtCap = remaining === 0;
  const isWarning = !isAtCap && pct >= 80;

  const status = isAtCap ? "destructive" : isWarning ? "warning" : "success";
  const colorClasses = {
    destructive: {
      bar: "bg-red-500",
      text: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-950/20",
      border: "border-red-200 dark:border-red-900/40",
      icon: AlertTriangle,
    },
    warning: {
      bar: "bg-gold",
      text: "text-gold",
      bg: "bg-gold/10",
      border: "border-gold/30",
      icon: TrendingUp,
    },
    success: {
      bar: "bg-success-green",
      text: "text-success-green",
      bg: "bg-success-green/10",
      border: "border-success-green/30",
      icon: CheckCircle2,
    },
  }[status];

  const Icon = colorClasses.icon;
  const resetDate = new Date(usage.resetsAt);

  const body = (
    <div
      className={cn(
        compact ? "px-2.5 py-1.5" : "px-4 py-2.5",
        "flex items-center gap-3 rounded-xl border",
        colorClasses.bg,
        colorClasses.border,
        className,
      )}
      role="status"
      aria-label={`${used} of ${limit} applications used this month`}
    >
      <Icon size={compact ? 12 : 16} className={colorClasses.text} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className={cn(compact ? "text-[10px] font-medium" : "text-xs font-semibold", colorClasses.text)}>
            {isAtCap
              ? "Application limit reached"
              : `${remaining} of ${limit} application${limit === 1 ? "" : "s"} left`}
          </p>
          {!compact && (
            <p className="text-xxs text-slate-500 dark:text-slate-400">
              Plan: {context?.planName ?? "Free"}
            </p>
          )}
        </div>
        <div className="h-1.5 bg-white/50 dark:bg-white/10 rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", colorClasses.bar)}
            style={{ width: `${pct}%` }}
            aria-hidden
          />
        </div>
      </div>
      {!hideCta && isAtCap && (
        <Button
          size="sm"
          variant="default"
          onClick={() => navigate("/freelancer/subscription")}
          className="shrink-0"
        >
          Upgrade
        </Button>
      )}
    </div>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{body}</TooltipTrigger>
        <TooltipContent side="bottom">
          <p>
            Resets on{" "}
            <strong>
              {resetDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </strong>
          </p>
          {context?.inTrial && (
            <p className="text-gold mt-1">Counts toward your free trial</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default UsageIndicator;
