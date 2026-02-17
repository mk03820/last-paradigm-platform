/**
 * DataFlowResultCard Component (Tool 5)
 *
 * Displays Data Flow Friction Analysis results
 * with friction cost and category breakdown.
 *
 * Story 19.2: Diagnostic Results Display
 * Task 3.6: Create Tool 5 card (AC: 2)
 */

'use client';

import { Database, AlertTriangle } from 'lucide-react';
import { ToolResultCard } from './ToolResultCard';
import type { DataFlowData } from './types';

interface DataFlowResultCardProps {
  data: DataFlowData | null | undefined;
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

export function DataFlowResultCard({ data }: DataFlowResultCardProps) {
  if (!data) {
    return (
      <ToolResultCard
        toolNumber={5}
        toolName="Data Flow Friction"
        icon={Database}
        completedAt={null}
      >
        <p className="text-sm text-muted-foreground">
          Identify where data gets stuck or degraded.
        </p>
      </ToolResultCard>
    );
  }

  const journeys = data.journeys ?? [];
  const journeyCount = journeys.length;
  const frictionCost = data.frictionCost ?? 0;
  const criticalCount = data.criticalFriction ?? 0;

  // Count total friction points across all journeys
  const totalFrictionPoints = journeys.reduce(
    (sum, j) => sum + (j.frictionPoints ?? 0),
    0
  );

  return (
    <ToolResultCard
      toolNumber={5}
      toolName="Data Flow Friction"
      icon={Database}
      completedAt={data.completedAt || null}
      keyMetric={
        frictionCost > 0
          ? {
              label: 'Annual Friction Cost',
              value: formatCurrency(frictionCost),
              highlight: true,
            }
          : undefined
      }
    >
      {data.completedAt && (
        <div className="space-y-3">
          {/* Journey Count */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Journeys Mapped</span>
            <span className="font-medium">{journeyCount} journeys</span>
          </div>

          {/* Total Friction Points */}
          {totalFrictionPoints > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Friction Points</span>
              <span className="font-medium">{totalFrictionPoints}</span>
            </div>
          )}

          {/* Critical Friction */}
          {criticalCount > 0 && (
            <div className="flex items-center justify-between text-sm pt-2 border-t">
              <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-3 w-3" />
                Critical Issues
              </span>
              <span className="font-medium text-red-600 dark:text-red-400">
                {criticalCount} critical
              </span>
            </div>
          )}
        </div>
      )}
    </ToolResultCard>
  );
}
