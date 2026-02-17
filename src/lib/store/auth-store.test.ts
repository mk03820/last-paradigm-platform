/**
 * Auth Store Tests
 *
 * Tests for Zustand auth state management.
 *
 * Covers: Story 15.2 Task 6.4
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAuthStore, getAccessToken, isAuthenticated, getCurrentUser } from './auth-store';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('auth-store', () => {
  beforeEach(() => {
    // Reset store to initial state
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('setAuth', () => {
    it('should set user and access token', () => {
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        purchaseStatus: 'none',
      };

      useAuthStore.getState().setAuth(user, 'mock-access-token');

      const state = useAuthStore.getState();
      expect(state.user).toEqual(user);
      expect(state.accessToken).toBe('mock-access-token');
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle user with null name', () => {
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        name: null,
        purchaseStatus: 'none',
      };

      useAuthStore.getState().setAuth(user, 'token');

      expect(useAuthStore.getState().user?.name).toBeNull();
    });
  });

  describe('clearAuth', () => {
    it('should clear all auth state', () => {
      // First set some auth state
      useAuthStore.getState().setAuth(
        { id: '1', email: 'test@example.com', name: 'Test', purchaseStatus: 'none' },
        'token'
      );

      // Then clear it
      useAuthStore.getState().clearAuth();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('setLoading', () => {
    it('should set loading state to true', () => {
      useAuthStore.getState().setLoading(true);
      expect(useAuthStore.getState().isLoading).toBe(true);
    });

    it('should set loading state to false', () => {
      useAuthStore.getState().setLoading(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('setError', () => {
    it('should set error message', () => {
      useAuthStore.getState().setError('Something went wrong');

      const state = useAuthStore.getState();
      expect(state.error).toBe('Something went wrong');
      expect(state.isLoading).toBe(false);
    });

    it('should clear error when set to null', () => {
      useAuthStore.getState().setError('Error');
      useAuthStore.getState().setError(null);

      expect(useAuthStore.getState().error).toBeNull();
    });
  });

  describe('refreshToken', () => {
    it('should update auth state on successful refresh', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              accessToken: 'new-access-token',
              user: {
                id: 'user-123',
                email: 'test@example.com',
                name: 'Test User',
                purchaseStatus: 'completed',
              },
            },
          }),
      });

      const result = await useAuthStore.getState().refreshToken();

      expect(result).toBe(true);
      expect(useAuthStore.getState().accessToken).toBe('new-access-token');
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });
    });

    it('should clear auth on failed refresh', async () => {
      // Set initial auth state
      useAuthStore.getState().setAuth(
        { id: '1', email: 'test@example.com', name: 'Test', purchaseStatus: 'none' },
        'old-token'
      );

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const result = await useAuthStore.getState().refreshToken();

      expect(result).toBe(false);
      expect(useAuthStore.getState().accessToken).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await useAuthStore.getState().refreshToken();

      expect(result).toBe(false);
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe('logout', () => {
    it('should clear auth state after logout', async () => {
      // Set initial auth state
      useAuthStore.getState().setAuth(
        { id: '1', email: 'test@example.com', name: 'Test', purchaseStatus: 'none' },
        'token'
      );

      mockFetch.mockResolvedValueOnce({ ok: true });

      await useAuthStore.getState().logout();

      expect(useAuthStore.getState().accessToken).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    });

    it('should clear auth even if logout request fails', async () => {
      useAuthStore.getState().setAuth(
        { id: '1', email: 'test@example.com', name: 'Test', purchaseStatus: 'none' },
        'token'
      );

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await useAuthStore.getState().logout();

      // Should still clear local state
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe('helper functions', () => {
    it('getAccessToken should return current token', () => {
      useAuthStore.getState().setAuth(
        { id: '1', email: 'test@example.com', name: 'Test', purchaseStatus: 'none' },
        'my-token'
      );

      expect(getAccessToken()).toBe('my-token');
    });

    it('getAccessToken should return null when not authenticated', () => {
      expect(getAccessToken()).toBeNull();
    });

    it('isAuthenticated should return true when logged in', () => {
      useAuthStore.getState().setAuth(
        { id: '1', email: 'test@example.com', name: 'Test', purchaseStatus: 'none' },
        'token'
      );

      expect(isAuthenticated()).toBe(true);
    });

    it('isAuthenticated should return false when not logged in', () => {
      expect(isAuthenticated()).toBe(false);
    });

    it('getCurrentUser should return user when authenticated', () => {
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        purchaseStatus: 'completed',
      };
      useAuthStore.getState().setAuth(user, 'token');

      expect(getCurrentUser()).toEqual(user);
    });

    it('getCurrentUser should return null when not authenticated', () => {
      expect(getCurrentUser()).toBeNull();
    });
  });
});
