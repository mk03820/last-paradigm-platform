/**
 * Tests for CriticalFriction component
 *
 * Story 12.4: Friction Category Breakdown and Recommendations
 * Task 8.3: Unit tests for CriticalFriction component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CriticalFriction } from './CriticalFriction';
import type { FrictionPointWithCost } from './cost-constants';
import type { DataJourney } from './journey-constants';

describe('CriticalFriction', () => {
  const mockJourneys: DataJourney[] = [
    {
      id: 'j_1',
      name: 'Customer 360',
      stages: [
        { id: 's_1', type: 'source', systemName: 'Salesforce', owner: 'Sales', latency: 1, latencyUnit: 'hours', order: 0 },
        { id: 's_2', type: 'transformation', systemName: 'ETL Pipeline', owner: 'Data Team', latency: 2, latencyUnit: 'hours', order: 1 },
      ],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      id: 'j_2',
      name: 'Revenue Analytics',
      stages: [
        { id: 's_3', type: 'storage', systemName: 'Data Lake', owner: 'Analytics', latency: 1, latencyUnit: 'days', order: 0 },
      ],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  ];

  // Critical severity: 7-9
  const criticalPoint: FrictionPointWithCost = {
    id: 'fp_1',
    journeyId: 'j_1',
    stageId: 's_2',
    category: 'access_bureaucracy',
    description: 'IT ticket required for every schema change',
    severity: { frequency: 3, effort: 3, impact: 3 }, // Total: 9
    cost: { hoursPerWeek: 10, hourlyRate: 75, opportunityCost: 5000 },
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  const anotherCriticalPoint: FrictionPointWithCost = {
    id: 'fp_2',
    journeyId: 'j_2',
    stageId: 's_3',
    category: 'quality_degradation',
    description: "No consistent definition of 'customer'",
    severity: { frequency: 2, effort: 2, impact: 3 }, // Total: 7
    cost: { hoursPerWeek: 5, hourlyRate: 100, opportunityCost: 4000 },
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  // Non-critical severity: < 7
  const nonCriticalPoint: FrictionPointWithCost = {
    id: 'fp_3',
    journeyId: 'j_1',
    stageId: 's_1',
    category: 'technical_debt',
    description: 'Minor pipeline delay',
    severity: { frequency: 1, effort: 2, impact: 2 }, // Total: 5
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  it('renders critical friction points header', () => {
    render(
      <CriticalFriction
        frictionPoints={[criticalPoint]}
        journeys={mockJourneys}
      />
    );

    expect(screen.getByText(/Critical Friction Points/)).toBeInTheDocument();
  });

  it('shows severity 7-9 in header', () => {
    render(
      <CriticalFriction
        frictionPoints={[criticalPoint]}
        journeys={mockJourneys}
      />
    );

    expect(screen.getByText(/Severity 7-9/)).toBeInTheDocument();
  });

  it('displays critical count badge', () => {
    render(
      <CriticalFriction
        frictionPoints={[criticalPoint, anotherCriticalPoint, nonCriticalPoint]}
        journeys={mockJourneys}
      />
    );

    expect(screen.getByText('2 Critical')).toBeInTheDocument();
  });

  it('shows friction point description', () => {
    render(
      <CriticalFriction
        frictionPoints={[criticalPoint]}
        journeys={mockJourneys}
      />
    );

    expect(
      screen.getByText(/"IT ticket required for every schema change"/)
    ).toBeInTheDocument();
  });

  it('shows severity score', () => {
    render(
      <CriticalFriction
        frictionPoints={[criticalPoint]}
        journeys={mockJourneys}
      />
    );

    expect(screen.getByText(/Severity 9/)).toBeInTheDocument();
  });

  it('shows journey context', () => {
    render(
      <CriticalFriction
        frictionPoints={[criticalPoint]}
        journeys={mockJourneys}
      />
    );

    expect(screen.getByText('Customer 360')).toBeInTheDocument();
  });

  it('shows stage context', () => {
    render(
      <CriticalFriction
        frictionPoints={[criticalPoint]}
        journeys={mockJourneys}
      />
    );

    expect(screen.getByText('ETL Pipeline')).toBeInTheDocument();
  });

  it('shows category badge', () => {
    render(
      <CriticalFriction
        frictionPoints={[criticalPoint]}
        journeys={mockJourneys}
      />
    );

    expect(screen.getByText('Access Bureaucracy')).toBeInTheDocument();
  });

  it('shows cost when available', () => {
    render(
      <CriticalFriction
        frictionPoints={[criticalPoint]}
        journeys={mockJourneys}
      />
    );

    // 10 * 75 * 48 + 5000 = 41,000
    expect(screen.getByText(/Cost: \$41,000\/year/)).toBeInTheDocument();
  });

  it('shows "No cost estimate" when cost is missing', () => {
    const noCostPoint: FrictionPointWithCost = {
      ...criticalPoint,
      id: 'fp_no_cost',
      cost: undefined,
    };

    render(
      <CriticalFriction
        frictionPoints={[noCostPoint]}
        journeys={mockJourneys}
      />
    );

    expect(screen.getByText('No cost estimate')).toBeInTheDocument();
  });

  it('sorts by severity descending', () => {
    render(
      <CriticalFriction
        frictionPoints={[anotherCriticalPoint, criticalPoint]} // fp_2 (7) first, fp_1 (9) second
        journeys={mockJourneys}
      />
    );

    // Use a more specific query for severity badges
    const severityBadges = screen.getAllByText(/🔴 Severity \d/);
    // Should be sorted: 9 first, then 7
    expect(severityBadges[0].textContent).toContain('9');
    expect(severityBadges[1].textContent).toContain('7');
  });

  it('filters out non-critical points', () => {
    render(
      <CriticalFriction
        frictionPoints={[criticalPoint, nonCriticalPoint]}
        journeys={mockJourneys}
      />
    );

    expect(screen.getByText('1 Critical')).toBeInTheDocument();
    expect(screen.queryByText('Minor pipeline delay')).not.toBeInTheDocument();
  });

  it('shows empty state when no critical points', () => {
    render(
      <CriticalFriction
        frictionPoints={[nonCriticalPoint]}
        journeys={mockJourneys}
      />
    );

    expect(
      screen.getByText(/No critical friction points identified/)
    ).toBeInTheDocument();
  });

  it('shows empty state when no friction points', () => {
    render(<CriticalFriction frictionPoints={[]} journeys={mockJourneys} />);

    expect(
      screen.getByText(/No critical friction points identified/)
    ).toBeInTheDocument();
  });

  it('handles boundary severity of 7', () => {
    const boundaryPoint: FrictionPointWithCost = {
      ...criticalPoint,
      id: 'fp_boundary',
      severity: { frequency: 2, effort: 2, impact: 3 }, // Total: 7 (minimum critical)
    };

    render(
      <CriticalFriction
        frictionPoints={[boundaryPoint]}
        journeys={mockJourneys}
      />
    );

    expect(screen.getByText('1 Critical')).toBeInTheDocument();
    // Match the exact badge format with emoji
    expect(screen.getByText(/🔴 Severity 7/)).toBeInTheDocument();
  });

  it('handles boundary severity of 6 (non-critical)', () => {
    const boundaryPoint: FrictionPointWithCost = {
      ...criticalPoint,
      id: 'fp_boundary',
      severity: { frequency: 2, effort: 2, impact: 2 }, // Total: 6 (not critical)
    };

    render(
      <CriticalFriction
        frictionPoints={[boundaryPoint]}
        journeys={mockJourneys}
      />
    );

    expect(
      screen.getByText(/No critical friction points identified/)
    ).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <CriticalFriction
        frictionPoints={[criticalPoint]}
        journeys={mockJourneys}
        className="custom-class"
      />
    );

    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});
