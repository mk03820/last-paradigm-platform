/**
 * Tool Result Card Component Tests
 *
 * Story 19.2: Diagnostic Results Display
 * Task 9.2: Unit tests for each ToolResultCard component
 * Covers: AC2 (All tool results display)
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ToolResultCard } from '@/components/dashboard/results/ToolResultCard';
import { AlignmentResultCard } from '@/components/dashboard/results/AlignmentResultCard';
import { MeetingAuditResultCard } from '@/components/dashboard/results/MeetingAuditResultCard';
import { DecisionVelocityResultCard } from '@/components/dashboard/results/DecisionVelocityResultCard';
import { StakeholderMapResultCard } from '@/components/dashboard/results/StakeholderMapResultCard';
import { DataFlowResultCard } from '@/components/dashboard/results/DataFlowResultCard';
import { CommunicationResultCard } from '@/components/dashboard/results/CommunicationResultCard';
import { TotalCostResultCard } from '@/components/dashboard/results/TotalCostResultCard';

describe('ToolResultCard (Base)', () => {
  it('renders tool number and name', () => {
    render(
      <ToolResultCard
        toolNumber={1}
        toolName="Test Tool"
        completedAt="2026-02-14T10:00:00Z"
      >
        <div>Content</div>
      </ToolResultCard>
    );

    expect(screen.getByText('Tool 1')).toBeInTheDocument();
    expect(screen.getByText('Test Tool')).toBeInTheDocument();
  });

  it('shows completed status with check mark', () => {
    render(
      <ToolResultCard
        toolNumber={1}
        toolName="Test Tool"
        completedAt="2026-02-14T10:00:00Z"
      >
        <div>Content</div>
      </ToolResultCard>
    );

    expect(screen.getByLabelText(/completed/i)).toBeInTheDocument();
  });

  it('shows not completed status when no completedAt', () => {
    render(
      <ToolResultCard
        toolNumber={1}
        toolName="Test Tool"
        completedAt={null}
      >
        <div>Content</div>
      </ToolResultCard>
    );

    expect(screen.getByText(/not completed/i)).toBeInTheDocument();
  });
});

describe('AlignmentResultCard (Tool 1)', () => {
  const mockData = {
    scores: {
      strategic: 65,
      execution: 55,
      technology: 70,
      people: 50,
      governance: 60,
    },
    compositeScore: 60,
    completedAt: '2026-02-14T10:00:00Z',
  };

  it('displays composite score prominently', () => {
    render(<AlignmentResultCard data={mockData} />);

    const score = screen.getByTestId('composite-score');
    expect(score).toHaveTextContent('60');
  });

  it('displays all 5 dimension scores', () => {
    render(<AlignmentResultCard data={mockData} />);

    expect(screen.getByText(/strategic/i)).toBeInTheDocument();
    expect(screen.getByText(/execution/i)).toBeInTheDocument();
    expect(screen.getByText(/technology/i)).toBeInTheDocument();
    expect(screen.getByText(/people/i)).toBeInTheDocument();
    expect(screen.getByText(/governance/i)).toBeInTheDocument();
  });

  it('applies color coding to scores', () => {
    render(<AlignmentResultCard data={mockData} />);

    // Technology (70) should be green (>= 70)
    const techScore = screen.getByTestId('score-technology');
    expect(techScore).toHaveClass('text-green-600');

    // People (50) should be yellow (>= 50 but < 70)
    const peopleScore = screen.getByTestId('score-people');
    expect(peopleScore).toHaveClass('text-yellow-600');
  });

  it('shows horizontal bars for dimension scores', () => {
    const { container } = render(<AlignmentResultCard data={mockData} />);

    const bars = container.querySelectorAll('[data-testid^="dimension-bar-"]');
    expect(bars).toHaveLength(5);
  });
});

describe('MeetingAuditResultCard (Tool 2)', () => {
  const mockData = {
    inputs: {
      meetingCount: 100,
      averageAttendees: 8,
      averageDuration: 60,
    },
    results: {
      totalMeetingHours: 800,
      totalMeetingCost: 240000,
      wastedHours: 400,
      wastedCost: 120000,
      effectiveHours: 400,
      effectiveCost: 120000,
    },
    completedAt: '2026-02-14T10:00:00Z',
  };

  it('displays annual meeting waste prominently', () => {
    render(<MeetingAuditResultCard data={mockData} />);

    expect(screen.getByText('$120,000')).toBeInTheDocument();
    expect(screen.getByText(/annual meeting waste/i)).toBeInTheDocument();
  });

  it('displays total meeting cost', () => {
    render(<MeetingAuditResultCard data={mockData} />);

    expect(screen.getByText('$240,000')).toBeInTheDocument();
  });

  it('displays wasted hours', () => {
    render(<MeetingAuditResultCard data={mockData} />);

    expect(screen.getByText(/400.*hours/i)).toBeInTheDocument();
  });

  it('shows waste percentage', () => {
    render(<MeetingAuditResultCard data={mockData} />);

    expect(screen.getByText(/50%/)).toBeInTheDocument(); // 400/800 = 50%
  });
});

describe('DecisionVelocityResultCard (Tool 3)', () => {
  const mockData = {
    decisions: [
      { archetype: 'budget', medianDays: 14, p90Days: 28 },
      { archetype: 'strategic', medianDays: 45, p90Days: 90 },
    ],
    metrics: {
      overallMedian: 21,
      overallP90: 45,
    },
    completedAt: '2026-02-14T10:00:00Z',
  };

  it('displays median decision time', () => {
    render(<DecisionVelocityResultCard data={mockData} />);

    // Check metric display - multiple elements contain 21
    const elements21 = screen.getAllByText(/21/);
    expect(elements21.length).toBeGreaterThanOrEqual(1);
    // Multiple elements may contain "Median"
    const medianElements = screen.getAllByText(/median/i);
    expect(medianElements.length).toBeGreaterThanOrEqual(1);
  });

  it('displays 90th percentile', () => {
    render(<DecisionVelocityResultCard data={mockData} />);

    expect(screen.getByText(/45.*days/i)).toBeInTheDocument();
    expect(screen.getByText(/90th percentile/i)).toBeInTheDocument();
  });

  it('shows decision count', () => {
    render(<DecisionVelocityResultCard data={mockData} />);

    expect(screen.getByText(/2.*decisions/i)).toBeInTheDocument();
  });
});

describe('StakeholderMapResultCard (Tool 4)', () => {
  const mockData = {
    stakeholders: [
      { name: 'CEO', power: 9, interest: 8, sentiment: 'champion' },
      { name: 'CFO', power: 8, interest: 5, sentiment: 'neutral' },
      { name: 'CTO', power: 7, interest: 9, sentiment: 'champion' },
      { name: 'Manager', power: 4, interest: 3, sentiment: 'blocker' },
    ],
    completedAt: '2026-02-14T10:00:00Z',
  };

  it('displays total stakeholder count', () => {
    render(<StakeholderMapResultCard data={mockData} />);

    expect(screen.getByText(/4.*stakeholders/i)).toBeInTheDocument();
  });

  it('displays stakeholder count by quadrant', () => {
    render(<StakeholderMapResultCard data={mockData} />);

    // High power + high interest
    expect(screen.getByText(/key players/i)).toBeInTheDocument();
    // Should show count per quadrant
    expect(screen.getAllByTestId(/quadrant-count/).length).toBeGreaterThanOrEqual(1);
  });

  it('displays sentiment distribution', () => {
    render(<StakeholderMapResultCard data={mockData} />);

    expect(screen.getByText(/champion/i)).toBeInTheDocument();
    expect(screen.getByText(/neutral/i)).toBeInTheDocument();
    expect(screen.getByText(/blocker/i)).toBeInTheDocument();
  });
});

describe('DataFlowResultCard (Tool 5)', () => {
  const mockData = {
    journeys: [
      { name: 'Customer Order', frictionPoints: 3 },
      { name: 'Financial Report', frictionPoints: 5 },
    ],
    frictionCost: 350000,
    completedAt: '2026-02-14T10:00:00Z',
  };

  it('displays total friction cost prominently', () => {
    render(<DataFlowResultCard data={mockData} />);

    expect(screen.getByText('$350,000')).toBeInTheDocument();
    expect(screen.getByText(/friction cost/i)).toBeInTheDocument();
  });

  it('displays journey count', () => {
    render(<DataFlowResultCard data={mockData} />);

    expect(screen.getByText(/2.*journeys/i)).toBeInTheDocument();
  });

  it('displays critical friction count if available', () => {
    render(<DataFlowResultCard data={{ ...mockData, criticalFriction: 2 }} />);

    expect(screen.getByText(/2.*critical/i)).toBeInTheDocument();
  });
});

describe('CommunicationResultCard (Tool 6)', () => {
  const mockData = {
    metrics: {
      healthScore: 65,
      antiPatternCount: 3,
    },
    antiPatterns: ['Silo Communication', 'Meeting Overload', 'Email Fatigue'],
    completedAt: '2026-02-14T10:00:00Z',
  };

  it('displays health score prominently', () => {
    render(<CommunicationResultCard data={mockData} />);

    expect(screen.getByText('65')).toBeInTheDocument();
    expect(screen.getByText(/health.*score/i)).toBeInTheDocument();
  });

  it('displays anti-pattern count', () => {
    render(<CommunicationResultCard data={mockData} />);

    expect(screen.getByText(/3.*anti-patterns/i)).toBeInTheDocument();
  });

  it('lists detected anti-patterns', () => {
    render(<CommunicationResultCard data={mockData} />);

    expect(screen.getByText(/silo communication/i)).toBeInTheDocument();
    expect(screen.getByText(/meeting overload/i)).toBeInTheDocument();
    expect(screen.getByText(/email fatigue/i)).toBeInTheDocument();
  });

  it('applies color coding to health score', () => {
    render(<CommunicationResultCard data={mockData} />);

    const score = screen.getByTestId('health-score');
    // 65 is in yellow range
    expect(score).toHaveClass('text-yellow-600');
  });
});

describe('TotalCostResultCard (Tool 7)', () => {
  const mockData = {
    totalCost: 1250000,
    alignmentTaxPercent: 8.5,
    completedAt: '2026-02-14T10:00:00Z',
  };

  it('displays total alignment tax prominently', () => {
    render(<TotalCostResultCard data={mockData} />);

    // Multiple elements may show this value
    const amounts = screen.getAllByText('$1,250,000');
    expect(amounts.length).toBeGreaterThanOrEqual(1);
  });

  it('displays percentage of revenue', () => {
    render(<TotalCostResultCard data={mockData} />);

    expect(screen.getByText(/8\.5%.*of revenue/i)).toBeInTheDocument();
  });

  it('shows breakdown by source if available', () => {
    const dataWithBreakdown = {
      ...mockData,
      breakdown: {
        meetings: 120000,
        decisions: 350000,
        data: 350000,
        communication: 200000,
        other: 230000,
      },
    };

    render(<TotalCostResultCard data={dataWithBreakdown} />);

    expect(screen.getByText(/meetings/i)).toBeInTheDocument();
    expect(screen.getByText(/decisions/i)).toBeInTheDocument();
  });
});
