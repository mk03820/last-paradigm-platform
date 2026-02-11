/**
 * FrictionCard Component
 *
 * Displays a single friction point with category, severity, and stage info.
 * Supports edit and delete actions.
 *
 * Story 12.2: Friction Point Identification
 * Covers: AC1-AC5 (display friction with all attributes)
 */

'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { FrictionPoint } from './friction-constants';
import type { DataStage } from './journey-constants';
import {
  getFrictionCategoryInfo,
  calculateTotalSeverity,
  getSeverityConfig,
  isCriticalFriction,
  SEVERITY_LEVELS,
} from './friction-constants';

export interface FrictionCardProps {
  frictionPoint: FrictionPoint;
  stage?: DataStage;
  onEdit?: (frictionPoint: FrictionPoint) => void;
  onDelete?: (frictionPoint: FrictionPoint) => void;
  className?: string;
}

export function FrictionCard({
  frictionPoint,
  stage,
  onEdit,
  onDelete,
  className,
}: FrictionCardProps) {
  const categoryInfo = getFrictionCategoryInfo(frictionPoint.category);
  const totalSeverity = calculateTotalSeverity(frictionPoint.severity);
  const severityConfig = getSeverityConfig(totalSeverity);
  const isCritical = isCriticalFriction(frictionPoint.severity);

  const stageName = stage?.systemName || stage?.type || 'Unknown stage';

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-shadow hover:shadow-md',
        isCritical && 'ring-2 ring-red-500/50',
        className
      )}
    >
      {/* Critical indicator */}
      {isCritical && (
        <div className="absolute left-0 top-0 h-full w-1 bg-red-500" />
      )}

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          {/* Category badge */}
          <Badge
            variant="outline"
            className={cn(
              'shrink-0',
              categoryInfo.bgColor,
              categoryInfo.color,
              categoryInfo.borderColor
            )}
          >
            {categoryInfo.label}
          </Badge>

          {/* Severity badge */}
          <Badge
            variant="secondary"
            className={cn(severityConfig.bgColor, severityConfig.color)}
          >
            {totalSeverity} ({severityConfig.label})
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Stage association */}
        <div className="text-sm text-muted-foreground">
          @ {stageName}
        </div>

        {/* Description */}
        <p className="text-sm">{frictionPoint.description}</p>

        {/* Severity breakdown */}
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>
            Freq: {frictionPoint.severity.frequency} (
            {SEVERITY_LEVELS[frictionPoint.severity.frequency].label})
          </span>
          <span>
            Effort: {frictionPoint.severity.effort} (
            {SEVERITY_LEVELS[frictionPoint.severity.effort].label})
          </span>
          <span>
            Impact: {frictionPoint.severity.impact} (
            {SEVERITY_LEVELS[frictionPoint.severity.impact].label})
          </span>
        </div>

        {/* Actions */}
        {(onEdit || onDelete) && (
          <div className="flex justify-end gap-2 pt-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(frictionPoint)}
              >
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(frictionPoint)}
                className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                Delete
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
