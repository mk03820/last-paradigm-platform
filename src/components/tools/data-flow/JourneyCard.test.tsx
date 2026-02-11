/**
 * Tests for JourneyCard component
 *
 * Story 12.1: Data Journey Mapping Interface
 * Task 9.5: Unit tests for JourneyCard component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { JourneyCard } from './JourneyCard';
import type { DataJourney, DataStage } from './journey-constants';

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

describe('JourneyCard', () => {
  const defaultProps = {
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders journey name', () => {
    const journey = createJourney({ name: 'Customer 360' });
    render(<JourneyCard journey={journey} {...defaultProps} />);

    expect(screen.getByText('Customer 360')).toBeInTheDocument();
  });

  it('renders journey description when present', () => {
    const journey = createJourney({
      description: 'Customer data from CRM to dashboards',
    });
    render(<JourneyCard journey={journey} {...defaultProps} />);

    expect(
      screen.getByText('Customer data from CRM to dashboards')
    ).toBeInTheDocument();
  });

  it('does not render description when absent', () => {
    const journey = createJourney({ description: undefined });
    render(<JourneyCard journey={journey} {...defaultProps} />);

    expect(screen.queryByText(/Customer data/)).not.toBeInTheDocument();
  });

  it('shows stage count', () => {
    const journey = createJourney({
      stages: [
        createStage({ order: 0 }),
        createStage({ order: 1 }),
        createStage({ order: 2 }),
      ],
    });
    render(<JourneyCard journey={journey} {...defaultProps} />);

    expect(screen.getByText('3 stages')).toBeInTheDocument();
  });

  it('shows singular for one stage', () => {
    const journey = createJourney({
      stages: [createStage()],
    });
    render(<JourneyCard journey={journey} {...defaultProps} />);

    expect(screen.getByText('1 stage')).toBeInTheDocument();
  });

  it('shows total latency', () => {
    const journey = createJourney({
      stages: [
        createStage({ latency: 2, latencyUnit: 'hours', order: 0 }),
        createStage({ latency: 4, latencyUnit: 'hours', order: 1 }),
      ],
    });
    render(<JourneyCard journey={journey} {...defaultProps} />);

    expect(screen.getByText('6h total')).toBeInTheDocument();
  });

  it('shows Real-time for zero total latency', () => {
    const journey = createJourney({
      stages: [
        createStage({ latency: 0, order: 0 }),
        createStage({ latency: 0, order: 1 }),
      ],
    });
    render(<JourneyCard journey={journey} {...defaultProps} />);

    expect(screen.getByText('Real-time total')).toBeInTheDocument();
  });

  it('calls onEdit when edit button clicked', () => {
    const onEdit = vi.fn();
    const journey = createJourney({ name: 'Test' });
    render(<JourneyCard journey={journey} onEdit={onEdit} onDelete={vi.fn()} />);

    fireEvent.click(screen.getByLabelText('Edit Test'));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete when delete button clicked', () => {
    const onDelete = vi.fn();
    const journey = createJourney({ name: 'Test' });
    render(
      <JourneyCard journey={journey} onEdit={vi.fn()} onDelete={onDelete} />
    );

    fireEvent.click(screen.getByLabelText('Delete Test'));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('renders stage pipeline preview', () => {
    const journey = createJourney({
      stages: [
        createStage({ systemName: 'CRM', order: 0 }),
        createStage({ type: 'storage', systemName: 'Warehouse', order: 1 }),
      ],
    });
    render(<JourneyCard journey={journey} {...defaultProps} />);

    expect(screen.getByText('CRM')).toBeInTheDocument();
    expect(screen.getByText('Warehouse')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const journey = createJourney();
    const { container } = render(
      <JourneyCard journey={journey} {...defaultProps} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
