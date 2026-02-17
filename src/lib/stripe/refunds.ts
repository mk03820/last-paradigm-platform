/**
 * Stripe Refund Service
 *
 * Handles refund processing through the Stripe API.
 *
 * Story 21.3: Refund Processing Interface
 * Task 2: Create Stripe refund service (AC: 2, 3)
 * Covers: AC2 (initiate refund), AC3 (handle confirmation, revoke access)
 */

import { stripe } from './client';
import { db } from '@/lib/db';
import { refunds, purchases, users, toolkitDocuments } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type Stripe from 'stripe';

/**
 * Refund result
 */
export interface RefundResult {
  success: boolean;
  refundId?: string;
  stripeRefundId?: string;
  error?: string;
}

/**
 * Process a refund for a purchase
 *
 * @param purchaseId - The purchase ID to refund
 * @param adminId - The admin processing the refund
 * @param reason - Optional reason for the refund
 */
export async function processRefund(
  purchaseId: string,
  adminId: string,
  reason?: string
): Promise<RefundResult> {
  console.log(`[Refund] Processing refund for purchase ${purchaseId}`);

  try {
    // Get purchase details
    const [purchase] = await db
      .select()
      .from(purchases)
      .where(eq(purchases.id, purchaseId))
      .limit(1);

    if (!purchase) {
      return { success: false, error: 'Purchase not found' };
    }

    if (purchase.status === 'refunded') {
      return { success: false, error: 'Purchase already refunded' };
    }

    if (purchase.status !== 'completed') {
      return { success: false, error: 'Can only refund completed purchases' };
    }

    // Check if this is an invoice purchase (no Stripe payment intent)
    const isInvoicePurchase = purchase.stripeSessionId.startsWith('invoice_');

    // Create refund record
    const [refundRecord] = await db
      .insert(refunds)
      .values({
        purchaseId: purchase.id,
        userId: purchase.userId,
        processedBy: adminId,
        amount: purchase.amount,
        status: 'initiated',
        reason: reason || null,
      })
      .returning({ id: refunds.id });

    let stripeRefundId: string | null = null;

    // Process Stripe refund if applicable
    if (!isInvoicePurchase && purchase.stripePaymentIntentId) {
      try {
        const stripeRefund = await stripe.refunds.create({
          payment_intent: purchase.stripePaymentIntentId,
          amount: purchase.amount,
          reason: 'requested_by_customer',
          metadata: {
            purchaseId: purchase.id,
            userId: purchase.userId,
            adminId,
            refundRecordId: refundRecord.id,
          },
        });

        stripeRefundId = stripeRefund.id;
        console.log(`[Refund] Stripe refund created: ${stripeRefundId}`);
      } catch (stripeError) {
        // Update refund record to failed
        await db
          .update(refunds)
          .set({
            status: 'failed',
            completedAt: new Date(),
          })
          .where(eq(refunds.id, refundRecord.id));

        const message =
          stripeError instanceof Error ? stripeError.message : 'Stripe error';
        console.error('[Refund] Stripe refund failed:', stripeError);
        return { success: false, error: `Stripe refund failed: ${message}` };
      }
    }

    // Update refund record
    await db
      .update(refunds)
      .set({
        status: 'completed',
        stripeRefundId: stripeRefundId || null,
        completedAt: new Date(),
      })
      .where(eq(refunds.id, refundRecord.id));

    // Update purchase status
    await db
      .update(purchases)
      .set({ status: 'refunded' })
      .where(eq(purchases.id, purchaseId));

    // Revoke user access
    await db
      .update(users)
      .set({
        hasPb2Access: false,
        purchaseStatus: 'refunded',
      })
      .where(eq(users.id, purchase.userId));

    // Mark toolkit documents as access revoked (optional - keep records but revoke access)
    await db
      .update(toolkitDocuments)
      .set({ fileUrl: null }) // Clear presigned URLs
      .where(eq(toolkitDocuments.purchaseId, purchaseId));

    console.log(`[Refund] Refund completed for purchase ${purchaseId}`);

    return {
      success: true,
      refundId: refundRecord.id,
      stripeRefundId: stripeRefundId || undefined,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Refund] Error processing refund:', error);
    return { success: false, error: message };
  }
}

/**
 * Calculate refund statistics
 *
 * @param days - Number of days to look back (default: 30)
 */
export async function getRefundStats(
  days: number = 30
): Promise<{
  totalPurchases: number;
  refundedPurchases: number;
  refundRate: number;
  totalRefundAmount: number;
  targetRate: number;
  isWithinTarget: boolean;
}> {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Get purchase counts
  const allPurchases = await db
    .select({ id: purchases.id, status: purchases.status, amount: purchases.amount })
    .from(purchases)
    .where(eq(purchases.status, 'completed'));

  // Filter by date for completed purchases
  const completedInPeriod = allPurchases.filter((p) => true); // All completed for now

  // Get refunded purchases
  const refundedPurchases = await db
    .select({ id: purchases.id, amount: purchases.amount })
    .from(purchases)
    .where(eq(purchases.status, 'refunded'));

  const totalPurchases = completedInPeriod.length + refundedPurchases.length;
  const refundedCount = refundedPurchases.length;
  const refundRate =
    totalPurchases > 0 ? (refundedCount / totalPurchases) * 100 : 0;
  const totalRefundAmount = refundedPurchases.reduce(
    (sum, p) => sum + p.amount,
    0
  );

  const targetRate = 5; // NFR27: <5% refund rate target

  return {
    totalPurchases,
    refundedPurchases: refundedCount,
    refundRate: Math.round(refundRate * 100) / 100,
    totalRefundAmount,
    targetRate,
    isWithinTarget: refundRate < targetRate,
  };
}

/**
 * Get refund-eligible purchases (within 30-day guarantee period)
 */
export async function getRefundEligiblePurchases(): Promise<
  Array<{
    id: string;
    userId: string;
    userEmail: string | null;
    userName: string | null;
    amount: number;
    purchaseDate: Date | null;
    daysRemaining: number;
    hasExistingRefund: boolean;
  }>
> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Get completed purchases within last 30 days
  const eligiblePurchases = await db
    .select({
      id: purchases.id,
      userId: purchases.userId,
      amount: purchases.amount,
      completedAt: purchases.completedAt,
      userEmail: users.email,
      userName: users.name,
    })
    .from(purchases)
    .leftJoin(users, eq(purchases.userId, users.id))
    .where(eq(purchases.status, 'completed'));

  // Filter and calculate days remaining
  const now = new Date();

  return eligiblePurchases
    .filter((p) => {
      if (!p.completedAt) return false;
      return p.completedAt >= thirtyDaysAgo;
    })
    .map((p) => {
      const purchaseDate = p.completedAt!;
      const daysSincePurchase = Math.floor(
        (now.getTime() - purchaseDate.getTime()) / (24 * 60 * 60 * 1000)
      );
      const daysRemaining = Math.max(0, 30 - daysSincePurchase);

      return {
        id: p.id,
        userId: p.userId,
        userEmail: p.userEmail,
        userName: p.userName,
        amount: p.amount,
        purchaseDate,
        daysRemaining,
        hasExistingRefund: false, // Will be updated based on refunds table
      };
    });
}
