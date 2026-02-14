'use client';

/**
 * DiagnosticPreviewCardGrid Component
 *
 * Responsive grid layout for displaying multiple DiagnosticPreviewCards.
 * Implements mobile/tablet/desktop breakpoints.
 *
 * Story 16.3: Preview Cards with Blur Effect
 * Task 6: Implement consistent card layout and styling
 * Task 7: Add responsive card layout
 * Covers: AC6 (consistent styling), AC8 (cross-browser compatibility)
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { DiagnosticPreviewCard } from './DiagnosticPreviewCard';
import type { ToolRecommendation } from '@/lib/pb2-tools/types';
import { getDefaultLockedContent } from './PreviewCardTypes';
import type { DiagnosticData } from './PreviewCardTypes';

interface DiagnosticPreviewCardGridProps {
  /** Array of tool recommendations to display */
  recommendations: ToolRecommendation[];
  /** Optional loading state */
  isLoading?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Callback when a card is clicked */
  onCardClick?: (toolId: number) => void;
}

/**
 * Loading skeleton for preview cards
 */
function PreviewCardSkeleton() {
  return (
    <div
      className="animate-pulse rounded-xl border bg-muted/50 p-6 min-h-[420px]"
      aria-hidden="true"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="h-8 w-8 rounded-full bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-3/4 rounded bg-muted" />
          <div className="h-4 w-1/2 rounded bg-muted" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-5/6 rounded bg-muted" />
        <div className="h-20 rounded bg-muted mt-4" />
      </div>
      <div className="mt-4 border-t border-dashed pt-4">
        <div className="h-32 rounded bg-muted" />
      </div>
    </div>
  );
}

/**
 * Empty state when no recommendations are available
 */
function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed p-8 text-center">
      <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
        <InfoIcon />
      </div>
      <h3 className="text-lg font-semibold">No Recommendations Available</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Complete more diagnostic tools to receive personalized tool recommendations.
      </p>
    </div>
  );
}

/**
 * Map recommendation to DiagnosticData for the visible zone
 * Task 5.2: Map PB1 tool results to appropriate preview card data display
 */
function mapRecommendationToDignosticData(
  recommendation: ToolRecommendation
): DiagnosticData {
  return {
    metricLabel: recommendation.triggerMetric,
    metricValue: recommendation.triggerValue,
    benchmarkValue: recommendation.benchmarkValue,
    issuesSummary: recommendation.reasoning,
    sourceToolId: recommendation.tool.feedsFromPB1Tools[0] ?? 0,
  };
}

/**
 * DiagnosticPreviewCardGrid Component
 *
 * Layout breakpoints (Task 7):
 * - Desktop (lg+): 3-column grid (Task 7.1)
 * - Tablet (md): 2-column grid (Task 7.2)
 * - Mobile (sm and below): Single column stack (Task 7.3)
 *
 * Task 6.5: Consistent gap-6 spacing between cards
 */
export function DiagnosticPreviewCardGrid({
  recommendations,
  isLoading = false,
  className,
  onCardClick,
}: DiagnosticPreviewCardGridProps) {
  // Show loading state
  if (isLoading) {
    return (
      <section
        className={cn('space-y-6', className)}
        aria-busy="true"
        aria-label="Loading preview cards"
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">
            Top 3 Recommendations for You
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Loading your personalized recommendations...
          </p>
        </div>
        <div
          className={cn(
            // Responsive grid (Task 7.1, 7.2, 7.3)
            'grid gap-6',
            'grid-cols-1',
            'md:grid-cols-2',
            'lg:grid-cols-3'
          )}
        >
          <PreviewCardSkeleton />
          <PreviewCardSkeleton />
          <PreviewCardSkeleton />
        </div>
      </section>
    );
  }

  // Show empty state
  if (!recommendations || recommendations.length === 0) {
    return (
      <section className={cn('space-y-6', className)} aria-label="Recommendations">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">
            Top 3 Recommendations for You
          </h2>
        </div>
        <EmptyState />
      </section>
    );
  }

  return (
    <section className={cn('space-y-6', className)} aria-label="Tool recommendations">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">
          Top 3 Recommendations for You
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Personalized tools based on your diagnostic results
        </p>
      </div>

      {/* Cards Grid (Task 6.4, 6.5, 7) */}
      <div
        className={cn(
          // Responsive grid layout
          'grid gap-6',
          // Mobile: single column (Task 7.3)
          'grid-cols-1',
          // Tablet: 2 columns (Task 7.2)
          'md:grid-cols-2',
          // Desktop: 3 columns (Task 7.1)
          'lg:grid-cols-3'
        )}
        role="list"
        aria-label="Ranked recommendations"
      >
        {recommendations.map((recommendation) => (
          <div key={recommendation.toolId} role="listitem">
            <DiagnosticPreviewCard
              tool={recommendation.tool}
              diagnosticData={mapRecommendationToDignosticData(recommendation)}
              lockedContent={getDefaultLockedContent(recommendation.toolId)}
              priority={recommendation.priority}
              rank={recommendation.rank}
              onClick={onCardClick ? () => onCardClick(recommendation.toolId) : undefined}
            />
          </div>
        ))}
      </div>

      {/* Methodology Attribution */}
      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <BookIcon />
        <span>Based on The Last Paradigm methodology</span>
      </div>
    </section>
  );
}

/**
 * Info icon for empty state
 */
function InfoIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-muted-foreground"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

/**
 * Book icon for attribution
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

export default DiagnosticPreviewCardGrid;
