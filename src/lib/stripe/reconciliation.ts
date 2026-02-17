/**
 * Stripe Reconciliation Service
 *
 * Compares Stripe checkout sessions with database purchases
 * to identify and process any missing records.
 *
 * Story 17.5: Webhook Retry & Recovery
 * Task 4: Create Stripe reconciliation service (AC: 7)
 * Covers: AC7 (identify and process missing purchases)
 */

import { stripe } from './client';
import { db } from '@/lib/db';
import { purchases, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type Stripe from 'stripe';

/**
 * Reconciliation result summary
 */
export interface ReconciliationResult {
  /** Total sessions checked */
  total: number;
  /** Sessions already in database */
  matched: number;
  /** Sessions missing from database */
  missing: number;
  /** Successfully processed missing sessions */
  processed: number;
  /** Errors encountered during reconciliation */
  errors: string[];
  /** Details of processed sessions */
  processedSessions: Array<{
    sessionId: string;
    userId: string;
    amount: number;
  }>;
}

/**
 * Missing purchase information
 */
export interface MissingPurchase {
  sessionId: string;
  email: string | null;
  amount: number | null;
  created: Date;
  paymentStatus: string | null;
  metadata: Stripe.Metadata | null;
}

/**
 * Default lookback period (7 days)
 */
const DEFAULT_LOOKBACK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Reconcile Stripe payments with database
 *
 * Fetches completed checkout sessions from Stripe and compares
 * against the database. Processes any missing purchases.
 *
 * @param startDate - Start date for session lookup (default: 7 days ago)
 * @param autoProcess - Whether to automatically process missing purchases (default: false)
 * @returns Reconciliation result summary
 */
export async function reconcileStripePayments(
  startDate: Date = new Date(Date.now() - DEFAULT_LOOKBACK_MS),
  autoProcess: boolean = false
): Promise<ReconciliationResult> {
  console.log(
    `[Reconciliation] Starting reconciliation from ${startDate.toISOString()}`
  );

  const result: ReconciliationResult = {
    total: 0,
    matched: 0,
    missing: 0,
    processed: 0,
    errors: [],
    processedSessions: [],
  };

  try {
    // Fetch completed checkout sessions from Stripe
    const sessions = await stripe.checkout.sessions.list({
      created: {
        gte: Math.floor(startDate.getTime() / 1000),
      },
      status: 'complete',
      limit: 100,
      expand: ['data.customer'],
    });

    result.total = sessions.data.length;
    console.log(`[Reconciliation] Found ${result.total} completed sessions in Stripe`);

    for (const session of sessions.data) {
      // Check if purchase exists in database
      const existingPurchase = await db
        .select({ id: purchases.id })
        .from(purchases)
        .where(eq(purchases.stripeSessionId, session.id))
        .limit(1);

      if (existingPurchase.length > 0) {
        result.matched++;
        continue;
      }

      // Missing purchase found
      result.missing++;
      console.log(`[Reconciliation] Missing purchase for session: ${session.id}`);

      if (!autoProcess) {
        continue;
      }

      // Attempt to process the missing purchase
      try {
        const userId = await resolveUserId(session);

        if (!userId) {
          result.errors.push(
            `Session ${session.id}: Cannot identify user (no userId in metadata, email: ${session.customer_email})`
          );
          continue;
        }

        // Create the purchase record
        await db.insert(purchases).values({
          userId,
          stripeSessionId: session.id,
          stripePaymentIntentId:
            typeof session.payment_intent === 'string'
              ? session.payment_intent
              : session.payment_intent?.id || null,
          stripeCustomerId:
            typeof session.customer === 'string'
              ? session.customer
              : session.customer?.id || null,
          amount: session.amount_total || 250000,
          currency: session.currency || 'usd',
          status: 'completed',
          metadata: session.metadata || {},
          completedAt: new Date(),
        });

        // Update user access
        await db
          .update(users)
          .set({
            hasPb2Access: true,
            pb2PurchasedAt: new Date(),
            purchaseStatus: 'completed',
            purchasedAt: new Date(),
          })
          .where(eq(users.id, userId));

        result.processed++;
        result.processedSessions.push({
          sessionId: session.id,
          userId,
          amount: session.amount_total || 250000,
        });

        console.log(
          `[Reconciliation] Processed missing purchase for user ${userId}`
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        result.errors.push(`Session ${session.id}: ${message}`);
        console.error(`[Reconciliation] Error processing session ${session.id}:`, error);
      }
    }

    console.log(
      `[Reconciliation] Complete: ${result.matched} matched, ${result.missing} missing, ${result.processed} processed, ${result.errors.length} errors`
    );

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Reconciliation] Fatal error:', error);
    result.errors.push(`Fatal error: ${message}`);
    return result;
  }
}

/**
 * Find missing purchases without auto-processing
 *
 * Returns a list of Stripe sessions that don't have corresponding
 * database records, for manual review.
 *
 * @param startDate - Start date for session lookup (default: 7 days ago)
 * @returns Array of missing purchase details
 */
export async function findMissingPurchases(
  startDate: Date = new Date(Date.now() - DEFAULT_LOOKBACK_MS)
): Promise<MissingPurchase[]> {
  console.log(
    `[Reconciliation] Finding missing purchases from ${startDate.toISOString()}`
  );

  const missing: MissingPurchase[] = [];

  try {
    const sessions = await stripe.checkout.sessions.list({
      created: {
        gte: Math.floor(startDate.getTime() / 1000),
      },
      status: 'complete',
      limit: 100,
    });

    for (const session of sessions.data) {
      const exists = await db
        .select({ id: purchases.id })
        .from(purchases)
        .where(eq(purchases.stripeSessionId, session.id))
        .limit(1);

      if (exists.length === 0) {
        missing.push({
          sessionId: session.id,
          email: session.customer_email,
          amount: session.amount_total,
          created: new Date(session.created * 1000),
          paymentStatus: session.payment_status,
          metadata: session.metadata,
        });
      }
    }

    console.log(`[Reconciliation] Found ${missing.length} missing purchases`);
    return missing;
  } catch (error) {
    console.error('[Reconciliation] Error finding missing purchases:', error);
    return missing;
  }
}

/**
 * Resolve user ID from checkout session
 *
 * First checks metadata, then falls back to email lookup.
 *
 * @param session - Stripe checkout session
 * @returns User ID or null if not found
 */
async function resolveUserId(
  session: Stripe.Checkout.Session
): Promise<string | null> {
  // First try metadata
  const metadataUserId = session.metadata?.userId;
  if (metadataUserId) {
    // Verify user exists
    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, metadataUserId))
      .limit(1);

    if (user.length > 0) {
      return metadataUserId;
    }
    console.warn(
      `[Reconciliation] User ID ${metadataUserId} from metadata not found in database`
    );
  }

  // Fall back to email lookup
  if (session.customer_email) {
    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, session.customer_email))
      .limit(1);

    if (user.length > 0) {
      return user[0].id;
    }
  }

  return null;
}
