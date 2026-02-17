/**
 * Admin Invoices List API Route
 *
 * GET /api/admin/invoices - List invoice requests with filtering
 *
 * Story 21.2: Invoice Request Management
 * Task 2: Create invoice management API endpoints (AC: 1, 5)
 * Covers: AC1 (list pending invoice requests), AC5 (sorting and filtering)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin-auth';
import { logAdminAction, ADMIN_ACTIONS, ENTITY_TYPES } from '@/lib/admin/audit-logger';
import { db } from '@/lib/db';
import { invoiceRequests, users } from '@/lib/db/schema';
import { desc, eq, or, ilike, sql, asc } from 'drizzle-orm';

/**
 * Invoice request with user details
 */
interface InvoiceRequestWithUser {
  id: string;
  userId: string;
  companyName: string;
  billingAddress: string;
  poNumber: string | null;
  contactEmail: string | null;
  status: string;
  adminNotes: string | null;
  invoiceNumber: string | null;
  cancellationReason: string | null;
  createdAt: Date | null;
  processedAt: Date | null;
  userEmail: string | null;
  userName: string | null;
}

/**
 * GET /api/admin/invoices
 *
 * Returns paginated list of invoice requests with filtering.
 *
 * Query params:
 * - status: Filter by status (pending, invoice_sent, paid, cancelled)
 * - search: Search by company name or email
 * - sortBy: Sort field (createdAt, companyName, status)
 * - sortOrder: Sort direction (asc, desc)
 * - limit: Number of records (default 50)
 * - offset: Pagination offset (default 0)
 */
export async function GET(request: NextRequest) {
  // Verify admin authentication
  const authResult = await requireAdmin();

  if (!authResult.authenticated) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const search = searchParams.get('search');
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    // Build query with joins
    let query = db
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
      .limit(limit)
      .offset(offset);

    // Build conditions
    const conditions = [];

    if (status) {
      conditions.push(eq(invoiceRequests.status, status));
    }

    if (search) {
      conditions.push(
        or(
          ilike(invoiceRequests.companyName, `%${search}%`),
          ilike(invoiceRequests.contactEmail, `%${search}%`),
          ilike(users.email, `%${search}%`)
        )
      );
    }

    // Apply conditions
    if (conditions.length > 0) {
      query = query.where(
        conditions.length === 1
          ? conditions[0]
          : sql`${conditions[0]} AND ${conditions[1]}`
      ) as typeof query;
    }

    // Apply sorting
    const orderFn = sortOrder === 'asc' ? asc : desc;
    switch (sortBy) {
      case 'companyName':
        query = query.orderBy(orderFn(invoiceRequests.companyName)) as typeof query;
        break;
      case 'status':
        query = query.orderBy(orderFn(invoiceRequests.status)) as typeof query;
        break;
      default:
        query = query.orderBy(orderFn(invoiceRequests.createdAt)) as typeof query;
    }

    const results = await query;

    // Get total count
    const countConditions = [];
    if (status) countConditions.push(eq(invoiceRequests.status, status));

    const countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(invoiceRequests);

    if (countConditions.length > 0) {
      const [{ count }] = await countQuery.where(countConditions[0]);
      return NextResponse.json({
        invoices: results,
        total: Number(count),
        limit,
        offset,
      });
    }

    const [{ count }] = await countQuery;

    // Log view action
    await logAdminAction({
      adminId: authResult.admin.sub,
      action: ADMIN_ACTIONS.INVOICE_VIEW,
      entityType: ENTITY_TYPES.INVOICE_REQUEST,
      details: { status, search, count: results.length },
    });

    return NextResponse.json({
      invoices: results,
      total: Number(count),
      limit,
      offset,
    });
  } catch (error) {
    console.error('[Admin Invoices] Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice requests' },
      { status: 500 }
    );
  }
}
