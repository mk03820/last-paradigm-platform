import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AlignmentScorer } from './AlignmentScorer';
import { useTool1Store } from '@/lib/store/tool1-store';

/**
 * AlignmentScorer Tests
 *
 * Tests the alignment scoring container component.
 *
 * Story 9.1: Alignment Dimension Scoring Interface
 */

// Mock navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock the tooltip provider
vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip-content">{children}</div>
  ),
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('AlignmentScorer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the store
    useTool1Store.getState().resetTool1();
  });

  describe('rendering', () => {
    it('displays all 5 dimension cards', () => {
      render(<AlignmentScorer />);

      expect(screen.getByText('Strategic Alignment')).toBeInTheDocument();
      expect(screen.getByText('Execution Alignment')).toBeInTheDocument();
      expect(screen.getByText('Technology Alignment')).toBeInTheDocument();
      expect(screen.getByText('People Alignment')).toBeInTheDocument();
      expect(screen.getByText('Governance Alignment')).toBeInTheDocument();
    });

    it('displays progress indicator', () => {
      render(<AlignmentScorer />);

      expect(screen.getByText('0 of 5 dimensions scored')).toBeInTheDocument();
    });

    it('displays progress bar', () => {
      render(<AlignmentScorer />);

      expect(screen.getByLabelText('Scoring progress')).toBeInTheDocument();
    });
  });

  describe('progress tracking', () => {
    it('updates progress when dimension scored', () => {
      render(<AlignmentScorer />);

      // Click a score button for strategic dimension
      const chaosButtons = screen.getAllByText('Chaos');
      fireEvent.click(chaosButtons[0].closest('button')!);

      expect(screen.getByText('1 of 5 dimensions scored')).toBeInTheDocument();
    });

    it('shows percentage complete', () => {
      render(<AlignmentScorer />);

      expect(screen.getByText('0%')).toBeInTheDocument();

      // Score one dimension
      const chaosButtons = screen.getAllByText('Chaos');
      fireEvent.click(chaosButtons[0].closest('button')!);

      expect(screen.getByText('20%')).toBeInTheDocument();
    });
  });

  describe('completion validation', () => {
    it('shows remaining dimensions message when incomplete', () => {
      render(<AlignmentScorer />);

      expect(
        screen.getByText('Score all 5 dimensions to see your results')
      ).toBeInTheDocument();
    });

    it('disables See Results button when incomplete', () => {
      render(<AlignmentScorer />);

      const button = screen.getByRole('button', { name: /5 dimensions remaining/i });
      expect(button).toBeDisabled();
    });

    it('enables See Results button when all scored', () => {
      // Pre-fill all scores
      const store = useTool1Store.getState();
      store.setScore('strategic', 3);
      store.setScore('execution', 3);
      store.setScore('technology', 3);
      store.setScore('people', 3);
      store.setScore('governance', 3);

      render(<AlignmentScorer />);

      const button = screen.getByRole('button', { name: 'See Results' });
      expect(button).not.toBeDisabled();
    });

    it('updates button text based on remaining count', () => {
      const store = useTool1Store.getState();
      store.setScore('strategic', 3);
      store.setScore('execution', 3);

      render(<AlignmentScorer />);

      expect(
        screen.getByRole('button', { name: '3 dimensions remaining' })
      ).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    it('navigates to results page when complete and button clicked', () => {
      // Pre-fill all scores
      const store = useTool1Store.getState();
      store.setScore('strategic', 3);
      store.setScore('execution', 3);
      store.setScore('technology', 3);
      store.setScore('people', 3);
      store.setScore('governance', 3);

      render(<AlignmentScorer />);

      const button = screen.getByRole('button', { name: 'See Results' });
      fireEvent.click(button);

      expect(mockPush).toHaveBeenCalledWith('/tool/alignment/results');
    });

    it('does not navigate when incomplete', () => {
      const store = useTool1Store.getState();
      store.setScore('strategic', 3);

      render(<AlignmentScorer />);

      const button = screen.getByRole('button', { name: /dimensions remaining/i });
      fireEvent.click(button);

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('store integration', () => {
    it('persists scores to store when selected', () => {
      render(<AlignmentScorer />);

      // Score strategic dimension
      const chaosButtons = screen.getAllByText('Chaos');
      fireEvent.click(chaosButtons[0].closest('button')!);

      const store = useTool1Store.getState();
      expect(store.scores.strategic).toBe(1);
    });

    it('restores scores from store on mount', () => {
      // Pre-fill score
      useTool1Store.getState().setScore('strategic', 4);

      render(<AlignmentScorer />);

      // Verify the card shows selected state
      expect(screen.getByText('Selected: Integrated')).toBeInTheDocument();
    });
  });
});
