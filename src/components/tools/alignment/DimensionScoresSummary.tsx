'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ALIGNMENT_DIMENSIONS } from './constants';
import type { DimensionId } from './constants';

interface DimensionScoresSummaryProps {
  scores: Record<DimensionId, number>;
  sortByScore?: boolean;
}

/**
 * DimensionScoresSummary Component
 *
 * Displays all 5 dimension scores with their weights
 * and highlights the weakest dimension.
 *
 * Story 9.2: Weighted Composite Score Calculation
 * Covers: AC5 (dimension scores displayed)
 */
export function DimensionScoresSummary({
  scores,
  sortByScore = false,
}: DimensionScoresSummaryProps) {
  // Find lowest score to highlight
  const lowestScore = Math.min(...Object.values(scores));
  const lowestDimensions = Object.entries(scores)
    .filter(([, score]) => score === lowestScore)
    .map(([id]) => id);

  // Sort dimensions if requested
  const dimensions = React.useMemo(() => {
    const dims = [...ALIGNMENT_DIMENSIONS];
    if (sortByScore) {
      dims.sort((a, b) => (scores[a.id] ?? 0) - (scores[b.id] ?? 0));
    }
    return dims;
  }, [scores, sortByScore]);

  return (
    <div className="space-y-3" role="list" aria-label="Dimension scores">
      {dimensions.map((dimension) => {
        const score = scores[dimension.id] ?? 0;
        const isLowest = lowestDimensions.includes(dimension.id);
        const progressValue = ((score - 1) / 3) * 100; // Convert 1-4 to 0-100

        return (
          <Card
            key={dimension.id}
            className={cn(
              'transition-colors',
              isLowest && 'border-orange-300 dark:border-orange-700 bg-orange-50/50 dark:bg-orange-950/30'
            )}
            role="listitem"
          >
            <CardContent className="py-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{dimension.label}</span>
                  {isLowest && (
                    <span className="text-xs px-2 py-0.5 rounded bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                      Needs attention
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {Math.round(dimension.weight * 100)}% weight
                  </span>
                  <span className="font-bold text-lg tabular-nums w-8 text-right">
                    {score}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Progress
                  value={progressValue}
                  className="h-2 flex-1"
                  aria-label={`${dimension.label} score: ${score} out of 4`}
                />
                <span className="text-xs text-muted-foreground w-16 text-right">
                  {getScoreLabel(score)}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function getScoreLabel(score: number): string {
  switch (score) {
    case 1:
      return 'Chaos';
    case 2:
      return 'Siloed';
    case 3:
      return 'Coordinated';
    case 4:
      return 'Integrated';
    default:
      return '';
  }
}
