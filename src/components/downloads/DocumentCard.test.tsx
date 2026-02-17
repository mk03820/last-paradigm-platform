/**
 * DocumentCard Component Tests
 *
 * Tests for the individual document card component.
 *
 * Story 18.5: Download Portal Page
 * Task 2.2: Tests for DocumentCard component
 * Covers: AC4 (file information display), AC5 (download functionality)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DocumentCard } from './DocumentCard';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock window.open
const mockOpen = vi.fn();
global.open = mockOpen;

describe('DocumentCard', () => {
  const defaultProps = {
    id: 'doc-123',
    documentName: 'Strategic Alignment Brief',
    documentType: 'word' as const,
    status: 'completed' as const,
    fileSizeBytes: 102400, // 100 KB
    errorMessage: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          url: 'https://s3.example.com/download',
          fileName: 'Strategic_Alignment_Brief.docx',
        }),
    });
  });

  describe('Document Information Display (AC4)', () => {
    it('should display document name', () => {
      render(<DocumentCard {...defaultProps} />);

      expect(screen.getByText('Strategic Alignment Brief')).toBeInTheDocument();
    });

    it('should display file extension badge for Word', () => {
      render(<DocumentCard {...defaultProps} documentType="word" />);

      expect(screen.getByText('DOCX')).toBeInTheDocument();
    });

    it('should display file extension badge for Excel', () => {
      render(<DocumentCard {...defaultProps} documentType="excel" />);

      expect(screen.getByText('XLSX')).toBeInTheDocument();
    });

    it('should display file extension badge for PowerPoint', () => {
      render(<DocumentCard {...defaultProps} documentType="pptx" />);

      expect(screen.getByText('PPTX')).toBeInTheDocument();
    });

    it('should display file extension badge for PDF', () => {
      render(<DocumentCard {...defaultProps} documentType="pdf" />);

      expect(screen.getByText('PDF')).toBeInTheDocument();
    });

    it('should display file size for completed documents', () => {
      render(<DocumentCard {...defaultProps} fileSizeBytes={102400} />);

      expect(screen.getByText('100.0 KB')).toBeInTheDocument();
    });

    it('should display document description', () => {
      render(<DocumentCard {...defaultProps} />);

      // The component should show a description from DOCUMENT_DESCRIPTIONS
      expect(
        screen.getByText(/Executive summary|Document from your Playbook 2/i)
      ).toBeInTheDocument();
    });
  });

  describe('Status Display', () => {
    it('should display waiting status for pending documents', () => {
      render(<DocumentCard {...defaultProps} status="pending" />);

      expect(screen.getByText('Waiting to generate')).toBeInTheDocument();
    });

    it('should display generating status with spinner', () => {
      render(<DocumentCard {...defaultProps} status="generating" />);

      expect(screen.getByText('Generating...')).toBeInTheDocument();
    });

    it('should display failed status', () => {
      render(<DocumentCard {...defaultProps} status="failed" />);

      expect(screen.getByText('Generation failed')).toBeInTheDocument();
    });

    it('should display error message for failed documents', () => {
      render(
        <DocumentCard
          {...defaultProps}
          status="failed"
          errorMessage="Timeout during generation"
        />
      );

      expect(screen.getByText('Timeout during generation')).toBeInTheDocument();
    });

    it('should not display file size for non-completed documents', () => {
      render(
        <DocumentCard
          {...defaultProps}
          status="generating"
          fileSizeBytes={null}
        />
      );

      // File size should not be displayed
      expect(screen.queryByText(/KB|MB/)).not.toBeInTheDocument();
    });
  });

  describe('Download Functionality (AC5)', () => {
    it('should display download button for completed documents', () => {
      render(<DocumentCard {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: /download/i })
      ).toBeInTheDocument();
    });

    it('should not display download button for pending documents', () => {
      render(<DocumentCard {...defaultProps} status="pending" />);

      expect(
        screen.queryByRole('button', { name: /download/i })
      ).not.toBeInTheDocument();
    });

    it('should not display download button for generating documents', () => {
      render(<DocumentCard {...defaultProps} status="generating" />);

      expect(
        screen.queryByRole('button', { name: /download/i })
      ).not.toBeInTheDocument();
    });

    it('should not display download button for failed documents', () => {
      render(<DocumentCard {...defaultProps} status="failed" />);

      expect(
        screen.queryByRole('button', { name: /download/i })
      ).not.toBeInTheDocument();
    });

    it('should fetch download URL when download button is clicked', async () => {
      render(<DocumentCard {...defaultProps} />);

      const downloadButton = screen.getByRole('button', { name: /download/i });
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/downloads/doc-123');
      });
    });

    it('should open download URL in new window', async () => {
      render(<DocumentCard {...defaultProps} />);

      const downloadButton = screen.getByRole('button', { name: /download/i });
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(mockOpen).toHaveBeenCalledWith(
          'https://s3.example.com/download',
          '_blank'
        );
      });
    });

    it('should show loading state while downloading', async () => {
      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () =>
                    Promise.resolve({
                      success: true,
                      url: 'https://s3.example.com/download',
                    }),
                }),
              100
            )
          )
      );

      render(<DocumentCard {...defaultProps} />);

      const downloadButton = screen.getByRole('button', { name: /download/i });
      fireEvent.click(downloadButton);

      // Button should be disabled during download
      expect(downloadButton).toBeDisabled();
    });

    it('should display error when download fails', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Access denied' }),
      });

      render(<DocumentCard {...defaultProps} />);

      const downloadButton = screen.getByRole('button', { name: /download/i });
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(screen.getByText('Access denied')).toBeInTheDocument();
      });
    });

    it('should display generic error for network failures', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      render(<DocumentCard {...defaultProps} />);

      const downloadButton = screen.getByRole('button', { name: /download/i });
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });
  });

  describe('Retry Functionality', () => {
    it('should display retry button for failed documents with onRetry', () => {
      const mockOnRetry = vi.fn();
      render(
        <DocumentCard {...defaultProps} status="failed" onRetry={mockOnRetry} />
      );

      expect(
        screen.getByRole('button', { name: /retry/i })
      ).toBeInTheDocument();
    });

    it('should not display retry button for failed documents without onRetry', () => {
      render(<DocumentCard {...defaultProps} status="failed" />);

      expect(
        screen.queryByRole('button', { name: /retry/i })
      ).not.toBeInTheDocument();
    });

    it('should call onRetry with document ID when retry is clicked', () => {
      const mockOnRetry = vi.fn();
      render(
        <DocumentCard {...defaultProps} status="failed" onRetry={mockOnRetry} />
      );

      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryButton);

      expect(mockOnRetry).toHaveBeenCalledWith('doc-123');
    });
  });

  describe('Document Type Styling', () => {
    it('should apply blue color for Word documents', () => {
      render(<DocumentCard {...defaultProps} documentType="word" />);

      const badge = screen.getByText('DOCX');
      expect(badge).toHaveClass('text-blue-600');
    });

    it('should apply green color for Excel documents', () => {
      render(<DocumentCard {...defaultProps} documentType="excel" />);

      const badge = screen.getByText('XLSX');
      expect(badge).toHaveClass('text-green-600');
    });

    it('should apply orange color for PowerPoint documents', () => {
      render(<DocumentCard {...defaultProps} documentType="pptx" />);

      const badge = screen.getByText('PPTX');
      expect(badge).toHaveClass('text-orange-600');
    });

    it('should apply red color for PDF documents', () => {
      render(<DocumentCard {...defaultProps} documentType="pdf" />);

      const badge = screen.getByText('PDF');
      expect(badge).toHaveClass('text-red-600');
    });
  });

  describe('Failed State Styling', () => {
    it('should apply error styling for failed documents', () => {
      const { container } = render(
        <DocumentCard {...defaultProps} status="failed" />
      );

      // Card should have red border
      const card = container.querySelector('[class*="border-red"]');
      expect(card).toBeInTheDocument();
    });

    it('should apply error background for failed documents', () => {
      const { container } = render(
        <DocumentCard {...defaultProps} status="failed" />
      );

      // Card should have red background
      const card = container.querySelector('[class*="bg-red"]');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Generating State', () => {
    it('should show disabled button while generating', () => {
      render(<DocumentCard {...defaultProps} status="generating" />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should show spinner icon while generating', () => {
      render(<DocumentCard {...defaultProps} status="generating" />);

      // Find the button with spinning animation
      const button = screen.getByRole('button');
      const spinner = button.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible download button label', () => {
      render(<DocumentCard {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: /download strategic alignment brief/i })
      ).toBeInTheDocument();
    });

    it('should have accessible retry button label', () => {
      const mockOnRetry = vi.fn();
      render(
        <DocumentCard {...defaultProps} status="failed" onRetry={mockOnRetry} />
      );

      expect(
        screen.getByRole('button', { name: /retry generating strategic alignment brief/i })
      ).toBeInTheDocument();
    });

    it('should hide icon from screen readers', () => {
      render(<DocumentCard {...defaultProps} />);

      const icons = document.querySelectorAll('[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('File Size Formatting', () => {
    it('should format bytes correctly', () => {
      render(<DocumentCard {...defaultProps} fileSizeBytes={500} />);
      expect(screen.getByText('500 B')).toBeInTheDocument();
    });

    it('should format kilobytes correctly', () => {
      render(<DocumentCard {...defaultProps} fileSizeBytes={5120} />);
      expect(screen.getByText('5.0 KB')).toBeInTheDocument();
    });

    it('should format megabytes correctly', () => {
      render(<DocumentCard {...defaultProps} fileSizeBytes={5242880} />);
      expect(screen.getByText('5.0 MB')).toBeInTheDocument();
    });

    it('should show unknown for null file size', () => {
      render(<DocumentCard {...defaultProps} fileSizeBytes={null} status="generating" />);
      // File size is only shown for completed status
      expect(screen.queryByText(/Unknown/)).not.toBeInTheDocument();
    });
  });
});
