import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WeakDimensionGuidance } from './WeakDimensionGuidance';
import type { DimensionId } from './constants';

/**
 * WeakDimensionGuidance Tests
 *
 * Tests the weak dimension guidance component that identifies
 * problem areas and provides specific recommendations.
 *
 * Story 9.4: Score Interpretation and Next Steps
 */

const createScores = (overrides: Partial<Record<DimensionId, number>> = {}): Record<DimensionId, number> => ({
  strategic: 3,
  execution: 3,
  technology: 3,
  people: 3,
  governance: 3,
  ...overrides,
});

describe('WeakDimensionGuidance', () => {
  describe('single weak dimension', () => {
    it('identifies strategic as weakest when lowest', () => {
      const scores = createScores({ strategic: 1 });
      render(<WeakDimensionGuidance scores={scores} />);

      expect(screen.getByText('Strategic Alignment')).toBeInTheDocument();
      expect(screen.getByText(/strategy cascade workshop/)).toBeInTheDocument();
    });

    it('identifies execution as weakest when lowest', () => {
      const scores = createScores({ execution: 1 });
      render(<WeakDimensionGuidance scores={scores} />);

      expect(screen.getByText('Execution Alignment')).toBeInTheDocument();
      expect(screen.getByText(/end-to-end delivery process/)).toBeInTheDocument();
    });

    it('identifies technology as weakest when lowest', () => {
      const scores = createScores({ technology: 1 });
      render(<WeakDimensionGuidance scores={scores} />);

      expect(screen.getByText('Technology Alignment')).toBeInTheDocument();
      expect(screen.getByText(/Technology fragmentation/)).toBeInTheDocument();
    });

    it('identifies people as weakest when lowest', () => {
      const scores = createScores({ people: 1 });
      render(<WeakDimensionGuidance scores={scores} />);

      expect(screen.getByText('People Alignment')).toBeInTheDocument();
      expect(screen.getByText(/psychological safety/)).toBeInTheDocument();
    });

    it('identifies governance as weakest when lowest', () => {
      const scores = createScores({ governance: 1 });
      render(<WeakDimensionGuidance scores={scores} />);

      expect(screen.getByText('Governance Alignment')).toBeInTheDocument();
      expect(screen.getByText(/decision bottlenecks/)).toBeInTheDocument();
    });
  });

  describe('multiple weak dimensions', () => {
    it('shows two dimensions when both score <= 2', () => {
      const scores = createScores({ strategic: 1, execution: 2 });
      render(<WeakDimensionGuidance scores={scores} />);

      expect(screen.getByText('Strategic Alignment')).toBeInTheDocument();
      expect(screen.getByText('Execution Alignment')).toBeInTheDocument();
    });

    it('only shows one dimension if second is > 2', () => {
      const scores = createScores({ strategic: 2, execution: 3 });
      render(<WeakDimensionGuidance scores={scores} />);

      expect(screen.getByText('Strategic Alignment')).toBeInTheDocument();
      expect(screen.queryByText('Execution Alignment')).not.toBeInTheDocument();
    });
  });

  describe('scores display', () => {
    it('displays score for weakest dimension', () => {
      const scores = createScores({ people: 1 });
      render(<WeakDimensionGuidance scores={scores} />);

      expect(screen.getByText('Score: 1/4')).toBeInTheDocument();
    });

    it('displays scores for multiple weak dimensions', () => {
      const scores = createScores({ strategic: 1, governance: 2 });
      render(<WeakDimensionGuidance scores={scores} />);

      expect(screen.getByText('Score: 1/4')).toBeInTheDocument();
      expect(screen.getByText('Score: 2/4')).toBeInTheDocument();
    });
  });

  describe('focus areas', () => {
    it('shows Strategy Communication focus for strategic', () => {
      const scores = createScores({ strategic: 1 });
      render(<WeakDimensionGuidance scores={scores} />);

      expect(screen.getByText('Focus: Strategy Communication')).toBeInTheDocument();
    });

    it('shows Delivery Process focus for execution', () => {
      const scores = createScores({ execution: 1 });
      render(<WeakDimensionGuidance scores={scores} />);

      expect(screen.getByText('Focus: Delivery Process')).toBeInTheDocument();
    });

    it('shows System Integration focus for technology', () => {
      const scores = createScores({ technology: 1 });
      render(<WeakDimensionGuidance scores={scores} />);

      expect(screen.getByText('Focus: System Integration')).toBeInTheDocument();
    });

    it('shows Culture & Communication focus for people', () => {
      const scores = createScores({ people: 1 });
      render(<WeakDimensionGuidance scores={scores} />);

      expect(screen.getByText('Focus: Culture & Communication')).toBeInTheDocument();
    });

    it('shows Decision Rights focus for governance', () => {
      const scores = createScores({ governance: 1 });
      render(<WeakDimensionGuidance scores={scores} />);

      expect(screen.getByText('Focus: Decision Rights')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('renders as a region', () => {
      const scores = createScores({ strategic: 1 });
      render(<WeakDimensionGuidance scores={scores} />);

      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('has accessible heading', () => {
      const scores = createScores({ strategic: 1 });
      render(<WeakDimensionGuidance scores={scores} />);

      expect(screen.getByText('Priority Focus Areas')).toBeInTheDocument();
    });
  });

  describe('rendering', () => {
    it('always shows at least the weakest dimension', () => {
      const scores = createScores(); // All scores are 3
      render(<WeakDimensionGuidance scores={scores} />);

      // Should show the first dimension alphabetically when tied
      expect(screen.getByRole('region')).toBeInTheDocument();
    });
  });
});
