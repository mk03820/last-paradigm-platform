/**
 * Types for Diagnostic Results Display
 *
 * Story 19.2: Diagnostic Results Display
 * Covers: AC2 (Tool results structure)
 */

import type { DiagnosticSessionData } from '@/lib/db/schema';

/**
 * Results data for the hero section
 */
export interface ResultsHeroData {
  totalAlignmentTax: number | null;
  estimatedSavings: number | null;
  compositeScore: number | null;
  completedAt: string | null;
  sessionName: string | null;
}

/**
 * API response shape for results page
 */
export interface ResultsPageData {
  diagnosticResult: {
    id: string;
    toolResults: DiagnosticSessionData;
    totalAlignmentTax: number | null;
    estimatedSavings: number | null;
    completedAt: string;
  } | null;
  session: {
    id: string;
    name: string | null;
    toolsCompleted: number;
    status: 'in_progress' | 'completed';
    updatedAt: string;
  } | null;
  hasCompleteResults: boolean;
}

/**
 * Tool 1 - Alignment Assessment data
 */
export interface AlignmentData {
  scores?: {
    strategic?: number;
    execution?: number;
    technology?: number;
    people?: number;
    governance?: number;
  };
  compositeScore?: number;
  completedAt?: string;
}

/**
 * Tool 2 - Meeting Audit data
 */
export interface MeetingAuditData {
  inputs?: {
    meetingCount?: number;
    averageAttendees?: number;
    averageDuration?: number;
    salaryDistribution?: {
      executive?: number;
      senior?: number;
      midLevel?: number;
      entry?: number;
    };
  };
  results?: {
    totalMeetingHours?: number;
    totalMeetingCost?: number;
    wastedHours?: number;
    wastedCost?: number;
    effectiveHours?: number;
    effectiveCost?: number;
  };
  completedAt?: string;
}

/**
 * Tool 3 - Decision Velocity data
 */
export interface DecisionVelocityData {
  decisions?: Array<{
    archetype?: string;
    medianDays?: number;
    p90Days?: number;
  }>;
  metrics?: {
    overallMedian?: number;
    overallP90?: number;
  };
  completedAt?: string;
}

/**
 * Tool 4 - Stakeholder Map data
 */
export interface StakeholderMapData {
  stakeholders?: Array<{
    name?: string;
    power?: number;
    interest?: number;
    sentiment?: 'champion' | 'neutral' | 'blocker';
  }>;
  completedAt?: string;
}

/**
 * Tool 5 - Data Flow Friction data
 */
export interface DataFlowData {
  journeys?: Array<{
    name?: string;
    frictionPoints?: number;
  }>;
  frictionCost?: number;
  criticalFriction?: number;
  completedAt?: string;
}

/**
 * Tool 6 - Communication Pattern data
 */
export interface CommunicationData {
  metrics?: {
    healthScore?: number;
    antiPatternCount?: number;
  };
  antiPatterns?: string[];
  completedAt?: string;
}

/**
 * Tool 7 - Total Cost data
 */
export interface TotalCostData {
  totalCost?: number;
  alignmentTaxPercent?: number;
  breakdown?: {
    meetings?: number;
    decisions?: number;
    data?: number;
    communication?: number;
    other?: number;
  };
  completedAt?: string;
}

/**
 * Combined tool results for the grid
 */
export interface ToolResultsData {
  tool1?: AlignmentData;
  tool2?: MeetingAuditData;
  tool3?: DecisionVelocityData;
  tool4?: StakeholderMapData;
  tool5?: DataFlowData;
  tool6?: CommunicationData;
  tool7?: TotalCostData;
}

/**
 * Share token response
 */
export interface ShareTokenResponse {
  shareUrl: string;
  expiresAt: string;
}
