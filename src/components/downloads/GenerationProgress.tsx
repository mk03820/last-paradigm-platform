/**
 * Generation Progress Component
 *
 * Displays real-time document generation progress with polling.
 *
 * Story 18.6: Generation Progress & Status UI
 * Task 1: Create GenerationProgress component
 * Covers: AC1-3 (progress display, status indicators)
 */

'use client';

import { useDocumentStatus } from '@/hooks/useDocumentStatus';
import { Progress } from '@/components/ui/progress';
import { DocumentCard } from './DocumentCard';
import { CheckCircle2, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GenerationProgressProps {
  onRetry?: (documentId: string) => void;
  className?: string;
}

export function GenerationProgress({ onRetry, className }: GenerationProgressProps) {
  const {
    documents,
    isLoading,
    error,
    refresh,
    completedCount,
    totalCount,
    allCompleted,
    hasFailures,
  } = useDocumentStatus();

  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const generatingCount = documents.filter((d) => d.status === 'generating').length;
  const pendingCount = documents.filter((d) => d.status === 'pending').length;
  const failedCount = documents.filter((d) => d.status === 'failed').length;

  if (isLoading && documents.length === 0) {
    return (
      <div className={cn('flex items-center justify-center py-8', className)}>
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        <span className="ml-3 text-slate-600">Loading document status...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('flex flex-col items-center py-8', className)}>
        <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
        <p className="text-red-600 mb-4">{error}</p>
        <Button variant="outline" onClick={refresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Progress Summary */}
      <div className="bg-slate-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Generation Progress</h3>
          <Button variant="ghost" size="sm" onClick={refresh} disabled={isLoading}>
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </Button>
        </div>

        {/* Progress Bar */}
        <Progress value={progressPercentage} className="h-3 mb-4" />

        {/* Status Summary */}
        <div className="flex flex-wrap gap-4 text-sm">
          {allCompleted ? (
            <span className="flex items-center gap-2 text-green-600 font-medium">
              <CheckCircle2 className="h-4 w-4" />
              All {totalCount} documents complete
            </span>
          ) : (
            <>
              <span className="text-slate-600">
                {completedCount} of {totalCount} complete
              </span>
              {generatingCount > 0 && (
                <span className="flex items-center gap-1 text-amber-600">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {generatingCount} generating
                </span>
              )}
              {pendingCount > 0 && (
                <span className="text-slate-400">{pendingCount} pending</span>
              )}
              {failedCount > 0 && (
                <span className="text-red-600">{failedCount} failed</span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Individual Document Status */}
      <div className="space-y-3">
        {documents.map((doc) => (
          <DocumentCard
            key={doc.id}
            id={doc.id}
            documentName={doc.documentName}
            documentType={doc.documentType}
            status={doc.status}
            fileSizeBytes={doc.fileSizeBytes}
            errorMessage={doc.errorMessage}
            onRetry={onRetry}
          />
        ))}
      </div>
    </div>
  );
}

export default GenerationProgress;
