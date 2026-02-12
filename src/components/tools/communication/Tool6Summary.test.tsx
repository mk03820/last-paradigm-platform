/**
 * Tool6Summary Component Tests
 *
 * Story 13.4: Intervention Recommendations
 * Task 9: Write tests (AC: all)
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Tool6Summary, Tool6CompleteBadge } from './Tool6Summary';
import type { Tool6Summary as Tool6SummaryType } from './comm-constants';

const mockSummary: Tool6SummaryType = {
  healthScore: 65,
  healthStatus: 'warning',
  patternsDetected: 3,
  patternsSeverity: {
    high: 1,
    medium: 1,
    low: 1,
  },
  interventionsRecommended: 8,
  topInterventions: [
    'First Intervention',
    'Second Intervention',
    'Third Intervention',
  ],
  completedAt: new Date().toISOString(),
};

describe('Tool6Summary', () => {
  it('renders title', () => {
    render(<Tool6Summary summary={mockSummary} />);
    expect(screen.getByText('Tool 6 Summary')).toBeInTheDocument();
  });

  it('displays health score', () => {
    render(<Tool6Summary summary={mockSummary} />);
    expect(screen.getByText('65')).toBeInTheDocument();
    expect(screen.getByText('/100')).toBeInTheDocument();
  });

  it('displays health status badge', () => {
    render(<Tool6Summary summary={mockSummary} />);
    expect(screen.getByText('Warning')).toBeInTheDocument();
  });

  it('displays patterns detected count', () => {
    render(<Tool6Summary summary={mockSummary} />);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('of 5')).toBeInTheDocument();
  });

  it('displays severity breakdown badges', () => {
    render(<Tool6Summary summary={mockSummary} />);
    expect(screen.getByText('1 High')).toBeInTheDocument();
    expect(screen.getByText('1 Medium')).toBeInTheDocument();
    expect(screen.getByText('1 Low')).toBeInTheDocument();
  });

  it('displays interventions count', () => {
    render(<Tool6Summary summary={mockSummary} />);
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('displays top interventions list', () => {
    render(<Tool6Summary summary={mockSummary} />);
    expect(screen.getByText('First Intervention')).toBeInTheDocument();
    expect(screen.getByText('Second Intervention')).toBeInTheDocument();
    expect(screen.getByText('Third Intervention')).toBeInTheDocument();
  });

  it('shows healthy status correctly', () => {
    const healthySummary: Tool6SummaryType = {
      ...mockSummary,
      healthScore: 85,
      healthStatus: 'healthy',
    };
    render(<Tool6Summary summary={healthySummary} />);
    expect(screen.getByText('Healthy')).toBeInTheDocument();
  });

  it('shows crisis status correctly', () => {
    const crisisSummary: Tool6SummaryType = {
      ...mockSummary,
      healthScore: 25,
      healthStatus: 'crisis',
    };
    render(<Tool6Summary summary={crisisSummary} />);
    expect(screen.getByText('Critical')).toBeInTheDocument();
  });

  it('hides severity badges when counts are zero', () => {
    const noPatterns: Tool6SummaryType = {
      ...mockSummary,
      patternsDetected: 0,
      patternsSeverity: { high: 0, medium: 0, low: 0 },
    };
    render(<Tool6Summary summary={noPatterns} />);
    expect(screen.queryByText('0 High')).not.toBeInTheDocument();
    expect(screen.queryByText('0 Medium')).not.toBeInTheDocument();
    expect(screen.queryByText('0 Low')).not.toBeInTheDocument();
  });

  it('hides top interventions when empty', () => {
    const noInterventions: Tool6SummaryType = {
      ...mockSummary,
      topInterventions: [],
    };
    render(<Tool6Summary summary={noInterventions} />);
    expect(screen.queryByText('Top priorities:')).not.toBeInTheDocument();
  });

  it('shows Tool 7 readiness message', () => {
    render(<Tool6Summary summary={mockSummary} />);
    expect(
      screen.getByText('Ready for Total Cost of Misalignment Calculator')
    ).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <Tool6Summary summary={mockSummary} className="custom-class" />
    );
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});

describe('Tool6CompleteBadge', () => {
  it('displays health score', () => {
    render(<Tool6CompleteBadge summary={mockSummary} />);
    expect(screen.getByText(/Health: 65\/100/)).toBeInTheDocument();
  });

  it('displays patterns count', () => {
    render(<Tool6CompleteBadge summary={mockSummary} />);
    expect(screen.getByText(/3 patterns/)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <Tool6CompleteBadge summary={mockSummary} className="custom-class" />
    );
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});
