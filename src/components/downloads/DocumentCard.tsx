/**
 * Document Card Component
 *
 * Displays individual document information with download functionality.
 *
 * Story 18.5: Download Portal Page
 * Task 2.2: Create DocumentCard with file info display
 * Covers: AC4 (file information display), AC5 (download functionality)
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  FileText,
  FileSpreadsheet,
  Presentation,
  FileIcon,
  Download,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import {
  DOCUMENT_DESCRIPTIONS,
  formatFileSize,
} from '@/lib/services/download-service';
import { cn } from '@/lib/utils';

export interface DocumentCardProps {
  id: string;
  documentName: string;
  documentType: 'word' | 'excel' | 'pptx' | 'pdf';
  status: 'pending' | 'generating' | 'completed' | 'failed';
  fileSizeBytes: number | null;
  errorMessage?: string | null;
  onRetry?: (documentId: string) => void;
}

/**
 * Get icon component for document type
 */
function getDocumentIcon(type: string) {
  switch (type) {
    case 'word':
      return FileText;
    case 'excel':
      return FileSpreadsheet;
    case 'pptx':
      return Presentation;
    case 'pdf':
      return FileIcon;
    default:
      return FileIcon;
  }
}

/**
 * Get color class for document type
 */
function getDocumentColor(type: string): string {
  switch (type) {
    case 'word':
      return 'text-blue-600';
    case 'excel':
      return 'text-green-600';
    case 'pptx':
      return 'text-orange-600';
    case 'pdf':
      return 'text-red-600';
    default:
      return 'text-slate-600';
  }
}

/**
 * Get file extension for document type
 */
function getFileExtension(type: string): string {
  switch (type) {
    case 'word':
      return 'DOCX';
    case 'excel':
      return 'XLSX';
    case 'pptx':
      return 'PPTX';
    case 'pdf':
      return 'PDF';
    default:
      return '';
  }
}

/**
 * Generate document slug from name for description lookup
 */
function getDocumentSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

export function DocumentCard({
  id,
  documentName,
  documentType,
  status,
  fileSizeBytes,
  errorMessage,
  onRetry,
}: DocumentCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const Icon = getDocumentIcon(documentType);
  const colorClass = getDocumentColor(documentType);
  const extension = getFileExtension(documentType);
  const slug = getDocumentSlug(documentName);
  const description = DOCUMENT_DESCRIPTIONS[slug] || 'Document from your Playbook 2 toolkit';

  const handleDownload = async () => {
    if (status !== 'completed') return;

    setIsDownloading(true);
    setDownloadError(null);

    try {
      const response = await fetch(`/api/downloads/${id}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Download failed');
      }

      const data = await response.json();

      if (data.url) {
        // Open download URL in new window
        window.open(data.url, '_blank');
      }
    } catch (error) {
      setDownloadError(
        error instanceof Error ? error.message : 'Download failed'
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry(id);
    }
  };

  return (
    <Card
      className={cn(
        'transition-shadow hover:shadow-md',
        status === 'failed' && 'border-red-200 bg-red-50'
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Document Icon */}
          <div
            className={cn(
              'flex-shrink-0 p-3 rounded-lg bg-slate-100',
              status === 'failed' && 'bg-red-100'
            )}
          >
            <Icon
              className={cn(
                'h-6 w-6',
                status === 'failed' ? 'text-red-500' : colorClass
              )}
              aria-hidden="true"
            />
          </div>

          {/* Document Info */}
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-slate-900 truncate">
                {documentName}
              </h3>
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full font-medium',
                  colorClass,
                  'bg-slate-100'
                )}
              >
                {extension}
              </span>
            </div>

            <p className="text-sm text-slate-600 mb-2 line-clamp-2">
              {description}
            </p>

            <div className="flex items-center gap-4 text-xs text-slate-500">
              {/* File Size */}
              {status === 'completed' && (
                <span>{formatFileSize(fileSizeBytes)}</span>
              )}

              {/* Status */}
              {status === 'pending' && (
                <span className="flex items-center gap-1 text-slate-400">
                  Waiting to generate
                </span>
              )}

              {status === 'generating' && (
                <span className="flex items-center gap-1 text-amber-600">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Generating...
                </span>
              )}

              {status === 'failed' && (
                <span className="flex items-center gap-1 text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  Generation failed
                </span>
              )}
            </div>

            {/* Error message */}
            {status === 'failed' && errorMessage && (
              <p className="text-xs text-red-600 mt-2">{errorMessage}</p>
            )}

            {/* Download error */}
            {downloadError && (
              <p className="text-xs text-red-600 mt-2">{downloadError}</p>
            )}
          </div>

          {/* Action Button */}
          <div className="flex-shrink-0">
            {status === 'completed' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={isDownloading}
                aria-label={`Download ${documentName}`}
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span className="sr-only md:not-sr-only md:ml-2">
                  {isDownloading ? 'Downloading...' : 'Download'}
                </span>
              </Button>
            )}

            {status === 'failed' && onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                aria-label={`Retry generating ${documentName}`}
              >
                <RefreshCw className="h-4 w-4" />
                <span className="sr-only md:not-sr-only md:ml-2">Retry</span>
              </Button>
            )}

            {status === 'generating' && (
              <Button variant="ghost" size="sm" disabled>
                <Loader2 className="h-4 w-4 animate-spin" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
