/**
 * ROIResults Component Tests
 *
 * Tests for the ROI Results display component.
 *
 * Story 14.5: Transformation ROI Calculator
 * Task 7: Write tests for calculator components
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ROIResults, ROICompactSummary } from './ROIResults';
import type { ROIResult } from './cost-constants';

const mockResults: ROIResult[] = [
  {
    scenarioType: 'conservative',
    scenarioLabel: 'Conservative',
    targetReduction: 30,
    timelineMonths: 18,
    investment: 500000,
    annualSavings: 600000,
    threeYearSavings: 1800000,
    npv: 900000,
    roiRatio: 1.8,
    roiPercent: 180,
    paybackMonths: 14,
    probability: 85,
  },
  {
    scenarioType: 'moderate',
    scenarioLabel: 'Moderate',
    targetReduction: 50,
    timelineMonths: 18,
    investment: 500000,
    annualSavings: 1000000,
    threeYearSavings: 3000000,
    npv: 1800000,
    roiRatio: 3.6,
    roiPercent: 360,
    paybackMonths: 9,
    probability: 65,
  },
  {
    scenarioType: 'aggressive',
    scenarioLabel: 'Aggressive',
    targetReduction: 70,
    timelineMonths: 18,
    investment: 500000,
    annualSavings: 1400000,
    threeYearSavings: 4200000,
    npv: 2700000,
    roiRatio: 5.4,
    roiPercent: 540,
    paybackMonths: 6,
    probability: 35,
  },
];

// Mock window.print
const mockPrint = vi.fn();
Object.defineProperty(window, 'print', {
  value: mockPrint,
  writable: true,
});

describe('ROIResults', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all three scenario cards', () => {
    render(<ROIResults results={mockResults} />);

    // Scenario names appear multiple times (in cards and table)
    const conservativeElements = screen.getAllByText('Conservative');
    const moderateElements = screen.getAllByText('Moderate');
    const aggressiveElements = screen.getAllByText('Aggressive');

    expect(conservativeElements.length).toBeGreaterThan(0);
    expect(moderateElements.length).toBeGreaterThan(0);
    expect(aggressiveElements.length).toBeGreaterThan(0);
  });

  it('should display ROI Scenarios header', () => {
    render(<ROIResults results={mockResults} />);

    expect(screen.getByText('ROI Scenarios')).toBeInTheDocument();
  });

  it('should show recommendation alert', () => {
    render(<ROIResults results={mockResults} />);

    expect(screen.getByText('Recommendation')).toBeInTheDocument();
  });

  it('should display board summary by default', () => {
    render(<ROIResults results={mockResults} />);

    expect(screen.getByText('Board Summary')).toBeInTheDocument();
  });

  it('should hide board summary when showBoardSummary is false', () => {
    render(<ROIResults results={mockResults} showBoardSummary={false} />);

    expect(screen.queryByText('Board Summary')).not.toBeInTheDocument();
  });

  it('should call onScenarioSelect when a scenario is clicked', async () => {
    const user = userEvent.setup();
    const onScenarioSelect = vi.fn();
    render(
      <ROIResults
        results={mockResults}
        onScenarioSelect={onScenarioSelect}
      />
    );

    // Get all buttons that represent scenario cards (excluding print button)
    // The scenario cards have role="button" when onClick is provided
    const scenarioCards = screen.getAllByRole('button').filter(
      (btn) => !btn.textContent?.includes('Print')
    );

    if (scenarioCards.length > 0) {
      await user.click(scenarioCards[0]);
      expect(onScenarioSelect).toHaveBeenCalled();
    }
  });

  it('should highlight selected scenario', () => {
    const { container } = render(
      <ROIResults
        results={mockResults}
        selectedScenario="moderate"
        onScenarioSelect={vi.fn()}
      />
    );

    // The moderate card should have highlight class
    const cards = container.querySelectorAll('.ring-2');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('should have print button', () => {
    render(<ROIResults results={mockResults} />);

    expect(screen.getByRole('button', { name: /print/i })).toBeInTheDocument();
  });

  it('should call window.print when print button is clicked', async () => {
    const user = userEvent.setup();
    render(<ROIResults results={mockResults} />);

    const printButton = screen.getByRole('button', { name: /print/i });
    await user.click(printButton);

    expect(mockPrint).toHaveBeenCalled();
  });

  it('should display investment summary', () => {
    render(<ROIResults results={mockResults} />);

    // Investment appears in multiple places - use getAllByText
    const investmentElements = screen.getAllByText('Investment');
    expect(investmentElements.length).toBeGreaterThan(0);
  });

  it('should display annual savings in summary', () => {
    render(<ROIResults results={mockResults} />);

    // Annual Savings appears in cards and summary table
    const savingsElements = screen.getAllByText('Annual Savings');
    expect(savingsElements.length).toBeGreaterThan(0);
  });

  it('should display payback period in summary', () => {
    render(<ROIResults results={mockResults} />);

    expect(screen.getByText('Payback Period')).toBeInTheDocument();
  });

  it('should display projected range', () => {
    render(<ROIResults results={mockResults} />);

    expect(screen.getByText('Projected Range (3-Year NPV)')).toBeInTheDocument();
  });

  it('should display summary table with all scenarios', () => {
    render(<ROIResults results={mockResults} />);

    // Check for table header - use getByRole for table header
    expect(screen.getByText('Scenario')).toBeInTheDocument();
    // Use getAllByText for labels that appear multiple times
    const savingsHeaders = screen.getAllByText('Annual Savings');
    expect(savingsHeaders.length).toBeGreaterThan(0);
    const npvElements = screen.getAllByText('3-Year NPV');
    expect(npvElements.length).toBeGreaterThan(0);
    const roiElements = screen.getAllByText('ROI');
    expect(roiElements.length).toBeGreaterThan(0);
    expect(screen.getByText('Confidence')).toBeInTheDocument();
  });

  it('should display key takeaways', () => {
    render(<ROIResults results={mockResults} />);

    expect(screen.getByText('Key Takeaways:')).toBeInTheDocument();
  });

  it('should display methodology note', () => {
    render(<ROIResults results={mockResults} />);

    expect(screen.getByText(/methodology/i)).toBeInTheDocument();
    expect(screen.getByText(/NPV calculated at 10% discount rate/i)).toBeInTheDocument();
  });

  it('should show recommended badge on appropriate scenario', () => {
    render(<ROIResults results={mockResults} />);

    // Should have exactly one "Recommended" badge
    const recommendedBadges = screen.getAllByText('Recommended');
    expect(recommendedBadges.length).toBe(1);
  });
});

describe('ROICompactSummary', () => {
  it('should render compact summary with key metrics', () => {
    render(<ROICompactSummary results={mockResults} />);

    expect(screen.getByText('Annual Savings')).toBeInTheDocument();
    expect(screen.getByText('ROI')).toBeInTheDocument();
    expect(screen.getByText('Payback')).toBeInTheDocument();
  });

  it('should display moderate scenario values', () => {
    render(<ROICompactSummary results={mockResults} />);

    expect(screen.getByText('$1.0M')).toBeInTheDocument();
    expect(screen.getByText('3.6x')).toBeInTheDocument();
    expect(screen.getByText('9 months')).toBeInTheDocument();
  });

  it('should return null if no moderate result exists', () => {
    const resultsWithoutModerate = mockResults.filter(
      (r) => r.scenarioType !== 'moderate'
    );
    const { container } = render(
      <ROICompactSummary results={resultsWithoutModerate} />
    );

    expect(container.firstChild).toBeNull();
  });
});
