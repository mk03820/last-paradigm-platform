/**
 * HealthIndicatorRow Component
 *
 * Displays a single health indicator with value and threshold comparison.
 *
 * Story 13.3: Health Indicators Dashboard
 * Task 3: Create HealthIndicatorRow component (AC: 1, 2, 3)
 */

'use client';

import * as React from 'react';
import { Info } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { HealthIndicator, HealthIndicatorResult } from './comm-constants';
import { getHealthStatusStyle } from './comm-constants';
import { formatIndicatorValue, formatThreshold } from './health-engine';

export interface HealthIndicatorRowProps {
  indicator: HealthIndicator;
  result: HealthIndicatorResult;
}

export function HealthIndicatorRow({ indicator, result }: HealthIndicatorRowProps) {
  const statusStyle = getHealthStatusStyle(result.status);
  const { thresholds, direction, unit } = indicator;

  // Status icons
  const statusIcons = {
    healthy: '🟢',
    warning: '🟡',
    crisis: '🔴',
  };

  return (
    <TableRow>
      {/* Metric Name with Tooltip */}
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          <span>{indicator.name}</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={`Info about ${indicator.name}`}
                >
                  <Info className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p>{indicator.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </TableCell>

      {/* My Value with Status */}
      <TableCell>
        <div className="flex items-center gap-2">
          <span aria-hidden="true">{statusIcons[result.status]}</span>
          <span
            className={cn('font-semibold', statusStyle.color)}
            aria-label={`Your value: ${formatIndicatorValue(result.value, unit)}, status: ${result.status}`}
          >
            {formatIndicatorValue(result.value, unit)}
          </span>
        </div>
      </TableCell>

      {/* Healthy Threshold */}
      <TableCell className="text-green-700 dark:text-green-400">
        {formatThreshold(thresholds.healthy, unit, direction, 'healthy')}
      </TableCell>

      {/* Warning Threshold */}
      <TableCell className="text-yellow-700 dark:text-yellow-400">
        {formatThreshold(thresholds.warning, unit, direction, 'warning')}
      </TableCell>

      {/* Crisis Threshold */}
      <TableCell className="text-red-700 dark:text-red-400">
        {formatThreshold(thresholds.crisis, unit, direction, 'crisis')}
      </TableCell>
    </TableRow>
  );
}

/**
 * Mobile-friendly card version of the indicator row
 */
export function HealthIndicatorCard({ indicator, result }: HealthIndicatorRowProps) {
  const statusStyle = getHealthStatusStyle(result.status);
  const { thresholds, direction, unit } = indicator;

  const statusIcons = {
    healthy: '🟢',
    warning: '🟡',
    crisis: '🔴',
  };

  return (
    <div className="rounded-lg border p-4 space-y-3">
      {/* Header with name and status */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="font-medium">{indicator.name}</h4>
          <p className="text-sm text-muted-foreground">{indicator.description}</p>
        </div>
        <span className="text-xl" aria-hidden="true">
          {statusIcons[result.status]}
        </span>
      </div>

      {/* Value display */}
      <div className={cn('text-2xl font-bold', statusStyle.color)}>
        {formatIndicatorValue(result.value, unit)}
        <span
          className={cn('ml-2 text-sm font-medium px-2 py-1 rounded', statusStyle.bgColor)}
        >
          {statusStyle.label}
        </span>
      </div>

      {/* Threshold indicators */}
      <div className="flex gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Healthy: </span>
          <span className="text-green-700 dark:text-green-400">
            {formatThreshold(thresholds.healthy, unit, direction, 'healthy')}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">Warning: </span>
          <span className="text-yellow-700 dark:text-yellow-400">
            {formatThreshold(thresholds.warning, unit, direction, 'warning')}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">Crisis: </span>
          <span className="text-red-700 dark:text-red-400">
            {formatThreshold(thresholds.crisis, unit, direction, 'crisis')}
          </span>
        </div>
      </div>

      {/* Evidence */}
      {result.evidence && (
        <p className="text-sm text-muted-foreground italic">{result.evidence}</p>
      )}
    </div>
  );
}
