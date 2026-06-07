/**
 * Feature Gate Types (Frontend)
 *
 * Mirrors the backend PlanContext / UsageSnapshot / FeatureFlag shapes
 * defined in `backend/src/modules/feature-gate/featureGate.types.ts`
 * and `featureGate.service.ts`.
 */

export type PlanTier = 'free' | 'pro' | 'unknown';

export interface PlanContext {
  /** The resolved plan tier (free / pro / unknown). */
  tier: PlanTier;
  /** The plan name as stored in the DB. */
  planName: string;
  /** Application quota for the current month. -1 means unlimited. */
  maxApplications: number;
  /** Project quota for the current month. -1 means unlimited. */
  maxProjects: number;
  /** True if the user is in an active trial period. */
  inTrial: boolean;
  /** When the trial ends, if applicable. */
  trialEndsAt?: string;
  /** When the trial started, if applicable. */
  trialStartedAt?: string;
  /** Days of trial that were granted at registration. */
  trialDaysGranted: number;
  /** Whether the user has ever subscribed to a paid plan. */
  everSubscribed: boolean;
  /** Whether the user is a "founder" (registered before the launch date). */
  isFounder: boolean;
}

export interface UsageSnapshot {
  /** Whether the user is currently on the Free plan (i.e. has hard caps). */
  isLimited: boolean;
  /** Maximum applications allowed in the current period. -1 = unlimited. */
  limit: number;
  /** Applications already submitted in the current period. */
  used: number;
  /** Remaining applications in the current period. -1 = unlimited. */
  remaining: number;
  /** Period in YYYY-MM (UTC). */
  period: string;
  /** ISO timestamp of the next reset. */
  resetsAt: string;
}

export interface FeatureFlag {
  launchDate: string;
  founderTrialDays: number;
  newUserTrialDays: number;
  enablePlanGates: boolean;
  enableTrialBanner: boolean;
  enableUsageIndicator: boolean;
}

export interface UsageResponse {
  context: PlanContext;
  usage: UsageSnapshot;
}

/** Rich error meta attached to PlanLimit / Trial / Upgrade errors. */
export interface PlanErrorMeta {
  feature?: string;
  planName?: string;
  limit?: number;
  current?: number;
  resetsAt?: string;
  expiredAt?: string;
  trialDaysGranted?: number;
  suggestedPlan?: string;
}

export type PlanErrorCode =
  | 'PLAN_LIMIT_EXCEEDED'
  | 'TRIAL_EXPIRED'
  | 'FEATURE_NOT_AVAILABLE'
  | 'UPGRADE_REQUIRED';
