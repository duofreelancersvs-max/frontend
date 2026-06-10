import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth.store";
import axiosClient from "@/lib/axios-client";
import type { CustomAxiosRequestConfig } from "@/lib/axios-client";
import type { User } from "@/types/auth.types";
import { formatBackendApiError } from "@/lib/auth-request-errors";
import { toast } from "react-toastify";

/**
 * OAuth return handler. If users see "Network Error" on mobile only:
 * Safari → Develop → [device] → Web Inspector → Network: inspect failed calls to your API host vs *.supabase.co
 * and compare request `Origin` to Railway CORS_ORIGIN (www vs apex must match).
 */
export default function OAuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const { setAuth, setLoading } = useAuthStore();
  const hasRun = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      // Guard against double-execution (React StrictMode)
      if (hasRun.current) return;
      hasRun.current = true;

      setLoading(true);

      try {
        // Get the current session from Supabase
        // This will process the OAuth callback from the URL
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw new Error(sessionError.message);
        }

        if (!session || !session.user) {
          throw new Error("No authenticated user found");
        }

        // Get role from localStorage (set before redirect)
        const storedRole = localStorage.getItem("oauth_role");
        localStorage.removeItem("oauth_role");

        // Build request body
        const requestBody: Record<string, string> = {
          accessToken: session.access_token,
        };
        if (storedRole) {
          requestBody.role = storedRole;
        }

        // Call backend API to sync user
        const response = await axiosClient.post<{
          data: {
            user: User;
            tokens: {
              accessToken: string;
              refreshToken: string;
              expiresIn: number;
            };
          };
        }>("/auth/oauth/callback", requestBody, {
          skipAuth: true,
        } satisfies Partial<CustomAxiosRequestConfig> as CustomAxiosRequestConfig);

        const { user, tokens } = response.data.data;

        if (storedRole && user.role !== storedRole) {
          toast.info(`You have already created an account as a ${user.role}. Logging you in as a ${user.role} instead of a ${storedRole}.`);
          // We don't throw error anymore, just proceed with the actual role
        }

        // Backend returns the Supabase accessToken verbatim but refreshToken is empty.
        // Use the Supabase session's refreshToken as fallback since we need it for token refresh.
        const finalRefreshToken = tokens.refreshToken || session.refresh_token;

        // Keep Supabase client in sync with the tokens we're about to store
        const { error: setSessionError } = await supabase.auth.setSession({
          access_token: tokens.accessToken,
          refresh_token: finalRefreshToken,
        });

        if (setSessionError) {
          console.error("Supabase session sync error:", setSessionError);
        }

        // Set auth state in Zustand store
        setAuth(user, {
          accessToken: tokens.accessToken,
          refreshToken: finalRefreshToken,
          expiresIn: tokens.expiresIn || 3600,
        });

        // Redirect to entry route (root page)
        navigate("/");
      } catch (err: unknown) {
        console.error("OAuth Callback Error:", err);
        let message: string;
        if (isAxiosError(err)) {
          const url =
            typeof err.config?.url === "string"
              ? err.config.url
              : err.config?.baseURL != null
                ? `${err.config.baseURL}${err.config.url ?? ""}`
                : "API";
          message = `${formatBackendApiError(err, "Could not reach the server")} (sync: ${url})`;
        } else if (err instanceof Error) {
          message =
            err.message === "No authenticated user found"
              ? "Sign-in did not complete. Check Supabase Auth redirect URLs include this site's /auth/callback."
              : err.message;
        } else {
          message = "Authentication failed";
        }

        setError(message);
        toast.error(message);

        // If it's a role mismatch, sign out to prevent auto-login loops
        if (message.includes("Account already exists")) {
          await supabase.auth.signOut();
        }

        // Delayed redirect giving time for toast to be seen
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [navigate, setAuth, setLoading]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
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
          <p className="text-slate-600 mb-4">{error}</p>
          <p className="text-slate-500 text-sm">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-navy">
          Completing sign in...
        </h2>
        <p className="text-slate-500 mt-2">
          Please wait while we authenticate you
        </p>
      </div>
    </div>
  );
}
