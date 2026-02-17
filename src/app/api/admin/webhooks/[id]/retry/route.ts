/**
 * Admin Webhook Retry API Route
 *
 * POST /api/admin/webhooks/[id]/retry - Manually retry a failed webhook event
 *
 * Story 17.5: Webhook Retry & Recovery
 * Task 3: Create admin reconciliation API endpoints (AC: 5)
 * Covers: AC5 (manual processing of stored webhook payload)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { webhookLogs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { handleCheckoutCompleted } from '@/lib/stripe/webhooks';
import type Stripe from 'stripe';

/**
 * Retry response type
 */
interface RetryResponse {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * POST /api/admin/webhooks/[id]/retry
 *
 * Manually retries processing of a failed webhook event using stored payload.
 *
 * Requires admin authentication.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<RetryResponse>> {
  // Verify admin authentication
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Admin check
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase());
  if (!adminEmails.includes(session.user.email.toLowerCase())) {
    return NextResponse.json(
      { success: false, message: 'Forbidden' },
      { status: 403 }
    );
  }

  const { id } = await params;

  try {
    // Fetch the webhook event
    const [event] = await db
      .select()
      .from(webhookLogs)
      .where(eq(webhookLogs.id, id))
      .limit(1);

    if (!event) {
      return NextResponse.json(
        { success: false, message: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if already processed
    if (event.status === 'processed') {
      return NextResponse.json(
        { success: false, message: 'Event already processed' },
        { status: 400 }
      );
    }

    // Mark as processing
    await db
      .update(webhookLogs)
      .set({
        status: 'processing',
        attempts: event.attempts + 1,
      })
      .where(eq(webhookLogs.id, id));

    // Process based on event type
    const payload = event.payload as unknown as Stripe.Event;

    switch (event.eventType) {
      case 'checkout.session.completed': {
        const checkoutSession = payload.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(checkoutSession);
        break;
      }

      case 'charge.refunded': {
        // TODO: Implement refund handler when needed
        console.log(`[Admin Retry] charge.refunded handler not implemented`);
        break;
      }

      default:
        return NextResponse.json(
          {
            success: false,
            message: `Event type ${event.eventType} cannot be manually retried`,
          },
          { status: 400 }
        );
    }

    // Mark as processed
    await db
      .update(webhookLogs)
      .set({
        status: 'processed',
        processedAt: new Date(),
        errorMessage: null,
      })
      .where(eq(webhookLogs.id, id));

    console.log(
      `[Admin Retry] Successfully retried event ${id} (${event.eventType})`
    );

    return NextResponse.json({
      success: true,
      message: 'Event processed successfully',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Admin Retry] Error retrying event ${id}:`, error);

    // Update with error
    await db
      .update(webhookLogs)
      .set({
        status: 'failed',
        errorMessage: message,
      })
      .where(eq(webhookLogs.id, id));

    return NextResponse.json(
      {
        success: false,
        message: 'Processing failed',
        error: message,
      },
      { status: 500 }
    );
  }
}
