/**
 * StakeholderMapResultCard Component (Tool 4)
 *
 * Displays Stakeholder Power/Interest Mapping results
 * with counts by quadrant and sentiment distribution.
 *
 * Story 19.2: Diagnostic Results Display
 * Task 3.5: Create Tool 4 card (AC: 2)
 */

'use client';

import { Users } from 'lucide-react';
import { ToolResultCard } from './ToolResultCard';
import { cn } from '@/lib/utils';
import type { StakeholderMapData } from './types';

interface StakeholderMapResultCardProps {
  data: StakeholderMapData | null | undefined;
}

type Sentiment = 'champion' | 'neutral' | 'blocker';

/**
 * Get sentiment color class
 */
function getSentimentColorClass(sentiment: Sentiment): string {
  switch (sentiment) {
    case 'champion':
      return 'text-green-600 dark:text-green-400';
    case 'neutral':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'blocker':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-muted-foreground';
  }
}

/**
 * Categorize stakeholder into quadrant
 */
function getQuadrant(power: number, interest: number): string {
  const highPower = power >= 6;
  const highInterest = interest >= 6;

  if (highPower && highInterest) return 'keyPlayers';
  if (highPower && !highInterest) return 'keepSatisfied';
  if (!highPower && highInterest) return 'keepInformed';
  return 'monitor';
}

const QUADRANT_LABELS: Record<string, string> = {
  keyPlayers: 'Key Players',
  keepSatisfied: 'Keep Satisfied',
  keepInformed: 'Keep Informed',
  monitor: 'Monitor',
};

export function StakeholderMapResultCard({ data }: StakeholderMapResultCardProps) {
  if (!data) {
    return (
      <ToolResultCard
        toolNumber={4}
        toolName="Stakeholder Map"
        icon={Users}
        completedAt={null}
      >
        <p className="text-sm text-muted-foreground">
          Map who influences your transformation.
        </p>
      </ToolResultCard>
    );
  }

  const stakeholders = data.stakeholders ?? [];
  const totalCount = stakeholders.length;

  // Count by quadrant
  const quadrantCounts: Record<string, number> = {
    keyPlayers: 0,
    keepSatisfied: 0,
    keepInformed: 0,
    monitor: 0,
  };

  // Count by sentiment
  const sentimentCounts: Record<Sentiment, number> = {
    champion: 0,
    neutral: 0,
    blocker: 0,
  };

  stakeholders.forEach((s) => {
    if (s.power !== undefined && s.interest !== undefined) {
      const quadrant = getQuadrant(s.power, s.interest);
      quadrantCounts[quadrant]++;
    }
    if (s.sentiment) {
      sentimentCounts[s.sentiment]++;
    }
  });

  return (
    <ToolResultCard
      toolNumber={4}
      toolName="Stakeholder Map"
      icon={Users}
      completedAt={data.completedAt || null}
      keyMetric={
        totalCount > 0
          ? {
              label: 'Total Stakeholders',
              value: `${totalCount} stakeholders`,
            }
          : undefined
      }
    >
      {totalCount > 0 && (
        <div className="space-y-4">
          {/* Quadrant counts */}
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(quadrantCounts).map(([key, count]) => (
              <div key={key} className="text-sm">
                <span className="text-muted-foreground">{QUADRANT_LABELS[key]}</span>
                <span
                  className="ml-2 font-medium"
                  data-testid={`quadrant-count-${key}`}
                >
                  {count}
                </span>
              </div>
            ))}
          </div>

          {/* Sentiment distribution */}
          <div className="pt-2 border-t space-y-1">
            <p className="text-xs text-muted-foreground mb-2">Sentiment</p>
            <div className="flex items-center gap-4 text-sm">
              {(['champion', 'neutral', 'blocker'] as const).map((sentiment) => (
                <span key={sentiment} className="flex items-center gap-1">
                  <span className={cn('font-medium', getSentimentColorClass(sentiment))}>
                    {sentimentCounts[sentiment]}
                  </span>
                  <span className="text-muted-foreground capitalize">{sentiment}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </ToolResultCard>
  );
}
