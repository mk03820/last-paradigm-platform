/**
 * Total Cost of Misalignment - Results Page
 *
 * Displays the calculated alignment tax with interpretation.
 *
 * Story 14.3: Alignment Tax Calculation and Interpretation
 * Task 7: Create results page (AC: all)
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header, StepIndicator } from '@/components/layout';
import {
  AlignmentTaxHeadline,
  PercentOfRevenueDisplay,
  InterpretationCard,
  CostSourceBreakdown,
  CostCategoryMiniChart,
  calculateTotalAlignmentTax,
} from '@/components/tools/total-cost';
import type { AggregatedToolData, AdditionalCosts } from '@/components/tools/total-cost/cost-constants';

/**
 * Mock data for development - will be replaced with actual store data
 * when Stories 14.1 and 14.2 are complete
 */
function getMockData(): {
  aggregatedData: AggregatedToolData;
  additionalCosts: AdditionalCosts;
  revenue: number;
} {
  return {
    aggregatedData: {
      tool1: {
        compositeScore: 2.3,
        category: 'siloed',
        weakestDimension: 'Communication',
        completedAt: new Date().toISOString(),
      },
      tool2: {
        annualizedWaste: 1200000,
        meetingsPerWeek: 45,
        totalAttendeeHours: 540,
        completedAt: new Date().toISOString(),
      },
      tool3: {
        avgDecisionLatencyDays: 12,
        bottleneckPatterns: ['Approval bottleneck', 'Information silos'],
        decisionTypeCount: 4,
        completedAt: new Date().toISOString(),
      },
      tool4: {
        stakeholderCount: 15,
        blockerCount: 3,
        keyPlayerCount: 5,
        riskLevel: 'medium',
        completedAt: new Date().toISOString(),
      },
      tool5: {
        totalFrictionCost: 450000,
        journeyCount: 5,
        frictionPointCount: 12,
        criticalFrictionCount: 3,
        completedAt: new Date().toISOString(),
      },
      tool6: {
        healthScore: 58,
        healthStatus: 'warning',
        patternsDetected: 3,
        interventionsRecommended: 5,
        completedAt: new Date().toISOString(),
      },
      aggregatedAt: new Date().toISOString(),
      completedToolsCount: 6,
      canProceed: true,
    },
    additionalCosts: {
      projectDelays: {
        annualProjectBudget: 2000000,
        delayPercentage: 15,
        subtotal: 350000,
      },
      rework: {
        annualLaborBudget: 3000000,
        reworkPercentage: 20,
        subtotal: 600000,
      },
      turnover: {
        annualTurnoverCost: 500000,
        alignmentAttributionPercent: 40,
        subtotal: 200000,
      },
      opportunityCost: {
        estimatedAmount: 100000,
        subtotal: 100000,
      },
      total: 1250000,
    },
    revenue: 70000000,
  };
}

/**
 * Total Cost of Misalignment Results Page
 */
export default function TotalCostResultsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);

  // TODO: Replace with actual store data when 14.1 and 14.2 are complete
  const { aggregatedData, additionalCosts, revenue } = getMockData();

  // Calculate alignment tax
  const result = React.useMemo(
    () => calculateTotalAlignmentTax(aggregatedData, additionalCosts, revenue),
    [aggregatedData, additionalCosts, revenue]
  );

  // Simulate loading state
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Redirect if no data
  React.useEffect(() => {
    if (!aggregatedData.canProceed) {
      router.replace('/tool/total-cost/inputs');
    }
  }, [aggregatedData.canProceed, router]);

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-[calc(100vh-56px)] bg-background">
          <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-muted rounded w-1/3 mx-auto" />
              <div className="h-24 bg-muted rounded w-1/2 mx-auto" />
              <div className="h-48 bg-muted rounded" />
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-56px)] bg-background">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Back Navigation */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <Link
              href="/tool/total-cost/inputs"
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <span aria-hidden="true">&larr;</span>
              Back to Inputs
            </Link>
          </nav>

          {/* Step Indicator */}
          <div className="mb-6">
            <StepIndicator
              currentStep={7}
              totalSteps={7}
              stepLabel="Total Cost of Misalignment - Results"
            />
          </div>

          {/* Page Header */}
          <header className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Your Total Alignment Tax
            </h1>
            <p className="mt-2 text-muted-foreground">
              The annual cost of organizational misalignment
            </p>
          </header>

          {/* Headline Number */}
          <section className="mb-8" aria-labelledby="headline-section">
            <h2 id="headline-section" className="sr-only">
              Total Alignment Tax Amount
            </h2>
            <div className="py-8 px-4 rounded-lg bg-muted/30">
              <AlignmentTaxHeadline amount={result.total} />
              <div className="mt-6">
                <PercentOfRevenueDisplay
                  percentOfRevenue={result.percentOfRevenue}
                  revenue={result.revenue}
                  interpretation={result.interpretation}
                />
              </div>
            </div>
          </section>

          {/* Interpretation */}
          <section className="mb-8" aria-labelledby="interpretation-section">
            <h2 id="interpretation-section" className="sr-only">
              Interpretation
            </h2>
            <InterpretationCard interpretation={result.interpretation} />
          </section>

          {/* Cost Breakdown */}
          <section className="mb-8" aria-labelledby="breakdown-section">
            <h2 id="breakdown-section" className="sr-only">
              Cost Breakdown
            </h2>
            <CostSourceBreakdown result={result} />

            {/* Link to detailed breakdown */}
            <div className="mt-4 flex items-center justify-between p-4 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-4">
                <CostCategoryMiniChart result={result} className="hidden sm:block" />
                <div>
                  <p className="font-medium">Want more detail?</p>
                  <p className="text-sm text-muted-foreground">
                    View interactive charts with filtering and sorting
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/tool/total-cost/breakdown">
                  <BarChart3 className="w-4 h-4 mr-2" aria-hidden="true" />
                  View Breakdown
                </Link>
              </Button>
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button variant="outline" asChild>
              <Link href="/tool/total-cost/inputs">Revise Inputs</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/tool/total-cost/breakdown">
                <BarChart3 className="w-4 h-4 mr-2" aria-hidden="true" />
                Category Breakdown
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
          </div>

          {/* Methodology Note */}
          <div className="mt-8 p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
            <p className="font-medium mb-1">How this is calculated</p>
            <p>
              <strong>Total Alignment Tax</strong> = Meeting Waste + Data
              Friction + Project Delays + Rework + Turnover + Opportunity Cost.
              The percentage is calculated against your annual revenue to show
              the drag on organizational performance. Thresholds are based on
              industry benchmarks.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
