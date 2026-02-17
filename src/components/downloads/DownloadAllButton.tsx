/**
 * Download All Button Component
 *
 * Downloads all completed documents as a ZIP archive.
 *
 * Story 18.5: Download Portal Page
 * Task 4.3: Create DownloadAllButton component
 * Covers: AC6 (Download All option)
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Package } from 'lucide-react';

interface DownloadAllButtonProps {
  /** Number of completed documents available */
  completedCount: number;
  /** Total number of documents */
  totalCount: number;
  /** Whether generation is still in progress */
  isGenerating: boolean;
  /** Whether any documents have failed */
  hasFailed: boolean;
}

export function DownloadAllButton({
  completedCount,
  totalCount,
  isGenerating,
  hasFailed,
}: DownloadAllButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allCompleted = completedCount === totalCount;
  const anyCompleted = completedCount > 0;

  const handleDownloadAll = async () => {
    setIsDownloading(true);
    setError(null);

    try {
      const response = await fetch('/api/downloads/all');

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Download failed');
      }

      const data = await response.json();

      if (data.zipUrl) {
        // Download ZIP file
        window.open(data.zipUrl, '_blank');
      } else if (data.urls) {
        // Sequential download fallback
        for (const { url, fileName } of data.urls) {
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;
          link.click();
          // Small delay between downloads
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setIsDownloading(false);
    }
  };

  // Don't show if no documents are completed
  if (!anyCompleted) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        onClick={handleDownloadAll}
        disabled={isDownloading || !anyCompleted}
        size="lg"
        className="gap-2"
      >
        {isDownloading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Preparing Download...
          </>
        ) : (
          <>
            <Package className="h-5 w-5" />
            Download All ({completedCount} files)
          </>
        )}
      </Button>

      {/* Status indicators */}
      {isGenerating && !allCompleted && (
        <p className="text-sm text-amber-600">
          {totalCount - completedCount} documents still generating...
        </p>
      )}

      {hasFailed && (
        <p className="text-sm text-red-600">
          Some documents failed to generate. Download available files or retry
          failed documents.
        </p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
