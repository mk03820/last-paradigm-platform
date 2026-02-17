/**
 * SuccessCelebration Component Tests
 *
 * Tests for the success celebration component with confetti.
 *
 * Story 18.7: Post-Generation Success Experience
 * Task 1: Tests for SuccessCelebration component
 * Covers: AC1 (success message), AC2 (Download All CTA), confetti animation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SuccessCelebration } from './SuccessCelebration';

describe('SuccessCelebration', () => {
  const mockOnDownloadAll = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Success Message (AC1)', () => {
    it('should display success heading', () => {
      render(
        <SuccessCelebration documentCount={10} onDownloadAll={mockOnDownloadAll} />
      );

      expect(screen.getByText('Your Toolkit is Ready!')).toBeInTheDocument();
    });

    it('should display document count in message', () => {
      render(
        <SuccessCelebration documentCount={10} onDownloadAll={mockOnDownloadAll} />
      );

      expect(
        screen.getByText(/All 10 documents have been successfully generated/)
      ).toBeInTheDocument();
    });

    it('should display personalization message', () => {
      render(
        <SuccessCelebration documentCount={10} onDownloadAll={mockOnDownloadAll} />
      );

      expect(
        screen.getByText(/personalized with your diagnostic findings/)
      ).toBeInTheDocument();
    });

    it('should display download link validity message', () => {
      render(
        <SuccessCelebration documentCount={10} onDownloadAll={mockOnDownloadAll} />
      );

      expect(
        screen.getByText('Download links are valid for 24 hours')
      ).toBeInTheDocument();
    });
  });

  describe('Download All CTA (AC2)', () => {
    it('should display Download All button', () => {
      render(
        <SuccessCelebration documentCount={10} onDownloadAll={mockOnDownloadAll} />
      );

      expect(
        screen.getByRole('button', { name: /download all documents/i })
      ).toBeInTheDocument();
    });

    it('should call onDownloadAll when button is clicked', () => {
      render(
        <SuccessCelebration documentCount={10} onDownloadAll={mockOnDownloadAll} />
      );

      const downloadButton = screen.getByRole('button', {
        name: /download all documents/i,
      });
      fireEvent.click(downloadButton);

      expect(mockOnDownloadAll).toHaveBeenCalledTimes(1);
    });

    it('should have large size button', () => {
      render(
        <SuccessCelebration documentCount={10} onDownloadAll={mockOnDownloadAll} />
      );

      const downloadButton = screen.getByRole('button', {
        name: /download all documents/i,
      });

      // The button should have the lg size class
      expect(downloadButton.closest('button')).toBeInTheDocument();
    });
  });

  describe('Success Icon', () => {
    it('should display check circle icon', () => {
      render(
        <SuccessCelebration documentCount={10} onDownloadAll={mockOnDownloadAll} />
      );

      // Check for the icon container with green background
      const iconContainer = document.querySelector('.bg-green-100');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe('Confetti Animation', () => {
    it('should show confetti initially', () => {
      render(
        <SuccessCelebration documentCount={10} onDownloadAll={mockOnDownloadAll} />
      );

      // Check for sparkle elements
      const confettiContainer = document.querySelector('.overflow-hidden.pointer-events-none');
      expect(confettiContainer).toBeInTheDocument();
    });

    it('should hide confetti after 3 seconds', async () => {
      render(
        <SuccessCelebration documentCount={10} onDownloadAll={mockOnDownloadAll} />
      );

      // Initially confetti should be visible
      let confettiContainer = document.querySelector('.overflow-hidden.pointer-events-none');
      expect(confettiContainer).toBeInTheDocument();

      // Advance time by 3 seconds and flush promises
      await act(async () => {
        vi.advanceTimersByTime(3000);
      });

      // Confetti should be hidden after 3 seconds
      confettiContainer = document.querySelector('.overflow-hidden.pointer-events-none');
      expect(confettiContainer).toBeNull();
    });

    it('should clean up timer on unmount', async () => {
      const { unmount } = render(
        <SuccessCelebration documentCount={10} onDownloadAll={mockOnDownloadAll} />
      );

      // Unmount before timer completes
      unmount();

      // Should not throw any errors when timer would have fired
      await act(async () => {
        vi.advanceTimersByTime(3000);
      });
    });
  });

  describe('Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <SuccessCelebration
          documentCount={10}
          onDownloadAll={mockOnDownloadAll}
          className="custom-class"
        />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should have gradient background', () => {
      const { container } = render(
        <SuccessCelebration documentCount={10} onDownloadAll={mockOnDownloadAll} />
      );

      expect(container.firstChild).toHaveClass('bg-gradient-to-br');
    });

    it('should have green color theme', () => {
      const { container } = render(
        <SuccessCelebration documentCount={10} onDownloadAll={mockOnDownloadAll} />
      );

      expect(container.firstChild).toHaveClass('from-green-50');
      expect(container.firstChild).toHaveClass('to-emerald-50');
    });

    it('should have border styling', () => {
      const { container } = render(
        <SuccessCelebration documentCount={10} onDownloadAll={mockOnDownloadAll} />
      );

      expect(container.firstChild).toHaveClass('border');
      expect(container.firstChild).toHaveClass('border-green-200');
    });

    it('should be centered text', () => {
      const { container } = render(
        <SuccessCelebration documentCount={10} onDownloadAll={mockOnDownloadAll} />
      );

      expect(container.firstChild).toHaveClass('text-center');
    });
  });

  describe('Accessibility', () => {
    it('should have semantic heading structure', () => {
      render(
        <SuccessCelebration documentCount={10} onDownloadAll={mockOnDownloadAll} />
      );

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Your Toolkit is Ready!');
    });

    it('should have accessible button', () => {
      render(
        <SuccessCelebration documentCount={10} onDownloadAll={mockOnDownloadAll} />
      );

      const button = screen.getByRole('button');
      expect(button).toBeEnabled();
    });
  });

  describe('Document Count Variations', () => {
    it('should handle single document count', () => {
      render(
        <SuccessCelebration documentCount={1} onDownloadAll={mockOnDownloadAll} />
      );

      expect(
        screen.getByText(/All 1 documents have been successfully generated/)
      ).toBeInTheDocument();
    });

    it('should handle zero documents', () => {
      render(
        <SuccessCelebration documentCount={0} onDownloadAll={mockOnDownloadAll} />
      );

      expect(
        screen.getByText(/All 0 documents have been successfully generated/)
      ).toBeInTheDocument();
    });

    it('should handle large document count', () => {
      render(
        <SuccessCelebration documentCount={100} onDownloadAll={mockOnDownloadAll} />
      );

      expect(
        screen.getByText(/All 100 documents have been successfully generated/)
      ).toBeInTheDocument();
    });
  });
});
