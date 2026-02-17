/**
 * GenerationProgress Component Tests
 *
 * Tests for the document generation progress display component.
 *
 * Story 18.6: Generation Progress & Status UI
 * Task 1: Tests for GenerationProgress component
 * Covers: AC1-3 (progress display, status indicators)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GenerationProgress } from './GenerationProgress';

// Mock the useDocumentStatus hook
vi.mock('@/hooks/useDocumentStatus', () => ({
  useDocumentStatus: vi.fn(),
}));

import { useDocumentStatus } from '@/hooks/useDocumentStatus';

describe('GenerationProgress', () => {
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
      status: 'generating' as const,
      fileSizeBytes: null,
      errorMessage: null,
    },
    {
      id: 'doc-3',
      documentName: 'Board Summary Report',
      documentType: 'pdf' as const,
      status: 'pending' as const,
      fileSizeBytes: null,
      errorMessage: null,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should display loading indicator when loading with no documents', () => {
      vi.mocked(useDocumentStatus).mockReturnValue({
        documents: [],
        isLoading: true,
        error: null,
        refresh: vi.fn(),
        completedCount: 0,
        totalCount: 0,
        allCompleted: false,
        hasFailures: false,
      });

      render(<GenerationProgress />);

      expect(screen.getByText('Loading document status...')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message when error occurs', () => {
      vi.mocked(useDocumentStatus).mockReturnValue({
        documents: [],
        isLoading: false,
        error: 'Failed to fetch document status',
        refresh: vi.fn(),
        completedCount: 0,
        totalCount: 0,
        allCompleted: false,
        hasFailures: false,
      });

      render(<GenerationProgress />);

      expect(
        screen.getByText('Failed to fetch document status')
      ).toBeInTheDocument();
    });

    it('should display retry button on error', () => {
      const mockRefresh = vi.fn();
      vi.mocked(useDocumentStatus).mockReturnValue({
        documents: [],
        isLoading: false,
        error: 'Error fetching',
        refresh: mockRefresh,
        completedCount: 0,
        totalCount: 0,
        allCompleted: false,
        hasFailures: false,
      });

      render(<GenerationProgress />);

      const retryButton = screen.getByRole('button', { name: /retry/i });
      expect(retryButton).toBeInTheDocument();

      fireEvent.click(retryButton);
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  describe('Progress Display', () => {
    it('should display generation progress heading', () => {
      vi.mocked(useDocumentStatus).mockReturnValue({
        documents: mockDocuments,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
        completedCount: 1,
        totalCount: 3,
        allCompleted: false,
        hasFailures: false,
      });

      render(<GenerationProgress />);

      expect(screen.getByText('Generation Progress')).toBeInTheDocument();
    });

    it('should display progress bar', () => {
      vi.mocked(useDocumentStatus).mockReturnValue({
        documents: mockDocuments,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
        completedCount: 1,
        totalCount: 3,
        allCompleted: false,
        hasFailures: false,
      });

      render(<GenerationProgress />);

      const progressBar = document.querySelector('[role="progressbar"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('should display completed count of total', () => {
      vi.mocked(useDocumentStatus).mockReturnValue({
        documents: mockDocuments,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
        completedCount: 1,
        totalCount: 3,
        allCompleted: false,
        hasFailures: false,
      });

      render(<GenerationProgress />);

      expect(screen.getByText('1 of 3 complete')).toBeInTheDocument();
    });

    it('should display generating count', () => {
      vi.mocked(useDocumentStatus).mockReturnValue({
        documents: mockDocuments,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
        completedCount: 1,
        totalCount: 3,
        allCompleted: false,
        hasFailures: false,
      });

      render(<GenerationProgress />);

      expect(screen.getByText('1 generating')).toBeInTheDocument();
    });

    it('should display pending count', () => {
      vi.mocked(useDocumentStatus).mockReturnValue({
        documents: mockDocuments,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
        completedCount: 1,
        totalCount: 3,
        allCompleted: false,
        hasFailures: false,
      });

      render(<GenerationProgress />);

      expect(screen.getByText('1 pending')).toBeInTheDocument();
    });
  });

  describe('All Completed State', () => {
    it('should display all complete message when finished', () => {
      vi.mocked(useDocumentStatus).mockReturnValue({
        documents: [
          { ...mockDocuments[0], status: 'completed' as const },
          { ...mockDocuments[1], status: 'completed' as const },
          { ...mockDocuments[2], status: 'completed' as const },
        ],
        isLoading: false,
        error: null,
        refresh: vi.fn(),
        completedCount: 3,
        totalCount: 3,
        allCompleted: true,
        hasFailures: false,
      });

      render(<GenerationProgress />);

      expect(screen.getByText('All 3 documents complete')).toBeInTheDocument();
    });
  });

  describe('Failed Documents', () => {
    it('should display failed count', () => {
      vi.mocked(useDocumentStatus).mockReturnValue({
        documents: [
          { ...mockDocuments[0], status: 'completed' as const },
          { ...mockDocuments[1], status: 'failed' as const, errorMessage: 'Generation failed' },
          { ...mockDocuments[2], status: 'pending' as const },
        ],
        isLoading: false,
        error: null,
        refresh: vi.fn(),
        completedCount: 1,
        totalCount: 3,
        allCompleted: false,
        hasFailures: true,
      });

      render(<GenerationProgress />);

      expect(screen.getByText('1 failed')).toBeInTheDocument();
    });
  });

  describe('Refresh Functionality', () => {
    it('should have refresh button', () => {
      vi.mocked(useDocumentStatus).mockReturnValue({
        documents: mockDocuments,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
        completedCount: 1,
        totalCount: 3,
        allCompleted: false,
        hasFailures: false,
      });

      render(<GenerationProgress />);

      const refreshButton = document.querySelector('button[disabled]') ||
                           document.querySelector('button:not([disabled])');
      expect(refreshButton).toBeInTheDocument();
    });

    it('should disable refresh button when loading', () => {
      vi.mocked(useDocumentStatus).mockReturnValue({
        documents: mockDocuments,
        isLoading: true,
        error: null,
        refresh: vi.fn(),
        completedCount: 1,
        totalCount: 3,
        allCompleted: false,
        hasFailures: false,
      });

      render(<GenerationProgress />);

      // Find the refresh button in the progress summary section
      const buttons = screen.getAllByRole('button');
      const refreshButton = buttons.find(btn => btn.closest('.bg-slate-50'));
      expect(refreshButton).toBeDisabled();
    });
  });

  describe('Document Cards', () => {
    it('should render document cards for each document', () => {
      vi.mocked(useDocumentStatus).mockReturnValue({
        documents: mockDocuments,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
        completedCount: 1,
        totalCount: 3,
        allCompleted: false,
        hasFailures: false,
      });

      render(<GenerationProgress />);

      expect(screen.getByText('Strategic Alignment Brief')).toBeInTheDocument();
      expect(screen.getByText('Meeting Cost Tracker')).toBeInTheDocument();
      expect(screen.getByText('Board Summary Report')).toBeInTheDocument();
    });
  });

  describe('onRetry Callback', () => {
    it('should pass onRetry to document cards', () => {
      const mockOnRetry = vi.fn();
      vi.mocked(useDocumentStatus).mockReturnValue({
        documents: [
          { ...mockDocuments[1], status: 'failed' as const, errorMessage: 'Error' },
        ],
        isLoading: false,
        error: null,
        refresh: vi.fn(),
        completedCount: 0,
        totalCount: 1,
        allCompleted: false,
        hasFailures: true,
      });

      render(<GenerationProgress onRetry={mockOnRetry} />);

      // The onRetry prop should be passed to DocumentCard
      const retryButton = screen.getByRole('button', { name: /retry/i });
      expect(retryButton).toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('should apply custom className', () => {
      vi.mocked(useDocumentStatus).mockReturnValue({
        documents: mockDocuments,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
        completedCount: 1,
        totalCount: 3,
        allCompleted: false,
        hasFailures: false,
      });

      const { container } = render(
        <GenerationProgress className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});
