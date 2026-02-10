import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LatencyMetricsCard } from './LatencyMetricsCard';
import type { ArchetypeMetrics } from './calculations';

/**
 * LatencyMetricsCard Tests
 *
 * Story 10.2: Latency Calculation and Display
 */

const createMetrics = (
  overrides: Partial<ArchetypeMetrics> = {}
): ArchetypeMetrics => ({
  archetypeId: 'strategic',
  archetypeLabel: 'Strategic Initiatives',
  sampleCount: 5,
  decisionLatency: { median: 15, p90: 25, sampleCount: 5 },
  executionLatency: { median: 5, p90: 10, sampleCount: 3 },
  totalCycleTime: { median: 20, p90: 35, sampleCount: 3 },
  ...overrides,
});

describe('LatencyMetricsCard', () => {
  describe('rendering', () => {
    it('renders archetype label', () => {
      render(<LatencyMetricsCard metrics={createMetrics()} />);
      expect(screen.getByText('Strategic Initiatives')).toBeInTheDocument();
    });

    it('renders sample count', () => {
      render(<LatencyMetricsCard metrics={createMetrics()} />);
      expect(screen.getByText('5 samples')).toBeInTheDocument();
    });

    it('renders decision time metric', () => {
      render(<LatencyMetricsCard metrics={createMetrics()} />);
      expect(screen.getByText('Decision Time')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
    });

    it('renders 90th percentile', () => {
      render(<LatencyMetricsCard metrics={createMetrics()} />);
      expect(screen.getByText('90th: 25d')).toBeInTheDocument();
    });

    it('renders execution latency when available', () => {
      render(<LatencyMetricsCard metrics={createMetrics()} />);
      expect(screen.getByText('To Start')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('renders total cycle time when available', () => {
      render(<LatencyMetricsCard metrics={createMetrics()} />);
      expect(screen.getByText('Total Cycle')).toBeInTheDocument();
      expect(screen.getByText('20')).toBeInTheDocument();
    });

    it('renders performance level', () => {
      render(<LatencyMetricsCard metrics={createMetrics()} />);
      expect(screen.getByText('Performance')).toBeInTheDocument();
      expect(screen.getByText('average')).toBeInTheDocument(); // 15 days is average
    });
  });

  describe('missing data handling', () => {
    it('shows N/A for missing execution latency', () => {
      const metrics = createMetrics({ executionLatency: null });
      render(<LatencyMetricsCard metrics={metrics} />);
      expect(screen.getAllByText('N/A').length).toBeGreaterThanOrEqual(1);
    });

    it('shows N/A for missing total cycle time', () => {
      const metrics = createMetrics({ totalCycleTime: null });
      render(<LatencyMetricsCard metrics={metrics} />);
      expect(screen.getAllByText('N/A').length).toBeGreaterThanOrEqual(1);
    });

    it('shows note when no implementation dates', () => {
      const metrics = createMetrics({
        executionLatency: null,
        totalCycleTime: null,
      });
      render(<LatencyMetricsCard metrics={metrics} />);
      expect(
        screen.getByText(/Implementation dates not provided/)
      ).toBeInTheDocument();
    });
  });

  describe('performance levels', () => {
    it('shows fast for <= 10 days', () => {
      const metrics = createMetrics({
        decisionLatency: { median: 8, p90: 12, sampleCount: 5 },
      });
      render(<LatencyMetricsCard metrics={metrics} />);
      expect(screen.getByText('fast')).toBeInTheDocument();
      expect(screen.getByText('< 10 days')).toBeInTheDocument();
    });

    it('shows average for 11-30 days', () => {
      const metrics = createMetrics({
        decisionLatency: { median: 20, p90: 28, sampleCount: 5 },
      });
      render(<LatencyMetricsCard metrics={metrics} />);
      expect(screen.getByText('average')).toBeInTheDocument();
      expect(screen.getByText('10-30 days')).toBeInTheDocument();
    });

    it('shows slow for 31-60 days', () => {
      const metrics = createMetrics({
        decisionLatency: { median: 45, p90: 55, sampleCount: 5 },
      });
      render(<LatencyMetricsCard metrics={metrics} />);
      expect(screen.getByText('slow')).toBeInTheDocument();
      expect(screen.getByText('30-60 days')).toBeInTheDocument();
    });

    it('shows crisis for > 60 days', () => {
      const metrics = createMetrics({
        decisionLatency: { median: 75, p90: 90, sampleCount: 5 },
      });
      render(<LatencyMetricsCard metrics={metrics} />);
      expect(screen.getByText('crisis')).toBeInTheDocument();
      expect(screen.getByText('> 60 days')).toBeInTheDocument();
    });
  });

  describe('highlighting', () => {
    it('applies highlight styling when isHighlighted', () => {
      const metrics = createMetrics({
        decisionLatency: { median: 45, p90: 55, sampleCount: 5 },
      });
      const { container } = render(
        <LatencyMetricsCard metrics={metrics} isHighlighted />
      );
      // Should have performance-based background color
      expect(container.firstChild).toHaveClass('bg-orange-50');
    });

    it('uses default styling when not highlighted', () => {
      const { container } = render(
        <LatencyMetricsCard metrics={createMetrics()} isHighlighted={false} />
      );
      expect(container.firstChild).toHaveClass('bg-card');
    });
  });

  describe('accessibility', () => {
    it('renders as a region', () => {
      render(<LatencyMetricsCard metrics={createMetrics()} />);
      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('has accessible heading', () => {
      render(<LatencyMetricsCard metrics={createMetrics()} />);
      expect(
        screen.getByRole('heading', { level: 3 })
      ).toBeInTheDocument();
    });
  });

  describe('singular/plural handling', () => {
    it('shows "sample" singular for 1 sample', () => {
      const metrics = createMetrics({ sampleCount: 1 });
      render(<LatencyMetricsCard metrics={metrics} />);
      expect(screen.getByText('1 sample')).toBeInTheDocument();
    });
  });
});
