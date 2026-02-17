/**
 * Admin Webhook Events API Route
 *
 * GET /api/admin/webhooks - List webhook events for admin dashboard
 *
 * Story 17.5: Webhook Retry & Recovery
 * Task 3: Create admin reconciliation API endpoints (AC: 4)
 * Covers: AC4 (view pending/failed webhook events with full details)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { webhookLogs } from '@/lib/db/schema';
import { desc, eq, sql } from 'drizzle-orm';

/**
 * Webhook event list response
 */
interface WebhookEventsResponse {
  events: Array<{
    id: string;
    source: string;
    eventType: string;
    eventId: string | null;
    status: string;
    attempts: number;
    errorMessage: string | null;
    createdAt: Date | null;
    processedAt: Date | null;
  }>;
  total: number;
  limit: number;
  offset: number;
}

/**
 * GET /api/admin/webhooks
 *
 * Returns paginated list of webhook events with filtering.
 *
 * Query params:
 * - status: Filter by status (received, processing, processed, failed)
 * - limit: Number of records (default 50)
 * - offset: Pagination offset (default 0)
 *
 * Requires admin authentication.
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<WebhookEventsResponse | { error: string }>> {
  // Verify admin authentication
  const session = await auth();

  // Check if user is authenticated
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Admin check - for now, check against environment variable
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase());
  if (!adminEmails.includes(session.user.email.toLowerCase())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    // Build query with optional status filter
    let query = db
      .select({
        id: webhookLogs.id,
        source: webhookLogs.source,
        eventType: webhookLogs.eventType,
        eventId: webhookLogs.eventId,
        status: webhookLogs.status,
        attempts: webhookLogs.attempts,
        errorMessage: webhookLogs.errorMessage,
        createdAt: webhookLogs.createdAt,
        processedAt: webhookLogs.processedAt,
      })
      .from(webhookLogs)
      .orderBy(desc(webhookLogs.createdAt))
      .limit(limit)
      .offset(offset);

    // Apply status filter if provided
    const events = status
      ? await query.where(eq(webhookLogs.status, status))
      : await query;

    // Get total count
    const countQuery = status
      ? db
          .select({ count: sql<number>`count(*)` })
          .from(webhookLogs)
          .where(eq(webhookLogs.status, status))
      : db.select({ count: sql<number>`count(*)` }).from(webhookLogs);

    const [{ count }] = await countQuery;

    return NextResponse.json({
      events,
      total: Number(count),
      limit,
      offset,
    });
  } catch (error) {
    console.error('[Admin Webhooks] Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch webhook events' },
      { status: 500 }
    );
  }
}
