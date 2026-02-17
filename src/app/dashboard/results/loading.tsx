/**
 * Results Page Loading Skeleton
 *
 * Displays skeleton UI while results data is loading.
 *
 * Story 19.2: Diagnostic Results Display
 * Task 1.2: Create loading skeleton (AC: 7)
 * Covers: NFR23 (<2 second load time - progressive loading)
 */

import { Card, CardContent, CardHeader } from '@/components/ui/card';

function SkeletonPulse({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-muted rounded ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export default function ResultsLoading() {
  return (
    <div className="space-y-8">
      {/* Hero Section Skeleton */}
      <section aria-label="Loading results summary">
        {/* Title and metadata */}
        <div className="mb-6">
          <SkeletonPulse className="h-8 w-64 mb-2" />
          <div className="flex gap-4">
            <SkeletonPulse className="h-4 w-32" />
            <SkeletonPulse className="h-4 w-48" />
          </div>
        </div>

        {/* Key metrics cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Alignment Tax Card */}
          <Card>
            <CardContent className="pt-6">
              <SkeletonPulse className="h-4 w-32 mb-2" />
              <SkeletonPulse className="h-12 w-40 mb-2" />
              <SkeletonPulse className="h-3 w-48" />
            </CardContent>
          </Card>

          {/* Savings Card */}
          <Card>
            <CardContent className="pt-6">
              <SkeletonPulse className="h-4 w-36 mb-2" />
              <SkeletonPulse className="h-8 w-32 mb-2" />
              <SkeletonPulse className="h-3 w-40" />
            </CardContent>
          </Card>

          {/* Score Card */}
          <Card>
            <CardContent className="pt-6">
              <SkeletonPulse className="h-4 w-28 mb-2" />
              <div className="flex items-baseline gap-2 mb-2">
                <SkeletonPulse className="h-8 w-12" />
                <SkeletonPulse className="h-4 w-12" />
              </div>
              <SkeletonPulse className="h-2 w-full" />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Action Buttons Skeleton */}
      <div className="flex gap-2">
        <SkeletonPulse className="h-9 w-32" />
        <SkeletonPulse className="h-9 w-44" />
      </div>

      {/* Tool Results Grid Skeleton */}
      <section aria-label="Loading tool results">
        <SkeletonPulse className="h-6 w-32 mb-4" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <SkeletonPulse className="h-10 w-10 rounded-lg" />
                    <div>
                      <SkeletonPulse className="h-3 w-12 mb-1" />
                      <SkeletonPulse className="h-5 w-24" />
                    </div>
                  </div>
                  <SkeletonPulse className="h-5 w-16" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="mb-3 pb-3 border-b">
                  <SkeletonPulse className="h-3 w-24 mb-1" />
                  <SkeletonPulse className="h-6 w-20" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <SkeletonPulse className="h-4 w-24" />
                    <SkeletonPulse className="h-4 w-16" />
                  </div>
                  <div className="flex justify-between">
                    <SkeletonPulse className="h-4 w-28" />
                    <SkeletonPulse className="h-4 w-12" />
                  </div>
                  <div className="flex justify-between">
                    <SkeletonPulse className="h-4 w-20" />
                    <SkeletonPulse className="h-4 w-14" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Screen reader announcement */}
      <div className="sr-only" aria-live="polite">
        Loading your diagnostic results...
      </div>
    </div>
  );
}
