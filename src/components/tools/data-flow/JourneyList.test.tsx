/**
 * Tests for JourneyList component
 *
 * Story 12.1: Data Journey Mapping Interface
 * Task 9.6: Unit tests for JourneyList component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { JourneyList } from './JourneyList';
import type { DataJourney, DataStage } from './journey-constants';
import { MAX_JOURNEYS, RECOMMENDED_MIN_JOURNEYS, RECOMMENDED_MAX_JOURNEYS } from './journey-constants';

function createStage(overrides: Partial<DataStage> = {}): DataStage {
  return {
    id: `stage_${Math.random().toString(36).slice(2)}`,
    type: 'source',
    systemName: 'Test System',
    owner: '',
    latency: 0,
    latencyUnit: 'hours',
    order: 0,
    ...overrides,
  };
}

function createJourney(overrides: Partial<DataJourney> = {}): DataJourney {
  return {
    id: `journey_${Math.random().toString(36).slice(2)}`,
    name: 'Test Journey',
    stages: [
      createStage({ order: 0 }),
      createStage({ type: 'storage', order: 1 }),
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('JourneyList', () => {
  const defaultProps = {
    onAddJourney: vi.fn(),
    onEditJourney: vi.fn(),
    onDeleteJourney: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('empty state', () => {
    it('shows empty state when no journeys', () => {
      render(<JourneyList journeys={[]} {...defaultProps} />);

      expect(screen.getByText('No journeys mapped yet')).toBeInTheDocument();
    });

    it('shows helpful description', () => {
      render(<JourneyList journeys={[]} {...defaultProps} />);

      expect(screen.getByText(/Map 3-5 critical data journeys/)).toBeInTheDocument();
    });

    it('shows create custom journey button in empty state', () => {
      render(<JourneyList journeys={[]} {...defaultProps} />);

      expect(screen.getByRole('button', { name: /Create Custom Journey/i })).toBeInTheDocument();
    });

    it('calls onAddJourney when create button clicked', () => {
      const onAddJourney = vi.fn();
      render(<JourneyList journeys={[]} {...defaultProps} onAddJourney={onAddJourney} />);

      fireEvent.click(screen.getByRole('button', { name: /Create Custom Journey/i }));
      expect(onAddJourney).toHaveBeenCalledTimes(1);
    });

    it('shows quick start templates when onQuickStart provided', () => {
      render(
        <JourneyList
          journeys={[]}
          {...defaultProps}
          onQuickStart={vi.fn()}
        />
      );

      expect(screen.getByText('Quick start with a template:')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Customer 360/i })).toBeInTheDocument();
    });

    it('calls onQuickStart with template ID', () => {
      const onQuickStart = vi.fn();
      render(
        <JourneyList
          journeys={[]}
          {...defaultProps}
          onQuickStart={onQuickStart}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /Customer 360/i }));
      expect(onQuickStart).toHaveBeenCalledWith('customer-360');
    });
  });

  describe('with journeys', () => {
    it('renders journey cards', () => {
      const journeys = [
        createJourney({ name: 'Journey 1' }),
        createJourney({ name: 'Journey 2' }),
      ];
      render(<JourneyList journeys={journeys} {...defaultProps} />);

      expect(screen.getByText('Journey 1')).toBeInTheDocument();
      expect(screen.getByText('Journey 2')).toBeInTheDocument();
    });

    it('shows journey count progress', () => {
      const journeys = [createJourney(), createJourney()];
      render(<JourneyList journeys={journeys} {...defaultProps} />);

      expect(screen.getByText(`2 of ${RECOMMENDED_MAX_JOURNEYS} journeys mapped`)).toBeInTheDocument();
    });

    it('shows minimum recommendation when below threshold', () => {
      const journeys = [createJourney()]; // 1 journey, below RECOMMENDED_MIN_JOURNEYS
      render(<JourneyList journeys={journeys} {...defaultProps} />);

      expect(screen.getByText(/minimum 3 recommended/)).toBeInTheDocument();
    });

    it('shows comprehensive coverage when at recommended max', () => {
      const journeys = Array(RECOMMENDED_MAX_JOURNEYS).fill(null).map(() => createJourney());
      render(<JourneyList journeys={journeys} {...defaultProps} />);

      expect(screen.getByText(/comprehensive coverage/)).toBeInTheDocument();
    });

    it('shows add journey card when below max', () => {
      const journeys = [createJourney()];
      render(<JourneyList journeys={journeys} {...defaultProps} />);

      expect(screen.getByRole('button', { name: /Add Journey/i })).toBeInTheDocument();
    });

    it('hides add journey card when at max', () => {
      const journeys = Array(MAX_JOURNEYS).fill(null).map(() => createJourney());
      render(<JourneyList journeys={journeys} {...defaultProps} />);

      expect(screen.queryByRole('button', { name: /Add Journey/i })).not.toBeInTheDocument();
      expect(screen.getByText(`Maximum of ${MAX_JOURNEYS} journeys reached.`)).toBeInTheDocument();
    });

    it('calls onEditJourney with journey ID', () => {
      const onEditJourney = vi.fn();
      const journey = createJourney({ id: 'journey-123', name: 'Test' });
      render(
        <JourneyList
          journeys={[journey]}
          {...defaultProps}
          onEditJourney={onEditJourney}
        />
      );

      fireEvent.click(screen.getByLabelText('Edit Test'));
      expect(onEditJourney).toHaveBeenCalledWith('journey-123');
    });

    it('calls onDeleteJourney with journey ID', () => {
      const onDeleteJourney = vi.fn();
      const journey = createJourney({ id: 'journey-123', name: 'Test' });
      render(
        <JourneyList
          journeys={[journey]}
          {...defaultProps}
          onDeleteJourney={onDeleteJourney}
        />
      );

      fireEvent.click(screen.getByLabelText('Delete Test'));
      expect(onDeleteJourney).toHaveBeenCalledWith('journey-123');
    });

    it('calls onAddJourney when add button clicked', () => {
      const onAddJourney = vi.fn();
      render(
        <JourneyList
          journeys={[createJourney()]}
          {...defaultProps}
          onAddJourney={onAddJourney}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /Add Journey/i }));
      expect(onAddJourney).toHaveBeenCalledTimes(1);
    });
  });

  it('applies custom className', () => {
    const { container } = render(
      <JourneyList journeys={[]} {...defaultProps} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
