/**
 * Tool 6: Communication Pattern Diagnostic - Interventions Page
 *
 * Displays intervention recommendations based on detected anti-patterns.
 *
 * Story 13.4: Intervention Recommendations
 * Task 6: Create interventions page (AC: all)
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout';
import { ProgressStepper } from '@/components/diagnostic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  InterventionCard,
  PrioritizedActionList,
  Tool6Summary,
} from '@/components/tools/communication';
import {
  ANTI_PATTERNS,
  getAntiPatternById,
  SEVERITY_STYLES,
} from '@/components/tools/communication/comm-constants';
import {
  getTopInterventions,
  getInterventionsByPatternWithMetadata,
  generateTool6Summary,
} from '@/components/tools/communication/intervention-engine';
import { evaluateHealth } from '@/components/tools/communication/health-engine';
import { useTool6Store } from '@/lib/store/tool6-store';
import { cn } from '@/lib/utils';

export default function CommunicationInterventionsPage() {
  const router = useRouter();

  // Store state
  const isComplete = useTool6Store((state) => state.isComplete);
  const analysisResults = useTool6Store((state) => state.analysisResults);
  const getMetrics = useTool6Store((state) => state.getMetrics);
  const runAnalysis = useTool6Store((state) => state.runAnalysis);
  const markComplete = useTool6Store((state) => state.markComplete);

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

  // Mark tool as complete when viewing interventions
  React.useEffect(() => {
    if (analysisResults) {
      markComplete();
    }
  }, [analysisResults, markComplete]);

  // Calculate health evaluation
  const healthEvaluation = React.useMemo(() => {
    if (!isComplete()) return null;
    return evaluateHealth(getMetrics());
  }, [isComplete, getMetrics]);

  // Generate summary for Tool 7
  const tool6Summary = React.useMemo(() => {
    if (!analysisResults || !healthEvaluation) return null;
    return generateTool6Summary(
      analysisResults,
      healthEvaluation.overallScore,
      healthEvaluation.overallStatus
    );
  }, [analysisResults, healthEvaluation]);

  // Show loading state
  if (!analysisResults || !healthEvaluation || !tool6Summary) {
    return (
      <>
        <Header />
        <main className="min-h-[calc(100vh-56px)] bg-background">
          <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Generating recommendations...
                </p>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Get prioritized interventions
  const topInterventions = getTopInterventions(analysisResults, 3);
  const interventionsByPattern = getInterventionsByPatternWithMetadata(analysisResults);

  const handleContinue = () => {
    router.push('/tool/total-cost');
  };

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-56px)] bg-background">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Back Navigation */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <Link
              href="/tool/communication/health"
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <span aria-hidden="true">&larr;</span>
              Back to Health Dashboard
            </Link>
          </nav>

          {/* Progress Stepper */}
          <div className="mb-6">
            <ProgressStepper currentToolId="communication" />
          </div>

          {/* Page Header */}
          <header className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Intervention Recommendations
            </h1>
            <p className="mt-2 text-muted-foreground">
              Based on your communication patterns, here are targeted interventions
              to improve information flow and reduce friction.
            </p>
          </header>

          {/* Top Priority Actions */}
          <PrioritizedActionList
            interventions={topInterventions}
            title="Top 3 Priority Actions"
            className="mb-8"
          />

          {/* All Interventions by Pattern */}
          {interventionsByPattern.length > 0 && (
            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-4">
                All Recommendations by Pattern
              </h2>

              <div className="space-y-6">
                {interventionsByPattern.map(({ patternId, severity, interventions }) => {
                  const pattern = getAntiPatternById(patternId);
                  const severityStyle = SEVERITY_STYLES[severity];

                  if (!pattern) return null;

                  return (
                    <Card key={patternId}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <span className="text-xl">{pattern.icon}</span>
                            {pattern.name}
                          </CardTitle>
                          <Badge
                            variant="secondary"
                            className={cn(severityStyle.bgColor, severityStyle.color)}
                          >
                            {severityStyle.label}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {interventions.map((intervention) => (
                            <InterventionCard
                              key={intervention.id}
                              intervention={intervention}
                              showPattern={false}
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {/* No Patterns Detected */}
          {interventionsByPattern.length === 0 && (
            <Card className="mb-8">
              <CardContent className="py-8 text-center">
                <div className="text-4xl mb-3">✅</div>
                <h3 className="text-lg font-semibold mb-2">
                  No Anti-Patterns Detected
                </h3>
                <p className="text-muted-foreground">
                  Your organization&apos;s communication patterns appear healthy.
                  Continue monitoring these metrics to maintain good practices.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Tool 6 Summary */}
          <Tool6Summary summary={tool6Summary} className="mb-8" />

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Button variant="outline" asChild>
              <Link href="/tool/communication/health">
                <span aria-hidden="true" className="mr-2">
                  &larr;
                </span>
                Back to Health
              </Link>
            </Button>

            <Button onClick={handleContinue} size="lg">
              Continue to Tool 7
              <span aria-hidden="true" className="ml-2">
                &rarr;
              </span>
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
