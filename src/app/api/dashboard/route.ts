/**
 * Dashboard API Endpoint
 *
 * Fetches user profile, diagnostic results, and purchase status
 * for the dashboard overview.
 *
 * Story 19.1: Dashboard Layout & Navigation
 * Task 5.1: Create `/app/api/dashboard/route.ts` endpoint
 * Covers: FR64 (Account dashboard), NFR23 (<2s load)
 */

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { users, diagnosticResults, diagnosticSessions } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export interface DashboardData {
  user: {
    id: string;
    email: string;
    name: string | null;
    purchaseStatus: 'none' | 'pending' | 'purchased' | 'refunded';
    purchasedAt: string | null;
    createdAt: string;
  };
  diagnosticSummary: {
    completedTools: number;
    totalAlignmentTax: number | null;
    estimatedSavings: number | null;
    lastCompletedAt: string | null;
  } | null;
}

export async function GET(): Promise<NextResponse<DashboardData | { error: string }>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all data in parallel for performance
    const [userData, resultsData, sessionsData] = await Promise.all([
      // User profile
      db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          purchaseStatus: users.purchaseStatus,
          purchasedAt: users.purchasedAt,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.id, session.user.id))
        .limit(1),

      // Latest diagnostic results
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

      // Active diagnostic sessions
      db
        .select({
          toolsCompleted: diagnosticSessions.toolsCompleted,
        })
        .from(diagnosticSessions)
        .where(eq(diagnosticSessions.userId, session.user.id))
        .orderBy(desc(diagnosticSessions.updatedAt))
        .limit(1),
    ]);

    const user = userData[0];
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const latestResults = resultsData[0];
    const latestSession = sessionsData[0];

    // Calculate diagnostic summary
    let diagnosticSummary: DashboardData['diagnosticSummary'] = null;

    if (latestResults) {
      const completedTools = latestResults.toolResults
        ? Object.keys(latestResults.toolResults).filter(
            (key) =>
              latestResults.toolResults?.[
                key as keyof typeof latestResults.toolResults
              ]?.completedAt
          ).length
        : 0;

      diagnosticSummary = {
        completedTools,
        totalAlignmentTax: latestResults.totalAlignmentTax
          ? Number(latestResults.totalAlignmentTax)
          : null,
        estimatedSavings: latestResults.estimatedSavings
          ? Number(latestResults.estimatedSavings)
          : null,
        lastCompletedAt: latestResults.completedAt?.toISOString() || null,
      };
    } else if (latestSession) {
      diagnosticSummary = {
        completedTools: latestSession.toolsCompleted || 0,
        totalAlignmentTax: null,
        estimatedSavings: null,
        lastCompletedAt: null,
      };
    }

    const response: DashboardData = {
      user: {
        id: user.id,
        email: user.email || '',
        name: user.name,
        purchaseStatus:
          (user.purchaseStatus as 'none' | 'pending' | 'purchased' | 'refunded') ||
          'none',
        purchasedAt: user.purchasedAt?.toISOString() || null,
        createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
      },
      diagnosticSummary,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
