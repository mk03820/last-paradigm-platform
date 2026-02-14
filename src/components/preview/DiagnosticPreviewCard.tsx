'use client';

/**
 * DiagnosticPreviewCard Component
 *
 * A preview card that displays user's diagnostic data clearly (visible zone)
 * and blurred methodology content (locked zone). Integrates with the
 * recommendation system to show personalized previews.
 *
 * Story 16.3: Preview Cards with Blur Effect
 * Task 1: Create PreviewCard component with blur zones
 * Task 5: Integrate user's diagnostic data into cards
 * Covers: AC1, AC2, AC3, AC4, AC5, AC6, AC7
 */

import * as React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/pb2-tools/recommendation-constants';
import type { PB2Tool, RecommendationPriority } from '@/lib/pb2-tools/types';
import type { DiagnosticData, LockedContent } from './PreviewCardTypes';
import { getDefaultLockedContent } from './PreviewCardTypes';

/**
 * Props for the DiagnosticPreviewCard component
 */
interface DiagnosticPreviewCardProps {
  /** The PB2 tool being previewed */
  tool: PB2Tool;
  /** User's diagnostic data to display (visible zone) */
  diagnosticData: DiagnosticData;
  /** Locked content to display blurred (optional - uses defaults if not provided) */
  lockedContent?: LockedContent;
  /** Priority level affecting card styling */
  priority?: RecommendationPriority;
  /** Rank for display ordering (1, 2, 3) */
  rank?: number;
  /** Additional CSS classes */
  className?: string;
  /** Callback when card is clicked */
  onClick?: () => void;
}

/**
 * Priority-based card border styling
 * Uses Executive Clarity design system (slate-900/amber-500)
 */
const priorityBorderStyles: Record<RecommendationPriority, string> = {
  critical: 'border-l-4 border-l-red-600',
  high: 'border-l-4 border-l-amber-500',
  moderate: 'border-l-4 border-l-blue-500',
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
 * Priority badge styling
 */
const priorityBadgeStyles: Record<
  RecommendationPriority,
  { badge: string; text: string }
> = {
  critical: {
    badge: 'bg-red-100 dark:bg-red-900',
    text: 'text-red-700 dark:text-red-300',
  },
  high: {
    badge: 'bg-amber-100 dark:bg-amber-900',
    text: 'text-amber-700 dark:text-amber-300',
  },
  moderate: {
    badge: 'bg-blue-100 dark:bg-blue-900',
    text: 'text-blue-700 dark:text-blue-300',
  },
};

/**
 * Format metric value for display
 * Task 5.3: Format diagnostic scores, percentages, and currency values
 */
function formatMetricValue(value: string | number): string {
  if (typeof value === 'number') {
    return formatCurrency(value);
  }
  return value;
}

/**
 * DiagnosticPreviewCard Component
 *
 * Structure (Task 1.2):
 * 1. Header Zone: Tool name, ID, priority badge, rank indicator
 * 2. Visible Zone: User's diagnostic data (clear, no blur)
 * 3. Visual Boundary: Dashed border divider
 * 4. Blurred Zone: Locked methodology content with unlock overlay
 */
export function DiagnosticPreviewCard({
  tool,
  diagnosticData,
  lockedContent,
  priority,
  rank,
  className,
  onClick,
}: DiagnosticPreviewCardProps) {
  const borderStyle = priority ? priorityBorderStyles[priority] : '';
  const rankStyle = rank ? rankStyles[rank] || rankStyles[3] : null;
  const priorityBadge = priority ? priorityBadgeStyles[priority] : null;

  // Use default locked content if not provided (Task 4.4)
  const contentToShow = lockedContent ?? getDefaultLockedContent(tool.id);

  return (
    <Card
      className={cn(
        // Base card styling
        'flex flex-col overflow-hidden',
        // Priority-based left border (Task 6.3)
        borderStyle,
        // Consistent sizing (Task 6.2)
        'min-h-[420px]',
        // Interactive states (for Story 16.4 integration)
        onClick && 'cursor-pointer transition-shadow hover:shadow-lg',
        className
      )}
      // Semantic HTML (Task 8.3)
      role="article"
      aria-label={`Preview of Tool ${tool.id}: ${tool.name}`}
      onClick={onClick}
      // Keyboard accessibility (Task 8.4)
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {/* HEADER ZONE - Tool identification (Task 1.2) */}
      <CardHeader className="pb-3">
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
              {/* Tool ID and Short Name (AC1) */}
              <h3 className="text-lg font-semibold leading-tight text-foreground">
                Tool {tool.id}: {tool.shortName}
              </h3>
              {/* Full Tool Name */}
              <p className="mt-1 text-sm text-muted-foreground">{tool.name}</p>
            </div>
          </div>
          {/* Priority Badge */}
          {priority && priorityBadge && (
            <span
              className={cn(
                'shrink-0 rounded-full px-2 py-1 text-xs font-medium capitalize',
                priorityBadge.badge,
                priorityBadge.text
              )}
            >
              {priority}
            </span>
          )}
        </div>
      </CardHeader>

      {/* CARD CONTENT */}
      <CardContent className="flex-1 flex flex-col">
        {/* VISIBLE DATA ZONE - User's diagnostic data (AC2) */}
        <div className="space-y-4">
          {/* Tool Description (AC1) */}
          <p className="text-sm text-muted-foreground">{tool.description}</p>

          {/* User's Diagnostic Results Box (Task 5.1, 5.2) */}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Your Diagnostic Results
            </h4>

            {/* Primary Metric Display (Task 5.3) */}
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-sm text-muted-foreground">
                {diagnosticData.metricLabel}:
              </span>
              <span className="text-lg font-bold text-foreground">
                {formatMetricValue(diagnosticData.metricValue)}
              </span>
              {diagnosticData.benchmarkValue && (
                <span className="text-sm text-muted-foreground">
                  (benchmark: {formatMetricValue(diagnosticData.benchmarkValue)})
                </span>
              )}
            </div>

            {/* Issues Summary (Task 5.2) */}
            {diagnosticData.issuesSummary && (
              <p className="mt-2 text-sm font-medium text-amber-700 dark:text-amber-400">
                {diagnosticData.issuesSummary}
              </p>
            )}
          </div>

          {/* Book Chapter Reference */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <BookIcon />
            <span>Based on {tool.bookChapter}</span>
          </div>
        </div>

        {/* VISUAL BOUNDARY - Divider (Task 1.5, AC4) */}
        <div
          className="my-4 border-t border-dashed border-border"
          aria-hidden="true"
        />

        {/* BLURRED CONTENT ZONE - Locked methodology (AC3, AC5) */}
        <div className="relative flex-1 min-h-[140px]">
          {/* Gradient Fade at Boundary (Task 3.5) */}
          <div
            className="absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-card to-transparent z-10 pointer-events-none"
            aria-hidden="true"
          />

          {/* Blurred Content (Task 2.1, 2.3, 2.5) */}
          <div
            className={cn(
              // CSS blur effect
              'blur-[6px]',
              // Prevent interaction and selection
              'select-none pointer-events-none',
              // Padding
              'pt-4 space-y-3'
            )}
            // Hide from screen readers (Task 8.1, AC7)
            aria-hidden="true"
            role="presentation"
          >
            {/* Locked Preview Text */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {contentToShow.previewText}
            </p>

            {/* Methodology Steps */}
            {contentToShow.methodologySteps &&
              contentToShow.methodologySteps.length > 0 && (
                <div className="rounded-md border border-border bg-muted/50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Methodology Includes:
                  </p>
                  <ul className="space-y-1">
                    {contentToShow.methodologySteps.map((step, index) => (
                      <li
                        key={index}
                        className="text-sm text-foreground flex items-center gap-2"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Document Output Reference */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground border-t border-border pt-3">
              <FileIcon />
              <span>Output: </span>
              <span className="font-mono">{tool.documentOutput}</span>
            </div>
          </div>

          {/* UNLOCK OVERLAY (Task 3, AC5) */}
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center',
              'bg-background/60 backdrop-blur-sm'
            )}
          >
            <div
              className={cn(
                'flex items-center gap-2 rounded-lg px-4 py-2',
                'bg-primary/10 border border-primary/20',
                'text-foreground shadow-lg'
              )}
            >
              <LockIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-semibold">Unlock with Playbook 2</span>
            </div>
          </div>

          {/* Screen Reader Alternative Text (Task 8.2, AC7) */}
          <span className="sr-only">
            Content locked - purchase Playbook 2 to access full tool details and
            templates. This includes the {tool.documentOutput} document.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Book icon for chapter reference
 */
function BookIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}

/**
 * File icon for document output
 */
function FileIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
  );
}

/**
 * Lock icon for unlock overlay
 */
interface IconProps {
  className?: string;
}

function LockIcon({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export default DiagnosticPreviewCard;
