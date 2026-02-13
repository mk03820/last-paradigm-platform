/**
 * ROICalculator Component Tests
 *
 * Tests for the ROI Calculator form component.
 *
 * Story 14.5: Transformation ROI Calculator
 * Task 7: Write tests for calculator components
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ROICalculator } from './ROICalculator';
import { ROI_DEFAULTS } from './cost-constants';

describe('ROICalculator', () => {
  const defaultProps = {
    alignmentTax: 2000000,
    investment: 0,
    onInvestmentChange: vi.fn(),
    targetReduction: 50,
    onTargetReductionChange: vi.fn(),
    timelineMonths: 18,
    onTimelineMonthsChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the calculator form', () => {
    render(<ROICalculator {...defaultProps} />);

    expect(screen.getByText('ROI Calculator')).toBeInTheDocument();
    expect(screen.getByLabelText(/transformation investment/i)).toBeInTheDocument();
    expect(screen.getByText(/target reduction/i)).toBeInTheDocument();
    expect(screen.getByText(/timeline to achievement/i)).toBeInTheDocument();
  });

  it('should display current alignment tax', () => {
    render(<ROICalculator {...defaultProps} />);

    expect(screen.getByText('Current Alignment Tax')).toBeInTheDocument();
    expect(screen.getByText('$2.0M')).toBeInTheDocument();
  });

  it('should handle investment input changes', async () => {
    const user = userEvent.setup();
    render(<ROICalculator {...defaultProps} />);

    const input = screen.getByLabelText(/transformation investment/i);
    await user.clear(input);
    await user.type(input, '500000');

    expect(defaultProps.onInvestmentChange).toHaveBeenCalled();
  });

  it('should show target reduction percentage', () => {
    render(<ROICalculator {...defaultProps} />);

    // There are multiple 50% elements (the headline number and a button)
    const percentElements = screen.getAllByText('50%');
    expect(percentElements.length).toBeGreaterThan(0);
  });

  it('should have quick select buttons for reduction', async () => {
    const user = userEvent.setup();
    render(<ROICalculator {...defaultProps} />);

    const button25 = screen.getByRole('button', { name: '25%' });
    const button50 = screen.getByRole('button', { name: '50%' });
    const button75 = screen.getByRole('button', { name: '75%' });

    expect(button25).toBeInTheDocument();
    expect(button50).toBeInTheDocument();
    expect(button75).toBeInTheDocument();

    await user.click(button75);
    expect(defaultProps.onTargetReductionChange).toHaveBeenCalledWith(75);
  });

  it('should have timeline selection buttons', async () => {
    const user = userEvent.setup();
    render(<ROICalculator {...defaultProps} />);

    const button12 = screen.getByRole('button', { name: '12 months' });
    const button24 = screen.getByRole('button', { name: '24 months' });

    expect(button12).toBeInTheDocument();
    expect(button24).toBeInTheDocument();

    await user.click(button24);
    expect(defaultProps.onTimelineMonthsChange).toHaveBeenCalledWith(24);
  });

  it('should show calculate button when onCalculate is provided', () => {
    const onCalculate = vi.fn();
    render(<ROICalculator {...defaultProps} onCalculate={onCalculate} />);

    expect(screen.getByRole('button', { name: /calculate roi/i })).toBeInTheDocument();
  });

  it('should disable calculate button when investment is below minimum', () => {
    const onCalculate = vi.fn();
    render(
      <ROICalculator
        {...defaultProps}
        investment={100}
        onCalculate={onCalculate}
      />
    );

    const calculateButton = screen.getByRole('button', { name: /calculate roi/i });
    expect(calculateButton).toBeDisabled();
  });

  it('should enable calculate button with valid investment', () => {
    const onCalculate = vi.fn();
    render(
      <ROICalculator
        {...defaultProps}
        investment={500000}
        onCalculate={onCalculate}
      />
    );

    const calculateButton = screen.getByRole('button', { name: /calculate roi/i });
    expect(calculateButton).not.toBeDisabled();
  });

  it('should call onCalculate when calculate button is clicked', async () => {
    const user = userEvent.setup();
    const onCalculate = vi.fn();
    render(
      <ROICalculator
        {...defaultProps}
        investment={500000}
        onCalculate={onCalculate}
      />
    );

    const calculateButton = screen.getByRole('button', { name: /calculate roi/i });
    await user.click(calculateButton);

    expect(onCalculate).toHaveBeenCalled();
  });

  it('should show calculating state', () => {
    render(
      <ROICalculator
        {...defaultProps}
        investment={500000}
        onCalculate={vi.fn()}
        isCalculating={true}
      />
    );

    expect(screen.getByText(/calculating/i)).toBeInTheDocument();
  });

  it('should show potential savings preview', () => {
    render(<ROICalculator {...defaultProps} />);

    // At 50% reduction of 2M = 1M
    expect(screen.getByText(/potential annual savings/i)).toBeInTheDocument();
    expect(screen.getByText('$1.0M')).toBeInTheDocument();
  });

  it('should show minimum investment warning when below threshold', () => {
    render(<ROICalculator {...defaultProps} investment={5000} />);

    expect(screen.getByText(/minimum investment/i)).toBeInTheDocument();
  });

  it('should format investment input on blur', async () => {
    const user = userEvent.setup();
    render(<ROICalculator {...defaultProps} investment={500000} />);

    const input = screen.getByLabelText(/transformation investment/i);

    // Focus and blur to trigger formatting
    await user.click(input);
    await user.tab();

    // The formatted value should show
    expect(input).toHaveValue('500,000');
  });
});
