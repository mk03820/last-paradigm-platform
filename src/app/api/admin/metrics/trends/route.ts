/**
 * Admin Metrics Trends API Route
 *
 * GET /api/admin/metrics/trends - Get purchase trends over time
 *
 * Story 21.5: Conversion Funnel Dashboard
 * Task 3: Create trends API endpoint (AC: 4)
 * Covers: AC4 (trend chart data)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin-auth';
import {
  getPurchaseTrends,
  type TimePeriod,
} from '@/lib/admin/metrics-aggregator';

/**
 * Valid time periods
 */
const VALID_PERIODS: TimePeriod[] = ['today', '7days', '30days', 'all'];

/**
 * GET /api/admin/metrics/trends
 *
 * Returns purchase trend data for charting.
 *
 * Query params:
 * - period: Time period (today, 7days, 30days, all)
 * - granularity: Data granularity (daily, weekly)
 */
export async function GET(request: NextRequest) {
  // Verify admin authentication
  const authResult = await requireAdmin();

  if (!authResult.authenticated) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const periodParam = searchParams.get('period') || '30days';
  const granularityParam = searchParams.get('granularity') || 'daily';

  // Validate period
  if (!VALID_PERIODS.includes(periodParam as TimePeriod)) {
    return NextResponse.json(
      { error: `Invalid period. Must be one of: ${VALID_PERIODS.join(', ')}` },
      { status: 400 }
    );
  }

  // Validate granularity
  if (!['daily', 'weekly'].includes(granularityParam)) {
    return NextResponse.json(
      { error: 'Invalid granularity. Must be daily or weekly' },
      { status: 400 }
    );
  }

  const period = periodParam as TimePeriod;
  const granularity = granularityParam as 'daily' | 'weekly';

  try {
    const trends = await getPurchaseTrends(period, granularity);

    return NextResponse.json({
      period,
      granularity,
      data: trends,
    });
  } catch (error) {
    console.error('[Admin Metrics] Error fetching trends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trends' },
      { status: 500 }
    );
  }
}
