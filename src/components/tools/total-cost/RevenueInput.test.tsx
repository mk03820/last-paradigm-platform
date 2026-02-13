/**
 * RevenueInput Tests
 *
 * Story 14.2: Additional Cost Category Inputs
 * Task 10.2: Unit tests for cost input components
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RevenueInput } from './RevenueInput';

describe('RevenueInput', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render revenue input field', () => {
    render(<RevenueInput value={0} onChange={mockOnChange} />);

    expect(screen.getByLabelText(/Annual Revenue/i)).toBeInTheDocument();
  });

  it('should display current value', () => {
    render(<RevenueInput value={50000000} onChange={mockOnChange} />);

    const input = screen.getByLabelText(/Annual Revenue/i);
    expect(input).toHaveValue(50000000);
  });

  it('should call onChange when value changes', async () => {
    const user = userEvent.setup();
    render(<RevenueInput value={0} onChange={mockOnChange} />);

    const input = screen.getByLabelText(/Annual Revenue/i);
    await user.type(input, '25000000');

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('should render title and description', () => {
    render(<RevenueInput value={0} onChange={mockOnChange} />);

    expect(screen.getByText('Company Revenue')).toBeInTheDocument();
    expect(screen.getByText(/Required to calculate alignment tax/i)).toBeInTheDocument();
  });

  it('should show prompt when revenue is 0', () => {
    render(<RevenueInput value={0} onChange={mockOnChange} />);

    expect(screen.getByText(/Enter your annual revenue/i)).toBeInTheDocument();
  });

  it('should show alignment tax percentage when revenue and cost are provided', () => {
    render(
      <RevenueInput
        value={50000000}
        onChange={mockOnChange}
        totalCost={1500000}
      />
    );

    expect(screen.getByText('3.00%')).toBeInTheDocument();
  });

  it('should not show percentage when revenue is 0', () => {
    render(
      <RevenueInput
        value={0}
        onChange={mockOnChange}
        totalCost={1500000}
      />
    );

    expect(screen.queryByText(/%$/)).not.toBeInTheDocument();
  });

  it('should not show percentage when totalCost is 0', () => {
    render(
      <RevenueInput
        value={50000000}
        onChange={mockOnChange}
        totalCost={0}
      />
    );

    expect(screen.queryByText(/Alignment Tax$/i)).not.toBeInTheDocument();
  });

  it('should display formatted revenue values', () => {
    render(
      <RevenueInput
        value={50000000}
        onChange={mockOnChange}
        totalCost={2500000}
      />
    );

    // Should show formatted currency values in the summary (as separate spans)
    expect(screen.getByText(/\$2.5M/)).toBeInTheDocument();
    expect(screen.getByText(/\$50.0M/)).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <RevenueInput
        value={0}
        onChange={mockOnChange}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should handle clearing input to 0', async () => {
    const user = userEvent.setup();
    render(<RevenueInput value={50000000} onChange={mockOnChange} />);

    const input = screen.getByLabelText(/Annual Revenue/i);
    await user.clear(input);

    expect(mockOnChange).toHaveBeenCalledWith(0);
  });
});
