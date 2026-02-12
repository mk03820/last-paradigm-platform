/**
 * PercentOfRevenueDisplay Component
 *
 * Displays alignment tax as a percentage of revenue with color coding.
 *
 * Story 14.3: Alignment Tax Calculation and Interpretation
 * Task 4: Create PercentOfRevenueDisplay component (AC: 3)
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { InterpretationThreshold } from './cost-constants';
import { formatPercent, formatFullCurrency } from './calculation-engine';

export interface PercentOfRevenueDisplayProps {
  /** Percentage of revenue (e.g., 4.2 for 4.2%) */
  percentOfRevenue: number;
  /** Annual revenue amount */
  revenue: number;
  /** Interpretation threshold for color coding */
  interpretation: InterpretationThreshold;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Displays the alignment tax percentage with color coding
 *
 * Features:
 * - Prominent percentage display
 * - Color-coded based on interpretation level
 * - Shows "X.X% of annual revenue"
 * - Revenue amount in tooltip/subtitle
 */
export function PercentOfRevenueDisplay({
  percentOfRevenue,
  revenue,
  interpretation,
  className,
}: PercentOfRevenueDisplayProps) {
  const formattedPercent = formatPercent(percentOfRevenue);
  const formattedRevenue = formatFullCurrency(revenue);

  return (
    <div className={cn('text-center space-y-1', className)}>
      {/* Main percentage */}
      <div className="flex items-baseline justify-center gap-2">
        <span
          className={cn('text-3xl font-bold', interpretation.color)}
          role="text"
          aria-label={`${formattedPercent} of annual revenue`}
        >
          {formattedPercent}
        </span>
        <span className="text-lg text-muted-foreground">of annual revenue</span>
      </div>

      {/* Revenue amount subtitle */}
      <p className="text-sm text-muted-foreground">
        Based on {formattedRevenue} annual revenue
      </p>
    </div>
  );
}

/**
 * Compact inline percentage badge
 */
export function PercentBadge({
  percentOfRevenue,
  interpretation,
  className,
}: {
  percentOfRevenue: number;
  interpretation: InterpretationThreshold;
  className?: string;
}) {
  const formattedPercent = formatPercent(percentOfRevenue);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded text-sm font-medium',
        interpretation.bgColor,
        interpretation.color,
        className
      )}
    >
      {formattedPercent}
    </span>
  );
}

/**
 * Revenue context display (for forms/inputs)
 */
export function RevenueContext({
  revenue,
  className,
}: {
  revenue: number;
  className?: string;
}) {
  if (revenue <= 0) {
    return (
      <p className={cn('text-sm text-muted-foreground', className)}>
        Enter your annual revenue to calculate percentage of revenue.
      </p>
    );
  }

  return (
    <p className={cn('text-sm text-muted-foreground', className)}>
      Annual revenue: {formatFullCurrency(revenue)}
    </p>
  );
}
