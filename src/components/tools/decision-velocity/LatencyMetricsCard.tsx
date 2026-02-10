'use client';

import {
  type ArchetypeMetrics,
  type LatencyMetrics,
  getPerformanceLevel,
  getPerformanceColor,
  getPerformanceBgColor,
} from './calculations';

/**
 * LatencyMetricsCard Component
 *
 * Displays latency metrics for a single archetype.
 *
 * Story 10.2: Latency Calculation and Display
 * Covers: AC1-4, AC6 (metrics display)
 */

export interface LatencyMetricsCardProps {
  metrics: ArchetypeMetrics;
  isHighlighted?: boolean;
}

function MetricDisplay({
  label,
  metrics,
  showPerformance = true,
}: {
  label: string;
  metrics: LatencyMetrics | null;
  showPerformance?: boolean;
}) {
  if (!metrics) {
    return (
      <div className="text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
          {label}
        </p>
        <p className="text-lg text-muted-foreground">N/A</p>
      </div>
    );
  }

  const level = getPerformanceLevel(metrics.median);
  const colorClass = showPerformance ? getPerformanceColor(level) : 'text-foreground';

  return (
    <div className="text-center">
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className={`text-2xl font-bold ${colorClass}`}>
        {metrics.median}
        <span className="text-sm font-normal text-muted-foreground ml-1">days</span>
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        90th: {metrics.p90}d
        {metrics.sampleCount < 3 && (
          <span className="ml-1">(limited data)</span>
        )}
      </p>
    </div>
  );
}

export function LatencyMetricsCard({
  metrics,
  isHighlighted = false,
}: LatencyMetricsCardProps) {
  const level = getPerformanceLevel(metrics.decisionLatency.median);
  const bgClass = isHighlighted
    ? getPerformanceBgColor(level)
    : 'bg-card border-border';

  return (
    <div
      className={`rounded-xl border p-6 ${bgClass}`}
      role="region"
      aria-labelledby={`metrics-${metrics.archetypeId}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3
          id={`metrics-${metrics.archetypeId}`}
          className="text-lg font-semibold"
        >
          {metrics.archetypeLabel}
        </h3>
        <span className="text-sm text-muted-foreground">
          {metrics.sampleCount} sample{metrics.sampleCount !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricDisplay
          label="Decision Time"
          metrics={metrics.decisionLatency}
          showPerformance={true}
        />
        <MetricDisplay
          label="To Start"
          metrics={metrics.executionLatency}
          showPerformance={false}
        />
        <MetricDisplay
          label="Total Cycle"
          metrics={metrics.totalCycleTime}
          showPerformance={false}
        />
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            Performance
          </p>
          <p
            className={`text-lg font-semibold capitalize ${getPerformanceColor(level)}`}
          >
            {level}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {level === 'fast' && '< 10 days'}
            {level === 'average' && '10-30 days'}
            {level === 'slow' && '30-60 days'}
            {level === 'crisis' && '> 60 days'}
          </p>
        </div>
      </div>

      {/* Missing Data Note */}
      {!metrics.executionLatency && (
        <p className="text-xs text-muted-foreground mt-4 italic">
          Implementation dates not provided for these decisions
        </p>
      )}
    </div>
  );
}
