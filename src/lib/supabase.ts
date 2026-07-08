import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const msg =
    "FATAL: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set. " +
    "The app cannot function without them.";
  console.error(msg);
  // In production, throw so the app fails fast instead of silently degrading.
  if (import.meta.env.PROD) {
    throw new Error(msg);
  }
}

/**
 * Supabase Client
 * Used for authentication and other Supabase services
 */
export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "", {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: "pkce",
    storageKey: "cmi-auth-token",
  },
});

/**
 * Get the current Supabase session
 */
export async function getCurrentSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) {
    console.error("Error getting session:", error);
    return null;
  }
  return session;
}

/**
 * Get the current access token
 */
export async function getAccessToken() {
  const session = await getCurrentSession();
  return session?.access_token || null;
}

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}
