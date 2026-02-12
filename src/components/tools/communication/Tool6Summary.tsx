/**
 * Tool6Summary Component
 *
 * Displays a summary of Tool 6 results for Tool 7 aggregation preview.
 *
 * Story 13.4: Intervention Recommendations
 * Task 5: Create Tool6Summary component (AC: 4)
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, XCircle, ClipboardList } from 'lucide-react';
import type { Tool6Summary as Tool6SummaryType, HealthStatus } from './comm-constants';
import { HEALTH_STYLES } from './comm-constants';
import { cn } from '@/lib/utils';

interface Tool6SummaryProps {
  summary: Tool6SummaryType;
  className?: string;
}

export function Tool6Summary({ summary, className }: Tool6SummaryProps) {
  const healthStyle = getHealthStyle(summary.healthStatus);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ClipboardList className="h-5 w-5" />
          Tool 6 Summary
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Ready for Total Cost of Misalignment Calculator
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Health Score */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2">
            {healthStyle.icon}
            <span className="text-sm font-medium">Communication Health</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{summary.healthScore}</span>
            <span className="text-sm text-muted-foreground">/100</span>
            <Badge
              variant="secondary"
              className={cn(healthStyle.bgColor, healthStyle.color)}
            >
              {healthStyle.label}
            </Badge>
          </div>
        </div>

        {/* Anti-Patterns Detected */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <span className="text-sm font-medium">Anti-Patterns Detected</span>
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold">{summary.patternsDetected}</span>
            <span className="text-sm text-muted-foreground">of 5</span>
          </div>
        </div>

        {/* Severity Breakdown */}
        {summary.patternsDetected > 0 && (
          <div className="flex flex-wrap gap-2 justify-end">
            {summary.patternsSeverity.high > 0 && (
              <Badge
                variant="secondary"
                className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
              >
                {summary.patternsSeverity.high} High
              </Badge>
            )}
            {summary.patternsSeverity.medium > 0 && (
              <Badge
                variant="secondary"
                className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
              >
                {summary.patternsSeverity.medium} Medium
              </Badge>
            )}
            {summary.patternsSeverity.low > 0 && (
              <Badge
                variant="secondary"
                className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
              >
                {summary.patternsSeverity.low} Low
              </Badge>
            )}
          </div>
        )}

        {/* Interventions */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <span className="text-sm font-medium">Interventions Recommended</span>
          <span className="text-xl font-semibold">{summary.interventionsRecommended}</span>
        </div>

        {/* Top Interventions Preview */}
        {summary.topInterventions.length > 0 && (
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Top priorities:</span>
            <ol className="list-decimal list-inside text-sm text-muted-foreground pl-1">
              {summary.topInterventions.slice(0, 3).map((title, index) => (
                <li key={index} className="truncate">
                  {title}
                </li>
              ))}
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Get health style with icon
 */
function getHealthStyle(status: HealthStatus) {
  const baseStyle = status === 'crisis' ? HEALTH_STYLES.critical : HEALTH_STYLES[status];

  const icons = {
    healthy: <CheckCircle2 className="h-5 w-5 text-green-600" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
    crisis: <XCircle className="h-5 w-5 text-red-600" />,
  };

  return {
    ...baseStyle,
    icon: icons[status],
  };
}

/**
 * Compact summary badge for navigation
 */
interface Tool6CompleteBadgeProps {
  summary: Tool6SummaryType;
  className?: string;
}

export function Tool6CompleteBadge({ summary, className }: Tool6CompleteBadgeProps) {
  const healthStyle = getHealthStyle(summary.healthStatus);

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm',
        healthStyle.bgColor,
        className
      )}
    >
      {healthStyle.icon}
      <span className={healthStyle.color}>
        Health: {summary.healthScore}/100
      </span>
      <span className="text-muted-foreground">•</span>
      <span className={healthStyle.color}>
        {summary.patternsDetected} patterns
      </span>
    </div>
  );
}
