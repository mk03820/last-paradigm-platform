/**
 * DecisionVelocityResultCard Component (Tool 3)
 *
 * Displays Decision Velocity Scorecard results
 * with latency metrics.
 *
 * Story 19.2: Diagnostic Results Display
 * Task 3.4: Create Tool 3 card (AC: 2)
 */

'use client';

import { Clock } from 'lucide-react';
import { ToolResultCard } from './ToolResultCard';
import type { DecisionVelocityData } from './types';

interface DecisionVelocityResultCardProps {
  data: DecisionVelocityData | null | undefined;
}

export function DecisionVelocityResultCard({ data }: DecisionVelocityResultCardProps) {
  if (!data) {
    return (
      <ToolResultCard
        toolNumber={3}
        toolName="Decision Velocity"
        icon={Clock}
        completedAt={null}
      >
        <p className="text-sm text-muted-foreground">
          Measure how long decisions take across your organization.
        </p>
      </ToolResultCard>
    );
  }

  const metrics = data.metrics;
  const decisions = data.decisions ?? [];
  const decisionCount = decisions.length;

  return (
    <ToolResultCard
      toolNumber={3}
      toolName="Decision Velocity"
      icon={Clock}
      completedAt={data.completedAt || null}
      keyMetric={
        metrics?.overallMedian !== undefined
          ? {
              label: 'Median Decision Time',
              value: `${metrics.overallMedian} days`,
            }
          : undefined
      }
    >
      {metrics && (
        <div className="space-y-3">
          {/* Median Days */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Median</span>
            <span className="font-medium">{metrics.overallMedian ?? 'N/A'} days</span>
          </div>

          {/* 90th Percentile */}
          {metrics.overallP90 !== undefined && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">90th Percentile</span>
              <span className="font-medium text-yellow-600 dark:text-yellow-400">
                {metrics.overallP90} days
              </span>
            </div>
          )}

          {/* Decision Count */}
          <div className="flex items-center justify-between text-sm pt-2 border-t">
            <span className="text-muted-foreground">Decisions Analyzed</span>
            <span className="font-medium">{decisionCount} decisions</span>
          </div>
        </div>
      )}
    </ToolResultCard>
  );
}
