'use client';

import { useState, forwardRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { GuaranteeBadge } from '@/components/trust';
import { CheckoutTransition, type CheckoutTransitionStatus } from '@/components/checkout';
import { InvoiceRequestModal } from '@/components/invoice';
import { cn } from '@/lib/utils';
import { Loader2, ArrowRight, Building2 } from 'lucide-react';

/**
 * Checkout overlay state
 */
interface CheckoutOverlayState {
  isVisible: boolean;
  status: CheckoutTransitionStatus;
  errorMessage?: string;
}

/**
 * Props for PurchaseCTA component
 */
interface PurchaseCTAProps {
  /** Callback when checkout process starts */
  onCheckoutStart?: () => void;
  /** Callback when checkout process completes (before redirect) */
  onCheckoutComplete?: (checkoutUrl: string) => void;
  /** Callback when checkout fails */
  onCheckoutError?: (error: Error) => void;
  /** Additional CSS classes */
  className?: string;
  /** Product price in cents */
  price?: number;
  /** Whether the CTA is disabled */
  disabled?: boolean;
  /** Whether to show the checkout transition overlay (default: true) */
  showTransitionOverlay?: boolean;
  /** Whether to show the enterprise invoice link (default: true) */
  showInvoiceOption?: boolean;
  /** User's email for pre-filling invoice form */
  userEmail?: string;
}

/**
 * Purchase CTA Section Component
 *
 * Displays a prominent call-to-action button with the $2,500 price,
 * value proposition text, and 30-day money-back guarantee badge.
 *
 * Story 17.1: Purchase CTA & Guarantee Display
 * Covers: AC1, AC4, AC5, AC6
 *
 * @example
 * ```tsx
 * <PurchaseCTA
 *   onCheckoutStart={() => trackEvent('checkout_started')}
 *   onCheckoutComplete={(url) => window.location.href = url}
 *   onCheckoutError={(error) => toast.error(error.message)}
 * />
 * ```
 */
export const PurchaseCTA = forwardRef<HTMLElement, PurchaseCTAProps>(
  function PurchaseCTA(
    {
      onCheckoutStart,
      onCheckoutComplete,
      onCheckoutError,
      className,
      price = 250000, // $2,500 in cents
      disabled = false,
      showTransitionOverlay = true,
      showInvoiceOption = true,
      userEmail,
    },
    ref
  ) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Checkout transition overlay state (Story 17.3)
    const [checkoutOverlay, setCheckoutOverlay] = useState<CheckoutOverlayState>({
      isVisible: false,
      status: 'initiating',
    });

    // Invoice request modal state (Story 17.7)
    const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

    // Format price for display
    const formattedPrice = formatPrice(price);

    /**
     * Handle purchase button click
     * Initiates checkout flow with loading state and error handling
     */
    const handlePurchaseClick = async () => {
      setIsLoading(true);
      setError(null);

      // Show checkout transition overlay (Story 17.3)
      if (showTransitionOverlay) {
        setCheckoutOverlay({
          isVisible: true,
          status: 'initiating',
        });
      }

      // Fire analytics event callback
      onCheckoutStart?.();

      try {
        // Call checkout session API (Story 17.2 integration point)
        const response = await fetch('/api/checkout/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ priceId: 'price_playbook2' }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to create checkout session');
        }

        const { url } = await response.json();

        if (!url) {
          throw new Error('No checkout URL received');
        }

        // Update to redirecting state (Story 17.3)
        if (showTransitionOverlay) {
          setCheckoutOverlay({
            isVisible: true,
            status: 'redirecting',
          });
        }

        // Notify completion before redirect
        onCheckoutComplete?.(url);

        // Redirect to Stripe checkout (overlay remains visible)
        window.location.href = url;
      } catch (err) {
        setIsLoading(false);
        const errorObj = err instanceof Error ? err : new Error('An unexpected error occurred');
        setError(errorObj.message);

        // Update overlay to error state (Story 17.3)
        if (showTransitionOverlay) {
          setCheckoutOverlay({
            isVisible: true,
            status: 'error',
            errorMessage: errorObj.message,
          });
        }

        onCheckoutError?.(errorObj);
      }
    };

    /**
     * Handle retry from checkout overlay error state
     */
    const handleOverlayRetry = useCallback(() => {
      setCheckoutOverlay({
        isVisible: true,
        status: 'initiating',
      });
      handlePurchaseClick();
    }, []);

    /**
     * Handle close from checkout overlay error state
     */
    const handleOverlayClose = useCallback(() => {
      setCheckoutOverlay({
        isVisible: false,
        status: 'initiating',
      });
    }, []);

    return (
      <>
        {/* Checkout Transition Overlay (Story 17.3) */}
        {showTransitionOverlay && (
          <CheckoutTransition
            isVisible={checkoutOverlay.isVisible}
            status={checkoutOverlay.status}
            errorMessage={checkoutOverlay.errorMessage}
            onRetry={handleOverlayRetry}
            onClose={handleOverlayClose}
          />
        )}

        <section
          ref={ref}
          className={cn(
            'py-12 md:py-16 lg:py-20 bg-slate-900 text-center',
            className
          )}
          aria-labelledby="purchase-cta-heading"
        >
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Value Proposition Heading */}
          <h2
            id="purchase-cta-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4"
          >
            Ready to Transform Your Organization?
          </h2>

          {/* Value Proposition Description */}
          <p className="text-slate-300 text-base md:text-lg mb-8 max-w-xl mx-auto">
            Get instant access to all 10 diagnostic tools, your personalized
            transformation roadmap, and executive-ready reports.
          </p>

          {/* Benefits List */}
          <ul className="text-slate-400 text-sm md:text-base mb-8 space-y-2 max-w-md mx-auto text-left">
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5" aria-hidden="true">
                &#10003;
              </span>
              <span>Complete 10-tool diagnostic suite</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5" aria-hidden="true">
                &#10003;
              </span>
              <span>Personalized transformation roadmap</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5" aria-hidden="true">
                &#10003;
              </span>
              <span>Executive-ready reports & insights</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5" aria-hidden="true">
                &#10003;
              </span>
              <span>Lifetime access to your results</span>
            </li>
          </ul>

          {/* CTA Button - AC1, AC4, AC5 */}
          <Button
            size="lg"
            onClick={handlePurchaseClick}
            disabled={isLoading || disabled}
            aria-busy={isLoading}
            aria-describedby={error ? 'checkout-error' : undefined}
            className={cn(
              // Base styles - minimum 48px height for touch targets (AC4)
              'h-14 min-h-[48px] px-6 sm:px-8 text-base sm:text-lg font-semibold',
              // Executive Clarity theme - amber/gold accent (AC1)
              'bg-amber-500 hover:bg-amber-400 active:bg-amber-600',
              'text-slate-900',
              // Shadow and transitions (AC5)
              'shadow-lg hover:shadow-xl',
              'transition-all duration-200',
              // Focus ring for accessibility (AC5)
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
              // Disabled state
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                <span>Processing...</span>
                <span className="sr-only">Please wait while we process your request</span>
              </>
            ) : (
              <>
                <span>Unlock Your Transformation - {formattedPrice}</span>
                <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </>
            )}
          </Button>

          {/* Error Message */}
          {error && (
            <p
              id="checkout-error"
              role="alert"
              className="mt-4 text-red-400 text-sm"
            >
              {error}. Please try again or contact support.
            </p>
          )}

          {/* Guarantee Badge - AC2, AC3 */}
          <div className="mt-8 flex justify-center">
            <GuaranteeBadge className="max-w-sm" />
          </div>

          {/* Enterprise Invoice Option - Story 17.7 */}
          {showInvoiceOption && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setInvoiceModalOpen(true)}
                className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-amber-500 transition-colors underline-offset-4 hover:underline"
                type="button"
              >
                <Building2 className="h-4 w-4" aria-hidden="true" />
                <span>Need an invoice for your organization?</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Invoice Request Modal - Story 17.7 */}
      {showInvoiceOption && (
        <InvoiceRequestModal
          isOpen={invoiceModalOpen}
          onClose={() => setInvoiceModalOpen(false)}
          userEmail={userEmail}
        />
      )}
      </>
    );
  }
);

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
