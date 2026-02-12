/**
 * Tests for ResultsSummary component
 *
 * Story 12.4: Friction Category Breakdown and Recommendations
 * Task 8.4: Unit tests for ResultsSummary component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResultsSummary } from './ResultsSummary';
import type { FrictionPointWithCost } from './cost-constants';
import type { DataJourney } from './journey-constants';

describe('ResultsSummary', () => {
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
      severity: { frequency: 3, effort: 3, impact: 3 }, // Critical (9)
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
      // No cost
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  ];

  it('displays enterprise total cost', () => {
    render(
      <ResultsSummary
        frictionPoints={mockFrictionPoints}
        journeys={mockJourneys}
      />
    );

    expect(screen.getByText('Enterprise Total Friction Cost')).toBeInTheDocument();
    // Total: $41,000 + $24,000 = $65,000 = $65K
    expect(screen.getByText('$65K')).toBeInTheDocument();
  });

  it('displays /year suffix', () => {
    render(
      <ResultsSummary
        frictionPoints={mockFrictionPoints}
        journeys={mockJourneys}
      />
    );

    expect(screen.getByText('/year')).toBeInTheDocument();
  });

  it('displays journey count', () => {
    render(
      <ResultsSummary
        frictionPoints={mockFrictionPoints}
        journeys={mockJourneys}
      />
    );

    // Multiple "2"s may exist, so check that Journeys text exists
    expect(screen.getByText('Journeys')).toBeInTheDocument();
    // Journey count should be visible somewhere
    const journeysLabel = screen.getByText('Journeys');
    expect(journeysLabel.closest('div')?.textContent).toContain('2');
  });

  it('displays friction points count', () => {
    render(
      <ResultsSummary
        frictionPoints={mockFrictionPoints}
        journeys={mockJourneys}
      />
    );

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Friction Points')).toBeInTheDocument();
  });

  it('displays costed count', () => {
    render(
      <ResultsSummary
        frictionPoints={mockFrictionPoints}
        journeys={mockJourneys}
      />
    );

    // 2 of 3 have cost data
    expect(screen.getAllByText('2').length).toBeGreaterThan(0);
    expect(screen.getByText('Costed')).toBeInTheDocument();
  });

  it('displays organizational percentage', () => {
    render(
      <ResultsSummary
        frictionPoints={mockFrictionPoints}
        journeys={mockJourneys}
      />
    );

    // Org cost: $41,000, Tech cost: $24,000, Total: $65,000
    // Org %: 41000/65000 = 63%
    expect(screen.getByText('63% Organizational')).toBeInTheDocument();
    expect(screen.getByText('37% Technical')).toBeInTheDocument();
  });

  it('displays critical count', () => {
    render(
      <ResultsSummary
        frictionPoints={mockFrictionPoints}
        journeys={mockJourneys}
      />
    );

    // fp_2 has severity 9 (critical)
    expect(screen.getByText('1 Critical')).toBeInTheDocument();
    expect(screen.getByText('Severity 7+ Items')).toBeInTheDocument();
  });

  it('displays Tool 7 ready indicator', () => {
    render(
      <ResultsSummary
        frictionPoints={mockFrictionPoints}
        journeys={mockJourneys}
      />
    );

    expect(screen.getByText('Ready for Tool 7')).toBeInTheDocument();
    expect(screen.getByText('Feed to Total Cost')).toBeInTheDocument();
  });

  it('handles empty friction points', () => {
    render(<ResultsSummary frictionPoints={[]} journeys={mockJourneys} />);

    // Should show $0
    expect(screen.getByText('$0')).toBeInTheDocument();
  });

  it('handles empty journeys', () => {
    render(
      <ResultsSummary
        frictionPoints={mockFrictionPoints}
        journeys={[]}
      />
    );

    // Journey count should show 0
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('handles zero critical friction', () => {
    const nonCriticalPoints: FrictionPointWithCost[] = [
      {
        id: 'fp_1',
        journeyId: 'j_1',
        stageId: 's_1',
        category: 'access_bureaucracy',
        description: 'Test 1',
        severity: { frequency: 1, effort: 1, impact: 1 }, // Total: 3 (not critical)
        cost: { hoursPerWeek: 5, hourlyRate: 50, opportunityCost: 0 },
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    ];

    render(
      <ResultsSummary
        frictionPoints={nonCriticalPoints}
        journeys={mockJourneys}
      />
    );

    expect(screen.getByText('0 Critical')).toBeInTheDocument();
  });

  it('uses correct singular form for single journey', () => {
    render(
      <ResultsSummary
        frictionPoints={mockFrictionPoints}
        journeys={[mockJourneys[0]]}
      />
    );

    expect(screen.getByText('Journey')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ResultsSummary
        frictionPoints={mockFrictionPoints}
        journeys={mockJourneys}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
