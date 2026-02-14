'use client';

/**
 * RecommendationCard Component
 *
 * Displays a single PB2 tool recommendation with personalized reasoning.
 *
 * Story 16.2: Tool Recommendation Algorithm
 * Task 5: Create Recommendation Card Component
 * Covers: AC7 (display tool name, description, reasoning, metric)
 */

import * as React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import type { ToolRecommendation, RecommendationPriority } from '@/lib/pb2-tools/types';
import { formatCurrency } from '@/lib/pb2-tools/recommendation-constants';

interface RecommendationCardProps {
  recommendation: ToolRecommendation;
  className?: string;
}

/**
 * Priority-based styling
 * Uses Executive Clarity design system (Navy/Gold palette)
 */
const priorityStyles: Record<RecommendationPriority, {
  border: string;
  bg: string;
  badge: string;
  badgeText: string;
}> = {
  critical: {
    border: 'border-l-4 border-l-red-600',
    bg: 'bg-red-50 dark:bg-red-950/20',
    badge: 'bg-red-100 dark:bg-red-900',
    badgeText: 'text-red-700 dark:text-red-300',
  },
  high: {
    border: 'border-l-4 border-l-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    badge: 'bg-amber-100 dark:bg-amber-900',
    badgeText: 'text-amber-700 dark:text-amber-300',
  },
  moderate: {
    border: 'border-l-4 border-l-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950/20',
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
 * Format the trigger value for display
 */
function formatTriggerValue(value: number | string): string {
  if (typeof value === 'number') {
    return formatCurrency(value);
  }
  return value;
}

export function RecommendationCard({
  recommendation,
  className = '',
}: RecommendationCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const { tool, reasoning, triggerMetric, triggerValue, benchmarkValue, priority, rank } =
    recommendation;

  const styles = priorityStyles[priority];
  const rankStyle = rankStyles[rank] || rankStyles[3];

  return (
    <Card
      className={`${styles.border} ${styles.bg} ${className}`}
      role="article"
      aria-label={`Recommendation ${rank}: ${tool.name}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Rank Indicator */}
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${rankStyle}`}
              aria-label={`Rank ${rank}`}
            >
              {rank}
            </span>
            <div>
              <CardTitle className="text-lg leading-tight">
                Tool {tool.id}: {tool.shortName}
              </CardTitle>
              <CardDescription className="mt-1 text-sm">
                {tool.name}
              </CardDescription>
            </div>
          </div>
          {/* Priority Badge */}
          <span
            className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium capitalize ${styles.badge} ${styles.badgeText}`}
          >
            {priority}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tool Description */}
        <p className="text-sm text-muted-foreground">{tool.description}</p>

        {/* Personalized Reasoning */}
        <div className="rounded-md border bg-background/50 p-3">
          <p className="text-sm font-medium text-foreground">{reasoning}</p>
        </div>

        {/* Trigger Metric Display */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Your {triggerMetric}: </span>
            <span className="font-semibold text-foreground">
              {formatTriggerValue(triggerValue)}
            </span>
          </div>
          {benchmarkValue && (
            <div>
              <span className="text-muted-foreground">Benchmark: </span>
              <span className="font-medium text-muted-foreground">
                {formatTriggerValue(benchmarkValue)}
              </span>
            </div>
          )}
        </div>

        {/* Why This Tool - Expandable Section */}
        <div className="border-t pt-3">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex w-full items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors"
            aria-expanded={isExpanded}
            aria-controls={`methodology-${tool.id}`}
          >
            <span>Why this tool?</span>
            <span
              className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              aria-hidden="true"
            >
              <ChevronDownIcon />
            </span>
          </button>
          {isExpanded && (
            <div
              id={`methodology-${tool.id}`}
              className="mt-3 text-sm text-muted-foreground"
            >
              <p className="mb-2">{tool.recommendationDescription}</p>
              <p className="text-xs italic">
                Based on methodology from {tool.bookChapter}
              </p>
              <p className="mt-2 text-xs">
                Output: <span className="font-mono">{tool.documentOutput}</span>
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Simple chevron down icon
 */
function ChevronDownIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export default RecommendationCard;
