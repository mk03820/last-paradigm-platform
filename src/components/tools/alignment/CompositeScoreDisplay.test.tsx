import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { CompositeScoreDisplay } from './CompositeScoreDisplay';

/**
 * CompositeScoreDisplay Tests
 *
 * Tests the composite score display component.
 *
 * Story 9.2: Weighted Composite Score Calculation
 */

describe('CompositeScoreDisplay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('rendering', () => {
    it('displays the score', () => {
      render(<CompositeScoreDisplay score={3.0} animate={false} />);

      expect(screen.getByText('3.0')).toBeInTheDocument();
    });

    it('displays "out of 4.0" label', () => {
      render(<CompositeScoreDisplay score={2.5} animate={false} />);

      expect(screen.getByText('out of 4.0')).toBeInTheDocument();
    });

    it('displays "Your Alignment Score" heading', () => {
      render(<CompositeScoreDisplay score={2.5} animate={false} />);

      expect(screen.getByText('Your Alignment Score')).toBeInTheDocument();
    });

    it('has region role with aria-label', () => {
      render(<CompositeScoreDisplay score={2.5} animate={false} />);

      expect(screen.getByRole('region', { name: 'Composite alignment score' })).toBeInTheDocument();
    });
  });

  describe('score categories', () => {
    it('shows Chaos category for score below 1.8', () => {
      render(<CompositeScoreDisplay score={1.5} animate={false} />);

      expect(screen.getByText('Chaos')).toBeInTheDocument();
      expect(screen.getByText(/Significant alignment gaps/)).toBeInTheDocument();
    });

    it('shows Siloed category for score 1.8-2.49', () => {
      render(<CompositeScoreDisplay score={2.0} animate={false} />);

      expect(screen.getByText('Siloed')).toBeInTheDocument();
      expect(screen.getByText(/Departments operate independently/)).toBeInTheDocument();
    });

    it('shows Coordinated category for score 2.5-3.29', () => {
      render(<CompositeScoreDisplay score={3.0} animate={false} />);

      expect(screen.getByText('Coordinated')).toBeInTheDocument();
      expect(screen.getByText(/Good alignment with some areas/)).toBeInTheDocument();
    });

    it('shows Integrated category for score 3.3+', () => {
      render(<CompositeScoreDisplay score={3.5} animate={false} />);

      expect(screen.getByText('Integrated')).toBeInTheDocument();
      expect(screen.getByText(/Strong alignment across all/)).toBeInTheDocument();
    });
  });

  describe('animation', () => {
    it('animates score from 0 when animate=true', () => {
      render(<CompositeScoreDisplay score={3.0} animate={true} />);

      // Initially shows 0.0
      expect(screen.getByText('0.0')).toBeInTheDocument();

      // After animation completes
      act(() => {
        vi.advanceTimersByTime(1100);
      });

      expect(screen.getByText('3.0')).toBeInTheDocument();
    });

    it('shows final score immediately when animate=false', () => {
      render(<CompositeScoreDisplay score={2.5} animate={false} />);

      expect(screen.getByText('2.5')).toBeInTheDocument();
    });
  });

  describe('formatting', () => {
    it('formats score to 1 decimal place', () => {
      render(<CompositeScoreDisplay score={2.567} animate={false} />);

      expect(screen.getByText('2.6')).toBeInTheDocument();
    });

    it('shows whole numbers with decimal', () => {
      render(<CompositeScoreDisplay score={3} animate={false} />);

      expect(screen.getByText('3.0')).toBeInTheDocument();
    });
  });
});
