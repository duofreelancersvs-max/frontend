import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth.store";
import axiosClient from "@/lib/axios-client";
import type { CustomAxiosRequestConfig } from "@/lib/axios-client";
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
  resetPassword: (email: string) => Promise<void>;
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
          },
          {
            skipAuth: true,
          } satisfies Partial<CustomAxiosRequestConfig> as CustomAxiosRequestConfig,
        );

        const { user: apiUser, tokens: apiTokens } = response.data;

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

        // Redirect to home page
        navigate("/home");
      } catch (err: unknown) {
        const error = err as {
          response?: { data?: { error?: { message?: string } } };
          message?: string;
        };
        const message =
          error.response?.data?.error?.message ||
          error.message ||
          "Invalid email or password";
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

        // Register directly with backend (which creates Supabase user)
        const result = await axiosClient.post<{
          data: {
            user: User;
            tokens: {
              accessToken: string;
              refreshToken: string;
              expiresIn: number;
            };
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
          } satisfies Partial<CustomAxiosRequestConfig> as CustomAxiosRequestConfig,
        );

        // Sign in with Supabase to get the session
        const { data: authData, error: signInError } =
          await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
          });

        if (signInError || !authData.session) {
          // If sign-in fails, use the tokens from backend response
          setAuth(result.data.data.user, {
            accessToken: result.data.data.tokens.accessToken,
            refreshToken: result.data.data.tokens.refreshToken,
            expiresIn: result.data.data.tokens.expiresIn || 1800,
          });
        } else {
          setAuth(result.data.data.user, {
            accessToken: authData.session.access_token,
            refreshToken: authData.session.refresh_token,
            expiresIn: authData.session.expires_in || 1800,
          });
        }

        // Redirect to home page
        navigate("/home");
      } catch (err: unknown) {
        const error = err as {
          response?: {
            data?: {
              error?: {
                message?: string;
                details?: Array<{ field: string; message: string }>;
              };
              message?: string;
            };
          };
          message?: string;
        };
        let message = "Registration failed";
        if (
          error.response?.data?.error?.details &&
          error.response.data.error.details.length > 0
        ) {
          // Show the first validation error detail for clarity
          const detail = error.response.data.error.details[0];
          message = `${detail.field}: ${detail.message}`;
        } else if (error.response?.data?.error?.message) {
          message = error.response.data.error.message;
        } else if (error.message) {
          message = error.message;
        }
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [navigate, setAuth, setError, setLoading],
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
    async (email: string): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
          email,
          {
            redirectTo: `${window.location.origin}/reset-password`,
          },
        );

        if (resetError) {
          throw new Error(resetError.message);
        }

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
