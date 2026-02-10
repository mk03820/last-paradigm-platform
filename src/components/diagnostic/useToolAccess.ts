/**
 * Hook to check tool access for authenticated/anonymous users
 *
 * Story 8.5: Diagnostic Tool Hub
 * Covers: AC6 (auth-aware access)
 */

'use client';

import { useSession } from 'next-auth/react';
import { useCallback } from 'react';
import type { DiagnosticTool } from './diagnostic-constants';

export interface ToolAccessInfo {
  canAccess: boolean;
  requiresAuth: boolean;
}

/**
 * Check if user can access a specific tool
 */
export function useToolAccess() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated' && !!session?.user;
  const isLoading = status === 'loading';

  const checkAccess = useCallback(
    (tool: DiagnosticTool): ToolAccessInfo => {
      // If tool allows anonymous access, always allow
      if (tool.anonymousAccess) {
        return { canAccess: true, requiresAuth: false };
      }

      // Otherwise, require authentication
      return {
        canAccess: isAuthenticated,
        requiresAuth: !isAuthenticated,
      };
    },
    [isAuthenticated]
  );

  return {
    checkAccess,
    isAuthenticated,
    isLoading,
  };
}
