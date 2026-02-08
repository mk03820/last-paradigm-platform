import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StepIndicator } from './StepIndicator';

describe('StepIndicator', () => {
  it('displays "Step 1 of 7: Meeting Audit Calculator"', () => {
    render(<StepIndicator />);

    expect(screen.getByText(/Step 1 of 7/)).toBeInTheDocument();
    expect(screen.getByText(/Meeting Audit Calculator/)).toBeInTheDocument();
  });

  it('has appropriate ARIA attributes for accessibility', () => {
    render(<StepIndicator />);

    const stepIndicator = screen.getByRole('status');
    expect(stepIndicator).toBeInTheDocument();
    expect(stepIndicator).toHaveAttribute('aria-label', 'Progress indicator');
  });

  it('uses muted styling', () => {
    render(<StepIndicator />);

    const stepIndicator = screen.getByRole('status');
    expect(stepIndicator).toHaveClass('text-muted-foreground');
  });

  it('accepts custom currentStep and totalSteps props', () => {
    render(<StepIndicator currentStep={3} totalSteps={7} stepLabel="Assessment Phase" />);

    expect(screen.getByText(/Step 3 of 7/)).toBeInTheDocument();
    expect(screen.getByText(/Assessment Phase/)).toBeInTheDocument();
  });
});
