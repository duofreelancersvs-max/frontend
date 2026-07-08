import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, AuthTokens } from '@/types/auth.types';

/** Current Supabase URL used to fingerprint the auth provider */
export const CURRENT_SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || '';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  /** Supabase project URL at the time the token was saved — detects project switches */
  lastSupabaseUrl: string;

  // Actions
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  setAuth: (user: User, tokens: AuthTokens) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
      lastSupabaseUrl: '',

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setTokens: (tokens) =>
        set({ tokens, lastSupabaseUrl: CURRENT_SUPABASE_URL }),

      setAuth: (user, tokens) =>
        set({
          user,
          tokens,
          isAuthenticated: true,
          error: null,
          lastSupabaseUrl: CURRENT_SUPABASE_URL,
        }),

      setLoading: (isLoading) =>
        set({ isLoading }),

      setError: (error) =>
        set({ error }),

      logout: () =>
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          error: null,
          lastSupabaseUrl: '',
        }),

      clearError: () => 
        set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        // Tokens are NOT persisted — they live only in memory and are
        // re-populated by AuthInitializer from the Supabase session on
        // every page load.  This prevents a second copy of tokens in
        // localStorage alongside Supabase's own storage, reducing the
        // attack surface for XSS token theft.
        lastSupabaseUrl: state.lastSupabaseUrl,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<AuthState>),
        // Tokens always start as null — AuthInitializer fills them from Supabase
        tokens: null,
        isAuthenticated: !!((persisted as Partial<AuthState>).user ?? current.user),
        isLoading: true, // Always start loading until AuthInitializer completes
      }),
    }
  )
);

// Selectors
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectUserRole = (state: AuthState) => state.user?.role;
export const selectIsClient = (state: AuthState) => state.user?.role === 'client';
export const selectIsFreelancer = (state: AuthState) => state.user?.role === 'freelancer';
export const selectIsAdmin = (state: AuthState) => state.user?.role === 'admin';
