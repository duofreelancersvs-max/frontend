/**
 * Feature Gate Service (Frontend)
 *
 * Wraps the /api/v1/feature-gate/* endpoints exposed by the backend.
 * All UI components (TrialBanner, UsageIndicator, UpgradeModal, etc.)
 * route through this service to read context and usage.
 */
import { api } from "@/lib/api";
import type {
  FeatureFlag,
  PlanContext,
  UsageResponse,
  UsageSnapshot,
} from "@/types/feature-gate.types";

export const featureGateService = {
  /**
   * Public — used by the landing/pricing page. Safe to call without auth.
   * Cache result in module scope so we don't re-fetch on every render.
   */
  getFeatureFlags: () => api.get<FeatureFlag>("/feature-gate/feature-flags"),

  /** Authenticated freelancer endpoint. */
  getMyUsage: () => api.get<UsageResponse>("/feature-gate/usage"),

  /** Authenticated freelancer endpoint. Plan context only (no usage). */
  getMyContext: () => api.get<PlanContext>("/feature-gate/context"),
};

export default featureGateService;

/** Helper to derive a human-readable remaining count. */
export const describeRemaining = (usage: UsageSnapshot | undefined): string => {
  if (!usage) return "Loading…";
  if (usage.limit === -1) return "Unlimited";
  return `${Math.max(0, usage.remaining)} of ${usage.limit} left`;
};
