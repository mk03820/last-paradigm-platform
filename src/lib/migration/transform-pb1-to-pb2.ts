/**
 * PB1 to PB2 Data Transformation Utility
 *
 * Transforms PB1 diagnostic session data into ToolkitGenerationContext
 * for pre-populating Playbook 2 tools.
 *
 * Story 15.7: PB1 Data Migration to Database
 * Task 2: Create ToolkitGenerationContext Transformer
 *
 * PB1 -> PB2 Tool Mapping:
 * - Tool 1 (Alignment Assessment) -> Roadmap, Charter, OKRs, ROI Dashboard
 * - Tool 2 (Meeting Audit) -> Meeting Protocol
 * - Tool 3 (Decision Velocity) -> Delegation Framework
 * - Tool 4 (Stakeholder Mapping) -> Governance Charter
 * - Tool 5 (Data Friction) -> Data Platform Playbook
 * - Tool 6 (Communication) -> Communication Architecture
 * - Tool 7 (Total Cost) -> ROI Dashboard
 *
 * Covers: AC2 (Transform to ToolkitGenerationContext), AC3 (Calculate savings)
 */

import type { DiagnosticSessionData } from '@/lib/db/schema';
import type {
  ToolkitGenerationContext,
  PartialToolkitGenerationContext,
  RoadmapContext,
  GovernanceCharterContext,
  DelegationFrameworkContext,
  MeetingProtocolContext,
  OKRFrameworkContext,
  DataPlatformPlaybookContext,
  CommunicationArchitectureContext,
  ROIDashboardContext,
  AlignmentScores,
  StakeholderEntry,
  DecisionTypeMetric,
  FrictionBottleneck,
  AntiPattern,
  CostBreakdownEntry,
} from '@/types/toolkit.types';
import type { PB1CollectedData } from './collect-pb1-data';

// ============================================================================
// Constants
// ============================================================================

/** Default savings recovery rate (40% midpoint of 30-50% range) */
const DEFAULT_SAVINGS_RATE = 0.4;

/** Minimum savings recovery rate */
const MIN_SAVINGS_RATE = 0.3;

/** Maximum savings recovery rate */
const MAX_SAVINGS_RATE = 0.5;

/** Decision velocity benchmark days by type */
const DECISION_BENCHMARKS: Record<string, number> = {
  budget: 14,
  hiring: 21,
  strategy: 30,
  technical: 7,
  policy: 21,
  vendor: 14,
};

// ============================================================================
// Tool 1 -> Roadmap + OKRs Transformation
// ============================================================================

/**
 * Get priority dimensions (weakest dimensions that need focus)
 */
function getPriorityDimensions(scores: Partial<AlignmentScores>): string[] {
  const entries = Object.entries(scores)
    .filter(([, score]) => score !== undefined)
    .map(([dim, score]) => ({ dim, score: score as number }));

  // Sort by score ascending (weakest first)
  entries.sort((a, b) => a.score - b.score);

  // Return top 3 weakest dimensions
  return entries.slice(0, 3).map((e) => e.dim);
}

/**
 * Get weakest dimensions (score < 2.5 = below coordinated)
 */
function getWeakestDimensions(scores: Partial<AlignmentScores>): string[] {
  return Object.entries(scores)
    .filter(([, score]) => score !== undefined && score < 2.5)
    .map(([dim]) => dim);
}

/**
 * Transform Tool 1 data to Roadmap context
 */
export function transformToRoadmap(
  tool1: DiagnosticSessionData['tool1'],
  totalAlignmentTax: number
): RoadmapContext | null {
  if (!tool1?.scores) {
    return null;
  }

  const alignmentScores: AlignmentScores = {
    strategic: tool1.scores.strategic ?? 0,
    execution: tool1.scores.execution ?? 0,
    technology: tool1.scores.technology ?? 0,
    people: tool1.scores.people ?? 0,
    governance: tool1.scores.governance ?? 0,
  };

  return {
    alignmentScores,
    compositeScore: tool1.compositeScore ?? 0,
    totalAlignmentTax,
    priorityDimensions: getPriorityDimensions(alignmentScores),
  };
}

/**
 * Transform Tool 1 data to OKR Framework context
 */
export function transformToOKRFramework(
  tool1: DiagnosticSessionData['tool1']
): OKRFrameworkContext | null {
  if (!tool1?.scores) {
    return null;
  }

  const dimensionScores: Record<string, number> = {};
  for (const [dim, score] of Object.entries(tool1.scores)) {
    if (score !== undefined) {
      dimensionScores[dim] = score;
    }
  }

  return {
    dimensionScores,
    weakestDimensions: getWeakestDimensions(tool1.scores as Partial<AlignmentScores>),
    compositeScore: tool1.compositeScore ?? 0,
  };
}

// ============================================================================
// Tool 2 -> Meeting Protocol Transformation
// ============================================================================

/**
 * Identify meeting waste categories based on inputs
 */
function getWasteCategories(
  meetingCount: number,
  avgAttendees: number,
  avgDuration: number
): string[] {
  const categories: string[] = [];

  if (meetingCount > 15) {
    categories.push('excessive-meetings');
  }
  if (avgAttendees > 8) {
    categories.push('over-attendance');
  }
  if (avgDuration > 60) {
    categories.push('long-duration');
  }
  if (meetingCount > 10 && avgAttendees > 6) {
    categories.push('coordination-overhead');
  }

  return categories.length > 0 ? categories : ['general-inefficiency'];
}

/**
 * Transform Tool 2 data to Meeting Protocol context
 */
export function transformToMeetingProtocol(
  tool2: DiagnosticSessionData['tool2']
): MeetingProtocolContext | null {
  if (!tool2?.inputs && !tool2?.results) {
    return null;
  }

  const meetingCount = tool2.inputs?.meetingCount ?? 0;
  const avgDuration = tool2.inputs?.averageDuration ?? 60;
  const avgAttendees = tool2.inputs?.averageAttendees ?? 5;
  const totalHours = (meetingCount * avgDuration * avgAttendees) / 60;
  const wastedCost = tool2.results?.wastedCost ?? 0;

  return {
    meetingCount,
    totalHours,
    wastedCost,
    wasteCategories: getWasteCategories(meetingCount, avgAttendees, avgDuration),
  };
}

// ============================================================================
// Tool 3 -> Delegation Framework Transformation
// ============================================================================

/**
 * Extract decision type metrics from Tool 3 samples
 */
function extractDecisionTypeMetrics(
  decisions: unknown[],
  metrics: unknown
): DecisionTypeMetric[] {
  // Try to extract from pre-computed metrics if available
  if (Array.isArray(metrics)) {
    return metrics.map((m: Record<string, unknown>) => ({
      type: String(m.archetypeId || m.type || 'unknown'),
      medianDays: Number(m.avgDays || m.medianDays || 0),
      benchmark: DECISION_BENCHMARKS[String(m.archetypeId || m.type)] || 14,
      gap:
        Number(m.avgDays || m.medianDays || 0) -
        (DECISION_BENCHMARKS[String(m.archetypeId || m.type)] || 14),
    }));
  }

  // Fallback: aggregate from decisions array
  const byType: Record<string, number[]> = {};
  for (const decision of decisions) {
    const d = decision as Record<string, unknown>;
    const type = String(d.type || d.archetypeId || 'unknown');
    const days = Number(d.daysToDecision || d.days || 0);
    if (!byType[type]) byType[type] = [];
    byType[type].push(days);
  }

  return Object.entries(byType).map(([type, days]) => {
    const sorted = days.sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)] || 0;
    const benchmark = DECISION_BENCHMARKS[type] || 14;
    return {
      type,
      medianDays: median,
      benchmark,
      gap: median - benchmark,
    };
  });
}

/**
 * Identify bottleneck patterns from decision data
 */
function identifyBottleneckPatterns(decisionMetrics: DecisionTypeMetric[]): string[] {
  const patterns: string[] = [];

  // Find decisions significantly over benchmark
  const slowDecisions = decisionMetrics.filter((d) => d.gap > 7);
  if (slowDecisions.length > 0) {
    patterns.push('approval-bottleneck');
  }

  // Check for consistent delays across types
  const avgGap = decisionMetrics.reduce((sum, d) => sum + d.gap, 0) / decisionMetrics.length;
  if (avgGap > 10) {
    patterns.push('systemic-delay');
  }

  return patterns;
}

/**
 * Transform Tool 3 data to Delegation Framework context
 */
export function transformToDelegationFramework(
  tool3: DiagnosticSessionData['tool3']
): DelegationFrameworkContext | null {
  if (!tool3?.decisions || !Array.isArray(tool3.decisions)) {
    return null;
  }

  const decisionTypes = extractDecisionTypeMetrics(tool3.decisions, tool3.metrics);
  const bottleneckPatterns = identifyBottleneckPatterns(decisionTypes);

  // Find slowest decisions (top 3 by gap)
  const slowestDecisions = [...decisionTypes]
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 3)
    .map((d) => d.type);

  return {
    decisionTypes,
    bottleneckPatterns,
    slowestDecisions,
  };
}

// ============================================================================
// Tool 4 -> Governance Charter Transformation
// ============================================================================

/**
 * Transform stakeholder data to standard format
 */
function normalizeStakeholders(stakeholders: unknown[]): StakeholderEntry[] {
  return stakeholders.map((s) => {
    const stakeholder = s as Record<string, unknown>;
    return {
      name: String(stakeholder.name || 'Unknown'),
      role: String(stakeholder.role || stakeholder.title || 'Unknown'),
      power: Number(stakeholder.power || 0),
      interest: Number(stakeholder.interest || 0),
      sentiment: stakeholder.sentiment as string | undefined,
    };
  });
}

/**
 * Identify key players (high power, high interest)
 */
function identifyKeyPlayers(stakeholders: StakeholderEntry[]): string[] {
  return stakeholders
    .filter((s) => s.power >= 3 && s.interest >= 3)
    .map((s) => s.name);
}

/**
 * Identify risky stakeholders (high power, low interest OR negative sentiment)
 */
function identifyRiskyStakeholders(stakeholders: StakeholderEntry[]): string[] {
  return stakeholders
    .filter(
      (s) =>
        (s.power >= 3 && s.interest <= 2) ||
        s.sentiment === 'negative' ||
        s.sentiment === 'hostile'
    )
    .map((s) => s.name);
}

/**
 * Transform Tool 4 data to Governance Charter context
 */
export function transformToGovernanceCharter(
  tool4: DiagnosticSessionData['tool4']
): GovernanceCharterContext | null {
  if (!tool4?.stakeholders || !Array.isArray(tool4.stakeholders)) {
    return null;
  }

  const stakeholders = normalizeStakeholders(tool4.stakeholders);

  return {
    stakeholders,
    keyPlayers: identifyKeyPlayers(stakeholders),
    riskyStakeholders: identifyRiskyStakeholders(stakeholders),
  };
}

// ============================================================================
// Tool 5 -> Data Platform Playbook Transformation
// ============================================================================

/**
 * Extract top bottlenecks from friction points/journeys
 */
function extractTopBottlenecks(
  journeys: unknown[],
  frictionCost: number
): FrictionBottleneck[] {
  const bottlenecks: FrictionBottleneck[] = [];

  for (const journey of journeys) {
    const j = journey as Record<string, unknown>;
    const stages = (j.stages as unknown[]) || [];

    for (const stage of stages) {
      const s = stage as Record<string, unknown>;
      // Estimate cost per stage based on latency
      const latencyHours = Number(s.latencyHours || 0);
      const estimatedCost = (latencyHours / 24) * (frictionCost / journeys.length / stages.length);

      if (latencyHours > 24) {
        bottlenecks.push({
          name: String(s.name || s.label || 'Unnamed Stage'),
          cost: estimatedCost,
          category: String(s.category || s.type || 'process'),
        });
      }
    }
  }

  // Sort by cost descending and take top 5
  return bottlenecks.sort((a, b) => b.cost - a.cost).slice(0, 5);
}

/**
 * Transform Tool 5 data to Data Platform Playbook context
 */
export function transformToDataPlatformPlaybook(
  tool5: DiagnosticSessionData['tool5']
): DataPlatformPlaybookContext | null {
  if (!tool5?.journeys || !Array.isArray(tool5.journeys)) {
    return null;
  }

  const frictionCost = tool5.frictionCost ?? 0;

  return {
    frictionCost,
    topBottlenecks: extractTopBottlenecks(tool5.journeys, frictionCost),
    journeyCount: tool5.journeys.length,
  };
}

// ============================================================================
// Tool 6 -> Communication Architecture Transformation
// ============================================================================

/**
 * Normalize anti-patterns from analysis results
 */
function normalizeAntiPatterns(antiPatterns: unknown[]): AntiPattern[] {
  return antiPatterns.map((p) => {
    const pattern = p as Record<string, unknown>;
    return {
      pattern: String(pattern.name || pattern.pattern || pattern.type || 'unknown'),
      severity: String(pattern.severity || pattern.level || 'medium'),
    };
  });
}

/**
 * Calculate communication health score from metrics
 */
function calculateHealthScore(metrics: unknown): number {
  if (!metrics) return 50; // Default to middle

  const m = metrics as Record<string, unknown>;
  const email = m.email as Record<string, unknown> | undefined;
  const chat = m.chat as Record<string, unknown> | undefined;
  const meetings = m.meetings as Record<string, unknown> | undefined;

  let score = 100;
  let factors = 0;

  // Email factors
  if (email) {
    const responseTime = Number(email.avgResponseTimeHours || 0);
    if (responseTime > 24) score -= 20;
    else if (responseTime > 8) score -= 10;
    factors++;

    const ccOveruse = Number(email.avgCcCount || 0);
    if (ccOveruse > 5) score -= 15;
    else if (ccOveruse > 3) score -= 5;
    factors++;
  }

  // Chat factors
  if (chat) {
    const afterHours = Number(chat.afterHoursPercent || 0);
    if (afterHours > 30) score -= 20;
    else if (afterHours > 15) score -= 10;
    factors++;
  }

  // Meeting factors
  if (meetings) {
    const infoCascade = Number(meetings.infoCascadeMeetingsPerWeek || 0);
    if (infoCascade > 5) score -= 15;
    else if (infoCascade > 2) score -= 5;
    factors++;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Transform Tool 6 data to Communication Architecture context
 */
export function transformToCommunicationArchitecture(
  tool6: DiagnosticSessionData['tool6']
): CommunicationArchitectureContext | null {
  if (!tool6?.metrics && !tool6?.antiPatterns) {
    return null;
  }

  const healthScore = calculateHealthScore(tool6.metrics);
  const antiPatterns = normalizeAntiPatterns(tool6.antiPatterns || []);

  return {
    healthScore,
    antiPatterns,
    channelMetrics: (tool6.metrics as Record<string, unknown>) || {},
  };
}

// ============================================================================
// Tool 7 -> ROI Dashboard Transformation
// ============================================================================

/**
 * Build cost breakdown from aggregated data
 */
function buildCostBreakdown(
  tool2?: DiagnosticSessionData['tool2'],
  tool5?: DiagnosticSessionData['tool5'],
  tool7?: DiagnosticSessionData['tool7']
): CostBreakdownEntry[] {
  const breakdown: CostBreakdownEntry[] = [];

  if (tool2?.results?.wastedCost) {
    breakdown.push({
      category: 'Meeting Waste',
      amount: tool2.results.wastedCost,
    });
  }

  if (tool5?.frictionCost) {
    breakdown.push({
      category: 'Data Friction',
      amount: tool5.frictionCost,
    });
  }

  // Add implied costs from Tool 7 if available
  if (tool7?.totalCost) {
    const accountedCost = breakdown.reduce((sum, b) => sum + b.amount, 0);
    const remaining = tool7.totalCost - accountedCost;
    if (remaining > 0) {
      breakdown.push({
        category: 'Other Alignment Costs',
        amount: remaining,
      });
    }
  }

  return breakdown;
}

/**
 * Calculate estimated savings based on recovery rate
 */
export function calculateEstimatedSavings(
  totalAlignmentTax: number,
  recoveryRate: number = DEFAULT_SAVINGS_RATE
): number {
  const rate = Math.max(MIN_SAVINGS_RATE, Math.min(MAX_SAVINGS_RATE, recoveryRate));
  return totalAlignmentTax * rate;
}

/**
 * Transform Tool 7 data to ROI Dashboard context
 */
export function transformToROIDashboard(
  tool7: DiagnosticSessionData['tool7'],
  tool2?: DiagnosticSessionData['tool2'],
  tool5?: DiagnosticSessionData['tool5']
): ROIDashboardContext | null {
  const totalCost = tool7?.totalCost ?? 0;
  const alignmentTaxPercent = tool7?.alignmentTaxPercent ?? 0;

  // If no Tool 7 data but we have Tool 2, estimate from meeting waste
  if (!tool7 && tool2?.results?.wastedCost) {
    const estimatedTotal = tool2.results.wastedCost / 0.275;
    return {
      totalAlignmentTax: estimatedTotal,
      alignmentTaxPercent: 0, // Unknown without revenue
      estimatedSavings: calculateEstimatedSavings(estimatedTotal),
      costBreakdown: buildCostBreakdown(tool2, tool5, undefined),
    };
  }

  if (totalCost === 0 && !tool2 && !tool5) {
    return null;
  }

  return {
    totalAlignmentTax: totalCost,
    alignmentTaxPercent,
    estimatedSavings: calculateEstimatedSavings(totalCost),
    costBreakdown: buildCostBreakdown(tool2, tool5, tool7),
  };
}

// ============================================================================
// Main Transformation Function
// ============================================================================

/**
 * Transform PB1 diagnostic data to ToolkitGenerationContext
 *
 * This function takes the collected PB1 session data and transforms it
 * into a unified ToolkitGenerationContext for pre-populating PB2 tools.
 *
 * @param userId - The authenticated user's ID
 * @param data - Collected PB1 session data
 * @returns PartialToolkitGenerationContext (partial because not all tools may be complete)
 */
export function transformPB1ToPB2(
  userId: string,
  data: PB1CollectedData
): PartialToolkitGenerationContext {
  const now = new Date().toISOString();
  const totalAlignmentTax = data.totalAlignmentTax ?? 0;

  // Transform each tool's data
  const roadmap = data.tool1 ? transformToRoadmap(data.tool1, totalAlignmentTax) : undefined;
  const okrFramework = data.tool1 ? transformToOKRFramework(data.tool1) : undefined;
  const meetingProtocol = data.tool2 ? transformToMeetingProtocol(data.tool2) : undefined;
  const delegationFramework = data.tool3 ? transformToDelegationFramework(data.tool3) : undefined;
  const governanceCharter = data.tool4 ? transformToGovernanceCharter(data.tool4) : undefined;
  const dataPlatformPlaybook = data.tool5 ? transformToDataPlatformPlaybook(data.tool5) : undefined;
  const communicationArchitecture = data.tool6 ? transformToCommunicationArchitecture(data.tool6) : undefined;
  const roiDashboard = transformToROIDashboard(data.tool7, data.tool2, data.tool5);

  const context: PartialToolkitGenerationContext = {
    userId,
    generatedAt: now,
  };

  // Only include non-null transformations
  if (roadmap) context.roadmap = roadmap;
  if (okrFramework) context.okrFramework = okrFramework;
  if (meetingProtocol) context.meetingProtocol = meetingProtocol;
  if (delegationFramework) context.delegationFramework = delegationFramework;
  if (governanceCharter) context.governanceCharter = governanceCharter;
  if (dataPlatformPlaybook) context.dataPlatformPlaybook = dataPlatformPlaybook;
  if (communicationArchitecture) context.communicationArchitecture = communicationArchitecture;
  if (roiDashboard) context.roiDashboard = roiDashboard;

  return context;
}

/**
 * Transform DiagnosticSessionData directly (for use when loading from DB)
 */
export function transformSessionDataToPB2(
  userId: string,
  sessionData: DiagnosticSessionData,
  totalAlignmentTax?: number,
  estimatedSavings?: number
): PartialToolkitGenerationContext {
  // Convert to PB1CollectedData format
  const collected: PB1CollectedData = {
    tool1: sessionData.tool1 || null,
    tool2: sessionData.tool2 || null,
    tool3: sessionData.tool3 || null,
    tool4: sessionData.tool4 || null,
    tool5: sessionData.tool5 || null,
    tool6: sessionData.tool6 || null,
    tool7: sessionData.tool7 || null,
    totalAlignmentTax: totalAlignmentTax ?? sessionData.tool7?.totalCost ?? null,
    estimatedSavings: estimatedSavings ?? null,
    completedToolsCount: 0, // Will be ignored
    hasData: true,
  };

  return transformPB1ToPB2(userId, collected);
}
