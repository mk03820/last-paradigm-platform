/**
 * InterpretationCard Component Tests
 *
 * Story 14.3: Alignment Tax Calculation and Interpretation
 * Task 8.3: Unit tests for display components
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  InterpretationCard,
  InterpretationBadge,
  ThresholdLegend,
  InterpretationIndicator,
} from './InterpretationCard';
import { INTERPRETATION_THRESHOLDS } from './cost-constants';

const normalThreshold = INTERPRETATION_THRESHOLDS[0];
const significantThreshold = INTERPRETATION_THRESHOLDS[1];
const crisisThreshold = INTERPRETATION_THRESHOLDS[2];
const existentialThreshold = INTERPRETATION_THRESHOLDS[3];

describe('InterpretationCard', () => {
  it('should render normal level correctly', () => {
    render(<InterpretationCard interpretation={normalThreshold} />);

    expect(screen.getByText('NORMAL LEVEL')).toBeInTheDocument();
    expect(screen.getByText(normalThreshold.description)).toBeInTheDocument();
  });

  it('should render significant level correctly', () => {
    render(<InterpretationCard interpretation={significantThreshold} />);

    expect(screen.getByText('SIGNIFICANT LEVEL')).toBeInTheDocument();
  });

  it('should render crisis level correctly', () => {
    render(<InterpretationCard interpretation={crisisThreshold} />);

    expect(screen.getByText('CRISIS LEVEL')).toBeInTheDocument();
  });

  it('should render existential level correctly', () => {
    render(<InterpretationCard interpretation={existentialThreshold} />);

    expect(screen.getByText('EXISTENTIAL LEVEL')).toBeInTheDocument();
  });

  it('should show threshold legend', () => {
    render(<InterpretationCard interpretation={crisisThreshold} />);

    expect(screen.getByText('Thresholds')).toBeInTheDocument();
    expect(screen.getByText(/0-2%/)).toBeInTheDocument();
    expect(screen.getByText(/2-4%/)).toBeInTheDocument();
    expect(screen.getByText(/4-7%/)).toBeInTheDocument();
    expect(screen.getByText(/>7%/)).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <InterpretationCard interpretation={normalThreshold} className="custom-class" />
    );

    const card = container.querySelector('[data-slot="card"]');
    expect(card).toHaveClass('custom-class');
  });
});

describe('InterpretationBadge', () => {
  it('should render the level label', () => {
    render(<InterpretationBadge interpretation={crisisThreshold} />);

    expect(screen.getByText('Crisis')).toBeInTheDocument();
  });

  it('should apply interpretation colors', () => {
    const { container } = render(
      <InterpretationBadge interpretation={crisisThreshold} />
    );

    expect(container.firstChild).toHaveClass('bg-orange-100');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <InterpretationBadge interpretation={normalThreshold} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('ThresholdLegend', () => {
  it('should render all threshold ranges', () => {
    render(<ThresholdLegend />);

    expect(screen.getByText(/0-2%/)).toBeInTheDocument();
    expect(screen.getByText(/2-4%/)).toBeInTheDocument();
    expect(screen.getByText(/4-7%/)).toBeInTheDocument();
    expect(screen.getByText(/>7%/)).toBeInTheDocument();
  });

  it('should highlight current level', () => {
    render(<ThresholdLegend currentLevel="crisis" />);

    // The crisis level should have ring styling
    const crisisSpan = screen.getByText(/4-7%/).closest('span');
    expect(crisisSpan).toHaveClass('ring-2');
  });

  it('should apply custom className', () => {
    const { container } = render(<ThresholdLegend className="custom-class" />);

    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('InterpretationIndicator', () => {
  it('should render level label by default', () => {
    render(<InterpretationIndicator interpretation={crisisThreshold} />);

    expect(screen.getByText('Crisis')).toBeInTheDocument();
  });

  it('should hide label when showLabel is false', () => {
    render(<InterpretationIndicator interpretation={crisisThreshold} showLabel={false} />);

    expect(screen.queryByText('Crisis')).not.toBeInTheDocument();
  });

  it('should have accessible status role', () => {
    render(<InterpretationIndicator interpretation={crisisThreshold} />);

    expect(screen.getByRole('status')).toHaveAttribute(
      'aria-label',
      'Crisis level'
    );
  });

  it('should apply interpretation colors', () => {
    const { container } = render(
      <InterpretationIndicator interpretation={crisisThreshold} />
    );

    expect(container.firstChild).toHaveClass('text-orange-700');
  });
});
