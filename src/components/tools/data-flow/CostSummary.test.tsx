/**
 * Tests for CostSummary component
 *
 * Story 12.3: Friction Cost Calculation
 * Task 7.5: Unit tests for CostSummary component
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CostSummary } from './CostSummary';
import type { FrictionPointWithCost } from './cost-constants';
import type { DataJourney } from './journey-constants';

describe('CostSummary', () => {
  const mockJourneys: DataJourney[] = [
    {
      id: 'j_1',
      name: 'Customer Journey',
      stages: [],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      id: 'j_2',
      name: 'Sales Journey',
      stages: [],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  ];

  const mockFrictionPoints: FrictionPointWithCost[] = [
    {
      id: 'fp_1',
      journeyId: 'j_1',
      stageId: 's_1',
      category: 'access_bureaucracy',
      description: 'Test 1',
      severity: { frequency: 2, effort: 2, impact: 2 },
      cost: { hoursPerWeek: 10, hourlyRate: 75, opportunityCost: 5000 },
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      id: 'fp_2',
      journeyId: 'j_1',
      stageId: 's_2',
      category: 'technical_debt',
      description: 'Test 2',
      severity: { frequency: 3, effort: 2, impact: 2 },
      cost: { hoursPerWeek: 5, hourlyRate: 100, opportunityCost: 0 },
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      id: 'fp_3',
      journeyId: 'j_2',
      stageId: 's_3',
      category: 'quality_degradation',
      description: 'Test 3',
      severity: { frequency: 1, effort: 1, impact: 3 },
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  ];

  it('renders enterprise total cost', () => {
    render(
      <CostSummary
        frictionPoints={mockFrictionPoints}
        journeys={mockJourneys}
      />
    );

    expect(screen.getByText('Enterprise Total Friction Cost')).toBeInTheDocument();
    // Total: $41,000 + $24,000 = $65,000 = $65K
    expect(screen.getByText('$65K')).toBeInTheDocument();
  });

  it('shows /year suffix', () => {
    render(
      <CostSummary
        frictionPoints={mockFrictionPoints}
        journeys={mockJourneys}
      />
    );

    expect(screen.getByText('/year')).toBeInTheDocument();
  });

  it('shows FTE vs Opportunity cost breakdown', () => {
    render(
      <CostSummary
        frictionPoints={mockFrictionPoints}
        journeys={mockJourneys}
      />
    );

    expect(screen.getByText('FTE Costs')).toBeInTheDocument();
    expect(screen.getByText('Opportunity Costs')).toBeInTheDocument();
    // FTE: $36,000 + $24,000 = $60,000
    expect(screen.getByText('$60,000')).toBeInTheDocument();
    // Opportunity: $5,000
    expect(screen.getByText('$5,000')).toBeInTheDocument();
  });

  it('shows cost completion stats', () => {
    render(
      <CostSummary
        frictionPoints={mockFrictionPoints}
        journeys={mockJourneys}
      />
    );

    // 2 of 3 friction points have cost
    expect(screen.getByText(/2 of 3 friction points costed/)).toBeInTheDocument();
    expect(screen.getByText(/67%/)).toBeInTheDocument();
  });

  it('shows cost by journey', () => {
    render(
      <CostSummary
        frictionPoints={mockFrictionPoints}
        journeys={mockJourneys}
      />
    );

    expect(screen.getByText('Cost by Journey')).toBeInTheDocument();
    expect(screen.getByText('Customer Journey')).toBeInTheDocument();
    expect(screen.getByText('Sales Journey')).toBeInTheDocument();
  });

  it('highlights selected journey', () => {
    render(
      <CostSummary
        frictionPoints={mockFrictionPoints}
        journeys={mockJourneys}
        selectedJourneyId="j_1"
      />
    );

    // Find Customer Journey text and verify its container has highlight styling
    const customerJourneyText = screen.getByText('Customer Journey');
    // The parent container should have highlighting class
    const journeyRow = customerJourneyText.closest('.rounded-md.border');
    expect(journeyRow).toHaveClass('border-primary');
  });

  it('shows cost by category', () => {
    render(
      <CostSummary
        frictionPoints={mockFrictionPoints}
        journeys={mockJourneys}
      />
    );

    expect(screen.getByText('Cost by Friction Category')).toBeInTheDocument();
    expect(screen.getByText('Access Bureaucracy')).toBeInTheDocument();
    expect(screen.getByText('Technical Debt')).toBeInTheDocument();
    expect(screen.getByText('Quality Degradation')).toBeInTheDocument();
  });

  it('shows methodology section collapsed by default', () => {
    render(
      <CostSummary
        frictionPoints={mockFrictionPoints}
        journeys={mockJourneys}
      />
    );

    expect(screen.getByText('Calculation Methodology')).toBeInTheDocument();
    expect(screen.queryByText('Formula')).not.toBeInTheDocument();
  });

  it('expands methodology section on click', () => {
    render(
      <CostSummary
        frictionPoints={mockFrictionPoints}
        journeys={mockJourneys}
      />
    );

    fireEvent.click(screen.getByText('Calculation Methodology'));

    expect(screen.getByText('Formula')).toBeInTheDocument();
    expect(screen.getByText('Assumptions')).toBeInTheDocument();
    expect(screen.getByText('Example')).toBeInTheDocument();
  });

  it('shows formula in methodology', () => {
    render(
      <CostSummary
        frictionPoints={mockFrictionPoints}
        journeys={mockJourneys}
      />
    );

    fireEvent.click(screen.getByText('Calculation Methodology'));

    expect(screen.getByText(/Hours\/Week × Hourly Rate × 48 weeks/)).toBeInTheDocument();
  });

  it('handles empty friction points', () => {
    render(
      <CostSummary
        frictionPoints={[]}
        journeys={mockJourneys}
      />
    );

    // Enterprise total should show $0
    expect(screen.getByText('Enterprise Total Friction Cost')).toBeInTheDocument();
    // Multiple elements may show "0 of 0" text
    expect(screen.getAllByText(/0 of 0 friction points costed/).length).toBeGreaterThan(0);
  });

  it('handles empty journeys', () => {
    render(
      <CostSummary
        frictionPoints={mockFrictionPoints}
        journeys={[]}
      />
    );

    expect(screen.queryByText('Cost by Journey')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <CostSummary
        frictionPoints={mockFrictionPoints}
        journeys={mockJourneys}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('shows percentage breakdown by category', () => {
    render(
      <CostSummary
        frictionPoints={mockFrictionPoints}
        journeys={mockJourneys}
      />
    );

    // Access Bureaucracy: $41,000 / $65,000 = 63%
    expect(screen.getByText('(63%)')).toBeInTheDocument();
    // Technical Debt: $24,000 / $65,000 = 37%
    expect(screen.getByText('(37%)')).toBeInTheDocument();
  });

  it('shows organizational vs technical type for categories', () => {
    render(
      <CostSummary
        frictionPoints={mockFrictionPoints}
        journeys={mockJourneys}
      />
    );

    // There are 4 categories total - 3 organizational and 1 technical
    // (access_bureaucracy, quality_degradation, multiple_sources are organizational; technical_debt is technical)
    expect(screen.getAllByText('(Organizational)').length).toBeGreaterThan(0);
    expect(screen.getAllByText('(Technical)').length).toBeGreaterThan(0);
  });
});
