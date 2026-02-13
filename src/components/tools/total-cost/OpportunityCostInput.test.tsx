/**
 * OpportunityCostInput Tests
 *
 * Story 14.2: Additional Cost Category Inputs
 * Task 10.2: Unit tests for cost input components
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OpportunityCostInput } from './OpportunityCostInput';
import { createDefaultOpportunityCostInput } from './cost-constants';

describe('OpportunityCostInput', () => {
  const defaultData = createDefaultOpportunityCostInput();
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all input fields', () => {
    render(<OpportunityCostInput data={defaultData} onChange={mockOnChange} />);

    expect(screen.getByLabelText(/Delayed Revenue/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Missed Deals/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Market Share Loss/i)).toBeInTheDocument();
  });

  it('should display current values', () => {
    const data = {
      delayedRevenue: 500000,
      missedDeals: 250000,
      marketShareLoss: 1000000,
      subtotal: 1750000,
    };

    render(<OpportunityCostInput data={data} onChange={mockOnChange} />);

    const delayedInput = screen.getByLabelText(/Delayed Revenue/i);
    const missedInput = screen.getByLabelText(/Missed Deals/i);
    const marketInput = screen.getByLabelText(/Market Share Loss/i);

    expect(delayedInput).toHaveValue(500000);
    expect(missedInput).toHaveValue(250000);
    expect(marketInput).toHaveValue(1000000);
  });

  it('should call onChange when delayed revenue changes', async () => {
    const user = userEvent.setup();
    render(<OpportunityCostInput data={defaultData} onChange={mockOnChange} />);

    const input = screen.getByLabelText(/Delayed Revenue/i);
    await user.clear(input);
    await user.type(input, '600000');

    expect(mockOnChange).toHaveBeenCalledWith({ delayedRevenue: expect.any(Number) });
  });

  it('should call onChange when missed deals changes', async () => {
    const user = userEvent.setup();
    render(<OpportunityCostInput data={defaultData} onChange={mockOnChange} />);

    const input = screen.getByLabelText(/Missed Deals/i);
    await user.clear(input);
    await user.type(input, '300000');

    expect(mockOnChange).toHaveBeenCalledWith({ missedDeals: expect.any(Number) });
  });

  it('should call onChange when market share loss changes', async () => {
    const user = userEvent.setup();
    render(<OpportunityCostInput data={defaultData} onChange={mockOnChange} />);

    const input = screen.getByLabelText(/Market Share Loss/i);
    await user.clear(input);
    await user.type(input, '1200000');

    expect(mockOnChange).toHaveBeenCalledWith({ marketShareLoss: expect.any(Number) });
  });

  it('should display subtotal', () => {
    const data = {
      delayedRevenue: 500000,
      missedDeals: 500000,
      marketShareLoss: 0,
      subtotal: 1000000,
    };

    render(<OpportunityCostInput data={data} onChange={mockOnChange} />);

    expect(screen.getByText('$1.0M')).toBeInTheDocument();
  });

  it('should render title and description', () => {
    render(<OpportunityCostInput data={defaultData} onChange={mockOnChange} />);

    expect(screen.getByText('Opportunity Costs')).toBeInTheDocument();
    expect(screen.getByText(/Revenue and growth opportunities/i)).toBeInTheDocument();
  });

  it('should show explanation text when subtotal > 0', () => {
    const data = {
      delayedRevenue: 100000,
      missedDeals: 100000,
      marketShareLoss: 100000,
      subtotal: 300000,
    };

    render(<OpportunityCostInput data={data} onChange={mockOnChange} />);

    expect(screen.getByText(/Sum of delayed revenue/i)).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <OpportunityCostInput
        data={defaultData}
        onChange={mockOnChange}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
