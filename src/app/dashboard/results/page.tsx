/**
 * Diagnostic Results Page
 *
 * Displays all 7 Playbook 1 diagnostic tool results with key metrics highlighted.
 *
 * Story 19.2: Diagnostic Results Display
 * Task 1: Create results page route and layout (AC: 1)
 * Covers: FR64 (Diagnostic results display), NFR23 (<2s load)
 */

import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { diagnosticResults, diagnosticSessions } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import {
  ResultsHero,
  ResultsGrid,
  ShareResultsButton,
  RecalculateButton,
} from '@/components/dashboard/results';
import type { ResultsHeroData, ToolResultsData } from '@/components/dashboard/results';

export default async function ResultsPage() {
  const session = await auth();

  // Redirect to sign-in if not authenticated (AC1)
  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/dashboard/results');
  }

  // Fetch all results data in parallel for performance (NFR23)
  const [resultsData, sessionsData] = await Promise.all([
    // User's completed diagnostic results
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

    // User's active diagnostic session (for partial results)
    db
      .select({
        id: diagnosticSessions.id,
        name: diagnosticSessions.name,
        toolsCompleted: diagnosticSessions.toolsCompleted,
        status: diagnosticSessions.status,
        data: diagnosticSessions.data,
        updatedAt: diagnosticSessions.updatedAt,
      })
      .from(diagnosticSessions)
      .where(eq(diagnosticSessions.userId, session.user.id))
      .orderBy(desc(diagnosticSessions.updatedAt))
      .limit(1),
  ]);

  const latestResults = resultsData[0];
  const latestSession = sessionsData[0];

  // Prepare hero data
  let heroData: ResultsHeroData | null = null;
  let toolResults: ToolResultsData | null = null;
  let diagnosticResultId: string | null = null;

  if (latestResults) {
    diagnosticResultId = latestResults.id;

    // Get composite score from tool1 if available
    const tool1Data = latestResults.toolResults?.tool1;
    const compositeScore = tool1Data?.compositeScore ?? null;

    heroData = {
      totalAlignmentTax: latestResults.totalAlignmentTax
        ? Number(latestResults.totalAlignmentTax)
        : null,
      estimatedSavings: latestResults.estimatedSavings
        ? Number(latestResults.estimatedSavings)
        : null,
      compositeScore,
      completedAt: latestResults.completedAt?.toISOString() || null,
      sessionName: latestSession?.name || null,
    };

    toolResults = latestResults.toolResults as ToolResultsData;
  } else if (latestSession && latestSession.data) {
    // Show partial results from in-progress session
    const sessionData = latestSession.data;
    const tool1Data = sessionData.tool1;
    const compositeScore = tool1Data?.compositeScore ?? null;

    heroData = {
      totalAlignmentTax: null, // Not calculated until complete
      estimatedSavings: null,
      compositeScore,
      completedAt: null,
      sessionName: latestSession.name,
    };

    toolResults = sessionData as ToolResultsData;
  }

  return (
    <>
      {/* Hero Section with Key Metrics (AC3, AC4) */}
      <ResultsHero results={heroData} />

      {/* Action Buttons (AC5, AC6) */}
      {diagnosticResultId && (
        <div className="mb-8 flex flex-wrap gap-2">
          <ShareResultsButton diagnosticResultId={diagnosticResultId} />
          <RecalculateButton />
        </div>
      )}

      {/* Tool Results Grid (AC2) */}
      <ResultsGrid toolResults={toolResults} />
    </>
  );
}
