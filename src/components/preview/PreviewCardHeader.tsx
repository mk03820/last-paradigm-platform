'use client';

/**
 * PreviewCardHeader Component
 *
 * Displays the tool name, ID, and priority badge in the card header.
 *
 * Story 16.3: Preview Cards with Blur Effect
 * Task 1: Create PreviewCard component with blur zones
 * Covers: AC1 (tool name and description clearly visible)
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { PreviewCardHeaderProps } from './PreviewCardTypes';
import type { RecommendationPriority } from '@/lib/pb2-tools/types';

/**
 * Priority-based styling for badges
 * Uses Executive Clarity design system colors
 */
const priorityStyles: Record<
  RecommendationPriority,
  { badge: string; badgeText: string }
> = {
  critical: {
    badge: 'bg-red-100 dark:bg-red-900',
    badgeText: 'text-red-700 dark:text-red-300',
  },
  high: {
    badge: 'bg-amber-100 dark:bg-amber-900',
    badgeText: 'text-amber-700 dark:text-amber-300',
  },
  moderate: {
    badge: 'bg-blue-100 dark:bg-blue-900',
    badgeText: 'text-blue-700 dark:text-blue-300',
  },
};

/**
 * Rank indicator styling
 * Gold for #1, descending gray for others
 */
const rankStyles: Record<number, string> = {
  1: 'bg-amber-600 text-white',
  2: 'bg-slate-600 text-white',
  3: 'bg-slate-400 text-white',
};

/**
 * PreviewCardHeader displays the tool identification and priority.
 *
 * @example
 * <PreviewCardHeader
 *   toolName="Decision Rights & Delegation Framework"
 *   toolShortName="Delegation Framework"
 *   toolId={3}
 *   priority="critical"
 *   rank={1}
 * />
 */
export function PreviewCardHeader({
  toolName,
  toolShortName,
  toolId,
  priority,
  rank,
}: PreviewCardHeaderProps) {
  const priorityStyle = priority ? priorityStyles[priority] : null;
  const rankStyle = rank ? rankStyles[rank] || rankStyles[3] : null;

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        {/* Rank Indicator */}
        {rank && (
          <span
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold',
              rankStyle
            )}
            aria-label={`Rank ${rank}`}
          >
            {rank}
          </span>
        )}

        <div>
          {/* Tool ID and Short Name */}
          <h3 className="text-lg font-semibold leading-tight text-foreground">
            Tool {toolId}: {toolShortName}
          </h3>
          {/* Full Tool Name */}
          <p className="mt-1 text-sm text-muted-foreground">{toolName}</p>
        </div>
      </div>

      {/* Priority Badge */}
      {priority && priorityStyle && (
        <span
          className={cn(
            'shrink-0 rounded-full px-2 py-1 text-xs font-medium capitalize',
            priorityStyle.badge,
            priorityStyle.badgeText
          )}
        >
          {priority}
        </span>
      )}
    </div>
  );
}

export default PreviewCardHeader;
