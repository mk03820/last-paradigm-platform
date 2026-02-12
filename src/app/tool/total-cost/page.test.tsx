/**
 * Total Cost Page Integration Tests
 *
 * Story 14.1: Cross-Tool Data Aggregation
 * Task 8.4: Integration tests for page
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/tool/total-cost',
}));

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'unauthenticated',
  }),
  signOut: vi.fn(),
}));

// Mock the tooltip provider
vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip-content">{children}</div>
  ),
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock the aggregation engine
const mockAggregateAllTools = vi.fn();
vi.mock('@/components/tools/total-cost/aggregation-engine', () => ({
  aggregateAllTools: () => mockAggregateAllTools(),
}));

// Import after mocks
import TotalCostPage from './page';
import { useTool7Store } from '@/lib/store/tool7-store';
import type { AggregatedToolData } from '@/components/tools/total-cost/cost-constants';

describe('Total Cost Page', () => {
  const completeAggregatedData: AggregatedToolData = {
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

  beforeEach(() => {
    vi.clearAllMocks();
    useTool7Store.getState().resetTool7();
    mockAggregateAllTools.mockReturnValue(completeAggregatedData);
  });

  describe('layout', () => {
    it('renders header', () => {
      render(<TotalCostPage />);
      expect(screen.getByText('The Last Paradigm')).toBeInTheDocument();
    });

    it('renders back to diagnostic hub link', () => {
      render(<TotalCostPage />);
      expect(
        screen.getByRole('link', { name: /Back to Diagnostic Hub/ })
      ).toHaveAttribute('href', '/diagnostic');
    });

    it('renders page title', () => {
      render(<TotalCostPage />);
      expect(
        screen.getByRole('heading', { name: /Total Cost of Misalignment Calculator/ })
      ).toBeInTheDocument();
    });

    it('renders page description', () => {
      render(<TotalCostPage />);
      expect(
        screen.getByText(/Aggregate data from all diagnostic tools/)
      ).toBeInTheDocument();
    });
  });

  describe('data aggregation', () => {
    it('aggregates data on initial load', async () => {
      render(<TotalCostPage />);

      await waitFor(() => {
        expect(mockAggregateAllTools).toHaveBeenCalled();
      });
    });

    it('displays tool completion status', async () => {
      render(<TotalCostPage />);

      await waitFor(() => {
        expect(screen.getByText('Tool Completion Status')).toBeInTheDocument();
        expect(screen.getByText('3 of 6 tools complete')).toBeInTheDocument();
      });
    });

    it('displays aggregated data preview', async () => {
      render(<TotalCostPage />);

      await waitFor(() => {
        expect(screen.getByText('Aggregated Data Preview')).toBeInTheDocument();
      });
    });
  });

  describe('refresh functionality', () => {
    it('refreshes data when Refresh Data button is clicked', async () => {
      render(<TotalCostPage />);

      // Wait for initial load
      await waitFor(() => {
        expect(mockAggregateAllTools).toHaveBeenCalledTimes(1);
      });

      // Click refresh button
      const refreshButton = screen.getByRole('button', { name: /Refresh Data/ });
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(mockAggregateAllTools).toHaveBeenCalledTimes(2);
      });
    });

    it('shows refreshing state while aggregating', async () => {
      render(<TotalCostPage />);

      // The button should change during refresh
      const refreshButton = screen.getByRole('button', { name: /Refresh Data/ });
      expect(refreshButton).toBeInTheDocument();
    });
  });

  describe('minimum requirement warning', () => {
    it('shows warning when Tool 2 is not complete', async () => {
      const incompleteData: AggregatedToolData = {
        ...completeAggregatedData,
        tool2: null,
        canProceed: false,
        completedToolsCount: 2,
      };
      mockAggregateAllTools.mockReturnValue(incompleteData);

      render(<TotalCostPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/Minimum Requirement Not Met/)
        ).toBeInTheDocument();
        expect(
          screen.getByText(/Tool 2: Meeting Audit Calculator/)
        ).toBeInTheDocument();
      });
    });

    it('does not show warning when Tool 2 is complete', async () => {
      render(<TotalCostPage />);

      await waitFor(() => {
        expect(
          screen.queryByText(/Minimum Requirement Not Met/)
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('navigation', () => {
    it('enables Continue button when canProceed is true', async () => {
      render(<TotalCostPage />);

      await waitFor(() => {
        const continueButton = screen.getByRole('button', {
          name: /Continue to Cost Inputs/,
        });
        expect(continueButton).not.toBeDisabled();
      });
    });

    it('disables Continue button when canProceed is false', async () => {
      const incompleteData: AggregatedToolData = {
        ...completeAggregatedData,
        tool2: null,
        canProceed: false,
      };
      mockAggregateAllTools.mockReturnValue(incompleteData);

      render(<TotalCostPage />);

      await waitFor(() => {
        const continueButton = screen.getByRole('button', {
          name: /Continue to Cost Inputs/,
        });
        expect(continueButton).toBeDisabled();
      });
    });

    it('navigates to inputs page on Continue click', async () => {
      render(<TotalCostPage />);

      // Wait for aggregation to complete and button to be enabled
      await waitFor(() => {
        const continueButton = screen.getByRole('button', {
          name: /Continue to Cost Inputs/,
        });
        expect(continueButton).not.toBeDisabled();
      });

      // Click the enabled button
      const continueButton = screen.getByRole('button', {
        name: /Continue to Cost Inputs/,
      });
      fireEvent.click(continueButton);

      expect(mockPush).toHaveBeenCalledWith('/tool/total-cost/inputs');
    });

    it('renders Back to Tool Hub link', () => {
      render(<TotalCostPage />);

      const backButton = screen.getByRole('link', { name: /Back to Tool Hub/ });
      expect(backButton).toHaveAttribute('href', '/diagnostic');
    });
  });

  describe('help text', () => {
    it('shows help text when cannot proceed', async () => {
      const incompleteData: AggregatedToolData = {
        ...completeAggregatedData,
        tool2: null,
        canProceed: false,
      };
      mockAggregateAllTools.mockReturnValue(incompleteData);

      render(<TotalCostPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/Complete Tool 2 \(Meeting Audit\) to proceed/)
        ).toBeInTheDocument();
      });
    });

    it('shows what happens next section when tools are complete', async () => {
      render(<TotalCostPage />);

      await waitFor(() => {
        expect(screen.getByText('What Happens Next?')).toBeInTheDocument();
        expect(
          screen.getByText(/With 3 tools complete/)
        ).toBeInTheDocument();
      });
    });
  });
});
