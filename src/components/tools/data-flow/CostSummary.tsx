/**
 * CostSummary Component
 *
 * Displays cost totals for journeys and enterprise-wide.
 * Shows breakdown by category and methodology explanation.
 *
 * Story 12.3: Friction Cost Calculation
 * Covers: AC3-AC5 (totals, aggregation, methodology)
 */

'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FrictionPointWithCost } from './cost-constants';
import type { DataJourney } from './journey-constants';
import {
  formatCurrency,
  formatCurrencyAbbreviated,
  calculateJourneyCost,
  calculateEnterpriseTotalCost,
  calculateCostBreakdown,
  calculateCostByCategory,
  countPointsWithCost,
  calculateCostCompletion,
  getCostMethodology,
} from './cost-constants';
import { FRICTION_CATEGORIES, getFrictionCategoryInfo } from './friction-constants';

export interface CostSummaryProps {
  frictionPoints: FrictionPointWithCost[];
  journeys: DataJourney[];
  selectedJourneyId?: string;
  className?: string;
}

export function CostSummary({
  frictionPoints,
  journeys,
  selectedJourneyId,
  className,
}: CostSummaryProps) {
  const [showMethodology, setShowMethodology] = useState(false);

  // Calculate costs
  const enterpriseTotal = useMemo(
    () => calculateEnterpriseTotalCost(frictionPoints),
    [frictionPoints]
  );

  const costBreakdown = useMemo(
    () => calculateCostBreakdown(frictionPoints),
    [frictionPoints]
  );

  const costByCategory = useMemo(
    () => calculateCostByCategory(frictionPoints),
    [frictionPoints]
  );

  const completion = useMemo(
    () => calculateCostCompletion(frictionPoints),
    [frictionPoints]
  );

  const pointsWithCost = useMemo(
    () => countPointsWithCost(frictionPoints),
    [frictionPoints]
  );

  // Journey costs
  const journeyCosts = useMemo(() => {
    return journeys.map((journey) => {
      const journeyPoints = frictionPoints.filter(
        (fp) => fp.journeyId === journey.id
      );
      return {
        journey,
        cost: calculateJourneyCost(journeyPoints),
        pointCount: journeyPoints.length,
        withCostCount: countPointsWithCost(journeyPoints),
      };
    });
  }, [journeys, frictionPoints]);

  // Selected journey cost
  const selectedJourneyCost = selectedJourneyId
    ? journeyCosts.find((jc) => jc.journey.id === selectedJourneyId)
    : null;

  const methodology = getCostMethodology();

  // Find max category cost for bar scaling
  const maxCategoryCost = Math.max(...Object.values(costByCategory), 1);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Enterprise Total */}
      <Card className="border-primary bg-primary/5">
        <CardContent className="py-6">
          <div className="flex flex-col items-center text-center">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Enterprise Total Friction Cost
            </p>
            <p className="text-4xl font-bold text-primary">
              {formatCurrencyAbbreviated(enterpriseTotal)}
              <span className="text-lg font-normal text-muted-foreground">/year</span>
            </p>
            <div className="flex gap-6 mt-4">
              <div>
                <p className="text-lg font-semibold">{formatCurrency(costBreakdown.fteCost)}</p>
                <p className="text-xs text-muted-foreground">FTE Costs</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <p className="text-lg font-semibold">
                  {formatCurrency(costBreakdown.opportunityCost)}
                </p>
                <p className="text-xs text-muted-foreground">Opportunity Costs</p>
              </div>
            </div>
            <div className="mt-4">
              <Badge variant={completion === 100 ? 'default' : 'secondary'}>
                {pointsWithCost} of {frictionPoints.length} friction points costed ({completion}%)
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Journey Breakdown */}
      {journeyCosts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cost by Journey</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {journeyCosts.map(({ journey, cost, pointCount, withCostCount }) => (
              <div
                key={journey.id}
                className={cn(
                  'flex items-center justify-between rounded-md border p-3',
                  selectedJourneyId === journey.id && 'border-primary bg-primary/5'
                )}
              >
                <div>
                  <p className="font-medium">{journey.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {withCostCount} of {pointCount} friction points costed
                  </p>
                </div>
                <p className="text-lg font-bold">
                  {formatCurrency(cost)}
                  <span className="text-xs font-normal text-muted-foreground">/yr</span>
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Cost by Category */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cost by Friction Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {FRICTION_CATEGORIES.map((category) => {
            const cost = costByCategory[category.id];
            const percentage = enterpriseTotal > 0 ? (cost / enterpriseTotal) * 100 : 0;
            const barWidth = maxCategoryCost > 0 ? (cost / maxCategoryCost) * 100 : 0;

            return (
              <div key={category.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        category.bgColor,
                        category.color,
                        category.borderColor
                      )}
                    >
                      {category.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      ({category.isOrganizational ? 'Organizational' : 'Technical'})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">{formatCurrency(cost)}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className={cn('h-2 rounded-full', category.bgColor.replace('bg-', 'bg-'))}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Methodology */}
      <Card>
        <CardHeader
          className="cursor-pointer"
          onClick={() => setShowMethodology(!showMethodology)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Calculation Methodology</CardTitle>
            <Button variant="ghost" size="sm">
              {showMethodology ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        {showMethodology && (
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">Formula</p>
              <code className="block rounded bg-muted p-2 text-sm">
                {methodology.formula}
              </code>
            </div>

            <div>
              <p className="text-sm font-medium mb-1">Assumptions</p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                {methodology.assumptions.map((assumption, i) => (
                  <li key={i}>{assumption}</li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-sm font-medium mb-1">Example</p>
              <div className="rounded bg-muted p-3 text-sm">
                <p>
                  <strong>Inputs:</strong> {methodology.example.inputs}
                </p>
                <p>
                  <strong>Calculation:</strong> {methodology.example.calculation}
                </p>
                <p>
                  <strong>Result:</strong> {methodology.example.result}
                </p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
