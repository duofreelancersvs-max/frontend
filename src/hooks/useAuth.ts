import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { isAxiosError, type AxiosRequestHeaders } from "axios";
import { clearOAuthRole, getOAuthRedirectUrl, setOAuthRole, syncOAuthWithBackend } from "@/lib/oauth";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth.store";
import axiosClient from "@/lib/axios-client";
import type { CustomAxiosRequestConfig } from "@/lib/axios-client";
import { formatBackendApiError } from "@/lib/auth-request-errors";
import type { LoginCredentials, RegisterData, User } from "@/types/auth.types";
import { toast } from "react-toastify";

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  signInWithOAuth: (
    provider: "google" | "github",
    role?: string,
  ) => Promise<void>;
  resetPassword: (email: string, turnstileToken?: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
  signInWithGoogleIdToken: (idToken: string, role?: string) => Promise<void>;
}

/**
 * useAuth — Pure actions hook for authentication.
 *
 * Provides login, register, logout, OAuth, and password operations.
 * Uses Supabase Client SDK for authentication.
 * Reads auth state from Zustand. Does NOT set up listeners —
 * that's handled once by AuthInitializer.
 */
export function useAuth(): UseAuthReturn {
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    setAuth,
    setLoading,
    setError,
    logout: logoutStore,
    clearError,
  } = useAuthStore();

  // Login with email/password
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        // Strategy: authenticate with Supabase client-side FIRST, then verify
        // with the backend.  This ensures the Supabase session the frontend
        // holds is the same one the backend validates — no session mismatches.
        const { data: supabaseData, error: supabaseError } =
          await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

        if (supabaseError) {
          // If Supabase fails (e.g. user not confirmed), fall back to the
          // backend login which handles auto-confirmation.
          const { data: response } = await axiosClient.post<{
            data: {
              user: User;
              tokens: {
                accessToken: string;
                refreshToken: string;
                expiresIn: number;
              };
            };
          }>(
            "/auth/login",
            {
              email: credentials.email,
              password: credentials.password,
              ...(credentials.role ? { role: credentials.role } : {}),
            },
            {
              skipAuth: true,
              headers: (credentials.turnstileToken ? { "x-turnstile-token": credentials.turnstileToken } : {}) as AxiosRequestHeaders,
            } satisfies Partial<CustomAxiosRequestConfig> as CustomAxiosRequestConfig,
          );

          const { user: apiUser, tokens: apiTokens } = response.data;

          if (credentials.role && apiUser.role !== credentials.role) {
            throw new Error(
              `This account is registered as a ${apiUser.role}. Please log in as a ${apiUser.role} instead.`,
            );
          }

          // Sync Supabase client with the backend-created session
          await supabase.auth.setSession({
            access_token: apiTokens.accessToken,
            refresh_token: apiTokens.refreshToken,
          });

          setAuth(apiUser, {
            accessToken: apiTokens.accessToken,
            refreshToken: apiTokens.refreshToken,
            expiresIn: apiTokens.expiresIn || 1800,
          });

          if (apiUser.role === "admin") {
            navigate("/admin/dashboard");
          } else {
            navigate("/");
          }
          return;
        }

        // Supabase auth succeeded — now verify with backend
        const session = supabaseData.session;
        if (!session) {
          throw new Error("No session established");
        }

        const verifyPayload: Record<string, string> = {
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
        };
        if (credentials.role) {
          verifyPayload.role = credentials.role;
        }

        const { data: verifyResponse } = await axiosClient.post<{
          data: {
            user: User;
            tokens: {
              accessToken: string;
              refreshToken: string;
              expiresIn: number;
            };
          };
        }>("/auth/login/verify", verifyPayload, {
          skipAuth: true,
        } satisfies Partial<CustomAxiosRequestConfig> as CustomAxiosRequestConfig);

        const { user: verifiedUser, tokens: verifiedTokens } = verifyResponse.data;

        if (credentials.role && verifiedUser.role !== credentials.role) {
          throw new Error(
            `This account is registered as a ${verifiedUser.role}. Please log in as a ${verifiedUser.role} instead.`,
          );
        }

        // Don't call setSession — Supabase session is already valid from signInWithPassword
        setAuth(verifiedUser, {
          accessToken: verifiedTokens.accessToken,
          refreshToken: verifiedTokens.refreshToken || session.refresh_token,
          expiresIn: verifiedTokens.expiresIn || 3600,
        });

        if (verifiedUser.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/");
        }
      } catch (err: unknown) {
        const message = formatBackendApiError(err, "Invalid email or password");
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [navigate, setAuth, setError, setLoading],
  );

  // Register new user
  const register = useCallback(
    async (data: RegisterData): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        // Register with backend (creates Supabase user unconfirmed, sends verification email)
        const result = await axiosClient.post<{
          data: {
            user: User;
            emailVerificationSent: boolean;
          };
        }>(
          "/auth/register",
          {
            email: data.email,
            password: data.password,
            role: data.role,
            phone: data.phone,
            firstName: data.firstName,
            lastName: data.lastName,
            city: data.city,
            state: data.state,
          },
          {
            skipAuth: true,
            headers: (data.turnstileToken ? { "x-turnstile-token": data.turnstileToken } : {}) as AxiosRequestHeaders,
          } satisfies Partial<CustomAxiosRequestConfig> as CustomAxiosRequestConfig,
        );

        const emailVerificationSent = result.data.data.emailVerificationSent;

        if (emailVerificationSent) {
          // Navigate to "check your email" page
          navigate(`/verify-email-sent?email=${encodeURIComponent(data.email)}`);
          return;
        }

        // Fallback: if somehow registered without verification flow, redirect to login
        navigate("/login");
      } catch (err: unknown) {
        let message = formatBackendApiError(err, "Registration failed");
        if (isAxiosError(err)) {
          const details = (
            err.response?.data as {
              error?: { details?: Array<{ field: string; message: string }> };
            }
          )?.error?.details;
          if (details && details.length > 0) {
            const detail = details[0];
            message = `${detail.field}: ${detail.message}`;
          }
        }
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [navigate, setError, setLoading],
  );

  // Logout — always clears both Supabase session AND Zustand, even if
  // signOut() fails (e.g. network error).
  const logout = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
    } catch {
      // ignore
    }

    try {
      await axiosClient.post("/auth/logout");
    } catch {
      // ignore backend logout failure
    }

    try {
      await supabase.auth.signOut();
    } catch {
      // signOut may fail on network errors — continue to clear Zustand anyway
    }
    logoutStore();
    navigate("/login");
    setLoading(false);
  }, [navigate, logoutStore, setLoading]);

  // OAuth sign in
  const signInWithOAuth = useCallback(
    async (provider: "google" | "github", role?: string): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        if (role) {
          setOAuthRole(role);
        } else {
          clearOAuthRole();
        }

        const { error: oauthError } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: getOAuthRedirectUrl(),
            queryParams: role ? { role } : undefined,
          },
        });

        if (oauthError) {
          throw new Error(oauthError.message);
        }

        // Note: The actual auth handling happens in OAuthCallback page after redirect
      } catch (err: unknown) {
        const error = err as {
          response?: {
            data?: { error?: { message?: string }; message?: string };
          };
          message?: string;
        };
        const message =
          error.response?.data?.error?.message ||
          error.response?.data?.message ||
          error.message ||
          "OAuth sign in failed";

        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setAuth, setError, setLoading],
  );

  // Google ID Token sign in (Native Google popup)
  const signInWithGoogleIdToken = useCallback(
    async (idToken: string, role?: string): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        if (role) {
          setOAuthRole(role);
        } else {
          clearOAuthRole();
        }

        const { data, error: oauthError } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: idToken,
        });

        if (oauthError) {
          throw new Error(oauthError.message);
        }

        const session = data.session;
        if (!session) {
          throw new Error("No session established");
        }

        const requestBody: Record<string, string> = {
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
        };
        if (role) {
          requestBody.role = role;
        }

        const { user: syncUser, tokens } = await syncOAuthWithBackend(requestBody);

        if (role && syncUser.role !== role) {
          toast.info(
            `You have already created an account as a ${syncUser.role}. Logging you in as a ${syncUser.role} instead.`
          );
        }

        // Do NOT call supabase.auth.setSession() here.  signInWithIdToken
        // (line above) already created a valid Supabase session.  Overwriting
        // it with the backend-issued JWT (tokens.accessToken) would destroy
        // the Supabase session because Supabase can't verify backend JWTs,
        // causing: setSession → _getUser 403 → _removeSession → SIGNED_OUT
        // → forceLogout on every login.
        //
        // The Supabase session (with Supabase tokens) stays intact for
        // Supabase operations.  Zustand stores the backend JWT for API calls
        // via axios.

        const finalRefreshToken = tokens.refreshToken || session.refresh_token;

        setAuth(syncUser, {
          accessToken: tokens.accessToken,
          refreshToken: finalRefreshToken,
          expiresIn: tokens.expiresIn || 3600,
        });

        if (syncUser.role === "admin") {
          navigate("/admin/dashboard", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      } catch (err: unknown) {
        const message = formatBackendApiError(err, "Google Sign-In failed");

        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [navigate, setAuth, setError, setLoading],
  );

  // Reset password
  const resetPassword = useCallback(
    async (email: string, turnstileToken?: string): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        await axiosClient.post(
          "/auth/forgot-password",
          { email },
          {
            skipAuth: true,
            headers: (turnstileToken ? { "x-turnstile-token": turnstileToken } : {}) as AxiosRequestHeaders,
          } satisfies Partial<CustomAxiosRequestConfig> as CustomAxiosRequestConfig,
        );

        toast.success("Password reset email sent!");
      } catch (err: unknown) {
        const error = err as { message?: string };
        let message = "Password reset failed";
        if (error.message) {
          message = error.message;
        }
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setError, setLoading],
  );

  // Update password
  const updatePassword = useCallback(
    async (newPassword: string): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (updateError) {
          throw new Error(updateError.message);
        }

        toast.success("Password updated successfully!");
      } catch (err: unknown) {
        const error = err as { message?: string };
        let message = "Password update failed";
        if (error.message) {
          message = error.message;
        }
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setError, setLoading],
  );

  // Refresh user data
  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const { data } = await axiosClient.get<{ user: User }>("/auth/me");
      if (data.user) {
        // We only update the user, keeping the tokens
        const currentTokens = useAuthStore.getState().tokens;
        if (currentTokens) {
          setAuth(data.user, currentTokens);
        }
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  }, [setAuth]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    signInWithOAuth,
    resetPassword,
    updatePassword,
    clearError,
    refreshUser,
    signInWithGoogleIdToken,
  };
}
