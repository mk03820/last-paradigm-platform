'use client';

/**
 * RecommendationsList Component
 *
 * Displays ranked list of top 3 PB2 tool recommendations.
 *
 * Story 16.2: Tool Recommendation Algorithm
 * Task 6: Create Recommendations List Component
 * Covers: AC1, AC8 (display ranked list with methodology attribution)
 */

import * as React from 'react';
import { RecommendationCard } from './RecommendationCard';
import type { ToolRecommendation } from '@/lib/pb2-tools/types';

interface RecommendationsListProps {
  recommendations: ToolRecommendation[];
  isLoading?: boolean;
  className?: string;
}

/**
 * Loading skeleton for recommendations
 */
function RecommendationSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border bg-muted/50 p-6">
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 rounded-full bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-3/4 rounded bg-muted" />
          <div className="h-4 w-1/2 rounded bg-muted" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-5/6 rounded bg-muted" />
      </div>
      <div className="mt-4 h-16 rounded bg-muted" />
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
        Complete more diagnostic tools to receive personalized recommendations.
      </p>
    </div>
  );
}

export function RecommendationsList({
  recommendations,
  isLoading = false,
  className = '',
}: RecommendationsListProps) {
  // Show loading state
  if (isLoading) {
    return (
      <section className={className} aria-busy="true" aria-label="Loading recommendations">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">
            Top 3 Recommendations for You
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Loading your personalized recommendations...
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
          <RecommendationSkeleton />
          <RecommendationSkeleton />
          <RecommendationSkeleton />
        </div>
      </section>
    );
  }

  // Show empty state
  if (!recommendations || recommendations.length === 0) {
    return (
      <section className={className} aria-label="Recommendations">
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
    <section className={className} aria-label="Tool recommendations">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">
          Top 3 Recommendations for You
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Personalized tools based on your diagnostic results
        </p>
      </div>

      {/* Recommendations Grid */}
      <div
        className="grid gap-4 md:grid-cols-1 lg:grid-cols-3"
        role="list"
        aria-label="Ranked recommendations"
      >
        {recommendations.map((recommendation) => (
          <div key={recommendation.toolId} role="listitem">
            <RecommendationCard recommendation={recommendation} />
          </div>
        ))}
      </div>

      {/* Methodology Attribution (FR65) */}
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
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}

export default RecommendationsList;
