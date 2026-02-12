/**
 * Intervention Matching Engine
 *
 * Matches detected anti-patterns to recommended interventions
 * and prioritizes them by impact and severity.
 *
 * Story 13.4: Intervention Recommendations
 * Task 2: Create intervention matching engine (AC: 1, 3)
 */

import type {
  Intervention,
  RecommendedIntervention,
  SeverityLevel,
  DetectionResult,
  PatternAnalysis,
  Tool6Summary,
  HealthStatus,
} from './comm-constants';
import {
  INTERVENTIONS,
  getInterventionsForPattern,
} from './comm-constants';

/**
 * Calculate priority score for an intervention
 *
 * Priority is based on:
 * - Impact of the intervention (high=3, medium=2, low=1)
 * - Severity of the triggering anti-pattern (high=3, medium=2, low=1)
 * - Effort required (low effort gets a bonus)
 */
export function calculatePriority(
  intervention: Intervention,
  severity: SeverityLevel
): number {
  const impactScore: Record<string, number> = { high: 3, medium: 2, low: 1 };
  const severityScore: Record<SeverityLevel, number> = {
    high: 3,
    medium: 2,
    low: 1,
    none: 0,
  };
  const effortBonus: Record<string, number> = {
    low: 0.5,
    medium: 0,
    high: -0.3,
  };

  const impact = impactScore[intervention.impact] || 1;
  const sev = severityScore[severity];
  const bonus = effortBonus[intervention.effort] || 0;

  return impact * sev + bonus;
}

/**
 * Get recommended interventions for a single detected pattern
 */
export function getRecommendedInterventionsForPattern(
  result: DetectionResult
): RecommendedIntervention[] {
  if (!result.detected || result.severity === 'none') {
    return [];
  }

  const interventions = getInterventionsForPattern(result.patternId);

  return interventions.map((intervention) => ({
    ...intervention,
    priority: calculatePriority(intervention, result.severity),
    severity: result.severity,
  }));
}

/**
 * Get all recommended interventions from pattern analysis
 */
export function getAllRecommendedInterventions(
  analysis: PatternAnalysis
): RecommendedIntervention[] {
  const detectedResults = analysis.results.filter((r) => r.detected);

  const allInterventions: RecommendedIntervention[] = [];

  for (const result of detectedResults) {
    const interventions = getRecommendedInterventionsForPattern(result);
    allInterventions.push(...interventions);
  }

  return allInterventions;
}

/**
 * Get prioritized interventions sorted by priority score
 */
export function getPrioritizedInterventions(
  analysis: PatternAnalysis,
  limit?: number
): RecommendedIntervention[] {
  const allInterventions = getAllRecommendedInterventions(analysis);

  // Sort by priority descending
  const sorted = allInterventions.sort((a, b) => b.priority - a.priority);

  if (limit !== undefined && limit > 0) {
    return sorted.slice(0, limit);
  }

  return sorted;
}

/**
 * Get top N interventions (default: 3)
 */
export function getTopInterventions(
  analysis: PatternAnalysis,
  count: number = 3
): RecommendedIntervention[] {
  return getPrioritizedInterventions(analysis, count);
}

/**
 * Group interventions by the anti-pattern they address
 */
export function groupInterventionsByPattern(
  interventions: RecommendedIntervention[]
): Map<string, RecommendedIntervention[]> {
  const grouped = new Map<string, RecommendedIntervention[]>();

  for (const intervention of interventions) {
    const existing = grouped.get(intervention.patternId) || [];
    existing.push(intervention);
    grouped.set(intervention.patternId, existing);
  }

  return grouped;
}

/**
 * Get interventions grouped by pattern with pattern metadata
 */
export function getInterventionsByPatternWithMetadata(
  analysis: PatternAnalysis
): Array<{
  patternId: string;
  severity: SeverityLevel;
  interventions: RecommendedIntervention[];
}> {
  const allInterventions = getAllRecommendedInterventions(analysis);
  const grouped = groupInterventionsByPattern(allInterventions);

  const result: Array<{
    patternId: string;
    severity: SeverityLevel;
    interventions: RecommendedIntervention[];
  }> = [];

  // Sort patterns by severity (high first)
  const severityOrder: Record<SeverityLevel, number> = {
    high: 3,
    medium: 2,
    low: 1,
    none: 0,
  };

  const detectedPatterns = analysis.results
    .filter((r) => r.detected)
    .sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);

  for (const pattern of detectedPatterns) {
    const interventions = grouped.get(pattern.patternId) || [];
    if (interventions.length > 0) {
      result.push({
        patternId: pattern.patternId,
        severity: pattern.severity,
        interventions: interventions.sort((a, b) => b.priority - a.priority),
      });
    }
  }

  return result;
}

/**
 * Count interventions that have Playbook 2 links
 */
export function countPlaybook2Interventions(
  interventions: RecommendedIntervention[]
): number {
  return interventions.filter((i) => i.playbook2Tool || i.playbook2Link).length;
}

/**
 * Generate Tool 6 summary for Tool 7 aggregation
 */
export function generateTool6Summary(
  analysis: PatternAnalysis,
  healthScore: number,
  healthStatus: HealthStatus
): Tool6Summary {
  const topInterventions = getTopInterventions(analysis, 3);
  const allInterventions = getAllRecommendedInterventions(analysis);

  const severityCount = {
    high: analysis.results.filter((r) => r.severity === 'high').length,
    medium: analysis.results.filter((r) => r.severity === 'medium').length,
    low: analysis.results.filter((r) => r.severity === 'low').length,
  };

  return {
    healthScore,
    healthStatus,
    patternsDetected: analysis.detectedCount,
    patternsSeverity: severityCount,
    interventionsRecommended: allInterventions.length,
    topInterventions: topInterventions.map((i) => i.title),
    completedAt: new Date().toISOString(),
  };
}

/**
 * Check if any high-impact, low-effort interventions exist (quick wins)
 */
export function getQuickWins(
  analysis: PatternAnalysis
): RecommendedIntervention[] {
  const allInterventions = getAllRecommendedInterventions(analysis);

  return allInterventions
    .filter((i) => i.impact === 'high' && i.effort === 'low')
    .sort((a, b) => b.priority - a.priority);
}
