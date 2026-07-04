/**
 * Feature Gate Hooks (Frontend)
 *
 * Thin React Query wrappers around the /api/v1/feature-gate/* endpoints.
 * The `useFeatureGate` aggregator hook composes usage + context + flags
 * and exposes high-level selectors ("canApply", "remainingApplications",
 * "trialDaysRemaining", etc.) that UI components consume.
 */
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { featureGateService } from "@/services/feature-gate.service";
import type {
  FeatureFlag,
  PlanContext,
  UsageSnapshot,
} from "@/types/feature-gate.types";

/* ── Low-level queries ───────────────────────────────────────────── */

export const useFeatureFlags = () =>
  useQuery({
    queryKey: ["feature-gate", "flags"],
    queryFn: () => featureGateService.getFeatureFlags(),
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });

export const useMyUsage = (enabled = true) =>
  useQuery({
    queryKey: ["feature-gate", "usage"],
    queryFn: () => featureGateService.getMyUsage(),
    enabled,
    staleTime: 1000 * 60 * 1,
    refetchOnWindowFocus: true,
  });

export const useMyContext = (enabled = true) =>
  useQuery({
    queryKey: ["feature-gate", "context"],
    queryFn: () => featureGateService.getMyContext(),
    enabled,
    staleTime: 1000 * 60 * 5,
  });

/* ── Aggregator hook ─────────────────────────────────────────────── */

export interface UseFeatureGateResult {
  flags: FeatureFlag | undefined;
  context: PlanContext | undefined;
  usage: UsageSnapshot | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;

  // Derived helpers
  isLimited: boolean;
  remainingApplications: number; // -1 = unlimited
  canApply: boolean;
  inTrial: boolean;
  trialExpired: boolean;
  trialDaysRemaining: number;
  trialProgressPct: number; // 0..100
  showTrialBanner: boolean;
  showUsageIndicator: boolean;
  featureGatesEnabled: boolean;
}

export const useFeatureGate = (
  enabled = true,
): UseFeatureGateResult => {
  const flagsQ = useFeatureFlags();
  const usageQ = useMyUsage(enabled);
  const contextQ = useMyContext(enabled);

  return useMemo<UseFeatureGateResult>(() => {
    const flags = flagsQ.data;
    const context = contextQ.data ?? usageQ.data?.context;
    const usage = usageQ.data?.usage;

    const featureGatesEnabled = flags?.enablePlanGates ?? true;
    const isLimited = usage?.isLimited ?? true;
    const remaining = usage?.remaining ?? 0;
    const limit = usage?.limit ?? 0;
    const inTrial = !!context?.inTrial;

    let trialDaysRemaining = 0;
    let trialProgressPct = 0;
    if (context?.trialEndsAt) {
      const end = new Date(context.trialEndsAt).getTime();
      const start = context.trialStartedAt
        ? new Date(context.trialStartedAt).getTime()
        : end - (context.trialDaysGranted || 14) * 86_400_000;
      const now = Date.now();
      const totalMs = Math.max(1, end - start);
      const remainingMs = Math.max(0, end - now);
      trialDaysRemaining = Math.ceil(remainingMs / 86_400_000);
      
      const timeProgressPct = Math.min(
        100,
        Math.max(0, ((totalMs - remainingMs) / totalMs) * 100),
      );

      let appProgressPct = 0;
      if (isLimited && limit > 0) {
        const usedApps = Math.max(0, limit - remaining);
        appProgressPct = Math.min(100, Math.max(0, (usedApps / limit) * 100));
      }

      trialProgressPct = Math.max(timeProgressPct, appProgressPct);
    }

    const canApply = !featureGatesEnabled
      ? true
      : isLimited
        ? limit === -1
          ? true
          : remaining > 0
        : true;

    // Trial is "expired" (as opposed to never started) when the user
    // was granted any trial days, isn't currently in the trial window,
    // and has never paid. Pure derivation from the server payload — no
    // persisted boolean on the user document.
    const trialExpired =
      !!context &&
      !inTrial &&
      (context.trialDaysGranted ?? 0) > 0 &&
      !context.everSubscribed;

    return {
      flags,
      context,
      usage,
      isLoading: flagsQ.isLoading || usageQ.isLoading || contextQ.isLoading,
      isError: flagsQ.isError || usageQ.isError || contextQ.isError,
      refetch: () => {
        flagsQ.refetch();
        usageQ.refetch();
        contextQ.refetch();
      },
      isLimited,
      remainingApplications: limit === -1 ? -1 : Math.max(0, remaining),
      canApply,
      inTrial,
      trialExpired,
      trialDaysRemaining,
      trialProgressPct,
      showTrialBanner: (flags?.enableTrialBanner ?? true) && inTrial,
      showUsageIndicator: (flags?.enableUsageIndicator ?? true) && isLimited,
      featureGatesEnabled,
    };
  }, [flagsQ.data, flagsQ.isLoading, flagsQ.isError, usageQ.data, usageQ.isLoading, usageQ.isError, contextQ.data, contextQ.isLoading, contextQ.isError]);
};
