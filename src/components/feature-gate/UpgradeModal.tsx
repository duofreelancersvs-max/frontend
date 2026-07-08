/**
 * UpgradeModal
 *
 * Shown when the freelancer tries to apply but the gate is closed
 * (limit reached or trial expired). Renders plan tiers with rich
 * metadata from the `meta` block returned by the backend.
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { publicService } from "@/services";
import { Crown, Check, X, Sparkles, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { PlanErrorMeta } from "@/types/feature-gate.types";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Reason for showing the modal. */
  reason: "limit" | "trial_expired" | "feature_locked";
  /** Rich metadata from the backend error. */
  meta?: PlanErrorMeta;
}


const UpgradeModal = ({ open, onOpenChange, reason, meta }: UpgradeModalProps) => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Array<{ name: string; price: string; features: string[]; highlight?: boolean }>>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);

  useEffect(() => {
    if (!open) return;
    const fetchPlans = async () => {
      try {
        const dbPlans = await publicService.getSubscriptionPlans();
        const monthlyPlans = dbPlans.filter(p => p.billingCycle === 'monthly').sort((a, b) => a.tier - b.tier);
        setPlans(monthlyPlans.map(dbPlan => ({
          name: dbPlan.name,
          price: dbPlan.price === 0 ? "₹0" : `₹${dbPlan.price}/mo`,
          features: dbPlan.features,
          highlight: dbPlan.tier === 1,
        })));
      } catch (err) {
        console.error("Failed to fetch plans", err);
      } finally {
        setIsLoadingPlans(false);
      }
    };
    fetchPlans();
  }, [open]);
  const title =
    reason === "limit"
      ? "You've hit your application limit"
      : reason === "trial_expired"
        ? "Your free trial has ended"
        : "This feature is not in your plan";

  const subtitle =
    reason === "limit"
      ? `You can apply to up to ${meta?.limit ?? 5} projects per month on the Free plan. Upgrade to Pro for unlimited applications.`
      : reason === "trial_expired"
        ? "Subscribe to Pro to keep applying to projects and unlock unlimited applications."
        : "Upgrade your plan to unlock this feature.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-gold to-teal text-white shrink-0">
              <Crown size={22} />
            </div>
            <div>
              <DialogTitle className="text-xl">{title}</DialogTitle>
              <DialogDescription className="mt-1">{subtitle}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {(meta?.expiredAt || meta?.resetsAt) && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-slate-300">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <div>
              {meta.resetsAt && (
                <p>
                  Your monthly limit resets on{" "}
                  <strong>
                    {new Date(meta.resetsAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </strong>
                  .
                </p>
              )}
              {meta.expiredAt && (
                <p>
                  Trial ended on{" "}
                  <strong>
                    {new Date(meta.expiredAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </strong>
                  .
                </p>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {isLoadingPlans ? (
            <div className="text-center py-4">Loading plans...</div>
          ) : plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-4 flex flex-col ${
                plan.highlight
                  ? "border-teal bg-teal/5 shadow-md"
                  : "border-slate-200 dark:border-white/10 bg-white dark:bg-white/5"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-teal text-white text-xxs font-bold uppercase tracking-wider inline-flex items-center gap-1">
                  <Sparkles size={10} /> Recommended
                </div>
              )}
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{plan.name}</p>
              <p className="text-2xl font-bold text-navy dark:text-white mt-1">{plan.price}</p>
              <ul className="mt-3 space-y-1.5 flex-1">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300"
                  >
                    <Check size={12} className="text-success-green mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                size="sm"
                variant={plan.highlight ? "teal" : "outline"}
                className="mt-4 w-full"
                onClick={() => {
                  onOpenChange(false);
                  navigate(`/freelancer/subscription?plan=${plan.name.toLowerCase()}`);
                }}
              >
                {plan.name === "Free" ? "Stay on Free" : `Choose ${plan.name}`}
              </Button>
            </div>
          ))}
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="sm:flex-1"
          >
            <X size={14} className="mr-1" /> Maybe later
          </Button>
          <Button
            variant="teal"
            onClick={() => {
              onOpenChange(false);
              navigate("/freelancer/subscription");
            }}
            className="sm:flex-1"
          >
            Compare all plans
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;
