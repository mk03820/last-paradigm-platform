/**
 * DiagnosticPreviewCardGrid Component Tests
 *
 * Story 16.3: Preview Cards with Blur Effect
 * Task 9.6: Test responsive layout at different viewport sizes
 * Task 9.8: Integration test rendering multiple preview cards together
 * Covers: AC6, AC8
 */

import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DiagnosticPreviewCardGrid } from './DiagnosticPreviewCardGrid';
import { getPB2Tool } from '@/lib/pb2-tools/tool-catalog';
import type { ToolRecommendation } from '@/lib/pb2-tools/types';

// Mock recommendations data
const mockRecommendations: ToolRecommendation[] = [
  {
    rank: 1,
    toolId: 3,
    tool: getPB2Tool(3)!,
    reasoning: 'Your decision velocity of 21 days is 3.0x slower than the benchmark.',
    triggerMetric: 'Decision Velocity',
    triggerValue: '21 days',
    benchmarkValue: '7 days',
    severityScore: 2.5,
    priority: 'critical',
  },
  {
    rank: 2,
    toolId: 4,
    tool: getPB2Tool(4)!,
    reasoning: 'Your meetings show 45% waste, exceeding the 30% threshold.',
    triggerMetric: 'Meeting Waste',
    triggerValue: '45%',
    benchmarkValue: '15%',
    severityScore: 1.8,
    priority: 'high',
  },
  {
    rank: 3,
    toolId: 6,
    tool: getPB2Tool(6)!,
    reasoning: 'Your organization loses $8M annually to data friction.',
    triggerMetric: 'Data Friction Cost',
    triggerValue: 8000000,
    benchmarkValue: 5000000,
    severityScore: 1.2,
    priority: 'moderate',
  },
];

describe('DiagnosticPreviewCardGrid', () => {
  describe('Task 9.8: Integration test rendering multiple preview cards together (AC6)', () => {
    it('should render all recommendation cards', () => {
      render(<DiagnosticPreviewCardGrid recommendations={mockRecommendations} />);

      // Check all three cards are rendered
      expect(screen.getByText(/Tool 3:/)).toBeInTheDocument();
      expect(screen.getByText(/Tool 4:/)).toBeInTheDocument();
      expect(screen.getByText(/Tool 6:/)).toBeInTheDocument();
    });

    it('should display section header', () => {
      render(<DiagnosticPreviewCardGrid recommendations={mockRecommendations} />);

      expect(screen.getByText('Top 3 Recommendations for You')).toBeInTheDocument();
      expect(
        screen.getByText('Personalized tools based on your diagnostic results')
      ).toBeInTheDocument();
    });

    it('should render cards with correct roles for accessibility', () => {
      render(<DiagnosticPreviewCardGrid recommendations={mockRecommendations} />);

      const list = screen.getByRole('list', { name: 'Ranked recommendations' });
      expect(list).toBeInTheDocument();

      const listItems = within(list).getAllByRole('listitem');
      expect(listItems).toHaveLength(3);
    });

    it('should render each card with appropriate diagnostic data', () => {
      render(<DiagnosticPreviewCardGrid recommendations={mockRecommendations} />);

      // Card 1: Decision Velocity
      expect(screen.getByText(/Decision Velocity:/)).toBeInTheDocument();
      expect(screen.getByText('21 days')).toBeInTheDocument();

      // Card 2: Meeting Waste
      expect(screen.getByText(/Meeting Waste:/)).toBeInTheDocument();
      expect(screen.getByText('45%')).toBeInTheDocument();

      // Card 3: Data Friction Cost (formatted as currency)
      expect(screen.getByText(/Data Friction Cost:/)).toBeInTheDocument();
      expect(screen.getByText('$8.0M')).toBeInTheDocument();
    });

    it('should display methodology attribution footer', () => {
      render(<DiagnosticPreviewCardGrid recommendations={mockRecommendations} />);

      expect(
        screen.getByText('Based on The Last Paradigm methodology')
      ).toBeInTheDocument();
    });

    it('should render rank indicators for each card', () => {
      render(<DiagnosticPreviewCardGrid recommendations={mockRecommendations} />);

      expect(screen.getByLabelText('Rank 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Rank 2')).toBeInTheDocument();
      expect(screen.getByLabelText('Rank 3')).toBeInTheDocument();
    });

    it('should render priority badges for each card', () => {
      render(<DiagnosticPreviewCardGrid recommendations={mockRecommendations} />);

      expect(screen.getByText('critical')).toBeInTheDocument();
      expect(screen.getByText('high')).toBeInTheDocument();
      expect(screen.getByText('moderate')).toBeInTheDocument();
    });
  });

  describe('Loading state', () => {
    it('should display loading skeletons when isLoading is true', () => {
      render(
        <DiagnosticPreviewCardGrid recommendations={[]} isLoading={true} />
      );

      expect(screen.getByLabelText('Loading preview cards')).toBeInTheDocument();
      expect(
        screen.getByText('Loading your personalized recommendations...')
      ).toBeInTheDocument();
    });

    it('should show aria-busy when loading', () => {
      const { container } = render(
        <DiagnosticPreviewCardGrid recommendations={[]} isLoading={true} />
      );

      const section = container.querySelector('[aria-busy="true"]');
      expect(section).toBeInTheDocument();
    });
  });

  describe('Empty state', () => {
    it('should display empty state when no recommendations', () => {
      render(<DiagnosticPreviewCardGrid recommendations={[]} />);

      expect(
        screen.getByText('No Recommendations Available')
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Complete more diagnostic tools to receive personalized tool recommendations.'
        )
      ).toBeInTheDocument();
    });

    it('should display empty state for undefined recommendations', () => {
      render(
        <DiagnosticPreviewCardGrid
          recommendations={undefined as unknown as ToolRecommendation[]}
        />
      );

      expect(
        screen.getByText('No Recommendations Available')
      ).toBeInTheDocument();
    });
  });

  describe('Task 9.6: Test responsive layout at different viewport sizes (AC8)', () => {
    it('should have responsive grid classes', () => {
      const { container } = render(
        <DiagnosticPreviewCardGrid recommendations={mockRecommendations} />
      );

      const grid = container.querySelector('[role="list"]');
      expect(grid).toHaveClass('grid-cols-1');
      expect(grid).toHaveClass('md:grid-cols-2');
      expect(grid).toHaveClass('lg:grid-cols-3');
    });

    it('should have consistent gap between cards', () => {
      const { container } = render(
        <DiagnosticPreviewCardGrid recommendations={mockRecommendations} />
      );

      const grid = container.querySelector('[role="list"]');
      expect(grid).toHaveClass('gap-6');
    });
  });

  describe('Card click handling', () => {
    it('should call onCardClick with tool ID when card is clicked', async () => {
      const handleCardClick = vi.fn();
      render(
        <DiagnosticPreviewCardGrid
          recommendations={mockRecommendations}
          onCardClick={handleCardClick}
        />
      );

      // Find and click the first card
      const cards = screen.getAllByRole('article');
      await userEvent.click(cards[0]);

      expect(handleCardClick).toHaveBeenCalledWith(3);
    });

    it('should call onCardClick with correct tool ID for each card', async () => {
      const handleCardClick = vi.fn();
      render(
        <DiagnosticPreviewCardGrid
          recommendations={mockRecommendations}
          onCardClick={handleCardClick}
        />
      );

      const cards = screen.getAllByRole('article');

      // Click second card
      await userEvent.click(cards[1]);
      expect(handleCardClick).toHaveBeenCalledWith(4);

      // Click third card
      await userEvent.click(cards[2]);
      expect(handleCardClick).toHaveBeenCalledWith(6);
    });

    it('should not add click handler when onCardClick is not provided', () => {
      render(<DiagnosticPreviewCardGrid recommendations={mockRecommendations} />);

      const cards = screen.getAllByRole('article');
      cards.forEach((card) => {
        expect(card).not.toHaveAttribute('tabindex');
      });
    });
  });

  describe('Custom className', () => {
    it('should apply custom className to container', () => {
      const { container } = render(
        <DiagnosticPreviewCardGrid
          recommendations={mockRecommendations}
          className="custom-class"
        />
      );

      const section = container.querySelector('section');
      expect(section).toHaveClass('custom-class');
    });
  });

  describe('Consistent card styling (AC6)', () => {
    it('should render all cards with unlock overlay', () => {
      render(<DiagnosticPreviewCardGrid recommendations={mockRecommendations} />);

      // All cards should have unlock CTA
      const unlockTexts = screen.getAllByText('Unlock with Playbook 2');
      expect(unlockTexts).toHaveLength(3);
    });

    it('should render blur effect on all locked content zones', () => {
      const { container } = render(
        <DiagnosticPreviewCardGrid recommendations={mockRecommendations} />
      );

      // Find all blurred zones
      const blurredZones = container.querySelectorAll('.blur-\\[6px\\]');
      expect(blurredZones.length).toBeGreaterThanOrEqual(3);
    });

    it('should apply consistent border treatment based on priority', () => {
      const { container } = render(
        <DiagnosticPreviewCardGrid recommendations={mockRecommendations} />
      );

      const cards = container.querySelectorAll('[data-slot="card"]');
      expect(cards[0]).toHaveClass('border-l-red-600'); // critical
      expect(cards[1]).toHaveClass('border-l-amber-500'); // high
      expect(cards[2]).toHaveClass('border-l-blue-500'); // moderate
    });
  });

  describe('Section accessibility', () => {
    it('should have proper section aria-label', () => {
      render(<DiagnosticPreviewCardGrid recommendations={mockRecommendations} />);

      const section = screen.getByRole('region', { name: 'Tool recommendations' });
      expect(section).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      render(<DiagnosticPreviewCardGrid recommendations={mockRecommendations} />);

      const heading = screen.getByRole('heading', {
        level: 2,
        name: 'Top 3 Recommendations for You',
      });
      expect(heading).toBeInTheDocument();
    });
  });

  describe('Snapshot tests', () => {
    it('should match snapshot with recommendations', () => {
      const { container } = render(
        <DiagnosticPreviewCardGrid recommendations={mockRecommendations} />
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for loading state', () => {
      const { container } = render(
        <DiagnosticPreviewCardGrid recommendations={[]} isLoading={true} />
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for empty state', () => {
      const { container } = render(
        <DiagnosticPreviewCardGrid recommendations={[]} />
      );

      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
