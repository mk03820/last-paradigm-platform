/**
 * Stakeholder Matrix Component
 *
 * Renders a 2x2 power/interest matrix with stakeholders plotted.
 *
 * Story 11.2: 2x2 Matrix Visualization
 * Covers: FR2-17 (Power/interest matrix visualization)
 */

'use client';

import React, { memo, useMemo, useState, useCallback } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Stakeholder, StakeholderQuadrant, StakeholderSentiment } from './stakeholder-constants';
import { getQuadrant, QUADRANTS, SENTIMENT_STYLES } from './stakeholder-constants';
import { cn } from '@/lib/utils';

export interface StakeholderMatrixProps {
  stakeholders: Stakeholder[];
  selectedId?: string | null;
  onSelect?: (stakeholder: Stakeholder) => void;
  className?: string;
}

// Quadrant colors for background and points
const QUADRANT_STYLES: Record<
  StakeholderQuadrant,
  { bg: string; point: string; text: string }
> = {
  key_players: {
    bg: 'bg-blue-500/10',
    point: 'bg-blue-500 hover:bg-blue-600',
    text: 'text-blue-700 dark:text-blue-300',
  },
  keep_satisfied: {
    bg: 'bg-purple-500/10',
    point: 'bg-purple-500 hover:bg-purple-600',
    text: 'text-purple-700 dark:text-purple-300',
  },
  keep_informed: {
    bg: 'bg-teal-500/10',
    point: 'bg-teal-500 hover:bg-teal-600',
    text: 'text-teal-700 dark:text-teal-300',
  },
  monitor: {
    bg: 'bg-gray-500/10',
    point: 'bg-gray-500 hover:bg-gray-600',
    text: 'text-gray-700 dark:text-gray-300',
  },
};

/**
 * Get stakeholder initials for display
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Convert power/interest (1-10) to percentage position (0-100)
 */
function getPosition(power: number, interest: number) {
  // Convert 1-10 scale to 0-100% for positioning
  const x = ((interest - 1) / 9) * 100;
  const y = 100 - ((power - 1) / 9) * 100; // Invert Y for CSS (top = 0)
  return { x, y };
}

/**
 * Group stakeholders by similar positions to handle overlaps
 */
function groupByPosition(stakeholders: Stakeholder[]) {
  const groups: Map<string, Stakeholder[]> = new Map();

  stakeholders.forEach((s) => {
    // Round to nearest 5% to group nearby stakeholders
    const pos = getPosition(s.power, s.interest);
    const key = `${Math.round(pos.x / 5) * 5}-${Math.round(pos.y / 5) * 5}`;

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(s);
  });

  return groups;
}

interface StakeholderPointProps {
  stakeholder: Stakeholder;
  isSelected: boolean;
  offset?: { x: number; y: number };
  onClick: () => void;
}

/**
 * Get sentiment ring class for a stakeholder
 */
function getSentimentRingClass(sentiment: StakeholderSentiment | undefined): string {
  if (!sentiment) return '';
  const styles = SENTIMENT_STYLES[sentiment];
  return `ring-2 ${styles.ring} ring-offset-1`;
}

const StakeholderPoint = memo(function StakeholderPoint({
  stakeholder,
  isSelected,
  offset = { x: 0, y: 0 },
  onClick,
}: StakeholderPointProps) {
  const pos = getPosition(stakeholder.power, stakeholder.interest);
  const quadrant = getQuadrant(stakeholder.power, stakeholder.interest);
  const styles = QUADRANT_STYLES[quadrant];
  const initials = getInitials(stakeholder.name);
  const sentimentRing = getSentimentRingClass(stakeholder.sentiment);

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={onClick}
            className={cn(
              'absolute flex items-center justify-center rounded-full',
              'w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm font-medium text-white',
              'transition-all duration-150 cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              styles.point,
              sentimentRing,
              isSelected && 'ring-2 ring-primary ring-offset-2 scale-110 z-10'
            )}
            style={{
              left: `calc(${pos.x + offset.x}% - 1rem)`,
              top: `calc(${pos.y + offset.y}% - 1rem)`,
            }}
            aria-label={`${stakeholder.name}, Power: ${stakeholder.power}, Interest: ${stakeholder.interest}${stakeholder.sentiment ? `, Sentiment: ${stakeholder.sentiment}` : ''}`}
          >
            {initials}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="text-sm">
            <p className="font-semibold">{stakeholder.name}</p>
            <p className="text-muted-foreground">{stakeholder.role}</p>
            <p className="mt-1 text-xs">
              Power: {stakeholder.power}/10 · Interest: {stakeholder.interest}/10
            </p>
            {stakeholder.sentiment && (
              <p className={cn('mt-1 text-xs font-medium', SENTIMENT_STYLES[stakeholder.sentiment].text)}>
                {stakeholder.sentiment.charAt(0).toUpperCase() + stakeholder.sentiment.slice(1)}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

export const StakeholderMatrix = memo(function StakeholderMatrix({
  stakeholders,
  selectedId,
  onSelect,
  className,
}: StakeholderMatrixProps) {
  const [hoveredQuadrant, setHoveredQuadrant] = useState<StakeholderQuadrant | null>(null);

  // Group stakeholders to handle overlaps
  const groupedStakeholders = useMemo(() => {
    const groups = groupByPosition(stakeholders);
    const result: Array<{ stakeholder: Stakeholder; offset: { x: number; y: number } }> = [];

    groups.forEach((group) => {
      if (group.length === 1) {
        result.push({ stakeholder: group[0], offset: { x: 0, y: 0 } });
      } else {
        // Apply offset for overlapping stakeholders
        group.forEach((s, i) => {
          const angle = (i / group.length) * 2 * Math.PI;
          const radius = 3; // 3% offset
          result.push({
            stakeholder: s,
            offset: {
              x: Math.cos(angle) * radius,
              y: Math.sin(angle) * radius,
            },
          });
        });
      }
    });

    return result;
  }, [stakeholders]);

  const handleSelect = useCallback(
    (stakeholder: Stakeholder) => {
      onSelect?.(stakeholder);
    },
    [onSelect]
  );

  return (
    <div
      className={cn('relative w-full', className)}
      role="img"
      aria-label="Stakeholder power/interest matrix"
    >
      {/* Axis Labels */}
      <div className="absolute -left-12 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-medium text-muted-foreground whitespace-nowrap">
        Power →
      </div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-6 text-xs font-medium text-muted-foreground">
        Interest →
      </div>

      {/* Matrix Container */}
      <div className="relative aspect-square w-full max-w-2xl mx-auto border-2 border-border rounded-lg overflow-hidden">
        {/* Quadrant Backgrounds */}
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
          {/* Top-Left: Keep Satisfied (High Power, Low Interest) */}
          <div
            className={cn(
              'relative border-b border-r border-border/50',
              QUADRANT_STYLES.keep_satisfied.bg,
              hoveredQuadrant === 'keep_satisfied' && 'bg-purple-500/20'
            )}
            onMouseEnter={() => setHoveredQuadrant('keep_satisfied')}
            onMouseLeave={() => setHoveredQuadrant(null)}
          >
            <span
              className={cn(
                'absolute top-2 left-2 text-xs font-medium',
                QUADRANT_STYLES.keep_satisfied.text
              )}
            >
              Keep Satisfied
            </span>
          </div>

          {/* Top-Right: Key Players (High Power, High Interest) */}
          <div
            className={cn(
              'relative border-b border-border/50',
              QUADRANT_STYLES.key_players.bg,
              hoveredQuadrant === 'key_players' && 'bg-blue-500/20'
            )}
            onMouseEnter={() => setHoveredQuadrant('key_players')}
            onMouseLeave={() => setHoveredQuadrant(null)}
          >
            <span
              className={cn(
                'absolute top-2 right-2 text-xs font-medium',
                QUADRANT_STYLES.key_players.text
              )}
            >
              Key Players
            </span>
          </div>

          {/* Bottom-Left: Monitor (Low Power, Low Interest) */}
          <div
            className={cn(
              'relative border-r border-border/50',
              QUADRANT_STYLES.monitor.bg,
              hoveredQuadrant === 'monitor' && 'bg-gray-500/20'
            )}
            onMouseEnter={() => setHoveredQuadrant('monitor')}
            onMouseLeave={() => setHoveredQuadrant(null)}
          >
            <span
              className={cn(
                'absolute bottom-2 left-2 text-xs font-medium',
                QUADRANT_STYLES.monitor.text
              )}
            >
              Monitor
            </span>
          </div>

          {/* Bottom-Right: Keep Informed (Low Power, High Interest) */}
          <div
            className={cn(
              'relative',
              QUADRANT_STYLES.keep_informed.bg,
              hoveredQuadrant === 'keep_informed' && 'bg-teal-500/20'
            )}
            onMouseEnter={() => setHoveredQuadrant('keep_informed')}
            onMouseLeave={() => setHoveredQuadrant(null)}
          >
            <span
              className={cn(
                'absolute bottom-2 right-2 text-xs font-medium',
                QUADRANT_STYLES.keep_informed.text
              )}
            >
              Keep Informed
            </span>
          </div>
        </div>

        {/* Axis Scale Markers */}
        <div className="absolute left-0 top-0 h-full w-6 flex flex-col justify-between text-[10px] text-muted-foreground py-1">
          <span>10</span>
          <span className="opacity-50">5</span>
          <span>1</span>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-6 flex justify-between text-[10px] text-muted-foreground px-1">
          <span>1</span>
          <span className="opacity-50">5</span>
          <span>10</span>
        </div>

        {/* Stakeholder Points */}
        <div className="absolute inset-6">
          {groupedStakeholders.map(({ stakeholder, offset }) => (
            <StakeholderPoint
              key={stakeholder.id}
              stakeholder={stakeholder}
              isSelected={stakeholder.id === selectedId}
              offset={offset}
              onClick={() => handleSelect(stakeholder)}
            />
          ))}
        </div>

        {/* Empty State */}
        {stakeholders.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">No stakeholders to display</p>
          </div>
        )}
      </div>
    </div>
  );
});
