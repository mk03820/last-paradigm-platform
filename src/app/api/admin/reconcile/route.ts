/**
 * Admin Reconciliation API Route
 *
 * POST /api/admin/reconcile - Run Stripe payment reconciliation
 * GET /api/admin/reconcile - Get missing purchases without processing
 *
 * Story 17.5: Webhook Retry & Recovery
 * Task 4: Create Stripe reconciliation service (AC: 7)
 * Covers: AC7 (identify and process missing purchases)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  reconcileStripePayments,
  findMissingPurchases,
  type ReconciliationResult,
  type MissingPurchase,
} from '@/lib/stripe/reconciliation';

/**
 * GET /api/admin/reconcile
 *
 * Returns list of Stripe sessions missing from database (dry run).
 *
 * Query params:
 * - days: Lookback period in days (default 7)
 *
 * Requires admin authentication.
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<{ missing: MissingPurchase[] } | { error: string }>> {
  // Verify admin authentication
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Admin check
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase());
  if (!adminEmails.includes(session.user.email.toLowerCase())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '7');
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  try {
    const missing = await findMissingPurchases(startDate);

    console.log(
      `[Admin Reconcile] Found ${missing.length} missing purchases (last ${days} days)`
    );

    return NextResponse.json({ missing });
  } catch (error) {
    console.error('[Admin Reconcile] Error finding missing purchases:', error);
    return NextResponse.json(
      { error: 'Failed to check for missing purchases' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/reconcile
 *
 * Runs Stripe payment reconciliation and processes missing purchases.
 *
 * Query params:
 * - days: Lookback period in days (default 7)
 * - autoProcess: Whether to auto-process missing (default false for safety)
 *
 * Requires admin authentication.
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ReconciliationResult | { error: string }>> {
  // Verify admin authentication
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Admin check
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase());
  if (!adminEmails.includes(session.user.email.toLowerCase())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '7');
  const autoProcess = searchParams.get('autoProcess') === 'true';
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  console.log(
    `[Admin Reconcile] Starting reconciliation (last ${days} days, autoProcess=${autoProcess})`
  );

  try {
    const result = await reconcileStripePayments(startDate, autoProcess);

    console.log(
      `[Admin Reconcile] Complete: ${result.matched} matched, ${result.missing} missing, ${result.processed} processed`
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Admin Reconcile] Error running reconciliation:', error);
    return NextResponse.json(
      { error: 'Reconciliation failed' },
      { status: 500 }
    );
  }
}
