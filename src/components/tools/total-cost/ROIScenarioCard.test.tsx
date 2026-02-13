/**
 * ROIScenarioCard Component Tests
 *
 * Tests for the ROI Scenario Card component.
 *
 * Story 14.5: Transformation ROI Calculator
 * Task 7: Write tests for calculator components
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ROIScenarioCard, ROIScenarioBadge, ROIQuickSummary } from './ROIScenarioCard';
import type { ROIResult } from './cost-constants';

const mockModerateResult: ROIResult = {
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
};

const mockConservativeResult: ROIResult = {
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
};

describe('ROIScenarioCard', () => {
  it('should render scenario card with correct label', () => {
    render(<ROIScenarioCard result={mockModerateResult} />);

    expect(screen.getByText('Moderate')).toBeInTheDocument();
  });

  it('should display annual savings prominently', () => {
    render(<ROIScenarioCard result={mockModerateResult} />);

    expect(screen.getByText('Annual Savings')).toBeInTheDocument();
    expect(screen.getByText('$1.0M')).toBeInTheDocument();
  });

  it('should display probability badge', () => {
    render(<ROIScenarioCard result={mockModerateResult} />);

    expect(screen.getByText('65% likely')).toBeInTheDocument();
  });

  it('should display key metrics', () => {
    render(<ROIScenarioCard result={mockModerateResult} />);

    expect(screen.getByText('3-Year NPV')).toBeInTheDocument();
    expect(screen.getByText('ROI')).toBeInTheDocument();
    expect(screen.getByText('Payback')).toBeInTheDocument();
    expect(screen.getByText('3-Year Total')).toBeInTheDocument();
  });

  it('should display NPV value', () => {
    render(<ROIScenarioCard result={mockModerateResult} />);

    expect(screen.getByText('$1.8M')).toBeInTheDocument();
  });

  it('should display ROI ratio', () => {
    render(<ROIScenarioCard result={mockModerateResult} />);

    expect(screen.getByText('3.6x')).toBeInTheDocument();
  });

  it('should display payback period', () => {
    render(<ROIScenarioCard result={mockModerateResult} />);

    expect(screen.getByText('9 months')).toBeInTheDocument();
  });

  it('should show recommended badge when isRecommended is true', () => {
    render(<ROIScenarioCard result={mockModerateResult} isRecommended />);

    expect(screen.getByText('Recommended')).toBeInTheDocument();
  });

  it('should not show recommended badge by default', () => {
    render(<ROIScenarioCard result={mockModerateResult} />);

    expect(screen.queryByText('Recommended')).not.toBeInTheDocument();
  });

  it('should apply highlight styling when isHighlighted is true', () => {
    const { container } = render(
      <ROIScenarioCard result={mockModerateResult} isHighlighted />
    );

    const card = container.querySelector('.ring-2');
    expect(card).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<ROIScenarioCard result={mockModerateResult} onClick={onClick} />);

    const card = screen.getByRole('button');
    await user.click(card);

    expect(onClick).toHaveBeenCalled();
  });

  it('should be keyboard accessible when onClick is provided', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<ROIScenarioCard result={mockModerateResult} onClick={onClick} />);

    const card = screen.getByRole('button');
    card.focus();
    await user.keyboard('{Enter}');

    expect(onClick).toHaveBeenCalled();
  });

  it('should display investment and timeline context', () => {
    render(<ROIScenarioCard result={mockModerateResult} />);

    expect(screen.getByText(/\$500K/)).toBeInTheDocument();
    expect(screen.getByText(/18 months/)).toBeInTheDocument();
  });

  it('should display target reduction achieved', () => {
    render(<ROIScenarioCard result={mockModerateResult} />);

    expect(screen.getByText('50% reduction achieved')).toBeInTheDocument();
  });
});

describe('ROIScenarioBadge', () => {
  it('should render badge with scenario label and savings', () => {
    render(<ROIScenarioBadge result={mockModerateResult} />);

    expect(screen.getByText(/Moderate/)).toBeInTheDocument();
    expect(screen.getByText(/\$1.0M\/yr/)).toBeInTheDocument();
  });
});

describe('ROIQuickSummary', () => {
  it('should render quick summary with key metrics', () => {
    render(<ROIQuickSummary result={mockModerateResult} />);

    expect(screen.getByText('Moderate')).toBeInTheDocument();
    expect(screen.getByText('$1.0M')).toBeInTheDocument();
    expect(screen.getByText('3.6x')).toBeInTheDocument();
  });
});
