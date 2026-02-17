/**
 * Admin Metrics API Route
 *
 * GET /api/admin/metrics - Get conversion funnel metrics
 *
 * Story 21.5: Conversion Funnel Dashboard
 * Task 2: Create metrics API endpoint (AC: 1, 2, 3)
 * Covers: AC1 (key metrics), AC2 (conversion rates), AC3 (time periods)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin-auth';
import { logAdminAction, ADMIN_ACTIONS } from '@/lib/admin/audit-logger';
import {
  getConversionMetrics,
  type TimePeriod,
} from '@/lib/admin/metrics-aggregator';

/**
 * Valid time periods
 */
const VALID_PERIODS: TimePeriod[] = ['today', '7days', '30days', 'all'];

/**
 * GET /api/admin/metrics
 *
 * Returns conversion funnel metrics for the specified time period.
 *
 * Query params:
 * - period: Time period (today, 7days, 30days, all)
 */
export async function GET(request: NextRequest) {
  // Verify admin authentication
  const authResult = await requireAdmin();

  if (!authResult.authenticated) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const periodParam = searchParams.get('period') || '30days';

  // Validate period
  if (!VALID_PERIODS.includes(periodParam as TimePeriod)) {
    return NextResponse.json(
      { error: `Invalid period. Must be one of: ${VALID_PERIODS.join(', ')}` },
      { status: 400 }
    );
  }

  const period = periodParam as TimePeriod;

  try {
    const metrics = await getConversionMetrics(period);

    // Log metrics view
    await logAdminAction({
      adminId: authResult.admin.sub,
      action: ADMIN_ACTIONS.METRICS_VIEW,
      details: { period },
    });

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('[Admin Metrics] Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
