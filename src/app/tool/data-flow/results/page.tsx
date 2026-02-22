/**
 * Results Page
 *
 * Step 4 of Tool 5: Data Flow Friction Analysis.
 * Displays friction category breakdown, interpretation,
 * critical friction points, and recommendations.
 *
 * Story 12.4: Friction Category Breakdown and Recommendations
 * Covers: AC1-AC5 (category chart, interpretation, recommendations,
 *         critical highlighting, Tool 7 feed indicator)
 */

'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTool5Store } from '@/lib/store/tool5-store';
import { ProgressStepper, ToolGuidance } from '@/components/diagnostic';
import {
  CategoryChart,
  FrictionInterpretation,
  CriticalFriction,
  ResultsSummary,
} from '@/components/tools/data-flow';
import {
  calculateCostByCategory,
  countPointsWithCost,
} from '@/components/tools/data-flow/cost-constants';

export default function ResultsPage() {
  const {
    journeys,
    frictionPoints,
    completion,
    markComplete,
  } = useTool5Store();

  // Calculate cost by category
  const costByCategory = useMemo(
    () => calculateCostByCategory(frictionPoints),
    [frictionPoints]
  );

  // Count costed friction points
  const costedCount = useMemo(
    () => countPointsWithCost(frictionPoints),
    [frictionPoints]
  );

  // Mark tool as complete on first view with data
  useEffect(() => {
    if (
      !completion &&
      journeys.length > 0 &&
      frictionPoints.length > 0 &&
      costedCount > 0
    ) {
      markComplete();
    }
  }, [completion, journeys.length, frictionPoints.length, costedCount, markComplete]);

  // Empty state - no journeys
  if (journeys.length === 0) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <ProgressStepper currentToolId="data-flow" />

        <div className="mt-6 rounded-lg border bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">
            Before viewing results, you need to map journeys, identify friction
            points, and add cost estimates. Go back and complete those steps first.
          </p>
        </div>

        <div className="mt-8 text-center">
          <Button asChild>
            <Link href="/tool/data-flow">Map Data Journeys</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Empty state - no friction points
  if (frictionPoints.length === 0) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <ProgressStepper currentToolId="data-flow" />

        <div className="mt-6 rounded-lg border bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">
            Before viewing results, you need to identify friction points and add
            cost estimates. Go back and complete those steps first.
          </p>
        </div>

        <div className="mt-8 text-center">
          <Button asChild>
            <Link href="/tool/data-flow/friction">Identify Friction Points</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Empty state - no cost data
  if (costedCount === 0) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <ProgressStepper currentToolId="data-flow" />

        <div className="mt-6 rounded-lg border bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">
            Before viewing results, you need to add cost estimates to your
            friction points. Go back and complete that step first.
          </p>
        </div>

        <div className="mt-8 text-center">
          <Button asChild>
            <Link href="/tool/data-flow/costs">Add Cost Estimates</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <ProgressStepper currentToolId="data-flow" />

      <ToolGuidance toolId="data-flow" className="mt-6" />

      {/* Page Header */}
      <header className="mt-8 mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Friction Analysis Results
        </h1>
        <p className="mt-2 text-muted-foreground">
          Review your friction analysis results and understand whether to
          prioritize organizational or technical fixes.
        </p>
      </header>

      {/* Results Summary */}
      <ResultsSummary
        frictionPoints={frictionPoints}
        journeys={journeys}
      />

      {/* Category Breakdown */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Cost by Friction Category</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryChart costByCategory={costByCategory} />
        </CardContent>
      </Card>

      {/* Interpretation */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold">Interpretation</h2>
        <FrictionInterpretation costByCategory={costByCategory} />
      </div>

      {/* Critical Friction Points */}
      <div className="mt-8">
        <CriticalFriction
          frictionPoints={frictionPoints}
          journeys={journeys}
        />
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <Button variant="outline" asChild>
          <Link href="/tool/data-flow/costs">Back to Cost Analysis</Link>
        </Button>
        <Button asChild>
          <Link href="/tool/communication">Continue to Tool 6</Link>
        </Button>
      </div>
    </div>
  );
}
