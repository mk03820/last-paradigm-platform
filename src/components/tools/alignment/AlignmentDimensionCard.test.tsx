import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AlignmentDimensionCard } from './AlignmentDimensionCard';
import { ALIGNMENT_DIMENSIONS } from './constants';

/**
 * AlignmentDimensionCard Tests
 *
 * Tests the dimension scoring card component.
 *
 * Story 9.1: Alignment Dimension Scoring Interface
 */

// Mock the tooltip provider
vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip-content">{children}</div>
  ),
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockDimension = ALIGNMENT_DIMENSIONS[0]; // Strategic Alignment

describe('AlignmentDimensionCard', () => {
  const mockOnScoreSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('displays dimension label', () => {
      render(
        <AlignmentDimensionCard
          dimension={mockDimension}
          onScoreSelect={mockOnScoreSelect}
        />
      );

      expect(screen.getByText('Strategic Alignment')).toBeInTheDocument();
    });

    it('displays dimension description', () => {
      render(
        <AlignmentDimensionCard
          dimension={mockDimension}
          onScoreSelect={mockOnScoreSelect}
        />
      );

      expect(
        screen.getByText('How well strategy translates into operational priorities')
      ).toBeInTheDocument();
    });

    it('displays dimension weight', () => {
      render(
        <AlignmentDimensionCard
          dimension={mockDimension}
          onScoreSelect={mockOnScoreSelect}
        />
      );

      expect(screen.getByText('Weight: 30%')).toBeInTheDocument();
    });

    it('renders 4 score buttons', () => {
      render(
        <AlignmentDimensionCard
          dimension={mockDimension}
          onScoreSelect={mockOnScoreSelect}
        />
      );

      const buttons = screen.getAllByRole('radio');
      expect(buttons).toHaveLength(4);
    });

    it('displays score labels', () => {
      render(
        <AlignmentDimensionCard
          dimension={mockDimension}
          onScoreSelect={mockOnScoreSelect}
        />
      );

      // Labels appear in buttons (as span elements with specific class)
      const buttons = screen.getAllByRole('radio');
      expect(buttons[0]).toHaveTextContent('Chaos');
      expect(buttons[1]).toHaveTextContent('Siloed');
      expect(buttons[2]).toHaveTextContent('Coordinated');
      expect(buttons[3]).toHaveTextContent('Integrated');
    });
  });

  describe('score selection', () => {
    it('calls onScoreSelect when button clicked', () => {
      render(
        <AlignmentDimensionCard
          dimension={mockDimension}
          onScoreSelect={mockOnScoreSelect}
        />
      );

      const buttons = screen.getAllByRole('radio');
      fireEvent.click(buttons[0]); // Chaos button

      expect(mockOnScoreSelect).toHaveBeenCalledWith('strategic', 1);
    });

    it('calls onScoreSelect with correct score for each level', () => {
      render(
        <AlignmentDimensionCard
          dimension={mockDimension}
          onScoreSelect={mockOnScoreSelect}
        />
      );

      const buttons = screen.getAllByRole('radio');
      fireEvent.click(buttons[3]); // Integrated button (score 4)

      expect(mockOnScoreSelect).toHaveBeenCalledWith('strategic', 4);
    });

    it('shows check icon on selected score', () => {
      render(
        <AlignmentDimensionCard
          dimension={mockDimension}
          selectedScore={2}
          onScoreSelect={mockOnScoreSelect}
        />
      );

      const buttons = screen.getAllByRole('radio');
      expect(buttons[1]).toHaveAttribute('aria-checked', 'true'); // Siloed is index 1
    });

    it('displays selected score text', () => {
      render(
        <AlignmentDimensionCard
          dimension={mockDimension}
          selectedScore={3}
          onScoreSelect={mockOnScoreSelect}
        />
      );

      expect(screen.getByText('Selected: Coordinated')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has radiogroup role', () => {
      render(
        <AlignmentDimensionCard
          dimension={mockDimension}
          onScoreSelect={mockOnScoreSelect}
        />
      );

      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });

    it('has aria-label for radiogroup', () => {
      render(
        <AlignmentDimensionCard
          dimension={mockDimension}
          onScoreSelect={mockOnScoreSelect}
        />
      );

      expect(screen.getByRole('radiogroup')).toHaveAttribute(
        'aria-label',
        'Score for Strategic Alignment'
      );
    });

    it('each button has role radio', () => {
      render(
        <AlignmentDimensionCard
          dimension={mockDimension}
          onScoreSelect={mockOnScoreSelect}
        />
      );

      const radios = screen.getAllByRole('radio');
      expect(radios).toHaveLength(4);
    });

    it('buttons have descriptive aria-label', () => {
      render(
        <AlignmentDimensionCard
          dimension={mockDimension}
          onScoreSelect={mockOnScoreSelect}
        />
      );

      const chaosRadio = screen.getAllByRole('radio')[0];
      expect(chaosRadio).toHaveAttribute(
        'aria-label',
        expect.stringContaining('Chaos')
      );
    });
  });

  describe('keyboard navigation', () => {
    it('selects next score on ArrowRight', () => {
      render(
        <AlignmentDimensionCard
          dimension={mockDimension}
          selectedScore={2}
          onScoreSelect={mockOnScoreSelect}
        />
      );

      const buttons = screen.getAllByRole('radio');
      fireEvent.keyDown(buttons[1], { key: 'ArrowRight' }); // Siloed button

      expect(mockOnScoreSelect).toHaveBeenCalledWith('strategic', 3);
    });

    it('selects previous score on ArrowLeft', () => {
      render(
        <AlignmentDimensionCard
          dimension={mockDimension}
          selectedScore={3}
          onScoreSelect={mockOnScoreSelect}
        />
      );

      const buttons = screen.getAllByRole('radio');
      fireEvent.keyDown(buttons[2], { key: 'ArrowLeft' }); // Coordinated button

      expect(mockOnScoreSelect).toHaveBeenCalledWith('strategic', 2);
    });
  });
});
