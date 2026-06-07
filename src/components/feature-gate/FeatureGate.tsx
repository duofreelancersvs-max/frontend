/**
 * FeatureGate
 *
 * Declarative gate wrapper. Use to hide/show entire UI sections based
 * on plan tier, trial state, or feature flag.
 *
 *   <FeatureGate when="canApply" fallback={<UpgradeBanner />}>
 *     <ApplicationForm />
 *   </FeatureGate>
 *
 *   <FeatureGate when={{ tier: ['pro'] }}>
 *     <AnalyticsTab />
 *   </FeatureGate>
 */
import type { ReactNode } from "react";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import type { PlanTier } from "@/types/feature-gate.types";

type GateCondition =
  | "canApply"
  | "inTrial"
  | "isLimited"
  | "unlimited"
  | { tier: PlanTier[] }
  | { minTier: PlanTier };

interface FeatureGateProps {
  when: GateCondition;
  children: ReactNode;
  fallback?: ReactNode;
}

const TIER_RANK: Record<PlanTier, number> = {
  free: 0,
  unknown: 0,
  pro: 1,
};

const evaluate = (
  condition: GateCondition,
  gate: ReturnType<typeof useFeatureGate>,
): boolean => {
  if (typeof condition === "string") {
    switch (condition) {
      case "canApply":
        return gate.canApply;
      case "inTrial":
        return gate.inTrial;
      case "isLimited":
        return gate.isLimited;
      case "unlimited":
        return !gate.isLimited;
    }
  }
  if ("tier" in condition) {
    return gate.context ? condition.tier.includes(gate.context.tier) : false;
  }
  if ("minTier" in condition) {
    if (!gate.context) return false;
    return TIER_RANK[gate.context.tier] >= TIER_RANK[condition.minTier];
  }
  return false;
};

const FeatureGate = ({ when, children, fallback = null }: FeatureGateProps) => {
  const gate = useFeatureGate();
  // If feature gates are disabled globally, render the children (kill-switch).
  if (!gate.featureGatesEnabled) return <>{children}</>;
  if (gate.isLoading) return null;
  if (gate.isError) return <>{fallback}</>;
  return evaluate(when, gate) ? <>{children}</> : <>{fallback}</>;
};

export default FeatureGate;
