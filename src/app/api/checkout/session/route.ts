/**
 * Checkout Session API Route
 *
 * POST /api/checkout/session - Create a Stripe Checkout Session
 *
 * Creates a one-time payment checkout session for Playbook 2 access ($2,500).
 * Requires authentication and pre-fills user's email.
 *
 * Story 17.2: Stripe Checkout Integration
 * Task 2: Create checkout session API route
 * Covers: AC1, AC3, AC4, AC8
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  stripe,
  STRIPE_CONFIG,
  type CheckoutMetadata,
  type CreateCheckoutSessionResponse,
  type CheckoutSessionError,
} from '@/lib/stripe/client';
import Stripe from 'stripe';

/**
 * Request body schema (optional)
 */
interface CreateSessionRequest {
  /**
   * Optional diagnostic result ID to associate with purchase
   */
  diagnosticResultId?: string;

  /**
   * Session source for analytics
   * @default 'preview_page'
   */
  sessionSource?: CheckoutMetadata['sessionSource'];
}

/**
 * POST /api/checkout/session
 *
 * Creates a Stripe Checkout Session for Playbook 2 purchase.
 *
 * @returns CheckoutSessionResponse with URL to redirect user
 * @throws 401 if not authenticated
 * @throws 502 if Stripe API error
 * @throws 500 if unexpected error
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<CreateCheckoutSessionResponse | CheckoutSessionError>> {
  try {
    // Verify authentication (AC8)
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'SERVER_ERROR' as const },
        { status: 401 }
      );
    }

    if (!session.user.email) {
      return NextResponse.json(
        { error: 'User email is required', code: 'SERVER_ERROR' as const },
        { status: 400 }
      );
    }

    // Parse optional request body
    let body: CreateSessionRequest = {};
    try {
      body = await request.json();
    } catch {
      // Empty body is fine, we'll use defaults
    }

    const { user } = session;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Build metadata for webhook reconciliation (AC3)
    const metadata: CheckoutMetadata = {
      userId: user.id,
      userEmail: user.email,
      diagnosticResultId: body.diagnosticResultId,
      createdAt: new Date().toISOString(),
      sessionSource: body.sessionSource || 'preview_page',
    };

    // Create Stripe Checkout Session (AC1)
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: user.email,
      line_items: [
        {
          price: STRIPE_CONFIG.priceId,
          quantity: 1,
        },
      ],
      metadata: metadata as unknown as Stripe.MetadataParam,
      // Success URL with session ID for validation (AC4)
      success_url: `${appUrl}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
      // Cancel URL returns to preview page with message (AC4)
      cancel_url: `${appUrl}/preview?checkout=cancelled`,
      // Optional: Allow promotional codes
      allow_promotion_codes: true,
      // Billing address collection for invoicing
      billing_address_collection: 'required',
    });

    if (!checkoutSession.url) {
      console.error('[checkout/session] No URL returned from Stripe');
      return NextResponse.json(
        { error: 'Failed to create checkout URL', code: 'STRIPE_ERROR' as const },
        { status: 502 }
      );
    }

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error('[checkout/session] Error:', error);

    // Handle Stripe-specific errors
    if (error instanceof Stripe.errors.StripeError) {
      console.error('[checkout/session] Stripe error:', error.message);
      return NextResponse.json(
        { error: 'Payment service unavailable. Please try again.', code: 'STRIPE_ERROR' as const },
        { status: 502 }
      );
    }

    // Handle configuration errors
    if (error instanceof Error && error.message.includes('STRIPE_')) {
      console.error('[checkout/session] Config error:', error.message);
      return NextResponse.json(
        { error: 'Payment service configuration error', code: 'CONFIG_ERROR' as const },
        { status: 500 }
      );
    }

    // Handle unexpected errors
    return NextResponse.json(
      { error: 'An unexpected error occurred', code: 'SERVER_ERROR' as const },
      { status: 500 }
    );
  }
}
