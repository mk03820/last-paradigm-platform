/**
 * CheckoutCancelledBanner Component
 *
 * Displays a dismissible banner when user returns from cancelled Stripe checkout.
 * Provides reassurance that their progress is saved and they can retry.
 *
 * Story 17.2: Stripe Checkout Integration
 * Task 5: Create cancel return handler
 * Covers: AC6 (appropriate messaging when user returns from cancelled checkout)
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CheckoutCancelledBannerProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * Banner shown when user cancels checkout and returns to preview page
 *
 * Features:
 * - Dismissible via close button
 * - Updates URL to remove query param when dismissed
 * - Accessible with proper ARIA attributes
 * - Mobile-friendly with touch targets
 *
 * @example
 * ```tsx
 * <CheckoutCancelledBanner />
 * ```
 */
export function CheckoutCancelledBanner({ className }: CheckoutCancelledBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check if we should show the banner
  const showBanner = searchParams.get('checkout') === 'cancelled' && !isDismissed;

  // Track checkout abandonment (placeholder for Story 17.8)
  useEffect(() => {
    if (showBanner) {
      // TODO: Track checkout abandonment event (Story 17.8)
      console.log('[Analytics] Checkout abandoned');
    }
  }, [showBanner]);

  /**
   * Dismiss the banner and clean up URL
   */
  const handleDismiss = () => {
    setIsDismissed(true);

    // Remove checkout param from URL without page reload
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete('checkout');
    const newUrl = newParams.toString()
      ? `${window.location.pathname}?${newParams.toString()}`
      : window.location.pathname;
    router.replace(newUrl, { scroll: false });
  };

  /**
   * Scroll to purchase CTA section
   */
  const handleRetryClick = () => {
    const ctaSection = document.querySelector('[data-purchase-cta]');
    if (ctaSection) {
      ctaSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    handleDismiss();
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'bg-amber-900/50 border-b border-amber-700',
        'px-4 py-3',
        'animate-in slide-in-from-top duration-300',
        className
      )}
    >
      <div className="container mx-auto flex items-center justify-between gap-4">
        {/* Message */}
        <p className="text-amber-100 text-sm md:text-base flex-1">
          Your checkout was cancelled. No worries - your progress is saved and
          you can continue anytime.
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Retry Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRetryClick}
            className={cn(
              'text-amber-100 hover:text-white hover:bg-amber-800',
              'hidden sm:inline-flex', // Hide on very small screens
              'min-h-[36px]'
            )}
          >
            <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
            <span>Continue to Checkout</span>
          </Button>

          {/* Dismiss Button */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleDismiss}
            className={cn(
              'text-amber-100 hover:text-white hover:bg-amber-800',
              'min-h-[36px] min-w-[36px]'
            )}
            aria-label="Dismiss message"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CheckoutCancelledBanner;
