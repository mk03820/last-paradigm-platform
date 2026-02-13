/**
 * Diagnostic PDF Export Button Component
 *
 * Button that triggers generation and download of the Complete Diagnostic PDF.
 * Uses @react-pdf/renderer for client-side PDF generation.
 *
 * Story 14.6: Complete Diagnostic PDF Export
 * Covers: FR2-36 (Generate in <10 seconds)
 */

'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import type {
  AlignmentTaxResult,
  AggregatedToolData,
  ROIResult,
} from '../cost-constants';

export interface DiagnosticPDFExportProps {
  /** Alignment tax calculation result */
  result: AlignmentTaxResult;
  /** Aggregated data from all diagnostic tools */
  aggregatedData: AggregatedToolData;
  /** Organization name (optional) */
  organizationName?: string;
  /** ROI calculation results (optional) */
  roiResults?: ROIResult[];
  /** Investment amount for ROI (optional) */
  investment?: number;
  /** Custom button text */
  buttonText?: string;
  /** Optional CSS class */
  className?: string;
  /** Button variant */
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  /** Button size */
  size?: 'default' | 'sm' | 'lg';
  /** Disabled state */
  disabled?: boolean;
}

/**
 * Generate filename with date
 */
function generateFilename(organizationName?: string): string {
  const date = new Date().toISOString().split('T')[0];
  const baseName = organizationName
    ? `${organizationName.toLowerCase().replace(/\s+/g, '-')}-alignment-diagnostic`
    : 'alignment-diagnostic';
  return `${baseName}-${date}.pdf`;
}

/**
 * Diagnostic PDF Export Button
 *
 * Features:
 * - Loading state with spinner during generation
 * - Error handling and display
 * - Automatic file download
 * - Performance tracking (< 10 second target)
 */
export function DiagnosticPDFExport({
  result,
  aggregatedData,
  organizationName,
  roiResults,
  investment,
  buttonText = 'Export Full Report',
  className,
  variant = 'default',
  size = 'lg',
  disabled = false,
}: DiagnosticPDFExportProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationTime, setGenerationTime] = useState<number | null>(null);

  const handleExport = useCallback(async () => {
    setError(null);
    setIsGenerating(true);
    const startTime = performance.now();

    try {
      // Dynamic import for client-side PDF generation
      const [{ pdf }, { DiagnosticPDFDocument }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('./DiagnosticPDFDocument'),
      ]);

      // Generate PDF blob
      const blob = await pdf(
        <DiagnosticPDFDocument
          result={result}
          aggregatedData={aggregatedData}
          organizationName={organizationName}
          roiResults={roiResults}
          investment={investment}
        />
      ).toBlob();

      // Track generation time
      const endTime = performance.now();
      const duration = endTime - startTime;
      setGenerationTime(duration);

      // Log if exceeds target
      if (duration > 10000) {
        console.warn(
          `[DiagnosticPDFExport] Generation took ${(duration / 1000).toFixed(
            1
          )}s (exceeds 10s target)`
        );
      }

      // Create download URL
      const url = URL.createObjectURL(blob);

      // Create and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = generateFilename(organizationName);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF generation failed:', err);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [result, aggregatedData, organizationName, roiResults, investment]);

  return (
    <div className={className}>
      <Button
        onClick={handleExport}
        disabled={disabled || isGenerating}
        variant={variant}
        size={size}
        aria-busy={isGenerating}
        aria-describedby={error ? 'pdf-export-error' : undefined}
        className="gap-2"
      >
        {isGenerating ? (
          <>
            <LoadingSpinner />
            <span>Generating PDF...</span>
          </>
        ) : (
          <>
            <DownloadIcon />
            <span>{buttonText}</span>
          </>
        )}
      </Button>

      {error && (
        <p
          id="pdf-export-error"
          className="text-sm text-destructive mt-2"
          role="alert"
        >
          {error}
        </p>
      )}

      {/* Development: Show generation time */}
      {process.env.NODE_ENV === 'development' && generationTime !== null && (
        <p className="text-xs text-muted-foreground mt-1">
          Generated in {(generationTime / 1000).toFixed(1)}s
        </p>
      )}
    </div>
  );
}

/**
 * Loading Spinner Icon
 */
function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/**
 * Download Icon
 */
function DownloadIcon() {
  return (
    <svg
      className="h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  );
}

/**
 * Document Icon for alternative display
 */
export function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className || 'h-5 w-5'}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}
