'use client';

import {
  type ArchetypeMetrics,
  findSlowestArchetype,
  calculateAggregateMetrics,
  getPerformanceLevel,
  getPerformanceColor,
  getPerformanceBgColor,
} from './calculations';

/**
 * VelocityResultsSummary Component
 *
 * Shows aggregate metrics and highlights the slowest decision type.
 *
 * Story 10.2: Latency Calculation and Display
 * Covers: AC1-6 (summary display)
 */

export interface VelocityResultsSummaryProps {
  metrics: ArchetypeMetrics[];
}

export function VelocityResultsSummary({ metrics }: VelocityResultsSummaryProps) {
  const slowest = findSlowestArchetype(metrics);
  const aggregate = calculateAggregateMetrics(metrics);

  if (!aggregate) {
    return null;
  }

  const overallLevel = getPerformanceLevel(aggregate.decisionLatency.median);

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <div
        className={`rounded-xl border p-6 ${getPerformanceBgColor(overallLevel)}`}
        role="region"
        aria-labelledby="velocity-summary"
      >
        <h2 id="velocity-summary" className="text-lg font-semibold mb-4">
          Decision Velocity Overview
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Overall Median */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Overall Decision Time
            </p>
            <p
              className={`text-4xl font-bold ${getPerformanceColor(overallLevel)}`}
            >
              {aggregate.decisionLatency.median}
              <span className="text-lg font-normal text-muted-foreground ml-1">
                days
              </span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Median across {metrics.length} categor{metrics.length !== 1 ? 'ies' : 'y'}
            </p>
          </div>

          {/* Categories Analyzed */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Decisions Analyzed
            </p>
            <p className="text-4xl font-bold text-foreground">
              {aggregate.sampleCount}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Across {metrics.length} categor{metrics.length !== 1 ? 'ies' : 'y'}
            </p>
          </div>

          {/* Performance Level */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Performance Level
            </p>
            <p
              className={`text-4xl font-bold capitalize ${getPerformanceColor(overallLevel)}`}
            >
              {overallLevel}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {overallLevel === 'fast' && 'Decisions move quickly'}
              {overallLevel === 'average' && 'Room for improvement'}
              {overallLevel === 'slow' && 'Significant delays'}
              {overallLevel === 'crisis' && 'Critical bottlenecks'}
            </p>
          </div>
        </div>
      </div>

      {/* Slowest Category Alert */}
      {slowest && metrics.length > 1 && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
          <div className="flex items-start gap-3">
            <span className="text-xl" aria-hidden="true">
              ⚠️
            </span>
            <div>
              <h3 className="font-semibold text-orange-800">
                Slowest Category: {slowest.archetypeLabel}
              </h3>
              <p className="text-sm text-orange-700 mt-1">
                With a median of{' '}
                <strong>{slowest.decisionLatency.median} days</strong> to make
                decisions, this category may be a bottleneck. The 90th
                percentile is {slowest.decisionLatency.p90} days, indicating
                some decisions take even longer.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Fastest Category
          </p>
          <p className="text-lg font-semibold mt-1">
            {metrics.length > 0
              ? metrics.reduce((fastest, current) =>
                  current.decisionLatency.median < fastest.decisionLatency.median
                    ? current
                    : fastest
                ).archetypeLabel
              : 'N/A'}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            90th Percentile
          </p>
          <p className="text-lg font-semibold mt-1">
            {aggregate.decisionLatency.p90} days
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Avg to Start
          </p>
          <p className="text-lg font-semibold mt-1">
            {aggregate.executionLatency
              ? `${aggregate.executionLatency.median} days`
              : 'N/A'}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Total Cycle
          </p>
          <p className="text-lg font-semibold mt-1">
            {aggregate.totalCycleTime
              ? `${aggregate.totalCycleTime.median} days`
              : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
}
