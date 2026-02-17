/**
 * Auth Store
 *
 * Client-side authentication state management using Zustand.
 * Stores JWT access token in memory (not localStorage) for security.
 *
 * Covers: Story 15.2 Task 6, NFR18 (JWT session management)
 */

import { create } from 'zustand';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  purchaseStatus: string;
}

interface AuthState {
  // State
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setAuth: (user: AuthUser, accessToken: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  refreshToken: () => Promise<boolean>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true, // Start loading until we check session
  error: null,

  // Set auth state after successful login/registration
  setAuth: (user, accessToken) => {
    set({
      user,
      accessToken,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
  },

  // Clear auth state on logout
  clearAuth: () => {
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  // Set loading state
  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  // Set error state
  setError: (error) => {
    set({ error, isLoading: false });
  },

  // Refresh the access token using refresh token cookie
  refreshToken: async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include', // Include httpOnly cookie
      });

      if (!response.ok) {
        get().clearAuth();
        return false;
      }

      const result = await response.json();

      if (result.success && result.data) {
        set({
          accessToken: result.data.accessToken,
          user: result.data.user,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      }

      get().clearAuth();
      return false;
    } catch (error) {
      console.error('[auth-store] Token refresh failed:', error);
      get().clearAuth();
      return false;
    }
  },

  // Logout and clear session
  logout: async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('[auth-store] Logout request failed:', error);
    } finally {
      get().clearAuth();
    }
  },
}));

/**
 * Hook to initialize auth state on app load
 * Attempts to refresh token if refresh cookie exists
 */
export function useInitializeAuth() {
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const setLoading = useAuthStore((state) => state.setLoading);
  const isLoading = useAuthStore((state) => state.isLoading);

  const initialize = async () => {
    if (!isLoading) return; // Already initialized

    try {
      await refreshToken();
    } catch (error) {
      console.error('[auth-store] Auth initialization failed:', error);
      setLoading(false);
    }
  };

  return { initialize };
}

/**
 * Get the current access token
 * Returns null if not authenticated
 */
export function getAccessToken(): string | null {
  return useAuthStore.getState().accessToken;
}

/**
 * Check if user is currently authenticated
 */
export function isAuthenticated(): boolean {
  return useAuthStore.getState().isAuthenticated;
}

/**
 * Get current user
 */
export function getCurrentUser(): AuthUser | null {
  return useAuthStore.getState().user;
}
