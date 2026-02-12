/**
 * CriticalFriction Component
 *
 * Displays friction points with severity 7-9 (critical).
 * Shows journey and stage context for each critical item.
 *
 * Story 12.4: Friction Category Breakdown and Recommendations
 * Task 4: Create CriticalFriction component (AC: 4)
 */

'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import type { DataJourney } from './journey-constants';
import { calculateTotalSeverity, getFrictionCategoryInfo } from './friction-constants';
import {
  getCriticalFrictionPoints,
  formatCurrency,
  calculateFrictionPointCost,
  type FrictionPointWithCost,
  CRITICAL_SEVERITY_THRESHOLD,
} from './cost-constants';
import { cn } from '@/lib/utils';

interface CriticalFrictionProps {
  frictionPoints: FrictionPointWithCost[];
  journeys: DataJourney[];
  className?: string;
}

export function CriticalFriction({
  frictionPoints,
  journeys,
  className,
}: CriticalFrictionProps) {
  const criticalPoints = useMemo(
    () => getCriticalFrictionPoints(frictionPoints),
    [frictionPoints]
  );

  // Helper to get journey and stage names
  const getContext = (point: FrictionPointWithCost) => {
    const journey = journeys.find((j) => j.id === point.journeyId);
    const stage = journey?.stages.find((s) => s.id === point.stageId);
    return {
      journeyName: journey?.name || 'Unknown Journey',
      stageName: stage?.systemName || stage?.type || 'Unknown Stage',
    };
  };

  if (criticalPoints.length === 0) {
    return (
      <Card className={cn(className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
            Critical Friction Points (Severity {CRITICAL_SEVERITY_THRESHOLD}-9)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No critical friction points identified. All documented friction has severity below {CRITICAL_SEVERITY_THRESHOLD}.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('border-red-500/50', className)}>
      <CardHeader className="bg-red-50 dark:bg-red-950/20">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <span>Critical Friction Points (Severity {CRITICAL_SEVERITY_THRESHOLD}-9)</span>
          </div>
          <Badge variant="destructive">{criticalPoints.length} Critical</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="divide-y pt-0">
        {criticalPoints.map((point) => {
          const severity = calculateTotalSeverity(point.severity);
          const cost = calculateFrictionPointCost(point);
          const { journeyName, stageName } = getContext(point);
          const categoryInfo = getFrictionCategoryInfo(point.category);

          return (
            <div key={point.id} className="py-4 first:pt-4">
              {/* Severity and Context */}
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge
                  variant="destructive"
                  className="text-sm font-semibold"
                >
                  🔴 Severity {severity}
                </Badge>
                <span className="text-sm text-muted-foreground">—</span>
                <span className="text-sm font-medium">{journeyName}</span>
                <span className="text-sm text-muted-foreground">/</span>
                <span className="text-sm">{stageName}</span>
              </div>

              {/* Description */}
              <p className="mb-2 text-sm leading-relaxed">
                &quot;{point.description}&quot;
              </p>

              {/* Category and Cost */}
              <div className="flex flex-wrap items-center gap-3">
                <Badge className={cn('text-xs', categoryInfo.bgColor, categoryInfo.color)}>
                  {categoryInfo.label}
                </Badge>
                {cost > 0 && (
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    Cost: {formatCurrency(cost)}/year
                  </span>
                )}
                {!point.cost && (
                  <span className="text-xs text-muted-foreground italic">
                    No cost estimate
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
