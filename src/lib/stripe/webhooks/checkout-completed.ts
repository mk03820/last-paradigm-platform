/**
 * Checkout Session Completed Handler
 *
 * Processes successful Stripe checkout sessions, creating purchase records
 * and granting user access to Playbook 2.
 *
 * Story 17.4: Stripe Webhook Handler
 * Task 3: Implement checkout.session.completed handler
 * Covers: AC2, AC3, AC4, AC6
 *
 * Story 18.1: Document Generation Job Infrastructure
 * Task 6: Integrate with purchase webhook - trigger toolkit generation
 * Covers: AC1 (toolkit/generate event triggered on purchase)
 *
 * Story 20.2: Purchase Confirmation Email
 * Task 3: Integrate with Stripe webhook (AC: 1)
 * Covers: FR53 (Purchase confirmation email)
 */

import Stripe from 'stripe';
import { db } from '@/lib/db';
import { users, purchases, diagnosticResults } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { inngest } from '@/lib/inngest/client';
import { sendPurchaseConfirmation } from '@/lib/email/send-purchase-confirmation';

/**
 * Result type for checkout completed handler
 */
export interface CheckoutCompletedResult {
  success: boolean;
  userId?: string;
  purchaseId?: string;
  error?: string;
  alreadyProcessed?: boolean;
}

/**
 * Handles checkout.session.completed webhook events
 *
 * Creates purchase record and updates user access in a transaction.
 * Uses upsert pattern for idempotency (AC6).
 *
 * @param session - Stripe Checkout Session object
 * @returns CheckoutCompletedResult with success/failure details
 */
export async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session
): Promise<CheckoutCompletedResult> {
  console.log(`[Checkout Completed] Processing session: ${session.id}`);

  // Extract user identification from metadata (AC2)
  const userId = session.metadata?.userId;
  const userEmail = session.metadata?.userEmail;

  // Try to find user by ID or email
  let resolvedUserId = userId;

  if (!resolvedUserId) {
    // Fallback: Try to find user by email from session or metadata
    const emailToCheck = session.customer_email || userEmail;

    if (emailToCheck) {
      console.log(`[Checkout Completed] Looking up user by email: ${emailToCheck}`);
      const user = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, emailToCheck))
        .limit(1);

      if (user.length > 0) {
        resolvedUserId = user[0].id;
        console.log(`[Checkout Completed] Found user by email: ${resolvedUserId}`);
      }
    }
  }

  if (!resolvedUserId) {
    console.error(
      `[Checkout Completed] Missing userId in metadata for session: ${session.id}`
    );
    throw new Error('Missing user identification in checkout session');
  }

  // Check if purchase already exists (idempotency check)
  const existingPurchase = await db
    .select({ id: purchases.id })
    .from(purchases)
    .where(eq(purchases.stripeSessionId, session.id))
    .limit(1);

  if (existingPurchase.length > 0) {
    console.log(
      `[Checkout Completed] Purchase already exists for session: ${session.id}`
    );
    return {
      success: true,
      userId: resolvedUserId,
      purchaseId: existingPurchase[0].id,
      alreadyProcessed: true,
    };
  }

  // Process the purchase in a transaction (AC3, AC4)
  const result = await processSuccessfulPurchase(session, resolvedUserId);

  return result;
}

/**
 * Processes a successful purchase with transaction safety
 *
 * @param session - Stripe Checkout Session
 * @param userId - User ID to associate purchase with
 * @returns CheckoutCompletedResult
 */
async function processSuccessfulPurchase(
  session: Stripe.Checkout.Session,
  userId: string
): Promise<CheckoutCompletedResult> {
  const now = new Date();

  try {
    // Use a transaction for data consistency
    const result = await db.transaction(async (tx) => {
      // Create purchase record (AC3)
      const [newPurchase] = await tx
        .insert(purchases)
        .values({
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
          amount: session.amount_total || 250000, // $2,500 in cents fallback
          currency: session.currency || 'usd',
          status: 'completed',
          metadata: session.metadata as Record<string, unknown>,
          completedAt: now,
        })
        .returning({ id: purchases.id });

      // Update user access (AC4)
      await tx
        .update(users)
        .set({
          hasPb2Access: true,
          pb2PurchasedAt: now,
          purchaseStatus: 'completed',
          purchasedAt: now,
          stripeCustomerId:
            typeof session.customer === 'string'
              ? session.customer
              : session.customer?.id || undefined,
          updatedAt: now,
        })
        .where(eq(users.id, userId));

      return newPurchase;
    });

    console.log(
      `[Checkout Completed] Successfully processed purchase for user: ${userId}, purchaseId: ${result.id}`
    );

    // Trigger toolkit generation (Story 18.1 - Task 6)
    await triggerToolkitGeneration(userId, result.id);

    // Send purchase confirmation email (Story 20.2 - Task 3)
    await sendPurchaseConfirmationEmail(
      userId,
      result.id,
      session.amount_total || 250000,
      session.customer_email || session.metadata?.userEmail
    );

    return {
      success: true,
      userId,
      purchaseId: result.id,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Checkout Completed] Transaction failed: ${message}`);

    // Check if this is a unique constraint violation (duplicate)
    if (
      message.includes('unique') ||
      message.includes('duplicate') ||
      message.includes('constraint')
    ) {
      console.log(
        `[Checkout Completed] Duplicate detected, returning success for idempotency`
      );
      return {
        success: true,
        userId,
        alreadyProcessed: true,
      };
    }

    throw error;
  }
}

/**
 * Triggers toolkit generation after successful purchase
 *
 * Fetches user's diagnostic data and sends toolkit/generate event to Inngest.
 * Handles edge case where diagnostic data is missing (should not happen in normal flow).
 *
 * Story 18.1: Document Generation Job Infrastructure
 * Task 6.2, 6.3, 6.4, 6.5
 *
 * @param userId - User ID for the purchase
 * @param purchaseId - Purchase ID to associate with toolkit
 */
async function triggerToolkitGeneration(
  userId: string,
  purchaseId: string
): Promise<void> {
  try {
    // Fetch user's most recent diagnostic results (Task 6.4)
    const diagnosticData = await db
      .select({ toolResults: diagnosticResults.toolResults })
      .from(diagnosticResults)
      .where(eq(diagnosticResults.userId, userId))
      .orderBy(desc(diagnosticResults.completedAt))
      .limit(1);

    // Handle case where diagnostic data is missing (Task 6.5)
    if (diagnosticData.length === 0) {
      console.warn(
        `[Checkout Completed] No diagnostic data found for user: ${userId}. Toolkit generation will proceed with empty data.`
      );
    }

    const toolResults = diagnosticData.length > 0 ? diagnosticData[0].toolResults : {};

    // Send toolkit/generate event via Inngest (Task 6.2, 6.3)
    await inngest.send({
      name: 'toolkit/generate',
      data: {
        userId,
        purchaseId,
        diagnosticData: toolResults,
      },
    });

    console.log(
      `[Checkout Completed] Triggered toolkit generation for user: ${userId}, purchaseId: ${purchaseId}`
    );
  } catch (error) {
    // Log error but don't fail the webhook - toolkit generation can be retried
    console.error(
      `[Checkout Completed] Failed to trigger toolkit generation: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
    // Note: In production, this could send an alert or create a recovery job
    // For now, we log and continue - the purchase is still successful
  }
}

/**
 * Sends purchase confirmation email after successful purchase
 *
 * Story 20.2: Purchase Confirmation Email
 * Task 3: Integrate with Stripe webhook (AC: 1)
 *
 * @param userId - User ID for the purchase
 * @param purchaseId - Purchase ID for reference
 * @param amountCents - Purchase amount in cents
 * @param email - User's email address
 */
async function sendPurchaseConfirmationEmail(
  userId: string,
  purchaseId: string,
  amountCents: number,
  email?: string | null
): Promise<void> {
  try {
    // Get user details if email not provided
    let userEmail = email;
    let userName: string | null = null;

    if (!userEmail) {
      const user = await db
        .select({ email: users.email, name: users.name })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (user.length > 0) {
        userEmail = user[0].email;
        userName = user[0].name;
      }
    }

    if (!userEmail) {
      console.error(
        `[Checkout Completed] Cannot send confirmation email - no email for user: ${userId}`
      );
      return;
    }

    // Send the confirmation email
    const result = await sendPurchaseConfirmation({
      userName,
      userEmail,
      amountCents,
      purchaseId,
      userId,
    });

    if (result.success) {
      console.log(
        `[Checkout Completed] Purchase confirmation email sent to ${userEmail}`
      );
    } else {
      console.error(
        `[Checkout Completed] Failed to send confirmation email: ${result.error}`
      );
    }
  } catch (error) {
    // Log error but don't fail the webhook - email can be manually resent
    console.error(
      `[Checkout Completed] Error sending confirmation email: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}
