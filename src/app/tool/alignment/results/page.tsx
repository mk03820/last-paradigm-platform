'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout';
import { ProgressStepper, ToolNavigation } from '@/components/diagnostic';
import {
  AlignmentRadarChart,
  CompositeScoreDisplay,
  DimensionScoresSummary,
  NextToolsRecommendation,
  ScoreInterpretation,
  WeakDimensionGuidance,
  calculateCompositeScore,
} from '@/components/tools/alignment';
import { useTool1Store } from '@/lib/store/tool1-store';
import type { DimensionId } from '@/components/tools/alignment';

/**
 * Tool 1: Alignment Assessment Results Page
 *
 * Displays the weighted composite score, radar chart, dimension breakdown,
 * interpretation, guidance, and next steps.
 * Redirects to scoring page if assessment is incomplete.
 *
 * Story 9.2: Weighted Composite Score Calculation
 * Story 9.3: Radar Chart Visualization
 * Story 9.4: Score Interpretation and Next Steps
 * Story 8.6: Progress Stepper Navigation
 * Covers: FR2-7, FR2-8, FR2-9, FR2-38 (Progress stepper)
 */
export default function AlignmentResultsPage() {
  const router = useRouter();
  const { scores, isComplete, completion, markComplete } = useTool1Store();
  const hasMarkedComplete = useRef(false);

  // Redirect if not complete
  useEffect(() => {
    if (!isComplete()) {
      router.replace('/tool/alignment');
    }
  }, [isComplete, router]);

  const compositeScore = calculateCompositeScore(scores);

  // Mark tool as complete on first view
  useEffect(() => {
    if (isComplete() && !completion && !hasMarkedComplete.current) {
      hasMarkedComplete.current = true;
      markComplete(compositeScore);
    }
  }, [isComplete, completion, markComplete, compositeScore]);

  // Don't render if incomplete (will redirect)
  if (!isComplete()) {
    return null;
  }

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

          {/* Progress Stepper */}
          <div className="mb-6">
            <ProgressStepper currentToolId="alignment" />
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

          {/* Score Interpretation */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4">What This Means</h2>
            <ScoreInterpretation score={compositeScore} />
          </section>

          {/* Dimension Breakdown */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Dimension Breakdown</h2>
            <DimensionScoresSummary
              scores={scores as Record<DimensionId, number>}
              sortByScore={false}
            />
          </section>

          {/* Weak Dimension Guidance */}
          <section className="mb-8">
            <WeakDimensionGuidance
              scores={scores as Record<DimensionId, number>}
            />
          </section>

          {/* Next Tools Recommendation */}
          <section className="mb-8">
            <NextToolsRecommendation
              scores={scores as Record<DimensionId, number>}
            />
          </section>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button variant="outline" asChild>
              <Link href="/tool/alignment">Revise Scores</Link>
            </Button>
          </div>

          {/* Tool Navigation */}
          <ToolNavigation currentToolNumber={1} className="mt-8" />

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
