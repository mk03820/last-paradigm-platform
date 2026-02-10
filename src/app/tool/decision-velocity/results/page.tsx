'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Header, StepIndicator } from '@/components/layout';
import {
  LatencyMetricsCard,
  VelocityResultsSummary,
  calculateAllMetrics,
  findSlowestArchetype,
} from '@/components/tools/decision-velocity';
import { useTool3Store } from '@/lib/store/tool3-store';

/**
 * Tool 3: Decision Velocity Results Page
 *
 * Displays calculated latency metrics for each decision archetype.
 * Redirects to input page if no valid data exists.
 *
 * Story 10.2: Latency Calculation and Display
 * Covers: FR2-12 (Latency calculations)
 */
export default function DecisionVelocityResultsPage() {
  const router = useRouter();
  const { archetypes, canProceed, completion, markComplete } = useTool3Store();
  const hasMarkedComplete = useRef(false);

  // Calculate metrics from store data
  const metrics = calculateAllMetrics(archetypes);
  const slowest = findSlowestArchetype(metrics);

  // Redirect if no valid data
  useEffect(() => {
    if (!canProceed()) {
      router.replace('/tool/decision-velocity');
    }
  }, [canProceed, router]);

  // Mark tool as complete on first view
  useEffect(() => {
    if (canProceed() && !completion && !hasMarkedComplete.current) {
      hasMarkedComplete.current = true;
      markComplete();
    }
  }, [canProceed, completion, markComplete]);

  // Don't render if no valid data (will redirect)
  if (!canProceed() || metrics.length === 0) {
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
              href="/tool/decision-velocity"
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <span aria-hidden="true">&larr;</span>
              Back to Input
            </Link>
          </nav>

          {/* Step Indicator */}
          <div className="mb-6">
            <StepIndicator
              currentStep={3}
              totalSteps={7}
              stepLabel="Decision Velocity Scorecard - Results"
            />
          </div>

          {/* Page Header */}
          <header className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Your Decision Velocity Results
            </h1>
            <p className="mt-2 text-muted-foreground">
              Based on {metrics.reduce((sum, m) => sum + m.sampleCount, 0)} decisions
              across {metrics.length} categor{metrics.length !== 1 ? 'ies' : 'y'}
            </p>
          </header>

          {/* Summary Section */}
          <section className="mb-8">
            <VelocityResultsSummary metrics={metrics} />
          </section>

          {/* Individual Category Cards */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4">By Category</h2>
            <div className="space-y-4">
              {metrics.map((m) => (
                <LatencyMetricsCard
                  key={m.archetypeId}
                  metrics={m}
                  isHighlighted={slowest?.archetypeId === m.archetypeId}
                />
              ))}
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button variant="outline" asChild>
              <Link href="/tool/decision-velocity">Revise Data</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">Continue to Dashboard</Link>
            </Button>
          </div>

          {/* Methodology Note */}
          <div className="mt-8 p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
            <p className="font-medium mb-1">How metrics are calculated</p>
            <p>
              <strong>Decision Time:</strong> Days from request to approval (median
              of your samples).{' '}
              <strong>90th Percentile:</strong> The time that 90% of decisions
              complete within, highlighting outliers.{' '}
              <strong>To Start:</strong> Days from approval to implementation
              beginning.{' '}
              <strong>Total Cycle:</strong> End-to-end time from request to
              implementation start.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
