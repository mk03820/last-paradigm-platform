/**
 * Quadrant Summary Component
 *
 * Displays stakeholder counts per quadrant with engagement guidance.
 *
 * Story 11.2: 2x2 Matrix Visualization
 * Covers: AC2 (quadrant labels and summary)
 */

'use client';

import React, { memo, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { StakeholderQuadrant } from './stakeholder-constants';
import { QUADRANTS } from './stakeholder-constants';
import { cn } from '@/lib/utils';

export interface QuadrantSummaryProps {
  counts: Record<StakeholderQuadrant, number>;
  className?: string;
}

const QUADRANT_STYLES: Record<
  StakeholderQuadrant,
  { bg: string; border: string; badge: string }
> = {
  key_players: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
    badge: 'bg-blue-500 text-white',
  },
  keep_satisfied: {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    border: 'border-purple-200 dark:border-purple-800',
    badge: 'bg-purple-500 text-white',
  },
  keep_informed: {
    bg: 'bg-teal-50 dark:bg-teal-950/30',
    border: 'border-teal-200 dark:border-teal-800',
    badge: 'bg-teal-500 text-white',
  },
  monitor: {
    bg: 'bg-gray-50 dark:bg-gray-950/30',
    border: 'border-gray-200 dark:border-gray-800',
    badge: 'bg-gray-500 text-white',
  },
};

const ENGAGEMENT_GUIDANCE: Record<StakeholderQuadrant, string> = {
  key_players:
    'Engage closely and regularly. These stakeholders can champion or derail your initiative.',
  keep_satisfied:
    'Keep informed on major milestones. Don\'t overwhelm with details, but don\'t surprise them.',
  keep_informed:
    'Regular updates and involvement opportunities. They care about outcomes and can influence others.',
  monitor:
    'Minimal effort required. Periodic awareness updates to avoid being blindsided.',
};

export const QuadrantSummary = memo(function QuadrantSummary({
  counts,
  className,
}: QuadrantSummaryProps) {
  // Find the quadrant with the most stakeholders
  const maxQuadrant = useMemo(() => {
    let max: StakeholderQuadrant = 'key_players';
    let maxCount = 0;

    (Object.entries(counts) as [StakeholderQuadrant, number][]).forEach(
      ([quadrant, count]) => {
        if (count > maxCount) {
          max = quadrant;
          maxCount = count;
        }
      }
    );

    return maxCount > 0 ? max : null;
  }, [counts]);

  const totalStakeholders = useMemo(
    () => Object.values(counts).reduce((sum, count) => sum + count, 0),
    [counts]
  );

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Quadrant Summary</CardTitle>
        <p className="text-sm text-muted-foreground">
          {totalStakeholders} stakeholder{totalStakeholders !== 1 ? 's' : ''} mapped
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {QUADRANTS.map((quadrant) => {
          const count = counts[quadrant.id];
          const styles = QUADRANT_STYLES[quadrant.id];
          const isMax = quadrant.id === maxQuadrant && count > 0;

          return (
            <div
              key={quadrant.id}
              className={cn(
                'rounded-lg border p-3 transition-colors',
                styles.bg,
                styles.border,
                isMax && 'ring-2 ring-primary ring-offset-1'
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">{quadrant.label}</span>
                <Badge className={cn('text-xs', styles.badge)}>{count}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {ENGAGEMENT_GUIDANCE[quadrant.id]}
              </p>
            </div>
          );
        })}

        {totalStakeholders === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Add stakeholders to see their distribution across quadrants.
          </p>
        )}
      </CardContent>
    </Card>
  );
});
