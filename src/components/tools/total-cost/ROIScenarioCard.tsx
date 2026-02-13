/**
 * ROIScenarioCard Component
 *
 * Individual scenario card displaying ROI metrics.
 *
 * Story 14.5: Transformation ROI Calculator
 * Task 5: Create ROIScenarioCard.tsx component
 */

'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TrendingUp, Clock, Target, DollarSign, Percent, Award } from 'lucide-react';
import type { ROIResult, ROIScenario } from './cost-constants';
import { getROIScenario, formatROIRatio, formatPaybackPeriod, formatCurrency } from './cost-constants';
import { formatNPV } from './roi-calculator';

export interface ROIScenarioCardProps {
  /** ROI calculation result for this scenario */
  result: ROIResult;
  /** Whether this scenario is recommended */
  isRecommended?: boolean;
  /** Whether the card is highlighted/selected */
  isHighlighted?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Individual ROI Scenario Card
 *
 * Features:
 * - Color-coded by scenario type
 * - Large headline numbers for key metrics
 * - Achievement probability indicator
 * - Board-presentation quality design
 */
export function ROIScenarioCard({
  result,
  isRecommended = false,
  isHighlighted = false,
  onClick,
  className,
}: ROIScenarioCardProps) {
  const scenario = getROIScenario(result.scenarioType);

  return (
    <Card
      className={cn(
        'relative transition-all duration-200',
        scenario.borderColor,
        isHighlighted && 'ring-2 ring-primary shadow-lg',
        onClick && 'cursor-pointer hover:shadow-md',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Recommended Badge */}
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground gap-1">
            <Award className="h-3 w-3" />
            Recommended
          </Badge>
        </div>
      )}

      <CardHeader className={cn('pb-3', scenario.bgColor)}>
        <CardTitle className={cn('flex items-center justify-between', scenario.color)}>
          <span className="text-lg font-bold">{scenario.label}</span>
          <Badge variant="outline" className={cn('text-xs', scenario.color, scenario.borderColor)}>
            {result.probability}% likely
          </Badge>
        </CardTitle>
        <p className="text-xs text-muted-foreground">{scenario.description}</p>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Annual Savings - Headline Number */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Annual Savings
          </p>
          <p className={cn('text-3xl font-bold tracking-tight', scenario.color)}>
            {formatCurrency(result.annualSavings)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {result.targetReduction.toFixed(0)}% reduction achieved
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
          {/* 3-Year NPV */}
          <MetricItem
            icon={<DollarSign className="h-4 w-4" />}
            label="3-Year NPV"
            value={formatNPV(result.npv)}
            subtext="at 10% discount"
          />

          {/* ROI Ratio */}
          <MetricItem
            icon={<Percent className="h-4 w-4" />}
            label="ROI"
            value={formatROIRatio(result.roiRatio)}
            subtext={`${result.roiPercent.toFixed(0)}% return`}
          />

          {/* Payback Period */}
          <MetricItem
            icon={<Clock className="h-4 w-4" />}
            label="Payback"
            value={formatPaybackPeriod(result.paybackMonths)}
            subtext="break-even"
          />

          {/* 3-Year Savings */}
          <MetricItem
            icon={<TrendingUp className="h-4 w-4" />}
            label="3-Year Total"
            value={formatCurrency(result.threeYearSavings)}
            subtext="gross savings"
          />
        </div>

        {/* Investment Context */}
        <div className="pt-2 border-t text-center">
          <p className="text-xs text-muted-foreground">
            Investment:{' '}
            <span className="font-medium text-foreground">
              {formatCurrency(result.investment)}
            </span>
            {' '}&bull;{' '}
            Timeline:{' '}
            <span className="font-medium text-foreground">
              {result.timelineMonths} months
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Metric Item Sub-component
 */
function MetricItem({
  icon,
  label,
  value,
  subtext,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
}) {
  return (
    <div className="text-center p-2 rounded-lg bg-muted/30">
      <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-[10px] text-muted-foreground">{subtext}</p>
    </div>
  );
}

/**
 * Compact ROI Scenario Badge
 */
export function ROIScenarioBadge({
  result,
  className,
}: {
  result: ROIResult;
  className?: string;
}) {
  const scenario = getROIScenario(result.scenarioType);

  return (
    <Badge
      variant="outline"
      className={cn(scenario.color, scenario.bgColor, scenario.borderColor, className)}
    >
      {scenario.label}: {formatCurrency(result.annualSavings)}/yr
    </Badge>
  );
}

/**
 * ROI Quick Summary
 */
export function ROIQuickSummary({
  result,
  className,
}: {
  result: ROIResult;
  className?: string;
}) {
  const scenario = getROIScenario(result.scenarioType);

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className={cn('px-3 py-1 rounded-full text-sm font-medium', scenario.bgColor, scenario.color)}>
        {scenario.label}
      </div>
      <div className="text-sm">
        <span className="font-semibold">{formatCurrency(result.annualSavings)}</span>
        <span className="text-muted-foreground">/year</span>
      </div>
      <div className="text-sm">
        <span className="font-semibold">{formatROIRatio(result.roiRatio)}</span>
        <span className="text-muted-foreground"> ROI</span>
      </div>
    </div>
  );
}

export default ROIScenarioCard;
