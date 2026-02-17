/**
 * Analytics Type Definitions
 *
 * Core type definitions for the analytics service.
 * Supports multiple analytics providers with a unified interface.
 *
 * Story 17.8: Purchase Analytics Events
 * Task 2: Define purchase analytics event types (AC: 1, 2, 3, 4, 5)
 * Task 2.6: Define shared context interface (userId, sessionId, deviceInfo)
 */

/**
 * Device context information collected for analytics
 */
export interface DeviceContext {
  deviceType: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  os: string;
  screenWidth: number;
  screenHeight: number;
}

/**
 * Base analytics event interface
 * All events must extend this interface
 */
export interface AnalyticsEvent {
  /** Event name identifier */
  name: string;
  /** Event properties/data */
  properties: Record<string, unknown>;
  /** ISO timestamp when the event occurred */
  timestamp?: string;
  /** Hashed user ID for attribution */
  userId?: string;
  /** Session ID for tracking user journey */
  sessionId?: string;
}

/**
 * Analytics provider interface
 * All providers must implement this interface
 */
export interface AnalyticsProvider {
  /** Provider name for identification */
  name: string;

  /**
   * Track an analytics event
   * @param event The event to track
   */
  track(event: AnalyticsEvent): Promise<void>;

  /**
   * Identify a user for attribution
   * @param userId User identifier
   * @param traits Optional user traits
   */
  identify?(userId: string, traits?: Record<string, unknown>): Promise<void>;

  /**
   * Initialize the provider
   * Called when the service is initialized
   */
  initialize?(): Promise<void>;

  /**
   * Flush any pending events
   * Called before page unload or periodically
   */
  flush?(): Promise<void>;
}

/**
 * Analytics service configuration
 */
export interface AnalyticsConfig {
  /** Enable/disable debug logging */
  debug?: boolean;
  /** Default properties to include with all events */
  defaultProperties?: Record<string, unknown>;
  /** Enable/disable server-side tracking */
  serverTracking?: boolean;
}
