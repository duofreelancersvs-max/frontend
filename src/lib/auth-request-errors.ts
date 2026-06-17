import { isAxiosError, type AxiosError } from "axios";
import { isInAppBrowser } from "@/lib/oauth";

const IN_APP_BROWSER_HINT =
  "Sign-in may not work inside Instagram, WhatsApp, or Facebook browsers. Tap the menu (⋯) and choose \"Open in Chrome\" or \"Open in Safari\", then try again.";

const NETWORK_HINT =
  "Could not reach our servers. Check your mobile data or Wi-Fi, then try again. If it keeps failing, open the site in Chrome or Safari (not an in-app browser).";

const CORS_HINT =
  "Connection blocked. Make sure you're using the same site URL each time (www vs non-www). Try again in Chrome or Safari.";

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

    if (
      ax.code === "ECONNABORTED" ||
      ax.message.toLowerCase().includes("timeout")
    ) {
      return "Request timed out. Check your connection and try again.";
    }

    if (!ax.response) {
      if (ax.message === "Network Error" || ax.code === "ERR_NETWORK") {
        return NETWORK_HINT;
      }
      return CORS_HINT;
    }
  }

  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
