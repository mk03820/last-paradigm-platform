/**
 * Recommendation Engine
 *
 * Core algorithm for generating personalized PB2 tool recommendations
 * based on PB1 diagnostic data.
 *
 * Story 16.2: Tool Recommendation Algorithm
 * Task 2: Create Recommendation Engine Service
 * Covers: AC1-AC6 (recommendation rules and fallback logic)
 */

import type {
  RecommendationInput,
  ToolRecommendation,
  RecommendationResult,
} from './types';
import { getPB2Tool } from './tool-catalog';
import {
  DECISION_VELOCITY_BENCHMARK_DAYS,
  DECISION_VELOCITY_THRESHOLD_DAYS,
  MEETING_WASTE_THRESHOLD_PERCENT,
  MEETING_WASTE_BENCHMARK_PERCENT,
  DATA_FRICTION_THRESHOLD_DOLLARS,
  DATA_FRICTION_BENCHMARK_DOLLARS,
  BLOCKER_COUNT_THRESHOLD,
  ROI_DASHBOARD_TOOL_ID,
  MAX_RECOMMENDATIONS,
  getDecisionVelocityReasoning,
  getMeetingWasteReasoning,
  getDataFrictionReasoning,
  getStakeholderBlockersReasoning,
  getROIFallbackReasoning,
} from './recommendation-constants';
import {
  calculateSeverityScore,
  calculatePercentageSeverityScore,
  calculateCountSeverityScore,
  rankRecommendations,
  needsFallbackRecommendation,
  determinePriority,
} from './recommendation-scoring';

/**
 * Generate personalized recommendations based on diagnostic data
 *
 * @param input - Diagnostic data from PB1 tools
 * @returns RecommendationResult with top 3 recommendations
 */
export function generateRecommendations(
  input: RecommendationInput
): RecommendationResult {
  const recommendations: ToolRecommendation[] = [];

  // Check Decision Velocity (AC2)
  const decisionVelocityRec = checkDecisionVelocity(input);
  if (decisionVelocityRec) {
    recommendations.push(decisionVelocityRec);
  }

  // Check Meeting Waste (AC3)
  const meetingWasteRec = checkMeetingWaste(input);
  if (meetingWasteRec) {
    recommendations.push(meetingWasteRec);
  }

  // Check Data Friction (AC4)
  const dataFrictionRec = checkDataFriction(input);
  if (dataFrictionRec) {
    recommendations.push(dataFrictionRec);
  }

  // Check Stakeholder Blockers (AC5)
  const stakeholderBlockersRec = checkStakeholderBlockers(input);
  if (stakeholderBlockersRec) {
    recommendations.push(stakeholderBlockersRec);
  }

  // Rank recommendations and take top 3
  let rankedRecommendations = rankRecommendations(recommendations);

  // Add ROI Dashboard fallback if needed (AC6)
  if (needsFallbackRecommendation(rankedRecommendations)) {
    const fallbackRec = createROIFallbackRecommendation(input);
    // Only add if not already included
    if (!rankedRecommendations.some((r) => r.toolId === ROI_DASHBOARD_TOOL_ID)) {
      rankedRecommendations = [
        ...rankedRecommendations,
        { ...fallbackRec, rank: rankedRecommendations.length + 1 },
      ].slice(0, MAX_RECOMMENDATIONS);
    }
  }

  // Calculate blocker count for summary
  const blockerCount = input.stakeholders
    ? input.stakeholders.filter((s) => s.sentiment === 'blocker').length
    : 0;

  return {
    recommendations: rankedRecommendations,
    generatedAt: new Date(),
    inputSummary: {
      worstDecisionVelocity: input.decisionVelocity?.worstMedianDays,
      meetingWastePercent: input.meetingWastePercent,
      dataFrictionCost: input.dataFrictionCost,
      blockerCount,
      totalAlignmentTax: input.totalAlignmentTax,
    },
  };
}

/**
 * Check Decision Velocity threshold (AC2)
 * Triggers Tool 3: Decision Rights & Delegation Framework
 */
function checkDecisionVelocity(
  input: RecommendationInput
): ToolRecommendation | null {
  if (!input.decisionVelocity) return null;

  const { worstMedianDays, benchmarkDays } = input.decisionVelocity;

  // Use provided benchmark or default
  const effectiveBenchmark = benchmarkDays || DECISION_VELOCITY_BENCHMARK_DAYS;
  const threshold = effectiveBenchmark * 2; // >2x benchmark

  if (worstMedianDays <= threshold) return null;

  const tool = getPB2Tool(3);
  if (!tool) return null;

  const severityScore = calculateSeverityScore(
    worstMedianDays,
    DECISION_VELOCITY_THRESHOLD_DAYS,
    DECISION_VELOCITY_BENCHMARK_DAYS
  );

  return {
    rank: 0, // Will be assigned during ranking
    toolId: 3,
    tool,
    reasoning: getDecisionVelocityReasoning(worstMedianDays, effectiveBenchmark),
    triggerMetric: 'Decision Velocity',
    triggerValue: `${worstMedianDays} days`,
    benchmarkValue: `${effectiveBenchmark} days`,
    severityScore,
    priority: determinePriority(severityScore),
  };
}

/**
 * Check Meeting Waste threshold (AC3)
 * Triggers Tool 4: Meeting Protocol
 */
function checkMeetingWaste(
  input: RecommendationInput
): ToolRecommendation | null {
  if (input.meetingWastePercent === undefined) return null;

  if (input.meetingWastePercent <= MEETING_WASTE_THRESHOLD_PERCENT) return null;

  const tool = getPB2Tool(4);
  if (!tool) return null;

  const severityScore = calculatePercentageSeverityScore(
    input.meetingWastePercent,
    MEETING_WASTE_THRESHOLD_PERCENT
  );

  return {
    rank: 0,
    toolId: 4,
    tool,
    reasoning: getMeetingWasteReasoning(
      input.meetingWastePercent,
      input.meetingWasteCost
    ),
    triggerMetric: 'Meeting Waste',
    triggerValue: `${input.meetingWastePercent.toFixed(0)}%`,
    benchmarkValue: `${MEETING_WASTE_BENCHMARK_PERCENT}%`,
    severityScore,
    priority: determinePriority(severityScore),
  };
}

/**
 * Check Data Friction threshold (AC4)
 * Triggers Tool 6: Data Platform Playbook
 */
function checkDataFriction(
  input: RecommendationInput
): ToolRecommendation | null {
  if (input.dataFrictionCost === undefined) return null;

  if (input.dataFrictionCost <= DATA_FRICTION_THRESHOLD_DOLLARS) return null;

  const tool = getPB2Tool(6);
  if (!tool) return null;

  const severityScore = calculateSeverityScore(
    input.dataFrictionCost,
    DATA_FRICTION_THRESHOLD_DOLLARS,
    DATA_FRICTION_BENCHMARK_DOLLARS
  );

  return {
    rank: 0,
    toolId: 6,
    tool,
    reasoning: getDataFrictionReasoning(
      input.dataFrictionCost,
      input.topBottleneck
    ),
    triggerMetric: 'Data Friction Cost',
    triggerValue: input.dataFrictionCost,
    benchmarkValue: DATA_FRICTION_BENCHMARK_DOLLARS,
    severityScore,
    priority: determinePriority(severityScore),
  };
}

/**
 * Check Stakeholder Blockers threshold (AC5)
 * Triggers Tool 2: Executive Steering Committee Charter
 */
function checkStakeholderBlockers(
  input: RecommendationInput
): ToolRecommendation | null {
  if (!input.stakeholders || input.stakeholders.length === 0) return null;

  const blockers = input.stakeholders.filter((s) => s.sentiment === 'blocker');
  const blockerCount = blockers.length;

  if (blockerCount < BLOCKER_COUNT_THRESHOLD) return null;

  const tool = getPB2Tool(2);
  if (!tool) return null;

  const blockerNames = blockers.map((b) => b.name);
  const severityScore = calculateCountSeverityScore(
    blockerCount,
    BLOCKER_COUNT_THRESHOLD
  );

  return {
    rank: 0,
    toolId: 2,
    tool,
    reasoning: getStakeholderBlockersReasoning(blockerCount, blockerNames),
    triggerMetric: 'Stakeholder Blockers',
    triggerValue: `${blockerCount} blocker${blockerCount > 1 ? 's' : ''}`,
    severityScore,
    priority: determinePriority(severityScore),
  };
}

/**
 * Create ROI Dashboard fallback recommendation (AC6)
 */
function createROIFallbackRecommendation(
  input: RecommendationInput
): ToolRecommendation {
  const tool = getPB2Tool(ROI_DASHBOARD_TOOL_ID)!;

  return {
    rank: 0,
    toolId: ROI_DASHBOARD_TOOL_ID,
    tool,
    reasoning: getROIFallbackReasoning(input.totalAlignmentTax),
    triggerMetric: 'Total Alignment Tax',
    triggerValue: input.totalAlignmentTax || 0,
    severityScore: 0.5, // Low severity for fallback
    priority: 'moderate',
  };
}

/**
 * Transform diagnostic session data to recommendation input
 * Helper function for integration with preview page
 */
export function transformDiagnosticDataToInput(
  diagnosticData: {
    tool2?: {
      results?: {
        wastedCost?: number;
        totalMeetingCost?: number;
      };
    };
    tool3?: {
      decisions?: Array<{
        type: string;
        requestDate: string;
        decisionDate: string;
      }>;
    };
    tool4?: {
      stakeholders?: Array<{
        name: string;
        role: string;
        power: number;
        interest: number;
        sentiment?: 'supporter' | 'neutral' | 'blocker';
      }>;
    };
    tool5?: {
      frictionCost?: number;
    };
    tool7?: {
      totalCost?: number;
    };
  }
): RecommendationInput {
  const input: RecommendationInput = {};

  // Transform Tool 2: Meeting Audit
  if (diagnosticData.tool2?.results) {
    const { wastedCost, totalMeetingCost } = diagnosticData.tool2.results;
    if (wastedCost !== undefined && totalMeetingCost && totalMeetingCost > 0) {
      input.meetingWastePercent = (wastedCost / totalMeetingCost) * 100;
      input.meetingWasteCost = wastedCost;
    }
  }

  // Transform Tool 3: Decision Velocity
  if (diagnosticData.tool3?.decisions && diagnosticData.tool3.decisions.length > 0) {
    // Calculate median latency from decision samples
    const latencies = diagnosticData.tool3.decisions
      .map((d) => {
        const request = new Date(d.requestDate);
        const decision = new Date(d.decisionDate);
        return Math.ceil((decision.getTime() - request.getTime()) / (1000 * 60 * 60 * 24));
      })
      .filter((l) => l >= 0)
      .sort((a, b) => a - b);

    if (latencies.length > 0) {
      const medianIndex = Math.floor(latencies.length / 2);
      const medianDays = latencies.length % 2 === 0
        ? (latencies[medianIndex - 1] + latencies[medianIndex]) / 2
        : latencies[medianIndex];

      input.decisionVelocity = {
        worstMedianDays: medianDays,
        worstArchetype: 'overall',
        benchmarkDays: DECISION_VELOCITY_BENCHMARK_DAYS,
      };
    }
  }

  // Transform Tool 4: Stakeholder Mapping
  if (diagnosticData.tool4?.stakeholders) {
    input.stakeholders = diagnosticData.tool4.stakeholders;
  }

  // Transform Tool 5: Data Flow Friction
  if (diagnosticData.tool5?.frictionCost !== undefined) {
    input.dataFrictionCost = diagnosticData.tool5.frictionCost;
  }

  // Transform Tool 7: Total Cost
  if (diagnosticData.tool7?.totalCost !== undefined) {
    input.totalAlignmentTax = diagnosticData.tool7.totalCost;
  }

  return input;
}
