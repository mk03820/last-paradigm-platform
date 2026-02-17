/**
 * useAnalytics Hook
 *
 * React hook for accessing analytics tracking functions in components.
 * Provides type-safe event tracking with automatic context collection.
 *
 * Story 17.8: Purchase Analytics Events
 * Task: Create analytics provider/hook for React components
 */

'use client';

import { useCallback, useRef, useEffect } from 'react';
import { analytics } from '@/lib/analytics/service';
import {
  trackCheckoutStarted,
  trackCheckoutCompleted,
  trackCheckoutAbandoned,
  trackInvoiceRequested,
  trackInvoiceFormAbandoned,
  trackPreviewViewed,
  clearCheckoutStartTime,
} from '@/lib/analytics/tracking';
import type { AnalyticsEvent } from '@/lib/analytics/types';

/**
 * Analytics hook return type
 */
export interface UseAnalyticsReturn {
  /** Track a generic analytics event */
  track: (event: AnalyticsEvent) => Promise<void>;

  /** Track checkout started event */
  trackCheckoutStarted: typeof trackCheckoutStarted;

  /** Track checkout completed event */
  trackCheckoutCompleted: typeof trackCheckoutCompleted;

  /** Track checkout abandoned event */
  trackCheckoutAbandoned: typeof trackCheckoutAbandoned;

  /** Track invoice requested event */
  trackInvoiceRequested: typeof trackInvoiceRequested;

  /** Track invoice form abandoned event */
  trackInvoiceFormAbandoned: typeof trackInvoiceFormAbandoned;

  /** Track preview page viewed event */
  trackPreviewViewed: typeof trackPreviewViewed;

  /** Clear checkout start time */
  clearCheckoutStartTime: typeof clearCheckoutStartTime;

  /** Track time on component mount for abandonment tracking */
  getTimeOnComponent: () => number;
}

/**
 * useAnalytics Hook
 *
 * Provides access to analytics tracking functions with:
 * - Automatic service initialization
 * - Memoized tracking functions
 * - Component mount time tracking for abandonment analysis
 *
 * @example
 * ```tsx
 * function PurchaseButton() {
 *   const { trackCheckoutStarted } = useAnalytics();
 *
 *   const handleClick = async () => {
 *     await trackCheckoutStarted({
 *       ctaLocation: 'hero',
 *       savingsAmount: 50000,
 *     });
 *     // Continue with checkout...
 *   };
 *
 *   return <button onClick={handleClick}>Purchase</button>;
 * }
 * ```
 */
export function useAnalytics(): UseAnalyticsReturn {
  const mountTimeRef = useRef<number>(Date.now());
  const initializedRef = useRef<boolean>(false);

  // Initialize analytics service on mount
  useEffect(() => {
    if (!initializedRef.current) {
      analytics.initialize().catch(console.error);
      initializedRef.current = true;
    }
  }, []);

  // Track function for generic events
  const track = useCallback(async (event: AnalyticsEvent): Promise<void> => {
    await analytics.track(event);
  }, []);

  // Get time since component mounted
  const getTimeOnComponent = useCallback((): number => {
    return Date.now() - mountTimeRef.current;
  }, []);

  return {
    track,
    trackCheckoutStarted,
    trackCheckoutCompleted,
    trackCheckoutAbandoned,
    trackInvoiceRequested,
    trackInvoiceFormAbandoned,
    trackPreviewViewed,
    clearCheckoutStartTime,
    getTimeOnComponent,
  };
}

/**
 * useTrackOnMount Hook
 *
 * Tracks an event once when the component mounts.
 * Useful for page view tracking.
 *
 * @param event The event to track
 * @param dependencies Optional dependencies to re-track on change
 *
 * @example
 * ```tsx
 * function PreviewPage({ savings }: { savings: number }) {
 *   useTrackOnMount({
 *     name: 'preview_viewed',
 *     properties: { estimatedSavings: savings },
 *   });
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function useTrackOnMount(
  event: AnalyticsEvent | (() => AnalyticsEvent),
  dependencies: unknown[] = []
): void {
  const hasTrackedRef = useRef<boolean>(false);

  useEffect(() => {
    if (hasTrackedRef.current) {
      return;
    }

    hasTrackedRef.current = true;

    const eventToTrack = typeof event === 'function' ? event() : event;
    analytics.track(eventToTrack).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
}

/**
 * useTrackOnUnmount Hook
 *
 * Tracks an event when the component unmounts.
 * Useful for abandonment tracking.
 *
 * @param getEvent Function that returns the event to track
 *
 * @example
 * ```tsx
 * function InvoiceForm() {
 *   const { getTimeOnComponent } = useAnalytics();
 *
 *   useTrackOnUnmount(() => ({
 *     name: 'invoice_form_abandoned',
 *     properties: { timeOnForm: getTimeOnComponent() },
 *   }));
 *
 *   return <form>...</form>;
 * }
 * ```
 */
export function useTrackOnUnmount(getEvent: () => AnalyticsEvent): void {
  const getEventRef = useRef(getEvent);
  getEventRef.current = getEvent;

  useEffect(() => {
    return () => {
      const event = getEventRef.current();
      analytics.track(event).catch(console.error);
    };
  }, []);
}

export default useAnalytics;
