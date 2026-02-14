/**
 * Recommendation Constants and Thresholds
 *
 * Defines threshold values for triggering PB2 tool recommendations.
 * Based on The Last Paradigm methodology.
 *
 * Story 16.2: Tool Recommendation Algorithm
 * Task 4: Define Threshold Constants and Benchmarks
 * Covers: AC2, AC3, AC4, AC5
 */

// ============================================================================
// Decision Velocity Thresholds (AC2)
// ============================================================================

/**
 * Benchmark decision velocity in days (median)
 * Source: The Last Paradigm methodology - enterprise average
 */
export const DECISION_VELOCITY_BENCHMARK_DAYS = 7;

/**
 * Multiplier threshold for triggering recommendation
 * When actual velocity exceeds benchmark * this value, recommend Tool 3
 */
export const DECISION_VELOCITY_THRESHOLD_MULTIPLIER = 2;

/**
 * Calculated threshold in days
 */
export const DECISION_VELOCITY_THRESHOLD_DAYS =
  DECISION_VELOCITY_BENCHMARK_DAYS * DECISION_VELOCITY_THRESHOLD_MULTIPLIER;

// ============================================================================
// Meeting Waste Thresholds (AC3)
// ============================================================================

/**
 * Meeting waste percentage threshold
 * When waste exceeds this percentage, recommend Tool 4
 */
export const MEETING_WASTE_THRESHOLD_PERCENT = 30;

/**
 * Benchmark meeting waste percentage (healthy organizations)
 */
export const MEETING_WASTE_BENCHMARK_PERCENT = 15;

// ============================================================================
// Data Friction Thresholds (AC4)
// ============================================================================

/**
 * Data friction cost threshold in dollars
 * When annual data friction cost exceeds this, recommend Tool 6
 */
export const DATA_FRICTION_THRESHOLD_DOLLARS = 5_000_000;

/**
 * Benchmark data friction cost (healthy organizations)
 */
export const DATA_FRICTION_BENCHMARK_DOLLARS = 2_000_000;

// ============================================================================
// Stakeholder Blockers Threshold (AC5)
// ============================================================================

/**
 * Minimum blocker count to trigger governance recommendation
 * Any stakeholders marked as "blocker" triggers Tool 2
 */
export const BLOCKER_COUNT_THRESHOLD = 1;

// ============================================================================
// General Constants
// ============================================================================

/**
 * Maximum recommendations to display
 */
export const MAX_RECOMMENDATIONS = 3;

/**
 * Maximum severity score (for capping extreme values)
 */
export const MAX_SEVERITY_SCORE = 10;

/**
 * ROI Dashboard tool ID (always included as fallback)
 */
export const ROI_DASHBOARD_TOOL_ID = 8;

/**
 * Minimum severity score to be considered "critical"
 */
export const CRITICAL_SEVERITY_THRESHOLD = 2.0;

/**
 * Minimum severity score to be considered "high"
 */
export const HIGH_SEVERITY_THRESHOLD = 1.0;

// ============================================================================
// Reasoning Message Templates (AC7)
// ============================================================================

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(0)}K`;
  }
  return `$${amount.toFixed(0)}`;
}

/**
 * Reasoning template for decision velocity recommendation
 */
export function getDecisionVelocityReasoning(
  medianDays: number,
  benchmarkDays: number
): string {
  const multiplier = medianDays / benchmarkDays;
  return `Your decision velocity of ${medianDays} days is ${multiplier.toFixed(1)}x slower than the benchmark of ${benchmarkDays} days. The Delegation Framework will help push authority to where learning happens.`;
}

/**
 * Reasoning template for meeting waste recommendation
 */
export function getMeetingWasteReasoning(
  wastePercent: number,
  wasteCost?: number
): string {
  const costPart = wasteCost
    ? ` (${formatCurrency(wasteCost)} annually)`
    : '';
  return `Your meetings show ${wastePercent.toFixed(0)}% waste${costPart}, exceeding the ${MEETING_WASTE_THRESHOLD_PERCENT}% intervention threshold. The Meeting Protocol will establish rules to eliminate waste.`;
}

/**
 * Reasoning template for data friction recommendation
 */
export function getDataFrictionReasoning(
  frictionCost: number,
  topBottleneck?: string
): string {
  const bottleneckPart = topBottleneck
    ? `, with "${topBottleneck}" as a primary bottleneck`
    : '';
  return `Your organization loses ${formatCurrency(frictionCost)} annually to data friction${bottleneckPart}. The Data Platform Playbook addresses systematic information flow issues.`;
}

/**
 * Reasoning template for stakeholder blockers recommendation
 */
export function getStakeholderBlockersReasoning(
  blockerCount: number,
  blockerNames: string[]
): string {
  const namesDisplay =
    blockerNames.length > 0 ? ` (${blockerNames.slice(0, 3).join(', ')})` : '';
  return `Your stakeholder analysis identified ${blockerCount} blocker${blockerCount > 1 ? 's' : ''}${namesDisplay} requiring governance attention. The Steering Committee Charter establishes engagement structures.`;
}

/**
 * Reasoning template for ROI Dashboard fallback
 */
export function getROIFallbackReasoning(totalAlignmentTax?: number): string {
  if (totalAlignmentTax && totalAlignmentTax > 0) {
    return `Track your transformation progress against your ${formatCurrency(totalAlignmentTax)} baseline. The ROI Dashboard provides leading indicators to measure improvement.`;
  }
  return 'Track your transformation progress with leading indicators. The ROI Dashboard helps measure improvement over time.';
}
