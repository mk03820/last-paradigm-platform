/**
 * TurnoverCostInput Tests
 *
 * Story 14.2: Additional Cost Category Inputs
 * Task 10.2: Unit tests for cost input components
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TurnoverCostInput } from './TurnoverCostInput';
import { createDefaultTurnoverCostInput } from './cost-constants';

describe('TurnoverCostInput', () => {
  const defaultData = createDefaultTurnoverCostInput();
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all input fields', () => {
    render(<TurnoverCostInput data={defaultData} onChange={mockOnChange} />);

    expect(screen.getByLabelText(/Excess Turnover Rate/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Average Replacement Cost/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Affected Headcount/i)).toBeInTheDocument();
  });

  it('should display current values', () => {
    const data = {
      excessTurnoverRate: 10,
      avgReplacementCost: 75000,
      headcount: 100,
      subtotal: 750000,
    };

    render(<TurnoverCostInput data={data} onChange={mockOnChange} />);

    const rateInput = screen.getByLabelText(/Excess Turnover Rate/i);
    const costInput = screen.getByLabelText(/Average Replacement Cost/i);
    const headcountInput = screen.getByLabelText(/Affected Headcount/i);

    expect(rateInput).toHaveValue(10);
    expect(costInput).toHaveValue(75000);
    expect(headcountInput).toHaveValue(100);
  });

  it('should call onChange when excess turnover rate changes', async () => {
    const user = userEvent.setup();
    render(<TurnoverCostInput data={defaultData} onChange={mockOnChange} />);

    const input = screen.getByLabelText(/Excess Turnover Rate/i);
    await user.clear(input);
    await user.type(input, '15');

    expect(mockOnChange).toHaveBeenCalledWith({ excessTurnoverRate: expect.any(Number) });
  });

  it('should call onChange when replacement cost changes', async () => {
    const user = userEvent.setup();
    render(<TurnoverCostInput data={defaultData} onChange={mockOnChange} />);

    const input = screen.getByLabelText(/Average Replacement Cost/i);
    await user.clear(input);
    await user.type(input, '80000');

    expect(mockOnChange).toHaveBeenCalledWith({ avgReplacementCost: expect.any(Number) });
  });

  it('should call onChange when headcount changes', async () => {
    const user = userEvent.setup();
    render(<TurnoverCostInput data={defaultData} onChange={mockOnChange} />);

    const input = screen.getByLabelText(/Affected Headcount/i);
    await user.clear(input);
    await user.type(input, '150');

    expect(mockOnChange).toHaveBeenCalledWith({ headcount: expect.any(Number) });
  });

  it('should display subtotal', () => {
    const data = {
      excessTurnoverRate: 10,
      avgReplacementCost: 50000,
      headcount: 100,
      subtotal: 500000,
    };

    render(<TurnoverCostInput data={data} onChange={mockOnChange} />);

    expect(screen.getByText('$500K')).toBeInTheDocument();
  });

  it('should display guidance text about industry normal', () => {
    render(<TurnoverCostInput data={defaultData} onChange={mockOnChange} />);

    // Check for guidance text that mentions ~15% (multiple elements match, so use getAllByText)
    const elements = screen.getAllByText(/~15%/);
    expect(elements.length).toBeGreaterThanOrEqual(1);
  });

  it('should render title and description', () => {
    render(<TurnoverCostInput data={defaultData} onChange={mockOnChange} />);

    expect(screen.getByText('Excess Turnover')).toBeInTheDocument();
    expect(screen.getByText(/Cost of losing employees/i)).toBeInTheDocument();
  });

  it('should show calculation breakdown when subtotal > 0', () => {
    const data = {
      excessTurnoverRate: 10,
      avgReplacementCost: 75000,
      headcount: 100,
      subtotal: 750000,
    };

    render(<TurnoverCostInput data={data} onChange={mockOnChange} />);

    expect(screen.getByText(/10% excess turnover/i)).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <TurnoverCostInput
        data={defaultData}
        onChange={mockOnChange}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
