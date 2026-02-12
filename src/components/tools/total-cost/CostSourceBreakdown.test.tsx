/**
 * CostSourceBreakdown Component Tests
 *
 * Story 14.3: Alignment Tax Calculation and Interpretation
 * Task 8.3: Unit tests for display components
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  CostSourceBreakdown,
  CostBreakdownList,
  CostSummaryLine,
} from './CostSourceBreakdown';
import type { AlignmentTaxResult } from './cost-constants';
import { INTERPRETATION_THRESHOLDS } from './cost-constants';

// Create mock result for tests
function createMockResult(
  overrides: Partial<AlignmentTaxResult> = {}
): AlignmentTaxResult {
  return {
    meetingWaste: 1200000,
    dataFriction: 450000,
    projectDelays: 350000,
    rework: 600000,
    turnover: 200000,
    opportunityCost: 100000,
    toolsSubtotal: 1650000,
    additionalSubtotal: 1250000,
    total: 2900000,
    revenue: 50000000,
    percentOfRevenue: 5.8,
    interpretation: INTERPRETATION_THRESHOLDS[2], // Crisis
    ...overrides,
  };
}

describe('CostSourceBreakdown', () => {
  it('should render the cost breakdown title', () => {
    const result = createMockResult();
    render(<CostSourceBreakdown result={result} />);

    expect(screen.getByText('Cost Breakdown')).toBeInTheDocument();
  });

  it('should show tool-sourced costs section', () => {
    const result = createMockResult();
    render(<CostSourceBreakdown result={result} />);

    expect(screen.getByText('From Diagnostic Tools')).toBeInTheDocument();
    expect(screen.getByText(/Meeting Waste/)).toBeInTheDocument();
    expect(screen.getByText(/Data Friction/)).toBeInTheDocument();
  });

  it('should show additional cost inputs section', () => {
    const result = createMockResult();
    render(<CostSourceBreakdown result={result} />);

    expect(screen.getByText('Additional Cost Inputs')).toBeInTheDocument();
    expect(screen.getByText(/Project Delays/)).toBeInTheDocument();
    expect(screen.getByText(/Rework/)).toBeInTheDocument();
    expect(screen.getByText(/Excess Turnover/)).toBeInTheDocument();
    expect(screen.getByText(/Opportunity Cost/)).toBeInTheDocument();
  });

  it('should show total alignment tax', () => {
    const result = createMockResult();
    render(<CostSourceBreakdown result={result} />);

    expect(screen.getByText('Total Alignment Tax')).toBeInTheDocument();
    expect(screen.getByText('$2,900,000')).toBeInTheDocument();
  });

  it('should show tool numbers for tool-sourced items', () => {
    const result = createMockResult();
    render(<CostSourceBreakdown result={result} />);

    expect(screen.getByText('(Tool 2)')).toBeInTheDocument();
    expect(screen.getByText('(Tool 5)')).toBeInTheDocument();
  });

  it('should show subtotals for each group', () => {
    const result = createMockResult();
    render(<CostSourceBreakdown result={result} />);

    // Should have 2 subtotal rows
    const subtotalTexts = screen.getAllByText('Subtotal');
    expect(subtotalTexts).toHaveLength(2);
  });

  it('should hide tool section when no tool costs', () => {
    const result = createMockResult({
      meetingWaste: 0,
      dataFriction: 0,
      toolsSubtotal: 0,
    });
    render(<CostSourceBreakdown result={result} />);

    expect(screen.queryByText('From Diagnostic Tools')).not.toBeInTheDocument();
  });

  it('should hide additional section when no additional costs', () => {
    const result = createMockResult({
      projectDelays: 0,
      rework: 0,
      turnover: 0,
      opportunityCost: 0,
      additionalSubtotal: 0,
    });
    render(<CostSourceBreakdown result={result} />);

    expect(screen.queryByText('Additional Cost Inputs')).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const result = createMockResult();
    const { container } = render(
      <CostSourceBreakdown result={result} className="custom-class" />
    );

    const card = container.querySelector('[data-slot="card"]');
    expect(card).toHaveClass('custom-class');
  });
});

describe('CostBreakdownList', () => {
  it('should render all cost sources', () => {
    const result = createMockResult();
    render(<CostBreakdownList result={result} />);

    expect(screen.getByText('Meeting Waste')).toBeInTheDocument();
    expect(screen.getByText('Data Friction')).toBeInTheDocument();
    expect(screen.getByText('Project Delays')).toBeInTheDocument();
    expect(screen.getByText('Rework')).toBeInTheDocument();
    expect(screen.getByText('Excess Turnover')).toBeInTheDocument();
    expect(screen.getByText('Opportunity Cost')).toBeInTheDocument();
  });

  it('should render as a list', () => {
    const result = createMockResult();
    render(<CostBreakdownList result={result} />);

    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(6);
  });

  it('should only show non-zero items', () => {
    const result = createMockResult({
      opportunityCost: 0,
    });
    render(<CostBreakdownList result={result} />);

    expect(screen.queryByText('Opportunity Cost')).not.toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(5);
  });

  it('should apply custom className', () => {
    const result = createMockResult();
    const { container } = render(
      <CostBreakdownList result={result} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('CostSummaryLine', () => {
  it('should show total and source count', () => {
    const result = createMockResult();
    render(<CostSummaryLine result={result} />);

    expect(screen.getByText(/\$2.9M from 6 cost sources/)).toBeInTheDocument();
  });

  it('should use singular for single source', () => {
    const result = createMockResult({
      dataFriction: 0,
      projectDelays: 0,
      rework: 0,
      turnover: 0,
      opportunityCost: 0,
    });
    render(<CostSummaryLine result={result} />);

    expect(screen.getByText(/cost source$/)).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const result = createMockResult();
    const { container } = render(
      <CostSummaryLine result={result} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
