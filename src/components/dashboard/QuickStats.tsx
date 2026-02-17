/**
 * QuickStats Component
 *
 * Displays quick summary statistics including alignment tax,
 * estimated savings, and diagnostic completion status.
 *
 * Story 19.1: Dashboard Layout & Navigation
 * Task 3: Create quick stats summary component (AC: 1)
 * Covers: FR64 (Quick stats summary)
 */

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  DollarSign,
  TrendingDown,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

interface DiagnosticSummary {
  completedTools: number;
  totalAlignmentTax: number | null;
  estimatedSavings: number | null;
  lastCompletedAt: string | null;
}

interface QuickStatsProps {
  diagnosticSummary: DiagnosticSummary | null;
}

/**
 * Format currency with proper separators
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function QuickStats({ diagnosticSummary }: QuickStatsProps) {
  const hasCompletedDiagnostic = diagnosticSummary && diagnosticSummary.completedTools > 0;
  const isFullyComplete = diagnosticSummary?.completedTools === 7;
  const completionPercent = diagnosticSummary
    ? Math.round((diagnosticSummary.completedTools / 7) * 100)
    : 0;

  // Empty state - no diagnostics started
  if (!diagnosticSummary || diagnosticSummary.completedTools === 0) {
    return (
      <section
        aria-label="Quick stats summary"
        role="region"
        className="mb-8"
      >
        <h2 className="text-lg font-semibold mb-4">Your Diagnostic Overview</h2>

        <Card className="bg-muted/50 border-dashed">
          <CardContent className="pt-6 text-center">
            <div className="mb-4">
              <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Diagnostic Started</h3>
            <p className="text-muted-foreground mb-4">
              Start your organizational alignment diagnostic to see your alignment tax and potential savings.
            </p>
            <Button asChild>
              <Link href="/diagnostic">
                Start Diagnostic
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section
      aria-label="Quick stats summary"
      role="region"
      className="mb-8"
    >
      <h2 className="text-lg font-semibold mb-4">Your Diagnostic Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Alignment Tax Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alignment Tax</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {diagnosticSummary.totalAlignmentTax !== null ? (
              <>
                <div className="text-2xl font-bold text-accent">
                  {formatCurrency(diagnosticSummary.totalAlignmentTax)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Annual cost of misalignment
                </p>
              </>
            ) : (
              <>
                <div className="text-lg font-medium text-muted-foreground">
                  In Progress
                </div>
                <p className="text-xs text-muted-foreground">
                  Complete diagnostic to calculate
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Estimated Savings Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Savings</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {diagnosticSummary.estimatedSavings !== null ? (
              <>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(diagnosticSummary.estimatedSavings)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Potential annual savings
                </p>
              </>
            ) : (
              <>
                <div className="text-lg font-medium text-muted-foreground">
                  Pending
                </div>
                <p className="text-xs text-muted-foreground">
                  Complete diagnostic to calculate
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Completion Status Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Status</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {diagnosticSummary.completedTools} of 7
            </div>
            <Progress value={completionPercent} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {isFullyComplete
                ? 'All tools complete'
                : `${7 - diagnosticSummary.completedTools} tools remaining`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Continue CTA if not fully complete */}
      {!isFullyComplete && (
        <div className="mt-4 text-center">
          <Button variant="outline" asChild>
            <Link href="/diagnostic">
              Continue Diagnostic
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </section>
  );
}
