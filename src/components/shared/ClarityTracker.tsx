import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Clarity from "@microsoft/clarity";
import { useAuthStore } from "@/stores/auth.store";

const CLARITY_PROJECT_ID = import.meta.env.VITE_CLARITY_PROJECT_ID;

let clarityInitialized = false;

/**
 * Initialize Microsoft Clarity once on app load.
 * Tracks session recordings, heatmaps, rage clicks, and JS errors.
 *
 * Must be rendered inside AuthInitializer so auth state is available
 * for Clarity.identify().
 */
export function ClarityTracker() {
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);
  const { user, isAuthenticated } = useAuthStore();

  // ── Initialize once ────────────────────────────────────────────────────
  useEffect(() => {
    if (!CLARITY_PROJECT_ID || clarityInitialized) return;
    Clarity.init(CLARITY_PROJECT_ID);
    clarityInitialized = true;

    // Tag session with platform info
    Clarity.setTag("platform", "web");
  }, []);

  // ── Identify authenticated users ───────────────────────────────────────
  useEffect(() => {
    if (!clarityInitialized) return;

    if (isAuthenticated && user) {
      Clarity.identify(user._id, undefined, undefined, user.fullName || user.email);
      Clarity.setTag("role", user.role);
    }
  }, [isAuthenticated, user]);

  // ── Track route changes ────────────────────────────────────────────────
  useEffect(() => {
    if (!clarityInitialized) return;

    // Only fire when the pathname actually changes (not on search/hash alone)
    if (location.pathname !== prevPathRef.current) {
      prevPathRef.current = location.pathname;
      Clarity.setTag("page", location.pathname);
    }
  }, [location.pathname, location.search]);

  return null;
}
