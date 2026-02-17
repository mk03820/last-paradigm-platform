/**
 * Purchase Success Page
 *
 * Displays a celebration page after successful Stripe checkout.
 * Validates the checkout session and shows purchase confirmation.
 *
 * Story 17.6: Purchase Success Page
 * Task 1: Create success page route with session validation (AC: 1, 7, 8)
 * Covers: FR68, FR54 (partial)
 */

import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertCircle, Loader2 } from 'lucide-react';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { purchases, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { stripe } from '@/lib/stripe/client';
import { Button } from '@/components/ui/button';
import {
  SuccessHero,
  PurchaseConfirmation,
  NextSteps,
  SuccessAnalytics,
  SuccessCTA,
  SuccessPageSkeleton,
} from '@/components/purchase';

/**
 * Page metadata
 */
export const metadata: Metadata = {
  title: 'Purchase Complete | The Last Paradigm',
  description:
    'Congratulations on your purchase! Your transformation journey begins now.',
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Success page props from URL search params
 */
interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

/**
 * Purchase Success Page Component
 *
 * Server component that:
 * 1. Extracts session_id from URL (AC1)
 * 2. Validates checkout session with Stripe API (AC1)
 * 3. Verifies purchase record in database (AC1)
 * 4. Handles various error states (AC7)
 * 5. Handles page refresh gracefully (AC8)
 */
export default async function PurchaseSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const resolvedParams = await searchParams;
  const sessionId = resolvedParams.session_id;

  // Task 1.5: Handle missing session ID
  if (!sessionId) {
    return <InvalidSessionState reason="missing" />;
  }

  // Get authenticated user
  const session = await auth();

  if (!session?.user?.id) {
    return <InvalidSessionState reason="unauthenticated" />;
  }

  try {
    // Task 1.3: Validate session with Stripe API
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    // Check if checkout was completed
    if (checkoutSession.status !== 'complete') {
      return <InvalidSessionState reason="incomplete" />;
    }

    // Task 1.4: Verify purchase exists in our database
    const purchaseResults = await db
      .select({
        purchase: purchases,
        user: users,
      })
      .from(purchases)
      .leftJoin(users, eq(purchases.userId, users.id))
      .where(eq(purchases.stripeSessionId, sessionId))
      .limit(1);

    const purchaseRecord = purchaseResults[0];

    if (!purchaseRecord?.purchase) {
      // Webhook may not have processed yet - show pending state
      return (
        <PendingState
          email={checkoutSession.customer_email}
          amount={checkoutSession.amount_total}
        />
      );
    }

    // Verify the purchase belongs to the current user
    if (purchaseRecord.purchase.userId !== session.user.id) {
      return <InvalidSessionState reason="unauthorized" />;
    }

    // Get user name for personalization
    const userName = session.user.name || purchaseRecord.user?.name || 'there';

    // All validations passed - render success page
    return (
      <main className="min-h-screen bg-slate-900">
        {/* Analytics tracking - fires once per session */}
        <SuccessAnalytics
          purchaseId={purchaseRecord.purchase.id}
          sessionId={sessionId}
          amount={purchaseRecord.purchase.amount}
          currency={purchaseRecord.purchase.currency}
          userId={session.user.id}
          customerEmail={session.user.email || undefined}
        />

        {/* Celebration Hero with Confetti */}
        <SuccessHero userName={userName} />

        {/* Purchase Confirmation Details */}
        <PurchaseConfirmation
          amount={purchaseRecord.purchase.amount}
          currency={purchaseRecord.purchase.currency}
          purchasedAt={purchaseRecord.purchase.completedAt || purchaseRecord.purchase.createdAt || new Date()}
          email={session.user.email || purchaseRecord.user?.email || ''}
          orderId={purchaseRecord.purchase.id}
        />

        {/* Next Steps Guide */}
        <NextSteps />

        {/* Primary CTA */}
        <SuccessCTA />
      </main>
    );
  } catch (error) {
    console.error('[purchase/success] Error validating checkout session:', error);
    return <InvalidSessionState reason="error" />;
  }
}

/**
 * Invalid Session State Component
 *
 * Displays appropriate error message based on the reason.
 * Provides helpful actions for recovery.
 */
function InvalidSessionState({
  reason,
}: {
  reason: 'missing' | 'incomplete' | 'unauthenticated' | 'unauthorized' | 'error';
}) {
  const messages: Record<string, { title: string; message: string }> = {
    missing: {
      title: 'Session Not Found',
      message:
        'We could not find your checkout session. Please check your email for confirmation.',
    },
    incomplete: {
      title: 'Payment Incomplete',
      message:
        'Your payment has not been completed. Please try again or contact support.',
    },
    unauthenticated: {
      title: 'Please Sign In',
      message: 'Please sign in to view your purchase confirmation.',
    },
    unauthorized: {
      title: 'Access Denied',
      message: 'You do not have permission to view this purchase.',
    },
    error: {
      title: 'Something Went Wrong',
      message:
        'We encountered an error verifying your purchase. Please contact support.',
    },
  };

  const { title, message } = messages[reason] || messages.error;

  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <div className="rounded-full bg-red-900/50 p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-red-400" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-4">{title}</h1>
        <p className="text-slate-400 mb-8">{message}</p>
        <div className="flex flex-col gap-4">
          {reason === 'unauthenticated' ? (
            <Button asChild>
              <Link href="/auth/signin?callbackUrl=/purchase/success">
                Sign In
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/preview">Return to Preview</Link>
            </Button>
          )}
          <Button variant="outline" asChild>
            <a href="mailto:support@lastparadigm.com">Contact Support</a>
          </Button>
        </div>
      </div>
    </main>
  );
}

/**
 * Pending State Component
 *
 * Shown when checkout completed but webhook hasn't processed yet.
 * Provides reassurance that the purchase was successful.
 */
function PendingState({
  email,
  amount,
}: {
  email: string | null;
  amount: number | null;
}) {
  // Format amount from cents to dollars
  const formattedAmount =
    amount !== null
      ? new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
        }).format(amount / 100)
      : '$2,500';

  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <Loader2
          className="h-12 w-12 text-amber-500 animate-spin mx-auto mb-6"
          aria-hidden="true"
        />
        <h1 className="text-2xl font-bold text-white mb-4">
          Processing Your Purchase
        </h1>
        <p className="text-slate-300 mb-4">
          Your payment of {formattedAmount} was successful!
        </p>
        <p className="text-slate-500 text-sm">
          We&apos;re setting up your account. This usually takes just a moment.
          A confirmation email will be sent to{' '}
          {email || 'your email address'}.
        </p>
        <p className="text-slate-500 text-sm mt-4">
          If this takes longer than expected, please refresh the page or{' '}
          <a
            href="mailto:support@lastparadigm.com"
            className="text-amber-500 hover:underline"
          >
            contact support
          </a>
          .
        </p>
      </div>
    </main>
  );
}
