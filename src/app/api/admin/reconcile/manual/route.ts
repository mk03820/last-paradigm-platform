/**
 * Admin Manual Reconciliation API Route
 *
 * POST /api/admin/reconcile/manual - Manually reconcile a Stripe session
 *
 * Story 21.4: Webhook Monitoring & Recovery
 * Task 3: Create manual reconciliation API (AC: 3)
 * Covers: AC3 (verify Stripe session, grant access manually)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/admin-auth';
import { logAdminAction, ADMIN_ACTIONS, ENTITY_TYPES } from '@/lib/admin/audit-logger';
import { stripe } from '@/lib/stripe/client';
import { db } from '@/lib/db';
import { purchases, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { inngest } from '@/lib/inngest/client';

/**
 * Manual reconciliation request schema
 */
const reconcileSchema = z.object({
  stripeSessionId: z.string().min(1, 'Stripe session ID is required'),
  userEmail: z.string().email('Valid email is required'),
  confirmed: z.boolean().optional().default(false),
});

/**
 * POST /api/admin/reconcile/manual
 *
 * Manually reconciles a Stripe session by verifying it and granting access.
 */
export async function POST(request: NextRequest) {
  // Verify admin authentication
  const authResult = await requireAdmin();

  if (!authResult.authenticated) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = reconcileSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { stripeSessionId, userEmail, confirmed } = validationResult.data;

    // Verify Stripe session exists
    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(stripeSessionId);
    } catch (error) {
      return NextResponse.json(
        { error: 'Stripe session not found' },
        { status: 404 }
      );
    }

    // Check if session is completed
    if (session.status !== 'complete') {
      return NextResponse.json(
        { error: `Session is not complete (status: ${session.status})` },
        { status: 400 }
      );
    }

    // Check if already processed
    const existingPurchase = await db
      .select({ id: purchases.id })
      .from(purchases)
      .where(eq(purchases.stripeSessionId, stripeSessionId))
      .limit(1);

    if (existingPurchase.length > 0) {
      return NextResponse.json(
        { error: 'Session already reconciled' },
        { status: 400 }
      );
    }

    // Find or verify user
    const [user] = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.email, userEmail.toLowerCase()))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found with provided email' },
        { status: 404 }
      );
    }

    // If not confirmed, return verification info
    if (!confirmed) {
      return NextResponse.json({
        requiresConfirmation: true,
        session: {
          id: session.id,
          amount: session.amount_total,
          currency: session.currency,
          customerEmail: session.customer_email,
          created: new Date(session.created * 1000).toISOString(),
          paymentStatus: session.payment_status,
        },
        user: {
          id: user.id,
          email: user.email,
        },
      });
    }

    // Create purchase record
    const [purchase] = await db
      .insert(purchases)
      .values({
        userId: user.id,
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
        metadata: {
          manualReconciliation: true,
          reconciledBy: authResult.admin.sub,
          reconciledAt: new Date().toISOString(),
          ...session.metadata,
        },
        completedAt: new Date(),
      })
      .returning({ id: purchases.id });

    // Update user access
    await db
      .update(users)
      .set({
        hasPb2Access: true,
        pb2PurchasedAt: new Date(),
        purchaseStatus: 'completed',
        purchasedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    // Trigger toolkit generation
    try {
      await inngest.send({
        name: 'toolkit/generate',
        data: {
          purchaseId: purchase.id,
          userId: user.id,
        },
      });
    } catch (error) {
      console.error('[Manual Reconcile] Failed to trigger toolkit generation:', error);
    }

    // Log action
    await logAdminAction({
      adminId: authResult.admin.sub,
      action: ADMIN_ACTIONS.MANUAL_RECONCILE,
      entityType: ENTITY_TYPES.PURCHASE,
      entityId: purchase.id,
      details: {
        stripeSessionId,
        userId: user.id,
        userEmail: user.email,
        amount: session.amount_total,
      },
      ipAddress:
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      purchaseId: purchase.id,
      message: 'Manual reconciliation completed successfully',
    });
  } catch (error) {
    console.error('[Manual Reconcile] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process manual reconciliation' },
      { status: 500 }
    );
  }
}
