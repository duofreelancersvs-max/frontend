import { useEffect, useState, useRef, useCallback, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { hasOAuthCallbackInUrl } from "@/lib/oauth";
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

  // Guards the init window: true while the startup async block is still running.
  // The onAuthStateChange listener must NOT call forceLogout while this is true,
  // because the init flow has its own fallback logic (Zustand restore, backend sync).
  const initializingRef = useRef(true);

  /** Unblock the loading spinner. Never touches auth state. */
  const unblock = useCallback(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    initializingRef.current = false;
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

  /** Decode a JWT and return its payload (without verification). */
  const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
    try {
      const base64 = token.split(".")[1];
      const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
      return JSON.parse(json);
    } catch {
      return null;
    }
  };

  /** Check whether a Supabase access token is expired (with 30s buffer). */
  const isTokenExpired = (token: string): boolean => {
    const payload = decodeJwtPayload(token);
    if (!payload || typeof payload.exp !== "number") return false; // can't tell — assume valid
    // 30-second buffer so we refresh slightly before actual expiry
    return payload.exp * 1000 < Date.now() + 30_000;
  };

  const syncSessionWithBackend = async (tokenOverride?: string): Promise<boolean> => {
    const token = tokenOverride || useAuthStore.getState().tokens?.accessToken;

    if (!token) return false;

    try {
      const { data } = await axiosClient.get<{ data: { user: User } }>(
        "/auth/me",
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const latestTokens = tokenOverride
        ? {
            accessToken: tokenOverride,
            refreshToken: useAuthStore.getState().tokens?.refreshToken || "",
            expiresIn: useAuthStore.getState().tokens?.expiresIn || 3600,
          }
        : useAuthStore.getState().tokens!;

      setAuth(data.data.user, latestTokens);
      return true;
    } catch (error: any) {
      const status = error?.response?.status;
      // Only clear Supabase session for definitive auth failures outside of
      // the init window and OAuth callback.  During init the block has its
      // own fallback paths; during OAuth the callback page handles cleanup.
      if ((status === 401 || status === 404) && !isOAuthCallbackRef.current && initializingRef.current === false) {
        supabase.auth.signOut().catch(() => {});
        // Force wipe local storage to prevent flickering/loops
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("sb-") && key.endsWith("-auth-token")) {
            localStorage.removeItem(key);
          }
        });
        logout();
      }
      return false;
    }
  };

  // ─── main effect ───────────────────────────────────────────────────────────

  useEffect(() => {
    // Supabase may fall back to Site URL (root) when redirectTo is not allow-listed.
    // Forward OAuth hash tokens to /auth/callback before any session sync runs.
    if (location.pathname !== "/auth/callback" && hasOAuthCallbackInUrl()) {
      window.location.replace(
        `/auth/callback${window.location.search}${window.location.hash}`,
      );
      return;
    }

    const safetyTimer = setTimeout(() => {
      if (!initializedRef.current) {
        console.warn("[AuthInitializer] Timeout — unblocking spinner.");
        unblock();
      }
    }, 10_000);

    // ── initialise: getSession then sync ─────────────────────────────────────
    (async () => {
      try {
        if (location.pathname === "/auth/callback") {
          unblock();
          return;
        }

        let { data: { session }, error } = await supabase.auth.getSession();

        // Fallback: If Supabase has no session, but Zustand does, try to restore
        // Supabase session by refreshing from the stored refresh token.
        //
        // IMPORTANT: We use setSession (which internally refreshes) rather than
        // creating a brand-new session.  A fresh setSession + refresh preserves
        // the Supabase session_id, whereas calling setSession with an expired
        // access_token can create a new session with a different session_id —
        // which would break single-device session tracking.
        if (!session?.user && useAuthStore.getState().isAuthenticated) {
          const tokens = useAuthStore.getState().tokens;
          if (tokens?.refreshToken) {
            const { data, error: refreshError } = await supabase.auth.refreshSession({
              refresh_token: tokens.refreshToken,
            });
            if (!refreshError && data.session) {
              session = data.session;
              error = null;
            }
          }
        }

        // If we have a session but the access token is expired (or about to
        // expire within 30s), proactively refresh before syncing with the
        // backend.  This prevents the backend from rejecting an expired token
        // and triggering a full logout.
        if (session?.access_token && isTokenExpired(session.access_token)) {
          const { data: refreshed, error: refreshErr } =
            await supabase.auth.refreshSession();
          if (!refreshErr && refreshed.session) {
            session = refreshed.session;
            error = null;
          }
          // If refresh fails, continue with the expired session —
          // syncSessionWithBackend will handle the 401.
        }

        if (error || !session?.user) {
          if (useAuthStore.getState().isAuthenticated) {
            // Last resort: verify with backend directly using Zustand token
            const synced = await syncSessionWithBackend();
            if (synced) {
              const user = useAuthStore.getState().user;
              if (user && ["/login", "/register", "/forgot-password"].includes(location.pathname)) {
                navigate("/");
              }
              unblock();
              return;
            }
            console.warn(
              "[AuthInitializer] No session and sync failed — logging out."
            );
            forceLogout();
          } else {
            unblock();
          }
          return;
        }

        // Sync session tokens to Zustand store first so other parts of the app have them
        useAuthStore.getState().setTokens({
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          expiresIn: session.expires_in || 3600,
        });

        const synced = await syncSessionWithBackend(session.access_token);

        if (synced) {
          const user = useAuthStore.getState().user;
          if (user && ["/login", "/register", "/forgot-password"].includes(location.pathname)) {
            navigate("/");
          }
          unblock();
        } else {
          // Backend rejected the token — the session is dead.  Force
          // logout instead of unblocking, because rendering the app with
          // stale tokens would trigger 401 cascades from every API call
          // (axios interceptor → window.location.replace("/login") → flicker).
          console.warn("[AuthInitializer] Backend sync failed — session invalid.");
          forceLogout();
        }
      } catch (err) {
        console.error("[AuthInitializer] init error:", err);
        if (useAuthStore.getState().isAuthenticated) {
          forceLogout();
        } else {
          unblock();
        }
      }
    })();

    // ── auth state listener for post-init changes ─────────────────────────────
    //
    // IMPORTANT: This listener must NOT call syncSessionWithBackend on
    // SIGNED_IN events.  Every login flow (email/password, OAuth redirect,
    // Google ID token) already performs its own backend sync.  If the listener
    // also syncs, it races the login flow: the backend may not have the user
    // record yet, causing a 401, which triggers signOut() and destroys the
    // session the login flow just created.
    //
    // The listener's responsibilities are limited to:
    //   • INITIAL_SESSION → keep Zustand tokens in sync (init block owns the rest)
    //   • TOKEN_REFRESHED → update Zustand tokens (no backend call needed)
    //   • SIGNED_OUT      → force-logout when the session disappears
    // ──────────────────────────────────────────────────────────────────────────
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (isOAuthCallbackRef.current) {
          setIsInitialized(true);
          return;
        }

        // ── INITIAL_SESSION: keep Zustand in sync, let the init block handle
        //    backend verification and redirects. ────────────────────────────
        if (event === "INITIAL_SESSION") {
          if (session?.user) {
            useAuthStore.getState().setTokens({
              accessToken: session.access_token,
              refreshToken: session.refresh_token,
              expiresIn: session.expires_in || 3600,
            });
          }
          return;
        }

        // ── During the init window, suppress all side-effects. The init
        //    block has its own fallback logic and must not be interrupted
        //    by a concurrent forceLogout (e.g. transient SIGNED_OUT from a
        //    failed auto-refresh). ────────────────────────────────────────
        if (initializingRef.current) {
          return;
        }

        // ── TOKEN_REFRESHED: silently update Zustand tokens. The axios
        //    interceptor will pick them up on the next request. ────────────
        if (event === "TOKEN_REFRESHED" && session?.user) {
          useAuthStore.getState().setTokens({
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
            expiresIn: session.expires_in || 3600,
          });
          return;
        }

        // ── SIGNED_IN: do nothing. The originating login flow (useAuth
        //    login / register / signInWithOAuth / signInWithGoogleIdToken
        //    or OAuthCallback page) has already synced with the backend
        //    and called setAuth().  Syncing here would race that flow and
        //    cause premature logout (401 → signOut → session destroyed). ─

        // ── SIGNED_OUT (or session unexpectedly null while user was
        //    authenticated): the session is gone — force logout.
        //    Only force-logout when the user WAS authenticated (had a real
        //    session that got revoked).  A SIGNED_OUT event for a visitor
        //    who was never authenticated must be ignored — otherwise a
        //    fresh browser hitting `/` would flicker between Home and
        //    /login forever. ─────────────────────────────────────────────
        if (!session?.user) {
          const { isAuthenticated } = useAuthStore.getState();
          if (isAuthenticated) {
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
