/**
 * CostCard Component
 *
 * Displays a friction point with its cost data.
 * Shows FTE cost breakdown, opportunity cost, and total.
 *
 * Story 12.3: Friction Cost Calculation
 * Covers: AC1-AC3 (display friction costs)
 */

'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { FrictionPointWithCost } from './cost-constants';
import type { DataStage } from './journey-constants';
import {
  getFrictionCategoryInfo,
  calculateTotalSeverity,
  getSeverityConfig,
} from './friction-constants';
import {
  calculateFTECost,
  calculateFrictionPointCost,
  formatCurrency,
  WORKING_WEEKS_PER_YEAR,
} from './cost-constants';

export interface CostCardProps {
  frictionPoint: FrictionPointWithCost;
  stage?: DataStage;
  onAddCost?: (frictionPoint: FrictionPointWithCost) => void;
  onEditCost?: (frictionPoint: FrictionPointWithCost) => void;
  onRemoveCost?: (frictionPoint: FrictionPointWithCost) => void;
  className?: string;
}

export function CostCard({
  frictionPoint,
  stage,
  onAddCost,
  onEditCost,
  onRemoveCost,
  className,
}: CostCardProps) {
  const categoryInfo = getFrictionCategoryInfo(frictionPoint.category);
  const totalSeverity = calculateTotalSeverity(frictionPoint.severity);
  const severityConfig = getSeverityConfig(totalSeverity);

  const stageName = stage?.systemName || stage?.type || 'Unknown stage';
  const hasCost = frictionPoint.cost && (
    frictionPoint.cost.hoursPerWeek > 0 || frictionPoint.cost.opportunityCost > 0
  );
  const totalCost = calculateFrictionPointCost(frictionPoint);

  return (
    <Card className={cn('relative overflow-hidden', className)}>
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
            Severity: {totalSeverity}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Stage association */}
        <div className="text-sm text-muted-foreground">@ {stageName}</div>

        {/* Description */}
        <p className="text-sm line-clamp-2">{frictionPoint.description}</p>

        {/* Cost Data */}
        {hasCost && frictionPoint.cost ? (
          <div className="space-y-2 rounded-md border bg-muted/30 p-3">
            {/* FTE Cost */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                FTE: {frictionPoint.cost.hoursPerWeek}hrs × ${frictionPoint.cost.hourlyRate} × {WORKING_WEEKS_PER_YEAR}wks
              </span>
              <span className="font-medium">
                {formatCurrency(
                  calculateFTECost(
                    frictionPoint.cost.hoursPerWeek,
                    frictionPoint.cost.hourlyRate
                  )
                )}
              </span>
            </div>

            {/* Opportunity Cost */}
            {frictionPoint.cost.opportunityCost > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Opportunity Cost</span>
                <span className="font-medium">
                  {formatCurrency(frictionPoint.cost.opportunityCost)}
                </span>
              </div>
            )}

            {/* Total */}
            <div className="flex items-center justify-between border-t pt-2">
              <span className="font-medium">Annual Total</span>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(totalCost)}
              </span>
            </div>

            {/* Edit/Remove buttons */}
            {(onEditCost || onRemoveCost) && (
              <div className="flex justify-end gap-2 pt-1">
                {onEditCost && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditCost(frictionPoint)}
                  >
                    Edit Cost
                  </Button>
                )}
                {onRemoveCost && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveCost(frictionPoint)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    Remove
                  </Button>
                )}
              </div>
            )}
          </div>
        ) : (
          /* No cost entered */
          <div className="rounded-md border border-dashed bg-muted/20 p-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              No cost estimate added
            </p>
            {onAddCost && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddCost(frictionPoint)}
              >
                + Add Cost Estimate
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
