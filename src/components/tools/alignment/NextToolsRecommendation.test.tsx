import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextToolsRecommendation } from './NextToolsRecommendation';
import type { DimensionId } from './constants';

/**
 * NextToolsRecommendation Tests
 *
 * Tests the next tools recommendation component that suggests
 * tools based on the user's weakest dimensions.
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

describe('NextToolsRecommendation', () => {
  describe('rendering', () => {
    it('renders the section heading', () => {
      const scores = createScores();
      render(<NextToolsRecommendation scores={scores} />);

      expect(screen.getByText('Recommended Next Steps')).toBeInTheDocument();
    });

    it('renders as a region', () => {
      const scores = createScores();
      render(<NextToolsRecommendation scores={scores} />);

      expect(screen.getByRole('region')).toBeInTheDocument();
    });
  });

  describe('always recommends Tool 7', () => {
    it('always includes Total Cost Calculator', () => {
      const scores = createScores();
      render(<NextToolsRecommendation scores={scores} />);

      expect(screen.getByText('Total Cost Calculator')).toBeInTheDocument();
    });

    it('shows Tool 7 as primary recommendation', () => {
      const scores = createScores();
      render(<NextToolsRecommendation scores={scores} />);

      // Tool 7 should have the "Recommended" badge
      const recommended = screen.getByText('Recommended');
      expect(recommended).toBeInTheDocument();
    });
  });

  describe('dimension-based recommendations', () => {
    it('recommends Decision Velocity for governance issues', () => {
      const scores = createScores({ governance: 1 });
      render(<NextToolsRecommendation scores={scores} />);

      expect(screen.getByText('Decision Velocity Calculator')).toBeInTheDocument();
    });

    it('recommends Decision Velocity for strategic issues', () => {
      const scores = createScores({ strategic: 2 });
      render(<NextToolsRecommendation scores={scores} />);

      expect(screen.getByText('Decision Velocity Calculator')).toBeInTheDocument();
    });

    it('recommends Data Flow for technology issues', () => {
      const scores = createScores({ technology: 1 });
      render(<NextToolsRecommendation scores={scores} />);

      expect(screen.getByText('Data Flow Friction Mapper')).toBeInTheDocument();
    });

    it('recommends Data Flow for execution issues', () => {
      const scores = createScores({ execution: 2 });
      render(<NextToolsRecommendation scores={scores} />);

      expect(screen.getByText('Data Flow Friction Mapper')).toBeInTheDocument();
    });

    it('recommends Communication Pattern for people issues', () => {
      const scores = createScores({ people: 1 });
      render(<NextToolsRecommendation scores={scores} />);

      expect(screen.getByText('Communication Pattern Analyzer')).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    it('has Start button for each recommendation', () => {
      const scores = createScores({ strategic: 1 });
      render(<NextToolsRecommendation scores={scores} />);

      const startButtons = screen.getAllByRole('link', { name: 'Start' });
      expect(startButtons.length).toBeGreaterThan(0);
    });

    it('links Tool 7 to total-cost page', () => {
      const scores = createScores();
      render(<NextToolsRecommendation scores={scores} />);

      const links = screen.getAllByRole('link', { name: 'Start' });
      // Tool 7 should be first
      expect(links[0]).toHaveAttribute('href', '/tool/total-cost');
    });

    it('links Decision Velocity correctly', () => {
      const scores = createScores({ governance: 1 });
      render(<NextToolsRecommendation scores={scores} />);

      // Find the link near Decision Velocity
      const links = screen.getAllByRole('link', { name: 'Start' });
      const hrefs = links.map((l) => l.getAttribute('href'));
      expect(hrefs).toContain('/tool/decision-velocity');
    });

    it('links Data Flow correctly', () => {
      const scores = createScores({ technology: 1 });
      render(<NextToolsRecommendation scores={scores} />);

      const links = screen.getAllByRole('link', { name: 'Start' });
      const hrefs = links.map((l) => l.getAttribute('href'));
      expect(hrefs).toContain('/tool/data-flow');
    });

    it('links Communication Pattern correctly', () => {
      const scores = createScores({ people: 1 });
      render(<NextToolsRecommendation scores={scores} />);

      const links = screen.getAllByRole('link', { name: 'Start' });
      const hrefs = links.map((l) => l.getAttribute('href'));
      expect(hrefs).toContain('/tool/communication-pattern');
    });
  });

  describe('descriptions', () => {
    it('shows description for Tool 7', () => {
      const scores = createScores();
      render(<NextToolsRecommendation scores={scores} />);

      expect(
        screen.getByText(/Calculate the full cost of organizational misalignment/)
      ).toBeInTheDocument();
    });

    it('shows description for Decision Velocity', () => {
      const scores = createScores({ governance: 1 });
      render(<NextToolsRecommendation scores={scores} />);

      expect(
        screen.getByText(/Measure how quickly decisions move/)
      ).toBeInTheDocument();
    });
  });

  describe('limit recommendations', () => {
    it('shows at most 3 recommendations', () => {
      // All dimensions weak - should still limit to 3
      const scores: Record<DimensionId, number> = {
        strategic: 1,
        execution: 1,
        technology: 1,
        people: 1,
        governance: 1,
      };
      render(<NextToolsRecommendation scores={scores} />);

      const startButtons = screen.getAllByRole('link', { name: 'Start' });
      expect(startButtons.length).toBeLessThanOrEqual(3);
    });
  });

  describe('good scores', () => {
    it('still provides recommendations when all scores are good', () => {
      const scores = createScores(); // All 3s
      render(<NextToolsRecommendation scores={scores} />);

      // Should still recommend Tool 7 and at least one other
      const startButtons = screen.getAllByRole('link', { name: 'Start' });
      expect(startButtons.length).toBeGreaterThanOrEqual(1);
    });
  });
});
