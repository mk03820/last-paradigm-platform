/**
 * Decision Velocity Latency Calculations
 *
 * Utilities for calculating decision latency metrics.
 *
 * Story 10.2: Latency Calculation and Display
 * Covers: FR2-12 (Latency calculations)
 */

import type { DecisionSample, ArchetypeData, ArchetypeId } from './constants';
import { DECISION_ARCHETYPES } from './constants';

export interface LatencyMetrics {
  median: number;
  p90: number;
  sampleCount: number;
}

export interface ArchetypeMetrics {
  archetypeId: ArchetypeId;
  archetypeLabel: string;
  sampleCount: number;
  decisionLatency: LatencyMetrics;
  executionLatency: LatencyMetrics | null;
  totalCycleTime: LatencyMetrics | null;
}

/**
 * Calculate days between two ISO date strings
 */
export function daysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculate median from array of numbers
 */
export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

/**
 * Calculate 90th percentile from array of numbers
 */
export function percentile90(values: number[]): number {
  if (values.length === 0) return 0;
  if (values.length === 1) return values[0];
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil(0.9 * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

/**
 * Calculate decision latency for a sample (request → decision)
 */
export function getDecisionLatency(sample: DecisionSample): number {
  return daysBetween(sample.requestDate, sample.decisionDate);
}

/**
 * Calculate execution latency for a sample (decision → implementation)
 * Returns null if implementation date is not available
 */
export function getExecutionLatency(sample: DecisionSample): number | null {
  if (!sample.implementationDate) return null;
  return daysBetween(sample.decisionDate, sample.implementationDate);
}

/**
 * Calculate total cycle time for a sample (request → implementation)
 * Returns null if implementation date is not available
 */
export function getTotalCycleTime(sample: DecisionSample): number | null {
  if (!sample.implementationDate) return null;
  return daysBetween(sample.requestDate, sample.implementationDate);
}

/**
 * Calculate latency metrics from an array of values
 */
export function calculateLatencyMetrics(values: number[]): LatencyMetrics {
  return {
    median: median(values),
    p90: percentile90(values),
    sampleCount: values.length,
  };
}

/**
 * Calculate all metrics for an archetype's samples
 */
export function calculateArchetypeMetrics(data: ArchetypeData): ArchetypeMetrics | null {
  // Skip if archetype is skipped or has insufficient samples
  if (data.skipped || data.samples.length < 3) {
    return null;
  }

  const archetype = DECISION_ARCHETYPES.find((a) => a.id === data.archetypeId);
  if (!archetype) return null;

  // Calculate decision latency (all samples have this)
  const decisionLatencies = data.samples.map(getDecisionLatency);

  // Calculate execution latency (only samples with implementation date)
  const executionLatencies = data.samples
    .map(getExecutionLatency)
    .filter((v): v is number => v !== null);

  // Calculate total cycle time (only samples with implementation date)
  const cycleTimes = data.samples
    .map(getTotalCycleTime)
    .filter((v): v is number => v !== null);

  return {
    archetypeId: data.archetypeId,
    archetypeLabel: archetype.label,
    sampleCount: data.samples.length,
    decisionLatency: calculateLatencyMetrics(decisionLatencies),
    executionLatency:
      executionLatencies.length > 0
        ? calculateLatencyMetrics(executionLatencies)
        : null,
    totalCycleTime:
      cycleTimes.length > 0 ? calculateLatencyMetrics(cycleTimes) : null,
  };
}

/**
 * Calculate metrics for all archetypes with sufficient data
 */
export function calculateAllMetrics(
  archetypes: Record<ArchetypeId, ArchetypeData>
): ArchetypeMetrics[] {
  return Object.values(archetypes)
    .map(calculateArchetypeMetrics)
    .filter((m): m is ArchetypeMetrics => m !== null);
}

/**
 * Find the archetype with the slowest median decision latency
 */
export function findSlowestArchetype(
  metrics: ArchetypeMetrics[]
): ArchetypeMetrics | null {
  if (metrics.length === 0) return null;
  return metrics.reduce((slowest, current) =>
    current.decisionLatency.median > slowest.decisionLatency.median
      ? current
      : slowest
  );
}

/**
 * Calculate aggregate metrics across all archetypes
 */
export function calculateAggregateMetrics(
  metrics: ArchetypeMetrics[]
): ArchetypeMetrics | null {
  if (metrics.length === 0) return null;

  // Collect all decision latencies across archetypes
  const allDecisionLatencies: number[] = [];
  const allExecutionLatencies: number[] = [];
  const allCycleTimes: number[] = [];

  for (const m of metrics) {
    // We need to recalculate from individual values, not medians
    // For aggregate, we'll use the median of medians as an approximation
    allDecisionLatencies.push(m.decisionLatency.median);
    if (m.executionLatency) {
      allExecutionLatencies.push(m.executionLatency.median);
    }
    if (m.totalCycleTime) {
      allCycleTimes.push(m.totalCycleTime.median);
    }
  }

  const totalSamples = metrics.reduce((sum, m) => sum + m.sampleCount, 0);

  return {
    archetypeId: 'strategic' as ArchetypeId, // Placeholder
    archetypeLabel: 'All Categories',
    sampleCount: totalSamples,
    decisionLatency: calculateLatencyMetrics(allDecisionLatencies),
    executionLatency:
      allExecutionLatencies.length > 0
        ? calculateLatencyMetrics(allExecutionLatencies)
        : null,
    totalCycleTime:
      allCycleTimes.length > 0 ? calculateLatencyMetrics(allCycleTimes) : null,
  };
}

/**
 * Get performance level based on decision latency in days
 */
export type PerformanceLevel = 'fast' | 'average' | 'slow' | 'crisis';

export function getPerformanceLevel(days: number): PerformanceLevel {
  if (days <= 10) return 'fast';
  if (days <= 30) return 'average';
  if (days <= 60) return 'slow';
  return 'crisis';
}

/**
 * Get color class for performance level
 */
export function getPerformanceColor(level: PerformanceLevel): string {
  switch (level) {
    case 'fast':
      return 'text-green-600';
    case 'average':
      return 'text-yellow-600';
    case 'slow':
      return 'text-orange-600';
    case 'crisis':
      return 'text-red-600';
  }
}

/**
 * Get background color class for performance level
 */
export function getPerformanceBgColor(level: PerformanceLevel): string {
  switch (level) {
    case 'fast':
      return 'bg-green-50 border-green-200';
    case 'average':
      return 'bg-yellow-50 border-yellow-200';
    case 'slow':
      return 'bg-orange-50 border-orange-200';
    case 'crisis':
      return 'bg-red-50 border-red-200';
  }
}
