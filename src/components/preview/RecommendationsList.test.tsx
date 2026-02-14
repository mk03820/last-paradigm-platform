/**
 * RecommendationsList Component Tests
 *
 * Story 16.2: Tool Recommendation Algorithm
 * Task 8.5: Unit tests for RecommendationsList.tsx
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecommendationsList } from './RecommendationsList';
import type { ToolRecommendation } from '@/lib/pb2-tools/types';
import { getPB2Tool } from '@/lib/pb2-tools/tool-catalog';

describe('RecommendationsList', () => {
  const createMockRecommendations = (count: number): ToolRecommendation[] => {
    const tools = [3, 4, 6];
    return tools.slice(0, count).map((toolId, index) => ({
      rank: index + 1,
      toolId,
      tool: getPB2Tool(toolId)!,
      reasoning: `Test reasoning for tool ${toolId}`,
      triggerMetric: `Test Metric ${toolId}`,
      triggerValue: `Test Value ${toolId}`,
      severityScore: 2.0 - index * 0.5,
      priority: index === 0 ? 'critical' : index === 1 ? 'high' : 'moderate',
    })) as ToolRecommendation[];
  };

  describe('Header', () => {
    it('should render the "Top 3 Recommendations for You" header', () => {
      const recommendations = createMockRecommendations(3);
      render(<RecommendationsList recommendations={recommendations} />);

      expect(
        screen.getByRole('heading', { name: /Top 3 Recommendations for You/i })
      ).toBeInTheDocument();
    });

    it('should render the description text', () => {
      const recommendations = createMockRecommendations(3);
      render(<RecommendationsList recommendations={recommendations} />);

      expect(
        screen.getByText(/Personalized tools based on your diagnostic results/i)
      ).toBeInTheDocument();
    });
  });

  describe('Recommendations display', () => {
    it('should render all recommendations', () => {
      const recommendations = createMockRecommendations(3);
      render(<RecommendationsList recommendations={recommendations} />);

      expect(screen.getByText(/Tool 3:/)).toBeInTheDocument();
      expect(screen.getByText(/Tool 4:/)).toBeInTheDocument();
      expect(screen.getByText(/Tool 6:/)).toBeInTheDocument();
    });

    it('should display rank indicators for each card', () => {
      const recommendations = createMockRecommendations(3);
      render(<RecommendationsList recommendations={recommendations} />);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should work with fewer than 3 recommendations', () => {
      const recommendations = createMockRecommendations(1);
      render(<RecommendationsList recommendations={recommendations} />);

      expect(screen.getByText(/Tool 3:/)).toBeInTheDocument();
      expect(screen.queryByText(/Tool 4:/)).not.toBeInTheDocument();
    });
  });

  describe('Methodology attribution', () => {
    it('should display "Based on The Last Paradigm methodology"', () => {
      const recommendations = createMockRecommendations(3);
      render(<RecommendationsList recommendations={recommendations} />);

      expect(
        screen.getByText(/Based on The Last Paradigm methodology/i)
      ).toBeInTheDocument();
    });
  });

  describe('Loading state', () => {
    it('should show loading skeleton when isLoading is true', () => {
      render(<RecommendationsList recommendations={[]} isLoading={true} />);

      expect(
        screen.getByText(/Loading your personalized recommendations/i)
      ).toBeInTheDocument();
    });

    it('should have aria-busy when loading', () => {
      render(<RecommendationsList recommendations={[]} isLoading={true} />);

      const section = screen.getByLabelText('Loading recommendations');
      expect(section).toHaveAttribute('aria-busy', 'true');
    });

    it('should render 3 skeleton cards', () => {
      render(<RecommendationsList recommendations={[]} isLoading={true} />);

      // Skeletons have animate-pulse class
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBe(3);
    });
  });

  describe('Empty state', () => {
    it('should show empty state when no recommendations', () => {
      render(<RecommendationsList recommendations={[]} />);

      expect(
        screen.getByText(/No Recommendations Available/i)
      ).toBeInTheDocument();
    });

    it('should show guidance text in empty state', () => {
      render(<RecommendationsList recommendations={[]} />);

      expect(
        screen.getByText(/Complete more diagnostic tools/i)
      ).toBeInTheDocument();
    });

    it('should handle undefined recommendations', () => {
      // @ts-expect-error - testing edge case
      render(<RecommendationsList recommendations={undefined} />);

      expect(
        screen.getByText(/No Recommendations Available/i)
      ).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have appropriate section aria-label', () => {
      const recommendations = createMockRecommendations(3);
      render(<RecommendationsList recommendations={recommendations} />);

      expect(screen.getByLabelText('Tool recommendations')).toBeInTheDocument();
    });

    it('should have list role on recommendations container', () => {
      const recommendations = createMockRecommendations(3);
      render(<RecommendationsList recommendations={recommendations} />);

      expect(
        screen.getByRole('list', { name: /Ranked recommendations/i })
      ).toBeInTheDocument();
    });

    it('should have listitem role on each recommendation', () => {
      const recommendations = createMockRecommendations(3);
      render(<RecommendationsList recommendations={recommendations} />);

      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(3);
    });
  });

  describe('Responsive layout', () => {
    it('should apply grid layout classes', () => {
      const recommendations = createMockRecommendations(3);
      render(<RecommendationsList recommendations={recommendations} />);

      const grid = screen.getByRole('list', { name: /Ranked recommendations/i });
      expect(grid).toHaveClass('grid');
      expect(grid).toHaveClass('lg:grid-cols-3');
    });
  });

  describe('Custom className', () => {
    it('should apply custom className to section', () => {
      const recommendations = createMockRecommendations(3);
      render(
        <RecommendationsList
          recommendations={recommendations}
          className="custom-class"
        />
      );

      const section = screen.getByLabelText('Tool recommendations');
      expect(section).toHaveClass('custom-class');
    });
  });

  describe('Integration with RecommendationCard', () => {
    it('should pass recommendations to cards correctly', () => {
      const recommendations = createMockRecommendations(2);
      render(<RecommendationsList recommendations={recommendations} />);

      // Check that reasoning from cards is displayed
      expect(
        screen.getByText(/Test reasoning for tool 3/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Test reasoning for tool 4/i)
      ).toBeInTheDocument();
    });

    it('should render priority badges from cards', () => {
      const recommendations = createMockRecommendations(3);
      render(<RecommendationsList recommendations={recommendations} />);

      expect(screen.getByText('critical')).toBeInTheDocument();
      expect(screen.getByText('high')).toBeInTheDocument();
      expect(screen.getByText('moderate')).toBeInTheDocument();
    });
  });
});
