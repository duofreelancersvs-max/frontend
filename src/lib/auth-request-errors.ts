import { isAxiosError, type AxiosError } from "axios";
import { isInAppBrowser } from "@/lib/oauth";

const IN_APP_BROWSER_HINT =
  "Sign-in may not work inside Instagram, WhatsApp, or Facebook browsers. Tap the menu (⋯) and choose \"Open in Chrome\" or \"Open in Safari\", then try again.";

const NETWORK_HINT =
  "Could not reach our servers. Check your mobile data or Wi-Fi, then try again. If it keeps failing, open the site in Chrome or Safari (not an in-app browser).";

const CORS_HINT =
  "Connection blocked. Make sure you're using the same site URL each time (www vs non-www). Try again in Chrome or Safari.";

const TIMEOUT_HINT =
  "The server took too long to respond. This often happens during high traffic. Please try again in a moment.";

/**
 * Maps Axios / backend errors to a user-visible string.
 * Prefer API JSON messages when present; surface clearer copy for timeouts and network/CORS failures.
 */
export function formatBackendApiError(err: unknown, fallback: string): string {
  if (isInAppBrowser() && isAxiosError(err) && !err.response) {
    return IN_APP_BROWSER_HINT;
  }

  if (isAxiosError(err)) {
    const ax = err as AxiosError<{
      error?: { message?: string; code?: string };
      message?: string;
    }>;
    const apiMsg =
      ax.response?.data?.error?.message ?? ax.response?.data?.message;
    if (apiMsg) return apiMsg;

    if (ax.response?.status === 429) {
      return "Too many attempts. Please wait a minute and try again.";
    }

    if (ax.response?.status === 503 || ax.response?.status === 502) {
      return "Our servers are temporarily unavailable. Please try again in a few moments.";
    }

    if (
      ax.code === "ECONNABORTED" ||
      ax.code === "ERR_CANCELED" ||
      ax.message?.toLowerCase().includes("timeout") ||
      ax.message?.toLowerCase().includes("aborted")
    ) {
      return TIMEOUT_HINT;
    }

    if (!ax.response) {
      // No response at all — could be network, CORS, or server down.
      // Log detailed error info for debugging device-specific issues
      const debugInfo = {
        url: ax.config?.url,
        method: ax.config?.method,
        code: ax.code,
        message: ax.message,
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        online: navigator.onLine,
        connection: (navigator as any).connection?.effectiveType || 'unknown',
      };
      console.error("[auth-request-errors] No response received:", debugInfo);

      if (ax.message === "Network Error" || ax.code === "ERR_NETWORK") {
        return NETWORK_HINT;
      }
      return CORS_HINT;
    }

    // Server responded with an error status but no parseable message
    if (ax.response?.status && ax.response.status >= 500) {
      return "Our servers encountered an error. Please try again in a few moments.";
    }
  }

  if (err instanceof Error && err.message) {
    if (err.message.toLowerCase().includes("aborted")) {
      return "Request was interrupted. Check your internet connection and try again.";
    }
    return err.message;
  }
  return fallback;
}
