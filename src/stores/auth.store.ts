import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, AuthTokens } from '@/types/auth.types';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
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
      isLoading: false,
      error: null,

      setUser: (user) => 
        set({ 
          user, 
          isAuthenticated: !!user 
        }),

      setTokens: (tokens) => 
        set({ tokens }),

      setAuth: (user, tokens) => 
        set({ 
          user, 
          tokens, 
          isAuthenticated: true,
          error: null 
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
          error: null 
        }),

      clearError: () => 
        set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user, 
        tokens: state.tokens,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<AuthState>),
        isAuthenticated: !!((persisted as Partial<AuthState>).user ?? current.user),
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
