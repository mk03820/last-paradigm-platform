'use client';

/**
 * Session Loader Component
 *
 * Loads session data from the server when an authenticated user
 * navigates to the calculator with a session query parameter.
 *
 * Covers: FR2-4 (Cross-device continuity)
 * Story 8.3: AC5 (Load session data from server)
 */

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCalculatorStore } from '@/lib/store/calculator-store';
import { Loader2 } from 'lucide-react';

export function SessionLoader() {
  const { data: authSession, status } = useSession();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { loadFromServer, sessionId, setSessionId } = useCalculatorStore();

  useEffect(() => {
    async function loadSession() {
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

        if (!success) {
          setError('Could not load session. It may not exist or you may not have access.');
        }
      } catch (err) {
        console.error('[SessionLoader] Failed to load session:', err);
        setError('Failed to load session data.');
      } finally {
        setIsLoading(false);
      }
    }

    loadSession();
  }, [searchParams, authSession, status, sessionId, loadFromServer, setSessionId]);

  // Show loading indicator while fetching session
  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 p-4 mb-4 bg-muted/50 rounded-lg">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Loading your saved progress...</span>
      </div>
    );
  }

  // Show error if loading failed
  if (error) {
    return (
      <div className="p-4 mb-4 bg-destructive/10 border border-destructive/30 rounded-lg">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  // Nothing to show when idle
  return null;
}
