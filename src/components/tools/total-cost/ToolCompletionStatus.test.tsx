/**
 * ToolCompletionStatus Component Tests
 *
 * Story 14.1: Cross-Tool Data Aggregation
 * Task 8.2: Unit tests for ToolCompletionStatus
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToolCompletionStatus } from './ToolCompletionStatus';
import type { AggregatedToolData } from './cost-constants';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

describe('ToolCompletionStatus', () => {
  const mockRefresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when no data is aggregated', () => {
    it('renders all tools as not started', () => {
      render(
        <ToolCompletionStatus
          aggregatedData={null}
          onRefresh={mockRefresh}
        />
      );

      // Should show 6 tools
      expect(screen.getByText(/Tool 1: Alignment/)).toBeInTheDocument();
      expect(screen.getByText(/Tool 2: Meeting Audit/)).toBeInTheDocument();
      expect(screen.getByText(/Tool 3: Decision Velocity/)).toBeInTheDocument();
      expect(screen.getByText(/Tool 4: Stakeholder Map/)).toBeInTheDocument();
      expect(screen.getByText(/Tool 5: Data Flow/)).toBeInTheDocument();
      expect(screen.getByText(/Tool 6: Communication/)).toBeInTheDocument();

      // Should show 0 of 6 complete
      expect(screen.getByText('0 of 6 tools complete')).toBeInTheDocument();
    });

    it('shows "Start this tool" links for incomplete tools', () => {
      render(
        <ToolCompletionStatus
          aggregatedData={null}
          onRefresh={mockRefresh}
        />
      );

      const startLinks = screen.getAllByText(/Start this tool/);
      expect(startLinks.length).toBeGreaterThan(0);
    });
  });

  describe('when some tools are complete', () => {
    const partialData: AggregatedToolData = {
      tool1: {
        compositeScore: 2.7,
        category: 'coordinated',
        weakestDimension: 'Governance',
        completedAt: '2024-01-15T10:00:00Z',
      },
      tool2: {
        annualizedWaste: 1200000,
        meetingsPerWeek: 20,
        totalAttendeeHours: 100,
        completedAt: '2024-01-15T10:00:00Z',
      },
      tool3: null,
      tool4: null,
      tool5: {
        totalFrictionCost: 450000,
        journeyCount: 3,
        frictionPointCount: 12,
        criticalFrictionCount: 4,
        completedAt: '2024-01-15T10:00:00Z',
      },
      tool6: null,
      aggregatedAt: '2024-01-15T10:00:00Z',
      completedToolsCount: 3,
      canProceed: true,
    };

    it('shows completion status for each tool', () => {
      render(
        <ToolCompletionStatus
          aggregatedData={partialData}
          onRefresh={mockRefresh}
        />
      );

      // Completed tools should show their primary metrics
      expect(screen.getByText(/Score:/)).toBeInTheDocument();
      expect(screen.getByText(/2\.7/)).toBeInTheDocument();
      expect(screen.getByText(/Annual Waste:/)).toBeInTheDocument();
      expect(screen.getByText(/\$1\.2M/)).toBeInTheDocument();
      expect(screen.getByText(/Friction Cost:/)).toBeInTheDocument();
      expect(screen.getByText(/\$450K/)).toBeInTheDocument();

      // Should show 3 of 6 complete
      expect(screen.getByText('3 of 6 tools complete')).toBeInTheDocument();
    });

    it('marks Tool 2 as required', () => {
      render(
        <ToolCompletionStatus
          aggregatedData={partialData}
          onRefresh={mockRefresh}
        />
      );

      expect(screen.getByText('Required')).toBeInTheDocument();
    });
  });

  describe('when Tool 2 is not complete', () => {
    const incompleteData: AggregatedToolData = {
      tool1: {
        compositeScore: 2.7,
        category: 'coordinated',
        weakestDimension: 'Governance',
        completedAt: '2024-01-15T10:00:00Z',
      },
      tool2: null, // Not complete
      tool3: null,
      tool4: null,
      tool5: null,
      tool6: null,
      aggregatedAt: '2024-01-15T10:00:00Z',
      completedToolsCount: 1,
      canProceed: false,
    };

    it('shows warning message about Tool 2 requirement', () => {
      render(
        <ToolCompletionStatus
          aggregatedData={incompleteData}
          onRefresh={mockRefresh}
        />
      );

      expect(
        screen.getByText(/Tool 2 \(Meeting Audit\) is required to proceed/)
      ).toBeInTheDocument();
    });
  });

  describe('refresh functionality', () => {
    it('renders refresh button when onRefresh is provided', () => {
      render(
        <ToolCompletionStatus
          aggregatedData={null}
          onRefresh={mockRefresh}
        />
      );

      expect(
        screen.getByRole('button', { name: /Refresh from Tools/ })
      ).toBeInTheDocument();
    });

    it('does not render refresh button when onRefresh is not provided', () => {
      render(<ToolCompletionStatus aggregatedData={null} />);

      expect(
        screen.queryByRole('button', { name: /Refresh from Tools/ })
      ).not.toBeInTheDocument();
    });

    it('calls onRefresh when refresh button is clicked', () => {
      render(
        <ToolCompletionStatus
          aggregatedData={null}
          onRefresh={mockRefresh}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /Refresh from Tools/ }));
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });

    it('disables refresh button when isRefreshing is true', () => {
      render(
        <ToolCompletionStatus
          aggregatedData={null}
          onRefresh={mockRefresh}
          isRefreshing={true}
        />
      );

      const button = screen.getByRole('button', { name: /Refreshing.../ });
      expect(button).toBeDisabled();
    });
  });

  describe('all tools complete', () => {
    const completeData: AggregatedToolData = {
      tool1: {
        compositeScore: 3.2,
        category: 'coordinated',
        weakestDimension: 'People',
        completedAt: '2024-01-15T10:00:00Z',
      },
      tool2: {
        annualizedWaste: 800000,
        meetingsPerWeek: 15,
        totalAttendeeHours: 75,
        completedAt: '2024-01-15T10:00:00Z',
      },
      tool3: {
        avgDecisionLatencyDays: 14,
        bottleneckPatterns: ['Strategic'],
        decisionTypeCount: 4,
        completedAt: '2024-01-15T10:00:00Z',
      },
      tool4: {
        stakeholderCount: 12,
        blockerCount: 2,
        keyPlayerCount: 5,
        riskLevel: 'medium',
        completedAt: '2024-01-15T10:00:00Z',
      },
      tool5: {
        totalFrictionCost: 300000,
        journeyCount: 2,
        frictionPointCount: 8,
        criticalFrictionCount: 2,
        completedAt: '2024-01-15T10:00:00Z',
      },
      tool6: {
        healthScore: 72,
        healthStatus: 'warning',
        patternsDetected: 2,
        interventionsRecommended: 4,
        completedAt: '2024-01-15T10:00:00Z',
      },
      aggregatedAt: '2024-01-15T10:00:00Z',
      completedToolsCount: 6,
      canProceed: true,
    };

    it('shows 6 of 6 tools complete', () => {
      render(
        <ToolCompletionStatus
          aggregatedData={completeData}
          onRefresh={mockRefresh}
        />
      );

      expect(screen.getByText('6 of 6 tools complete')).toBeInTheDocument();
    });

    it('shows primary metric for each tool', () => {
      render(
        <ToolCompletionStatus
          aggregatedData={completeData}
          onRefresh={mockRefresh}
        />
      );

      // Tool 3 metric
      expect(screen.getByText(/Avg Latency:/)).toBeInTheDocument();
      expect(screen.getByText(/14 days/)).toBeInTheDocument();

      // Tool 4 metric
      expect(screen.getByText(/Stakeholders:/)).toBeInTheDocument();
      expect(screen.getByText(/12 \(medium risk\)/)).toBeInTheDocument();

      // Tool 6 metric
      expect(screen.getByText(/Health Score:/)).toBeInTheDocument();
      expect(screen.getByText(/72 \(warning\)/)).toBeInTheDocument();
    });
  });
});
