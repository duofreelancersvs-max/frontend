const LOCAL_API_URL = "http://localhost:3000/api/v1";

export function getApiBaseUrl(): string {
  const configuredUrl = import.meta.env.VITE_API_URL as string | undefined;
  const normalizedUrl = configuredUrl?.trim().replace(/\/+$/, "");

  if (normalizedUrl) {
    return normalizedUrl;
  }

  if (import.meta.env.PROD) {
    throw new Error(
      "Missing VITE_API_URL in production build. Set it to your backend /api/v1 URL.",
    );
  }

  return LOCAL_API_URL;
}

export function getApiOrigin(): string {
  try {
    return new URL(getApiBaseUrl()).origin;
  } catch {
    return new URL(LOCAL_API_URL).origin;
  }
}
