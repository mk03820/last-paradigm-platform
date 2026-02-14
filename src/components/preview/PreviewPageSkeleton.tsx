/**
 * Preview Page Skeleton Component
 *
 * Loading state skeleton for the preview page while diagnostic data loads.
 *
 * Story 16.1: Preview Page Layout & Savings Headline
 * Task 1.3: Create page layout shell with loading state skeleton
 * Covers: AC5 (Professional loading state)
 */

interface PreviewPageSkeletonProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * PreviewPageSkeleton - Professional loading state for preview page
 *
 * Features:
 * - Smooth pulse animation
 * - Matches hero section layout
 * - Executive Clarity theme colors
 * - Responsive design
 */
export function PreviewPageSkeleton({ className = '' }: PreviewPageSkeletonProps) {
  return (
    <div
      className={`bg-slate-900 text-white py-12 md:py-16 lg:py-24 animate-pulse ${className}`}
      role="status"
      aria-label="Loading preview page"
    >
      <div className="container mx-auto px-4 md:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Book attribution skeleton */}
          <div className="flex justify-center mb-8">
            <div className="h-4 w-64 bg-slate-700 rounded" />
          </div>

          {/* Subheadline skeleton */}
          <div className="flex justify-center mb-6">
            <div className="h-6 w-80 bg-slate-700 rounded" />
          </div>

          {/* Main number skeleton */}
          <div className="flex justify-center mb-4">
            <div className="h-12 md:h-16 lg:h-20 w-48 md:w-64 bg-slate-700 rounded" />
          </div>

          {/* "annually" text skeleton */}
          <div className="flex justify-center mb-8">
            <div className="h-8 w-32 bg-slate-700 rounded" />
          </div>

          {/* Personalized message skeleton */}
          <div className="p-6 rounded-xl bg-slate-800/50 space-y-4">
            {/* Badge skeleton */}
            <div className="flex justify-center">
              <div className="h-8 w-40 bg-slate-700 rounded-full" />
            </div>

            {/* Headline skeleton */}
            <div className="flex justify-center">
              <div className="h-8 w-72 bg-slate-700 rounded" />
            </div>

            {/* Description skeleton */}
            <div className="space-y-2 max-w-lg mx-auto">
              <div className="h-4 w-full bg-slate-700 rounded" />
              <div className="h-4 w-5/6 bg-slate-700 rounded mx-auto" />
            </div>

            {/* Stats skeleton */}
            <div className="flex justify-center">
              <div className="h-4 w-64 bg-slate-700 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Screen reader announcement */}
      <span className="sr-only">Loading your personalized preview...</span>
    </div>
  );
}
