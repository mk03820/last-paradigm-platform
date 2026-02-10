/**
 * Bottleneck Pattern Constants
 *
 * Defines the 4 bottleneck patterns and detection logic.
 * Based on Playbook 1 methodology.
 *
 * Story 10.4: Bottleneck Pattern Identification
 * Covers: AC 1, 5 (Pattern definitions, detection thresholds)
 */

import type { ArchetypeId } from './constants';
import type { ArchetypeMetrics } from './calculations';
import { getBenchmarksForArchetype, calculateGapToFast } from './benchmarks';
import type { BudgetThresholdId } from './constants';

export type BottleneckPatternId =
  | 'approval_layers'
  | 'meeting_dependencies'
  | 'unclear_handoffs'
  | 'rework_loops';

export type PatternSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface DiagnosticQuestion {
  id: string;
  question: string;
}

export interface Intervention {
  id: string;
  title: string;
  description: string;
  playbook2Link?: string;
}

export interface BottleneckPattern {
  id: BottleneckPatternId;
  label: string;
  description: string;
  symptoms: string[];
  diagnosticQuestions: DiagnosticQuestion[];
  interventions: Intervention[];
}

export interface PatternDetection {
  patternId: BottleneckPatternId;
  detected: boolean;
  severity: PatternSeverity;
  affectedArchetypes: ArchetypeId[];
  confidence: 'auto' | 'confirmed' | 'rejected';
  confirmedQuestions: string[];
}

/**
 * The 4 bottleneck patterns from Playbook 1
 */
export const BOTTLENECK_PATTERNS: Record<BottleneckPatternId, BottleneckPattern> = {
  approval_layers: {
    id: 'approval_layers',
    label: 'Approval Layers',
    description: 'Too many sign-offs required before decisions can proceed',
    symptoms: [
      'Decisions stall waiting for executives who are unavailable',
      'Same decision requires approval from multiple committees',
      "Approval authority doesn't match decision importance",
    ],
    diagnosticQuestions: [
      {
        id: 'approval_q1',
        question: 'Do decisions routinely require 3+ approval levels?',
      },
      {
        id: 'approval_q2',
        question: 'Are decision-makers frequently unavailable when needed?',
      },
      {
        id: 'approval_q3',
        question: 'Do approvers add meaningful value or just sign off?',
      },
    ],
    interventions: [
      {
        id: 'approval_i1',
        title: 'Implement Decision Authority Matrix',
        description: 'Define clear thresholds for who can approve what decisions',
        playbook2Link: '/playbook2/decision-authority-matrix',
      },
      {
        id: 'approval_i2',
        title: 'Delegate Routine Approvals',
        description: 'Push approval authority to lower levels for routine decisions',
      },
      {
        id: 'approval_i3',
        title: 'Establish Approval SLAs',
        description: 'Set response time expectations with escalation paths',
      },
    ],
  },
  meeting_dependencies: {
    id: 'meeting_dependencies',
    label: 'Meeting Dependencies',
    description: 'Decisions blocked waiting for scheduled meetings',
    symptoms: [
      'Decisions wait for weekly/monthly steering committees',
      'Information sharing requires synchronous meetings',
      'Decision velocity tied to meeting cadence, not urgency',
    ],
    diagnosticQuestions: [
      {
        id: 'meeting_q1',
        question: 'Do decisions wait for scheduled committee meetings?',
      },
      {
        id: 'meeting_q2',
        question: "Could decisions be made asynchronously but aren't?",
      },
      {
        id: 'meeting_q3',
        question: 'Is meeting time spent on updates vs. actual decisions?',
      },
    ],
    interventions: [
      {
        id: 'meeting_i1',
        title: 'Establish Async Decision Protocols',
        description: 'Create pathways for routine decisions without meetings',
        playbook2Link: '/playbook2/async-decision-protocols',
      },
      {
        id: 'meeting_i2',
        title: 'Create Decision-Specific Meetings',
        description: 'Replace recurring updates with focused decision sessions',
      },
      {
        id: 'meeting_i3',
        title: 'Implement Standing Authority',
        description: 'Grant authority to act between scheduled meetings',
      },
    ],
  },
  unclear_handoffs: {
    id: 'unclear_handoffs',
    label: 'Unclear Handoffs',
    description: 'Decisions stall at transition points between teams',
    symptoms: [
      'No clear owner for decisions spanning multiple teams',
      'Information lost between decision and implementation',
      "Implementation team wasn't consulted during decision",
    ],
    diagnosticQuestions: [
      {
        id: 'handoff_q1',
        question: 'Are decision owners and implementation owners different?',
      },
      {
        id: 'handoff_q2',
        question: 'Is there a formal handoff process between stages?',
      },
      {
        id: 'handoff_q3',
        question: 'Do implementation teams have full decision context?',
      },
    ],
    interventions: [
      {
        id: 'handoff_i1',
        title: 'Define RACI for Decision Types',
        description: 'Clarify who is Responsible, Accountable, Consulted, Informed',
        playbook2Link: '/playbook2/decision-raci',
      },
      {
        id: 'handoff_i2',
        title: 'Include Implementers Early',
        description: 'Involve implementation teams in the decision process',
      },
      {
        id: 'handoff_i3',
        title: 'Create Decision Documentation Standards',
        description: 'Ensure context transfers with decisions',
      },
    ],
  },
  rework_loops: {
    id: 'rework_loops',
    label: 'Rework Loops',
    description: 'Decisions get revisited or reversed, restarting the cycle',
    symptoms: [
      'Decisions get overturned by higher authority',
      'New information surfaces after decision is made',
      "Stakeholders weren't consulted and push back later",
    ],
    diagnosticQuestions: [
      {
        id: 'rework_q1',
        question: 'Are decisions frequently revisited or reversed?',
      },
      {
        id: 'rework_q2',
        question: 'Do new stakeholders emerge after decisions are made?',
      },
      {
        id: 'rework_q3',
        question: 'Is decision rationale documented for future reference?',
      },
    ],
    interventions: [
      {
        id: 'rework_i1',
        title: 'Expand Stakeholder Consultation',
        description: 'Identify and engage all stakeholders before deciding',
        playbook2Link: '/playbook2/stakeholder-mapping',
      },
      {
        id: 'rework_i2',
        title: 'Document Decision Rationale',
        description: 'Record the why, not just the what, of decisions',
      },
      {
        id: 'rework_i3',
        title: 'Establish Decision Finality Criteria',
        description: 'Define when and how decisions can be reopened',
      },
    ],
  },
};

/**
 * Severity thresholds based on gap ratio to fast benchmark
 */
export function calculatePatternSeverity(
  gapToFast: number,
  fastBenchmark: number
): PatternSeverity {
  if (fastBenchmark === 0) return 'low';
  const ratio = gapToFast / fastBenchmark;
  if (ratio < 0.5) return 'low';
  if (ratio < 1.0) return 'medium';
  if (ratio < 2.0) return 'high';
  return 'critical';
}

/**
 * Get color classes for severity level
 */
export function getSeverityColor(severity: PatternSeverity): {
  bg: string;
  text: string;
  border: string;
} {
  switch (severity) {
    case 'low':
      return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' };
    case 'medium':
      return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' };
    case 'high':
      return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' };
    case 'critical':
      return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' };
  }
}

/**
 * Severity labels
 */
export const SEVERITY_LABELS: Record<PatternSeverity, string> = {
  low: 'Low Impact',
  medium: 'Medium Impact',
  high: 'High Impact',
  critical: 'Critical Impact',
};

/**
 * Auto-detect bottleneck patterns based on latency metrics
 *
 * Detection heuristics:
 * - Approval Layers: High decision latency across multiple archetypes
 * - Meeting Dependencies: Latency patterns suggesting weekly cycles (7-day multiples)
 * - Unclear Handoffs: High execution latency relative to decision latency
 * - Rework Loops: High variance (p90 >> median suggests revisits)
 */
export function detectBottleneckPatterns(
  metrics: ArchetypeMetrics[],
  budgetThreshold?: BudgetThresholdId
): PatternDetection[] {
  const detections: PatternDetection[] = [];

  if (metrics.length === 0) return detections;

  // Calculate aggregate stats
  const slowArchetypes = metrics.filter((m) => {
    const benchmarks = getBenchmarksForArchetype(
      m.archetypeId,
      m.archetypeId === 'budget' ? budgetThreshold : undefined
    );
    const gap = calculateGapToFast(m.decisionLatency.median, benchmarks);
    return gap > 0;
  });

  const avgGap =
    slowArchetypes.length > 0
      ? slowArchetypes.reduce((sum, m) => {
          const benchmarks = getBenchmarksForArchetype(
            m.archetypeId,
            m.archetypeId === 'budget' ? budgetThreshold : undefined
          );
          return sum + calculateGapToFast(m.decisionLatency.median, benchmarks);
        }, 0) / slowArchetypes.length
      : 0;

  // Detect Approval Layers: Multiple archetypes with significant gaps
  const approvalAffected = slowArchetypes
    .filter((m) => {
      const benchmarks = getBenchmarksForArchetype(
        m.archetypeId,
        m.archetypeId === 'budget' ? budgetThreshold : undefined
      );
      const gap = calculateGapToFast(m.decisionLatency.median, benchmarks);
      return gap > (benchmarks.fast.max || 0) * 0.5;
    })
    .map((m) => m.archetypeId);

  if (approvalAffected.length >= 2) {
    detections.push({
      patternId: 'approval_layers',
      detected: true,
      severity: calculatePatternSeverity(avgGap, 14), // Use 14 as baseline
      affectedArchetypes: approvalAffected,
      confidence: 'auto',
      confirmedQuestions: [],
    });
  }

  // Detect Meeting Dependencies: Latencies clustering around 7-day multiples
  const meetingAffected = metrics
    .filter((m) => {
      const median = m.decisionLatency.median;
      // Check if median is close to 7, 14, 21, 28, etc.
      const nearestWeek = Math.round(median / 7) * 7;
      return Math.abs(median - nearestWeek) <= 2 && median > 7;
    })
    .map((m) => m.archetypeId);

  if (meetingAffected.length >= 1) {
    detections.push({
      patternId: 'meeting_dependencies',
      detected: true,
      severity: calculatePatternSeverity(avgGap, 14),
      affectedArchetypes: meetingAffected,
      confidence: 'auto',
      confirmedQuestions: [],
    });
  }

  // Detect Unclear Handoffs: High execution latency relative to decision
  const handoffAffected = metrics
    .filter((m) => {
      if (!m.executionLatency) return false;
      // Execution taking longer than decision suggests handoff issues
      return m.executionLatency.median > m.decisionLatency.median * 0.5;
    })
    .map((m) => m.archetypeId);

  if (handoffAffected.length >= 1) {
    detections.push({
      patternId: 'unclear_handoffs',
      detected: true,
      severity: calculatePatternSeverity(avgGap, 14),
      affectedArchetypes: handoffAffected,
      confidence: 'auto',
      confirmedQuestions: [],
    });
  }

  // Detect Rework Loops: High variance (p90 much higher than median)
  const reworkAffected = metrics
    .filter((m) => {
      const varianceRatio = m.decisionLatency.p90 / m.decisionLatency.median;
      // P90 > 2x median suggests significant outliers/rework
      return varianceRatio > 2.0 && m.decisionLatency.p90 > 14;
    })
    .map((m) => m.archetypeId);

  if (reworkAffected.length >= 1) {
    detections.push({
      patternId: 'rework_loops',
      detected: true,
      severity: calculatePatternSeverity(avgGap, 14),
      affectedArchetypes: reworkAffected,
      confidence: 'auto',
      confirmedQuestions: [],
    });
  }

  return detections;
}

/**
 * Get overall velocity score based on metrics
 */
export function getOverallVelocityScore(
  metrics: ArchetypeMetrics[],
  budgetThreshold?: BudgetThresholdId
): 'fast' | 'average' | 'slow' | 'crisis' {
  if (metrics.length === 0) return 'average';

  let totalGap = 0;
  let totalBenchmark = 0;

  for (const m of metrics) {
    const benchmarks = getBenchmarksForArchetype(
      m.archetypeId,
      m.archetypeId === 'budget' ? budgetThreshold : undefined
    );
    const fastMax = benchmarks.fast.max || 0;
    totalGap += calculateGapToFast(m.decisionLatency.median, benchmarks);
    totalBenchmark += fastMax;
  }

  if (totalBenchmark === 0) return 'average';
  const avgRatio = totalGap / totalBenchmark;

  if (avgRatio <= 0) return 'fast';
  if (avgRatio <= 0.5) return 'average';
  if (avgRatio <= 1.5) return 'slow';
  return 'crisis';
}

/**
 * Get top interventions across all detected patterns
 */
export function getTopInterventions(
  detections: PatternDetection[],
  limit: number = 3
): { pattern: BottleneckPattern; intervention: Intervention }[] {
  const interventions: { pattern: BottleneckPattern; intervention: Intervention; priority: number }[] = [];

  // Severity priority: critical=4, high=3, medium=2, low=1
  const severityPriority: Record<PatternSeverity, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  for (const detection of detections) {
    if (!detection.detected) continue;
    const pattern = BOTTLENECK_PATTERNS[detection.patternId];
    // Add first intervention from each detected pattern
    if (pattern.interventions.length > 0) {
      interventions.push({
        pattern,
        intervention: pattern.interventions[0],
        priority: severityPriority[detection.severity],
      });
    }
  }

  // Sort by priority (highest first) and take top N
  return interventions
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit)
    .map(({ pattern, intervention }) => ({ pattern, intervention }));
}
