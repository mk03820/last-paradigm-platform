/**
 * User Dashboard Page
 *
 * Main dashboard overview showing welcome message, quick stats,
 * diagnostic progress, and session management.
 *
 * Story 19.1: Dashboard Layout & Navigation
 * Task 1.1: Create `/app/dashboard/page.tsx` protected route
 * Covers: FR64 (Account dashboard), NFR23 (<2s load), NFR24 (Mobile responsive)
 *
 * Story 19.3: Purchase Status & Toolkit Access
 * Task 7: Integrate with dashboard page
 * Covers: FR64 (Purchase status), FR54 (Analytics tracking)
 *
 * Also covers from previous stories:
 * - FR2-3 (View saved sessions)
 * - FR2-4 (Cross-device continuity)
 * - FR2-37 (Tool Hub)
 */

import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import {
  diagnosticSessions,
  diagnosticResults,
  users,
  invoiceRequests,
} from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import {
  SessionList,
  NewSessionButton,
  SessionMigrator,
  WelcomeSection,
  QuickStats,
  PurchaseStatusSection,
} from '@/components/dashboard';
import { toSessionSummary } from '@/types/session.types';
import { DiagnosticProgress, ToolGrid } from '@/components/diagnostic';
import { getToolkitStatus } from '@/lib/services/toolkit-status';

export default async function DashboardPage() {
  const session = await auth();

  // Redirect to sign-in if not authenticated
  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/dashboard');
  }

  // Fetch all dashboard data in parallel for performance (NFR23)
  const [sessionsData, resultsData, userData, invoiceData, toolkitStatus] = await Promise.all([
    // User's diagnostic sessions
    db
      .select()
      .from(diagnosticSessions)
      .where(eq(diagnosticSessions.userId, session.user.id))
      .orderBy(desc(diagnosticSessions.updatedAt)),

    // User's latest diagnostic results (for quick stats)
    db
      .select({
        totalAlignmentTax: diagnosticResults.totalAlignmentTax,
        estimatedSavings: diagnosticResults.estimatedSavings,
        completedAt: diagnosticResults.completedAt,
        toolResults: diagnosticResults.toolResults,
      })
      .from(diagnosticResults)
      .where(eq(diagnosticResults.userId, session.user.id))
      .orderBy(desc(diagnosticResults.completedAt))
      .limit(1),

    // User profile data with purchase status (Story 19.3)
    db
      .select({
        email: users.email,
        name: users.name,
        createdAt: users.createdAt,
        purchaseStatus: users.purchaseStatus,
        purchasedAt: users.purchasedAt,
        hasPb2Access: users.hasPb2Access,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1),

    // Latest invoice request (Story 19.3)
    db
      .select({
        id: invoiceRequests.id,
        status: invoiceRequests.status,
        createdAt: invoiceRequests.createdAt,
      })
      .from(invoiceRequests)
      .where(eq(invoiceRequests.userId, session.user.id))
      .orderBy(desc(invoiceRequests.createdAt))
      .limit(1),

    // Toolkit generation status (Story 19.3)
    getToolkitStatus(session.user.id),
  ]);

  const sessionSummaries = sessionsData.map(toSessionSummary);
  const latestResults = resultsData[0];
  const userProfile = userData[0];
  const latestInvoice = invoiceData[0];

  // Calculate diagnostic summary for QuickStats and PurchaseStatusSection
  const diagnosticSummary = latestResults
    ? {
        completedTools: latestResults.toolResults
          ? Object.keys(latestResults.toolResults).filter(
              (key) =>
                latestResults.toolResults?.[key as keyof typeof latestResults.toolResults]?.completedAt
            ).length
          : 0,
        totalAlignmentTax: latestResults.totalAlignmentTax
          ? Number(latestResults.totalAlignmentTax)
          : null,
        estimatedSavings: latestResults.estimatedSavings
          ? Number(latestResults.estimatedSavings)
          : null,
        lastCompletedAt: latestResults.completedAt?.toISOString() || null,
      }
    : sessionsData.length > 0
    ? {
        completedTools: sessionsData[0].toolsCompleted || 0,
        totalAlignmentTax: null,
        estimatedSavings: null,
        lastCompletedAt: null,
      }
    : null;

  return (
    <>
      {/* Session migration for anonymous data */}
      <SessionMigrator />

      {/* Welcome Section (AC1: Welcome message with user's name/email) */}
      <WelcomeSection
        user={{
          email: userProfile?.email || session.user.email,
          name: userProfile?.name || session.user.name,
        }}
        lastLogin={null} // TODO: Track last login in user table
      />

      {/* Quick Stats Summary (AC1: Quick stats summary) */}
      <QuickStats diagnosticSummary={diagnosticSummary} />

      {/* Purchase Status & Toolkit Access (Story 19.3) */}
      <PurchaseStatusSection
        purchaseStatus={(userProfile?.purchaseStatus as 'none' | 'pending' | 'completed' | 'refunded') ?? 'none'}
        purchasedAt={userProfile?.purchasedAt ?? null}
        hasPb2Access={userProfile?.hasPb2Access ?? false}
        invoiceRequestedAt={latestInvoice?.createdAt ?? null}
        diagnosticSummary={diagnosticSummary}
        toolkitStatus={toolkitStatus}
      />

      {/* New Session CTA */}
      <div className="flex justify-end mb-6">
        <NewSessionButton />
      </div>

      {/* Diagnostic Progress */}
      <section
        className="mb-8 p-4 rounded-lg border bg-card"
        aria-labelledby="progress-heading"
        role="region"
      >
        <h2 id="progress-heading" className="text-lg font-semibold mb-4">
          Diagnostic Progress
        </h2>
        <DiagnosticProgress />
      </section>

      {/* Diagnostic Tools */}
      <section className="mb-8" aria-labelledby="tools-heading" role="region">
        <h2 id="tools-heading" className="text-lg font-semibold mb-4">
          Diagnostic Tools
        </h2>
        <ToolGrid />
      </section>

      {/* Sessions list */}
      <section aria-labelledby="sessions-heading" role="region">
        <h2 id="sessions-heading" className="text-lg font-semibold mb-4">
          Your Diagnostic Sessions
        </h2>
        <SessionList initialSessions={sessionSummaries} />
      </section>
    </>
  );
}
