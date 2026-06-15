import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { isAxiosError, type AxiosRequestHeaders } from "axios";
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

        // Login via backend (which handles session sync and auto-confirmation if unconfirmed)
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

        // Validate that the returned role matches the requested role
        if (credentials.role && apiUser.role !== credentials.role) {
          throw new Error(
            `This account is registered as a ${apiUser.role}. Please log in as a ${apiUser.role} instead.`,
          );
        }

        // Sync Supabase Client in the frontend with the session from the backend
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: apiTokens.accessToken,
          refresh_token: apiTokens.refreshToken,
        });

        if (sessionError) {
          console.error("Supabase session sync error:", sessionError);
        }

        // Update local store
        setAuth(apiUser, {
          accessToken: apiTokens.accessToken,
          refreshToken: apiTokens.refreshToken,
          expiresIn: apiTokens.expiresIn || 1800,
        });

        // Redirect to entry route (root page)
        if (apiUser.role === "admin") {
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

  // Logout
  const logout = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      logoutStore();
      navigate("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logout failed");
    } finally {
      setLoading(false);
    }
  }, [navigate, logoutStore, setError, setLoading]);

  // OAuth sign in
  const signInWithOAuth = useCallback(
    async (provider: "google" | "github", role?: string): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        // Store role in localStorage for after OAuth redirect
        if (role) {
          localStorage.setItem("oauth_role", role);
        } else {
          localStorage.removeItem("oauth_role");
        }

        // Use Supabase OAuth (redirect-based)
        const { error: oauthError } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
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
  };
}
