import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth.store";
import axiosClient from "@/lib/axios-client";
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

        // Sign in with Supabase
        const { data: authData, error: signInError } =
          await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

        if (signInError) {
          throw new Error(signInError.message);
        }

        if (!authData.session || !authData.user) {
          throw new Error("Authentication failed");
        }

        // Sync with backend
        const { data } = await axiosClient.post<{
          data: { user: User; tokens: { expiresIn: number } };
        }>(
          "/auth/login",
          {
            email: credentials.email,
            password: credentials.password,
          },
          { skipAuth: true } as any,
        );

        setAuth(data.data.user, {
          accessToken: authData.session.access_token,
          refreshToken: authData.session.refresh_token,
          expiresIn: authData.session.expires_in || 3600,
        });

        // Redirect based on role
        const role = data.data.user.role;
        if (role === "client") {
          navigate("/client/dashboard");
        } else if (role === "freelancer") {
          navigate("/freelancer/dashboard");
        } else if (role === "admin") {
          navigate("/admin/dashboard");
        }
      } catch (err: any) {
        const message =
          err.response?.data?.error?.message ||
          err.message ||
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
          { skipAuth: true } as any,
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
            expiresIn: result.data.data.tokens.expiresIn || 3600,
          });
        } else {
          setAuth(result.data.data.user, {
            accessToken: authData.session.access_token,
            refreshToken: authData.session.refresh_token,
            expiresIn: authData.session.expires_in || 3600,
          });
        }

        // Redirect based on verification
        if (result.data.data.user.role === "client") {
          navigate("/client/dashboard");
        } else {
          navigate("/freelancer/dashboard");
        }
      } catch (err: any) {
        let message = "Registration failed";
        if (err.response?.data?.error?.message) {
          message = err.response.data.error.message;
        } else if (err.message) {
          message = err.message;
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
      } catch (err: any) {
        const message =
          err.response?.data?.error?.message ||
          err.response?.data?.message ||
          err.message ||
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
      } catch (err: any) {
        let message = "Password reset failed";
        if (err.message) {
          message = err.message;
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
      } catch (err: any) {
        let message = "Password update failed";
        if (err.message) {
          message = err.message;
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
