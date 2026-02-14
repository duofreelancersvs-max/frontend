import { useEffect, useState, useRef, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
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

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const { isLoading: storeIsLoading, isAuthenticated: storeAuthenticated } =
          useAuthStore.getState();

        // Skip on OAuth callback route or if we're already mid-login in useAuth
        if (isOAuthCallbackRef.current || (storeIsLoading && !isInitialized)) {
          setIsInitialized(true);
          setLoading(false);
          return;
        }

        if (session?.user) {
          // If we're already authenticated in the store, we don't need to sync again on every state change
          // unless it's the very first initialization.
          if (storeAuthenticated && isInitialized) {
            setLoading(false);
            return;
          }

          try {
            const synced = await syncSessionWithBackend(
              session.access_token,
              session.refresh_token,
            );

            if (!synced) {
              // Session invalid on backend, clear it
              await supabase.auth.signOut();
              logout();
            }
          } catch (error) {
            console.error("Session sync failed:", error);
            logout();
          }
        } else {
          // No Supabase user — clear auth state if we thought we were logged in
          if (storeAuthenticated) {
            logout();
          }
        }

        setLoading(false);
        setIsInitialized(true);
      }
    );

    // Check for existing session on mount
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
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
