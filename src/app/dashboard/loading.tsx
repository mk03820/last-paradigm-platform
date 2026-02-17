/**
 * Dashboard Loading Skeleton
 *
 * Displays skeleton UI while dashboard data is loading.
 *
 * Story 19.1: Dashboard Layout & Navigation
 * Task 5.4: Add loading states with skeleton UI
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

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Welcome Section Skeleton */}
      <section aria-label="Loading welcome section">
        <SkeletonPulse className="h-8 w-64 mb-2" />
        <SkeletonPulse className="h-4 w-48" />
        <SkeletonPulse className="h-4 w-96 mt-4" />
      </section>

      {/* Quick Stats Skeleton */}
      <section aria-label="Loading quick stats">
        <SkeletonPulse className="h-6 w-48 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <SkeletonPulse className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <SkeletonPulse className="h-8 w-32 mb-2" />
                <SkeletonPulse className="h-3 w-40" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* New Session Button Skeleton */}
      <div className="flex justify-end">
        <SkeletonPulse className="h-10 w-36" />
      </div>

      {/* Diagnostic Progress Skeleton */}
      <section className="p-4 rounded-lg border bg-card">
        <SkeletonPulse className="h-6 w-40 mb-4" />
        <div className="space-y-4">
          <SkeletonPulse className="h-4 w-full" />
          <div className="grid grid-cols-7 gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <SkeletonPulse key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </section>

      {/* Diagnostic Tools Skeleton */}
      <section>
        <SkeletonPulse className="h-6 w-36 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <SkeletonPulse className="h-10 w-10 rounded-full mb-4" />
                <SkeletonPulse className="h-5 w-32 mb-2" />
                <SkeletonPulse className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Sessions List Skeleton */}
      <section>
        <SkeletonPulse className="h-6 w-48 mb-4" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <SkeletonPulse className="h-5 w-40 mb-2" />
                    <SkeletonPulse className="h-4 w-24" />
                  </div>
                  <SkeletonPulse className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Screen reader announcement */}
      <div className="sr-only" aria-live="polite">
        Loading dashboard content...
      </div>
    </div>
  );
}
