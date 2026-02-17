/**
 * AlignmentResultCard Component (Tool 1)
 *
 * Displays Organizational Alignment Assessment results
 * with dimension scores and composite score.
 *
 * Story 19.2: Diagnostic Results Display
 * Task 3.2: Create Tool 1 card (AC: 2)
 */

'use client';

import { Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ToolResultCard } from './ToolResultCard';
import type { AlignmentData } from './types';

interface AlignmentResultCardProps {
  data: AlignmentData | null | undefined;
}

const DIMENSIONS = [
  { key: 'strategic', label: 'Strategic' },
  { key: 'execution', label: 'Execution' },
  { key: 'technology', label: 'Technology' },
  { key: 'people', label: 'People' },
  { key: 'governance', label: 'Governance' },
] as const;

/**
 * Get score color class based on value
 */
function getScoreColorClass(score: number): string {
  if (score < 50) return 'text-red-600 dark:text-red-400';
  if (score < 70) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-green-600 dark:text-green-400';
}

/**
 * Get progress bar color based on value
 */
function getProgressClass(score: number): string {
  if (score < 50) return '[&>div]:bg-red-500';
  if (score < 70) return '[&>div]:bg-yellow-500';
  return '[&>div]:bg-green-500';
}

export function AlignmentResultCard({ data }: AlignmentResultCardProps) {
  if (!data) {
    return (
      <ToolResultCard
        toolNumber={1}
        toolName="Alignment Assessment"
        icon={Target}
        completedAt={null}
      >
        <p className="text-sm text-muted-foreground">
          Assess your organization across 5 alignment dimensions.
        </p>
      </ToolResultCard>
    );
  }

  return (
    <ToolResultCard
      toolNumber={1}
      toolName="Alignment Assessment"
      icon={Target}
      completedAt={data.completedAt || null}
      keyMetric={
        data.compositeScore !== undefined
          ? {
              label: 'Composite Score',
              value: `${data.compositeScore}/100`,
            }
          : undefined
      }
    >
      {/* Composite Score Display */}
      {data.compositeScore !== undefined && (
        <div className="flex items-center gap-2 mb-4">
          <span
            data-testid="composite-score"
            className={cn('text-2xl font-bold', getScoreColorClass(data.compositeScore))}
          >
            {data.compositeScore}
          </span>
          <span className="text-sm text-muted-foreground">/ 100</span>
        </div>
      )}

      {/* Dimension Scores */}
      {data.scores && (
        <div className="space-y-2">
          {DIMENSIONS.map(({ key, label }) => {
            const score = data.scores?.[key as keyof typeof data.scores];
            if (score === undefined) return null;

            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{label}</span>
                  <span
                    data-testid={`score-${key}`}
                    className={cn('font-medium', getScoreColorClass(score))}
                  >
                    {score}
                  </span>
                </div>
                <Progress
                  value={score}
                  className={cn('h-1.5', getProgressClass(score))}
                  data-testid={`dimension-bar-${key}`}
                  aria-label={`${label} score: ${score} out of 100`}
                />
              </div>
            );
          })}
        </div>
      )}
    </ToolResultCard>
  );
}
