/**
 * Tests for CostCard component
 *
 * Story 12.3: Friction Cost Calculation
 * Task 7.4: Unit tests for CostCard component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CostCard } from './CostCard';
import type { FrictionPointWithCost } from './cost-constants';
import type { DataStage } from './journey-constants';

describe('CostCard', () => {
  const mockFrictionPoint: FrictionPointWithCost = {
    id: 'fp_1',
    journeyId: 'j_1',
    stageId: 's_1',
    category: 'access_bureaucracy',
    description: 'Test friction point description',
    severity: { frequency: 2, effort: 2, impact: 2 },
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  const mockStage: DataStage = {
    id: 's_1',
    type: 'source',
    systemName: 'Salesforce',
    owner: 'Sales Team',
    latency: 2,
    latencyUnit: 'hours',
    order: 0,
  };

  const mockFrictionPointWithCost: FrictionPointWithCost = {
    ...mockFrictionPoint,
    cost: {
      hoursPerWeek: 10,
      hourlyRate: 75,
      opportunityCost: 5000,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders friction point description', () => {
    render(<CostCard frictionPoint={mockFrictionPoint} />);

    expect(screen.getByText('Test friction point description')).toBeInTheDocument();
  });

  it('renders category badge', () => {
    render(<CostCard frictionPoint={mockFrictionPoint} />);

    expect(screen.getByText('Access Bureaucracy')).toBeInTheDocument();
  });

  it('renders severity badge', () => {
    render(<CostCard frictionPoint={mockFrictionPoint} />);

    // Total severity: 2+2+2 = 6
    expect(screen.getByText('Severity: 6')).toBeInTheDocument();
  });

  it('renders stage association', () => {
    render(<CostCard frictionPoint={mockFrictionPoint} stage={mockStage} />);

    expect(screen.getByText('@ Salesforce')).toBeInTheDocument();
  });

  it('shows Add Cost Estimate button when no cost', () => {
    const onAddCost = vi.fn();
    render(
      <CostCard
        frictionPoint={mockFrictionPoint}
        onAddCost={onAddCost}
      />
    );

    expect(screen.getByText('No cost estimate added')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Cost Estimate/i })).toBeInTheDocument();
  });

  it('calls onAddCost when Add Cost button clicked', () => {
    const onAddCost = vi.fn();
    render(
      <CostCard
        frictionPoint={mockFrictionPoint}
        onAddCost={onAddCost}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Add Cost Estimate/i }));
    expect(onAddCost).toHaveBeenCalledWith(mockFrictionPoint);
  });

  it('shows cost breakdown when cost exists', () => {
    render(<CostCard frictionPoint={mockFrictionPointWithCost} />);

    // FTE breakdown: 10hrs × $75 × 48wks
    expect(screen.getByText(/10hrs × \$75 × 48wks/)).toBeInTheDocument();
    // FTE cost: $36,000
    expect(screen.getByText('$36,000')).toBeInTheDocument();
  });

  it('shows opportunity cost when present', () => {
    render(<CostCard frictionPoint={mockFrictionPointWithCost} />);

    expect(screen.getByText('Opportunity Cost')).toBeInTheDocument();
    expect(screen.getByText('$5,000')).toBeInTheDocument();
  });

  it('shows annual total', () => {
    render(<CostCard frictionPoint={mockFrictionPointWithCost} />);

    expect(screen.getByText('Annual Total')).toBeInTheDocument();
    // Total: $36,000 + $5,000 = $41,000
    expect(screen.getByText('$41,000')).toBeInTheDocument();
  });

  it('shows Edit Cost button when cost exists and onEditCost provided', () => {
    const onEditCost = vi.fn();
    render(
      <CostCard
        frictionPoint={mockFrictionPointWithCost}
        onEditCost={onEditCost}
      />
    );

    expect(screen.getByRole('button', { name: 'Edit Cost' })).toBeInTheDocument();
  });

  it('calls onEditCost when Edit Cost button clicked', () => {
    const onEditCost = vi.fn();
    render(
      <CostCard
        frictionPoint={mockFrictionPointWithCost}
        onEditCost={onEditCost}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Edit Cost' }));
    expect(onEditCost).toHaveBeenCalledWith(mockFrictionPointWithCost);
  });

  it('shows Remove button when cost exists and onRemoveCost provided', () => {
    const onRemoveCost = vi.fn();
    render(
      <CostCard
        frictionPoint={mockFrictionPointWithCost}
        onRemoveCost={onRemoveCost}
      />
    );

    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
  });

  it('calls onRemoveCost when Remove button clicked', () => {
    const onRemoveCost = vi.fn();
    render(
      <CostCard
        frictionPoint={mockFrictionPointWithCost}
        onRemoveCost={onRemoveCost}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
    expect(onRemoveCost).toHaveBeenCalledWith(mockFrictionPointWithCost);
  });

  it('hides opportunity cost when zero', () => {
    const pointWithZeroOpp: FrictionPointWithCost = {
      ...mockFrictionPoint,
      cost: {
        hoursPerWeek: 10,
        hourlyRate: 75,
        opportunityCost: 0,
      },
    };

    render(<CostCard frictionPoint={pointWithZeroOpp} />);

    expect(screen.queryByText('Opportunity Cost')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <CostCard frictionPoint={mockFrictionPoint} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('shows type when systemName is empty', () => {
    const stageWithoutName: DataStage = {
      ...mockStage,
      systemName: '',
    };

    render(
      <CostCard
        frictionPoint={mockFrictionPoint}
        stage={stageWithoutName}
      />
    );

    expect(screen.getByText('@ source')).toBeInTheDocument();
  });
});
