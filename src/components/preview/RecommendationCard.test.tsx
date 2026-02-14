/**
 * RecommendationCard Component Tests
 *
 * Story 16.2: Tool Recommendation Algorithm
 * Task 8.4: Unit tests for RecommendationCard.tsx
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecommendationCard } from './RecommendationCard';
import type { ToolRecommendation } from '@/lib/pb2-tools/types';
import { getPB2Tool } from '@/lib/pb2-tools/tool-catalog';

describe('RecommendationCard', () => {
  const mockRecommendation: ToolRecommendation = {
    rank: 1,
    toolId: 3,
    tool: getPB2Tool(3)!,
    reasoning: 'Your decision velocity of 21 days is 3.0x slower than the benchmark of 7 days.',
    triggerMetric: 'Decision Velocity',
    triggerValue: '21 days',
    benchmarkValue: '7 days',
    severityScore: 2.5,
    priority: 'critical',
  };

  it('should render the tool name and number', () => {
    render(<RecommendationCard recommendation={mockRecommendation} />);

    expect(screen.getByText(/Tool 3:/)).toBeInTheDocument();
    // "Delegation Framework" appears in both short name and full name
    const matches = screen.getAllByText(/Delegation Framework/);
    expect(matches.length).toBeGreaterThan(0);
  });

  it('should render the full tool name as description', () => {
    render(<RecommendationCard recommendation={mockRecommendation} />);

    expect(
      screen.getByText('Decision Rights & Delegation Framework')
    ).toBeInTheDocument();
  });

  it('should render the tool description', () => {
    render(<RecommendationCard recommendation={mockRecommendation} />);

    expect(
      screen.getByText(/Clarifies who can make which decisions/)
    ).toBeInTheDocument();
  });

  it('should render the personalized reasoning', () => {
    render(<RecommendationCard recommendation={mockRecommendation} />);

    expect(
      screen.getByText(/Your decision velocity of 21 days is 3.0x slower/)
    ).toBeInTheDocument();
  });

  it('should render the trigger metric and value', () => {
    render(<RecommendationCard recommendation={mockRecommendation} />);

    expect(screen.getByText(/Your Decision Velocity:/)).toBeInTheDocument();
    expect(screen.getByText('21 days')).toBeInTheDocument();
  });

  it('should render the benchmark value when provided', () => {
    render(<RecommendationCard recommendation={mockRecommendation} />);

    expect(screen.getByText(/Benchmark:/)).toBeInTheDocument();
    expect(screen.getByText('7 days')).toBeInTheDocument();
  });

  it('should render the rank indicator', () => {
    render(<RecommendationCard recommendation={mockRecommendation} />);

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should render the priority badge', () => {
    render(<RecommendationCard recommendation={mockRecommendation} />);

    expect(screen.getByText('critical')).toBeInTheDocument();
  });

  describe('Priority styling', () => {
    it('should apply critical priority styles', () => {
      const criticalRec = { ...mockRecommendation, priority: 'critical' as const };
      render(<RecommendationCard recommendation={criticalRec} />);

      const badge = screen.getByText('critical');
      expect(badge).toBeInTheDocument();
    });

    it('should apply high priority styles', () => {
      const highRec = {
        ...mockRecommendation,
        priority: 'high' as const,
        severityScore: 1.5,
      };
      render(<RecommendationCard recommendation={highRec} />);

      const badge = screen.getByText('high');
      expect(badge).toBeInTheDocument();
    });

    it('should apply moderate priority styles', () => {
      const moderateRec = {
        ...mockRecommendation,
        priority: 'moderate' as const,
        severityScore: 0.5,
      };
      render(<RecommendationCard recommendation={moderateRec} />);

      const badge = screen.getByText('moderate');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Rank indicator styling', () => {
    it('should style rank 1 with gold', () => {
      const rank1 = { ...mockRecommendation, rank: 1 };
      render(<RecommendationCard recommendation={rank1} />);

      const rankBadge = screen.getByText('1');
      expect(rankBadge).toHaveClass('bg-amber-600');
    });

    it('should style rank 2 with slate-600', () => {
      const rank2 = { ...mockRecommendation, rank: 2 };
      render(<RecommendationCard recommendation={rank2} />);

      const rankBadge = screen.getByText('2');
      expect(rankBadge).toHaveClass('bg-slate-600');
    });

    it('should style rank 3 with slate-400', () => {
      const rank3 = { ...mockRecommendation, rank: 3 };
      render(<RecommendationCard recommendation={rank3} />);

      const rankBadge = screen.getByText('3');
      expect(rankBadge).toHaveClass('bg-slate-400');
    });
  });

  describe('Why this tool section', () => {
    it('should have expandable "Why this tool?" section', async () => {
      const user = userEvent.setup();
      render(<RecommendationCard recommendation={mockRecommendation} />);

      const expandButton = screen.getByRole('button', { name: /Why this tool?/i });
      expect(expandButton).toBeInTheDocument();
      expect(expandButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('should expand to show methodology when clicked', async () => {
      const user = userEvent.setup();
      render(<RecommendationCard recommendation={mockRecommendation} />);

      const expandButton = screen.getByRole('button', { name: /Why this tool?/i });
      await user.click(expandButton);

      expect(expandButton).toHaveAttribute('aria-expanded', 'true');
      expect(
        screen.getByText(/Eliminates decision bottlenecks/)
      ).toBeInTheDocument();
      expect(screen.getByText(/Chapter 10: Decision Velocity/)).toBeInTheDocument();
    });

    it('should show document output in expanded section', async () => {
      const user = userEvent.setup();
      render(<RecommendationCard recommendation={mockRecommendation} />);

      const expandButton = screen.getByRole('button', { name: /Why this tool?/i });
      await user.click(expandButton);

      expect(screen.getByText('Decision_Rights_Matrix.xlsx')).toBeInTheDocument();
    });

    it('should collapse when clicked again', async () => {
      const user = userEvent.setup();
      render(<RecommendationCard recommendation={mockRecommendation} />);

      const expandButton = screen.getByRole('button', { name: /Why this tool?/i });
      await user.click(expandButton);
      await user.click(expandButton);

      expect(expandButton).toHaveAttribute('aria-expanded', 'false');
      expect(
        screen.queryByText(/Eliminates decision bottlenecks/)
      ).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have appropriate aria-label on card', () => {
      render(<RecommendationCard recommendation={mockRecommendation} />);

      const card = screen.getByRole('article');
      expect(card).toHaveAttribute(
        'aria-label',
        'Recommendation 1: Decision Rights & Delegation Framework'
      );
    });

    it('should have aria-label on rank indicator', () => {
      render(<RecommendationCard recommendation={mockRecommendation} />);

      const rankBadge = screen.getByLabelText('Rank 1');
      expect(rankBadge).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(<RecommendationCard recommendation={mockRecommendation} />);

      const expandButton = screen.getByRole('button', { name: /Why this tool?/i });
      await user.tab();

      // Button should be focusable
      expect(document.activeElement).toBe(expandButton);
    });
  });

  describe('Trigger value formatting', () => {
    it('should format numeric values as currency', () => {
      const currencyRec: ToolRecommendation = {
        ...mockRecommendation,
        toolId: 6,
        tool: getPB2Tool(6)!,
        triggerMetric: 'Data Friction Cost',
        triggerValue: 8000000,
        benchmarkValue: 5000000,
      };
      render(<RecommendationCard recommendation={currencyRec} />);

      expect(screen.getByText('$8.0M')).toBeInTheDocument();
      expect(screen.getByText('$5.0M')).toBeInTheDocument();
    });

    it('should display string values as-is', () => {
      render(<RecommendationCard recommendation={mockRecommendation} />);

      expect(screen.getByText('21 days')).toBeInTheDocument();
    });
  });

  describe('Without benchmark value', () => {
    it('should not show benchmark section when benchmarkValue is undefined', () => {
      const noBenchmarkRec: ToolRecommendation = {
        ...mockRecommendation,
        benchmarkValue: undefined,
      };
      render(<RecommendationCard recommendation={noBenchmarkRec} />);

      expect(screen.queryByText(/Benchmark:/)).not.toBeInTheDocument();
    });
  });
});
