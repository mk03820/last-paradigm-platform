/**
 * Purchase Analytics Tracking Functions
 *
 * High-level functions for tracking purchase funnel events.
 * Each function handles context collection and event formatting.
 *
 * Story 17.8: Purchase Analytics Events
 * Task 3: Implement checkout_started tracking (AC: 1)
 * Task 4: Implement checkout_completed tracking (AC: 2)
 * Task 5: Implement checkout_abandoned tracking (AC: 3)
 * Task 6: Implement invoice_requested tracking (AC: 4)
 */

import { analytics } from './service';
import {
  getDeviceContext,
  getSessionId,
  getPageSource,
  hashForAnonymization,
} from './context';
import type {
  CheckoutStartedEvent,
  CheckoutCompletedEvent,
  CheckoutAbandonedEvent,
  InvoiceRequestedEvent,
  InvoiceFormAbandonedEvent,
  PreviewViewedEvent,
  PurchaseEventContext,
} from './events/purchase';

/**
 * Storage key for tracking checkout start time
 */
const CHECKOUT_START_TIME_KEY = 'analytics_checkout_start_time';

/**
 * Storage key for preventing duplicate success tracking
 */
const CHECKOUT_COMPLETED_KEY = 'analytics_checkout_completed';

/**
 * Get base purchase event context
 * Collects device, session, and page source information
 */
function getBaseContext(userId?: string): PurchaseEventContext {
  const deviceContext = getDeviceContext();

  return {
    userId: userId ? hashForAnonymization(userId) : undefined,
    sessionId: getSessionId(),
    pageSource: getPageSource(),
    deviceType: deviceContext.deviceType || 'desktop',
    timestamp: new Date().toISOString(),
    browser: deviceContext.browser,
    os: deviceContext.os,
    screenWidth: deviceContext.screenWidth,
    screenHeight: deviceContext.screenHeight,
  };
}

/**
 * Track checkout started event
 *
 * Call this BEFORE making the API call to create checkout session.
 * This ensures all checkout attempts are captured.
 *
 * Covers: AC1 (FR54) - User clicks purchase CTA
 *
 * @param options Checkout started options
 */
export async function trackCheckoutStarted(options: {
  /** Location of the CTA button */
  ctaLocation: 'hero' | 'sticky' | 'bottom' | 'modal';
  /** User ID if authenticated */
  userId?: string;
  /** Savings amount shown to user */
  savingsAmount?: number;
  /** Severity level of alignment tax */
  severityLevel?: string;
  /** Price displayed in cents */
  displayedPrice?: number;
}): Promise<void> {
  // Store start time for calculating time-to-complete
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(CHECKOUT_START_TIME_KEY, Date.now().toString());
  }

  const event: CheckoutStartedEvent = {
    name: 'checkout_started',
    properties: {
      ...getBaseContext(options.userId),
      ctaLocation: options.ctaLocation,
      savingsAmount: options.savingsAmount,
      severityLevel: options.severityLevel,
      displayedPrice: options.displayedPrice,
    },
  };

  await analytics.track(event);
}

/**
 * Track checkout completed event
 *
 * Call this when the success page loads after payment.
 * Uses single-fire prevention to avoid duplicate tracking.
 *
 * Covers: AC2 - User completes payment
 *
 * @param options Checkout completed options
 */
export async function trackCheckoutCompleted(options: {
  /** Purchase amount in cents */
  amount: number;
  /** Currency code */
  currency: string;
  /** Stripe checkout session ID */
  stripeSessionId: string;
  /** User ID if authenticated */
  userId?: string;
  /** Payment method used */
  paymentMethod?: string;
  /** Customer email (will be hashed) */
  customerEmail?: string;
}): Promise<void> {
  // Single-fire prevention using localStorage
  if (typeof localStorage !== 'undefined') {
    const completedKey = `${CHECKOUT_COMPLETED_KEY}_${options.stripeSessionId}`;
    if (localStorage.getItem(completedKey)) {
      // Already tracked this completion
      return;
    }
    // Mark as tracked
    localStorage.setItem(completedKey, new Date().toISOString());
  }

  // Calculate time to complete from checkout start
  let timeToComplete: number | undefined;
  if (typeof sessionStorage !== 'undefined') {
    const startTime = sessionStorage.getItem(CHECKOUT_START_TIME_KEY);
    if (startTime) {
      timeToComplete = Date.now() - parseInt(startTime, 10);
      sessionStorage.removeItem(CHECKOUT_START_TIME_KEY);
    }
  }

  const event: CheckoutCompletedEvent = {
    name: 'checkout_completed',
    properties: {
      ...getBaseContext(options.userId),
      amount: options.amount,
      currency: options.currency,
      stripeSessionId: options.stripeSessionId,
      paymentMethod: options.paymentMethod,
      timeToComplete,
      customerEmail: options.customerEmail
        ? hashForAnonymization(options.customerEmail)
        : undefined,
    },
  };

  await analytics.track(event);
}

/**
 * Track checkout abandoned event
 *
 * Call this when user returns from Stripe with cancelled status.
 *
 * Covers: AC3 - User cancels checkout on Stripe
 *
 * @param options Checkout abandoned options
 */
export async function trackCheckoutAbandoned(options: {
  /** User ID if authenticated */
  userId?: string;
  /** Stripe session ID if available */
  stripeSessionId?: string;
  /** Point of abandonment if known */
  abandonmentPoint?: string;
  /** Reason for abandonment if provided */
  abandonmentReason?: string;
}): Promise<void> {
  // Calculate time on Stripe from checkout start
  let timeOnStripe: number | undefined;
  if (typeof sessionStorage !== 'undefined') {
    const startTime = sessionStorage.getItem(CHECKOUT_START_TIME_KEY);
    if (startTime) {
      timeOnStripe = Date.now() - parseInt(startTime, 10);
      sessionStorage.removeItem(CHECKOUT_START_TIME_KEY);
    }
  }

  const event: CheckoutAbandonedEvent = {
    name: 'checkout_abandoned',
    properties: {
      ...getBaseContext(options.userId),
      timeOnStripe,
      stripeSessionId: options.stripeSessionId,
      abandonmentPoint: options.abandonmentPoint,
      abandonmentReason: options.abandonmentReason,
    },
  };

  await analytics.track(event);
}

/**
 * Track invoice requested event
 *
 * Call this when the invoice request form is submitted.
 * Do NOT include PII in plain text.
 *
 * Covers: AC4 - User submits invoice request
 *
 * @param options Invoice requested options
 */
export async function trackInvoiceRequested(options: {
  /** User ID if authenticated */
  userId?: string;
  /** Company name (will NOT be stored, only length) */
  companyName: string;
  /** Whether a PO number was provided */
  hasPoNumber: boolean;
  /** Whether a contact email was provided */
  hasContactEmail: boolean;
}): Promise<void> {
  const event: InvoiceRequestedEvent = {
    name: 'invoice_requested',
    properties: {
      ...getBaseContext(options.userId),
      hasPoNumber: options.hasPoNumber,
      companyNameLength: options.companyName.length,
      hasContactEmail: options.hasContactEmail,
    },
  };

  await analytics.track(event);
}

/**
 * Track invoice form abandoned event
 *
 * Call this when the invoice modal is closed without submission.
 *
 * @param options Form abandoned options
 */
export async function trackInvoiceFormAbandoned(options: {
  /** User ID if authenticated */
  userId?: string;
  /** Time spent on form in milliseconds */
  timeOnForm?: number;
  /** Fields that were filled */
  filledFields?: string[];
}): Promise<void> {
  const event: InvoiceFormAbandonedEvent = {
    name: 'invoice_form_abandoned',
    properties: {
      ...getBaseContext(options.userId),
      timeOnForm: options.timeOnForm,
      filledFields: options.filledFields,
    },
  };

  await analytics.track(event);
}

/**
 * Track preview page view
 *
 * Call this when the preview page loads.
 * Top of the purchase funnel.
 *
 * @param options Preview viewed options
 */
export async function trackPreviewViewed(options: {
  /** User ID if authenticated */
  userId?: string;
  /** Total alignment tax shown */
  totalAlignmentTax?: number;
  /** Estimated savings shown */
  estimatedSavings?: number;
  /** Severity level */
  severityLevel?: string;
  /** Number of tools completed */
  toolsCompleted?: number;
}): Promise<void> {
  const event: PreviewViewedEvent = {
    name: 'preview_viewed',
    properties: {
      ...getBaseContext(options.userId),
      totalAlignmentTax: options.totalAlignmentTax,
      estimatedSavings: options.estimatedSavings,
      severityLevel: options.severityLevel,
      toolsCompleted: options.toolsCompleted,
    },
  };

  await analytics.track(event);
}

/**
 * Clear checkout start time
 * Call if checkout is cancelled or user navigates away
 */
export function clearCheckoutStartTime(): void {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(CHECKOUT_START_TIME_KEY);
  }
}
