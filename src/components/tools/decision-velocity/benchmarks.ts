/**
 * Decision Velocity Benchmark Constants
 *
 * Industry benchmarks for decision velocity by archetype.
 * Based on Playbook 1 specifications.
 *
 * Story 10.3: Benchmark Comparison Table
 * Covers: AC 3, 5 (Benchmark values match Playbook 1, budget tier handling)
 */

import type { ArchetypeId, BudgetThresholdId } from './constants';

export type BenchmarkLevel = 'fast' | 'average' | 'slow' | 'crisis';

export interface BenchmarkThreshold {
  max?: number;
  min?: number;
  label: string;
}

export interface ArchetypeBenchmarks {
  fast: BenchmarkThreshold;
  average: BenchmarkThreshold;
  slow: BenchmarkThreshold;
  crisis: BenchmarkThreshold;
}

/**
 * Decision velocity benchmarks by archetype (days to decision)
 * From Playbook 1 specifications
 */
export const BENCHMARKS: Record<Exclude<ArchetypeId, 'budget'>, ArchetypeBenchmarks> = {
  strategic: {
    fast: { max: 14, label: '< 2 weeks' },
    average: { max: 45, label: '2-6 weeks' },
    slow: { max: 90, label: '6-12 weeks' },
    crisis: { min: 90, label: '> 12 weeks' },
  },
  technology: {
    fast: { max: 7, label: '< 1 week' },
    average: { max: 21, label: '1-3 weeks' },
    slow: { max: 45, label: '3-6 weeks' },
    crisis: { min: 45, label: '> 6 weeks' },
  },
  hiring: {
    fast: { max: 14, label: '< 2 weeks' },
    average: { max: 30, label: '2-4 weeks' },
    slow: { max: 60, label: '4-8 weeks' },
    crisis: { min: 60, label: '> 8 weeks' },
  },
  analytics: {
    fast: { max: 3, label: '< 3 days' },
    average: { max: 7, label: '3-7 days' },
    slow: { max: 14, label: '1-2 weeks' },
    crisis: { min: 14, label: '> 2 weeks' },
  },
};

/**
 * Budget-specific benchmarks by tier
 * Different budget thresholds have different velocity expectations
 */
export const BUDGET_BENCHMARKS: Record<BudgetThresholdId, ArchetypeBenchmarks> = {
  tier1: {
    // < $50K
    fast: { max: 5, label: '< 1 week' },
    average: { max: 14, label: '1-2 weeks' },
    slow: { max: 30, label: '2-4 weeks' },
    crisis: { min: 30, label: '> 4 weeks' },
  },
  tier2: {
    // $50K - $500K
    fast: { max: 10, label: '< 2 weeks' },
    average: { max: 30, label: '2-4 weeks' },
    slow: { max: 60, label: '4-8 weeks' },
    crisis: { min: 60, label: '> 8 weeks' },
  },
  tier3: {
    // $500K - $5M
    fast: { max: 21, label: '< 3 weeks' },
    average: { max: 60, label: '3-8 weeks' },
    slow: { max: 120, label: '8-16 weeks' },
    crisis: { min: 120, label: '> 16 weeks' },
  },
  tier4: {
    // > $5M
    fast: { max: 45, label: '< 6 weeks' },
    average: { max: 90, label: '6-12 weeks' },
    slow: { max: 180, label: '12-24 weeks' },
    crisis: { min: 180, label: '> 24 weeks' },
  },
};

/**
 * Benchmark level labels with descriptions
 */
export const BENCHMARK_LABELS: Record<BenchmarkLevel, { label: string; description: string }> = {
  fast: { label: 'Fast', description: 'Industry-leading velocity' },
  average: { label: 'Average', description: 'Typical performance' },
  slow: { label: 'Slow', description: 'Below average velocity' },
  crisis: { label: 'Crisis', description: 'Severely impacting business' },
};

/**
 * Get benchmarks for an archetype, handling budget tier selection
 */
export function getBenchmarksForArchetype(
  archetypeId: ArchetypeId,
  budgetThreshold?: BudgetThresholdId
): ArchetypeBenchmarks {
  if (archetypeId === 'budget') {
    // Default to tier2 if no threshold specified
    return BUDGET_BENCHMARKS[budgetThreshold || 'tier2'];
  }
  return BENCHMARKS[archetypeId];
}

/**
 * Determine which benchmark level the user's median falls into
 */
export function getBenchmarkLevel(
  userMedian: number,
  benchmarks: ArchetypeBenchmarks
): BenchmarkLevel {
  if (userMedian <= (benchmarks.fast.max || 0)) return 'fast';
  if (userMedian <= (benchmarks.average.max || 0)) return 'average';
  if (userMedian <= (benchmarks.slow.max || 0)) return 'slow';
  return 'crisis';
}

/**
 * Calculate gap to "fast" benchmark (days behind)
 * Returns 0 if already at or below fast threshold
 */
export function calculateGapToFast(
  userMedian: number,
  benchmarks: ArchetypeBenchmarks
): number {
  const fastMax = benchmarks.fast.max || 0;
  return Math.max(0, userMedian - fastMax);
}

/**
 * Get color classes for benchmark level
 */
export function getBenchmarkLevelColor(level: BenchmarkLevel): {
  bg: string;
  text: string;
  border: string;
} {
  switch (level) {
    case 'fast':
      return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' };
    case 'average':
      return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' };
    case 'slow':
      return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' };
    case 'crisis':
      return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' };
  }
}

/**
 * Get neutral color for benchmark columns (highlighting the matching level)
 */
export function getBenchmarkColumnStyle(
  columnLevel: BenchmarkLevel,
  userLevel: BenchmarkLevel
): { bg: string; text: string } {
  if (columnLevel === userLevel) {
    const colors = getBenchmarkLevelColor(columnLevel);
    return { bg: colors.bg, text: colors.text };
  }
  return { bg: 'bg-transparent', text: 'text-muted-foreground' };
}
