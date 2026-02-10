'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Header, StepIndicator } from '@/components/layout';
import {
  AlignmentRadarChart,
  CompositeScoreDisplay,
  DimensionScoresSummary,
  calculateCompositeScore,
} from '@/components/tools/alignment';
import { useTool1Store } from '@/lib/store/tool1-store';
import type { DimensionId } from '@/components/tools/alignment';

/**
 * Tool 1: Alignment Assessment Results Page
 *
 * Displays the weighted composite score, radar chart, and dimension breakdown.
 * Redirects to scoring page if assessment is incomplete.
 *
 * Story 9.2: Weighted Composite Score Calculation
 * Story 9.3: Radar Chart Visualization
 * Covers: FR2-7 (weighted composite calculation), FR2-8 (radar chart)
 */
export default function AlignmentResultsPage() {
  const router = useRouter();
  const { scores, isComplete } = useTool1Store();

  // Redirect if not complete
  useEffect(() => {
    if (!isComplete()) {
      router.replace('/tool/alignment');
    }
  }, [isComplete, router]);

  // Don't render if incomplete (will redirect)
  if (!isComplete()) {
    return null;
  }

  const compositeScore = calculateCompositeScore(scores);

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-56px)] bg-background">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Back Navigation */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <Link
              href="/tool/alignment"
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <span aria-hidden="true">&larr;</span>
              Back to Assessment
            </Link>
          </nav>

          {/* Step Indicator */}
          <div className="mb-6">
            <StepIndicator
              currentStep={1}
              totalSteps={7}
              stepLabel="Organizational Alignment Assessment - Results"
            />
          </div>

          {/* Page Header */}
          <header className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Your Alignment Assessment Results
            </h1>
            <p className="mt-2 text-muted-foreground">
              Based on your responses across 5 alignment dimensions
            </p>
          </header>

          {/* Composite Score Display */}
          <section className="mb-8">
            <CompositeScoreDisplay score={compositeScore} />
          </section>

          {/* Radar Chart Visualization */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Dimensional View</h2>
            <div className="rounded-xl border bg-card p-4">
              <AlignmentRadarChart
                scores={scores as Record<DimensionId, number>}
                showBenchmark={true}
              />
            </div>
          </section>

          {/* Dimension Breakdown */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Dimension Breakdown</h2>
            <DimensionScoresSummary
              scores={scores as Record<DimensionId, number>}
              sortByScore={false}
            />
          </section>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button variant="outline" asChild>
              <Link href="/tool/alignment">Revise Scores</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">Continue to Dashboard</Link>
            </Button>
          </div>

          {/* Methodology Note */}
          <div className="mt-8 p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
            <p className="font-medium mb-1">How this score is calculated</p>
            <p>
              Your composite score is a weighted average: Strategic (30%) + Execution (30%)
              + Technology (20%) + People (10%) + Governance (10%). This weighting reflects
              the relative impact each dimension has on organizational alignment.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
