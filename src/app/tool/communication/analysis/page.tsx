/**
 * Tool 6: Communication Pattern Diagnostic - Analysis Page
 *
 * Displays anti-pattern detection results with severity indicators.
 *
 * Story 13.2: Anti-Pattern Detection
 * Task 6: Create analysis page (AC: all)
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout';
import { ProgressStepper } from '@/components/diagnostic';
import { Button } from '@/components/ui/button';
import {
  AntiPatternCard,
  AntiPatternSummary,
} from '@/components/tools/communication';
import {
  ANTI_PATTERNS,
  getAntiPatternById,
} from '@/components/tools/communication/comm-constants';
import { useTool6Store } from '@/lib/store/tool6-store';

export default function CommunicationAnalysisPage() {
  const router = useRouter();

  // Store state
  const isComplete = useTool6Store((state) => state.isComplete);
  const analysisResults = useTool6Store((state) => state.analysisResults);
  const runAnalysis = useTool6Store((state) => state.runAnalysis);

  // Run analysis on mount if not already done
  React.useEffect(() => {
    if (!analysisResults && isComplete()) {
      runAnalysis();
    }
  }, [analysisResults, isComplete, runAnalysis]);

  // Redirect if metrics not complete
  React.useEffect(() => {
    if (!isComplete()) {
      router.push('/tool/communication');
    }
  }, [isComplete, router]);

  // Show loading state while analysis is running
  if (!analysisResults) {
    return (
      <>
        <Header />
        <main className="min-h-[calc(100vh-56px)] bg-background">
          <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-muted-foreground">Analyzing communication patterns...</p>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Map results to patterns for display
  const patternResults = ANTI_PATTERNS.map((pattern) => {
    const result = analysisResults.results.find((r) => r.patternId === pattern.id);
    return {
      pattern,
      result: result || {
        patternId: pattern.id,
        detected: false,
        severity: 'none' as const,
        evidence: [],
        confidence: 1.0,
      },
    };
  });

  const handleContinue = () => {
    // Navigate to health dashboard (future story)
    router.push('/tool/communication/health');
  };

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-56px)] bg-background">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Back Navigation */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <Link
              href="/tool/communication"
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <span aria-hidden="true">&larr;</span>
              Back to Metrics Input
            </Link>
          </nav>

          {/* Progress Stepper */}
          <div className="mb-6">
            <ProgressStepper currentToolId="communication" />
          </div>

          {/* Page Header */}
          <header className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Communication Pattern Analysis
            </h1>
            <p className="mt-2 text-muted-foreground">
              Based on your metrics, we&apos;ve analyzed your organization&apos;s
              communication patterns for common anti-patterns that create friction
              and slow down information flow.
            </p>
          </header>

          {/* Analysis Summary */}
          <AntiPatternSummary analysis={analysisResults} className="mb-8" />

          {/* Anti-Pattern Cards */}
          <section aria-labelledby="patterns-heading" className="mb-8">
            <h2 id="patterns-heading" className="sr-only">
              Detected Anti-Patterns
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {patternResults.map(({ pattern, result }) => (
                <AntiPatternCard
                  key={pattern.id}
                  pattern={pattern}
                  result={result}
                />
              ))}
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Button variant="outline" asChild>
              <Link href="/tool/communication">
                <span aria-hidden="true" className="mr-2">&larr;</span>
                Back to Input
              </Link>
            </Button>

            <Button onClick={handleContinue} size="lg">
              Continue to Health Dashboard
              <span aria-hidden="true" className="ml-2">&rarr;</span>
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
