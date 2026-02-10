/**
 * Quadrant Strategy Component
 *
 * Displays engagement strategy for a specific quadrant.
 *
 * Story 11.4: Engagement Strategy Generation
 * Covers: AC1 (quadrant engagement approach)
 */

'use client';

import React, { memo } from 'react';
import { Clock, MessageSquare, Users, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { StakeholderQuadrant } from './stakeholder-constants';
import {
  QUADRANT_STRATEGIES,
  CADENCE_LABELS,
  TIME_INVESTMENT_LABELS,
} from './engagement-strategies';
import { cn } from '@/lib/utils';

export interface QuadrantStrategyProps {
  quadrant: StakeholderQuadrant;
  stakeholderCount: number;
  blockerCount?: number;
  className?: string;
}

const QUADRANT_COLORS: Record<StakeholderQuadrant, { bg: string; border: string; badge: string }> = {
  key_players: {
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    border: 'border-blue-200 dark:border-blue-800',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
  },
  keep_satisfied: {
    bg: 'bg-purple-50 dark:bg-purple-950/20',
    border: 'border-purple-200 dark:border-purple-800',
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200',
  },
  keep_informed: {
    bg: 'bg-teal-50 dark:bg-teal-950/20',
    border: 'border-teal-200 dark:border-teal-800',
    badge: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-200',
  },
  monitor: {
    bg: 'bg-gray-50 dark:bg-gray-950/20',
    border: 'border-gray-200 dark:border-gray-800',
    badge: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200',
  },
};

const QUADRANT_LABELS: Record<StakeholderQuadrant, string> = {
  key_players: 'Key Players',
  keep_satisfied: 'Keep Satisfied',
  keep_informed: 'Keep Informed',
  monitor: 'Monitor',
};

export const QuadrantStrategy = memo(function QuadrantStrategy({
  quadrant,
  stakeholderCount,
  blockerCount = 0,
  className,
}: QuadrantStrategyProps) {
  const strategy = QUADRANT_STRATEGIES[quadrant];
  const colors = QUADRANT_COLORS[quadrant];

  return (
    <Card className={cn('border', colors.border, colors.bg, className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            {QUADRANT_LABELS[quadrant]}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={cn('text-xs', colors.badge)}>
              {stakeholderCount} stakeholder{stakeholderCount !== 1 ? 's' : ''}
            </Badge>
            {blockerCount > 0 && (
              <Badge className="text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {blockerCount} blocker{blockerCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{strategy.description}</p>

        <div className="grid grid-cols-2 gap-3 text-sm">
          {/* Cadence */}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">{CADENCE_LABELS[strategy.cadence]}</p>
              <p className="text-xs text-muted-foreground">Cadence</p>
            </div>
          </div>

          {/* Time Investment */}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium capitalize">{strategy.timeInvestment}</p>
              <p className="text-xs text-muted-foreground">Time investment</p>
            </div>
          </div>
        </div>

        {/* Content Types */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium">Recommended Content</p>
          </div>
          <div className="flex flex-wrap gap-1">
            {strategy.contentTypes.map((content) => (
              <Badge
                key={content}
                variant="outline"
                className="text-xs font-normal"
              >
                {content}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
