/**
 * Tests for CostForm component
 *
 * Story 12.3: Friction Cost Calculation
 * Task 7.3: Unit tests for CostForm component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CostForm } from './CostForm';

describe('CostForm', () => {
  const defaultProps = {
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders hours per week input', () => {
    render(<CostForm {...defaultProps} />);

    expect(screen.getByLabelText('Hours per Week')).toBeInTheDocument();
  });

  it('renders hourly rate selector', () => {
    render(<CostForm {...defaultProps} />);

    expect(screen.getByLabelText('Blended Hourly Rate')).toBeInTheDocument();
  });

  it('renders opportunity cost input', () => {
    render(<CostForm {...defaultProps} />);

    expect(screen.getByLabelText('Annual Opportunity Cost')).toBeInTheDocument();
  });

  it('shows FTE cost preview', () => {
    render(<CostForm {...defaultProps} />);

    expect(screen.getByText('Annualized FTE Cost')).toBeInTheDocument();
  });

  it('shows total cost', () => {
    render(<CostForm {...defaultProps} />);

    expect(screen.getByText('Total Annual Friction Cost')).toBeInTheDocument();
  });

  it('calculates FTE cost live', async () => {
    render(<CostForm {...defaultProps} />);

    // Get the numeric input (not the range slider)
    const hoursInput = screen.getByRole('spinbutton', { name: '' });
    await userEvent.clear(hoursInput);
    await userEvent.type(hoursInput, '10');

    // Default rate is $75, so 10 * 75 * 48 = $36,000
    // Multiple elements show this value, so use getAllByText
    expect(screen.getAllByText('$36,000').length).toBeGreaterThan(0);
  });

  it('shows Add Cost button in create mode', () => {
    render(<CostForm {...defaultProps} />);

    expect(screen.getByRole('button', { name: 'Add Cost' })).toBeInTheDocument();
  });

  it('shows Update Cost button in edit mode', () => {
    render(<CostForm {...defaultProps} isEdit />);

    expect(screen.getByRole('button', { name: 'Update Cost' })).toBeInTheDocument();
  });

  it('calls onCancel when cancel button clicked', () => {
    const onCancel = vi.fn();
    render(<CostForm {...defaultProps} onCancel={onCancel} />);

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('submits form data', async () => {
    const onSubmit = vi.fn();
    render(<CostForm {...defaultProps} onSubmit={onSubmit} />);

    // Set hours
    const hoursInput = screen.getByRole('spinbutton', { name: '' });
    await userEvent.clear(hoursInput);
    await userEvent.type(hoursInput, '10');

    // Submit
    fireEvent.click(screen.getByRole('button', { name: 'Add Cost' }));

    expect(onSubmit).toHaveBeenCalledWith({
      hoursPerWeek: 10,
      hourlyRate: 75, // default
      opportunityCost: 0,
    });
  });

  it('pre-fills initial data when provided', () => {
    render(
      <CostForm
        {...defaultProps}
        initialData={{
          hoursPerWeek: 15,
          hourlyRate: 100,
          opportunityCost: 5000,
        }}
      />
    );

    const hoursInput = screen.getByRole('spinbutton', { name: '' });
    expect(hoursInput).toHaveValue(15);
  });

  it('constrains hours to max of 40', () => {
    render(<CostForm {...defaultProps} />);

    // The input should have max=40 attribute to constrain values
    const hoursInput = screen.getByRole('spinbutton', { name: '' });
    expect(hoursInput).toHaveAttribute('max', '40');
  });

  it('applies custom className', () => {
    const { container } = render(
      <CostForm {...defaultProps} className="custom-class" />
    );

    expect(container.querySelector('form')).toHaveClass('custom-class');
  });

  it('includes calculation formula in preview', () => {
    render(<CostForm {...defaultProps} />);

    // Should show "hrs × $X/hr × 48 weeks"
    expect(screen.getByText(/hrs × \$\d+\/hr × 48 weeks/)).toBeInTheDocument();
  });
});
