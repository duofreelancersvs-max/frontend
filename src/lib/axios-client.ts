import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/auth.store";
import { useUpgradeModalStore } from "@/stores/upgrade-modal.store";
import type { PlanErrorMeta } from "@/types/feature-gate.types";
import { supabase } from "@/lib/supabase";
import NProgress from "nprogress";

NProgress.configure({ showSpinner: true, speed: 400 });

let pendingRequests = 0;

const startLoading = () => {
  if (pendingRequests === 0) {
    NProgress.start();
  }
  pendingRequests++;
};

const stopLoading = () => {
  pendingRequests = Math.max(0, pendingRequests - 1);
  if (pendingRequests === 0) {
    NProgress.done();
  }
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

// Extend AxiosRequestConfig to include custom properties
export interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  skipAuth?: boolean;
  _manualAuth?: boolean; // Set when caller provides explicit Authorization header
  /**
   * Set to true to opt out of the global 402 → UpgradeModal interceptor.
   * Use when a caller wants to surface the 402 in its own UI
   * (e.g. inline pre-flight gate in ProjectApplicationModal).
   */
  _skipUpgradeModal?: boolean;
}

// Typed API error response shape from backend
interface ApiErrorResponse {
  error?: {
    code?: string;
    message?: string;
    meta?: PlanErrorMeta;
    details?: Array<{ field: string; message: string }>;
  };
}

// Create axios instance
const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Request interceptor: inject auth token
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    startLoading();

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
  (error) => {
    stopLoading();
    return Promise.reject(error);
  },
);

// Response interceptor: handle 401 with Supabase token refresh, and
// 402 PLAN_LIMIT_EXCEEDED by auto-opening the global UpgradeModal.
axiosClient.interceptors.response.use(
  (response) => {
    stopLoading();
    return response;
  },
  async (error: AxiosError) => {
    stopLoading();
    
    const originalRequest = error.config as CustomAxiosRequestConfig;
    const status = error.response?.status;
    const errorData = error.response?.data as ApiErrorResponse | undefined;
    const errorCode = errorData?.error?.code;
    const errorMeta = errorData?.error?.meta;

    // ─── 402 PLAN_LIMIT_EXCEEDED → global UpgradeModal ────────────────
    if (status === 402 && errorCode === "PLAN_LIMIT_EXCEEDED" && !originalRequest._skipUpgradeModal) {
      // 'messaging' / 'prioritySupport' / 'analytics' are feature locks,
      // not usage counts. Everything else is a quota limit.
      const reason: "limit" | "feature_locked" =
        errorMeta?.feature && ["messaging", "prioritySupport", "analytics"].includes(errorMeta.feature)
          ? "feature_locked"
          : "limit";

      useUpgradeModalStore.getState().open(reason, errorMeta);
    }

    // If error is 401 and we haven't retried yet, try to refresh token
    // Skip auto-retry for requests with manually-set Authorization
    if (
      status === 401 &&
      !originalRequest._retry &&
      !originalRequest._manualAuth
    ) {
      // Don't retry if the backend specifically returned a logical error message
      // like "Account already exists" or role mismatch
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
          throw new Error(refreshError?.message || "Failed to refresh session");
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
        // Refresh failed (auth error OR network error — Supabase unreachable)
        // In both cases clear stale tokens and send user to login
        console.error("[axios-client] Token refresh failed, logging out:", refreshError);
        useAuthStore.getState().logout();
        // Use replace so the user can't "back" into a broken state
        window.location.replace("/login");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
