/**
 * AdditionalCostsForm Tests
 *
 * Story 14.2: Additional Cost Category Inputs
 * Task 10.3: Integration tests for form and page
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AdditionalCostsForm } from './AdditionalCostsForm';
import { createDefaultAdditionalCostsInput } from './cost-constants';

describe('AdditionalCostsForm', () => {
  const defaultData = createDefaultAdditionalCostsInput();
  const mockOnProjectDelaysChange = vi.fn();
  const mockOnReworkChange = vi.fn();
  const mockOnTurnoverChange = vi.fn();
  const mockOnOpportunityCostChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all cost input sections', () => {
    render(
      <AdditionalCostsForm
        data={defaultData}
        onProjectDelaysChange={mockOnProjectDelaysChange}
        onReworkChange={mockOnReworkChange}
        onTurnoverChange={mockOnTurnoverChange}
        onOpportunityCostChange={mockOnOpportunityCostChange}
      />
    );

    expect(screen.getByText('Project Delays & Failures')).toBeInTheDocument();
    expect(screen.getByText('Rework & Duplication')).toBeInTheDocument();
    expect(screen.getByText('Excess Turnover')).toBeInTheDocument();
    expect(screen.getByText('Opportunity Costs')).toBeInTheDocument();
  });

  it('should display total additional costs heading', () => {
    render(
      <AdditionalCostsForm
        data={defaultData}
        onProjectDelaysChange={mockOnProjectDelaysChange}
        onReworkChange={mockOnReworkChange}
        onTurnoverChange={mockOnTurnoverChange}
        onOpportunityCostChange={mockOnOpportunityCostChange}
      />
    );

    expect(screen.getByText('Total Additional Costs')).toBeInTheDocument();
  });

  it('should display total when costs have values', () => {
    const data = {
      ...defaultData,
      projectDelays: { ...defaultData.projectDelays, subtotal: 375000 },
      rework: { ...defaultData.rework, subtotal: 1000000 },
      turnover: { ...defaultData.turnover, subtotal: 750000 },
      opportunityCost: { ...defaultData.opportunityCost, subtotal: 500000 },
      total: 2625000,
    };

    render(
      <AdditionalCostsForm
        data={data}
        onProjectDelaysChange={mockOnProjectDelaysChange}
        onReworkChange={mockOnReworkChange}
        onTurnoverChange={mockOnTurnoverChange}
        onOpportunityCostChange={mockOnOpportunityCostChange}
      />
    );

    expect(screen.getByText('$2.6M')).toBeInTheDocument();
  });

  it('should show breakdown of individual costs when total > 0', () => {
    const data = {
      ...defaultData,
      projectDelays: { ...defaultData.projectDelays, subtotal: 375000 },
      rework: { ...defaultData.rework, subtotal: 1000000 },
      total: 1375000,
    };

    render(
      <AdditionalCostsForm
        data={data}
        onProjectDelaysChange={mockOnProjectDelaysChange}
        onReworkChange={mockOnReworkChange}
        onTurnoverChange={mockOnTurnoverChange}
        onOpportunityCostChange={mockOnOpportunityCostChange}
      />
    );

    expect(screen.getByText(/Project Delays: \$375K/)).toBeInTheDocument();
    expect(screen.getByText(/Rework: \$1.0M/)).toBeInTheDocument();
  });

  it('should not show breakdown items with 0 subtotal', () => {
    const data = {
      ...defaultData,
      projectDelays: { ...defaultData.projectDelays, subtotal: 375000 },
      rework: { ...defaultData.rework, subtotal: 0 },
      total: 375000,
    };

    render(
      <AdditionalCostsForm
        data={data}
        onProjectDelaysChange={mockOnProjectDelaysChange}
        onReworkChange={mockOnReworkChange}
        onTurnoverChange={mockOnTurnoverChange}
        onOpportunityCostChange={mockOnOpportunityCostChange}
      />
    );

    expect(screen.getByText(/Project Delays: \$375K/)).toBeInTheDocument();
    expect(screen.queryByText(/Rework:/)).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <AdditionalCostsForm
        data={defaultData}
        onProjectDelaysChange={mockOnProjectDelaysChange}
        onReworkChange={mockOnReworkChange}
        onTurnoverChange={mockOnTurnoverChange}
        onOpportunityCostChange={mockOnOpportunityCostChange}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should show sum description text', () => {
    render(
      <AdditionalCostsForm
        data={defaultData}
        onProjectDelaysChange={mockOnProjectDelaysChange}
        onReworkChange={mockOnReworkChange}
        onTurnoverChange={mockOnTurnoverChange}
        onOpportunityCostChange={mockOnOpportunityCostChange}
      />
    );

    expect(screen.getByText(/Sum of all additional cost categories/i)).toBeInTheDocument();
  });
});
