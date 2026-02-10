/**
 * Continue To Next Tool Component
 *
 * Story 8.7: Guided Diagnostic Flow
 * Task 4: Create ContinueToNextTool component (AC: 5)
 *
 * Displays a prominent CTA to continue to the next tool
 * with context about what comes next.
 */

'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getToolByNumber, TOTAL_TOOLS } from './diagnostic-constants';
import { getToolGuidance } from './guidance-content';
import { cn } from '@/lib/utils';

export interface ContinueToNextToolProps {
  /** Current tool number (1-7) */
  currentToolNumber: number;
  /** Optional className for styling */
  className?: string;
}

export const ContinueToNextTool = memo(function ContinueToNextTool({
  currentToolNumber,
  className,
}: ContinueToNextToolProps) {
  const nextToolNumber = currentToolNumber + 1;
  const nextTool = getToolByNumber(nextToolNumber);
  const isLastTool = currentToolNumber >= TOTAL_TOOLS;

  // If this is the last tool, show a different CTA
  if (isLastTool) {
    return (
      <Card className={cn('border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/30', className)}>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col items-center text-center">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/50">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Diagnostic Complete!</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You&apos;ve completed all 7 diagnostic tools. View your full report to see
              the total cost of organizational misalignment.
            </p>
            <Button asChild className="mt-4" size="lg">
              <Link href="/diagnostic/report">
                View Full Diagnostic Report
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No next tool found (shouldn't happen but handle gracefully)
  if (!nextTool) {
    return null;
  }

  const nextGuidance = getToolGuidance(nextTool.id);
  const NextIcon = nextTool.icon;

  return (
    <Card className={cn('border-primary/20 bg-primary/5', className)}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <NextIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Up next</p>
              <h3 className="font-semibold">
                Tool {nextTool.number}: {nextTool.name}
              </h3>
              {nextGuidance && (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {nextGuidance.whatItMeasures}
                </p>
              )}
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>~{nextTool.estimatedMinutes} min</span>
              </div>
            </div>
          </div>
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href={nextTool.route}>
              Continue to {nextTool.shortName}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});
