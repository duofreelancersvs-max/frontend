/**
 * Domain Normalizer
 *
 * Ensures the app always runs on the canonical domain (non-www) in production.
 * This prevents split-brain auth state where localStorage, cookies, and Supabase
 * sessions differ between www.connectmeindia.com and connectmeindia.com.
 *
 * Call this ONCE at app boot, before React mounts.
 */

/** The canonical domain (without www). */
const CANONICAL_DOMAIN = "connectmeindia.com";

/**
 * If the current hostname is the www variant of the canonical domain,
 * redirect to the non-www version, preserving the full path + query + hash.
 *
 * No-ops in development, localhost, or non-matching domains.
 */
export function enforceCanonicalDomain(): void {
  // Skip in development
  if (import.meta.env.DEV) return;

  const { hostname, protocol, pathname, search, hash } = window.location;

  // Only redirect if we're on the www variant
  if (hostname === `www.${CANONICAL_DOMAIN}`) {
    const canonicalUrl = `${protocol}//${CANONICAL_DOMAIN}${pathname}${search}${hash}`;
    // Use replace to avoid polluting the browser history
    window.location.replace(canonicalUrl);
  }
}
