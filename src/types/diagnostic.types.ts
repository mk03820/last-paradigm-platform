/**
 * Diagnostic Result Type Definitions for Phase 3
 *
 * Types for the permanent diagnostic results stored after PB1 completion.
 * Separate from Phase 2 DiagnosticSessionData which is for in-progress sessions.
 *
 * Covers: Story 15.1 Task 6.2 (DiagnosticResult types)
 */

import type {
  DiagnosticResult as DrizzleDiagnosticResult,
  NewDiagnosticResult as DrizzleNewDiagnosticResult,
  DiagnosticSessionData,
} from '@/lib/db/schema';

/**
 * Full diagnostic result record from database
 */
export type DiagnosticResult = DrizzleDiagnosticResult;

/**
 * Data required to create a new diagnostic result
 */
export type DiagnosticResultCreate = DrizzleNewDiagnosticResult;

/**
 * Re-export the tool results data structure
 */
export type { DiagnosticSessionData as ToolResultsData };

/**
 * Summary of diagnostic results for dashboard display
 */
export interface DiagnosticResultSummary {
  id: string;
  totalAlignmentTax: string | null;
  estimatedSavings: string | null;
  completedAt: Date | null;
  toolsCompleted: number;
}

/**
 * Detailed tool-by-tool breakdown for preview/results display
 */
export interface DiagnosticToolBreakdown {
  tool1?: {
    name: 'Organizational Alignment';
    compositeScore: number;
    category: 'chaos' | 'siloed' | 'coordinated' | 'integrated';
    completed: boolean;
  };
  tool2?: {
    name: 'Meeting Audit';
    annualizedWaste: number;
    meetingsPerWeek: number;
    completed: boolean;
  };
  tool3?: {
    name: 'Decision Velocity';
    avgLatencyDays: number;
    bottleneckCount: number;
    completed: boolean;
  };
  tool4?: {
    name: 'Stakeholder Mapping';
    stakeholderCount: number;
    blockerCount: number;
    completed: boolean;
  };
  tool5?: {
    name: 'Data Flow Friction';
    totalFrictionCost: number;
    criticalFrictionCount: number;
    completed: boolean;
  };
  tool6?: {
    name: 'Communication Patterns';
    healthScore: number;
    interventionsNeeded: number;
    completed: boolean;
  };
  tool7?: {
    name: 'Total Cost Calculator';
    totalCost: number;
    alignmentTaxPercent: number;
    completed: boolean;
  };
}

/**
 * Full diagnostic results for Playbook 2 preview
 */
export interface DiagnosticResultsForPreview {
  summary: DiagnosticResultSummary;
  breakdown: DiagnosticToolBreakdown;
  rawData: DiagnosticSessionData;
}

/**
 * Helper to count completed tools from tool results
 */
export function countCompletedTools(data: DiagnosticSessionData): number {
  let count = 0;
  if (data.tool1?.completedAt) count++;
  if (data.tool2?.completedAt) count++;
  if (data.tool3?.completedAt) count++;
  if (data.tool4?.completedAt) count++;
  if (data.tool5?.completedAt) count++;
  if (data.tool6?.completedAt) count++;
  if (data.tool7?.completedAt) count++;
  return count;
}

/**
 * Helper to create a diagnostic result summary
 */
export function toDiagnosticResultSummary(
  result: DiagnosticResult
): DiagnosticResultSummary {
  return {
    id: result.id,
    totalAlignmentTax: result.totalAlignmentTax,
    estimatedSavings: result.estimatedSavings,
    completedAt: result.completedAt,
    toolsCompleted: countCompletedTools(result.toolResults || {}),
  };
}
