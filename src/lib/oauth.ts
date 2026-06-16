const OAUTH_ROLE_STORAGE_KEY = "oauth_role";
const OAUTH_ROLE_COOKIE = "oauth_role";
const OAUTH_ROLE_MAX_AGE_SECONDS = 600;

/** Parent domain for cookies so role survives www ↔ apex (e.g. .connectmeindia.com). */
function getSharedCookieDomain(): string | undefined {
  const host = window.location.hostname;

  if (host === "localhost" || host.endsWith(".localhost")) {
    return undefined;
  }

  if (/^\d+\.\d+\.\d+\.\d+$/.test(host) || host.includes(":")) {
    return undefined;
  }

  const parts = host.split(".");
  if (parts.length >= 2) {
    return `.${parts.slice(-2).join(".")}`;
  }

  return undefined;
}

function readCookie(name: string): string | null {
  const prefix = `${name}=`;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(prefix));

  if (!match) return null;

  return decodeURIComponent(match.slice(prefix.length));
}

function writeCookie(name: string, value: string, maxAgeSeconds: number): void {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "path=/",
    `max-age=${maxAgeSeconds}`,
    "SameSite=Lax",
  ];

  if (window.location.protocol === "https:") {
    parts.push("Secure");
  }

  const domain = getSharedCookieDomain();
  if (domain) {
    parts.push(`domain=${domain}`);
  }

  document.cookie = parts.join("; ");
}

function eraseCookie(name: string): void {
  const parts = [`${name}=`, "path=/", "max-age=0"];

  const domain = getSharedCookieDomain();
  if (domain) {
    parts.push(`domain=${domain}`);
  }

  document.cookie = parts.join("; ");
}

/**
 * Persist selected account role before the OAuth redirect.
 * Uses localStorage plus a short-lived shared-domain cookie for www/apex handoff.
 */
export function setOAuthRole(role: string): void {
  localStorage.setItem(OAUTH_ROLE_STORAGE_KEY, role);
  writeCookie(OAUTH_ROLE_COOKIE, role, OAUTH_ROLE_MAX_AGE_SECONDS);
}

/** Remove any stored OAuth role (localStorage + cookie). */
export function clearOAuthRole(): void {
  localStorage.removeItem(OAUTH_ROLE_STORAGE_KEY);
  eraseCookie(OAUTH_ROLE_COOKIE);
}

/** Read and clear the role saved before OAuth redirect. */
export function consumeOAuthRole(): string | null {
  const fromStorage = localStorage.getItem(OAUTH_ROLE_STORAGE_KEY);
  localStorage.removeItem(OAUTH_ROLE_STORAGE_KEY);

  const fromCookie = readCookie(OAUTH_ROLE_COOKIE);
  eraseCookie(OAUTH_ROLE_COOKIE);

  return fromStorage || fromCookie;
}

/**
 * Canonical OAuth return URL. Set VITE_OAUTH_REDIRECT_URL in production so
 * Supabase always redirects to an allow-listed path regardless of www/apex.
 */
export function getOAuthRedirectUrl(): string {
  const configured = import.meta.env.VITE_OAUTH_REDIRECT_URL as
    | string
    | undefined;

  if (configured?.trim()) {
    return configured.trim().replace(/\/$/, "");
  }

  return `${window.location.origin}/auth/callback`;
}

/** True when the URL hash contains Supabase OAuth response tokens. */
export function hasOAuthHashInUrl(): boolean {
  const hash = window.location.hash;
  return hash.includes("access_token=") || hash.includes("error=");
}
