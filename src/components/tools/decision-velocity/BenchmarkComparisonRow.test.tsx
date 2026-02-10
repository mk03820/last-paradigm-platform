import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BenchmarkComparisonRow, getRowBenchmarkData } from './BenchmarkComparisonRow';
import type { ArchetypeMetrics } from './calculations';

/**
 * BenchmarkComparisonRow Tests
 *
 * Story 10.3: Benchmark Comparison Table
 * Covers: AC 1, 2, 6 (Display benchmarks, color coding, visual indication)
 */

const createMetrics = (
  overrides: Partial<ArchetypeMetrics> = {}
): ArchetypeMetrics => ({
  archetypeId: 'strategic',
  archetypeLabel: 'Strategic Initiatives',
  sampleCount: 5,
  decisionLatency: { median: 30, p90: 45, sampleCount: 5 },
  executionLatency: null,
  totalCycleTime: null,
  ...overrides,
});

// Helper to render row within a table structure
const renderRow = (props: React.ComponentProps<typeof BenchmarkComparisonRow>) => {
  return render(
    <table>
      <tbody>
        <BenchmarkComparisonRow {...props} />
      </tbody>
    </table>
  );
};

describe('BenchmarkComparisonRow', () => {
  describe('rendering', () => {
    it('renders archetype label', () => {
      renderRow({ metrics: createMetrics() });
      expect(screen.getByText('Strategic Initiatives')).toBeInTheDocument();
    });

    it('renders sample count', () => {
      renderRow({ metrics: createMetrics({ sampleCount: 8 }) });
      expect(screen.getByText('(8 samples)')).toBeInTheDocument();
    });

    it('displays user median with days suffix', () => {
      renderRow({ metrics: createMetrics() });
      expect(screen.getByText('30d')).toBeInTheDocument();
    });

    it('displays all benchmark columns', () => {
      renderRow({ metrics: createMetrics() });
      expect(screen.getByText('< 2 weeks')).toBeInTheDocument(); // fast
      expect(screen.getByText('2-6 weeks')).toBeInTheDocument(); // average
      expect(screen.getByText('6-12 weeks')).toBeInTheDocument(); // slow
      expect(screen.getByText('> 12 weeks')).toBeInTheDocument(); // crisis
    });
  });

  describe('gap calculation', () => {
    it('shows gap when above fast benchmark', () => {
      // Strategic fast is ≤14 days, median is 30, gap = 16
      renderRow({ metrics: createMetrics({ decisionLatency: { median: 30, p90: 45, sampleCount: 5 } }) });
      expect(screen.getByText('+16d')).toBeInTheDocument();
    });

    it('shows "On target" when at or below fast benchmark', () => {
      renderRow({ metrics: createMetrics({ decisionLatency: { median: 10, p90: 14, sampleCount: 5 } }) });
      expect(screen.getByText('On target')).toBeInTheDocument();
    });

    it('shows "On target" when exactly at fast threshold', () => {
      // Strategic fast max is 14
      renderRow({ metrics: createMetrics({ decisionLatency: { median: 14, p90: 20, sampleCount: 5 } }) });
      expect(screen.getByText('On target')).toBeInTheDocument();
    });
  });

  describe('color coding by performance level', () => {
    it('shows green styling for fast performance (≤14d for strategic)', () => {
      const { container } = renderRow({
        metrics: createMetrics({ decisionLatency: { median: 10, p90: 14, sampleCount: 5 } }),
      });
      const medianCell = screen.getByText('10d');
      expect(medianCell).toHaveClass('bg-green-100');
    });

    it('shows yellow styling for average performance (15-45d for strategic)', () => {
      const metrics = createMetrics({ decisionLatency: { median: 30, p90: 40, sampleCount: 5 } });
      renderRow({ metrics });
      const medianCell = screen.getByText('30d');
      expect(medianCell).toHaveClass('bg-yellow-100');
    });

    it('shows orange styling for slow performance (46-90d for strategic)', () => {
      const metrics = createMetrics({ decisionLatency: { median: 60, p90: 80, sampleCount: 5 } });
      renderRow({ metrics });
      const medianCell = screen.getByText('60d');
      expect(medianCell).toHaveClass('bg-orange-100');
    });

    it('shows red styling for crisis performance (>90d for strategic)', () => {
      const metrics = createMetrics({ decisionLatency: { median: 100, p90: 120, sampleCount: 5 } });
      renderRow({ metrics });
      const medianCell = screen.getByText('100d');
      expect(medianCell).toHaveClass('bg-red-100');
    });
  });

  describe('budget archetype handling', () => {
    it('uses budget-specific benchmarks when budget archetype', () => {
      const budgetMetrics = createMetrics({
        archetypeId: 'budget',
        archetypeLabel: 'Budget Approvals',
        decisionLatency: { median: 8, p90: 12, sampleCount: 5 },
      });
      // tier2 fast is ≤10 days, so 8 should be fast
      renderRow({ metrics: budgetMetrics, budgetThreshold: 'tier2' });
      const medianCell = screen.getByText('8d');
      expect(medianCell).toHaveClass('bg-green-100');
    });

    it('shows tier-appropriate benchmark labels', () => {
      const budgetMetrics = createMetrics({
        archetypeId: 'budget',
        archetypeLabel: 'Budget Approvals',
      });
      renderRow({ metrics: budgetMetrics, budgetThreshold: 'tier1' });
      expect(screen.getByText('< 1 week')).toBeInTheDocument(); // tier1 fast
      expect(screen.getByText('1-2 weeks')).toBeInTheDocument(); // tier1 average
    });

    it('applies different threshold benchmarks correctly', () => {
      const budgetMetrics = createMetrics({
        archetypeId: 'budget',
        archetypeLabel: 'Budget Approvals',
        decisionLatency: { median: 30, p90: 45, sampleCount: 5 },
      });
      // tier4 fast is ≤45 days, tier4 average is ≤90 days
      // So 30 days should be "fast" for tier4
      renderRow({ metrics: budgetMetrics, budgetThreshold: 'tier4' });
      const medianCell = screen.getByText('30d');
      expect(medianCell).toHaveClass('bg-green-100');
    });
  });

  describe('different archetypes', () => {
    it('uses correct benchmarks for analytics (tighter thresholds)', () => {
      const analyticsMetrics = createMetrics({
        archetypeId: 'analytics',
        archetypeLabel: 'Analytics & Reporting',
        decisionLatency: { median: 5, p90: 7, sampleCount: 5 },
      });
      // Analytics fast is ≤3 days, average is ≤7 days
      // 5 days should be "average"
      renderRow({ metrics: analyticsMetrics });
      const medianCell = screen.getByText('5d');
      expect(medianCell).toHaveClass('bg-yellow-100');
    });

    it('shows correct benchmark labels for hiring', () => {
      const hiringMetrics = createMetrics({
        archetypeId: 'hiring',
        archetypeLabel: 'Hiring Decisions',
      });
      renderRow({ metrics: hiringMetrics });
      expect(screen.getByText('< 2 weeks')).toBeInTheDocument(); // hiring fast
      expect(screen.getByText('2-4 weeks')).toBeInTheDocument(); // hiring average
    });
  });
});

describe('getRowBenchmarkData', () => {
  it('returns correct data structure', () => {
    const metrics = createMetrics();
    const data = getRowBenchmarkData(metrics);

    expect(data.metrics).toBe(metrics);
    expect(data.benchmarks).toBeDefined();
    expect(data.userLevel).toBeDefined();
    expect(data.gapToFast).toBeDefined();
  });

  it('calculates correct benchmark level', () => {
    const fastMetrics = createMetrics({ decisionLatency: { median: 10, p90: 14, sampleCount: 5 } });
    expect(getRowBenchmarkData(fastMetrics).userLevel).toBe('fast');

    const slowMetrics = createMetrics({ decisionLatency: { median: 60, p90: 80, sampleCount: 5 } });
    expect(getRowBenchmarkData(slowMetrics).userLevel).toBe('slow');
  });

  it('calculates correct gap to fast', () => {
    // Strategic fast is ≤14 days
    const metrics = createMetrics({ decisionLatency: { median: 30, p90: 45, sampleCount: 5 } });
    expect(getRowBenchmarkData(metrics).gapToFast).toBe(16); // 30 - 14 = 16
  });

  it('handles budget threshold parameter', () => {
    const budgetMetrics = createMetrics({
      archetypeId: 'budget',
      decisionLatency: { median: 15, p90: 25, sampleCount: 5 },
    });

    // tier1 fast is ≤5 days
    const tier1Data = getRowBenchmarkData(budgetMetrics, 'tier1');
    expect(tier1Data.gapToFast).toBe(10); // 15 - 5 = 10

    // tier4 fast is ≤45 days
    const tier4Data = getRowBenchmarkData(budgetMetrics, 'tier4');
    expect(tier4Data.gapToFast).toBe(0); // 15 ≤ 45, on target
  });
});
