/**
 * Dev Preview Page - Hidden Testing Route
 *
 * Internal-only page that displays the Phase 3 preview experience with
 * mock PB1 diagnostic data. Bypasses authentication for testing purposes.
 *
 * Story: Hidden Dev Link to Preview Page with Mock Data
 * AC1: Route loads preview page with pre-seeded mock diagnostic data
 * AC2: Realistic values display (savings headline, tool recommendations)
 * AC3: No authentication required (bypasses login)
 * AC4: No visible link to this route in UI
 * AC5: CTAs route to real auth/purchase flows
 */

'use client';

import { useEffect, useState } from 'react';
import { Suspense } from 'react';
import { Header } from '@/components/layout';
import {
  PreviewHero,
  PreviewPageSkeleton,
} from '@/components/preview';
import { PurchaseCTASection } from '@/components/purchase';
import {
  calculateEstimatedSavings,
  getSavingsContext,
} from '@/lib/services/savings-calculator';
import { seedMockPB1Data, getMockDiagnosticData, MOCK_TOOL7_DATA } from '@/lib/dev/mock-pb1-data';

/**
 * Dev Preview Page Component
 *
 * Client component that:
 * 1. Seeds mock diagnostic data to Zustand stores on mount
 * 2. Renders the preview page with mock data
 * 3. Allows testing of the full preview experience without completing PB1
 */
export default function DevPreviewPage() {
  const [isSeeded, setIsSeeded] = useState(false);
  const [mockData, setMockData] = useState<ReturnType<typeof getMockDiagnosticData> | null>(null);

  // Seed mock data on mount
  useEffect(() => {
    // Seed all Zustand stores with mock data
    seedMockPB1Data();

    // Get the mock data for rendering
    const data = getMockDiagnosticData();
    setMockData(data);
    setIsSeeded(true);
  }, []);

  // Show loading state while seeding
  if (!isSeeded || !mockData) {
    return (
      <>
        <Header />
        <main className="min-h-[calc(100vh-56px)]">
          <PreviewPageSkeleton />
        </main>
      </>
    );
  }

  // Calculate values for preview
  const totalAlignmentTax = mockData.totalAlignmentTax;
  const percentOfRevenue = mockData.percentOfRevenue;
  const estimatedSavings = calculateEstimatedSavings(totalAlignmentTax);
  const savingsContext = getSavingsContext(percentOfRevenue);

  return (
    <>
      {/* Dev environment banner */}
      <div className="bg-amber-500 text-amber-950 text-center py-2 text-sm font-medium">
        DEV PREVIEW - Mock Data Mode | Savings: ${MOCK_TOOL7_DATA.estimatedSavings.toLocaleString()} |
        Alignment Tax: ${MOCK_TOOL7_DATA.totalAlignmentTax.toLocaleString()} ({MOCK_TOOL7_DATA.alignmentTaxPercent}% of revenue)
      </div>

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

        {/* Tool recommendations placeholder - matches production preview */}
        <section className="py-16 px-4 bg-background text-center">
          <p className="text-muted-foreground">
            Tool recommendations and trust signals coming in Stories 16.2-16.5
          </p>
        </section>

        {/* Purchase CTA Section - routes to real auth/purchase flows (AC5) */}
        <PurchaseCTASection />
      </main>
    </>
  );
}
