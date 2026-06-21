import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth.store";
import { getOrCreateDeviceId } from "@/lib/axios-client";
import { formatBackendApiError } from "@/lib/auth-request-errors";
import {
  consumeOAuthRole,
  isInAppBrowser,
  syncOAuthWithBackend,
  waitForOAuthSession,
} from "@/lib/oauth";
import { toast } from "react-toastify";
import { SEO } from "@/components/SEO/SEO";

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const { setAuth, setLoading } = useAuthStore();
  const hasRun = useRef(false);

  const completeOAuth = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const session = await waitForOAuthSession();
      const storedRole = consumeOAuthRole();

      const requestBody: Record<string, string> = {
        accessToken: session.access_token,
        refreshToken: session.refresh_token || '',
        deviceId: getOrCreateDeviceId(),
      };
      if (storedRole) {
        requestBody.role = storedRole;
      }

      const { user, tokens } = await syncOAuthWithBackend(requestBody);

      if (storedRole && user.role !== storedRole) {
        toast.info(
          `You have already created an account as a ${user.role}. Logging you in as a ${user.role} instead of a ${storedRole}.`,
        );
      }

      // Do NOT call supabase.auth.setSession() here.  The Supabase session
      // from waitForOAuthSession / signInWithIdToken is already valid.
      // Overwriting it with tokens echoed from the backend can fail (403)
      // if the session rotated during the backend round-trip, which
      // destroys the session and triggers SIGNED_OUT → forceLogout.

      const finalRefreshToken = tokens.refreshToken || session.refresh_token;

      setAuth(user, {
        accessToken: tokens.accessToken,
        refreshToken: finalRefreshToken,
        expiresIn: tokens.expiresIn || 3600,
      });

      if (user.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err: unknown) {
      console.error("OAuth Callback Error:", err);
      let message: string;

      if (isInAppBrowser() && isAxiosError(err) && !err.response) {
        message = formatBackendApiError(err, "Authentication failed");
      } else if (isAxiosError(err)) {
        message = formatBackendApiError(err, "Could not complete sign-in");
      } else if (err instanceof Error) {
        message =
          err.message === "No authenticated user found"
            ? "Sign-in did not finish. Please try again — if it keeps failing, use Chrome or Safari."
            : err.message;
      } else {
        message = "Authentication failed";
      }

      setError(message);
      toast.error(message);

      if (message.includes("Account already exists")) {
        await supabase.auth.signOut();
      }
    } finally {
      setLoading(false);
      setIsRetrying(false);
    }
  }, [navigate, setAuth, setLoading]);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    void completeOAuth().then(() => {
      // After successful PKCE exchange, clear the URL params so that a
      // retry button click does not attempt to re-exchange the same
      // (now-consumed) authorization code.
      if (window.location.search || window.location.hash) {
        window.history.replaceState({}, "", window.location.pathname);
      }
    });
  }, [completeOAuth]);

  const handleRetry = () => {
    setIsRetrying(true);
    void completeOAuth();
  };

  if (error) {
    return (
      <>
        <SEO title="Sign In Error | ConnectMeIndia" noIndex />
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-navy mb-2">
            Authentication Failed
          </h2>
          <p className="text-slate-600 mb-6 text-sm leading-relaxed">{error}</p>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full rounded-lg bg-teal px-4 py-3 text-white font-semibold disabled:opacity-60"
            >
              {isRetrying ? "Retrying..." : "Try again"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/login", { replace: true })}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-700 font-medium"
            >
              Back to login
            </button>
          </div>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      <SEO title="Signing In | ConnectMeIndia" noIndex />
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center px-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-navy">
          Completing sign in...
        </h2>
        <p className="text-slate-500 mt-2 text-sm">
          This can take a few seconds on mobile networks
        </p>
      </div>
    </div>
    </>
  );
}
