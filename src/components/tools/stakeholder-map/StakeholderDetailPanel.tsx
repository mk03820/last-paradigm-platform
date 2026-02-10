/**
 * Stakeholder Detail Panel Component
 *
 * Displays full details for a selected stakeholder.
 *
 * Story 11.2: 2x2 Matrix Visualization
 * Covers: AC4 (clicking a stakeholder shows their full details)
 */

'use client';

import React, { memo } from 'react';
import { X, Edit2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Stakeholder, StakeholderQuadrant } from './stakeholder-constants';
import {
  getQuadrant,
  getQuadrantInfo,
  getPowerLevel,
  getInterestLevel,
} from './stakeholder-constants';
import { cn } from '@/lib/utils';

export interface StakeholderDetailPanelProps {
  stakeholder: Stakeholder;
  onEdit?: () => void;
  onClose?: () => void;
  className?: string;
}

const QUADRANT_BADGE_STYLES: Record<StakeholderQuadrant, string> = {
  key_players: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
  keep_satisfied: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200',
  keep_informed: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-200',
  monitor: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200',
};

export const StakeholderDetailPanel = memo(function StakeholderDetailPanel({
  stakeholder,
  onEdit,
  onClose,
  className,
}: StakeholderDetailPanelProps) {
  const quadrant = getQuadrant(stakeholder.power, stakeholder.interest);
  const quadrantInfo = getQuadrantInfo(quadrant);
  const powerLevel = getPowerLevel(stakeholder.power);
  const interestLevel = getInterestLevel(stakeholder.interest);

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">{stakeholder.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{stakeholder.role}</p>
            </div>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onClose}
              aria-label="Close details"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quadrant Badge */}
        <div>
          <Badge className={cn('text-xs', QUADRANT_BADGE_STYLES[quadrant])}>
            {quadrantInfo.label}
          </Badge>
          <p className="mt-1 text-sm text-muted-foreground">
            {quadrantInfo.description}
          </p>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-2 gap-4">
          {/* Power Score */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Power</span>
              <span className="text-sm font-bold">{stakeholder.power}/10</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${(stakeholder.power / 10) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{powerLevel.label}</p>
          </div>

          {/* Interest Score */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Interest</span>
              <span className="text-sm font-bold">{stakeholder.interest}/10</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${(stakeholder.interest / 10) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{interestLevel.label}</p>
          </div>
        </div>

        {/* Calibration Details */}
        <div className="space-y-2 text-sm">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="font-medium mb-1">Power: {powerLevel.label}</p>
            <p className="text-muted-foreground text-xs">{powerLevel.guidance}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="font-medium mb-1">Interest: {interestLevel.label}</p>
            <p className="text-muted-foreground text-xs">{interestLevel.guidance}</p>
          </div>
        </div>

        {/* Edit Button */}
        {onEdit && (
          <Button variant="outline" className="w-full" onClick={onEdit}>
            <Edit2 className="mr-2 h-4 w-4" />
            Edit Stakeholder
          </Button>
        )}
      </CardContent>
    </Card>
  );
});
