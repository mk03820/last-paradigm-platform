/**
 * Tool 6: Communication Pattern Diagnostic - Health Dashboard Page
 *
 * Displays health indicators against benchmarks with overall score.
 *
 * Story 13.3: Health Indicators Dashboard
 * Task 6: Create health dashboard page (AC: all)
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
  OverallHealthScore,
  HealthIndicatorsTable,
} from '@/components/tools/communication';
import {
  ANTI_PATTERNS,
  getAntiPatternById,
  getSeverityStyle,
} from '@/components/tools/communication/comm-constants';
import { evaluateHealth } from '@/components/tools/communication/health-engine';
import { useTool6Store } from '@/lib/store/tool6-store';

export default function HealthDashboardPage() {
  const router = useRouter();

  // Store state
  const email = useTool6Store((state) => state.email);
  const chat = useTool6Store((state) => state.chat);
  const meetings = useTool6Store((state) => state.meetings);
  const analysisResults = useTool6Store((state) => state.analysisResults);
  const isComplete = useTool6Store((state) => state.isComplete);

  // Evaluate health indicators
  const healthResults = React.useMemo(() => {
    return evaluateHealth({ email, chat, meetings });
  }, [email, chat, meetings]);

  // Get detected anti-patterns from analysis
  const detectedPatterns = React.useMemo(() => {
    if (!analysisResults) return [];
    return analysisResults.results
      .filter((r) => r.detected)
      .map((r) => ({
        pattern: getAntiPatternById(r.patternId)!,
        severity: r.severity,
      }))
      .filter((p) => p.pattern);
  }, [analysisResults]);

  // Check if user has completed metrics input
  const hasMetrics = email || chat || meetings;

  const handleContinue = () => {
    // Navigate to interventions page (Story 13.4)
    router.push('/tool/communication/interventions');
  };

  const handleBackToAnalysis = () => {
    router.push('/tool/communication/analysis');
  };

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-56px)] bg-background">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Back Navigation */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <Link
              href="/tool/communication/analysis"
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <span aria-hidden="true">&larr;</span>
              Back to Analysis
            </Link>
          </nav>

          {/* Progress Stepper */}
          <div className="mb-6">
            <ProgressStepper currentToolId="communication" />
          </div>

          {/* Page Header */}
          <header className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Communication Health Dashboard
            </h1>
            <p className="mt-2 text-muted-foreground">
              See how your communication metrics compare against healthy
              organization benchmarks.
            </p>
          </header>

          {/* No Data Warning */}
          {!hasMetrics && (
            <Card className="mb-8 border-yellow-300 dark:border-yellow-700">
              <CardContent className="py-6">
                <div className="flex items-start gap-3">
                  <span className="text-2xl" aria-hidden="true">
                    ⚠️
                  </span>
                  <div>
                    <h2 className="font-semibold">No Metrics Data</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Please complete the communication metrics input first to
                      see your health indicators.
                    </p>
                    <Link
                      href="/tool/communication"
                      className="text-sm text-primary hover:underline mt-2 inline-block"
                    >
                      Go to Metrics Input &rarr;
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Overall Health Score */}
          {hasMetrics && (
            <div className="mb-8">
              <OverallHealthScore result={healthResults} />
            </div>
          )}

          {/* Health Indicators Table */}
          {hasMetrics && (
            <div className="mb-8">
              <HealthIndicatorsTable results={healthResults.indicators} />
            </div>
          )}

          {/* Anti-Patterns Summary */}
          {analysisResults && detectedPatterns.length > 0 && (
            <Card className="mb-8">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span aria-hidden="true">🔍</span>
                  Detected Anti-Patterns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {detectedPatterns.length} of {ANTI_PATTERNS.length} anti-patterns detected in your
                  communication analysis.
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {detectedPatterns.map(({ pattern, severity }) => {
                    const severityStyle = getSeverityStyle(severity);
                    return (
                      <Badge
                        key={pattern.id}
                        variant="outline"
                        className={severityStyle.color}
                      >
                        <span aria-hidden="true" className="mr-1">
                          {pattern.icon}
                        </span>
                        {pattern.name}
                        <span className="ml-1 text-xs opacity-75">
                          ({severityStyle.label})
                        </span>
                      </Badge>
                    );
                  })}
                </div>

                <Link
                  href="/tool/communication/analysis"
                  className="text-sm text-primary hover:underline"
                >
                  View Full Analysis &rarr;
                </Link>
              </CardContent>
            </Card>
          )}

          {/* No Analysis Warning */}
          {hasMetrics && !analysisResults && (
            <Card className="mb-8 border-muted">
              <CardContent className="py-6">
                <div className="flex items-start gap-3">
                  <span className="text-2xl" aria-hidden="true">
                    ℹ️
                  </span>
                  <div>
                    <h2 className="font-semibold">Analysis Not Run</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Run the anti-pattern analysis to see which communication
                      patterns are affecting your organization.
                    </p>
                    <Link
                      href="/tool/communication/analysis"
                      className="text-sm text-primary hover:underline mt-2 inline-block"
                    >
                      Run Analysis &rarr;
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={handleBackToAnalysis}>
              <span aria-hidden="true" className="mr-2">
                &larr;
              </span>
              Back to Analysis
            </Button>

            <Button onClick={handleContinue} size="lg" disabled={!hasMetrics}>
              Continue to Interventions
              <span aria-hidden="true" className="ml-2">
                &rarr;
              </span>
            </Button>
          </div>

          {/* Completion hint */}
          {!hasMetrics && (
            <p className="mt-4 text-sm text-muted-foreground text-right">
              Complete metrics input to continue to intervention recommendations
            </p>
          )}
        </div>
      </main>
    </>
  );
}
