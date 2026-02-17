/**
 * MeetingAuditResultCard Component (Tool 2)
 *
 * Displays Meeting Audit Calculator results
 * with waste calculation metrics.
 *
 * Story 19.2: Diagnostic Results Display
 * Task 3.3: Create Tool 2 card (AC: 2)
 */

'use client';

import { Calculator } from 'lucide-react';
import { ToolResultCard } from './ToolResultCard';
import type { MeetingAuditData } from './types';

interface MeetingAuditResultCardProps {
  data: MeetingAuditData | null | undefined;
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

/**
 * Format number with commas
 */
function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function MeetingAuditResultCard({ data }: MeetingAuditResultCardProps) {
  if (!data) {
    return (
      <ToolResultCard
        toolNumber={2}
        toolName="Meeting Audit"
        icon={Calculator}
        completedAt={null}
      >
        <p className="text-sm text-muted-foreground">
          Quantify the cost of unproductive meetings.
        </p>
      </ToolResultCard>
    );
  }

  const results = data.results;
  const wastedCost = results?.wastedCost ?? 0;
  const totalCost = results?.totalMeetingCost ?? 0;
  const wastedHours = results?.wastedHours ?? 0;
  const totalHours = results?.totalMeetingHours ?? 0;
  const wastePercent = totalHours > 0 ? Math.round((wastedHours / totalHours) * 100) : 0;

  return (
    <ToolResultCard
      toolNumber={2}
      toolName="Meeting Audit"
      icon={Calculator}
      completedAt={data.completedAt || null}
      keyMetric={
        results
          ? {
              label: 'Annual Meeting Waste',
              value: formatCurrency(wastedCost),
              highlight: true,
            }
          : undefined
      }
    >
      {results && (
        <div className="space-y-3">
          {/* Total Cost */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Meeting Cost</span>
            <span className="font-medium">{formatCurrency(totalCost)}</span>
          </div>

          {/* Wasted Hours */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Hours Wasted</span>
            <span className="font-medium text-red-600 dark:text-red-400">
              {formatNumber(wastedHours)} hours
            </span>
          </div>

          {/* Waste Percentage */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Waste Percentage</span>
            <span className="font-medium text-red-600 dark:text-red-400">
              {wastePercent}%
            </span>
          </div>

          {/* Meeting Count if available */}
          {data.inputs?.meetingCount && (
            <div className="flex items-center justify-between text-sm pt-2 border-t">
              <span className="text-muted-foreground">Meetings Analyzed</span>
              <span className="font-medium">{formatNumber(data.inputs.meetingCount)}</span>
            </div>
          )}
        </div>
      )}
    </ToolResultCard>
  );
}
