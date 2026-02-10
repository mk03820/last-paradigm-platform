/**
 * DiagnosticProgress Component
 *
 * Displays overall diagnostic completion progress.
 *
 * Story 8.5: Diagnostic Tool Hub
 * Covers: AC4 (overall completion percentage)
 */

'use client';

import { Progress } from '@/components/ui/progress';
import { useDiagnosticProgress } from './useToolStatus';
import { cn } from '@/lib/utils';

export interface DiagnosticProgressProps {
  className?: string;
}

export function DiagnosticProgress({ className }: DiagnosticProgressProps) {
  const { completedCount, inProgressCount, totalTools, percentage } = useDiagnosticProgress();

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <p className="font-medium">
          {completedCount} of {totalTools} tools completed
          {inProgressCount > 0 && (
            <span className="text-muted-foreground"> ({inProgressCount} in progress)</span>
          )}
        </p>
        <p className="font-semibold text-primary">{percentage}%</p>
      </div>
      <Progress value={percentage} className="h-2" aria-label={`Diagnostic progress: ${percentage}%`} />
      {completedCount === 0 && (
        <p className="text-xs text-muted-foreground">
          Start with any tool to begin your diagnostic journey
        </p>
      )}
      {completedCount === totalTools && (
        <p className="text-xs text-green-600 dark:text-green-400 font-medium">
          All tools completed! View your Total Cost of Misalignment.
        </p>
      )}
    </div>
  );
}
