/**
 * Session Migration Service
 *
 * Migrates PB1 session data from client storage to database
 * when a user creates an account.
 *
 * Covers: Story 15.7, FR40 (Session to DB migration), FR55 (PB1→PB2 data)
 */

import { db } from '@/lib/db';
import { diagnosticResults } from '@/lib/db/schema';
import type { DiagnosticSessionData } from '@/lib/db/schema';

type ToolKey = 'tool1' | 'tool2' | 'tool3' | 'tool4' | 'tool5' | 'tool6' | 'tool7';

export interface PB1SessionData {
  tool1?: Record<string, unknown>; // Alignment Assessment
  tool2?: Record<string, unknown>; // Meeting Audit
  tool3?: Record<string, unknown>; // Decision Velocity
  tool4?: Record<string, unknown>; // Stakeholder Map
  tool5?: Record<string, unknown>; // Data Flow
  tool6?: Record<string, unknown>; // Communication
  tool7?: Record<string, unknown>; // Total Cost
  totalAlignmentTax?: number;
  estimatedSavings?: number;
  completedAt?: string;
}

export interface MigrationResult {
  success: boolean;
  diagnosticResultId?: string;
  error?: string;
}

/**
 * Migrate PB1 session data to the database for a user
 */
export async function migratePB1Session(
  userId: string,
  sessionData: PB1SessionData
): Promise<MigrationResult> {
  try {
    // Validate we have some data to migrate
    const hasToolData = Object.keys(sessionData).some(
      (key) => key.startsWith('tool') && sessionData[key as keyof PB1SessionData]
    );

    if (!hasToolData) {
      return {
        success: false,
        error: 'No tool data to migrate',
      };
    }

    // Build tool results object
    const toolResults: DiagnosticSessionData = {};
    for (let i = 1; i <= 7; i++) {
      const toolKey = `tool${i}` as ToolKey;
      if (sessionData[toolKey]) {
        (toolResults as Record<ToolKey, Record<string, unknown> | undefined>)[toolKey] =
          sessionData[toolKey] as Record<string, unknown>;
      }
    }

    // Calculate totals if not provided
    const totalAlignmentTax = sessionData.totalAlignmentTax?.toString() || null;
    const estimatedSavings = sessionData.estimatedSavings?.toString() || null;

    // Insert into database
    const [result] = await db
      .insert(diagnosticResults)
      .values({
        userId,
        toolResults,
        totalAlignmentTax,
        estimatedSavings,
        completedAt: sessionData.completedAt ? new Date(sessionData.completedAt) : new Date(),
      })
      .returning();

    return {
      success: true,
      diagnosticResultId: result.id,
    };
  } catch (error) {
    console.error('[session-migration] Migration error:', error);
    return {
      success: false,
      error: 'Failed to migrate session data',
    };
  }
}

/**
 * Build ToolkitGenerationContext from PB1 data for PB2 pre-population
 */
export function buildToolkitContext(sessionData: PB1SessionData): Record<string, unknown> {
  return {
    // Organization profile from alignment assessment
    organizationSize: sessionData.tool1?.organizationSize,
    industry: sessionData.tool1?.industry,
    alignmentScores: sessionData.tool1?.scores,

    // Meeting data
    meetingMetrics: sessionData.tool2,

    // Decision patterns
    decisionVelocity: sessionData.tool3,

    // Stakeholder map
    stakeholders: sessionData.tool4?.stakeholders,
    stakeholderRisks: sessionData.tool4?.risks,

    // Data flow friction
    dataJourneys: sessionData.tool5?.journeys,
    frictionPoints: sessionData.tool5?.frictionPoints,

    // Communication patterns
    communicationMetrics: sessionData.tool6?.metrics,
    antiPatterns: sessionData.tool6?.antiPatterns,

    // Total cost analysis
    costBreakdown: sessionData.tool7?.costBreakdown,
    roiProjections: sessionData.tool7?.roiProjections,

    // Summary metrics
    totalAlignmentTax: sessionData.totalAlignmentTax,
    estimatedSavings: sessionData.estimatedSavings,
  };
}
