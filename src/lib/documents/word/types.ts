/**
 * Word Document Generation Types
 *
 * Type definitions for document generation.
 *
 * Story 18.2: Word Document Templates & Generation
 * Task 1.6: Create document generation type interfaces
 */

import type { DiagnosticSessionData } from '@/lib/db/schema';

/**
 * Result of generating a document
 */
export interface GenerationResult {
  buffer: Buffer;
  fileSizeBytes: number;
}

/**
 * Document generator function signature
 */
export type DocumentGenerator = (
  diagnosticData: DiagnosticSessionData
) => Promise<GenerationResult>;

/**
 * Map of Word document names to their generators
 */
export type WordDocumentGenerators = Record<string, DocumentGenerator>;

/**
 * Tool 1 - Alignment Assessment data structure
 */
export interface Tool1Data {
  compositeScore?: number;
  dimensions?: {
    strategic?: number;
    structural?: number;
    processAlignment?: number;
    cultural?: number;
    technological?: number;
  };
  interpretation?: string;
}

/**
 * Tool 2 - Meeting Audit data structure
 */
export interface Tool2Data {
  results?: {
    wastedCost?: number;
    wastedHours?: number;
    totalMeetings?: number;
    avgAttendees?: number;
    avgDuration?: number;
    inefficiencyPercent?: number;
  };
}

/**
 * Tool 3 - Decision Velocity data structure
 */
export interface Tool3Data {
  archetypes?: {
    strategic?: { median?: number; p90?: number; samples?: number };
    tactical?: { median?: number; p90?: number; samples?: number };
    operational?: { median?: number; p90?: number; samples?: number };
    budgetary?: { median?: number; p90?: number; samples?: number };
    hiring?: { median?: number; p90?: number; samples?: number };
  };
  bottlenecks?: Array<{
    pattern: string;
    severity: string;
    description: string;
  }>;
  overallVelocityScore?: number;
}

/**
 * Tool 4 - Stakeholder Mapping data structure
 */
export interface Tool4Data {
  stakeholders?: Array<{
    id?: string;
    name: string;
    role: string;
    power: number;
    interest: number;
    sentiment?: 'supportive' | 'neutral' | 'resistant';
    quadrant?: 'manage_closely' | 'keep_satisfied' | 'keep_informed' | 'monitor';
  }>;
  quadrantSummary?: {
    manageClosely: number;
    keepSatisfied: number;
    keepInformed: number;
    monitor: number;
  };
  riskCount?: number;
}

/**
 * Tool 5 - Data Flow Friction data structure
 */
export interface Tool5Data {
  journeys?: Array<{
    id?: string;
    name: string;
    stages: Array<{
      name: string;
      type: string;
    }>;
    frictionPoints?: Array<{
      stageIndex: number;
      category: string;
      severity: number;
      description: string;
    }>;
  }>;
  totalFrictionCost?: number;
  frictionByCategory?: {
    manual?: number;
    delay?: number;
    quality?: number;
    access?: number;
  };
}

/**
 * Tool 6 - Communication Pattern data structure
 */
export interface Tool6Data {
  metrics?: {
    emailsPerDay?: number;
    slackMessagesPerDay?: number;
    meetingHoursPerWeek?: number;
    afterHoursPercent?: number;
    responseTimeMinutes?: number;
  };
  antiPatterns?: Array<{
    pattern: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    recommendation: string;
  }>;
  healthScore?: number;
  healthIndicators?: Record<string, number>;
}

/**
 * Tool 7 - Total Cost data structure
 */
export interface Tool7Data {
  totalCost?: number;
  alignmentTaxPercent?: number;
  costBreakdown?: {
    meetingWaste?: number;
    decisionDelay?: number;
    communicationOverhead?: number;
    frictionCost?: number;
    projectDelays?: number;
    rework?: number;
    turnover?: number;
    opportunityCost?: number;
  };
  interpretation?: 'normal' | 'significant' | 'crisis' | 'existential';
  roiProjection?: {
    conservative?: number;
    moderate?: number;
    aggressive?: number;
    paybackMonths?: number;
  };
}
