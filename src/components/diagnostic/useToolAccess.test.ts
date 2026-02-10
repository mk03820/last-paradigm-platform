/**
 * Tests for useToolAccess hook
 *
 * Story 8.5: Diagnostic Tool Hub
 * Task 8.5: Unit tests for useToolAccess hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useToolAccess } from './useToolAccess';
import type { DiagnosticTool } from './diagnostic-constants';
import { Target, Calculator } from 'lucide-react';

// Mock next-auth
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}));

import { useSession } from 'next-auth/react';

const mockUseSession = vi.mocked(useSession);

const mockToolRequiresAuth: DiagnosticTool = {
  id: 'alignment',
  number: 1,
  name: 'Organizational Alignment Assessment',
  shortName: 'Alignment',
  description: 'Score your organization across 5 alignment dimensions',
  icon: Target,
  route: '/tool/alignment',
  storeKey: 'tool1',
  anonymousAccess: false,
  estimatedMinutes: 10,
};

const mockToolAnonymousAccess: DiagnosticTool = {
  id: 'meeting-audit',
  number: 2,
  name: 'Meeting Audit Calculator',
  shortName: 'Meetings',
  description: 'Quantify the cost of unproductive meetings',
  icon: Calculator,
  route: '/calculator',
  storeKey: 'calculator',
  anonymousAccess: true,
  estimatedMinutes: 5,
};

describe('useToolAccess', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when user is authenticated', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: { user: { id: '1', email: 'test@example.com' }, expires: '' },
        status: 'authenticated',
        update: vi.fn(),
      });
    });

    it('returns isAuthenticated as true', () => {
      const { result } = renderHook(() => useToolAccess());

      expect(result.current.isAuthenticated).toBe(true);
    });

    it('returns isLoading as false', () => {
      const { result } = renderHook(() => useToolAccess());

      expect(result.current.isLoading).toBe(false);
    });

    it('allows access to tools requiring auth', () => {
      const { result } = renderHook(() => useToolAccess());

      const access = result.current.checkAccess(mockToolRequiresAuth);

      expect(access.canAccess).toBe(true);
      expect(access.requiresAuth).toBe(false);
    });

    it('allows access to anonymous-accessible tools', () => {
      const { result } = renderHook(() => useToolAccess());

      const access = result.current.checkAccess(mockToolAnonymousAccess);

      expect(access.canAccess).toBe(true);
      expect(access.requiresAuth).toBe(false);
    });
  });

  describe('when user is unauthenticated', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: vi.fn(),
      });
    });

    it('returns isAuthenticated as false', () => {
      const { result } = renderHook(() => useToolAccess());

      expect(result.current.isAuthenticated).toBe(false);
    });

    it('returns isLoading as false', () => {
      const { result } = renderHook(() => useToolAccess());

      expect(result.current.isLoading).toBe(false);
    });

    it('denies access to tools requiring auth', () => {
      const { result } = renderHook(() => useToolAccess());

      const access = result.current.checkAccess(mockToolRequiresAuth);

      expect(access.canAccess).toBe(false);
      expect(access.requiresAuth).toBe(true);
    });

    it('allows access to anonymous-accessible tools', () => {
      const { result } = renderHook(() => useToolAccess());

      const access = result.current.checkAccess(mockToolAnonymousAccess);

      expect(access.canAccess).toBe(true);
      expect(access.requiresAuth).toBe(false);
    });
  });

  describe('when session is loading', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading',
        update: vi.fn(),
      });
    });

    it('returns isLoading as true', () => {
      const { result } = renderHook(() => useToolAccess());

      expect(result.current.isLoading).toBe(true);
    });

    it('returns isAuthenticated as false while loading', () => {
      const { result } = renderHook(() => useToolAccess());

      expect(result.current.isAuthenticated).toBe(false);
    });
  });
});
