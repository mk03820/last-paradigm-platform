/**
 * PB1 Migration Hook
 *
 * React hook for migrating PB1 session data to the database after registration.
 * Handles data collection, API calls, error handling, and session cleanup.
 *
 * Story 15.7: PB1 Data Migration to Database
 * Task 4: Create Migration Hook/Service
 *
 * Covers: AC1 (Migrate all 7 tools), AC4 (Clear session after success),
 *         AC5 (Error handling with retry), AC6 (Redirect to preview)
 */

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { collectAllToolData, toSessionData, type PB1CollectedData } from './collect-pb1-data';
import { transformPB1ToPB2 } from './transform-pb1-to-pb2';
import { clearAllPB1Stores, hasPB1SessionData } from './clear-pb1-session';
import type { PartialToolkitGenerationContext } from '@/types/toolkit.types';

// ============================================================================
// Types
// ============================================================================

/**
 * Migration status states
 */
export type MigrationStatus =
  | 'idle'
  | 'collecting'
  | 'transforming'
  | 'migrating'
  | 'clearing'
  | 'success'
  | 'error';

/**
 * Migration error details
 */
export interface MigrationError {
  code: string;
  message: string;
  retryable: boolean;
}

/**
 * Migration result
 */
export interface MigrationResult {
  success: boolean;
  diagnosticResultId?: string;
  toolkitContext?: PartialToolkitGenerationContext;
  error?: MigrationError;
}

/**
 * Hook state
 */
export interface UsePB1MigrationState {
  status: MigrationStatus;
  error: MigrationError | null;
  isLoading: boolean;
  progress: number;
  collectedData: PB1CollectedData | null;
  diagnosticResultId: string | null;
}

/**
 * Hook actions
 */
export interface UsePB1MigrationActions {
  /** Execute full migration flow */
  migrate: (accessToken: string) => Promise<MigrationResult>;
  /** Retry failed migration */
  retry: (accessToken: string) => Promise<MigrationResult>;
  /** Reset hook state */
  reset: () => void;
  /** Check if session has data to migrate */
  checkHasData: () => boolean;
  /** Collect data without migrating (for preview) */
  collectOnly: () => PB1CollectedData;
}

/**
 * Hook return type
 */
export type UsePB1MigrationReturn = UsePB1MigrationState & UsePB1MigrationActions;

// ============================================================================
// Constants
// ============================================================================

/** Base delay for exponential backoff (ms) */
const BASE_RETRY_DELAY = 1000;

/** Maximum retry attempts */
const MAX_RETRIES = 3;

/** Progress percentages for each stage */
const PROGRESS = {
  collecting: 20,
  transforming: 40,
  migrating: 70,
  clearing: 90,
  success: 100,
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay
 */
function getBackoffDelay(attempt: number): number {
  return BASE_RETRY_DELAY * Math.pow(2, attempt);
}

/**
 * Parse error from API response or exception
 */
function parseError(error: unknown): MigrationError {
  if (error instanceof Error) {
    // Network errors are retryable
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Network error. Please check your connection.',
        retryable: true,
      };
    }
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message,
      retryable: false,
    };
  }

  // API error response
  if (typeof error === 'object' && error !== null) {
    const apiError = error as { code?: string; message?: string };
    const retryableCodes = ['SERVER_ERROR', 'TIMEOUT', 'RATE_LIMITED'];
    return {
      code: apiError.code || 'UNKNOWN_ERROR',
      message: apiError.message || 'An unexpected error occurred.',
      retryable: retryableCodes.includes(apiError.code || ''),
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred.',
    retryable: false,
  };
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook for managing PB1 data migration to database
 *
 * @param options - Hook configuration options
 * @returns State and actions for migration
 *
 * @example
 * ```tsx
 * const { migrate, isLoading, error, status } = usePB1Migration();
 *
 * const handleRegister = async () => {
 *   // After successful registration...
 *   const result = await migrate(accessToken);
 *   if (result.success) {
 *     // User is redirected to /preview automatically
 *   } else {
 *     // Show error, offer retry
 *   }
 * };
 * ```
 */
export function usePB1Migration(options?: {
  /** Redirect path on success (default: /preview) */
  redirectTo?: string;
  /** Skip redirect after success */
  skipRedirect?: boolean;
  /** Callback on success */
  onSuccess?: (result: MigrationResult) => void;
  /** Callback on error */
  onError?: (error: MigrationError) => void;
}): UsePB1MigrationReturn {
  const router = useRouter();
  const redirectTo = options?.redirectTo ?? '/preview';
  const skipRedirect = options?.skipRedirect ?? false;

  // State
  const [status, setStatus] = useState<MigrationStatus>('idle');
  const [error, setError] = useState<MigrationError | null>(null);
  const [progress, setProgress] = useState(0);
  const [collectedData, setCollectedData] = useState<PB1CollectedData | null>(null);
  const [diagnosticResultId, setDiagnosticResultId] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Computed
  const isLoading = ['collecting', 'transforming', 'migrating', 'clearing'].includes(status);

  /**
   * Reset hook state
   */
  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
    setProgress(0);
    setCollectedData(null);
    setDiagnosticResultId(null);
    setRetryCount(0);
  }, []);

  /**
   * Check if session has data to migrate
   */
  const checkHasData = useCallback((): boolean => {
    return hasPB1SessionData();
  }, []);

  /**
   * Collect data without migrating
   */
  const collectOnly = useCallback((): PB1CollectedData => {
    return collectAllToolData();
  }, []);

  /**
   * Execute migration
   */
  const executeMigration = useCallback(
    async (accessToken: string, attempt: number = 0): Promise<MigrationResult> => {
      try {
        // Stage 1: Collect data
        setStatus('collecting');
        setProgress(PROGRESS.collecting);

        const collected = collectAllToolData();
        setCollectedData(collected);

        if (!collected.hasData) {
          // No data to migrate - this is actually success (nothing to do)
          setStatus('success');
          setProgress(PROGRESS.success);

          const result: MigrationResult = {
            success: true,
            diagnosticResultId: undefined,
          };

          if (!skipRedirect) {
            router.push(redirectTo);
          }

          options?.onSuccess?.(result);
          return result;
        }

        // Stage 2: Transform to PB2 context
        setStatus('transforming');
        setProgress(PROGRESS.transforming);

        const sessionData = toSessionData(collected);
        // Note: We don't use the toolkit context here, but it's available for future use
        // const _toolkitContext = transformPB1ToPB2('pending', collected);

        // Stage 3: Call migration API
        setStatus('migrating');
        setProgress(PROGRESS.migrating);

        const response = await fetch('/api/user/migrate-pb1', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            sessionData: {
              ...sessionData,
              totalAlignmentTax: collected.totalAlignmentTax,
              estimatedSavings: collected.estimatedSavings,
              completedAt: new Date().toISOString(),
            },
          }),
        });

        const responseData = await response.json();

        if (!response.ok || !responseData.success) {
          const apiError = parseError(responseData.error || {});

          // Retry if retryable and under limit
          if (apiError.retryable && attempt < MAX_RETRIES) {
            setRetryCount(attempt + 1);
            await sleep(getBackoffDelay(attempt));
            return executeMigration(accessToken, attempt + 1);
          }

          throw responseData.error || { code: 'MIGRATION_FAILED', message: 'Migration failed' };
        }

        const resultId = responseData.data?.diagnosticResultId;
        setDiagnosticResultId(resultId);

        // Stage 4: Clear session storage
        setStatus('clearing');
        setProgress(PROGRESS.clearing);

        const clearResult = clearAllPB1Stores();
        if (!clearResult.success) {
          console.warn('[usePB1Migration] Some stores failed to clear:', clearResult.errors);
          // Don't fail migration for cleanup errors
        }

        // Success!
        setStatus('success');
        setProgress(PROGRESS.success);
        setError(null);

        const result: MigrationResult = {
          success: true,
          diagnosticResultId: resultId,
        };

        if (!skipRedirect) {
          router.push(redirectTo);
        }

        options?.onSuccess?.(result);
        return result;
      } catch (err) {
        const migrationError = parseError(err);
        setStatus('error');
        setError(migrationError);

        options?.onError?.(migrationError);

        return {
          success: false,
          error: migrationError,
        };
      }
    },
    [router, redirectTo, skipRedirect, options]
  );

  /**
   * Start migration
   */
  const migrate = useCallback(
    async (accessToken: string): Promise<MigrationResult> => {
      reset();
      return executeMigration(accessToken, 0);
    },
    [reset, executeMigration]
  );

  /**
   * Retry failed migration
   */
  const retry = useCallback(
    async (accessToken: string): Promise<MigrationResult> => {
      if (status !== 'error') {
        return {
          success: false,
          error: {
            code: 'INVALID_STATE',
            message: 'Can only retry after an error',
            retryable: false,
          },
        };
      }

      setError(null);
      return executeMigration(accessToken, retryCount);
    },
    [status, retryCount, executeMigration]
  );

  return {
    // State
    status,
    error,
    isLoading,
    progress,
    collectedData,
    diagnosticResultId,
    // Actions
    migrate,
    retry,
    reset,
    checkHasData,
    collectOnly,
  };
}

/**
 * Standalone migration function for non-React contexts
 *
 * @param accessToken - Valid access token for authenticated user
 * @param options - Migration options
 * @returns Promise resolving to migration result
 */
export async function migratePB1DataStandalone(
  accessToken: string,
  options?: {
    clearSession?: boolean;
  }
): Promise<MigrationResult> {
  try {
    // Collect data
    const collected = collectAllToolData();

    if (!collected.hasData) {
      return { success: true };
    }

    const sessionData = toSessionData(collected);

    // Call API
    const response = await fetch('/api/user/migrate-pb1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        sessionData: {
          ...sessionData,
          totalAlignmentTax: collected.totalAlignmentTax,
          estimatedSavings: collected.estimatedSavings,
          completedAt: new Date().toISOString(),
        },
      }),
    });

    const responseData = await response.json();

    if (!response.ok || !responseData.success) {
      return {
        success: false,
        error: parseError(responseData.error || {}),
      };
    }

    // Clear session if requested
    if (options?.clearSession !== false) {
      clearAllPB1Stores();
    }

    return {
      success: true,
      diagnosticResultId: responseData.data?.diagnosticResultId,
    };
  } catch (error) {
    return {
      success: false,
      error: parseError(error),
    };
  }
}
