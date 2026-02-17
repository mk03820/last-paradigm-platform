/**
 * Admin Refunds List API Route
 *
 * GET /api/admin/refunds - List refund-eligible purchases
 *
 * Story 21.3: Refund Processing Interface
 * Task 3: Create refund API endpoints (AC: 1)
 * Covers: AC1 (list refund-eligible purchases)
 */

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin-auth';
import { getRefundEligiblePurchases } from '@/lib/stripe/refunds';

/**
 * GET /api/admin/refunds
 *
 * Returns list of refund-eligible purchases (within 30-day guarantee).
 */
export async function GET() {
  // Verify admin authentication
  const authResult = await requireAdmin();

  if (!authResult.authenticated) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  try {
    const purchases = await getRefundEligiblePurchases();

    return NextResponse.json({
      purchases,
      total: purchases.length,
    });
  } catch (error) {
    console.error('[Admin Refunds] Error fetching eligible purchases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch refund-eligible purchases' },
      { status: 500 }
    );
  }
}
