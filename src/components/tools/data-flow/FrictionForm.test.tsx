/**
 * Tests for FrictionForm component
 *
 * Story 12.2: Friction Point Identification
 * Task 8.3: Unit tests for FrictionForm component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FrictionForm } from './FrictionForm';
import type { DataStage } from './journey-constants';

describe('FrictionForm', () => {
  const mockStages: DataStage[] = [
    {
      id: 'stage_1',
      type: 'source',
      systemName: 'Salesforce',
      owner: 'Sales Team',
      latency: 2,
      latencyUnit: 'hours',
      order: 0,
    },
    {
      id: 'stage_2',
      type: 'storage',
      systemName: 'Data Lake',
      owner: 'Data Team',
      latency: 1,
      latencyUnit: 'days',
      order: 1,
    },
  ];

  const defaultProps = {
    stages: mockStages,
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders category selector', () => {
    render(<FrictionForm {...defaultProps} />);

    expect(screen.getByLabelText('Friction Category')).toBeInTheDocument();
  });

  it('renders stage selector', () => {
    render(<FrictionForm {...defaultProps} />);

    expect(screen.getByLabelText('Associated Stage')).toBeInTheDocument();
  });

  it('renders description textarea', () => {
    render(<FrictionForm {...defaultProps} />);

    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });

  it('renders severity scoring section', () => {
    render(<FrictionForm {...defaultProps} />);

    expect(screen.getByText('Severity Scoring')).toBeInTheDocument();
    expect(screen.getByText('Frequency')).toBeInTheDocument();
    expect(screen.getByText('Manual Effort')).toBeInTheDocument();
    expect(screen.getByText('Business Impact')).toBeInTheDocument();
  });

  it('shows error when submitting without category', async () => {
    render(<FrictionForm {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /Add Friction Point/i }));

    expect(await screen.findByText('Category is required')).toBeInTheDocument();
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it('shows error when submitting without description', async () => {
    render(<FrictionForm {...defaultProps} />);

    await userEvent.type(screen.getByLabelText('Description'), '   ');
    fireEvent.click(screen.getByRole('button', { name: /Add Friction Point/i }));

    expect(await screen.findByText('Description is required')).toBeInTheDocument();
  });

  it('calls onCancel when cancel button clicked', () => {
    const onCancel = vi.fn();
    render(<FrictionForm {...defaultProps} onCancel={onCancel} />);

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('shows Save Changes button in edit mode', () => {
    render(<FrictionForm {...defaultProps} isEdit />);

    expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
  });

  it('shows Add Friction Point button in create mode', () => {
    render(<FrictionForm {...defaultProps} />);

    expect(
      screen.getByRole('button', { name: /Add Friction Point/i })
    ).toBeInTheDocument();
  });

  it('pre-fills initial data when provided', () => {
    render(
      <FrictionForm
        {...defaultProps}
        initialData={{
          description: 'Existing friction description',
          stageId: 'stage_1',
        }}
      />
    );

    expect(screen.getByLabelText('Description')).toHaveValue(
      'Existing friction description'
    );
  });

  it('shows message when no stages available', () => {
    render(<FrictionForm {...defaultProps} stages={[]} />);

    expect(
      screen.getByText('No stages available. Add stages to the journey first.')
    ).toBeInTheDocument();
  });

  it('shows total severity score', () => {
    render(<FrictionForm {...defaultProps} />);

    // Default severity is 2+2+2 = 6
    expect(screen.getByText(/Total: 6/)).toBeInTheDocument();
  });

  it('severity buttons are clickable', () => {
    render(<FrictionForm {...defaultProps} />);

    // Click the "3 - High" button for Frequency
    const highButtons = screen.getAllByText('3 - High');
    fireEvent.click(highButtons[0]);

    // Total should now be 3+2+2 = 7
    expect(screen.getByText(/Total: 7/)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <FrictionForm {...defaultProps} className="custom-class" />
    );

    expect(container.querySelector('form')).toHaveClass('custom-class');
  });

  it('clears error when description is typed', async () => {
    render(<FrictionForm {...defaultProps} />);

    // Submit empty to show error
    fireEvent.click(screen.getByRole('button', { name: /Add Friction Point/i }));
    expect(await screen.findByText('Description is required')).toBeInTheDocument();

    // Type in description
    await userEvent.type(screen.getByLabelText('Description'), 'Valid description');

    // Error should be cleared
    expect(screen.queryByText('Description is required')).not.toBeInTheDocument();
  });
});
