/**
 * Admin Webhook Stats API Route
 *
 * GET /api/admin/webhooks/stats - Get webhook health statistics
 *
 * Story 21.4: Webhook Monitoring & Recovery
 * Task 4: Create webhook stats API (AC: 4)
 * Covers: AC4 (success rate, failed count, critical failures)
 */

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin-auth';
import { db } from '@/lib/db';
import { webhookLogs } from '@/lib/db/schema';
import { sql, gte, eq, and, gt } from 'drizzle-orm';

/**
 * GET /api/admin/webhooks/stats
 *
 * Returns webhook health statistics for the last 24 hours.
 */
export async function GET() {
  // Verify admin authentication
  const authResult = await requireAdmin();

  if (!authResult.authenticated) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Get counts by status for last 24 hours
    const statusCounts = await db
      .select({
        status: webhookLogs.status,
        count: sql<number>`count(*)`,
      })
      .from(webhookLogs)
      .where(gte(webhookLogs.createdAt, twentyFourHoursAgo))
      .groupBy(webhookLogs.status);

    // Calculate totals
    let totalLast24Hours = 0;
    let successCount = 0;
    let failedCount = 0;

    for (const row of statusCounts) {
      const count = Number(row.count);
      totalLast24Hours += count;

      if (row.status === 'processed') {
        successCount += count;
      } else if (row.status === 'failed') {
        failedCount += count;
      }
    }

    const successRate =
      totalLast24Hours > 0
        ? Math.round((successCount / totalLast24Hours) * 100 * 10) / 10
        : 100;

    // Get critical failures (webhooks with >3 attempts that are not processed)
    const criticalFailures = await db
      .select({
        id: webhookLogs.id,
        eventType: webhookLogs.eventType,
        eventId: webhookLogs.eventId,
        attempts: webhookLogs.attempts,
        errorMessage: webhookLogs.errorMessage,
        createdAt: webhookLogs.createdAt,
        acknowledgedAt: webhookLogs.acknowledgedAt,
      })
      .from(webhookLogs)
      .where(
        and(
          gt(webhookLogs.attempts, 3),
          eq(webhookLogs.status, 'failed')
        )
      )
      .orderBy(sql`${webhookLogs.attempts} DESC`)
      .limit(10);

    // Count unacknowledged critical failures
    const unacknowledgedCount = criticalFailures.filter(
      (f) => !f.acknowledgedAt
    ).length;

    return NextResponse.json({
      totalLast24Hours,
      successCount,
      failedCount,
      successRate,
      criticalFailures: criticalFailures.map((f) => ({
        id: f.id,
        eventType: f.eventType,
        eventId: f.eventId,
        attempts: f.attempts,
        lastError: f.errorMessage,
        createdAt: f.createdAt,
        isAcknowledged: !!f.acknowledgedAt,
      })),
      unacknowledgedCriticalCount: unacknowledgedCount,
    });
  } catch (error) {
    console.error('[Admin Webhooks Stats] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch webhook statistics' },
      { status: 500 }
    );
  }
}
