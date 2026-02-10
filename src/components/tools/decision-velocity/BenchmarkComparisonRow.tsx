'use client';

/**
 * BenchmarkComparisonRow Component
 *
 * Displays a single row in the benchmark comparison table,
 * showing user's median vs industry benchmarks.
 *
 * Story 10.3: Benchmark Comparison Table
 * Covers: AC 1, 2, 6 (Display benchmarks, color coding, visual indication)
 */

import type { ArchetypeMetrics } from './calculations';
import type { BudgetThresholdId } from './constants';
import {
  getBenchmarksForArchetype,
  getBenchmarkLevel,
  calculateGapToFast,
  getBenchmarkLevelColor,
  getBenchmarkColumnStyle,
  type BenchmarkLevel,
  type ArchetypeBenchmarks,
} from './benchmarks';

export interface BenchmarkComparisonRowProps {
  metrics: ArchetypeMetrics;
  budgetThreshold?: BudgetThresholdId;
}

export function BenchmarkComparisonRow({
  metrics,
  budgetThreshold,
}: BenchmarkComparisonRowProps) {
  const benchmarks = getBenchmarksForArchetype(metrics.archetypeId, budgetThreshold);
  const userMedian = metrics.decisionLatency.median;
  const userLevel = getBenchmarkLevel(userMedian, benchmarks);
  const gapToFast = calculateGapToFast(userMedian, benchmarks);
  const levelColors = getBenchmarkLevelColor(userLevel);

  const benchmarkLevels: BenchmarkLevel[] = ['fast', 'average', 'slow', 'crisis'];

  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-colors">
      {/* Category Name */}
      <td className="py-3 px-4 font-medium text-sm">
        {metrics.archetypeLabel}
        <span className="text-xs text-muted-foreground ml-2">
          ({metrics.sampleCount} samples)
        </span>
      </td>

      {/* User's Median - Color-coded */}
      <td className="py-3 px-4 text-center">
        <span
          className={`inline-flex items-center justify-center px-3 py-1 rounded-md text-sm font-semibold ${levelColors.bg} ${levelColors.text}`}
        >
          {userMedian}d
        </span>
      </td>

      {/* Benchmark Columns */}
      {benchmarkLevels.map((level) => {
        const benchmark = benchmarks[level];
        const columnStyle = getBenchmarkColumnStyle(level, userLevel);
        return (
          <td
            key={level}
            className={`py-3 px-4 text-center text-sm ${columnStyle.bg} ${columnStyle.text}`}
          >
            {benchmark.label}
          </td>
        );
      })}

      {/* Gap to Fast */}
      <td className="py-3 px-4 text-center">
        {gapToFast > 0 ? (
          <span className="text-sm font-medium text-orange-600">+{gapToFast}d</span>
        ) : (
          <span className="text-sm font-medium text-green-600">On target</span>
        )}
      </td>
    </tr>
  );
}

/**
 * Get benchmark data for a row (used for sorting)
 */
export function getRowBenchmarkData(
  metrics: ArchetypeMetrics,
  budgetThreshold?: BudgetThresholdId
): {
  metrics: ArchetypeMetrics;
  benchmarks: ArchetypeBenchmarks;
  userLevel: BenchmarkLevel;
  gapToFast: number;
} {
  const benchmarks = getBenchmarksForArchetype(metrics.archetypeId, budgetThreshold);
  const userMedian = metrics.decisionLatency.median;
  return {
    metrics,
    benchmarks,
    userLevel: getBenchmarkLevel(userMedian, benchmarks),
    gapToFast: calculateGapToFast(userMedian, benchmarks),
  };
}
