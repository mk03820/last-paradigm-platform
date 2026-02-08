'use client';

/**
 * PDF Export Button Component
 *
 * Triggers PDF generation and download of meeting waste analysis.
 * Uses @react-pdf/renderer to generate PDF client-side.
 *
 * Features:
 * - Loading spinner during generation
 * - Disabled state during generation
 * - Error handling for generation failures
 * - Automatic download trigger
 *
 * Covers: FR21 (PDF export), FR28 (board-room quality)
 * AC: 2, 3, 4 (download, <5s generation, loading state)
 */

import { useState, useCallback } from 'react';
import { pdf } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { PdfDocument } from './PdfDocument';
import type { CalculationResult } from '@/types/calculator.types';

interface PdfExportButtonProps {
  /** Calculation results to include in the PDF */
  results: CalculationResult;
  /** Optional custom button text */
  buttonText?: string;
  /** Optional CSS class for styling */
  className?: string;
}

/**
 * Generates a filename with the current date
 */
function generateFilename(): string {
  const date = new Date().toISOString().split('T')[0];
  return `meeting-waste-analysis-${date}.pdf`;
}

/**
 * PDF Export Button
 *
 * Renders a button that, when clicked:
 * 1. Shows loading state
 * 2. Generates PDF using @react-pdf/renderer
 * 3. Creates download link
 * 4. Triggers automatic download
 * 5. Cleans up resources
 */
export function PdfExportButton({
  results,
  buttonText = 'Export PDF',
  className,
}: PdfExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = useCallback(async () => {
    // Reset error state
    setError(null);
    setIsGenerating(true);

    try {
      // Generate PDF blob
      const blob = await pdf(<PdfDocument results={results} />).toBlob();

      // Create download URL
      const url = URL.createObjectURL(blob);

      // Create temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = generateFilename();

      // Trigger download
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
  }, [results]);

  return (
    <div className={className}>
      <Button
        onClick={handleExport}
        disabled={isGenerating}
        size="lg"
        aria-busy={isGenerating}
        aria-describedby={error ? 'pdf-error' : undefined}
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
        <p id="pdf-error" className="text-sm text-destructive mt-2" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Loading Spinner Icon
 * Animated spinner shown during PDF generation
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
 * Static icon shown when button is ready
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
