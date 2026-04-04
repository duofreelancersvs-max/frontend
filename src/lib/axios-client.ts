import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/auth.store";
import { supabase } from "@/lib/supabase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

// Extend AxiosRequestConfig to include custom properties
export interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  skipAuth?: boolean;
  _manualAuth?: boolean; // Set when caller provides explicit Authorization header
}

// Typed API error response shape from backend
interface ApiErrorResponse {
  error?: {
    message?: string;
    details?: Array<{ field: string; message: string }>;
  };
}

// Create axios instance
const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor: inject auth token
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const customConfig = config as CustomAxiosRequestConfig;

    // If the caller already set Authorization, mark it as manual
    if (config.headers.Authorization) {
      customConfig._manualAuth = true;
    }

    const { tokens } = useAuthStore.getState();

    // Inject auth token if available and not explicitly skipped
    if (
      tokens?.accessToken &&
      !customConfig.skipAuth &&
      !customConfig._manualAuth
    ) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }

    // Remove custom property before sending request
    delete customConfig.skipAuth;

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: handle 401 with Supabase token refresh
axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // If error is 401 and we haven't retried yet, try to refresh token
    // Skip auto-retry for requests with manually-set Authorization
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest._manualAuth
    ) {
      // Don't retry if the backend specifically returned a logical error message
      // like "Account already exists" or role mismatch
      const errorData = error.response?.data as ApiErrorResponse | undefined;
      const errorMessage = errorData?.error?.message ?? "";
      if (
        errorMessage.includes("Account already exists") ||
        errorMessage.includes("role")
      ) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        // Use Supabase to refresh the session
        const {
          data: { session },
          error: refreshError,
        } = await supabase.auth.refreshSession();

        if (refreshError || !session) {
          throw new Error("Failed to refresh session");
        }

        // Update tokens in store
        const { tokens, setTokens } = useAuthStore.getState();
        if (tokens) {
          setTokens({
            ...tokens,
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
          });
        }

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${session.access_token}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout and redirect to login
        useAuthStore.getState().logout();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
