import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DimensionScoresSummary } from './DimensionScoresSummary';
import type { DimensionId } from './constants';

/**
 * DimensionScoresSummary Tests
 *
 * Tests the dimension scores summary component.
 *
 * Story 9.2: Weighted Composite Score Calculation
 */

const mockScores: Record<DimensionId, number> = {
  strategic: 3,
  execution: 2,
  technology: 4,
  people: 3,
  governance: 2,
};

describe('DimensionScoresSummary', () => {
  describe('rendering', () => {
    it('displays all 5 dimensions', () => {
      render(<DimensionScoresSummary scores={mockScores} />);

      expect(screen.getByText('Strategic Alignment')).toBeInTheDocument();
      expect(screen.getByText('Execution Alignment')).toBeInTheDocument();
      expect(screen.getByText('Technology Alignment')).toBeInTheDocument();
      expect(screen.getByText('People Alignment')).toBeInTheDocument();
      expect(screen.getByText('Governance Alignment')).toBeInTheDocument();
    });

    it('displays dimension scores', () => {
      render(<DimensionScoresSummary scores={mockScores} />);

      // Each score appears as a bold number
      const scoreElements = screen.getAllByText(/^[1-4]$/);
      expect(scoreElements.length).toBeGreaterThanOrEqual(5);
    });

    it('displays dimension weights', () => {
      render(<DimensionScoresSummary scores={mockScores} />);

      // Strategic and Execution both have 30%
      expect(screen.getAllByText('30% weight')).toHaveLength(2);
      // Technology has 20%
      expect(screen.getByText('20% weight')).toBeInTheDocument();
      // People and Governance both have 10%
      expect(screen.getAllByText('10% weight')).toHaveLength(2);
    });

    it('has list role with aria-label', () => {
      render(<DimensionScoresSummary scores={mockScores} />);

      expect(screen.getByRole('list', { name: 'Dimension scores' })).toBeInTheDocument();
    });

    it('renders list items for each dimension', () => {
      render(<DimensionScoresSummary scores={mockScores} />);

      const items = screen.getAllByRole('listitem');
      expect(items).toHaveLength(5);
    });
  });

  describe('lowest score highlighting', () => {
    it('highlights dimensions with lowest score', () => {
      render(<DimensionScoresSummary scores={mockScores} />);

      // Execution and Governance both have score 2 (lowest)
      const needsAttentionBadges = screen.getAllByText('Needs attention');
      expect(needsAttentionBadges).toHaveLength(2);
    });

    it('shows "Needs attention" badge on lowest scoring dimension', () => {
      const scores: Record<DimensionId, number> = {
        strategic: 3,
        execution: 1, // Lowest
        technology: 4,
        people: 3,
        governance: 3,
      };

      render(<DimensionScoresSummary scores={scores} />);

      expect(screen.getByText('Needs attention')).toBeInTheDocument();
    });
  });

  describe('score labels', () => {
    it('displays Chaos label for score 1', () => {
      const scores: Record<DimensionId, number> = {
        strategic: 1,
        execution: 2,
        technology: 3,
        people: 4,
        governance: 2,
      };

      render(<DimensionScoresSummary scores={scores} />);

      expect(screen.getByText('Chaos')).toBeInTheDocument();
    });

    it('displays Siloed label for score 2', () => {
      render(<DimensionScoresSummary scores={mockScores} />);

      expect(screen.getAllByText('Siloed').length).toBeGreaterThan(0);
    });

    it('displays Coordinated label for score 3', () => {
      render(<DimensionScoresSummary scores={mockScores} />);

      expect(screen.getAllByText('Coordinated').length).toBeGreaterThan(0);
    });

    it('displays Integrated label for score 4', () => {
      render(<DimensionScoresSummary scores={mockScores} />);

      expect(screen.getByText('Integrated')).toBeInTheDocument();
    });
  });

  describe('sorting', () => {
    it('maintains dimension order by default', () => {
      render(<DimensionScoresSummary scores={mockScores} sortByScore={false} />);

      const items = screen.getAllByRole('listitem');
      expect(items[0]).toHaveTextContent('Strategic Alignment');
    });

    it('sorts by score when sortByScore=true', () => {
      const scores: Record<DimensionId, number> = {
        strategic: 4,
        execution: 1,
        technology: 3,
        people: 2,
        governance: 3,
      };

      render(<DimensionScoresSummary scores={scores} sortByScore={true} />);

      const items = screen.getAllByRole('listitem');
      // First item should be execution (score 1)
      expect(items[0]).toHaveTextContent('Execution Alignment');
    });
  });
});
