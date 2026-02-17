/**
 * Google Analytics 4 Provider
 *
 * Implements analytics tracking via Google Analytics 4.
 * GA4 must be loaded via next/script in the app layout.
 *
 * Story 17.8: Purchase Analytics Events
 * Task 1.2: Implement Google Analytics 4 provider
 * Covers: AC6 (Support multiple analytics providers)
 */

import type { AnalyticsProvider, AnalyticsEvent } from '../types';

/**
 * Extend Window interface for gtag
 */
declare global {
  interface Window {
    gtag?: (
      command: 'event' | 'config' | 'set',
      eventNameOrConfig: string,
      params?: Record<string, unknown>
    ) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Google Analytics 4 Provider
 *
 * Sends events to GA4 using the gtag.js library.
 * Falls back gracefully when GA4 is not loaded.
 */
export class GA4Provider implements AnalyticsProvider {
  name = 'ga4';
  private measurementId: string;
  private initialized = false;

  constructor(measurementId?: string) {
    this.measurementId =
      measurementId || process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || '';
  }

  /**
   * Initialize GA4 provider
   * Checks that gtag is available on window
   */
  async initialize(): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }

    // Wait for gtag to be available (may be loaded async)
    let attempts = 0;
    while (!window.gtag && attempts < 10) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }

    if (window.gtag) {
      this.initialized = true;
    }
  }

  /**
   * Track an analytics event via GA4
   *
   * @param event The event to track
   */
  async track(event: AnalyticsEvent): Promise<void> {
    if (typeof window === 'undefined' || !window.gtag) {
      return;
    }

    // Map our event to GA4 format
    const ga4Event = this.mapToGA4Event(event);

    window.gtag('event', ga4Event.name, ga4Event.params);
  }

  /**
   * Identify a user for GA4 attribution
   *
   * @param userId User identifier (should be hashed)
   * @param traits Optional user traits
   */
  async identify(
    userId: string,
    traits?: Record<string, unknown>
  ): Promise<void> {
    if (typeof window === 'undefined' || !window.gtag) {
      return;
    }

    window.gtag('set', 'user_properties', {
      user_id: userId,
      ...traits,
    });
  }

  /**
   * Flush pending events (no-op for GA4 as events are sent immediately)
   */
  async flush(): Promise<void> {
    // GA4 sends events immediately via beacon
    // No buffering/flushing needed
  }

  /**
   * Map our event format to GA4 event format
   */
  private mapToGA4Event(event: AnalyticsEvent): {
    name: string;
    params: Record<string, unknown>;
  } {
    // GA4 has specific event names for e-commerce
    const eventNameMap: Record<string, string> = {
      checkout_started: 'begin_checkout',
      checkout_completed: 'purchase',
      checkout_abandoned: 'checkout_abandoned', // Custom event
      invoice_requested: 'invoice_requested', // Custom event
      invoice_form_abandoned: 'invoice_form_abandoned', // Custom event
      preview_viewed: 'view_item',
    };

    const ga4Name = eventNameMap[event.name] || event.name;

    // Build GA4 parameters
    const params: Record<string, unknown> = {
      ...event.properties,
      timestamp: event.timestamp || new Date().toISOString(),
    };

    // Map specific properties to GA4 e-commerce params
    if (event.name === 'checkout_completed') {
      const props = event.properties as Record<string, unknown>;
      params.value = typeof props.amount === 'number' ? props.amount / 100 : 0;
      params.currency = props.currency || 'USD';
      params.transaction_id = props.stripeSessionId;
    }

    if (event.name === 'checkout_started') {
      const props = event.properties as Record<string, unknown>;
      if (typeof props.displayedPrice === 'number') {
        params.value = props.displayedPrice / 100;
      }
      params.currency = 'USD';
    }

    return { name: ga4Name, params };
  }
}
