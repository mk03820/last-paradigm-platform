/**
 * Tests for StageEditor component
 *
 * Story 12.1: Data Journey Mapping Interface
 * Task 9.4: Unit tests for StageEditor component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StageEditor } from './StageEditor';
import type { DataStage } from './journey-constants';

function createStage(overrides: Partial<DataStage> = {}): DataStage {
  return {
    id: 'stage-1',
    type: 'source',
    systemName: '',
    owner: '',
    latency: 0,
    latencyUnit: 'hours',
    order: 0,
    ...overrides,
  };
}

describe('StageEditor', () => {
  const defaultProps = {
    onUpdate: vi.fn(),
    onRemove: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders stage type label', () => {
    const stage = createStage({ type: 'source' });
    render(<StageEditor stage={stage} {...defaultProps} />);

    expect(screen.getByText('Source Systems')).toBeInTheDocument();
  });

  it('renders stage type description', () => {
    const stage = createStage({ type: 'extraction' });
    render(<StageEditor stage={stage} {...defaultProps} />);

    expect(screen.getByText(/How data is pulled/)).toBeInTheDocument();
  });

  it('renders system name input', () => {
    const stage = createStage({ systemName: 'Salesforce CRM' });
    render(<StageEditor stage={stage} {...defaultProps} />);

    expect(screen.getByLabelText('System Name')).toHaveValue('Salesforce CRM');
  });

  it('renders owner input', () => {
    const stage = createStage({ owner: 'Data Team' });
    render(<StageEditor stage={stage} {...defaultProps} />);

    expect(screen.getByLabelText('Owner (optional)')).toHaveValue('Data Team');
  });

  it('renders latency input', () => {
    const stage = createStage({ latency: 5 });
    render(<StageEditor stage={stage} {...defaultProps} />);

    expect(screen.getByLabelText('Latency value')).toHaveValue(5);
  });

  it('renders latency unit selector', () => {
    const stage = createStage({ latencyUnit: 'hours' });
    render(<StageEditor stage={stage} {...defaultProps} />);

    expect(screen.getByLabelText('Latency unit')).toBeInTheDocument();
  });

  it('calls onUpdate when system name changes', async () => {
    const onUpdate = vi.fn();
    const stage = createStage();
    render(<StageEditor stage={stage} onUpdate={onUpdate} onRemove={vi.fn()} />);

    const input = screen.getByLabelText('System Name');
    await userEvent.type(input, 'A');

    // onUpdate should be called at least once
    expect(onUpdate).toHaveBeenCalled();
    // Check that the call includes systemName
    expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ systemName: expect.any(String) }));
  });

  it('calls onUpdate when owner changes', async () => {
    const onUpdate = vi.fn();
    const stage = createStage();
    render(<StageEditor stage={stage} onUpdate={onUpdate} onRemove={vi.fn()} />);

    const input = screen.getByLabelText('Owner (optional)');
    await userEvent.type(input, 'Team A');

    expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ owner: expect.any(String) }));
  });

  it('calls onUpdate when latency changes', async () => {
    const onUpdate = vi.fn();
    const stage = createStage();
    render(<StageEditor stage={stage} onUpdate={onUpdate} onRemove={vi.fn()} />);

    const input = screen.getByLabelText('Latency value');
    await userEvent.clear(input);
    await userEvent.type(input, '10');

    expect(onUpdate).toHaveBeenCalled();
  });

  it('calls onRemove when remove button clicked', () => {
    const onRemove = vi.fn();
    const stage = createStage({ type: 'source' });
    render(<StageEditor stage={stage} onUpdate={vi.fn()} onRemove={onRemove} />);

    fireEvent.click(screen.getByLabelText('Remove Source Systems stage'));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('disables remove button when removeDisabled is true', () => {
    const stage = createStage({ type: 'source' });
    render(
      <StageEditor
        stage={stage}
        {...defaultProps}
        removeDisabled={true}
      />
    );

    expect(screen.getByLabelText('Remove Source Systems stage')).toBeDisabled();
  });

  it('shows drag handle when showDragHandle is true', () => {
    const stage = createStage();
    const { container } = render(
      <StageEditor stage={stage} {...defaultProps} showDragHandle={true} />
    );

    // GripVertical icon should be present
    expect(container.querySelector('svg.lucide-grip-vertical')).toBeInTheDocument();
  });

  it('hides drag handle by default', () => {
    const stage = createStage();
    const { container } = render(
      <StageEditor stage={stage} {...defaultProps} />
    );

    expect(container.querySelector('svg.lucide-grip-vertical')).not.toBeInTheDocument();
  });

  it('shows suggestions on focus', async () => {
    const stage = createStage({ type: 'source' });
    render(<StageEditor stage={stage} {...defaultProps} />);

    const input = screen.getByLabelText('System Name');
    await userEvent.click(input);

    // Should show at least one suggestion
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const stage = createStage();
    const { container } = render(
      <StageEditor stage={stage} {...defaultProps} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('applies stage type styling', () => {
    const stage = createStage({ type: 'source' });
    const { container } = render(<StageEditor stage={stage} {...defaultProps} />);

    // Should have blue styling for source type
    expect(container.firstChild).toHaveClass('border-blue-500');
  });
});
