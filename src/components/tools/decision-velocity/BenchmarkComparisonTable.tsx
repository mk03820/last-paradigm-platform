'use client';

/**
 * BenchmarkComparisonTable Component
 *
 * Displays a table comparing user's decision velocity against
 * industry benchmarks for all archetypes with sufficient data.
 *
 * Story 10.3: Benchmark Comparison Table
 * Covers: AC 1, 4 (Table layout, sortable by gap)
 */

import { useState, useMemo } from 'react';
import type { ArchetypeMetrics } from './calculations';
import type { BudgetThresholdId } from './constants';
import { BenchmarkComparisonRow, getRowBenchmarkData } from './BenchmarkComparisonRow';
import { getBenchmarkLevelColor, BENCHMARK_LABELS, type BenchmarkLevel } from './benchmarks';

export type SortColumn = 'category' | 'median' | 'gap';
export type SortDirection = 'asc' | 'desc';

export interface BenchmarkComparisonTableProps {
  metrics: ArchetypeMetrics[];
  budgetThreshold?: BudgetThresholdId;
}

export function BenchmarkComparisonTable({
  metrics,
  budgetThreshold,
}: BenchmarkComparisonTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('gap');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      // Default to desc for gap (worst first), asc for others
      setSortDirection(column === 'gap' ? 'desc' : 'asc');
    }
  };

  const sortedMetrics = useMemo(() => {
    const rowsWithData = metrics.map((m) => getRowBenchmarkData(m, budgetThreshold));

    return rowsWithData.sort((a, b) => {
      let comparison = 0;

      switch (sortColumn) {
        case 'category':
          comparison = a.metrics.archetypeLabel.localeCompare(b.metrics.archetypeLabel);
          break;
        case 'median':
          comparison = a.metrics.decisionLatency.median - b.metrics.decisionLatency.median;
          break;
        case 'gap':
          comparison = a.gapToFast - b.gapToFast;
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [metrics, budgetThreshold, sortColumn, sortDirection]);

  const getSortIndicator = (column: SortColumn) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  const benchmarkLevels: BenchmarkLevel[] = ['fast', 'average', 'slow', 'crisis'];

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <span className="text-muted-foreground">Performance levels:</span>
        {benchmarkLevels.map((level) => {
          const colors = getBenchmarkLevelColor(level);
          const info = BENCHMARK_LABELS[level];
          return (
            <span key={level} className="inline-flex items-center gap-1">
              <span className={`w-3 h-3 rounded ${colors.bg} ${colors.border} border`} />
              <span className={colors.text}>{info.label}</span>
            </span>
          );
        })}
      </div>

      {/* Table with horizontal scroll on mobile */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[700px]">
          <thead className="bg-muted/50">
            <tr>
              <th
                className="py-3 px-4 text-left text-sm font-semibold cursor-pointer hover:bg-muted transition-colors"
                onClick={() => handleSort('category')}
                aria-sort={sortColumn === 'category' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                Category{getSortIndicator('category')}
              </th>
              <th
                className="py-3 px-4 text-center text-sm font-semibold cursor-pointer hover:bg-muted transition-colors"
                onClick={() => handleSort('median')}
                aria-sort={sortColumn === 'median' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                Your Median{getSortIndicator('median')}
              </th>
              {benchmarkLevels.map((level) => (
                <th
                  key={level}
                  className="py-3 px-4 text-center text-sm font-semibold"
                >
                  {BENCHMARK_LABELS[level].label}
                </th>
              ))}
              <th
                className="py-3 px-4 text-center text-sm font-semibold cursor-pointer hover:bg-muted transition-colors"
                onClick={() => handleSort('gap')}
                aria-sort={sortColumn === 'gap' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                Gap to Fast{getSortIndicator('gap')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedMetrics.map(({ metrics: m }) => (
              <BenchmarkComparisonRow
                key={m.archetypeId}
                metrics={m}
                budgetThreshold={budgetThreshold}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Table explanation */}
      <p className="text-xs text-muted-foreground">
        Click column headers to sort. Gap shows days behind the &quot;Fast&quot; benchmark.
        {budgetThreshold && (
          <> Budget benchmarks are based on your selected threshold tier.</>
        )}
      </p>
    </div>
  );
}
