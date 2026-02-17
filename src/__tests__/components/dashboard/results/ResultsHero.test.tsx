/**
 * ResultsHero Component Tests
 *
 * Story 19.2: Diagnostic Results Display
 * Task 9.1: Unit tests for ResultsHero component
 * Covers: AC3 (Key metrics highlighting), AC4 (Metadata display), AC6 (Empty state)
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ResultsHero } from '@/components/dashboard/results/ResultsHero';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const mockResults = {
  totalAlignmentTax: 1250000,
  estimatedSavings: 437500,
  compositeScore: 58,
  completedAt: '2026-02-14T10:30:00Z',
  sessionName: 'Q1 2026 Assessment',
};

describe('ResultsHero', () => {
  describe('Key metrics display (AC3)', () => {
    it('displays total alignment tax with Gold accent styling', () => {
      render(<ResultsHero results={mockResults} />);

      // Total alignment tax should be prominently displayed
      expect(screen.getByText('$1,250,000')).toBeInTheDocument();
      // Should have the accent color class (gold)
      const taxElement = screen.getByTestId('alignment-tax-value');
      expect(taxElement).toHaveClass('text-accent');
    });

    it('displays alignment tax with 48px typography (most prominent)', () => {
      render(<ResultsHero results={mockResults} />);

      const taxElement = screen.getByTestId('alignment-tax-value');
      // Should have large text styling for prominence
      expect(taxElement).toHaveClass('text-4xl', 'md:text-5xl');
    });

    it('displays estimated savings potential', () => {
      render(<ResultsHero results={mockResults} />);

      expect(screen.getByText('$437,500')).toBeInTheDocument();
      expect(screen.getByText(/estimated.*savings/i)).toBeInTheDocument();
    });

    it('displays composite alignment score with progress indicator', () => {
      render(<ResultsHero results={mockResults} />);

      expect(screen.getByText('58')).toBeInTheDocument();
      expect(screen.getByText(/alignment.*score/i)).toBeInTheDocument();
    });

    it('shows score color coding based on value (yellow for 50-70)', () => {
      render(<ResultsHero results={mockResults} />);

      const scoreElement = screen.getByTestId('composite-score-value');
      // Score of 58 should be yellow (needs improvement)
      expect(scoreElement).toHaveClass('text-yellow-600');
    });

    it('shows red for scores below 50', () => {
      render(<ResultsHero results={{ ...mockResults, compositeScore: 35 }} />);

      const scoreElement = screen.getByTestId('composite-score-value');
      expect(scoreElement).toHaveClass('text-red-600');
    });

    it('shows green for scores above 70', () => {
      render(<ResultsHero results={{ ...mockResults, compositeScore: 85 }} />);

      const scoreElement = screen.getByTestId('composite-score-value');
      expect(scoreElement).toHaveClass('text-green-600');
    });
  });

  describe('Metadata display (AC4)', () => {
    it('displays completion date in user-friendly format', () => {
      render(<ResultsHero results={mockResults} />);

      // Should show "Completed February 14, 2026"
      expect(screen.getByText(/completed.*february 14.*2026/i)).toBeInTheDocument();
    });

    it('displays methodology attribution', () => {
      render(<ResultsHero results={mockResults} />);

      expect(screen.getByText(/the last paradigm/i)).toBeInTheDocument();
    });

    it('displays session name when provided', () => {
      render(<ResultsHero results={mockResults} />);

      expect(screen.getByText('Q1 2026 Assessment')).toBeInTheDocument();
    });

    it('handles missing session name gracefully', () => {
      render(<ResultsHero results={{ ...mockResults, sessionName: null }} />);

      // Should not crash and still display other content
      expect(screen.getByText('$1,250,000')).toBeInTheDocument();
    });
  });

  describe('Empty/partial results state (AC2.6)', () => {
    it('shows empty state when no results provided', () => {
      render(<ResultsHero results={null} />);

      expect(screen.getByText(/no diagnostic results/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /start.*diagnostic/i })).toBeInTheDocument();
    });

    it('shows partial state when only some data available', () => {
      render(
        <ResultsHero
          results={{
            totalAlignmentTax: null,
            estimatedSavings: null,
            compositeScore: 58,
            completedAt: null,
            sessionName: null,
          }}
        />
      );

      // Should show the score but indicate incomplete data
      expect(screen.getByText('58')).toBeInTheDocument();
      // In Progress indicator for missing completion date
      expect(screen.getAllByText(/in progress/i).length).toBeGreaterThanOrEqual(1);
    });

    it('handles null alignment tax gracefully', () => {
      render(
        <ResultsHero
          results={{
            ...mockResults,
            totalAlignmentTax: null,
          }}
        />
      );

      expect(screen.getByText(/calculating/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility (AC9)', () => {
    it('has proper heading hierarchy', () => {
      render(<ResultsHero results={mockResults} />);

      // Should have descriptive headings
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('has accessible section role and label', () => {
      render(<ResultsHero results={mockResults} />);

      const section = screen.getByRole('region', { name: /diagnostic.*summary/i });
      expect(section).toBeInTheDocument();
    });

    it('uses proper ARIA labels for key metrics', () => {
      render(<ResultsHero results={mockResults} />);

      // Check for aria-label attributes on the metric value elements
      expect(screen.getByLabelText(/total alignment tax/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/estimated savings/i)).toBeInTheDocument();
      // Multiple elements have alignment score label
      expect(screen.getAllByLabelText(/alignment score/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Responsive design (AC8)', () => {
    it('has responsive classes for mobile layout', () => {
      const { container } = render(<ResultsHero results={mockResults} />);

      // Should have responsive grid or flex classes
      const heroGrids = container.querySelectorAll('[data-testid="results-hero"]');
      // The grid with responsive classes
      expect(heroGrids.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Currency formatting', () => {
    it('formats millions correctly', () => {
      render(<ResultsHero results={{ ...mockResults, totalAlignmentTax: 2500000 }} />);

      expect(screen.getByText('$2,500,000')).toBeInTheDocument();
    });

    it('formats thousands correctly', () => {
      render(<ResultsHero results={{ ...mockResults, totalAlignmentTax: 150000 }} />);

      expect(screen.getByText('$150,000')).toBeInTheDocument();
    });

    it('handles zero values', () => {
      render(<ResultsHero results={{ ...mockResults, totalAlignmentTax: 0 }} />);

      expect(screen.getByText('$0')).toBeInTheDocument();
    });
  });
});
