/**
 * Dashboard Results API Endpoint
 *
 * Fetches diagnostic results and session data for the results page.
 *
 * Story 19.2: Diagnostic Results Display
 * Task 7: Create API endpoint for results data (AC: 1, 7)
 * Covers: FR64 (Account dashboard), NFR23 (<2s load)
 */

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { diagnosticResults, diagnosticSessions } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { DiagnosticSessionData } from '@/lib/db/schema';

export interface ResultsData {
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

export async function GET(): Promise<NextResponse<ResultsData | { error: string }>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all data in parallel for performance (NFR23)
    const [resultsData, sessionsData] = await Promise.all([
      db
        .select({
          id: diagnosticResults.id,
          toolResults: diagnosticResults.toolResults,
          totalAlignmentTax: diagnosticResults.totalAlignmentTax,
          estimatedSavings: diagnosticResults.estimatedSavings,
          completedAt: diagnosticResults.completedAt,
        })
        .from(diagnosticResults)
        .where(eq(diagnosticResults.userId, session.user.id))
        .orderBy(desc(diagnosticResults.completedAt))
        .limit(1),

      db
        .select({
          id: diagnosticSessions.id,
          name: diagnosticSessions.name,
          toolsCompleted: diagnosticSessions.toolsCompleted,
          status: diagnosticSessions.status,
          updatedAt: diagnosticSessions.updatedAt,
        })
        .from(diagnosticSessions)
        .where(eq(diagnosticSessions.userId, session.user.id))
        .orderBy(desc(diagnosticSessions.updatedAt))
        .limit(1),
    ]);

    const latestResults = resultsData[0];
    const latestSession = sessionsData[0];

    // Check if all 7 tools are completed
    const hasCompleteResults = latestResults?.toolResults
      ? Object.keys(latestResults.toolResults).filter(
          (key) =>
            latestResults.toolResults?.[key as keyof DiagnosticSessionData]?.completedAt
        ).length === 7
      : false;

    const response: ResultsData = {
      diagnosticResult: latestResults
        ? {
            id: latestResults.id,
            toolResults: latestResults.toolResults,
            totalAlignmentTax: latestResults.totalAlignmentTax
              ? Number(latestResults.totalAlignmentTax)
              : null,
            estimatedSavings: latestResults.estimatedSavings
              ? Number(latestResults.estimatedSavings)
              : null,
            completedAt: latestResults.completedAt?.toISOString() || '',
          }
        : null,
      session: latestSession
        ? {
            id: latestSession.id,
            name: latestSession.name,
            toolsCompleted: latestSession.toolsCompleted,
            status: latestSession.status,
            updatedAt: latestSession.updatedAt.toISOString(),
          }
        : null,
      hasCompleteResults,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Results API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
