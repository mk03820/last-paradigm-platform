/**
 * Admin Refund Stats API Route
 *
 * GET /api/admin/refunds/stats - Get refund rate statistics
 *
 * Story 21.3: Refund Processing Interface
 * Task 3: Create refund API endpoints (AC: 5)
 * Covers: AC5 (refund rate monitoring, NFR27 target)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin-auth';
import { getRefundStats } from '@/lib/stripe/refunds';

/**
 * GET /api/admin/refunds/stats
 *
 * Returns refund rate statistics.
 *
 * Query params:
 * - days: Number of days to look back (default: 30)
 */
export async function GET(request: NextRequest) {
  // Verify admin authentication
  const authResult = await requireAdmin();

  if (!authResult.authenticated) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '30');

  try {
    const stats = await getRefundStats(days);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('[Admin Refunds] Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch refund statistics' },
      { status: 500 }
    );
  }
}
