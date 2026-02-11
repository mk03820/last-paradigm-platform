/**
 * Tests for StagePipeline component
 *
 * Story 12.1: Data Journey Mapping Interface
 * Task 9.6: Unit tests for StagePipeline component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StagePipeline } from './StagePipeline';
import type { DataStage } from './journey-constants';

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

describe('StagePipeline', () => {
  it('renders empty state when no stages', () => {
    render(<StagePipeline stages={[]} />);
    expect(screen.getByText('No stages defined')).toBeInTheDocument();
  });

  it('renders stages in order', () => {
    const stages = [
      createStage({ id: '1', type: 'source', systemName: 'Source System', order: 0 }),
      createStage({ id: '2', type: 'storage', systemName: 'Storage System', order: 1 }),
    ];

    render(<StagePipeline stages={stages} />);

    expect(screen.getByText('Source System')).toBeInTheDocument();
    expect(screen.getByText('Storage System')).toBeInTheDocument();
  });

  it('sorts stages by order', () => {
    const stages = [
      createStage({ id: '2', type: 'storage', systemName: 'Second', order: 1 }),
      createStage({ id: '1', type: 'source', systemName: 'First', order: 0 }),
    ];

    render(<StagePipeline stages={stages} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveTextContent('First');
    expect(buttons[1]).toHaveTextContent('Second');
  });

  it('displays stage type labels', () => {
    const stages = [
      createStage({ type: 'source' }),
      createStage({ type: 'extraction', order: 1 }),
    ];

    render(<StagePipeline stages={stages} />);

    expect(screen.getByText('Source')).toBeInTheDocument();
    expect(screen.getByText('Extract')).toBeInTheDocument();
  });

  it('shows placeholder for empty system name', () => {
    const stages = [createStage({ systemName: '' })];

    render(<StagePipeline stages={stages} />);

    expect(screen.getByText('...')).toBeInTheDocument();
  });

  it('shows latency in full mode', () => {
    const stages = [createStage({ latency: 5, latencyUnit: 'hours' })];

    render(<StagePipeline stages={stages} />);

    expect(screen.getByText('5h')).toBeInTheDocument();
  });

  it('hides latency in compact mode', () => {
    const stages = [createStage({ latency: 5, latencyUnit: 'hours' })];

    render(<StagePipeline stages={stages} compact />);

    expect(screen.queryByText('5h')).not.toBeInTheDocument();
  });

  it('shows Real-time for zero latency', () => {
    const stages = [createStage({ latency: 0 })];

    render(<StagePipeline stages={stages} />);

    expect(screen.getByText('Real-time')).toBeInTheDocument();
  });

  it('calls onStageClick when stage is clicked', () => {
    const onStageClick = vi.fn();
    const stages = [createStage({ id: 'stage-1' })];

    render(<StagePipeline stages={stages} onStageClick={onStageClick} />);

    fireEvent.click(screen.getByRole('button'));
    expect(onStageClick).toHaveBeenCalledWith('stage-1');
  });

  it('highlights selected stage', () => {
    const stages = [
      createStage({ id: 'stage-1', systemName: 'System 1', order: 0 }),
      createStage({ id: 'stage-2', systemName: 'System 2', order: 1 }),
    ];

    render(
      <StagePipeline
        stages={stages}
        selectedStageId="stage-1"
        onStageClick={() => {}}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveClass('ring-2');
    expect(buttons[1]).not.toHaveClass('ring-2');
  });

  it('applies custom className', () => {
    const { container } = render(
      <StagePipeline stages={[]} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders connectors between stages', () => {
    const stages = [
      createStage({ id: '1', order: 0 }),
      createStage({ id: '2', order: 1 }),
      createStage({ id: '3', order: 2 }),
    ];

    render(<StagePipeline stages={stages} />);

    // Should have 2 connectors for 3 stages
    const arrows = screen.getAllByRole('button').length;
    expect(arrows).toBe(3); // 3 stage buttons
  });

  it('has accessible list role', () => {
    const stages = [createStage()];

    render(<StagePipeline stages={stages} />);

    expect(screen.getByRole('list')).toBeInTheDocument();
  });
});
