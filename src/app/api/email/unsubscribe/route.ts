/**
 * Unsubscribe API Endpoint
 *
 * Handles email unsubscribe requests with secure token validation.
 * Supports both marketing and nurture email opt-out.
 *
 * Story 20.1: Email Template System
 * Task 3: Implement unsubscribe mechanism (AC: 5)
 * Covers: NFR30 (GDPR compliance - one-click unsubscribe)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emailPreferences, emailSequences } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * POST /api/email/unsubscribe
 *
 * Process unsubscribe request with token validation.
 * Updates email preferences and stops any active nurture sequences.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, token, type = 'all' } = body;

    // Validate required fields
    if (!email || !token) {
      return NextResponse.json(
        { success: false, error: 'Email and token are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Find email preference record with matching token
    const preference = await db
      .select()
      .from(emailPreferences)
      .where(
        and(
          eq(emailPreferences.email, email.toLowerCase()),
          eq(emailPreferences.unsubscribeToken, token)
        )
      )
      .limit(1);

    if (preference.length === 0) {
      // Token doesn't match - could be invalid or already used
      // For security, we return a generic message
      console.warn(`[Unsubscribe] Invalid token for email: ${email}`);
      return NextResponse.json(
        { success: false, error: 'Invalid unsubscribe link. Please contact support.' },
        { status: 400 }
      );
    }

    const pref = preference[0];
    const now = new Date();

    // Update preferences based on type
    const updates: Partial<typeof emailPreferences.$inferInsert> = {
      updatedAt: now,
      unsubscribedAt: now,
    };

    if (type === 'all' || type === 'marketing') {
      updates.marketingOptOut = true;
    }
    if (type === 'all' || type === 'nurture') {
      updates.nurturOptOut = true;
    }
    if (type === 'all') {
      updates.transactionalOnly = true;
    }

    // Update email preferences
    await db
      .update(emailPreferences)
      .set(updates)
      .where(eq(emailPreferences.id, pref.id));

    // Stop any active nurture sequences for this user
    if (pref.userId && (type === 'all' || type === 'nurture')) {
      await db
        .update(emailSequences)
        .set({
          status: 'unsubscribed',
          completedAt: now,
        })
        .where(
          and(
            eq(emailSequences.userId, pref.userId),
            eq(emailSequences.status, 'active')
          )
        );
    }

    console.log(`[Unsubscribe] Successfully processed for email: ${email}, type: ${type}`);

    return NextResponse.json({
      success: true,
      message: 'You have been unsubscribed successfully.',
    });
  } catch (error) {
    console.error('[Unsubscribe] Error processing request:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/email/unsubscribe
 *
 * Handle one-click unsubscribe via GET request (for List-Unsubscribe header).
 * NFR30 requires one-click unsubscribe support.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  if (!email || !token) {
    // Redirect to unsubscribe page for manual entry
    return NextResponse.redirect(new URL('/unsubscribe', request.url));
  }

  // Process unsubscribe
  const body = { email, token, type: 'all' };
  const mockRequest = new NextRequest(request.url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });

  // Process and redirect to confirmation page
  try {
    const result = await processUnsubscribe(email, token);

    if (result.success) {
      const successUrl = new URL('/unsubscribe/success', request.url);
      return NextResponse.redirect(successUrl);
    } else {
      const errorUrl = new URL('/unsubscribe', request.url);
      errorUrl.searchParams.set('error', result.error || 'Unknown error');
      return NextResponse.redirect(errorUrl);
    }
  } catch (error) {
    console.error('[Unsubscribe GET] Error:', error);
    const errorUrl = new URL('/unsubscribe', request.url);
    errorUrl.searchParams.set('error', 'An error occurred');
    return NextResponse.redirect(errorUrl);
  }
}

/**
 * Process unsubscribe request (shared logic)
 */
async function processUnsubscribe(
  email: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  const preference = await db
    .select()
    .from(emailPreferences)
    .where(
      and(
        eq(emailPreferences.email, email.toLowerCase()),
        eq(emailPreferences.unsubscribeToken, token)
      )
    )
    .limit(1);

  if (preference.length === 0) {
    return { success: false, error: 'Invalid unsubscribe link' };
  }

  const pref = preference[0];
  const now = new Date();

  await db
    .update(emailPreferences)
    .set({
      marketingOptOut: true,
      nurturOptOut: true,
      transactionalOnly: true,
      unsubscribedAt: now,
      updatedAt: now,
    })
    .where(eq(emailPreferences.id, pref.id));

  // Stop active sequences
  if (pref.userId) {
    await db
      .update(emailSequences)
      .set({
        status: 'unsubscribed',
        completedAt: now,
      })
      .where(
        and(
          eq(emailSequences.userId, pref.userId),
          eq(emailSequences.status, 'active')
        )
      );
  }

  console.log(`[Unsubscribe] Successfully processed for email: ${email}`);
  return { success: true };
}
