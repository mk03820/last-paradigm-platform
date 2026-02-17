/**
 * Analytics Module Export
 *
 * Central export for all analytics functionality.
 *
 * Story 17.8: Purchase Analytics Events
 */

// Main service
export { analytics, AnalyticsService, createAnalyticsService } from './service';

// Tracking functions
export {
  trackCheckoutStarted,
  trackCheckoutCompleted,
  trackCheckoutAbandoned,
  trackInvoiceRequested,
  trackInvoiceFormAbandoned,
  trackPreviewViewed,
  clearCheckoutStartTime,
} from './tracking';

// Types
export type {
  AnalyticsEvent,
  AnalyticsProvider,
  AnalyticsConfig,
  DeviceContext,
} from './types';

// Purchase event types
export type {
  PurchaseEventContext,
  CheckoutStartedEvent,
  CheckoutCompletedEvent,
  CheckoutAbandonedEvent,
  InvoiceRequestedEvent,
  InvoiceFormAbandonedEvent,
  PreviewViewedEvent,
  PurchaseEvent,
  PurchaseEventName,
} from './events/purchase';

export { PURCHASE_EVENT_NAMES } from './events/purchase';

// Context utilities
export {
  getDeviceContext,
  getSessionId,
  getPageSource,
  hashForAnonymization,
} from './context';

// Providers (for advanced usage)
export { GA4Provider } from './providers/ga4';
export { ServerProvider, trackServerSide } from './providers/server';
export { MockProvider, getMockProvider, resetMockProvider } from './providers/mock';
