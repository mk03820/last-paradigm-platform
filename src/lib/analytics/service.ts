/**
 * Analytics Service
 *
 * Unified analytics service that supports multiple providers.
 * Handles privacy consent, event anonymization, and non-blocking tracking.
 *
 * Story 17.8: Purchase Analytics Events
 * Task 1: Create unified analytics service (AC: 6, 7)
 * Task 1.1: Create `/src/lib/analytics/service.ts` with provider abstraction
 */

import type {
  AnalyticsProvider,
  AnalyticsEvent,
  AnalyticsConfig,
} from './types';
import { GA4Provider } from './providers/ga4';
import { ServerProvider } from './providers/server';
import { MockProvider } from './providers/mock';
import { getConsentStatus } from '@/lib/privacy/consent';
import { hashForAnonymization, getSessionId } from './context';

/**
 * Personal identifiable information fields to remove when anonymizing
 */
const PII_FIELDS = [
  'email',
  'name',
  'firstName',
  'lastName',
  'phone',
  'address',
  'billingAddress',
  'companyName',
];

/**
 * Analytics Service
 *
 * Central analytics service that:
 * - Manages multiple analytics providers
 * - Checks privacy consent before tracking
 * - Anonymizes data when consent is not given
 * - Handles errors gracefully (non-blocking)
 */
class AnalyticsService {
  private providers: AnalyticsProvider[] = [];
  private initialized = false;
  private config: AnalyticsConfig;

  constructor(config?: AnalyticsConfig) {
    this.config = {
      debug: false,
      serverTracking: true,
      ...config,
    };
  }

  /**
   * Initialize the analytics service with providers
   * Should be called once when the app starts
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Initialize providers based on environment
    if (typeof window !== 'undefined') {
      // Client-side providers
      if (process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID) {
        const ga4Provider = new GA4Provider();
        this.providers.push(ga4Provider);
        await ga4Provider.initialize?.();
      }

      // Always add server provider for client-side tracking
      if (this.config.serverTracking) {
        const serverProvider = new ServerProvider();
        this.providers.push(serverProvider);
        await serverProvider.initialize?.();
      }
    }

    // Add mock provider in development/test
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.NODE_ENV === 'test'
    ) {
      this.providers.push(new MockProvider({ logToConsole: this.config.debug }));
    }

    this.initialized = true;

    if (this.config.debug) {
      console.log(
        '[Analytics] Initialized with providers:',
        this.providers.map((p) => p.name)
      );
    }
  }

  /**
   * Add a provider to the service
   */
  addProvider(provider: AnalyticsProvider): void {
    this.providers.push(provider);
  }

  /**
   * Get a provider by name
   */
  getProvider(name: string): AnalyticsProvider | undefined {
    return this.providers.find((p) => p.name === name);
  }

  /**
   * Track an analytics event
   *
   * Checks privacy consent before sending to providers.
   * Anonymizes data if consent is not given.
   * Never throws - errors are logged but don't break functionality.
   *
   * @param event The event to track
   */
  async track(event: AnalyticsEvent): Promise<void> {
    // Ensure service is initialized
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Add timestamp if not provided
      const eventWithMeta: AnalyticsEvent = {
        ...event,
        timestamp: event.timestamp || new Date().toISOString(),
        sessionId: event.sessionId || getSessionId(),
        properties: {
          ...this.config.defaultProperties,
          ...event.properties,
        },
      };

      // Check privacy consent
      const consent = await getConsentStatus();

      if (!consent.analytics) {
        // No analytics consent - only track to server with anonymized data
        const serverProvider = this.providers.find((p) => p.name === 'server');
        if (serverProvider) {
          const anonymizedEvent = this.anonymize(eventWithMeta);
          await serverProvider.track(anonymizedEvent).catch((error) => {
            this.logError('server', error);
          });
        }
        return;
      }

      // Full consent - send to all providers
      await Promise.allSettled(
        this.providers.map((provider) =>
          provider.track(eventWithMeta).catch((error) => {
            this.logError(provider.name, error);
          })
        )
      );

      if (this.config.debug) {
        console.log('[Analytics] Tracked:', event.name, eventWithMeta);
      }
    } catch (error) {
      // Never throw from track - analytics should never break the app
      this.logError('service', error);
    }
  }

  /**
   * Identify a user for analytics attribution
   *
   * @param userId User identifier (will be hashed)
   * @param traits Optional user traits (PII will be removed)
   */
  async identify(
    userId: string,
    traits?: Record<string, unknown>
  ): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const consent = await getConsentStatus();

      if (!consent.analytics) {
        return;
      }

      // Hash the user ID for privacy
      const hashedUserId = hashForAnonymization(userId);

      // Remove PII from traits
      const cleanTraits = traits ? this.removePII(traits) : undefined;

      await Promise.allSettled(
        this.providers
          .filter((p) => p.identify)
          .map((provider) =>
            provider.identify!(hashedUserId, cleanTraits).catch((error) => {
              this.logError(provider.name, error);
            })
          )
      );

      if (this.config.debug) {
        console.log('[Analytics] Identified:', hashedUserId, cleanTraits);
      }
    } catch (error) {
      this.logError('service', error);
    }
  }

  /**
   * Flush any pending events
   * Call before page unload or periodically
   */
  async flush(): Promise<void> {
    await Promise.allSettled(
      this.providers
        .filter((p) => p.flush)
        .map((provider) =>
          provider.flush!().catch((error) => {
            this.logError(provider.name, error);
          })
        )
    );
  }

  /**
   * Anonymize an event for non-consented tracking
   * Removes PII and hashes user ID
   */
  private anonymize(event: AnalyticsEvent): AnalyticsEvent {
    return {
      ...event,
      userId: event.userId ? hashForAnonymization(event.userId) : undefined,
      properties: this.removePII(event.properties),
    };
  }

  /**
   * Remove PII fields from properties
   */
  private removePII(
    properties: Record<string, unknown>
  ): Record<string, unknown> {
    const cleaned = { ...properties };

    for (const field of PII_FIELDS) {
      delete cleaned[field];
    }

    return cleaned;
  }

  /**
   * Log an analytics error
   */
  private logError(source: string, error: unknown): void {
    console.error(`[Analytics] Error (${source}):`, error);
  }
}

/**
 * Singleton analytics service instance
 */
export const analytics = new AnalyticsService({
  debug: process.env.NODE_ENV === 'development',
  serverTracking: true,
});

/**
 * Create a custom analytics service instance
 * Useful for testing or custom configurations
 */
export function createAnalyticsService(
  config?: AnalyticsConfig
): AnalyticsService {
  return new AnalyticsService(config);
}

export { AnalyticsService };
