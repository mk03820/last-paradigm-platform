/**
 * SuccessAnalytics Component
 *
 * Client component that fires the checkout_completed analytics event.
 * Uses single-fire prevention to avoid duplicate tracking on page refresh.
 *
 * Story 17.6: Purchase Success Page
 * Task 5: Implement analytics tracking (AC: 5)
 * Covers: AC5 (purchase_completed analytics event)
 */

'use client';

import { useEffect, useRef } from 'react';
import { trackCheckoutCompleted } from '@/lib/analytics/tracking';

/**
 * Props for SuccessAnalytics component
 */
interface SuccessAnalyticsProps {
  /** Purchase ID from database */
  purchaseId: string;
  /** Stripe checkout session ID */
  sessionId: string;
  /** Purchase amount in cents */
  amount: number;
  /** Currency code */
  currency?: string;
  /** User ID */
  userId?: string;
  /** Customer email for attribution */
  customerEmail?: string;
}

/**
 * SuccessAnalytics - Analytics tracking component for success page
 *
 * This component:
 * - Fires checkout_completed event on mount
 * - Uses localStorage to prevent duplicate tracking on refresh (AC8)
 * - Uses ref to prevent double-firing in React Strict Mode
 * - Renders nothing (invisible)
 *
 * @example
 * ```tsx
 * <SuccessAnalytics
 *   purchaseId="abc123"
 *   sessionId="cs_test_123"
 *   amount={250000}
 *   userId="user123"
 * />
 * ```
 */
export function SuccessAnalytics({
  purchaseId,
  sessionId,
  amount,
  currency = 'usd',
  userId,
  customerEmail,
}: SuccessAnalyticsProps) {
  const hasFired = useRef(false);

  useEffect(() => {
    // Skip if already fired this render cycle (React Strict Mode protection)
    if (hasFired.current) {
      return;
    }

    // Check if event already fired for this session (page refresh protection)
    const storageKey = `checkout_completed_${sessionId}`;
    if (typeof localStorage !== 'undefined') {
      const alreadyTracked = localStorage.getItem(storageKey);
      if (alreadyTracked) {
        return;
      }
    }

    // Mark as fired
    hasFired.current = true;

    // Fire the analytics event
    trackCheckoutCompleted({
      amount,
      currency,
      stripeSessionId: sessionId,
      userId,
      customerEmail,
      paymentMethod: 'card', // Stripe Checkout is card-only
    })
      .then(() => {
        // Mark as tracked in localStorage to prevent duplicates on refresh
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(storageKey, new Date().toISOString());
        }
      })
      .catch((error) => {
        // Log error but don't break the page
        console.error('[SuccessAnalytics] Failed to track event:', error);
      });
  }, [sessionId, amount, currency, userId, customerEmail]);

  // Render nothing - this is a tracking-only component
  return null;
}

export default SuccessAnalytics;
