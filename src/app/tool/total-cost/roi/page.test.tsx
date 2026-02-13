/**
 * ROI Calculator Page Tests
 *
 * Tests for the ROI Calculator page.
 *
 * Story 14.5: Transformation ROI Calculator
 * Task 7: Write tests for page component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock next/navigation
const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

// Mock the store
const mockStore = {
  aggregatedData: {
    tool1: null,
    tool2: {
      annualizedWaste: 1200000,
      meetingsPerWeek: 45,
      totalAttendeeHours: 540,
      completedAt: new Date().toISOString(),
    },
    tool3: null,
    tool4: null,
    tool5: {
      totalFrictionCost: 450000,
      journeyCount: 5,
      frictionPointCount: 12,
      criticalFrictionCount: 3,
      completedAt: new Date().toISOString(),
    },
    tool6: null,
    aggregatedAt: new Date().toISOString(),
    completedToolsCount: 2,
    canProceed: true,
  },
  additionalCostsInput: {
    projectDelays: { failedProjectsCount: 0, avgProjectValue: 0, delayImpactPercent: 0, subtotal: 350000 },
    rework: { reworkPercent: 0, annualLaborCost: 0, subtotal: 0 },
    turnover: { excessTurnoverRate: 0, avgReplacementCost: 0, headcount: 0, subtotal: 0 },
    opportunityCost: { delayedRevenue: 0, missedDeals: 0, marketShareLoss: 0, subtotal: 0 },
    total: 350000,
  },
  revenue: 50000000,
  canProceed: () => true,
};

vi.mock('@/lib/store/tool7-store', () => ({
  useTool7Store: (selector: (state: typeof mockStore) => unknown) => selector(mockStore),
}));

// Mock components
vi.mock('@/components/layout', () => ({
  Header: () => <header data-testid="header">Header</header>,
}));

vi.mock('@/components/diagnostic', () => ({
  ProgressStepper: () => <div data-testid="progress-stepper">Progress</div>,
  ToolGuidance: () => <div data-testid="tool-guidance">Guidance</div>,
}));

// Import after mocks
import ROICalculatorPage from './page';

describe('ROICalculatorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the page header', () => {
    render(<ROICalculatorPage />);

    expect(screen.getByText('Transformation ROI Calculator')).toBeInTheDocument();
  });

  it('should display alignment tax from store', () => {
    render(<ROICalculatorPage />);

    // Total alignment tax: 1,200,000 + 450,000 + 350,000 = 2,000,000
    expect(screen.getByText('Your Current Annual Alignment Tax')).toBeInTheDocument();
    expect(screen.getByText('$2.0M')).toBeInTheDocument();
  });

  it('should display percentage of revenue', () => {
    render(<ROICalculatorPage />);

    // 2M / 50M = 4%
    expect(screen.getByText('As % of Revenue')).toBeInTheDocument();
    expect(screen.getByText('4.0%')).toBeInTheDocument();
  });

  it('should show ROI calculator form', () => {
    render(<ROICalculatorPage />);

    expect(screen.getByText('ROI Calculator')).toBeInTheDocument();
    expect(screen.getByLabelText(/transformation investment/i)).toBeInTheDocument();
  });

  it('should show empty state before calculation', () => {
    render(<ROICalculatorPage />);

    expect(screen.getByText('Enter Investment Amount')).toBeInTheDocument();
  });

  it('should have back button to results page', () => {
    render(<ROICalculatorPage />);

    const backLink = screen.getByRole('link', { name: /back to results/i });
    expect(backLink).toHaveAttribute('href', '/tool/total-cost/results');
  });

  it('should have complete diagnostic button', () => {
    render(<ROICalculatorPage />);

    expect(screen.getByRole('button', { name: /complete diagnostic/i })).toBeInTheDocument();
  });

  it('should navigate to dashboard on complete', async () => {
    const user = userEvent.setup();
    render(<ROICalculatorPage />);

    const completeButton = screen.getByRole('button', { name: /complete diagnostic/i });
    await user.click(completeButton);

    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('should show methodology note', () => {
    render(<ROICalculatorPage />);

    expect(screen.getByText('About This Calculator')).toBeInTheDocument();
    expect(screen.getByText(/Net Present Value/i)).toBeInTheDocument();
  });

  it('should calculate and display results when calculate is clicked', async () => {
    const user = userEvent.setup();
    render(<ROICalculatorPage />);

    // Enter investment
    const investmentInput = screen.getByLabelText(/transformation investment/i);
    await user.clear(investmentInput);
    await user.type(investmentInput, '500000');

    // Click calculate
    const calculateButton = screen.getByRole('button', { name: /calculate roi/i });
    await user.click(calculateButton);

    // Wait for results to appear
    await waitFor(() => {
      expect(screen.getByText('ROI Scenarios')).toBeInTheDocument();
    });

    // Should show all three scenarios
    expect(screen.getByText('Conservative')).toBeInTheDocument();
    expect(screen.getByText('Moderate')).toBeInTheDocument();
    expect(screen.getByText('Aggressive')).toBeInTheDocument();
  });

  it('should show board summary after calculation', async () => {
    const user = userEvent.setup();
    render(<ROICalculatorPage />);

    // Enter investment and calculate
    const investmentInput = screen.getByLabelText(/transformation investment/i);
    await user.clear(investmentInput);
    await user.type(investmentInput, '500000');

    const calculateButton = screen.getByRole('button', { name: /calculate roi/i });
    await user.click(calculateButton);

    await waitFor(() => {
      expect(screen.getByText('Board Summary')).toBeInTheDocument();
    });
  });
});

describe('ROICalculatorPage - No Data', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Override mock to return canProceed false
    vi.mocked(mockStore.canProceed).mockReturnValue(false);
  });

  it('should redirect if canProceed is false', async () => {
    const originalCanProceed = mockStore.canProceed;
    mockStore.canProceed = () => false;

    render(<ROICalculatorPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/tool/total-cost');
    });

    // Restore
    mockStore.canProceed = originalCanProceed;
  });
});
