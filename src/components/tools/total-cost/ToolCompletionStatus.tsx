/**
 * Tool Completion Status Component
 *
 * Displays a grid of all 6 diagnostic tools with completion indicators,
 * showing which tools have data available for aggregation.
 *
 * Story 14.1: Cross-Tool Data Aggregation
 * Task 3: Create ToolCompletionStatus component (AC: 2, 3)
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  TOOLS,
  COMPLETION_STATUS_STYLES,
  formatCurrency,
  type ToolInfo,
  type ToolCompletionStatus as CompletionStatus,
} from './cost-constants';
import type { AggregatedToolData } from './cost-constants';
import { CheckCircle, Clock, Circle, ExternalLink } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export interface ToolCompletionStatusProps {
  /** Aggregated data from all tools */
  aggregatedData: AggregatedToolData | null;
  /** Callback to refresh data from tools */
  onRefresh?: () => void;
  /** Whether refresh is in progress */
  isRefreshing?: boolean;
  /** Optional className */
  className?: string;
}

interface ToolStatusItemProps {
  tool: ToolInfo;
  status: CompletionStatus;
  primaryMetric?: string;
  primaryValue?: string;
  isRequired?: boolean;
}

// ============================================================================
// Helper Components
// ============================================================================

function StatusIcon({ status }: { status: CompletionStatus }) {
  const iconClass = 'h-5 w-5';

  switch (status) {
    case 'complete':
      return <CheckCircle className={cn(iconClass, 'text-green-600 dark:text-green-400')} />;
    case 'in-progress':
      return <Clock className={cn(iconClass, 'text-yellow-600 dark:text-yellow-400')} />;
    case 'not-started':
    default:
      return <Circle className={cn(iconClass, 'text-gray-400 dark:text-gray-500')} />;
  }
}

function ToolStatusItem({
  tool,
  status,
  primaryMetric,
  primaryValue,
  isRequired,
}: ToolStatusItemProps) {
  const styles = COMPLETION_STATUS_STYLES[status];

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg border transition-colors',
        status === 'complete' && 'border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-900/10',
        status === 'in-progress' && 'border-yellow-200 dark:border-yellow-900 bg-yellow-50/50 dark:bg-yellow-900/10',
        status === 'not-started' && 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50'
      )}
    >
      <StatusIcon status={status} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">
            Tool {tool.number}: {tool.shortName}
          </span>
          {isRequired && (
            <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              Required
            </span>
          )}
        </div>

        {status === 'complete' && primaryMetric && primaryValue ? (
          <p className={cn('text-sm mt-0.5', styles.color)}>
            {primaryMetric}: {primaryValue}
          </p>
        ) : status === 'not-started' ? (
          <Link
            href={tool.path}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 mt-0.5"
          >
            Start this tool
            <ExternalLink className="h-3 w-3" />
          </Link>
        ) : (
          <p className="text-sm text-muted-foreground mt-0.5">
            {styles.label}
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ToolCompletionStatus({
  aggregatedData,
  onRefresh,
  isRefreshing = false,
  className,
}: ToolCompletionStatusProps) {
  // Determine status and metrics for each tool
  const getToolStatus = (toolNumber: number): {
    status: CompletionStatus;
    primaryMetric?: string;
    primaryValue?: string;
  } => {
    if (!aggregatedData) {
      return { status: 'not-started' };
    }

    switch (toolNumber) {
      case 1:
        if (aggregatedData.tool1) {
          return {
            status: 'complete',
            primaryMetric: 'Score',
            primaryValue: `${aggregatedData.tool1.compositeScore.toFixed(1)} (${aggregatedData.tool1.category})`,
          };
        }
        break;

      case 2:
        if (aggregatedData.tool2) {
          return {
            status: 'complete',
            primaryMetric: 'Annual Waste',
            primaryValue: formatCurrency(aggregatedData.tool2.annualizedWaste),
          };
        }
        break;

      case 3:
        if (aggregatedData.tool3) {
          return {
            status: 'complete',
            primaryMetric: 'Avg Latency',
            primaryValue: `${aggregatedData.tool3.avgDecisionLatencyDays} days`,
          };
        }
        break;

      case 4:
        if (aggregatedData.tool4) {
          return {
            status: 'complete',
            primaryMetric: 'Stakeholders',
            primaryValue: `${aggregatedData.tool4.stakeholderCount} (${aggregatedData.tool4.riskLevel} risk)`,
          };
        }
        break;

      case 5:
        if (aggregatedData.tool5) {
          return {
            status: 'complete',
            primaryMetric: 'Friction Cost',
            primaryValue: formatCurrency(aggregatedData.tool5.totalFrictionCost),
          };
        }
        break;

      case 6:
        if (aggregatedData.tool6) {
          return {
            status: 'complete',
            primaryMetric: 'Health Score',
            primaryValue: `${aggregatedData.tool6.healthScore} (${aggregatedData.tool6.healthStatus})`,
          };
        }
        break;
    }

    return { status: 'not-started' };
  };

  const completedCount = aggregatedData?.completedToolsCount ?? 0;
  const canProceed = aggregatedData?.canProceed ?? false;

  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-4 sm:p-6',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Tool Completion Status</h2>
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh from Tools'}
          </Button>
        )}
      </div>

      {/* Tool Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {TOOLS.map((tool) => {
          const { status, primaryMetric, primaryValue } = getToolStatus(tool.number);
          return (
            <ToolStatusItem
              key={tool.id}
              tool={tool}
              status={status}
              primaryMetric={primaryMetric}
              primaryValue={primaryValue}
              isRequired={tool.isRequired}
            />
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="mt-4 pt-4 border-t flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {completedCount} of {TOOLS.length} tools complete
        </p>

        {!canProceed && (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Tool 2 (Meeting Audit) is required to proceed
          </p>
        )}
      </div>
    </div>
  );
}
