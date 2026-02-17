/**
 * Admin Invoice Detail API Route
 *
 * GET /api/admin/invoices/[id] - Get single invoice request
 *
 * Story 21.2: Invoice Request Management
 * Task 2: Create invoice management API endpoints (AC: 1)
 * Covers: AC1 (view invoice details)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin-auth';
import { db } from '@/lib/db';
import { invoiceRequests, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * GET /api/admin/invoices/[id]
 *
 * Returns a single invoice request with user details.
 */
export async function GET(
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
    const [invoice] = await db
      .select({
        id: invoiceRequests.id,
        userId: invoiceRequests.userId,
        companyName: invoiceRequests.companyName,
        billingAddress: invoiceRequests.billingAddress,
        poNumber: invoiceRequests.poNumber,
        contactEmail: invoiceRequests.contactEmail,
        status: invoiceRequests.status,
        adminNotes: invoiceRequests.adminNotes,
        invoiceNumber: invoiceRequests.invoiceNumber,
        cancellationReason: invoiceRequests.cancellationReason,
        createdAt: invoiceRequests.createdAt,
        processedAt: invoiceRequests.processedAt,
        userEmail: users.email,
        userName: users.name,
      })
      .from(invoiceRequests)
      .leftJoin(users, eq(invoiceRequests.userId, users.id))
      .where(eq(invoiceRequests.id, id))
      .limit(1);

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice request not found' }, { status: 404 });
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error('[Admin Invoices] Error fetching invoice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice request' },
      { status: 500 }
    );
  }
}
