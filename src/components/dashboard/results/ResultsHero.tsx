/**
 * ResultsHero Component
 *
 * Displays key diagnostic metrics in a hero section with
 * prominent alignment tax, savings potential, and composite score.
 *
 * Story 19.2: Diagnostic Results Display
 * Task 2: Create key metrics hero section (AC: 3, 4)
 * Covers: FR64 (Key metrics highlighted)
 */

'use client';

import Link from 'next/link';
import { ArrowRight, Calendar, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { ResultsHeroData } from './types';

interface ResultsHeroProps {
  results: ResultsHeroData | null;
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

/**
 * Format date in user-friendly format
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Get score color class based on value
 */
function getScoreColorClass(score: number): string {
  if (score < 50) return 'text-red-600 dark:text-red-400';
  if (score < 70) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-green-600 dark:text-green-400';
}

export function ResultsHero({ results }: ResultsHeroProps) {
  // Empty state
  if (!results) {
    return (
      <section
        aria-label="Diagnostic summary"
        role="region"
        className="mb-8"
      >
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="mb-4">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/50" />
            </div>
            <h1 className="text-2xl font-bold mb-2">No Diagnostic Results Yet</h1>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Complete your organizational alignment diagnostic to see your alignment tax,
              potential savings, and personalized recommendations.
            </p>
            <Button asChild size="lg">
              <Link href="/diagnostic">
                Start Your Diagnostic
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  // Check if results are partial (incomplete diagnostic)
  const isPartial = results.totalAlignmentTax === null;

  return (
    <section
      aria-label="Diagnostic summary"
      role="region"
      className="mb-8"
      data-testid="results-hero"
    >
      {/* Page title and metadata */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Your Diagnostic Results
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {results.sessionName && (
            <span className="font-medium">{results.sessionName}</span>
          )}

          {results.completedAt ? (
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Completed {formatDate(results.completedAt)}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
              <Calendar className="h-4 w-4" />
              In Progress
            </span>
          )}

          <span className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            The Last Paradigm Methodology
          </span>
        </div>
      </div>

      {/* Key metrics cards */}
      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        data-testid="results-hero"
      >
        {/* Total Alignment Tax - Most prominent */}
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Total Alignment Tax
            </p>
            {results.totalAlignmentTax !== null ? (
              <div
                data-testid="alignment-tax-value"
                className="text-4xl md:text-5xl font-bold text-accent"
                aria-label="Total alignment tax"
              >
                {formatCurrency(results.totalAlignmentTax)}
              </div>
            ) : (
              <div className="text-xl font-medium text-muted-foreground">
                Calculating...
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Annual cost of organizational misalignment
            </p>
          </CardContent>
        </Card>

        {/* Estimated Savings */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Estimated Annual Savings
            </p>
            {results.estimatedSavings !== null ? (
              <div
                className="text-3xl font-bold text-green-600 dark:text-green-400"
                aria-label="Estimated savings"
              >
                {formatCurrency(results.estimatedSavings)}
              </div>
            ) : (
              <div className="text-xl font-medium text-muted-foreground">
                Pending
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Potential savings with Playbook 2
            </p>
          </CardContent>
        </Card>

        {/* Composite Alignment Score */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Alignment Score
            </p>
            {results.compositeScore !== null ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span
                    data-testid="composite-score-value"
                    className={cn(
                      'text-3xl font-bold',
                      getScoreColorClass(results.compositeScore)
                    )}
                    aria-label="Alignment score"
                  >
                    {results.compositeScore}
                  </span>
                  <span className="text-sm text-muted-foreground">/ 100</span>
                </div>
                <Progress
                  value={results.compositeScore}
                  className="mt-3 h-2"
                  aria-label={`Alignment score progress: ${results.compositeScore}%`}
                />
              </>
            ) : (
              <div className="text-xl font-medium text-muted-foreground">
                Pending
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Overall organizational alignment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Partial results CTA */}
      {isPartial && (
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Diagnostic in progress:</strong> Complete all 7 tools to see your full
            alignment tax calculation and personalized recommendations.
          </p>
          <Button variant="outline" asChild className="mt-3">
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
