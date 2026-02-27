/**
 * Playbook 2 Preview Page
 *
 * Displays personalized savings headline based on user's completed PB1 diagnostic.
 * Requires authentication and redirects if not logged in.
 *
 * Story 16.1: Preview Page Layout & Savings Headline
 * Story 17.1: Purchase CTA & Guarantee Display
 * Story 17.2: Stripe Checkout Integration (cancelled checkout handling)
 * Task 1: Create preview page route and layout
 * Covers: AC1, AC5, AC8 (FR43, FR65)
 */

import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { diagnosticResults } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { Header } from '@/components/layout';
import {
  PreviewHero,
  PreviewPageSkeleton,
  CheckoutCancelledBanner,
} from '@/components/preview';
import { PurchaseCTASection } from '@/components/purchase';
import {
  calculateEstimatedSavings,
  getSavingsContext,
  parseNumericValue,
} from '@/lib/services/savings-calculator';

/**
 * Page metadata for SEO
 */
export const metadata: Metadata = {
  title: 'Your Personalized Savings Preview | The Last Paradigm',
  description:
    'See your estimated annual savings based on your organizational alignment diagnostic. Transform your alignment tax into competitive advantage.',
};

/**
 * Preview page component
 *
 * Server component that:
 * 1. Checks authentication (AC8)
 * 2. Fetches user's diagnostic data (AC1)
 * 3. Calculates estimated savings (AC1)
 * 4. Renders personalized preview (AC2, AC3)
 */
export default async function PreviewPage() {
  // Check authentication (AC8)
  let session = null;
  try {
    session = await auth();
  } catch (error) {
    console.error('[Preview] Auth error:', error);
    redirect('/auth/signin?callbackUrl=/preview');
  }

  if (!session?.user?.id) {
    // Redirect to sign-in with callback URL
    redirect('/auth/signin?callbackUrl=/preview');
  }

  // Fetch user's most recent diagnostic result
  let diagnosticResult = null;
  try {
    const results = await db
      .select()
      .from(diagnosticResults)
      .where(eq(diagnosticResults.userId, session.user.id))
      .orderBy(desc(diagnosticResults.completedAt))
      .limit(1);
    diagnosticResult = results[0];
  } catch (error) {
    console.error('[Preview] Database error:', error);
    // Show no diagnostic message if DB fails
  }

  // Handle missing diagnostic data
  if (!diagnosticResult) {
    return (
      <>
        <Header />
        <main className="min-h-[calc(100vh-56px)] bg-background">
          <NoDiagnosticDataMessage />
        </main>
      </>
    );
  }

  // Parse numeric values from database
  const totalAlignmentTax = parseNumericValue(diagnosticResult.totalAlignmentTax);

  // Calculate percent of revenue from tool results if available
  const toolResults = diagnosticResult.toolResults;
  const percentOfRevenue = toolResults?.tool7?.alignmentTaxPercent ?? 0;

  // Calculate estimated savings (default 50% recovery rate)
  const estimatedSavings = calculateEstimatedSavings(totalAlignmentTax);

  // Get severity-based context
  const savingsContext = getSavingsContext(percentOfRevenue);

  return (
    <>
      {/* Checkout cancelled banner - Story 17.2 (AC6) */}
      <Suspense fallback={null}>
        <CheckoutCancelledBanner />
      </Suspense>

      <Header />
      <main className="min-h-[calc(100vh-56px)]">
        <Suspense fallback={<PreviewPageSkeleton />}>
          <PreviewHero
            estimatedSavings={estimatedSavings}
            totalAlignmentTax={totalAlignmentTax}
            percentOfRevenue={percentOfRevenue}
            savingsContext={savingsContext}
          />
        </Suspense>

        {/* Placeholder for Story 16.2-16.5 content */}
        <section className="py-16 px-4 bg-background text-center">
          <p className="text-muted-foreground">
            Tool recommendations and trust signals coming in Stories 16.2-16.5
          </p>
        </section>

        {/* Purchase CTA Section - Story 17.1 */}
        <PurchaseCTASection />
      </main>
    </>
  );
}

/**
 * Message displayed when user hasn't completed PB1 diagnostic
 */
function NoDiagnosticDataMessage() {
  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 text-center">
      <div className="py-16">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Complete Your Diagnostic First
        </h1>
        <p className="text-muted-foreground mb-8">
          To see your personalized savings preview, you need to complete the
          Playbook 1 diagnostic assessment. This will calculate your
          organization&apos;s alignment tax and show you potential savings.
        </p>
        <a
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}
