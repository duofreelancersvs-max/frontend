import { useEffect, useState, useRef, type ReactNode } from "react";
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

      setLoading(false);
      setIsInitialized(true);
    });

    // Check for existing session on mount
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setLoading(false);
        setIsInitialized(true);
      }
      // If session exists, the onAuthStateChange callback above will handle it
    };

    checkSession();

    return () => {
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
