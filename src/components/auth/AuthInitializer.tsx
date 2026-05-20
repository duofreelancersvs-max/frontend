import { useEffect, useState, useRef, useCallback, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth.store";
import axiosClient from "@/lib/axios-client";
import type { User } from "@/types/auth.types";

interface AuthInitializerProps {
  children: ReactNode;
}

export function AuthInitializer({ children }: AuthInitializerProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const { setAuth, setLoading, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const isOAuthCallbackRef = useRef(location.pathname === "/auth/callback");
  isOAuthCallbackRef.current = location.pathname === "/auth/callback";

  const initializedRef = useRef(false);

  /** Unblock the loading spinner. Never touches auth state. */
  const unblock = useCallback(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    setLoading(false);
    setIsInitialized(true);
  }, [setLoading]);

  /** Hard logout -> redirect to /login with "session expired" banner. */
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
    const safetyTimer = setTimeout(() => {
      if (!initializedRef.current) {
        console.warn("[AuthInitializer] Timeout — unblocking spinner.");
        unblock();
      }
    }, 10_000);

    // ── initialise: getSession then sync ─────────────────────────────────────
    (async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session?.user) {
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

        const synced = await syncSessionWithBackend(
          session.access_token,
          session.refresh_token,
        );

        if (synced) {
          const user = useAuthStore.getState().user;
          if (user && ["/login", "/register", "/forgot-password"].includes(location.pathname)) {
            navigate("/home");
          }
        }

        if (!synced && !useAuthStore.getState().isAuthenticated) {
          logout();
        }

        unblock();
      } catch (err) {
        console.error("[AuthInitializer] init error:", err);
        if (useAuthStore.getState().isAuthenticated) {
          forceLogout();
        } else {
          unblock();
        }
      }
    })();

    // ── auth state listener for subsequent changes (NOT initial) ────────────
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (isOAuthCallbackRef.current) {
          setIsInitialized(true);
          return;
        }

        if (session?.user) {
          if (event === "INITIAL_SESSION") return;

          const { isAuthenticated } = useAuthStore.getState();

          if (isAuthenticated && initializedRef.current && event !== "TOKEN_REFRESHED") {
            return;
          }

          const synced = await syncSessionWithBackend(
            session.access_token,
            session.refresh_token,
          );

          if (!synced && !useAuthStore.getState().isAuthenticated) {
            logout();
          }
        } else {
          const { isAuthenticated } = useAuthStore.getState();
          if (event === "SIGNED_OUT" || isAuthenticated) {
            console.warn(
              `[AuthInitializer] No session (event: ${event}) — logging out.`
            );
            forceLogout();
          }
        }
      },
    );

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
