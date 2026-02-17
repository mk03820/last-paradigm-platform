/**
 * Server-Side Analytics Provider
 *
 * Sends analytics events to the server API for database storage.
 * Provides backup tracking for critical events and supports
 * server-side tracking (e.g., from webhooks).
 *
 * Story 17.8: Purchase Analytics Events
 * Task 1.3: Implement custom server-side analytics (database storage)
 * Covers: AC6 (Support multiple analytics providers)
 */

import type { AnalyticsProvider, AnalyticsEvent } from '../types';

/**
 * Server Provider Configuration
 */
export interface ServerProviderConfig {
  /** API endpoint for tracking */
  endpoint?: string;
  /** Timeout for API calls in milliseconds */
  timeout?: number;
  /** Enable batching of events */
  batchEvents?: boolean;
  /** Maximum batch size before auto-flush */
  maxBatchSize?: number;
}

const DEFAULT_CONFIG: Required<ServerProviderConfig> = {
  endpoint: '/api/analytics/track',
  timeout: 5000,
  batchEvents: false,
  maxBatchSize: 10,
};

/**
 * Server-Side Analytics Provider
 *
 * Sends events to a server API endpoint for storage in the database.
 * Non-blocking: errors are logged but don't throw.
 */
export class ServerProvider implements AnalyticsProvider {
  name = 'server';
  private config: Required<ServerProviderConfig>;
  private eventQueue: AnalyticsEvent[] = [];
  private flushTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(config?: ServerProviderConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Initialize the server provider
   * Sets up event queue flushing on page unload
   */
  async initialize(): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }

    // Flush events before page unload
    window.addEventListener('beforeunload', () => {
      this.flush();
    });

    // Also flush on visibility change (mobile tab switching)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flush();
      }
    });
  }

  /**
   * Track an analytics event
   * Sends to server API or queues for batching
   *
   * @param event The event to track
   */
  async track(event: AnalyticsEvent): Promise<void> {
    const eventWithTimestamp: AnalyticsEvent = {
      ...event,
      timestamp: event.timestamp || new Date().toISOString(),
    };

    if (this.config.batchEvents) {
      this.queueEvent(eventWithTimestamp);
    } else {
      await this.sendEvent(eventWithTimestamp);
    }
  }

  /**
   * Identify a user (optional for server provider)
   */
  async identify(
    userId: string,
    traits?: Record<string, unknown>
  ): Promise<void> {
    // Send an identify event
    await this.track({
      name: 'identify',
      properties: { ...traits },
      userId,
    });
  }

  /**
   * Flush any queued events
   */
  async flush(): Promise<void> {
    if (this.eventQueue.length === 0) {
      return;
    }

    const events = [...this.eventQueue];
    this.eventQueue = [];

    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
      this.flushTimeout = null;
    }

    // Send all queued events
    await Promise.all(events.map((event) => this.sendEvent(event)));
  }

  /**
   * Queue an event for batched sending
   */
  private queueEvent(event: AnalyticsEvent): void {
    this.eventQueue.push(event);

    // Flush if we've reached max batch size
    if (this.eventQueue.length >= this.config.maxBatchSize) {
      this.flush();
      return;
    }

    // Set a timeout to flush after 5 seconds of inactivity
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
    }

    this.flushTimeout = setTimeout(() => {
      this.flush();
    }, 5000);
  }

  /**
   * Send a single event to the server
   */
  private async sendEvent(event: AnalyticsEvent): Promise<void> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
        signal: controller.signal,
        // Use keepalive for reliability during page unload
        keepalive: true,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(
          `Server analytics error: ${response.status} ${response.statusText}`
        );
      }
    } catch (error) {
      // Non-blocking - log but don't throw
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Server analytics timeout');
      } else {
        console.error('Server analytics error:', error);
      }
    }
  }
}

/**
 * Server-side tracking function for use in API routes and webhooks
 * Bypasses the client provider and directly calls the database
 *
 * @param event The event to track
 */
export async function trackServerSide(event: AnalyticsEvent): Promise<void> {
  const eventWithTimestamp: AnalyticsEvent = {
    ...event,
    timestamp: event.timestamp || new Date().toISOString(),
  };

  // In server context, we'll import and call the database directly
  // This function is a placeholder - actual implementation is in the API route
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/analytics/track`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include an internal header to bypass rate limiting
          'X-Internal-Request': 'true',
        },
        body: JSON.stringify(eventWithTimestamp),
      }
    );

    if (!response.ok) {
      console.error('Server-side tracking error:', response.statusText);
    }
  } catch (error) {
    console.error('Server-side tracking error:', error);
  }
}
