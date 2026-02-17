/**
 * ResultsGrid Component Tests
 *
 * Story 19.2: Diagnostic Results Display
 * Task 9.3: Unit tests for ResultsGrid component
 * Covers: AC2 (All tool results display), AC8 (Responsive grid)
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ResultsGrid } from '@/components/dashboard/results/ResultsGrid';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const mockToolResults = {
  tool1: {
    scores: { strategic: 65, execution: 55, technology: 70, people: 50, governance: 60 },
    compositeScore: 60,
    completedAt: '2026-02-14T10:00:00Z',
  },
  tool2: {
    inputs: { meetingCount: 100, averageAttendees: 8, averageDuration: 60 },
    results: {
      totalMeetingHours: 800,
      totalMeetingCost: 240000,
      wastedHours: 400,
      wastedCost: 120000,
      effectiveHours: 400,
      effectiveCost: 120000,
    },
    completedAt: '2026-02-14T10:05:00Z',
  },
  tool3: {
    decisions: [
      { archetype: 'budget', medianDays: 14, p90Days: 28 },
      { archetype: 'strategic', medianDays: 45, p90Days: 90 },
    ],
    metrics: { overallMedian: 21, overallP90: 45 },
    completedAt: '2026-02-14T10:10:00Z',
  },
  tool4: {
    stakeholders: [
      { name: 'CEO', power: 9, interest: 8, sentiment: 'champion' },
      { name: 'CFO', power: 8, interest: 5, sentiment: 'neutral' },
    ],
    completedAt: '2026-02-14T10:15:00Z',
  },
  tool5: {
    journeys: [{ name: 'Customer Order' }, { name: 'Financial Report' }],
    frictionCost: 350000,
    completedAt: '2026-02-14T10:20:00Z',
  },
  tool6: {
    metrics: { healthScore: 65, antiPatternCount: 3 },
    antiPatterns: ['Silo Communication', 'Meeting Overload', 'Email Fatigue'],
    completedAt: '2026-02-14T10:25:00Z',
  },
  tool7: {
    totalCost: 1250000,
    alignmentTaxPercent: 8.5,
    completedAt: '2026-02-14T10:30:00Z',
  },
};

describe('ResultsGrid', () => {
  describe('All tool results display (AC2)', () => {
    it('displays all 7 tool result cards', () => {
      render(<ResultsGrid toolResults={mockToolResults} />);

      expect(screen.getByText(/alignment assessment/i)).toBeInTheDocument();
      expect(screen.getByText(/meeting audit/i)).toBeInTheDocument();
      expect(screen.getByText(/decision velocity/i)).toBeInTheDocument();
      expect(screen.getByText(/stakeholder map/i)).toBeInTheDocument();
      expect(screen.getByText(/data flow friction/i)).toBeInTheDocument();
      expect(screen.getByText(/communication pattern/i)).toBeInTheDocument();
      expect(screen.getByText(/total cost/i)).toBeInTheDocument();
    });

    it('displays Tool 1 dimension scores', () => {
      render(<ResultsGrid toolResults={mockToolResults} />);

      // Check for dimension label and score separately (they're in different elements)
      expect(screen.getByText(/strategic/i)).toBeInTheDocument();
      // Multiple elements may show 65
      expect(screen.getAllByText('65').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByTestId('composite-score')).toHaveTextContent('60');
    });

    it('displays Tool 2 meeting waste metrics', () => {
      render(<ResultsGrid toolResults={mockToolResults} />);

      expect(screen.getByText('$120,000')).toBeInTheDocument(); // Wasted cost
      expect(screen.getByText(/400 hours/)).toBeInTheDocument();
    });

    it('displays Tool 3 decision latency metrics', () => {
      render(<ResultsGrid toolResults={mockToolResults} />);

      // Median days shown - multiple elements may have 21
      expect(screen.getAllByText(/21/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/median/i).length).toBeGreaterThanOrEqual(1);
    });

    it('displays Tool 4 stakeholder counts by quadrant', () => {
      render(<ResultsGrid toolResults={mockToolResults} />);

      expect(screen.getByText(/2.*stakeholders/i)).toBeInTheDocument();
    });

    it('displays Tool 5 friction cost', () => {
      render(<ResultsGrid toolResults={mockToolResults} />);

      expect(screen.getByText(/\$350,000/)).toBeInTheDocument();
    });

    it('displays Tool 6 health score and anti-patterns', () => {
      render(<ResultsGrid toolResults={mockToolResults} />);

      // Health score displayed in component
      expect(screen.getByTestId('health-score')).toHaveTextContent('65');
      expect(screen.getByText(/3 anti-patterns/i)).toBeInTheDocument();
    });

    it('displays Tool 7 total alignment tax', () => {
      render(<ResultsGrid toolResults={mockToolResults} />);

      // The total cost card displays the amount
      const totalCostCards = screen.getAllByText('$1,250,000');
      expect(totalCostCards.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Partial results handling', () => {
    it('handles missing tool data gracefully', () => {
      const partialResults = {
        tool1: mockToolResults.tool1,
        tool2: mockToolResults.tool2,
        // Missing tools 3-7
      };

      render(<ResultsGrid toolResults={partialResults} />);

      // Should show completed tools
      expect(screen.getByText(/alignment assessment/i)).toBeInTheDocument();
      expect(screen.getByText(/meeting audit/i)).toBeInTheDocument();

      // Should show incomplete state for missing tools
      expect(screen.getAllByText(/not completed/i).length).toBeGreaterThanOrEqual(5);
    });

    it('shows empty state when no results', () => {
      render(<ResultsGrid toolResults={null} />);

      expect(screen.getByText(/no results available/i)).toBeInTheDocument();
    });
  });

  describe('Responsive grid layout (AC8)', () => {
    it('uses responsive grid classes', () => {
      const { container } = render(<ResultsGrid toolResults={mockToolResults} />);

      const grid = container.querySelector('[data-testid="results-grid"]');
      // 1 col mobile, 2 col tablet, 3 col desktop
      expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
    });

    it('has proper spacing between cards', () => {
      const { container } = render(<ResultsGrid toolResults={mockToolResults} />);

      const grid = container.querySelector('[data-testid="results-grid"]');
      expect(grid).toHaveClass('gap-4');
    });
  });

  describe('Accessibility (AC9)', () => {
    it('has proper list role for grid', () => {
      render(<ResultsGrid toolResults={mockToolResults} />);

      const grid = screen.getByRole('list', { name: /diagnostic tool results/i });
      expect(grid).toBeInTheDocument();
    });

    it('has wrapper divs with listitem role for each card', () => {
      const { container } = render(<ResultsGrid toolResults={mockToolResults} />);

      const items = container.querySelectorAll('[role="listitem"]');
      expect(items).toHaveLength(7);
    });

    it('has proper ARIA labels on tool cards', () => {
      render(<ResultsGrid toolResults={mockToolResults} />);

      expect(screen.getByRole('article', { name: /tool 1.*alignment/i })).toBeInTheDocument();
      expect(screen.getByRole('article', { name: /tool 2.*meeting/i })).toBeInTheDocument();
    });
  });

  describe('Tool card consistency', () => {
    it('uses consistent card styling for all tools', () => {
      const { container } = render(<ResultsGrid toolResults={mockToolResults} />);

      const cards = container.querySelectorAll('[data-testid^="tool-result-card"]');
      expect(cards).toHaveLength(7);
    });
  });
});
