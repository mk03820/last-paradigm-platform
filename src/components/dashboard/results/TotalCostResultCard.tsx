/**
 * TotalCostResultCard Component (Tool 7)
 *
 * Displays Total Cost of Misalignment results
 * with total alignment tax and percentage of revenue.
 *
 * Story 19.2: Diagnostic Results Display
 * Task 3.8: Create Tool 7 card (AC: 2)
 */

'use client';

import { DollarSign } from 'lucide-react';
import { ToolResultCard } from './ToolResultCard';
import type { TotalCostData } from './types';

interface TotalCostResultCardProps {
  data: TotalCostData | null | undefined;
}

/**
 * Format currency with proper separators
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const BREAKDOWN_LABELS: Record<string, string> = {
  meetings: 'Meetings',
  decisions: 'Decisions',
  data: 'Data Flow',
  communication: 'Communication',
  other: 'Other',
};

export function TotalCostResultCard({ data }: TotalCostResultCardProps) {
  if (!data) {
    return (
      <ToolResultCard
        toolNumber={7}
        toolName="Total Cost"
        icon={DollarSign}
        completedAt={null}
      >
        <p className="text-sm text-muted-foreground">
          Aggregate your alignment tax from all tools.
        </p>
      </ToolResultCard>
    );
  }

  const totalCost = data.totalCost ?? 0;
  const taxPercent = data.alignmentTaxPercent ?? 0;
  const breakdown = data.breakdown;

  return (
    <ToolResultCard
      toolNumber={7}
      toolName="Total Cost"
      icon={DollarSign}
      completedAt={data.completedAt || null}
      keyMetric={
        totalCost > 0
          ? {
              label: 'Total Alignment Tax',
              value: formatCurrency(totalCost),
              highlight: true,
            }
          : undefined
      }
    >
      {data.completedAt && (
        <div className="space-y-3">
          {/* Total Cost */}
          <div className="text-2xl font-bold text-accent">
            {formatCurrency(totalCost)}
          </div>

          {/* Percentage of Revenue */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Percentage of Revenue</span>
            <span className="font-medium text-accent">{taxPercent}% of revenue</span>
          </div>

          {/* Breakdown by Source */}
          {breakdown && (
            <div className="pt-2 border-t space-y-2">
              <p className="text-xs text-muted-foreground mb-2">Cost Breakdown</p>
              {Object.entries(breakdown).map(([key, value]) => {
                if (value === undefined || value === 0) return null;
                return (
                  <div key={key} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {BREAKDOWN_LABELS[key] || key}
                    </span>
                    <span className="font-medium">{formatCurrency(value)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </ToolResultCard>
  );
}
