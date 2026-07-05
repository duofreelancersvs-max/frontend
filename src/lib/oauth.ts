import { isAxiosError } from "axios";
import type { Session } from "@supabase/supabase-js";
import axiosClient from "@/lib/axios-client";
import type { CustomAxiosRequestConfig } from "@/lib/axios-client";
import { supabase } from "@/lib/supabase";
import type { User } from "@/types/auth.types";

const OAUTH_ROLE_STORAGE_KEY = "oauth_role";
const OAUTH_ROLE_COOKIE = "oauth_role";
const OAUTH_ROLE_MAX_AGE_SECONDS = 600;
const OAUTH_SYNC_TIMEOUT_MS = 60_000;
const OAUTH_SYNC_MAX_ATTEMPTS = 3;

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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** In-app browsers (WhatsApp, Instagram, etc.) often block cross-origin API calls. */
export function isInAppBrowser(): boolean {
  const ua = navigator.userAgent || "";
  return /FBAN|FBAV|Instagram|Line\/|Twitter|LinkedInApp|WhatsApp|Snapchat|wv\)/i.test(
    ua,
  );
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

/** True when the URL contains Supabase OAuth callback params (PKCE code or implicit hash). */
export function hasOAuthCallbackInUrl(): boolean {
  const hash = window.location.hash;
  if (hash.includes("access_token=") || hash.includes("error=")) {
    return true;
  }

  return new URLSearchParams(window.location.search).has("code");
}

/** @deprecated Use hasOAuthCallbackInUrl */
export function hasOAuthHashInUrl(): boolean {
  return hasOAuthCallbackInUrl();
}

/**
 * Wait for Supabase to finish the OAuth redirect (PKCE code exchange or hash parsing).
 * Mobile browsers can be slow to process the callback URL — polling avoids race failures.
 */
export async function waitForOAuthSession(
  maxWaitMs = 20_000,
): Promise<Session> {
  const url = new URL(window.location.href);
  const code = url.searchParams.get("code");
  const oauthError = url.searchParams.get("error_description")
    || url.searchParams.get("error");

  if (oauthError) {
    throw new Error(oauthError);
  }

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      throw new Error(error.message);
    }
    if (data.session?.user) {
      return data.session;
    }
  }

  const deadline = Date.now() + maxWaitMs;
  let delayMs = 150;

  while (Date.now() < deadline) {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      throw new Error(error.message);
    }

    if (session?.user) {
      return session;
    }

    await sleep(delayMs);
    delayMs = Math.min(Math.round(delayMs * 1.4), 1200);
  }

  throw new Error("No authenticated user found");
}

function isRetryableOAuthSyncError(err: unknown): boolean {
  if (!isAxiosError(err)) {
    return true;
  }

  if (!err.response) {
    return true;
  }

  const status = err.response.status;
  return status === 429 || status === 502 || status === 503 || status === 504;
}

export interface OAuthSyncResult {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

/** POST /auth/oauth/callback with retries for flaky mobile networks and cold starts. */
export async function syncOAuthWithBackend(
  requestBody: Record<string, string>,
): Promise<OAuthSyncResult> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= OAUTH_SYNC_MAX_ATTEMPTS; attempt++) {
    try {
      const response = await axiosClient.post<{
        data: OAuthSyncResult;
      }>("/auth/google/sync", requestBody, {
        skipAuth: true,
        timeout: OAUTH_SYNC_TIMEOUT_MS,
      } satisfies Partial<CustomAxiosRequestConfig> as CustomAxiosRequestConfig);

      return response.data.data;
    } catch (err) {
      lastError = err;

      // Enhanced logging — capture exact failure details for mobile debugging
      if (isAxiosError(err)) {
        console.error(`[syncOAuthWithBackend] Attempt ${attempt}/${OAUTH_SYNC_MAX_ATTEMPTS} failed:`, {
          status: err.response?.status,
          code: err.code,
          message: err.message,
          data: err.response?.data,
          hasResponse: !!err.response,
        });
      } else {
        console.error(`[syncOAuthWithBackend] Attempt ${attempt}/${OAUTH_SYNC_MAX_ATTEMPTS} failed:`, err);
      }

      if (!isRetryableOAuthSyncError(err) || attempt === OAUTH_SYNC_MAX_ATTEMPTS) {
        throw err;
      }

      await sleep(1000 * attempt);
    }
  }

  throw lastError;
}
