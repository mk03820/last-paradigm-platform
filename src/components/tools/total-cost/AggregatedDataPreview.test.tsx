/**
 * AggregatedDataPreview Component Tests
 *
 * Story 14.1: Cross-Tool Data Aggregation
 * Task 8.3: Unit tests for AggregatedDataPreview
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AggregatedDataPreview } from './AggregatedDataPreview';
import type { AggregatedToolData } from './cost-constants';

describe('AggregatedDataPreview', () => {
  describe('when no data is available', () => {
    it('renders empty state', () => {
      render(<AggregatedDataPreview aggregatedData={null} />);

      expect(screen.getByText('No Data Available')).toBeInTheDocument();
      expect(
        screen.getByText(/Complete the diagnostic tools to see aggregated data/)
      ).toBeInTheDocument();
    });

    it('renders empty state when completedToolsCount is 0', () => {
      const emptyData: AggregatedToolData = {
        tool1: null,
        tool2: null,
        tool3: null,
        tool4: null,
        tool5: null,
        tool6: null,
        aggregatedAt: '2024-01-15T10:00:00Z',
        completedToolsCount: 0,
        canProceed: false,
      };

      render(<AggregatedDataPreview aggregatedData={emptyData} />);
      expect(screen.getByText('No Data Available')).toBeInTheDocument();
    });
  });

  describe('when tools have data', () => {
    const completeData: AggregatedToolData = {
      tool1: {
        compositeScore: 2.7,
        category: 'coordinated',
        weakestDimension: 'Governance Alignment',
        completedAt: '2024-01-15T10:00:00Z',
      },
      tool2: {
        annualizedWaste: 1200000,
        meetingsPerWeek: 25,
        totalAttendeeHours: 125,
        completedAt: '2024-01-15T10:00:00Z',
      },
      tool3: {
        avgDecisionLatencyDays: 18.5,
        bottleneckPatterns: ['Strategic decisions', 'Budget approvals'],
        decisionTypeCount: 4,
        completedAt: '2024-01-15T10:00:00Z',
      },
      tool4: {
        stakeholderCount: 15,
        blockerCount: 3,
        keyPlayerCount: 6,
        riskLevel: 'medium',
        completedAt: '2024-01-15T10:00:00Z',
      },
      tool5: {
        totalFrictionCost: 450000,
        journeyCount: 4,
        frictionPointCount: 16,
        criticalFrictionCount: 5,
        completedAt: '2024-01-15T10:00:00Z',
      },
      tool6: {
        healthScore: 65,
        healthStatus: 'warning',
        patternsDetected: 3,
        interventionsRecommended: 6,
        completedAt: '2024-01-15T10:00:00Z',
      },
      aggregatedAt: '2024-01-15T10:00:00Z',
      completedToolsCount: 6,
      canProceed: true,
    };

    it('renders preview header', () => {
      render(<AggregatedDataPreview aggregatedData={completeData} />);
      expect(screen.getByText('Aggregated Data Preview')).toBeInTheDocument();
    });

    it('renders Tool 1 alignment card', () => {
      render(<AggregatedDataPreview aggregatedData={completeData} />);

      expect(screen.getByText('Tool 1')).toBeInTheDocument();
      expect(screen.getByText('Alignment')).toBeInTheDocument();
      expect(screen.getByText('Composite Score')).toBeInTheDocument();
      expect(screen.getByText('2.7 / 4.0')).toBeInTheDocument();
    });

    it('renders Tool 2 meeting audit card', () => {
      render(<AggregatedDataPreview aggregatedData={completeData} />);

      expect(screen.getByText('Tool 2')).toBeInTheDocument();
      expect(screen.getByText('Meeting Audit')).toBeInTheDocument();
      expect(screen.getByText('Annual Meeting Waste')).toBeInTheDocument();
      expect(screen.getByText('$1.2M')).toBeInTheDocument();
    });

    it('renders Tool 3 decision velocity card', () => {
      render(<AggregatedDataPreview aggregatedData={completeData} />);

      expect(screen.getByText('Tool 3')).toBeInTheDocument();
      expect(screen.getByText('Decision Velocity')).toBeInTheDocument();
      expect(screen.getByText('Avg Decision Latency')).toBeInTheDocument();
      expect(screen.getByText('18.5 days')).toBeInTheDocument();
    });

    it('renders Tool 4 stakeholder map card', () => {
      render(<AggregatedDataPreview aggregatedData={completeData} />);

      expect(screen.getByText('Tool 4')).toBeInTheDocument();
      expect(screen.getByText('Stakeholder Map')).toBeInTheDocument();
      expect(screen.getByText('Stakeholders Mapped')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
    });

    it('renders Tool 5 data flow card', () => {
      render(<AggregatedDataPreview aggregatedData={completeData} />);

      expect(screen.getByText('Tool 5')).toBeInTheDocument();
      expect(screen.getByText('Data Flow')).toBeInTheDocument();
      expect(screen.getByText('Total Friction Cost')).toBeInTheDocument();
      expect(screen.getByText('$450K')).toBeInTheDocument();
    });

    it('renders Tool 6 communication card', () => {
      render(<AggregatedDataPreview aggregatedData={completeData} />);

      expect(screen.getByText('Tool 6')).toBeInTheDocument();
      expect(screen.getByText('Communication')).toBeInTheDocument();
      expect(screen.getByText('Health Score')).toBeInTheDocument();
      expect(screen.getByText('65/100')).toBeInTheDocument();
    });

    it('renders last aggregated timestamp', () => {
      render(<AggregatedDataPreview aggregatedData={completeData} />);
      expect(screen.getByText(/Last aggregated:/)).toBeInTheDocument();
    });

    it('expands card to show details when clicked', async () => {
      render(<AggregatedDataPreview aggregatedData={completeData} />);

      // Tool 1 card should have expandable details
      // Click to expand (find by the tool name and click it)
      const alignmentButton = screen.getByText('Alignment').closest('button');
      if (alignmentButton) {
        fireEvent.click(alignmentButton);
      }

      // Check that details are shown
      expect(screen.getByText('Coordinated')).toBeInTheDocument();
      expect(screen.getByText('Governance Alignment')).toBeInTheDocument();
    });
  });

  describe('partial data', () => {
    const partialData: AggregatedToolData = {
      tool1: null,
      tool2: {
        annualizedWaste: 800000,
        meetingsPerWeek: 15,
        totalAttendeeHours: 75,
        completedAt: '2024-01-15T10:00:00Z',
      },
      tool3: null,
      tool4: null,
      tool5: {
        totalFrictionCost: 200000,
        journeyCount: 2,
        frictionPointCount: 8,
        criticalFrictionCount: 2,
        completedAt: '2024-01-15T10:00:00Z',
      },
      tool6: null,
      aggregatedAt: '2024-01-15T10:00:00Z',
      completedToolsCount: 2,
      canProceed: true,
    };

    it('only renders cards for completed tools', () => {
      render(<AggregatedDataPreview aggregatedData={partialData} />);

      // Should show Tool 2 and Tool 5
      expect(screen.getByText('Tool 2')).toBeInTheDocument();
      expect(screen.getByText('Meeting Audit')).toBeInTheDocument();
      expect(screen.getByText('Tool 5')).toBeInTheDocument();
      expect(screen.getByText('Data Flow')).toBeInTheDocument();

      // Should NOT show Tool 1, 3, 4, 6
      expect(screen.queryByText('Tool 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Tool 3')).not.toBeInTheDocument();
      expect(screen.queryByText('Tool 4')).not.toBeInTheDocument();
      expect(screen.queryByText('Tool 6')).not.toBeInTheDocument();
    });
  });

  describe('currency formatting', () => {
    it('formats millions correctly', () => {
      const data: AggregatedToolData = {
        tool1: null,
        tool2: {
          annualizedWaste: 2500000,
          meetingsPerWeek: 30,
          totalAttendeeHours: 150,
          completedAt: '2024-01-15T10:00:00Z',
        },
        tool3: null,
        tool4: null,
        tool5: null,
        tool6: null,
        aggregatedAt: '2024-01-15T10:00:00Z',
        completedToolsCount: 1,
        canProceed: true,
      };

      render(<AggregatedDataPreview aggregatedData={data} />);
      expect(screen.getByText('$2.5M')).toBeInTheDocument();
    });

    it('formats thousands correctly', () => {
      const data: AggregatedToolData = {
        tool1: null,
        tool2: null,
        tool3: null,
        tool4: null,
        tool5: {
          totalFrictionCost: 125000,
          journeyCount: 1,
          frictionPointCount: 3,
          criticalFrictionCount: 1,
          completedAt: '2024-01-15T10:00:00Z',
        },
        tool6: null,
        aggregatedAt: '2024-01-15T10:00:00Z',
        completedToolsCount: 1,
        canProceed: false,
      };

      render(<AggregatedDataPreview aggregatedData={data} />);
      expect(screen.getByText('$125K')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('handles zero friction cost', () => {
      const data: AggregatedToolData = {
        tool1: null,
        tool2: null,
        tool3: null,
        tool4: null,
        tool5: {
          totalFrictionCost: 0,
          journeyCount: 1,
          frictionPointCount: 0,
          criticalFrictionCount: 0,
          completedAt: '2024-01-15T10:00:00Z',
        },
        tool6: null,
        aggregatedAt: '2024-01-15T10:00:00Z',
        completedToolsCount: 1,
        canProceed: false,
      };

      render(<AggregatedDataPreview aggregatedData={data} />);
      expect(screen.getByText('$0')).toBeInTheDocument();
    });

    it('handles empty bottleneck patterns', () => {
      const data: AggregatedToolData = {
        tool1: null,
        tool2: null,
        tool3: {
          avgDecisionLatencyDays: 5,
          bottleneckPatterns: [],
          decisionTypeCount: 2,
          completedAt: '2024-01-15T10:00:00Z',
        },
        tool4: null,
        tool5: null,
        tool6: null,
        aggregatedAt: '2024-01-15T10:00:00Z',
        completedToolsCount: 1,
        canProceed: false,
      };

      render(<AggregatedDataPreview aggregatedData={data} />);

      // Expand to see details
      const decisionButton = screen.getByText('Decision Velocity').closest('button');
      if (decisionButton) {
        fireEvent.click(decisionButton);
      }

      expect(screen.getByText('None detected')).toBeInTheDocument();
    });
  });
});
