/**
 * OverallHealthScore Component
 *
 * Displays the overall communication health score with visual gauge.
 *
 * Story 13.3: Health Indicators Dashboard
 * Task 5: Create OverallHealthScore component (AC: 4)
 */

'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { HealthStatus, HealthEvaluationResult } from './comm-constants';
import { HEALTH_SCORE_INTERPRETATIONS, getHealthStatusStyle } from './comm-constants';
import { IndicatorStatusSummary } from './HealthIndicatorsTable';

export interface OverallHealthScoreProps {
  result: HealthEvaluationResult;
}

export function OverallHealthScore({ result }: OverallHealthScoreProps) {
  const { overallScore, overallStatus, indicators } = result;
  const statusStyle = getHealthStatusStyle(overallStatus);
  const interpretation = HEALTH_SCORE_INTERPRETATIONS[overallStatus];

  // Calculate the angle for the gauge (0-180 degrees, representing 0-100 score)
  const gaugeAngle = (overallScore / 100) * 180;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <span aria-hidden="true">📊</span>
          Overall Health Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Score Display with Gauge */}
          <div className="relative flex-shrink-0">
            {/* Semi-circular gauge background */}
            <div className="relative w-40 h-20 overflow-hidden">
              {/* Background arc */}
              <div
                className="absolute inset-0 rounded-t-full border-8 border-muted"
                style={{ borderBottomWidth: 0 }}
              />

              {/* Colored progress arc */}
              <div
                className={cn(
                  'absolute inset-0 rounded-t-full border-8',
                  overallStatus === 'healthy' && 'border-green-500',
                  overallStatus === 'warning' && 'border-yellow-500',
                  overallStatus === 'crisis' && 'border-red-500'
                )}
                style={{
                  borderBottomWidth: 0,
                  clipPath: `polygon(0 100%, 0 0, ${50 + gaugeAngle / 3.6}% 0, 50% 100%)`,
                }}
              />

              {/* Score number in center */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                <span
                  className={cn('text-4xl font-bold', statusStyle.color)}
                  aria-label={`Score: ${overallScore} out of 100`}
                >
                  {overallScore}
                </span>
                <span className="text-sm text-muted-foreground">/100</span>
              </div>
            </div>

            {/* Status badge below gauge */}
            <div className="mt-2 flex justify-center">
              <span
                className={cn(
                  'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium',
                  statusStyle.bgColor,
                  statusStyle.color
                )}
              >
                <span aria-hidden="true">{getStatusIcon(overallStatus)}</span>
                {statusStyle.label}
              </span>
            </div>
          </div>

          {/* Interpretation text */}
          <div className="flex-1 text-center md:text-left">
            <h3 className={cn('text-lg font-semibold mb-1', statusStyle.color)}>
              {interpretation.title}
            </h3>
            <p className="text-muted-foreground text-sm mb-3">
              {interpretation.description}
            </p>

            {/* Indicator summary */}
            <IndicatorStatusSummary results={indicators} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getStatusIcon(status: HealthStatus): string {
  switch (status) {
    case 'healthy':
      return '✅';
    case 'warning':
      return '⚠️';
    case 'crisis':
      return '🚨';
  }
}

/**
 * Compact version for inline display
 */
export function HealthScoreBadge({
  score,
  status,
}: {
  score: number;
  status: HealthStatus;
}) {
  const statusStyle = getHealthStatusStyle(status);

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg',
        statusStyle.bgColor
      )}
    >
      <span className={cn('text-xl font-bold', statusStyle.color)}>{score}</span>
      <span className="text-sm text-muted-foreground">/100</span>
      <span aria-hidden="true">{getStatusIcon(status)}</span>
    </div>
  );
}
