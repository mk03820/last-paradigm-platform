'use client';

/**
 * Diagnostic Session Loader Component
 *
 * Generic session loader that works with any tool store implementing
 * the SessionSyncStore interface. Loads session data from the server
 * when a session query parameter is present in the URL.
 *
 * C3-S2: Shared component for session persistence across all tools
 * Covers: FR2-4 (Cross-device continuity)
 */

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

/**
 * Interface for stores that support session sync
 * Tool stores must implement this interface to work with DiagnosticSessionLoader
 */
export interface SessionSyncStore {
  /** Current server session ID (null for anonymous users) */
  sessionId: string | null;
  /** Set the session ID */
  setSessionId: (id: string | null) => void;
  /** Load data from server session - returns true on success */
  loadFromServer: (sessionId: string) => Promise<boolean>;
}

/**
 * Props for DiagnosticSessionLoader
 */
export interface DiagnosticSessionLoaderProps {
  /**
   * The store hook to use for loading session data.
   * Must return an object implementing SessionSyncStore interface.
   */
  useStore: () => SessionSyncStore;
  /** Tool number (1-7) for logging purposes */
  toolNumber: number;
  /** Optional callback when session load completes */
  onLoadComplete?: (success: boolean) => void;
  /** Optional callback when session load fails */
  onLoadError?: (error: string) => void;
}

/**
 * Generic session loader component for diagnostic tools
 *
 * @example
 * ```tsx
 * // In a tool page:
 * import { useTool1Store } from '@/lib/store/tool1-store';
 *
 * <DiagnosticSessionLoader
 *   useStore={useTool1Store}
 *   toolNumber={1}
 * />
 * ```
 */
export function DiagnosticSessionLoader({
  useStore,
  toolNumber,
  onLoadComplete,
  onLoadError,
}: DiagnosticSessionLoaderProps) {
  const { data: authSession, status } = useSession();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get store methods - the hook is called unconditionally
  const store = useStore();
  const { loadFromServer, sessionId, setSessionId } = store;

  const loadSession = useCallback(async () => {
    // Get session ID from URL
    const urlSessionId = searchParams.get('session');

    // Skip if:
    // - No session ID in URL
    // - Not authenticated
    // - Already loaded this session
    // - Auth is still loading
    if (!urlSessionId || status === 'loading' || !authSession?.user) {
      return;
    }

    if (sessionId === urlSessionId) {
      return; // Already loaded
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await loadFromServer(urlSessionId);

      if (success) {
        setSessionId(urlSessionId);
        onLoadComplete?.(true);
      } else {
        const errorMsg = 'Could not load session. It may not exist or you may not have access.';
        setError(errorMsg);
        onLoadError?.(errorMsg);
        onLoadComplete?.(false);
      }
    } catch (err) {
      console.error(`[DiagnosticSessionLoader] Tool ${toolNumber} - Failed to load session:`, err);
      const errorMsg = 'Failed to load session data.';
      setError(errorMsg);
      onLoadError?.(errorMsg);
      onLoadComplete?.(false);
    } finally {
      setIsLoading(false);
    }
  }, [
    searchParams,
    authSession,
    status,
    sessionId,
    loadFromServer,
    setSessionId,
    toolNumber,
    onLoadComplete,
    onLoadError,
  ]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // Show loading indicator while fetching session
  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center gap-2 p-4 mb-4 bg-muted/50 rounded-lg"
        role="status"
        aria-live="polite"
      >
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
        <span className="text-sm text-muted-foreground">
          Loading your saved progress...
        </span>
      </div>
    );
  }

  // Show error if loading failed
  if (error) {
    return (
      <div
        className="p-4 mb-4 bg-destructive/10 border border-destructive/30 rounded-lg"
        role="alert"
      >
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  // Nothing to show when idle
  return null;
}
