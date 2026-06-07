import { create } from "zustand";
import type { PlanErrorMeta } from "@/types/feature-gate.types";

export type UpgradeModalReason = "limit" | "trial_expired" | "feature_locked";

interface UpgradeModalState {
  isOpen: boolean;
  reason: UpgradeModalReason;
  meta?: PlanErrorMeta;
  /** Coalesce rapid-fire 402s so the modal doesn't queue. */
  lastOpenedAt: number;

  open: (reason: UpgradeModalReason, meta?: PlanErrorMeta) => void;
  close: () => void;
}

export const useUpgradeModalStore = create<UpgradeModalState>((set) => ({
  isOpen: false,
  reason: "feature_locked",
  meta: undefined,
  lastOpenedAt: 0,

  open: (reason, meta) =>
    set({
      isOpen: true,
      reason,
      meta,
      lastOpenedAt: Date.now(),
    }),

  close: () => set({ isOpen: false }),
}));
