/**
 * useDocumentStatus Hook
 *
 * Custom hook for polling document generation status.
 *
 * Story 18.6: Generation Progress & Status UI
 * Task 3: Create useDocumentStatus hook
 * Covers: AC1 (polling-based status updates)
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { DownloadableDocument } from '@/lib/services/download-service';

interface UseDocumentStatusOptions {
  pollingInterval?: number;
  enabled?: boolean;
}

interface UseDocumentStatusReturn {
  documents: DownloadableDocument[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  completedCount: number;
  totalCount: number;
  allCompleted: boolean;
  hasFailures: boolean;
}

const DEFAULT_POLLING_INTERVAL = 5000;

export function useDocumentStatus(
  options: UseDocumentStatusOptions = {}
): UseDocumentStatusReturn {
  const { pollingInterval = DEFAULT_POLLING_INTERVAL, enabled = true } = options;

  const [documents, setDocuments] = useState<DownloadableDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      const response = await fetch('/api/toolkit/status');

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch document status');
      }

      const data = await response.json();
      setDocuments(data.documents || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch status');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await fetchDocuments();
  }, [fetchDocuments]);

  useEffect(() => {
    if (!enabled) return;

    fetchDocuments();

    intervalRef.current = setInterval(fetchDocuments, pollingInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, pollingInterval, fetchDocuments]);

  const completedCount = documents.filter((d) => d.status === 'completed').length;
  const totalCount = documents.length;
  const allCompleted = completedCount === totalCount && totalCount > 0;
  const hasFailures = documents.some((d) => d.status === 'failed');

  return {
    documents,
    isLoading,
    error,
    refresh,
    completedCount,
    totalCount,
    allCompleted,
    hasFailures,
  };
}

export default useDocumentStatus;
