/**
 * Admin Webhook Acknowledge API Route
 *
 * POST /api/admin/webhooks/[id]/acknowledge - Acknowledge a failed webhook alert
 *
 * Story 21.4: Webhook Monitoring & Recovery
 * Task 5: Implement alert acknowledgement (AC: 5)
 * Covers: AC5 (acknowledge/dismiss alert after resolution)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin-auth';
import { logAdminAction, ADMIN_ACTIONS, ENTITY_TYPES } from '@/lib/admin/audit-logger';
import { db } from '@/lib/db';
import { webhookLogs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * POST /api/admin/webhooks/[id]/acknowledge
 *
 * Acknowledges a failed webhook alert.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verify admin authentication
  const authResult = await requireAdmin();

  if (!authResult.authenticated) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Get webhook log
    const [webhook] = await db
      .select()
      .from(webhookLogs)
      .where(eq(webhookLogs.id, id))
      .limit(1);

    if (!webhook) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }

    if (webhook.acknowledgedAt) {
      return NextResponse.json({ error: 'Already acknowledged' }, { status: 400 });
    }

    // Update webhook
    await db
      .update(webhookLogs)
      .set({
        acknowledgedAt: new Date(),
        acknowledgedBy: authResult.admin.sub,
      })
      .where(eq(webhookLogs.id, id));

    // Log action
    await logAdminAction({
      adminId: authResult.admin.sub,
      action: ADMIN_ACTIONS.WEBHOOK_ACKNOWLEDGE,
      entityType: ENTITY_TYPES.WEBHOOK,
      entityId: id,
      details: {
        eventType: webhook.eventType,
        eventId: webhook.eventId,
        attempts: webhook.attempts,
      },
      ipAddress:
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'Webhook alert acknowledged',
    });
  } catch (error) {
    console.error('[Admin Webhooks] Error acknowledging:', error);
    return NextResponse.json(
      { error: 'Failed to acknowledge webhook' },
      { status: 500 }
    );
  }
}
