/**
 * Stripe Webhook Handler API Route
 *
 * POST /api/webhooks/stripe - Receives and processes Stripe webhook events
 *
 * Security: Verifies webhook signature using STRIPE_WEBHOOK_SECRET (NFR19)
 * Reliability: Idempotent processing, logs all events for audit trail
 *
 * Story 17.4: Stripe Webhook Handler
 * Story 17.5: Webhook Retry & Recovery (alerting integration)
 * Task 1: Create webhook API route with signature verification
 * Covers: AC1, AC5, AC6, AC7, AC8
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe/client';
import { handleCheckoutCompleted } from '@/lib/stripe/webhooks';
import { sendWebhookFailureAlert } from '@/lib/alerts';
import { db } from '@/lib/db';
import { webhookLogs } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import Stripe from 'stripe';

/**
 * Alert threshold - send alert after this many failures
 */
const ALERT_THRESHOLD = 3;

/**
 * Webhook response type
 */
interface WebhookResponse {
  received: boolean;
  eventId?: string;
  error?: string;
}

/**
 * POST /api/webhooks/stripe
 *
 * Receives Stripe webhook events, verifies signature, and routes to handlers.
 *
 * Response codes:
 * - 200: Event processed successfully (or already processed)
 * - 400: Invalid signature or missing headers
 * - 500: Processing error (triggers Stripe retry)
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<WebhookResponse>> {
  const startTime = Date.now();

  // Get raw body for signature verification (AC1)
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  // Validate signature header is present
  if (!signature) {
    console.error('[Stripe Webhook] Missing stripe-signature header');
    return NextResponse.json(
      { received: false, error: 'Missing signature' },
      { status: 400 }
    );
  }

  // Validate webhook secret is configured
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json(
      { received: false, error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  // Verify webhook signature (AC1, NFR19)
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[Stripe Webhook] Signature verification failed: ${message}`);
    // Return 400 for invalid signatures - no retry (AC5)
    return NextResponse.json(
      { received: false, error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Log event receipt (AC8)
  console.log(
    `[Stripe Webhook] Received event: ${event.type} (${event.id})`
  );

  // Check for duplicate event (idempotency) (AC6)
  const existingEvent = await db
    .select({ id: webhookLogs.id, status: webhookLogs.status, attempts: webhookLogs.attempts })
    .from(webhookLogs)
    .where(eq(webhookLogs.eventId, event.id))
    .limit(1);

  if (existingEvent.length > 0 && existingEvent[0].status === 'processed') {
    console.log(
      `[Stripe Webhook] Duplicate event, already processed: ${event.id}`
    );
    return NextResponse.json({ received: true, eventId: event.id });
  }

  // Store event for audit trail (AC8)
  let webhookLogId: string;
  try {
    if (existingEvent.length > 0) {
      // Update existing record with retry attempt
      webhookLogId = existingEvent[0].id;
      await db
        .update(webhookLogs)
        .set({
          status: 'processing',
          attempts: existingEvent[0].status === 'failed' ? 2 : 1,
        })
        .where(eq(webhookLogs.id, webhookLogId));
    } else {
      // Create new record
      const [log] = await db
        .insert(webhookLogs)
        .values({
          source: 'stripe',
          eventType: event.type,
          eventId: event.id,
          payload: event as unknown as Record<string, unknown>,
          status: 'processing',
        })
        .returning({ id: webhookLogs.id });
      webhookLogId = log.id;
    }
  } catch (dbError) {
    console.error(
      `[Stripe Webhook] Failed to log event: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`
    );
    // Continue processing even if logging fails
    webhookLogId = 'unknown';
  }

  try {
    // Route to appropriate handler based on event type
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      // Future event handlers can be added here
      case 'charge.refunded': {
        // TODO: Story 17.5 - Handle refunds
        console.log(`[Stripe Webhook] charge.refunded event received (not implemented)`);
        break;
      }

      case 'payment_intent.payment_failed': {
        // Log failed payment attempts for monitoring
        console.log(
          `[Stripe Webhook] Payment failed for intent: ${(event.data.object as Stripe.PaymentIntent).id}`
        );
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    // Mark event as processed (AC8)
    const duration = Date.now() - startTime;
    await db
      .update(webhookLogs)
      .set({
        status: 'processed',
        processedAt: new Date(),
      })
      .where(eq(webhookLogs.eventId, event.id));

    console.log(
      `[Stripe Webhook] Successfully processed ${event.type} in ${duration}ms`
    );

    return NextResponse.json({ received: true, eventId: event.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Stripe Webhook] Processing error: ${message}`);

    // Track current attempt count (Story 17.5)
    const currentAttempts = existingEvent.length > 0 ? (existingEvent[0].attempts || 0) + 1 : 1;

    // Update event log with error (AC7, AC8)
    try {
      await db
        .update(webhookLogs)
        .set({
          status: 'failed',
          errorMessage: message,
          attempts: currentAttempts,
        })
        .where(eq(webhookLogs.eventId, event.id));
    } catch (logError) {
      console.error(
        `[Stripe Webhook] Failed to update error log: ${logError instanceof Error ? logError.message : 'Unknown error'}`
      );
    }

    // Send alert if failures exceed threshold (Story 17.5 - AC3)
    if (currentAttempts >= ALERT_THRESHOLD) {
      const sessionId = event.type === 'checkout.session.completed'
        ? (event.data.object as Stripe.Checkout.Session).id
        : undefined;
      const userId = event.type === 'checkout.session.completed'
        ? (event.data.object as Stripe.Checkout.Session).metadata?.userId
        : undefined;

      sendWebhookFailureAlert({
        eventId: event.id,
        eventType: event.type,
        retryCount: currentAttempts,
        error: message,
        sessionId,
        userId,
      }).catch((alertError) => {
        console.error('[Stripe Webhook] Failed to send failure alert:', alertError);
      });
    }

    // Return 500 to trigger Stripe retry (AC7)
    return NextResponse.json(
      { received: false, error: 'Processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Disable automatic body parsing
 *
 * Stripe requires the raw request body for signature verification.
 * Next.js App Router handles this automatically, but this config
 * is included for documentation purposes.
 */
export const dynamic = 'force-dynamic';
