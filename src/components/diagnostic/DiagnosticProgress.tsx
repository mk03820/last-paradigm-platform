/**
 * DiagnosticProgress Component
 *
 * Displays overall diagnostic completion progress.
 *
 * Story 8.5: Diagnostic Tool Hub
 * Story 8.7: Guided Diagnostic Flow (time estimates)
 * Covers: AC4 (overall completion percentage), AC2 (time estimates)
 */

'use client';

import { Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useDiagnosticProgress, useToolsWithStatus } from './useToolStatus';
import { cn } from '@/lib/utils';

export interface DiagnosticProgressProps {
  className?: string;
  showTimeEstimate?: boolean;
}

export function DiagnosticProgress({ className, showTimeEstimate = true }: DiagnosticProgressProps) {
  const { completedCount, inProgressCount, totalTools, percentage } = useDiagnosticProgress();
  const toolsWithStatus = useToolsWithStatus();

  // Calculate total and remaining time
  const totalMinutes = toolsWithStatus.reduce((sum, t) => sum + t.estimatedMinutes, 0);
  const remainingMinutes = toolsWithStatus
    .filter((t) => t.status !== 'completed')
    .reduce((sum, t) => sum + t.estimatedMinutes, 0);

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
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        {completedCount === 0 && (
          <p>Start with any tool to begin your diagnostic journey</p>
        )}
        {completedCount > 0 && completedCount < totalTools && (
          <p>Keep going! {totalTools - completedCount} tools remaining.</p>
        )}
        {completedCount === totalTools && (
          <p className="text-green-600 dark:text-green-400 font-medium">
            All tools completed! View your Total Cost of Misalignment.
          </p>
        )}
        {showTimeEstimate && completedCount < totalTools && (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>~{remainingMinutes} min remaining</span>
          </div>
        )}
        {showTimeEstimate && completedCount === 0 && (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Total: ~{totalMinutes} min</span>
          </div>
        )}
      </div>
    </div>
  );
}
