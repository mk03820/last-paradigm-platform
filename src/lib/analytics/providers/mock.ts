/**
 * Mock Analytics Provider
 *
 * A mock provider for development and testing.
 * Logs events to console and stores them for inspection.
 *
 * Story 17.8: Purchase Analytics Events
 * Task 1.5: Create mock provider for development/testing
 */

import type { AnalyticsProvider, AnalyticsEvent } from '../types';

/**
 * Tracked event with metadata for testing
 */
export interface TrackedEvent {
  event: AnalyticsEvent;
  timestamp: Date;
  provider: string;
}

/**
 * Mock Analytics Provider
 *
 * Stores tracked events in memory for testing.
 * Optionally logs to console in development mode.
 */
export class MockProvider implements AnalyticsProvider {
  name = 'mock';
  private trackedEvents: TrackedEvent[] = [];
  private logToConsole: boolean;
  private identifiedUsers: Map<string, Record<string, unknown>> = new Map();

  constructor(options?: { logToConsole?: boolean }) {
    this.logToConsole = options?.logToConsole ?? process.env.NODE_ENV === 'development';
  }

  /**
   * Initialize the mock provider
   */
  async initialize(): Promise<void> {
    if (this.logToConsole) {
      console.log('[MockAnalytics] Initialized');
    }
  }

  /**
   * Track an analytics event
   * Stores in memory and optionally logs to console
   *
   * @param event The event to track
   */
  async track(event: AnalyticsEvent): Promise<void> {
    const trackedEvent: TrackedEvent = {
      event: {
        ...event,
        timestamp: event.timestamp || new Date().toISOString(),
      },
      timestamp: new Date(),
      provider: this.name,
    };

    this.trackedEvents.push(trackedEvent);

    if (this.logToConsole) {
      console.log('[MockAnalytics] Track:', event.name, event.properties);
    }
  }

  /**
   * Identify a user
   *
   * @param userId User identifier
   * @param traits Optional user traits
   */
  async identify(
    userId: string,
    traits?: Record<string, unknown>
  ): Promise<void> {
    this.identifiedUsers.set(userId, { ...traits });

    if (this.logToConsole) {
      console.log('[MockAnalytics] Identify:', userId, traits);
    }
  }

  /**
   * Flush pending events (no-op for mock)
   */
  async flush(): Promise<void> {
    if (this.logToConsole) {
      console.log('[MockAnalytics] Flush:', this.trackedEvents.length, 'events');
    }
  }

  // ============================================================================
  // Test Helpers
  // ============================================================================

  /**
   * Get all tracked events
   */
  getTrackedEvents(): TrackedEvent[] {
    return [...this.trackedEvents];
  }

  /**
   * Get events by name
   */
  getEventsByName(name: string): TrackedEvent[] {
    return this.trackedEvents.filter((e) => e.event.name === name);
  }

  /**
   * Get the last tracked event
   */
  getLastEvent(): TrackedEvent | undefined {
    return this.trackedEvents[this.trackedEvents.length - 1];
  }

  /**
   * Get the last event by name
   */
  getLastEventByName(name: string): TrackedEvent | undefined {
    return [...this.trackedEvents]
      .reverse()
      .find((e) => e.event.name === name);
  }

  /**
   * Check if an event was tracked
   */
  wasEventTracked(name: string): boolean {
    return this.trackedEvents.some((e) => e.event.name === name);
  }

  /**
   * Get identified user traits
   */
  getIdentifiedUser(userId: string): Record<string, unknown> | undefined {
    return this.identifiedUsers.get(userId);
  }

  /**
   * Clear all tracked events (useful in tests)
   */
  clear(): void {
    this.trackedEvents = [];
    this.identifiedUsers.clear();

    if (this.logToConsole) {
      console.log('[MockAnalytics] Cleared');
    }
  }

  /**
   * Get event count
   */
  getEventCount(): number {
    return this.trackedEvents.length;
  }

  /**
   * Get event count by name
   */
  getEventCountByName(name: string): number {
    return this.trackedEvents.filter((e) => e.event.name === name).length;
  }

  /**
   * Assert an event was tracked with specific properties
   * Throws if assertion fails
   */
  assertEventTracked(
    name: string,
    expectedProperties?: Partial<Record<string, unknown>>
  ): void {
    const events = this.getEventsByName(name);

    if (events.length === 0) {
      throw new Error(`Expected event "${name}" to be tracked, but it was not`);
    }

    if (expectedProperties) {
      const lastEvent = events[events.length - 1];
      for (const [key, value] of Object.entries(expectedProperties)) {
        if (lastEvent.event.properties[key] !== value) {
          throw new Error(
            `Expected event "${name}" to have property "${key}" = ${JSON.stringify(value)}, ` +
              `but got ${JSON.stringify(lastEvent.event.properties[key])}`
          );
        }
      }
    }
  }
}

/**
 * Create a mock provider for testing
 * Singleton pattern for easy access in tests
 */
let mockProviderInstance: MockProvider | null = null;

export function getMockProvider(): MockProvider {
  if (!mockProviderInstance) {
    mockProviderInstance = new MockProvider();
  }
  return mockProviderInstance;
}

export function resetMockProvider(): void {
  if (mockProviderInstance) {
    mockProviderInstance.clear();
  }
  mockProviderInstance = null;
}
