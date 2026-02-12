/**
 * ResultsSummary Component
 *
 * Displays enterprise total friction cost prominently
 * with summary statistics and Tool 7 readiness indicator.
 *
 * Story 12.4: Friction Category Breakdown and Recommendations
 * Task 5: Create ResultsSummary component (AC: 1, 2, 4, 5)
 */

'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, BarChart3, AlertTriangle } from 'lucide-react';
import type { DataJourney } from './journey-constants';
import { calculateTotalSeverity } from './friction-constants';
import {
  calculateEnterpriseTotalCost,
  formatCurrencyAbbreviated,
  getCriticalFrictionPoints,
  calculateOrganizationalVsTechnicalCost,
  calculateCostByCategory,
  type FrictionPointWithCost,
  CRITICAL_SEVERITY_THRESHOLD,
} from './cost-constants';
import { cn } from '@/lib/utils';

interface ResultsSummaryProps {
  frictionPoints: FrictionPointWithCost[];
  journeys: DataJourney[];
  className?: string;
}

export function ResultsSummary({
  frictionPoints,
  journeys,
  className,
}: ResultsSummaryProps) {
  const stats = useMemo(() => {
    const totalCost = calculateEnterpriseTotalCost(frictionPoints);
    const costByCategory = calculateCostByCategory(frictionPoints);
    const { organizationalCost, technicalCost, total } =
      calculateOrganizationalVsTechnicalCost(costByCategory);
    const criticalPoints = getCriticalFrictionPoints(frictionPoints);
    const journeyCount = journeys.length;
    const frictionCount = frictionPoints.length;
    const costedCount = frictionPoints.filter(
      (p) => p.cost && (p.cost.hoursPerWeek > 0 || p.cost.opportunityCost > 0)
    ).length;

    return {
      totalCost,
      organizationalCost,
      technicalCost,
      organizationalPercentage:
        total > 0 ? Math.round((organizationalCost / total) * 100) : 0,
      criticalCount: criticalPoints.length,
      journeyCount,
      frictionCount,
      costedCount,
    };
  }, [frictionPoints, journeys]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main Total Card */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="py-6">
          <div className="flex flex-col items-center text-center md:flex-row md:justify-between md:text-left">
            {/* Total Cost */}
            <div className="mb-4 md:mb-0">
              <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Enterprise Total Friction Cost
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-primary md:text-5xl">
                  {formatCurrencyAbbreviated(stats.totalCost)}
                </span>
                <span className="text-lg text-muted-foreground">/year</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 text-center md:gap-6">
              <div>
                <p className="text-2xl font-semibold">{stats.journeyCount}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.journeyCount === 1 ? 'Journey' : 'Journeys'}
                </p>
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.frictionCount}</p>
                <p className="text-xs text-muted-foreground">
                  Friction Points
                </p>
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.costedCount}</p>
                <p className="text-xs text-muted-foreground">Costed</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Organizational vs Technical */}
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="rounded-full bg-orange-100 p-2 dark:bg-orange-900/30">
              <BarChart3 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {stats.organizationalPercentage}% Organizational
              </p>
              <p className="text-xs text-muted-foreground">
                {100 - stats.organizationalPercentage}% Technical
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Critical Count */}
        <Card className={stats.criticalCount > 0 ? 'border-red-500/30' : ''}>
          <CardContent className="flex items-center gap-3 py-4">
            <div
              className={cn(
                'rounded-full p-2',
                stats.criticalCount > 0
                  ? 'bg-red-100 dark:bg-red-900/30'
                  : 'bg-green-100 dark:bg-green-900/30'
              )}
            >
              <AlertTriangle
                className={cn(
                  'h-5 w-5',
                  stats.criticalCount > 0
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-green-600 dark:text-green-400'
                )}
              />
            </div>
            <div>
              <p className="text-sm font-medium">
                {stats.criticalCount} Critical
              </p>
              <p className="text-xs text-muted-foreground">
                Severity {CRITICAL_SEVERITY_THRESHOLD}+ Items
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tool 7 Ready */}
        <Card className="border-green-500/30">
          <CardContent className="flex items-center gap-3 py-4">
            <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/30">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Ready for Tool 7</p>
              <p className="text-xs text-muted-foreground">
                Feed to Total Cost
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
