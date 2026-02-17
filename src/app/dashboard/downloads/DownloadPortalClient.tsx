/**
 * Download Portal Client Component
 *
 * Client-side wrapper for download portal interactivity.
 *
 * Story 18.5: Download Portal Page
 * Story 18.6: Generation Progress & Status UI
 * Story 18.7: Post-Generation Success Experience
 */

'use client';

import { useState, useCallback } from 'react';
import {
  DocumentCategory,
  DownloadAllButton,
  SuccessCelebration,
  NextStepsGuidance,
} from '@/components/downloads';
import { useDocumentStatus } from '@/hooks/useDocumentStatus';
import { GenerationProgress } from '@/components/downloads';
import type { DocumentCardProps } from '@/components/downloads/DocumentCard';
import type { DocumentCategory as CategoryType } from '@/lib/services/download-service';
import { getDocumentCategory } from '@/lib/services/download-service';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DownloadPortalClientProps {
  initialDocuments: Array<{
    id: string;
    documentName: string;
    documentType: 'word' | 'excel' | 'pptx' | 'pdf';
    status: 'pending' | 'generating' | 'completed' | 'failed';
    fileSizeBytes: number | null;
    errorMessage: string | null;
  }>;
}

export function DownloadPortalClient({ initialDocuments }: DownloadPortalClientProps) {
  const [retryingId, setRetryingId] = useState<string | null>(null);

  // Use hook for polling if generation is in progress
  const hasGenerating = initialDocuments.some(
    (d) => d.status === 'generating' || d.status === 'pending'
  );

  const {
    documents: polledDocuments,
    completedCount,
    totalCount,
    allCompleted,
    hasFailures,
    refresh,
    isLoading,
  } = useDocumentStatus({
    enabled: hasGenerating,
    pollingInterval: 5000,
  });

  // Use polled documents if polling is active, otherwise use initial
  const documents = hasGenerating && polledDocuments.length > 0 ? polledDocuments : initialDocuments;

  // Recalculate counts based on current documents
  const currentCompletedCount = documents.filter((d) => d.status === 'completed').length;
  const currentGeneratingCount = documents.filter((d) => d.status === 'generating').length;
  const currentFailedCount = documents.filter((d) => d.status === 'failed').length;
  const currentTotalCount = documents.length;
  const isAllCompleted = currentCompletedCount === currentTotalCount && currentTotalCount > 0;

  // Group documents by category
  const categorizedDocs: Record<CategoryType, DocumentCardProps[]> = {
    strategic: [],
    tools: [],
    presentations: [],
  };

  documents.forEach((doc) => {
    const category = getDocumentCategory(doc.documentType);
    categorizedDocs[category].push({
      id: doc.id,
      documentName: doc.documentName,
      documentType: doc.documentType,
      status: doc.status,
      fileSizeBytes: doc.fileSizeBytes,
      errorMessage: doc.errorMessage,
    });
  });

  const handleRetry = useCallback(async (documentId: string) => {
    setRetryingId(documentId);
    try {
      const response = await fetch(`/api/documents/${documentId}/retry`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to retry document generation');
      }

      // Refresh the document list
      refresh();
    } catch (error) {
      console.error('[DownloadPortalClient] Retry failed:', error);
    } finally {
      setRetryingId(null);
    }
  }, [refresh]);

  const handleDownloadAll = useCallback(async () => {
    try {
      const response = await fetch('/api/downloads/all');
      if (!response.ok) {
        throw new Error('Failed to fetch download URLs');
      }
      const data = await response.json();
      if (data.urls) {
        // Sequential download
        for (const { url, fileName } of data.urls) {
          window.open(url, '_blank');
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
    } catch (error) {
      console.error('[DownloadPortalClient] Download all failed:', error);
    }
  }, []);

  // Empty state when no documents exist
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-12 w-12 text-slate-400 animate-spin mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Preparing Your Toolkit
        </h1>
        <p className="text-slate-600 mb-6 text-center max-w-md">
          Your documents are being generated. This typically takes 2-3 minutes.
          Refresh this page to check progress.
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Success Celebration (Story 18.7 AC1, AC2) */}
      {isAllCompleted && (
        <SuccessCelebration
          documentCount={currentTotalCount}
          onDownloadAll={handleDownloadAll}
          className="mb-8"
        />
      )}

      {/* Next Steps Guidance (Story 18.7 AC3, AC4) */}
      {isAllCompleted && <NextStepsGuidance className="mb-8" />}

      {/* Header - only show when not all completed */}
      {!isAllCompleted && (
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Your Playbook 2 Toolkit
          </h1>
          <p className="text-slate-600">
            Download your personalized documents customized with your diagnostic
            findings.
          </p>
        </div>
      )}

      {/* Status Summary - only show when not all completed */}
      {!isAllCompleted && (
        <div className="bg-slate-50 rounded-lg p-4 mb-8">
          <div className="flex items-center gap-4 flex-wrap">
            {currentGeneratingCount > 0 && (
              <span className="flex items-center gap-2 text-amber-700">
                <Loader2 className="h-4 w-4 animate-spin" />
                {currentGeneratingCount} generating
              </span>
            )}
            <span className="text-slate-600">
              {currentCompletedCount} of {currentTotalCount} ready
            </span>
            {currentFailedCount > 0 && (
              <span className="text-red-600">{currentFailedCount} failed</span>
            )}
          </div>
        </div>
      )}

      {/* Download All Button when not showing success celebration */}
      {!isAllCompleted && currentCompletedCount > 0 && (
        <div className="mb-8 flex justify-center">
          <DownloadAllButton
            completedCount={currentCompletedCount}
            totalCount={currentTotalCount}
            isGenerating={currentGeneratingCount > 0}
            hasFailed={currentFailedCount > 0}
          />
        </div>
      )}

      {/* Document Categories heading when all completed */}
      {isAllCompleted && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900">
            Your Documents
          </h2>
          <p className="text-slate-600 text-sm">
            Click any document to download, or use Download All above.
          </p>
        </div>
      )}

      {/* Document Categories */}
      <DocumentCategory
        category="strategic"
        documents={categorizedDocs.strategic}
        onRetry={handleRetry}
      />
      <DocumentCategory
        category="tools"
        documents={categorizedDocs.tools}
        onRetry={handleRetry}
      />
      <DocumentCategory
        category="presentations"
        documents={categorizedDocs.presentations}
        onRetry={handleRetry}
      />

      {/* Attribution */}
      <div className="mt-8 pt-4 border-t text-center text-sm text-slate-500">
        <p>
          Documents generated using{' '}
          <span className="font-medium">The Last Paradigm</span> methodology
        </p>
        <p className="mt-1">
          <a
            href="https://thelastparadigm.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            thelastparadigm.com
          </a>
        </p>
      </div>
    </div>
  );
}

export default DownloadPortalClient;
