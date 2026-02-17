/**
 * CommunicationResultCard Component (Tool 6)
 *
 * Displays Communication Pattern Diagnostic results
 * with health score and anti-patterns.
 *
 * Story 19.2: Diagnostic Results Display
 * Task 3.7: Create Tool 6 card (AC: 2)
 */

'use client';

import { MessageSquare, AlertCircle } from 'lucide-react';
import { ToolResultCard } from './ToolResultCard';
import { cn } from '@/lib/utils';
import type { CommunicationData } from './types';

interface CommunicationResultCardProps {
  data: CommunicationData | null | undefined;
}

/**
 * Get score color class based on value
 */
function getScoreColorClass(score: number): string {
  if (score < 50) return 'text-red-600 dark:text-red-400';
  if (score < 70) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-green-600 dark:text-green-400';
}

export function CommunicationResultCard({ data }: CommunicationResultCardProps) {
  if (!data) {
    return (
      <ToolResultCard
        toolNumber={6}
        toolName="Communication Pattern"
        icon={MessageSquare}
        completedAt={null}
      >
        <p className="text-sm text-muted-foreground">
          Analyze how information flows through your organization.
        </p>
      </ToolResultCard>
    );
  }

  const metrics = data.metrics;
  const healthScore = metrics?.healthScore ?? 0;
  const antiPatternCount = metrics?.antiPatternCount ?? data.antiPatterns?.length ?? 0;
  const antiPatterns = data.antiPatterns ?? [];

  return (
    <ToolResultCard
      toolNumber={6}
      toolName="Communication Pattern"
      icon={MessageSquare}
      completedAt={data.completedAt || null}
      keyMetric={
        metrics?.healthScore !== undefined
          ? {
              label: 'Communication Health Score',
              value: `${healthScore}/100`,
            }
          : undefined
      }
    >
      {data.completedAt && (
        <div className="space-y-3">
          {/* Health Score */}
          <div className="flex items-center gap-2">
            <span
              data-testid="health-score"
              className={cn('text-2xl font-bold', getScoreColorClass(healthScore))}
            >
              {healthScore}
            </span>
            <span className="text-sm text-muted-foreground">/ 100</span>
          </div>

          {/* Anti-pattern Count */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Anti-Patterns Detected</span>
            <span
              className={cn(
                'font-medium',
                antiPatternCount > 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-green-600 dark:text-green-400'
              )}
            >
              {antiPatternCount} anti-patterns
            </span>
          </div>

          {/* Anti-pattern List */}
          {antiPatterns.length > 0 && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Detected Issues
              </p>
              <ul className="space-y-1">
                {antiPatterns.slice(0, 3).map((pattern, index) => (
                  <li key={index} className="text-xs text-muted-foreground">
                    {pattern}
                  </li>
                ))}
                {antiPatterns.length > 3 && (
                  <li className="text-xs text-muted-foreground">
                    +{antiPatterns.length - 3} more...
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </ToolResultCard>
  );
}
