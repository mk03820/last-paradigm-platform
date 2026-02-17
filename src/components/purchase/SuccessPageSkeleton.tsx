/**
 * SuccessPageSkeleton Component
 *
 * Loading skeleton for the success page while validating the session.
 * Provides visual feedback during async operations.
 *
 * Story 17.6: Purchase Success Page
 * Task 1.6: Handle page refresh gracefully (idempotent display)
 */

/**
 * SuccessPageSkeleton - Loading state for success page
 *
 * Displays animated skeleton placeholders matching the
 * layout of the actual success page content.
 *
 * @example
 * ```tsx
 * <Suspense fallback={<SuccessPageSkeleton />}>
 *   <SuccessContent />
 * </Suspense>
 * ```
 */
export function SuccessPageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero Skeleton */}
      <section className="pt-24 pb-16 text-center">
        {/* Success Icon */}
        <div className="mx-auto mb-8 w-24 h-24 rounded-full bg-slate-800 animate-pulse" />

        {/* Headline */}
        <div className="space-y-4 px-4">
          <div className="h-12 w-80 max-w-full mx-auto bg-slate-800 rounded-lg animate-pulse" />
          <div className="h-6 w-96 max-w-full mx-auto bg-slate-800/60 rounded animate-pulse" />
        </div>
      </section>

      {/* Confirmation Skeleton */}
      <section className="py-12 bg-slate-800/50">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="h-5 w-48 mx-auto mb-6 bg-slate-700 rounded animate-pulse" />

          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 space-y-4">
            {/* Amount */}
            <div className="flex items-center justify-between">
              <div className="h-5 w-24 bg-slate-700 rounded animate-pulse" />
              <div className="h-7 w-24 bg-slate-700 rounded animate-pulse" />
            </div>

            <div className="border-t border-slate-700" />

            {/* Date */}
            <div className="flex items-center justify-between">
              <div className="h-5 w-28 bg-slate-700 rounded animate-pulse" />
              <div className="h-5 w-48 bg-slate-700 rounded animate-pulse" />
            </div>

            <div className="border-t border-slate-700" />

            {/* Email */}
            <div className="flex items-center justify-between">
              <div className="h-5 w-32 bg-slate-700 rounded animate-pulse" />
              <div className="h-5 w-44 bg-slate-700 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Next Steps Skeleton */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="h-8 w-40 mx-auto mb-12 bg-slate-800 rounded animate-pulse" />

          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-6"
              >
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-full bg-slate-700 animate-pulse" />
                  <div className="flex-grow space-y-3">
                    <div className="h-6 w-40 bg-slate-700 rounded animate-pulse" />
                    <div className="h-4 w-full bg-slate-700/60 rounded animate-pulse" />
                    <div className="h-4 w-3/4 bg-slate-700/60 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Skeleton */}
      <section className="py-16 bg-slate-800/30">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="h-8 w-40 mx-auto mb-6 bg-slate-700 rounded animate-pulse" />
          <div className="h-14 w-64 mx-auto bg-amber-500/30 rounded-lg animate-pulse" />
        </div>
      </section>
    </div>
  );
}

export default SuccessPageSkeleton;
