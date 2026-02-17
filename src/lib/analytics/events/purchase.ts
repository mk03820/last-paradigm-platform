/**
 * Purchase Analytics Event Definitions
 *
 * Type definitions for all purchase funnel analytics events.
 * Each event captures specific context for conversion analysis.
 *
 * Story 17.8: Purchase Analytics Events
 * Task 2: Define purchase analytics event types (AC: 1, 2, 3, 4, 5)
 */

import type { AnalyticsEvent } from '../types';

/**
 * Base context included with all purchase events
 * Covers AC5: timestamp, userId (hashed), sessionId, page source, device context
 */
export interface PurchaseEventContext {
  /** Hashed user ID for attribution */
  userId?: string;
  /** Session ID for tracking user journey */
  sessionId: string;
  /** Source of the page visit */
  pageSource: 'preview' | 'email' | 'direct';
  /** Device type */
  deviceType: 'mobile' | 'tablet' | 'desktop';
  /** ISO timestamp when the event occurred */
  timestamp: string;
  /** Browser name */
  browser?: string;
  /** Operating system */
  os?: string;
  /** Screen width in pixels */
  screenWidth?: number;
  /** Screen height in pixels */
  screenHeight?: number;
  /** Index signature for Record<string, unknown> compatibility */
  [key: string]: unknown;
}

/**
 * Checkout Started Event
 *
 * Fired when a user clicks the purchase CTA to initiate checkout.
 * Tracked BEFORE the API call to capture all attempts.
 *
 * Covers AC1 (FR54): User clicks purchase CTA
 */
export interface CheckoutStartedEvent extends AnalyticsEvent {
  name: 'checkout_started';
  properties: PurchaseEventContext & {
    /** Location of the CTA button that was clicked */
    ctaLocation: 'hero' | 'sticky' | 'bottom' | 'modal';
    /** Potential savings amount shown to user */
    savingsAmount?: number;
    /** Severity level of alignment tax (e.g., 'critical', 'severe', 'moderate') */
    severityLevel?: string;
    /** Price displayed to user in cents */
    displayedPrice?: number;
  };
}

/**
 * Checkout Completed Event
 *
 * Fired when a user successfully completes payment and reaches the success page.
 * Uses single-fire prevention to avoid duplicate tracking.
 *
 * Covers AC2: User completes payment
 */
export interface CheckoutCompletedEvent extends AnalyticsEvent {
  name: 'checkout_completed';
  properties: PurchaseEventContext & {
    /** Purchase amount in cents */
    amount: number;
    /** Currency code (e.g., 'USD') */
    currency: string;
    /** Stripe checkout session ID */
    stripeSessionId: string;
    /** Payment method used (if available) */
    paymentMethod?: string;
    /** Time in milliseconds from checkout_started to checkout_completed */
    timeToComplete?: number;
    /** Customer email (hashed) */
    customerEmail?: string;
  };
}

/**
 * Checkout Abandoned Event
 *
 * Fired when a user cancels checkout on Stripe and returns to the preview page.
 * Captures abandonment context for funnel optimization.
 *
 * Covers AC3: User cancels checkout on Stripe
 */
export interface CheckoutAbandonedEvent extends AnalyticsEvent {
  name: 'checkout_abandoned';
  properties: PurchaseEventContext & {
    /** Time spent on Stripe checkout in milliseconds */
    timeOnStripe?: number;
    /** Last step reached in checkout flow (if available from Stripe) */
    abandonmentPoint?: string;
    /** Stripe checkout session ID */
    stripeSessionId?: string;
    /** Reason for abandonment if provided */
    abandonmentReason?: string;
  };
}

/**
 * Invoice Requested Event
 *
 * Fired when a user submits an invoice request form for enterprise purchases.
 * Privacy-focused: no PII included in plain text.
 *
 * Covers AC4: User submits invoice request
 */
export interface InvoiceRequestedEvent extends AnalyticsEvent {
  name: 'invoice_requested';
  properties: PurchaseEventContext & {
    /** Whether a PO number was provided */
    hasPoNumber: boolean;
    /** Length of company name (anonymized metric) */
    companyNameLength: number;
    /** Whether a separate contact email was provided */
    hasContactEmail: boolean;
  };
}

/**
 * Invoice Form Abandoned Event
 *
 * Fired when a user closes the invoice modal without submitting.
 * Helps identify friction in the invoice request flow.
 */
export interface InvoiceFormAbandonedEvent extends AnalyticsEvent {
  name: 'invoice_form_abandoned';
  properties: PurchaseEventContext & {
    /** Time spent on the form in milliseconds */
    timeOnForm?: number;
    /** Fields that were filled before abandonment */
    filledFields?: string[];
  };
}

/**
 * Preview Viewed Event
 *
 * Fired when a user views the preview page.
 * Top of the purchase funnel.
 */
export interface PreviewViewedEvent extends AnalyticsEvent {
  name: 'preview_viewed';
  properties: PurchaseEventContext & {
    /** Total alignment tax shown to user */
    totalAlignmentTax?: number;
    /** Estimated savings shown to user */
    estimatedSavings?: number;
    /** Severity level calculated */
    severityLevel?: string;
    /** Number of tools completed in diagnostic */
    toolsCompleted?: number;
  };
}

/**
 * Toolkit Accessed Event
 *
 * Fired when a purchased user accesses the toolkit/download portal.
 * Tracks engagement with purchased materials.
 *
 * Story 19.3: Purchase Status & Toolkit Access
 * Covers: AC5 (FR54) - Analytics tracking for toolkit access
 */
export interface ToolkitAccessedEvent extends AnalyticsEvent {
  name: 'toolkit_accessed';
  properties: {
    /** Source location where toolkit was accessed from */
    source: 'dashboard' | 'email' | 'direct';
    /** ISO timestamp when the event occurred */
    timestamp: string;
    /** Index signature for Record<string, unknown> compatibility */
    [key: string]: unknown;
  };
}

/**
 * Preview CTA Clicked Event
 *
 * Fired when a user clicks the "Unlock Playbook 2" CTA from the dashboard.
 * Tracks conversion funnel from dashboard to preview page.
 *
 * Story 19.3: Purchase Status & Toolkit Access
 * Covers: Task 6.6 - Track preview CTA clicks
 */
export interface PreviewCtaClickedEvent extends AnalyticsEvent {
  name: 'preview_cta_clicked';
  properties: {
    /** Source location of the CTA */
    source: 'dashboard_purchase_section' | 'dashboard_nav' | 'other';
    /** Current purchase status of the user */
    purchaseStatus: 'none' | 'pending' | 'purchased' | 'refunded';
    /** Whether user has completed the diagnostic */
    hasCompletedDiagnostic: boolean;
    /** ISO timestamp when the event occurred */
    timestamp: string;
    /** Index signature for Record<string, unknown> compatibility */
    [key: string]: unknown;
  };
}

/**
 * Union type for all purchase-related events
 */
export type PurchaseEvent =
  | CheckoutStartedEvent
  | CheckoutCompletedEvent
  | CheckoutAbandonedEvent
  | InvoiceRequestedEvent
  | InvoiceFormAbandonedEvent
  | PreviewViewedEvent
  | ToolkitAccessedEvent
  | PreviewCtaClickedEvent;

/**
 * Purchase event names for type checking
 */
export const PURCHASE_EVENT_NAMES = [
  'checkout_started',
  'checkout_completed',
  'checkout_abandoned',
  'invoice_requested',
  'invoice_form_abandoned',
  'preview_viewed',
  'toolkit_accessed',
  'preview_cta_clicked',
] as const;

export type PurchaseEventName = (typeof PURCHASE_EVENT_NAMES)[number];
