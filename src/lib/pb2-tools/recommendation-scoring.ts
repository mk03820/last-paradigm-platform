/**
 * Recommendation Scoring and Ranking
 *
 * Calculates severity scores and ranks recommendations.
 *
 * Story 16.2: Tool Recommendation Algorithm
 * Task 3: Create Scoring and Ranking Algorithm
 * Covers: AC8 (ranking by severity)
 */

import type { ToolRecommendation, RecommendationPriority } from './types';
import {
  MAX_RECOMMENDATIONS,
  MAX_SEVERITY_SCORE,
  CRITICAL_SEVERITY_THRESHOLD,
  HIGH_SEVERITY_THRESHOLD,
  ROI_DASHBOARD_TOOL_ID,
} from './recommendation-constants';

/**
 * Calculate severity score based on how much a value exceeds threshold
 *
 * Formula: (actual - threshold) / benchmark
 * This normalizes the delta to make different metrics comparable
 *
 * @param actual - The actual value from diagnostic data
 * @param threshold - The threshold that triggers the recommendation
 * @param benchmark - The benchmark value for normalization
 * @returns Normalized severity score (0 to MAX_SEVERITY_SCORE)
 */
export function calculateSeverityScore(
  actual: number,
  threshold: number,
  benchmark: number
): number {
  if (benchmark <= 0) return 0;
  if (actual <= threshold) return 0;

  const rawScore = (actual - threshold) / benchmark;

  // Cap at maximum severity to prevent UI overflow
  return Math.min(rawScore, MAX_SEVERITY_SCORE);
}

/**
 * Calculate severity score for percentage-based metrics
 * Uses percentage points as the benchmark
 *
 * @param actualPercent - The actual percentage value
 * @param thresholdPercent - The threshold percentage
 * @returns Normalized severity score
 */
export function calculatePercentageSeverityScore(
  actualPercent: number,
  thresholdPercent: number
): number {
  if (actualPercent <= thresholdPercent) return 0;

  // For percentages, we use 100 as the benchmark for normalization
  // This gives us a score where 10% over threshold = 0.1 severity
  const rawScore = (actualPercent - thresholdPercent) / 100;

  return Math.min(rawScore * 10, MAX_SEVERITY_SCORE); // Scale up for visibility
}

/**
 * Calculate severity score for count-based metrics
 *
 * @param actualCount - The actual count value
 * @param thresholdCount - The threshold count
 * @returns Normalized severity score
 */
export function calculateCountSeverityScore(
  actualCount: number,
  thresholdCount: number
): number {
  if (actualCount < thresholdCount) return 0;

  // For counts, severity increases with each additional blocker
  // 1 blocker = 1.0, 2 blockers = 1.5, 3 blockers = 2.0, etc.
  const rawScore = 1.0 + (actualCount - thresholdCount) * 0.5;

  return Math.min(rawScore, MAX_SEVERITY_SCORE);
}

/**
 * Determine the priority level based on severity score
 *
 * @param severityScore - The calculated severity score
 * @returns Priority level for display
 */
export function determinePriority(
  severityScore: number
): RecommendationPriority {
  if (severityScore >= CRITICAL_SEVERITY_THRESHOLD) {
    return 'critical';
  }
  if (severityScore >= HIGH_SEVERITY_THRESHOLD) {
    return 'high';
  }
  return 'moderate';
}

/**
 * Rank recommendations by severity score
 *
 * Sorting rules:
 * 1. Higher severity scores rank first
 * 2. For equal severity, prefer tools with more concrete deliverables
 * 3. ROI Dashboard (Tool 8) always has lowest priority (fallback)
 *
 * @param recommendations - Array of recommendations to rank
 * @returns Sorted array of recommendations with rank assigned
 */
export function rankRecommendations(
  recommendations: ToolRecommendation[]
): ToolRecommendation[] {
  // Sort by severity score descending
  const sorted = [...recommendations].sort((a, b) => {
    // ROI Dashboard always goes last (it's the fallback)
    if (a.toolId === ROI_DASHBOARD_TOOL_ID && b.toolId !== ROI_DASHBOARD_TOOL_ID) {
      return 1;
    }
    if (b.toolId === ROI_DASHBOARD_TOOL_ID && a.toolId !== ROI_DASHBOARD_TOOL_ID) {
      return -1;
    }

    // Higher severity first
    if (b.severityScore !== a.severityScore) {
      return b.severityScore - a.severityScore;
    }

    // Tie-breaker: prefer tools that generate Excel/spreadsheet outputs
    // (more actionable deliverables)
    const aIsSpreadsheet = a.tool.documentOutput.endsWith('.xlsx');
    const bIsSpreadsheet = b.tool.documentOutput.endsWith('.xlsx');

    if (aIsSpreadsheet && !bIsSpreadsheet) return -1;
    if (bIsSpreadsheet && !aIsSpreadsheet) return 1;

    // Final tie-breaker: lower tool ID first (more fundamental tools)
    return a.toolId - b.toolId;
  });

  // Take top N recommendations
  const topRecommendations = sorted.slice(0, MAX_RECOMMENDATIONS);

  // Assign ranks
  return topRecommendations.map((rec, index) => ({
    ...rec,
    rank: index + 1,
    priority: determinePriority(rec.severityScore),
  }));
}

/**
 * Filter recommendations that meet minimum severity threshold
 *
 * @param recommendations - Array of recommendations to filter
 * @param minSeverity - Minimum severity score to include (default: 0)
 * @returns Filtered array of recommendations
 */
export function filterByMinimumSeverity(
  recommendations: ToolRecommendation[],
  minSeverity: number = 0
): ToolRecommendation[] {
  return recommendations.filter((rec) => rec.severityScore >= minSeverity);
}

/**
 * Check if we need to include the fallback recommendation
 *
 * @param recommendations - Current recommendations
 * @returns True if fallback should be added
 */
export function needsFallbackRecommendation(
  recommendations: ToolRecommendation[]
): boolean {
  // Add fallback if we have fewer than MAX_RECOMMENDATIONS
  return recommendations.length < MAX_RECOMMENDATIONS;
}
