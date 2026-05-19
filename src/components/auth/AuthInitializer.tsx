import { useEffect, useState, useRef, useCallback, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth.store";
import axiosClient from "@/lib/axios-client";
import type { User } from "@/types/auth.types";

/** Max ms we'll wait for Supabase before declaring the session dead and unblocking the UI */
const AUTH_INIT_TIMEOUT_MS = 5000;

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
  // Track whether we've already resolved so the timeout doesn't double-fire
  const resolvedRef = useRef(false);

  /**
   * Mark auth as resolved — called either by a successful Supabase response
   * OR by the safety timeout below.
   */
  const markResolved = useCallback(
    (clearAuth = false) => {
      if (resolvedRef.current) return;
      resolvedRef.current = true;
      if (clearAuth) {
        logout();
      }
      setLoading(false);
      setIsInitialized(true);
    },
    [logout, setLoading],
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
    let syncInProgress = false;

    /**
     * Safety timeout — if Supabase never responds (e.g. project paused/deleted,
     * DNS failure, network offline) we must NOT leave the user on an infinite
     * spinner.  After AUTH_INIT_TIMEOUT_MS we clear any stale auth state and
     * let the app render so ProtectedRoute can redirect to /login normally.
     */
    const safetyTimer = setTimeout(() => {
      if (resolvedRef.current) return;
      console.warn(
        "[AuthInitializer] Supabase did not respond within timeout. " +
          "Clearing stale session and unblocking the app.",
      );
      const { isAuthenticated } = useAuthStore.getState();
      // If we had tokens stored but Supabase couldn't validate them,
      // treat the session as expired and force the user to re-login.
      markResolved(isAuthenticated);
      if (isAuthenticated) {
        navigate("/login", {
          replace: true,
          state: { sessionExpired: true },
        });
      }
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
      if (syncInProgress) {
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
          return;
        }

        try {
          syncInProgress = true;
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
          syncInProgress = false;
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
          // Supabase returned an error — treat as no session
          console.warn("[AuthInitializer] getSession() error:", error.message);
          markResolved(true);
          return;
        }

        if (!session) {
          // No stored session — unblock immediately
          markResolved();
        }
        // If session exists, onAuthStateChange will fire and call markResolved()
      } catch (err) {
        // Network failure (ERR_NAME_NOT_RESOLVED, etc.) — Supabase is unreachable
        console.error("[AuthInitializer] getSession() network failure:", err);
        const { isAuthenticated } = useAuthStore.getState();
        markResolved(isAuthenticated); // clear stale auth if any
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
