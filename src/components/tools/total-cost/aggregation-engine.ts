/**
 * Cross-Tool Data Aggregation Engine
 *
 * Aggregates data from all 6 diagnostic tools into a unified format
 * for the Total Cost of Misalignment Calculator.
 *
 * Story 14.1: Cross-Tool Data Aggregation
 * Task 2: Create aggregation engine (AC: 1, 4)
 * Covers: FR2-31 (Cross-tool aggregation)
 */

import type {
  AggregatedToolData,
  Tool1Aggregation,
  Tool2Aggregation,
  Tool3Aggregation,
  Tool4Aggregation,
  Tool5Aggregation,
  Tool6Aggregation,
  AlignmentCategory,
  StakeholderRiskLevel,
} from './cost-constants';

// Import stores
import { useTool1Store } from '@/lib/store/tool1-store';
import { useCalculatorStore } from '@/lib/store/calculator-store';
import { useTool3Store } from '@/lib/store/tool3-store';
import { useTool4Store } from '@/lib/store/tool4-store';
import { useTool5Store } from '@/lib/store/tool5-store';
import { useTool6Store } from '@/lib/store/tool6-store';

// Import helpers from tool modules
import {
  ALIGNMENT_DIMENSIONS,
  getScoreCategory,
  calculateCompositeScore,
} from '@/components/tools/alignment/constants';

import type { DimensionId } from '@/components/tools/alignment/constants';

// ============================================================================
// Tool 1 Aggregation: Alignment Assessment (Task 2.2)
// ============================================================================

/**
 * Aggregate data from Tool 1: Organizational Alignment Assessment
 * Returns null if tool is not complete
 */
export function aggregateFromTool1(): Tool1Aggregation | null {
  const store = useTool1Store.getState();
  const { scores, completion } = store;

  // Check if tool is complete
  if (!completion || !store.isComplete()) {
    return null;
  }

  // Calculate composite score
  const compositeScore = calculateCompositeScore(scores as Record<DimensionId, number>);

  // Get category from composite score
  const categoryInfo = getScoreCategory(compositeScore);
  const category = categoryInfo.label.toLowerCase() as AlignmentCategory;

  // Find weakest dimension
  let weakestDimension = '';
  let lowestScore = 5;

  for (const dimension of ALIGNMENT_DIMENSIONS) {
    const score = scores[dimension.id as keyof typeof scores];
    if (score !== undefined && score < lowestScore) {
      lowestScore = score;
      weakestDimension = dimension.label;
    }
  }

  return {
    compositeScore,
    category,
    weakestDimension,
    completedAt: completion.completedAt,
  };
}

// ============================================================================
// Tool 2 Aggregation: Meeting Audit Calculator (Task 2.3)
// ============================================================================

/**
 * Aggregate data from Tool 2: Meeting Audit Calculator
 * Returns null if tool is not complete
 */
export function aggregateFromTool2(): Tool2Aggregation | null {
  const store = useCalculatorStore.getState();
  const { meetingData, results } = store;

  // Check if tool has results
  if (!results || !meetingData) {
    return null;
  }

  // Calculate total attendee hours per week
  const meetingsPerWeek = meetingData.meetingCount || 0;
  const avgDuration = meetingData.averageDuration || 0;
  const avgAttendees = meetingData.averageAttendees || 0;
  const totalAttendeeHours = meetingsPerWeek * avgDuration * avgAttendees;

  return {
    annualizedWaste: results.meetingWaste,
    meetingsPerWeek,
    totalAttendeeHours,
    completedAt: results.calculatedAt,
  };
}

// ============================================================================
// Tool 3 Aggregation: Decision Velocity Scorecard (Task 2.4)
// ============================================================================

/**
 * Aggregate data from Tool 3: Decision Velocity Scorecard
 * Returns null if tool is not complete
 */
export function aggregateFromTool3(): Tool3Aggregation | null {
  const store = useTool3Store.getState();
  const { archetypes, completion } = store;

  // Check if tool is complete
  if (!completion) {
    return null;
  }

  // Calculate average decision latency from all samples
  const allSamples: { requestDate: string; decisionDate: string }[] = [];
  const bottleneckPatterns: string[] = [];
  let decisionTypeCount = 0;

  for (const archetype of Object.values(archetypes)) {
    if (!archetype.skipped && archetype.samples.length > 0) {
      decisionTypeCount++;
      allSamples.push(...archetype.samples);

      // Check for bottlenecks (decisions taking > 30 days)
      const slowDecisions = archetype.samples.filter((s) => {
        const requestDate = new Date(s.requestDate);
        const decisionDate = new Date(s.decisionDate);
        const daysDiff = (decisionDate.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff > 30;
      });

      if (slowDecisions.length > 0) {
        const archetypeLabel = archetype.archetypeId.charAt(0).toUpperCase() +
          archetype.archetypeId.slice(1);
        bottleneckPatterns.push(`${archetypeLabel} decisions`);
      }
    }
  }

  // Calculate average latency
  let avgDecisionLatencyDays = 0;
  if (allSamples.length > 0) {
    const totalDays = allSamples.reduce((sum, sample) => {
      const requestDate = new Date(sample.requestDate);
      const decisionDate = new Date(sample.decisionDate);
      return sum + (decisionDate.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24);
    }, 0);
    avgDecisionLatencyDays = totalDays / allSamples.length;
  }

  return {
    avgDecisionLatencyDays: Math.round(avgDecisionLatencyDays * 10) / 10,
    bottleneckPatterns: bottleneckPatterns.slice(0, 3), // Top 3
    decisionTypeCount,
    completedAt: completion.completedAt,
  };
}

// ============================================================================
// Tool 4 Aggregation: Stakeholder Map (Task 2.5)
// ============================================================================

/**
 * Aggregate data from Tool 4: Stakeholder Power/Interest Map
 * Returns null if tool is not complete
 */
export function aggregateFromTool4(): Tool4Aggregation | null {
  const store = useTool4Store.getState();
  const { stakeholders, completion } = store;

  // Check if tool is complete
  if (!completion) {
    return null;
  }

  const quadrantCounts = store.getQuadrantCounts();

  // Count blockers (high power, low interest - could block initiatives)
  // In power/interest matrix: "keep_satisfied" quadrant (high power, low interest)
  const blockerCount = quadrantCounts.keep_satisfied || 0;

  // Count key players (high power, high interest)
  const keyPlayerCount = quadrantCounts.key_players || 0;

  // Determine risk level based on blocker ratio
  let riskLevel: StakeholderRiskLevel = 'low';
  const totalStakeholders = stakeholders.length;

  if (totalStakeholders > 0) {
    const blockerRatio = blockerCount / totalStakeholders;
    const keyPlayerRatio = keyPlayerCount / totalStakeholders;

    if (blockerRatio > 0.3 || keyPlayerRatio < 0.2) {
      riskLevel = 'high';
    } else if (blockerRatio > 0.15 || keyPlayerRatio < 0.35) {
      riskLevel = 'medium';
    }
  }

  return {
    stakeholderCount: totalStakeholders,
    blockerCount,
    keyPlayerCount,
    riskLevel,
    completedAt: completion.completedAt,
  };
}

// ============================================================================
// Tool 5 Aggregation: Data Flow Friction (Task 2.6)
// ============================================================================

/**
 * Aggregate data from Tool 5: Data Flow Friction Analysis
 * Returns null if tool is not complete
 */
export function aggregateFromTool5(): Tool5Aggregation | null {
  const store = useTool5Store.getState();
  const { journeys, frictionPoints, completion } = store;

  // Check if tool is complete
  if (!completion) {
    return null;
  }

  // Get total friction cost
  const totalFrictionCost = store.getEnterpriseTotalCost();

  // Count critical friction points (total severity >= 7, which is high or critical)
  // severity is a SeverityScore object with frequency, effort, and impact (each 1-3)
  // Total: 3-9, where 7+ is high/critical
  const criticalFrictionCount = frictionPoints.filter((fp) => {
    if (!fp.severity) return false;
    const total = fp.severity.frequency + fp.severity.effort + fp.severity.impact;
    return total >= 7; // high (6-7) or critical (8-9)
  }).length;

  return {
    totalFrictionCost,
    journeyCount: journeys.length,
    frictionPointCount: frictionPoints.length,
    criticalFrictionCount,
    completedAt: completion.completedAt,
  };
}

// ============================================================================
// Tool 6 Aggregation: Communication Diagnostic (Task 2.7)
// ============================================================================

/**
 * Aggregate data from Tool 6: Communication Pattern Diagnostic
 * Returns null if tool is not complete
 */
export function aggregateFromTool6(): Tool6Aggregation | null {
  const store = useTool6Store.getState();
  const { analysisResults, completion } = store;

  // Check if analysis has been run (needed for meaningful aggregation)
  if (!analysisResults || !completion) {
    return null;
  }

  // Import health evaluation helpers dynamically to avoid circular deps
  // Health score calculation is based on pattern severity
  const detectedPatterns = analysisResults.results.filter((r) => r.detected).length;
  const highSeverity = analysisResults.results.filter((r) => r.severity === 'high').length;
  const mediumSeverity = analysisResults.results.filter((r) => r.severity === 'medium').length;

  // Calculate a health score (0-100)
  // Start at 100, subtract for detected patterns
  let healthScore = 100;
  healthScore -= highSeverity * 20;   // -20 per high severity pattern
  healthScore -= mediumSeverity * 10; // -10 per medium severity pattern
  healthScore -= (detectedPatterns - highSeverity - mediumSeverity) * 5; // -5 per low
  healthScore = Math.max(0, healthScore);

  // Determine health status
  type HealthStatus = 'healthy' | 'warning' | 'crisis';
  let healthStatus: HealthStatus = 'healthy';
  if (healthScore < 40) {
    healthStatus = 'crisis';
  } else if (healthScore <= 70) {
    healthStatus = 'warning';
  }

  // Count interventions - assume 2-3 per detected pattern
  const interventionsRecommended = detectedPatterns * 2;

  return {
    healthScore,
    healthStatus,
    patternsDetected: detectedPatterns,
    interventionsRecommended,
    completedAt: completion.completedAt,
  };
}

// ============================================================================
// Main Aggregation Function (Task 2.8)
// ============================================================================

/**
 * Aggregate data from all tools into a unified result
 *
 * Performance requirement: Must complete in <2 seconds (AC4)
 * This is achieved by directly reading from in-memory Zustand stores
 */
export function aggregateAllTools(): AggregatedToolData {
  const startTime = performance.now();

  // Aggregate from each tool
  const tool1 = aggregateFromTool1();
  const tool2 = aggregateFromTool2();
  const tool3 = aggregateFromTool3();
  const tool4 = aggregateFromTool4();
  const tool5 = aggregateFromTool5();
  const tool6 = aggregateFromTool6();

  // Count completed tools
  const completedTools = [tool1, tool2, tool3, tool4, tool5, tool6].filter(
    (t) => t !== null
  );
  const completedToolsCount = completedTools.length;

  // Check minimum requirement: Tool 2 must be complete
  const canProceed = tool2 !== null;

  const result: AggregatedToolData = {
    tool1,
    tool2,
    tool3,
    tool4,
    tool5,
    tool6,
    aggregatedAt: new Date().toISOString(),
    completedToolsCount,
    canProceed,
  };

  // Log performance (for development)
  const endTime = performance.now();
  const duration = endTime - startTime;
  if (duration > 2000) {
    console.warn(`[aggregation-engine] Aggregation took ${duration}ms (exceeds 2s target)`);
  }

  return result;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if a specific tool has data available
 */
export function isToolComplete(toolNumber: number): boolean {
  switch (toolNumber) {
    case 1:
      return aggregateFromTool1() !== null;
    case 2:
      return aggregateFromTool2() !== null;
    case 3:
      return aggregateFromTool3() !== null;
    case 4:
      return aggregateFromTool4() !== null;
    case 5:
      return aggregateFromTool5() !== null;
    case 6:
      return aggregateFromTool6() !== null;
    default:
      return false;
  }
}

/**
 * Get completion status for all tools
 */
export function getAllToolCompletionStatus(): Record<number, boolean> {
  return {
    1: isToolComplete(1),
    2: isToolComplete(2),
    3: isToolComplete(3),
    4: isToolComplete(4),
    5: isToolComplete(5),
    6: isToolComplete(6),
  };
}
