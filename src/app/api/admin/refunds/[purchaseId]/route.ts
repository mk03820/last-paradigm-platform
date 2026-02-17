/**
 * Admin Process Refund API Route
 *
 * POST /api/admin/refunds/[purchaseId] - Process a refund
 *
 * Story 21.3: Refund Processing Interface
 * Task 3: Create refund API endpoints (AC: 2, 3, 4)
 * Covers: AC2 (initiate refund), AC3 (update status, revoke access), AC4 (logging)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/admin-auth';
import { logAdminAction, ADMIN_ACTIONS, ENTITY_TYPES } from '@/lib/admin/audit-logger';
import { processRefund } from '@/lib/stripe/refunds';
import { db } from '@/lib/db';
import { purchases, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Refund request validation schema
 */
const refundSchema = z.object({
  reason: z.string().optional(),
  confirmed: z.boolean().optional().default(false),
});

/**
 * POST /api/admin/refunds/[purchaseId]
 *
 * Processes a refund for the specified purchase.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ purchaseId: string }> }
) {
  // Verify admin authentication
  const authResult = await requireAdmin();

  if (!authResult.authenticated) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  const { purchaseId } = await params;

  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = refundSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { reason, confirmed } = validationResult.data;

    if (!confirmed) {
      return NextResponse.json(
        { error: 'Refund not confirmed' },
        { status: 400 }
      );
    }

    // Get purchase details for logging
    const [purchase] = await db
      .select({
        id: purchases.id,
        userId: purchases.userId,
        amount: purchases.amount,
        userEmail: users.email,
      })
      .from(purchases)
      .leftJoin(users, eq(purchases.userId, users.id))
      .where(eq(purchases.id, purchaseId))
      .limit(1);

    if (!purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    // Process the refund
    const result = await processRefund(
      purchaseId,
      authResult.admin.sub,
      reason
    );

    if (!result.success) {
      // Log failed attempt
      await logAdminAction({
        adminId: authResult.admin.sub,
        action: ADMIN_ACTIONS.REFUND_FAILED,
        entityType: ENTITY_TYPES.REFUND,
        entityId: purchaseId,
        details: {
          purchaseId,
          userId: purchase.userId,
          amount: purchase.amount,
          error: result.error,
        },
        ipAddress:
          request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      });

      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Log successful refund
    await logAdminAction({
      adminId: authResult.admin.sub,
      action: ADMIN_ACTIONS.REFUND_COMPLETED,
      entityType: ENTITY_TYPES.REFUND,
      entityId: result.refundId,
      details: {
        purchaseId,
        userId: purchase.userId,
        userEmail: purchase.userEmail,
        amount: purchase.amount,
        stripeRefundId: result.stripeRefundId,
        reason,
      },
      ipAddress:
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    // TODO: Send refund confirmation email
    console.log(`[Refund] Would send confirmation email to ${purchase.userEmail}`);

    return NextResponse.json({
      success: true,
      refundId: result.refundId,
      stripeRefundId: result.stripeRefundId,
      message: 'Refund processed successfully',
    });
  } catch (error) {
    console.error('[Admin Refunds] Error processing refund:', error);
    return NextResponse.json(
      { error: 'Failed to process refund' },
      { status: 500 }
    );
  }
}
