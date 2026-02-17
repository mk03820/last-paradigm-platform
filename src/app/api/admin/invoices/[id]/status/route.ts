/**
 * Admin Invoice Status Update API Route
 *
 * POST /api/admin/invoices/[id]/status - Update invoice status
 *
 * Story 21.2: Invoice Request Management
 * Task 2-3: Create invoice management API endpoints (AC: 2, 3, 4)
 * Covers: AC2 (Invoice Sent), AC3 (Paid), AC4 (Cancelled)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/admin-auth';
import { logAdminAction, ADMIN_ACTIONS, ENTITY_TYPES } from '@/lib/admin/audit-logger';
import { db } from '@/lib/db';
import { invoiceRequests, users, purchases } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { inngest } from '@/lib/inngest/client';

/**
 * Status update validation schemas
 */
const invoiceSentSchema = z.object({
  status: z.literal('invoice_sent'),
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  adminNotes: z.string().optional(),
});

const paidSchema = z.object({
  status: z.literal('paid'),
  adminNotes: z.string().optional(),
});

const cancelledSchema = z.object({
  status: z.literal('cancelled'),
  cancellationReason: z.string().min(1, 'Cancellation reason is required'),
  sendNotification: z.boolean().optional().default(false),
  adminNotes: z.string().optional(),
});

const statusUpdateSchema = z.discriminatedUnion('status', [
  invoiceSentSchema,
  paidSchema,
  cancelledSchema,
]);

/**
 * POST /api/admin/invoices/[id]/status
 *
 * Updates the status of an invoice request.
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
    // Parse and validate request body
    const body = await request.json();
    const validationResult = statusUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Get current invoice request
    const [invoice] = await db
      .select()
      .from(invoiceRequests)
      .where(eq(invoiceRequests.id, id))
      .limit(1);

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice request not found' }, { status: 404 });
    }

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      pending: ['invoice_sent', 'cancelled'],
      invoice_sent: ['paid', 'cancelled'],
      paid: [], // Terminal state
      cancelled: [], // Terminal state
    };

    if (!validTransitions[invoice.status]?.includes(data.status)) {
      return NextResponse.json(
        {
          error: `Invalid status transition from '${invoice.status}' to '${data.status}'`,
        },
        { status: 400 }
      );
    }

    // Get user info for notifications
    const [user] = await db
      .select({ email: users.email, name: users.name, id: users.id })
      .from(users)
      .where(eq(users.id, invoice.userId))
      .limit(1);

    // Perform status update
    const updateData: Record<string, unknown> = {
      status: data.status,
      processedAt: new Date(),
      processedBy: authResult.admin.sub,
    };

    if ('adminNotes' in data && data.adminNotes) {
      updateData.adminNotes = data.adminNotes;
    }

    if (data.status === 'invoice_sent') {
      updateData.invoiceNumber = data.invoiceNumber;

      // Send invoice notification email
      // TODO: Implement email notification
      console.log(
        `[Invoice] Sending invoice notification to ${user?.email} with invoice #${data.invoiceNumber}`
      );
    }

    if (data.status === 'paid') {
      // Grant access to user
      await db
        .update(users)
        .set({
          hasPb2Access: true,
          pb2PurchasedAt: new Date(),
          purchaseStatus: 'completed',
          purchasedAt: new Date(),
        })
        .where(eq(users.id, invoice.userId));

      // Create purchase record
      const [purchase] = await db
        .insert(purchases)
        .values({
          userId: invoice.userId,
          stripeSessionId: `invoice_${invoice.id}`, // Unique identifier for invoice purchases
          amount: 250000, // $2,500 in cents
          currency: 'usd',
          status: 'completed',
          metadata: {
            source: 'invoice',
            invoiceRequestId: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
          },
          completedAt: new Date(),
        })
        .returning({ id: purchases.id });

      // Trigger toolkit generation
      try {
        await inngest.send({
          name: 'toolkit/generate',
          data: {
            purchaseId: purchase.id,
            userId: invoice.userId,
          },
        });
      } catch (error) {
        console.error('[Invoice] Failed to trigger toolkit generation:', error);
      }

      // Send purchase confirmation email
      // TODO: Implement email notification
      console.log(
        `[Invoice] Sending purchase confirmation to ${user?.email}`
      );
    }

    if (data.status === 'cancelled') {
      updateData.cancellationReason = data.cancellationReason;

      if (data.sendNotification) {
        // Send cancellation notification email
        // TODO: Implement email notification
        console.log(
          `[Invoice] Sending cancellation notification to ${user?.email}`
        );
      }
    }

    // Update invoice request
    await db
      .update(invoiceRequests)
      .set(updateData)
      .where(eq(invoiceRequests.id, id));

    // Log action
    const actionMap: Record<string, string> = {
      invoice_sent: ADMIN_ACTIONS.INVOICE_SENT,
      paid: ADMIN_ACTIONS.INVOICE_PAID,
      cancelled: ADMIN_ACTIONS.INVOICE_CANCELLED,
    };

    await logAdminAction({
      adminId: authResult.admin.sub,
      action: actionMap[data.status] || ADMIN_ACTIONS.INVOICE_STATUS_UPDATE,
      entityType: ENTITY_TYPES.INVOICE_REQUEST,
      entityId: id,
      details: {
        previousStatus: invoice.status,
        newStatus: data.status,
        userId: invoice.userId,
        companyName: invoice.companyName,
        ...('invoiceNumber' in data ? { invoiceNumber: data.invoiceNumber } : {}),
        ...('cancellationReason' in data
          ? { cancellationReason: data.cancellationReason }
          : {}),
      },
      ipAddress:
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      message: `Invoice request status updated to '${data.status}'`,
    });
  } catch (error) {
    console.error('[Admin Invoices] Error updating status:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice status' },
      { status: 500 }
    );
  }
}
