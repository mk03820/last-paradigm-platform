/**
 * ReworkCostInput Tests
 *
 * Story 14.2: Additional Cost Category Inputs
 * Task 10.2: Unit tests for cost input components
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReworkCostInput } from './ReworkCostInput';
import { createDefaultReworkCostInput } from './cost-constants';

describe('ReworkCostInput', () => {
  const defaultData = createDefaultReworkCostInput();
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all input fields', () => {
    render(<ReworkCostInput data={defaultData} onChange={mockOnChange} />);

    expect(screen.getByLabelText(/Rework Percentage/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Annual Labor Cost/i)).toBeInTheDocument();
  });

  it('should display current values', () => {
    const data = {
      reworkPercent: 25,
      annualLaborCost: 5000000,
      subtotal: 1250000,
    };

    render(<ReworkCostInput data={data} onChange={mockOnChange} />);

    const percentInput = screen.getByLabelText(/Rework Percentage/i);
    const laborInput = screen.getByLabelText(/Annual Labor Cost/i);

    expect(percentInput).toHaveValue(25);
    expect(laborInput).toHaveValue(5000000);
  });

  it('should call onChange when rework percentage changes', async () => {
    const user = userEvent.setup();
    render(<ReworkCostInput data={defaultData} onChange={mockOnChange} />);

    const input = screen.getByLabelText(/Rework Percentage/i);
    await user.clear(input);
    await user.type(input, '20');

    expect(mockOnChange).toHaveBeenCalledWith({ reworkPercent: expect.any(Number) });
  });

  it('should call onChange when annual labor cost changes', async () => {
    const user = userEvent.setup();
    render(<ReworkCostInput data={defaultData} onChange={mockOnChange} />);

    const input = screen.getByLabelText(/Annual Labor Cost/i);
    await user.clear(input);
    await user.type(input, '3000000');

    expect(mockOnChange).toHaveBeenCalledWith({ annualLaborCost: expect.any(Number) });
  });

  it('should display subtotal', () => {
    const data = {
      reworkPercent: 20,
      annualLaborCost: 4000000,
      subtotal: 800000,
    };

    render(<ReworkCostInput data={data} onChange={mockOnChange} />);

    expect(screen.getByText('$800K')).toBeInTheDocument();
  });

  it('should display industry benchmark text', () => {
    render(<ReworkCostInput data={defaultData} onChange={mockOnChange} />);

    expect(screen.getByText(/Industry benchmark: 15-30%/i)).toBeInTheDocument();
  });

  it('should render title and description', () => {
    render(<ReworkCostInput data={defaultData} onChange={mockOnChange} />);

    expect(screen.getByText('Rework & Duplication')).toBeInTheDocument();
    expect(screen.getByText(/Cost of work that gets redone/i)).toBeInTheDocument();
  });

  it('should show calculation breakdown when subtotal > 0', () => {
    const data = {
      reworkPercent: 20,
      annualLaborCost: 5000000,
      subtotal: 1000000,
    };

    render(<ReworkCostInput data={data} onChange={mockOnChange} />);

    expect(screen.getByText(/labor cost x 20% rework/i)).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <ReworkCostInput
        data={defaultData}
        onChange={mockOnChange}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
