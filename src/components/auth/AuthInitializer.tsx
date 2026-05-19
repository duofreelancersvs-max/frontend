import { useEffect, useState, useRef, useCallback, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth.store";
import axiosClient from "@/lib/axios-client";
import type { User } from "@/types/auth.types";

/**
 * Max ms we wait for Supabase to respond before unblocking the UI.
 * If Supabase is reachable but slow we just unblock — we do NOT touch
 * auth state here.  Only a true network failure in checkSession() clears
 * auth and redirects.
 */
const AUTH_INIT_TIMEOUT_MS = 8000;

interface AuthInitializerProps {
  children: ReactNode;
}

/**
 * AuthInitializer
 *
 * Responsible for:
 * 1. Listening to Supabase auth state changes on app mount
 * 2. Syncing Supabase session state into Zustand (the single source of truth)
 *
 * This is NOT a Context provider — it only initializes and syncs auth state.
 * All components read auth state directly from `useAuthStore`.
 */
export function AuthInitializer({ children }: AuthInitializerProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const { setAuth, setLoading, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const isOAuthCallback = location.pathname === "/auth/callback";
  const isOAuthCallbackRef = useRef(isOAuthCallback);
  isOAuthCallbackRef.current = isOAuthCallback;

  // Guards against double-firing between the timer and the normal auth flow
  const resolvedRef = useRef(false);
  // Promoted to a ref so the timer callback can read the live value
  const syncInProgressRef = useRef(false);

  /**
   * Unblock the loading spinner.
   * - Called by the normal auth flow once Supabase responds
   * - Also called by the safety timer as a last-resort unblock
   * NOTE: This NEVER touches auth state or redirects — those only happen
   *       in the explicit error paths (checkSession catch, axios interceptor).
   */
  const markResolved = useCallback(
    () => {
      if (resolvedRef.current) return;
      resolvedRef.current = true;
      setLoading(false);
      setIsInitialized(true);
    },
    [setLoading],
  );

  // Sync Supabase session with backend and Zustand store
  const syncSessionWithBackend = async (
    accessToken: string,
    refreshToken: string,
  ) => {
    try {
      const { data } = await axiosClient.get<{ data: { user: User } }>(
        "/auth/me",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      setAuth(data.data.user, {
        accessToken,
        refreshToken,
        expiresIn: 3600,
      });
      return true;
    } catch (error: any) {
      // If user exists in Supabase but not in MongoDB (manual deletion, etc.),
      // clean up the stale Supabase session so the user can re-register
      const status = error?.response?.status;
      if (status === 401 || status === 404) {
        if (isOAuthCallbackRef.current) {
          return false;
        }
        try {
          await supabase.auth.signOut();
        } catch {
          // Ignore sign-out errors
        }
        logout();
      }
      return false;
    }
  };

  // Supabase auth state listener
  useEffect(() => {
    setLoading(true);

    /**
     * Safety timeout — last-resort unblock if Supabase takes too long.
     *
     * IMPORTANT: This ONLY unblocks the spinner.  It does NOT clear auth state
     * or redirect to /login.  Reasons:
     *   1. Zustand persists isAuthenticated:true from the previous session, so
     *      reading it here would give a false positive even mid-sync.
     *   2. If a sync is in progress (syncInProgressRef.current === true) we must
     *      not interfere — the sync will call markResolved() when done.
     *   3. Actual session expiry / network failure is handled by checkSession()'s
     *      catch block and the axios interceptor — not here.
     */
    const safetyTimer = setTimeout(() => {
      if (resolvedRef.current) return;
      if (syncInProgressRef.current) {
        // Sync is running but taking longer than the timeout — extend patience
        // rather than forcing a logout.  The sync will call markResolved() itself.
        console.warn(
          "[AuthInitializer] Safety timeout hit while sync is in progress — waiting for sync to finish.",
        );
        return;
      }
      console.warn(
        "[AuthInitializer] Supabase did not respond within timeout. Unblocking UI.",
      );
      // Only unblock — do NOT clear auth or redirect
      markResolved();
    }, AUTH_INIT_TIMEOUT_MS);

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(
        "[AuthInitializer] Auth state change:",
        event,
        session?.user?.email,
      );
      
      const { isAuthenticated: storeAuthenticated } =
        useAuthStore.getState();

      // IMPORTANT: Prevent race conditions during login/sync
      if (syncInProgressRef.current) {
          console.log("[AuthInitializer] Sync already in progress, skipping");
          return;
      }

      // If we're on the OAuth callback page, let the specific page component
      // handle the sync so we can properly manage roles and avoid double-syncing.
      if (isOAuthCallbackRef.current) {
          console.log("[AuthInitializer] OAuth callback pending, skipping global sync to let the specialized page handle it.");
          setIsInitialized(true);
          setLoading(false);
          return;
      }

      if (session?.user) {
        // If we're already authenticated and nothing critical changed, don't re-sync
        if (storeAuthenticated && isInitialized && event !== 'TOKEN_REFRESHED') {
          console.log("[AuthInitializer] Already authenticated, skipping re-sync");
          setLoading(false);
          markResolved();
          return;
        }

        try {
          syncInProgressRef.current = true;
          console.log("[AuthInitializer] Syncing session with backend...");
          const synced = await syncSessionWithBackend(
            session.access_token,
            session.refresh_token,
          );

          if (!synced) {
            console.warn("[AuthInitializer] Session sync failed, checking if state should be cleared");
            // Only clear state if it's definitive
            if (!storeAuthenticated) {
               logout();
            }
          } else if (!isInitialized) {
            const user = useAuthStore.getState().user;
            const publicRoutes = ["/login", "/register", "/forgot-password"];
            if (user && publicRoutes.includes(location.pathname)) {
              navigate("/home");
            }
          }
        } catch (error) {
          console.error("[AuthInitializer] Sync error caught:", error);
        } finally {
          syncInProgressRef.current = false;
        }
      } else {
        console.log("[AuthInitializer] No session from Supabase");
        // Only logout if we had a session and Supabase explicitly says it's gone
        if (storeAuthenticated && isInitialized && event === 'SIGNED_OUT') {
          console.log("[AuthInitializer] Supabase signed out, clearing store");
          logout();
        }
      }

      markResolved();
    });

    // Check for existing session on mount
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          // Supabase returned an auth error — session is definitively invalid
          console.warn("[AuthInitializer] getSession() error:", error.message);
          logout();
          markResolved();
          return;
        }

        if (!session) {
          // No stored session — unblock immediately (user is not logged in)
          markResolved();
        }
        // If session exists, onAuthStateChange will fire INITIAL_SESSION and
        // call markResolved() after the backend sync completes.
      } catch (err) {
        // True network failure (ERR_NAME_NOT_RESOLVED, offline, etc.)
        // Supabase is completely unreachable — this is the ONLY place we
        // clear auth and redirect, because we have definitive evidence the
        // session cannot be validated.
        console.error("[AuthInitializer] getSession() network failure:", err);
        const { isAuthenticated } = useAuthStore.getState();
        logout();
        markResolved();
        if (isAuthenticated) {
          navigate("/login", {
            replace: true,
            state: { sessionExpired: true },
          });
        }
      }
    };

    checkSession();

    return () => {
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal"></div>
      </div>
    );
  }

  return <>{children}</>;
}
