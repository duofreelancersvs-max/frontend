import { useEffect, useState, useRef, useCallback, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth.store";
import axiosClient from "@/lib/axios-client";
import type { User } from "@/types/auth.types";

interface AuthInitializerProps {
  children: ReactNode;
}

/**
 * AuthInitializer
 *
 * Simple rule: Supabase is the source of truth.
 *  - Valid session       → sync with backend, allow access.
 *  - No / expired session → logout immediately, redirect to /login.
 *  - Network failure      → logout immediately, redirect to /login.
 */
export function AuthInitializer({ children }: AuthInitializerProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const { setAuth, setLoading, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const isOAuthCallbackRef = useRef(location.pathname === "/auth/callback");
  isOAuthCallbackRef.current = location.pathname === "/auth/callback";

  const syncInProgressRef = useRef(false);
  const initializedRef = useRef(false); // mirrors isInitialized for refs

  // ─── helpers ───────────────────────────────────────────────────────────────

  /** Unblock the loading spinner. Never touches auth state. */
  const unblock = useCallback(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    setLoading(false);
    setIsInitialized(true);
  }, [setLoading]);

  /** Hard logout → redirect to /login with "session expired" banner. */
  const forceLogout = useCallback(() => {
    logout();
    unblock();
    navigate("/login", { replace: true, state: { sessionExpired: true } });
  }, [logout, unblock, navigate]);

  // ─── backend sync ──────────────────────────────────────────────────────────

  const syncSessionWithBackend = async (
    accessToken: string,
    refreshToken: string,
  ): Promise<boolean> => {
    try {
      const { data } = await axiosClient.get<{ data: { user: User } }>(
        "/auth/me",
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      setAuth(data.data.user, { accessToken, refreshToken, expiresIn: 3600 });
      return true;
    } catch (error: any) {
      const status = error?.response?.status;
      if ((status === 401 || status === 404) && !isOAuthCallbackRef.current) {
        try { await supabase.auth.signOut(); } catch { /* ignore */ }
        logout();
      }
      return false;
    }
  };

  // ─── main effect ───────────────────────────────────────────────────────────

  useEffect(() => {
    setLoading(true);

    /**
     * Safety unblock — pure last resort.
     * Only releases the spinner; NEVER touches auth state or redirects.
     * If a sync is in-flight we skip it (the sync will call unblock itself).
     */
    const safetyTimer = setTimeout(() => {
      if (!initializedRef.current && !syncInProgressRef.current) {
        console.warn("[AuthInitializer] Timeout — unblocking spinner.");
        unblock();
      }
    }, 10_000);

    // ── auth state listener ──────────────────────────────────────────────────
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("[AuthInitializer] auth event:", event, session?.user?.email);

        // Let OAuthCallback page handle its own session setup
        if (isOAuthCallbackRef.current) {
          setIsInitialized(true);
          setLoading(false);
          return;
        }

        if (syncInProgressRef.current) return; // debounce concurrent events

        if (session?.user) {
          // ── Valid session ────────────────────────────────────────────────
          const { isAuthenticated } = useAuthStore.getState();

          // Already authenticated and nothing critical changed — skip re-sync
          if (isAuthenticated && initializedRef.current && event !== "TOKEN_REFRESHED") {
            unblock();
            return;
          }

          try {
            syncInProgressRef.current = true;
            const synced = await syncSessionWithBackend(
              session.access_token,
              session.refresh_token,
            );

            if (synced && !initializedRef.current) {
              // After first login, redirect away from auth pages
              const user = useAuthStore.getState().user;
              if (user && ["/login", "/register", "/forgot-password"].includes(location.pathname)) {
                navigate("/home");
              }
            }

            if (!synced && !useAuthStore.getState().isAuthenticated) {
              logout();
            }
          } catch (err) {
            console.error("[AuthInitializer] sync error:", err);
          } finally {
            syncInProgressRef.current = false;
          }

        } else {
          // ── No session / session gone ────────────────────────────────────
          // Supabase confirmed no valid session (expired, signed-out, refresh
          // failed, etc.).  If the store still thinks we're authenticated,
          // that's stale localStorage data — logout immediately.
          const { isAuthenticated } = useAuthStore.getState();
          if (event === "SIGNED_OUT" || isAuthenticated) {
            console.warn(
              `[AuthInitializer] No session (event: ${event}) — logging out.`
            );
            forceLogout();
            return;
          }
        }

        unblock();
      },
    );

    // ── check session on mount ───────────────────────────────────────────────
    (async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
          // Supabase has no valid session.
          // If the Zustand store thinks we're logged in (stale localStorage),
          // logout immediately so the user lands on /login cleanly.
          if (useAuthStore.getState().isAuthenticated) {
            console.warn(
              "[AuthInitializer] No Supabase session but store has auth — logging out."
            );
            forceLogout();
          } else {
            unblock();
          }
          return;
        }
        // Session exists → onAuthStateChange (INITIAL_SESSION) will fire next
        // and call unblock() after the backend sync completes.
      } catch (err) {
        // Network failure — Supabase is completely unreachable.
        console.error("[AuthInitializer] getSession() failed (network):", err);
        forceLogout();
      }
    })();

    return () => {
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── render ────────────────────────────────────────────────────────────────

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal" />
      </div>
    );
  }

  return <>{children}</>;
}
