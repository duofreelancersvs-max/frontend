import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/auth.store";
import { useUpgradeModalStore } from "@/stores/upgrade-modal.store";
import type { PlanErrorMeta } from "@/types/feature-gate.types";
import { supabase } from "@/lib/supabase";
import NProgress from "nprogress";

NProgress.configure({ showSpinner: true, speed: 400 });

let pendingRequests = 0;
let loadingTimeout: ReturnType<typeof setTimeout> | null = null;

const startLoading = () => {
  pendingRequests++;
  if (pendingRequests === 1) {
    loadingTimeout = setTimeout(() => {
      NProgress.start();
    }, 250);
  }
};

const stopLoading = () => {
  pendingRequests = Math.max(0, pendingRequests - 1);
  if (pendingRequests === 0) {
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
      loadingTimeout = null;
    }
    NProgress.done();
  }
};

const API_URL = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:3000/api/v1`;

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

// ─── Token refresh queue ───────────────────────────────────────────────────
// When multiple concurrent requests fail with 401, only ONE refresh call
// should be made.  Others queue up and reuse the result.  This prevents
// the Supabase refresh-token single-use race condition where N parallel
// 401s each call refreshSession(), but only the first succeeds — the rest
// destroy the session and log the user out.
interface PendingRequest {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: PendingRequest[] = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((pending) => {
    if (error) {
      pending.reject(error);
    } else {
      pending.resolve(token!);
    }
  });
  failedQueue = [];
}

function enqueueRefresh(): Promise<string> {
  return new Promise((resolve, reject) => {
    failedQueue.push({ resolve, reject });
  });
}

// ─── Axios instance ────────────────────────────────────────────────────────

const axiosClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
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

    // ─── Enhanced error logging for debugging ────────────────────────────
    if (import.meta.env.DEV || !error.response) {
      console.error("[axios-client] Request failed:", {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        code: error.code,
        message: error.message,
        hasResponse: !!error.response,
        responseData: error.response?.data,
      });
    }
    
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
    // Handle SESSION_INVALIDATED first — always, even for manual-auth requests
    // (AuthInitializer uses manual auth headers during init).
    if (status === 401) {
      if ((errorCode === 'SESSION_INVALIDATED' || errorCode === 'SESSION_EXPIRED') && originalRequest.headers.Authorization) {
        await fullLogout();
        window.location.replace(`/login?reason=${errorCode.toLowerCase()}`);
        return Promise.reject(error);
      }

      // Skip auto-retry for requests with manually-set Authorization
      if (originalRequest._manualAuth) {
        return Promise.reject(error);
      }

      // Use error codes (not fragile string matching) to decide whether
      // to skip refresh.  Backend returns these codes for logical errors
      // that are NOT token-expiry issues.
      if (
        errorCode === "ACCOUNT_EXISTS" ||
        errorCode === "ROLE_MISMATCH"
      ) {
        return Promise.reject(error);
      }

      // Only retry once
      if (originalRequest._retry) {
        return Promise.reject(error);
      }

      // ── Refresh queue: only one refresh at a time ────────────────────
      if (isRefreshing) {
        // Another request is already refreshing — wait for it
        try {
          const token = await enqueueRefresh();
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosClient(originalRequest);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Use Supabase to refresh the session
        const {
          data: { session },
          error: refreshError,
        } = await supabase.auth.refreshSession();

        if (refreshError || !session) {
          throw new Error(refreshError?.message || "Failed to refresh session");
        }

        const newToken = session.access_token;
        const newRefreshToken = session.refresh_token;

        // Update tokens in store
        const { tokens, setTokens } = useAuthStore.getState();
        if (tokens) {
          setTokens({
            ...tokens,
            accessToken: newToken,
            refreshToken: newRefreshToken,
          });
        }

        // Process all queued requests with the new token
        processQueue(null, newToken);

        // Retry the original request
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed — process queue with error, then full logout
        processQueue(refreshError, null);
        console.error("[axios-client] Token refresh failed, logging out:", refreshError);
        await fullLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// ─── Helper: full logout (clear both Zustand AND Supabase session) ─────────
async function fullLogout() {
  try {
    await supabase.auth.signOut();
  } catch {
    // signOut can fail on network errors — continue anyway
  }
  
  // Force wipe Supabase local storage if signOut fails to do so (prevents 401 logout loops)
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("sb-") && key.endsWith("-auth-token")) {
      localStorage.removeItem(key);
    }
  });

  useAuthStore.getState().logout();
}

export default axiosClient;
