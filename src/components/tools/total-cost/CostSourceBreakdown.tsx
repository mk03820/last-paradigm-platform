/**
 * CostSourceBreakdown Component
 *
 * Displays itemized breakdown of all cost sources.
 *
 * Story 14.3: Alignment Tax Calculation and Interpretation
 * Task 6: Create CostSourceBreakdown component (AC: 1)
 */

'use client';

import * as React from 'react';
import {
  Calendar,
  Database,
  Clock,
  RefreshCw,
  Users,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { CostSourceItem, AlignmentTaxResult } from './cost-constants';
import {
  formatCurrency,
  formatFullCurrency,
  formatPercentSmart,
  buildCostSourceItems,
  getToolCostItems,
  getInputCostItems,
} from './calculation-engine';

export interface CostSourceBreakdownProps {
  /** Alignment tax calculation result */
  result: AlignmentTaxResult;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Get icon component for a cost source
 */
function getCostSourceIcon(id: string): React.ReactNode {
  const iconProps = { className: 'w-4 h-4', 'aria-hidden': true };

  switch (id) {
    case 'meetingWaste':
      return <Calendar {...iconProps} />;
    case 'dataFriction':
      return <Database {...iconProps} />;
    case 'projectDelays':
      return <Clock {...iconProps} />;
    case 'rework':
      return <RefreshCw {...iconProps} />;
    case 'turnover':
      return <Users {...iconProps} />;
    case 'opportunityCost':
      return <TrendingUp {...iconProps} />;
    default:
      return <BarChart3 {...iconProps} />;
  }
}

/**
 * Displays itemized breakdown of all cost sources
 *
 * Features:
 * - Groups by tool-sourced vs manually-input costs
 * - Shows dollar amount and percentage for each source
 * - Visual bar indicating contribution size
 * - Subtotals for each group
 */
export function CostSourceBreakdown({
  result,
  className,
}: CostSourceBreakdownProps) {
  const items = buildCostSourceItems(result);
  const toolItems = getToolCostItems(items);
  const inputItems = getInputCostItems(items);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="w-5 h-5" aria-hidden="true" />
          Cost Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tool-sourced costs */}
        {toolItems.length > 0 && (
          <CostSourceGroup
            title="From Diagnostic Tools"
            items={toolItems}
            subtotal={result.toolsSubtotal}
            totalForPercentage={result.total}
          />
        )}

        {/* Manually-input costs */}
        {inputItems.length > 0 && (
          <CostSourceGroup
            title="Additional Cost Inputs"
            items={inputItems}
            subtotal={result.additionalSubtotal}
            totalForPercentage={result.total}
          />
        )}

        {/* Total */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between font-semibold">
            <span>Total Alignment Tax</span>
            <span className="text-lg text-[#b45309]">
              {formatFullCurrency(result.total)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Group of cost sources with subtotal
 */
function CostSourceGroup({
  title,
  items,
  subtotal,
  totalForPercentage,
}: {
  title: string;
  items: CostSourceItem[];
  subtotal: number;
  totalForPercentage: number;
}) {
  const subtotalPercent =
    totalForPercentage > 0 ? (subtotal / totalForPercentage) * 100 : 0;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <CostSourceRow
            key={item.id}
            item={item}
            maxAmount={totalForPercentage}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-sm pt-2 border-t border-dashed">
        <span className="text-muted-foreground">Subtotal</span>
        <div className="flex items-center gap-2">
          <span className="font-medium">{formatCurrency(subtotal)}</span>
          <span className="text-muted-foreground">
            ({formatPercentSmart(subtotalPercent)})
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Single cost source row
 */
function CostSourceRow({
  item,
  maxAmount,
}: {
  item: CostSourceItem;
  maxAmount: number;
}) {
  const icon = getCostSourceIcon(item.id);
  const barWidth = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{icon}</span>
          <span className="text-sm">
            {item.label}
            {item.toolNumber && (
              <span className="text-muted-foreground ml-1">
                (Tool {item.toolNumber})
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {formatCurrency(item.amount)}
          </span>
          <span className="text-xs text-muted-foreground w-10 text-right">
            {formatPercentSmart(item.percentage)}
          </span>
        </div>
      </div>
      {/* Progress bar */}
      <div
        className="h-1.5 bg-muted rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={barWidth}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${item.label}: ${formatPercentSmart(item.percentage)} of total`}
      >
        <div
          className="h-full bg-[#b45309] rounded-full transition-all duration-300"
          style={{ width: `${barWidth}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Compact cost breakdown list
 */
export function CostBreakdownList({
  result,
  className,
}: {
  result: AlignmentTaxResult;
  className?: string;
}) {
  const items = buildCostSourceItems(result);

  return (
    <ul className={cn('space-y-2', className)}>
      {items.map((item) => (
        <li
          key={item.id}
          className="flex items-center justify-between text-sm"
        >
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">
              {getCostSourceIcon(item.id)}
            </span>
            <span>{item.label}</span>
          </div>
          <span className="font-medium">{formatCurrency(item.amount)}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Minimal cost summary
 */
export function CostSummaryLine({
  result,
  className,
}: {
  result: AlignmentTaxResult;
  className?: string;
}) {
  const items = buildCostSourceItems(result);
  const sourceCount = items.length;

  return (
    <p className={cn('text-sm text-muted-foreground', className)}>
      {formatCurrency(result.total)} from {sourceCount} cost source
      {sourceCount !== 1 ? 's' : ''}
    </p>
  );
}
