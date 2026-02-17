'use client';

import { useState, useEffect, useCallback, type RefObject } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2, ShieldCheck } from 'lucide-react';

/**
 * Props for StickyCTA component
 */
interface StickyCTAProps {
  /** Ref to the main CTA element - sticky shows when this is not visible */
  triggerRef: RefObject<HTMLElement | null>;
  /** Callback when checkout process starts */
  onCheckoutStart: () => Promise<void>;
  /** Product price in cents */
  price?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Mobile Sticky CTA Component
 *
 * Fixed bottom bar that appears on mobile when the main PurchaseCTA
 * scrolls out of view. Shows condensed price and guarantee message.
 *
 * Story 17.1: Purchase CTA & Guarantee Display
 * Covers: AC7 (Mobile sticky CTA)
 *
 * Features:
 * - Only renders on mobile viewports (< 768px via CSS)
 * - Uses IntersectionObserver to detect main CTA visibility
 * - Backdrop blur and shadow for visual separation
 * - Condensed guarantee text alongside button
 *
 * @example
 * ```tsx
 * const ctaRef = useRef<HTMLElement>(null);
 *
 * <PurchaseCTA ref={ctaRef} />
 * <StickyCTA
 *   triggerRef={ctaRef}
 *   onCheckoutStart={handleCheckout}
 * />
 * ```
 */
export function StickyCTA({
  triggerRef,
  onCheckoutStart,
  price = 250000,
  className,
}: StickyCTAProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Format price for display
  const formattedPrice = formatPrice(price);

  /**
   * Handle checkout button click
   */
  const handleCheckoutClick = useCallback(async () => {
    setIsLoading(true);
    try {
      await onCheckoutStart();
    } finally {
      // Note: setIsLoading(false) intentionally not called here
      // because we expect a page redirect after onCheckoutStart
      // If there's an error, the main CTA handles error state
    }
  }, [onCheckoutStart]);

  /**
   * Set up IntersectionObserver to track main CTA visibility
   */
  useEffect(() => {
    const element = triggerRef.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky CTA when main CTA is NOT visible
        setIsVisible(!entry.isIntersecting);
      },
      {
        // Use a small threshold to trigger as soon as element leaves viewport
        threshold: 0,
        // Add some root margin to trigger slightly before completely out of view
        rootMargin: '-100px 0px 0px 0px',
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [triggerRef]);

  // Don't render if not visible or on non-mobile (handled by CSS too)
  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        // Fixed positioning at bottom
        'fixed bottom-0 left-0 right-0 z-50',
        // Only show on mobile (hidden on md and up)
        'md:hidden',
        // Animation
        'animate-in slide-in-from-bottom duration-300',
        className
      )}
      role="complementary"
      aria-label="Quick purchase"
    >
      <div
        className={cn(
          // Background with blur effect
          'bg-slate-900/95 backdrop-blur-sm',
          // Border for visual separation
          'border-t border-slate-700',
          // Padding
          'p-4',
          // Shadow for elevation
          'shadow-2xl'
        )}
      >
        <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
          {/* Condensed Guarantee */}
          <div className="flex items-center gap-2 text-sm text-green-400">
            <ShieldCheck className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span className="whitespace-nowrap">30-Day Guarantee</span>
          </div>

          {/* CTA Button */}
          <Button
            onClick={handleCheckoutClick}
            disabled={isLoading}
            aria-busy={isLoading}
            className={cn(
              // Size and padding - minimum 48px height for touch targets
              'h-12 min-h-[48px] px-4 sm:px-6',
              'text-sm sm:text-base font-semibold',
              // Executive Clarity theme - amber accent
              'bg-amber-500 hover:bg-amber-400 active:bg-amber-600',
              'text-slate-900',
              // Shadow and transitions
              'shadow-lg',
              'transition-all duration-200',
              // Focus ring for accessibility
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900'
            )}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <span>{formattedPrice} - Get Access</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Format price from cents to display string
 * @param priceInCents - Price in cents (e.g., 250000 for $2,500)
 * @returns Formatted price string (e.g., "$2,500")
 */
function formatPrice(priceInCents: number): string {
  const dollars = priceInCents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(dollars);
}
