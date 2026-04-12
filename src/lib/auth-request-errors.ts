import { isAxiosError, type AxiosError } from "axios";

const NETWORK_HINT =
  "Cannot reach the server. On mobile, try Wi-Fi, open the site in Safari or Chrome (not in-app browsers), and ensure the API CORS_ORIGIN includes this site's exact URL (www vs non-www).";

/**
 * Maps Axios / backend errors to a user-visible string.
 * Prefer API JSON messages when present; surface clearer copy for timeouts and network/CORS failures.
 */
export function formatBackendApiError(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const ax = err as AxiosError<{
      error?: { message?: string };
      message?: string;
    }>;
    const apiMsg =
      ax.response?.data?.error?.message ?? ax.response?.data?.message;
    if (apiMsg) return apiMsg;

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
      return NETWORK_HINT;
    }
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
