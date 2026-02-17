/**
 * Metrics Aggregator Service
 *
 * Aggregates conversion funnel metrics from various data sources.
 *
 * Story 21.5: Conversion Funnel Dashboard
 * Task 1: Create metrics aggregation service (AC: 1, 2)
 * Covers: AC1 (key metrics), AC2 (conversion rates)
 */

import { db } from '@/lib/db';
import {
  users,
  purchases,
  invoiceRequests,
  analyticsEvents,
  toolkitDocuments,
} from '@/lib/db/schema';
import { sql, gte, lte, eq, and, count } from 'drizzle-orm';

/**
 * Time period options
 */
export type TimePeriod = 'today' | '7days' | '30days' | 'all';

/**
 * Conversion metrics response
 */
export interface ConversionMetrics {
  period: TimePeriod;
  periodStart: string;
  periodEnd: string;
  lastUpdated: string;

  counts: {
    accountsCreated: number;
    previewsViewed: number;
    checkoutsStarted: number;
    purchasesCompleted: number;
    invoiceRequests: number;
    toolkitsDownloaded: number;
  };

  revenue: {
    total: number;
    average: number;
  };

  conversionRates: {
    accountToPreview: number;
    previewToCheckout: number;
    checkoutToComplete: number;
    overallAccountToPurchase: number;
    target: number;
    isAboveTarget: boolean;
  };
}

/**
 * Trend data point
 */
export interface TrendDataPoint {
  date: string;
  purchases: number;
  revenue: number;
}

/**
 * Calculate date range for period
 */
function getDateRange(period: TimePeriod): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(now);
  let start: Date;

  switch (period) {
    case 'today':
      start = new Date(now.setHours(0, 0, 0, 0));
      break;
    case '7days':
      start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30days':
      start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'all':
    default:
      start = new Date('2024-01-01'); // Platform start date
      break;
  }

  return { start, end };
}

/**
 * Get conversion metrics for a time period
 */
export async function getConversionMetrics(
  period: TimePeriod = '30days'
): Promise<ConversionMetrics> {
  const { start, end } = getDateRange(period);

  // Get accounts created
  const accountsResult = await db
    .select({ count: count() })
    .from(users)
    .where(period !== 'all' ? gte(users.createdAt, start) : undefined);
  const accountsCreated = accountsResult[0]?.count || 0;

  // Get preview views from analytics
  const previewsResult = await db
    .select({ count: count() })
    .from(analyticsEvents)
    .where(
      and(
        eq(analyticsEvents.eventName, 'preview_viewed'),
        period !== 'all' ? gte(analyticsEvents.timestamp, start) : undefined
      )
    );
  const previewsViewed = previewsResult[0]?.count || 0;

  // Get checkout starts from analytics
  const checkoutsResult = await db
    .select({ count: count() })
    .from(analyticsEvents)
    .where(
      and(
        eq(analyticsEvents.eventName, 'checkout_started'),
        period !== 'all' ? gte(analyticsEvents.timestamp, start) : undefined
      )
    );
  const checkoutsStarted = checkoutsResult[0]?.count || 0;

  // Get completed purchases
  const purchasesResult = await db
    .select({ count: count(), totalRevenue: sql<number>`COALESCE(SUM(amount), 0)` })
    .from(purchases)
    .where(
      and(
        eq(purchases.status, 'completed'),
        period !== 'all' ? gte(purchases.completedAt, start) : undefined
      )
    );
  const purchasesCompleted = purchasesResult[0]?.count || 0;
  const totalRevenue = Number(purchasesResult[0]?.totalRevenue) || 0;

  // Get invoice requests
  const invoicesResult = await db
    .select({ count: count() })
    .from(invoiceRequests)
    .where(period !== 'all' ? gte(invoiceRequests.createdAt, start) : undefined);
  const invoiceRequestsCount = invoicesResult[0]?.count || 0;

  // Get toolkit downloads (unique users who downloaded at least one doc)
  const downloadsResult = await db
    .select({ count: sql<number>`COUNT(DISTINCT user_id)` })
    .from(toolkitDocuments)
    .where(
      and(
        eq(toolkitDocuments.status, 'completed'),
        period !== 'all' ? gte(toolkitDocuments.generatedAt, start) : undefined
      )
    );
  const toolkitsDownloaded = Number(downloadsResult[0]?.count) || 0;

  // Calculate conversion rates
  const accountToPreview =
    accountsCreated > 0 ? (previewsViewed / accountsCreated) * 100 : 0;
  const previewToCheckout =
    previewsViewed > 0 ? (checkoutsStarted / previewsViewed) * 100 : 0;
  const checkoutToComplete =
    checkoutsStarted > 0 ? (purchasesCompleted / checkoutsStarted) * 100 : 0;
  const overallAccountToPurchase =
    accountsCreated > 0 ? (purchasesCompleted / accountsCreated) * 100 : 0;

  const target = 10; // NFR26: 10%+ conversion target
  const isAboveTarget = overallAccountToPurchase >= target;

  return {
    period,
    periodStart: start.toISOString(),
    periodEnd: end.toISOString(),
    lastUpdated: new Date().toISOString(),

    counts: {
      accountsCreated,
      previewsViewed,
      checkoutsStarted,
      purchasesCompleted,
      invoiceRequests: invoiceRequestsCount,
      toolkitsDownloaded,
    },

    revenue: {
      total: totalRevenue,
      average: purchasesCompleted > 0 ? totalRevenue / purchasesCompleted : 0,
    },

    conversionRates: {
      accountToPreview: Math.round(accountToPreview * 100) / 100,
      previewToCheckout: Math.round(previewToCheckout * 100) / 100,
      checkoutToComplete: Math.round(checkoutToComplete * 100) / 100,
      overallAccountToPurchase: Math.round(overallAccountToPurchase * 100) / 100,
      target,
      isAboveTarget,
    },
  };
}

/**
 * Get purchase trends over time
 */
export async function getPurchaseTrends(
  period: TimePeriod = '30days',
  granularity: 'daily' | 'weekly' = 'daily'
): Promise<TrendDataPoint[]> {
  const { start, end } = getDateRange(period);

  // Build date truncation based on granularity
  const dateTrunc = granularity === 'weekly' ? 'week' : 'day';

  const results = await db
    .select({
      date: sql<string>`DATE_TRUNC('${sql.raw(dateTrunc)}', completed_at)::date`,
      purchases: count(),
      revenue: sql<number>`COALESCE(SUM(amount), 0)`,
    })
    .from(purchases)
    .where(
      and(
        eq(purchases.status, 'completed'),
        period !== 'all' ? gte(purchases.completedAt, start) : undefined
      )
    )
    .groupBy(sql`DATE_TRUNC('${sql.raw(dateTrunc)}', completed_at)`)
    .orderBy(sql`DATE_TRUNC('${sql.raw(dateTrunc)}', completed_at)`);

  return results.map((row) => ({
    date: row.date,
    purchases: Number(row.purchases),
    revenue: Number(row.revenue),
  }));
}

/**
 * Get funnel visualization data
 */
export async function getFunnelData(period: TimePeriod = '30days'): Promise<
  Array<{
    stage: string;
    count: number;
    percentage: number;
  }>
> {
  const metrics = await getConversionMetrics(period);

  const stages = [
    { stage: 'Accounts Created', count: metrics.counts.accountsCreated },
    { stage: 'Previews Viewed', count: metrics.counts.previewsViewed },
    { stage: 'Checkouts Started', count: metrics.counts.checkoutsStarted },
    { stage: 'Purchases Completed', count: metrics.counts.purchasesCompleted },
  ];

  const maxCount = Math.max(...stages.map((s) => s.count), 1);

  return stages.map((s) => ({
    ...s,
    percentage: Math.round((s.count / maxCount) * 100),
  }));
}
