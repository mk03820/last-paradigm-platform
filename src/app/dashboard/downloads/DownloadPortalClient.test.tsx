/**
 * Download Portal Client Component Tests
 *
 * Tests for the download portal client component.
 *
 * Story 18.5: Download Portal Page
 * Story 18.6: Generation Progress & Status UI
 * Story 18.7: Post-Generation Success Experience
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { DownloadPortalClient } from './DownloadPortalClient';

// Mock the useDocumentStatus hook
vi.mock('@/hooks/useDocumentStatus', () => ({
  useDocumentStatus: vi.fn(),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

import { useDocumentStatus } from '@/hooks/useDocumentStatus';

describe('DownloadPortalClient', () => {
  const mockDocuments = [
    {
      id: 'doc-1',
      documentName: 'Strategic Alignment Brief',
      documentType: 'word' as const,
      status: 'completed' as const,
      fileSizeBytes: 102400,
      errorMessage: null,
    },
    {
      id: 'doc-2',
      documentName: 'Meeting Cost Tracker',
      documentType: 'excel' as const,
      status: 'completed' as const,
      fileSizeBytes: 51200,
      errorMessage: null,
    },
    {
      id: 'doc-3',
      documentName: 'Executive Presentation',
      documentType: 'pptx' as const,
      status: 'completed' as const,
      fileSizeBytes: 204800,
      errorMessage: null,
    },
  ];

  const mockGeneratingDocuments = [
    {
      id: 'doc-1',
      documentName: 'Strategic Alignment Brief',
      documentType: 'word' as const,
      status: 'completed' as const,
      fileSizeBytes: 102400,
      errorMessage: null,
    },
    {
      id: 'doc-2',
      documentName: 'Meeting Cost Tracker',
      documentType: 'excel' as const,
      status: 'generating' as const,
      fileSizeBytes: null,
      errorMessage: null,
    },
    {
      id: 'doc-3',
      documentName: 'Executive Presentation',
      documentType: 'pptx' as const,
      status: 'pending' as const,
      fileSizeBytes: null,
      errorMessage: null,
    },
  ];

  const mockFailedDocuments = [
    {
      id: 'doc-1',
      documentName: 'Strategic Alignment Brief',
      documentType: 'word' as const,
      status: 'completed' as const,
      fileSizeBytes: 102400,
      errorMessage: null,
    },
    {
      id: 'doc-2',
      documentName: 'Meeting Cost Tracker',
      documentType: 'excel' as const,
      status: 'failed' as const,
      fileSizeBytes: null,
      errorMessage: 'Generation failed',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });

  describe('Story 18.7: Success Celebration', () => {
    it('should display success celebration when all documents are completed (AC1)', () => {
      vi.mocked(useDocumentStatus).mockReturnValue({
        documents: mockDocuments,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
        completedCount: 3,
        totalCount: 3,
        allCompleted: true,
        hasFailures: false,
      });

      render(<DownloadPortalClient initialDocuments={mockDocuments} />);

      expect(screen.getByText('Your Toolkit is Ready!')).toBeInTheDocument();
    });

    it('should display Download All button in success celebration (AC2)', () => {
      vi.mocked(useDocumentStatus).mockReturnValue({
        documents: mockDocuments,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
        completedCount: 3,
        totalCount: 3,
        allCompleted: true,
        hasFailures: false,
      });

      render(<DownloadPortalClient initialDocuments={mockDocuments} />);

      expect(screen.getByText('Download All Documents')).toBeInTheDocument();
    });

    it('should display next steps guidance when all completed (AC3, AC4)', () => {
      vi.mocked(useDocumentStatus).mockReturnValue({
        documents: mockDocuments,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
        completedCount: 3,
        totalCount: 3,
        allCompleted: true,
        hasFailures: false,
      });

      render(<DownloadPortalClient initialDocuments={mockDocuments} />);

      expect(screen.getByText('Suggested Review Order')).toBeInTheDocument();
      expect(screen.getByText('Suggested Implementation Timeline')).toBeInTheDocument();
    });
  });

  describe('Story 18.6: Generation Progress', () => {
    it('should display generating status when documents are generating (AC1, AC2)', () => {
      vi.mocked(useDocumentStatus).mockReturnValue({
        documents: mockGeneratingDocuments,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
        completedCount: 1,
        totalCount: 3,
        allCompleted: false,
        hasFailures: false,
      });

      render(<DownloadPortalClient initialDocuments={mockGeneratingDocuments} />);

      expect(screen.getByText('1 generating')).toBeInTheDocument();
      expect(screen.getByText('1 of 3 ready')).toBeInTheDocument();
    });

    it('should not show success celebration when still generating', () => {
      vi.mocked(useDocumentStatus).mockReturnValue({
        documents: mockGeneratingDocuments,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
        completedCount: 1,
        totalCount: 3,
        allCompleted: false,
        hasFailures: false,
      });

      render(<DownloadPortalClient initialDocuments={mockGeneratingDocuments} />);

      expect(screen.queryByText('Your Toolkit is Ready!')).not.toBeInTheDocument();
    });

    it('should display failed count when documents have failed (AC2)', () => {
      vi.mocked(useDocumentStatus).mockReturnValue({
        documents: mockFailedDocuments,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
        completedCount: 1,
        totalCount: 2,
        allCompleted: false,
        hasFailures: true,
      });

      render(<DownloadPortalClient initialDocuments={mockFailedDocuments} />);

      expect(screen.getByText('1 failed')).toBeInTheDocument();
    });
  });

  describe('Story 18.5: Document Categories', () => {
    it('should display documents organized by category (AC3)', () => {
      vi.mocked(useDocumentStatus).mockReturnValue({
        documents: mockDocuments,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
        completedCount: 3,
        totalCount: 3,
        allCompleted: true,
        hasFailures: false,
      });

      render(<DownloadPortalClient initialDocuments={mockDocuments} />);

      expect(screen.getByText('Strategic Documents')).toBeInTheDocument();
      expect(screen.getByText('Working Tools')).toBeInTheDocument();
      expect(screen.getByText('Presentations')).toBeInTheDocument();
    });

    it('should display document names (AC4)', () => {
      vi.mocked(useDocumentStatus).mockReturnValue({
        documents: mockDocuments,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
        completedCount: 3,
        totalCount: 3,
        allCompleted: true,
        hasFailures: false,
      });

      render(<DownloadPortalClient initialDocuments={mockDocuments} />);

      expect(screen.getByText('Strategic Alignment Brief')).toBeInTheDocument();
      expect(screen.getByText('Meeting Cost Tracker')).toBeInTheDocument();
      expect(screen.getByText('Executive Presentation')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show preparing state when no documents exist', () => {
      vi.mocked(useDocumentStatus).mockReturnValue({
        documents: [],
        isLoading: false,
        error: null,
        refresh: vi.fn(),
        completedCount: 0,
        totalCount: 0,
        allCompleted: false,
        hasFailures: false,
      });

      render(<DownloadPortalClient initialDocuments={[]} />);

      expect(screen.getByText('Preparing Your Toolkit')).toBeInTheDocument();
    });
  });

  describe('Retry Functionality', () => {
    it('should call retry API when retry button is clicked (AC4 - Story 18.6)', async () => {
      const mockRefresh = vi.fn();
      vi.mocked(useDocumentStatus).mockReturnValue({
        documents: mockFailedDocuments,
        isLoading: false,
        error: null,
        refresh: mockRefresh,
        completedCount: 1,
        totalCount: 2,
        allCompleted: false,
        hasFailures: true,
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      render(<DownloadPortalClient initialDocuments={mockFailedDocuments} />);

      // Find and click the retry button
      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/documents/doc-2/retry',
          expect.objectContaining({ method: 'POST' })
        );
      });
    });
  });

  describe('Download All', () => {
    it('should show Download All button when documents are ready but not all completed', () => {
      vi.mocked(useDocumentStatus).mockReturnValue({
        documents: mockGeneratingDocuments,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
        completedCount: 1,
        totalCount: 3,
        allCompleted: false,
        hasFailures: false,
      });

      render(<DownloadPortalClient initialDocuments={mockGeneratingDocuments} />);

      // Should show the separate Download All button (not the celebration one)
      expect(screen.getByText(/Download All/)).toBeInTheDocument();
    });
  });
});
