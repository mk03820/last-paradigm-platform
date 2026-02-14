'use client';

/**
 * VisibleDataZone Component
 *
 * Displays the user's actual diagnostic data without blur.
 * This zone shows personal metrics and results from PB1 tools.
 *
 * Story 16.3: Preview Cards with Blur Effect
 * Task 1.3: Create VisibleDataZone sub-component
 * Covers: AC2 (diagnostic data visible without blur)
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/pb2-tools/recommendation-constants';
import type { VisibleDataZoneProps } from './PreviewCardTypes';

/**
 * Format metric value for display.
 * Handles numeric values (currency) and string values.
 */
function formatMetricValue(value: string | number): string {
  if (typeof value === 'number') {
    return formatCurrency(value);
  }
  return value;
}

/**
 * VisibleDataZone displays user's diagnostic data clearly.
 * This content is NOT blurred and shows their actual metrics.
 *
 * Task 5: Integrate user's diagnostic data into cards
 * Task 5.3: Format diagnostic scores, percentages, and currency values
 *
 * @example
 * <VisibleDataZone
 *   description="Clarifies who can make which decisions..."
 *   diagnosticData={{
 *     metricLabel: "Decision Velocity",
 *     metricValue: "21 days",
 *     issuesSummary: "3.0x slower than benchmark",
 *     sourceToolId: 3,
 *     benchmarkValue: "7 days"
 *   }}
 *   bookChapter="Chapter 10: Decision Velocity"
 * />
 */
export function VisibleDataZone({
  description,
  diagnosticData,
  bookChapter,
}: VisibleDataZoneProps) {
  const { metricLabel, metricValue, issuesSummary, benchmarkValue } = diagnosticData;

  return (
    <div className="space-y-4">
      {/* Tool Description */}
      <p className="text-sm text-muted-foreground">{description}</p>

      {/* User's Diagnostic Data Section */}
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Your Diagnostic Results
        </h4>

        {/* Primary Metric Display */}
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-sm text-muted-foreground">{metricLabel}:</span>
          <span className="text-lg font-bold text-foreground">
            {formatMetricValue(metricValue)}
          </span>
          {benchmarkValue && (
            <span className="text-sm text-muted-foreground">
              (benchmark: {formatMetricValue(benchmarkValue)})
            </span>
          )}
        </div>

        {/* Issues Summary */}
        {issuesSummary && (
          <p className="mt-2 text-sm font-medium text-amber-700 dark:text-amber-400">
            {issuesSummary}
          </p>
        )}
      </div>

      {/* Book Chapter Reference (visible teaser) */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <BookIcon />
        <span>Based on {bookChapter}</span>
      </div>
    </div>
  );
}

/**
 * Book icon for chapter reference
 */
function BookIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}

export default VisibleDataZone;
