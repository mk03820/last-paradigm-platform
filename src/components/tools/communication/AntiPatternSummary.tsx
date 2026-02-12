/**
 * AntiPatternSummary Component
 *
 * Displays a summary of anti-pattern detection results including
 * count, severity distribution, and overall communication health.
 *
 * Story 13.2: Anti-Pattern Detection
 * Task 5: Create AntiPatternSummary component (AC: 5)
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { PatternAnalysis } from './comm-constants';
import { HEALTH_STYLES, ANTI_PATTERNS } from './comm-constants';
import { getSeverityDistribution } from './detection-engine';
import { cn } from '@/lib/utils';

interface AntiPatternSummaryProps {
  analysis: PatternAnalysis;
  className?: string;
}

export function AntiPatternSummary({
  analysis,
  className,
}: AntiPatternSummaryProps) {
  const healthStyle = HEALTH_STYLES[analysis.overallHealth];
  const distribution = getSeverityDistribution(analysis.results);
  const totalPatterns = ANTI_PATTERNS.length;

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Analysis Summary</CardTitle>
          <Badge
            variant="secondary"
            className={cn(
              'text-sm px-3 py-1',
              healthStyle.bgColor,
              healthStyle.color
            )}
          >
            <span className="mr-1.5">{healthStyle.icon}</span>
            {healthStyle.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Detection count */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Anti-patterns detected</span>
          <span className="text-2xl font-semibold">
            {analysis.detectedCount}{' '}
            <span className="text-lg text-muted-foreground font-normal">
              of {totalPatterns}
            </span>
          </span>
        </div>

        {/* Severity distribution */}
        {analysis.detectedCount > 0 && (
          <div className="space-y-2">
            <span className="text-sm text-muted-foreground">
              Severity breakdown
            </span>
            <div className="flex flex-wrap gap-2">
              {distribution.high > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                >
                  {distribution.high} High
                </Badge>
              )}
              {distribution.medium > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                >
                  {distribution.medium} Medium
                </Badge>
              )}
              {distribution.low > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                >
                  {distribution.low} Low
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Health indicator bar */}
        <div className="space-y-2">
          <span className="text-sm text-muted-foreground">
            Communication health
          </span>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                analysis.overallHealth === 'healthy' && 'bg-green-500 w-full',
                analysis.overallHealth === 'warning' && 'bg-yellow-500 w-2/3',
                analysis.overallHealth === 'critical' && 'bg-red-500 w-1/3'
              )}
            />
          </div>
        </div>

        {/* Analyzed timestamp */}
        <p className="text-xs text-muted-foreground pt-2">
          Analyzed:{' '}
          {new Date(analysis.analyzedAt).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </p>
      </CardContent>
    </Card>
  );
}
