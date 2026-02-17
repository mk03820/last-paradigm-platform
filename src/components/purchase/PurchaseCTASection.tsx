'use client';

import { useRef, useCallback } from 'react';
import { PurchaseCTA } from './PurchaseCTA';
import { StickyCTA } from './StickyCTA';

/**
 * Props for PurchaseCTASection component
 */
interface PurchaseCTASectionProps {
  /** Additional CSS classes for the main CTA */
  className?: string;
}

/**
 * Purchase CTA Section with Mobile Sticky
 *
 * Client component that combines the main PurchaseCTA with the
 * mobile-only StickyCTA. Handles ref forwarding between components
 * and provides unified checkout handling.
 *
 * Story 17.1: Purchase CTA & Guarantee Display
 * Task 5: Integrate with preview page layout
 *
 * @example
 * ```tsx
 * // In preview page
 * <PurchaseCTASection className="mt-8" />
 * ```
 */
export function PurchaseCTASection({ className }: PurchaseCTASectionProps) {
  const ctaRef = useRef<HTMLElement>(null);

  /**
   * Handle checkout start for the sticky CTA
   * This creates the checkout session and redirects
   */
  const handleStickyCheckout = useCallback(async () => {
    // Fire analytics event (Story 17.8 integration point)
    // await trackEvent('checkout_started', { source: 'sticky_cta' });

    try {
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId: 'price_playbook2' }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      // Error handling is done in main CTA - this is a simplified version
      console.error('Checkout error:', error);
    }
  }, []);

  /**
   * Handle checkout start analytics for the main CTA
   */
  const handleCheckoutStart = useCallback(() => {
    // Fire analytics event (Story 17.8 integration point)
    // trackEvent('checkout_started', { source: 'main_cta' });
  }, []);

  return (
    <>
      {/* Main CTA Section */}
      <PurchaseCTA
        ref={ctaRef}
        className={className}
        onCheckoutStart={handleCheckoutStart}
      />

      {/* Mobile Sticky CTA - only shows when main CTA is scrolled out of view */}
      <StickyCTA
        triggerRef={ctaRef}
        onCheckoutStart={handleStickyCheckout}
      />
    </>
  );
}
