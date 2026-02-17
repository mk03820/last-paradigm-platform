/**
 * Analytics Service Tests
 *
 * Unit tests for the analytics service.
 *
 * Story 17.8: Purchase Analytics Events
 * Task 8.1: Unit tests for analytics service
 * Task 8.2: Test event firing with mock provider
 * Task 8.3: Test privacy consent handling
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AnalyticsService, createAnalyticsService } from './service';
import { MockProvider, resetMockProvider, getMockProvider } from './providers/mock';
import * as consent from '@/lib/privacy/consent';

// Mock the privacy consent module
vi.mock('@/lib/privacy/consent', () => ({
  getConsentStatus: vi.fn(),
  getConsentStatusSync: vi.fn(),
}));

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let mockProvider: MockProvider;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    resetMockProvider();

    // Default to analytics consent
    vi.mocked(consent.getConsentStatus).mockResolvedValue({
      analytics: true,
      marketing: false,
      functional: true,
    });

    // Create service with mock provider
    service = createAnalyticsService({ debug: false, serverTracking: false });
    mockProvider = new MockProvider({ logToConsole: false });
    service.addProvider(mockProvider);
  });

  afterEach(() => {
    resetMockProvider();
  });

  describe('initialization', () => {
    it('should create a new service instance', () => {
      expect(service).toBeInstanceOf(AnalyticsService);
    });

    it('should initialize providers on first track call', async () => {
      await service.track({ name: 'test_event', properties: {} });

      expect(mockProvider.wasEventTracked('test_event')).toBe(true);
    });
  });

  describe('track', () => {
    it('should track events to all providers', async () => {
      await service.track({
        name: 'checkout_started',
        properties: { ctaLocation: 'hero' },
      });

      expect(mockProvider.wasEventTracked('checkout_started')).toBe(true);
      const event = mockProvider.getLastEventByName('checkout_started');
      expect(event?.event.properties).toEqual(
        expect.objectContaining({ ctaLocation: 'hero' })
      );
    });

    it('should add timestamp if not provided', async () => {
      await service.track({ name: 'test_event', properties: {} });

      const event = mockProvider.getLastEvent();
      expect(event?.event.timestamp).toBeDefined();
      expect(new Date(event!.event.timestamp!).getTime()).toBeLessThanOrEqual(
        Date.now()
      );
    });

    it('should preserve provided timestamp', async () => {
      const timestamp = '2024-01-15T10:00:00.000Z';
      await service.track({ name: 'test_event', properties: {}, timestamp });

      const event = mockProvider.getLastEvent();
      expect(event?.event.timestamp).toBe(timestamp);
    });

    it('should include default properties', async () => {
      const serviceWithDefaults = createAnalyticsService({
        defaultProperties: { app_version: '1.0.0' },
        serverTracking: false,
      });
      serviceWithDefaults.addProvider(mockProvider);

      await serviceWithDefaults.track({ name: 'test_event', properties: {} });

      const event = mockProvider.getLastEvent();
      expect(event?.event.properties).toEqual(
        expect.objectContaining({ app_version: '1.0.0' })
      );
    });

    it('should not throw when providers fail', async () => {
      const failingProvider = {
        name: 'failing',
        track: vi.fn().mockRejectedValue(new Error('Provider error')),
      };
      service.addProvider(failingProvider);

      await expect(
        service.track({ name: 'test_event', properties: {} })
      ).resolves.not.toThrow();
    });
  });

  describe('privacy consent', () => {
    it('should track to all providers when consent is given', async () => {
      vi.mocked(consent.getConsentStatus).mockResolvedValue({
        analytics: true,
        marketing: false,
        functional: true,
      });

      await service.track({
        name: 'checkout_started',
        properties: { email: 'test@example.com' },
      });

      expect(mockProvider.wasEventTracked('checkout_started')).toBe(true);
    });

    it('should anonymize data when consent is not given', async () => {
      vi.mocked(consent.getConsentStatus).mockResolvedValue({
        analytics: false,
        marketing: false,
        functional: true,
      });

      // Add a server provider mock
      const serverProvider = new MockProvider({ logToConsole: false });
      Object.defineProperty(serverProvider, 'name', { value: 'server' });
      service.addProvider(serverProvider);

      await service.track({
        name: 'checkout_started',
        properties: { email: 'test@example.com' },
        userId: 'user123',
      });

      // Should only track to server provider with anonymized data
      const event = serverProvider.getLastEvent();
      expect(event?.event.properties.email).toBeUndefined();
      expect(event?.event.userId).not.toBe('user123'); // Should be hashed
    });

    it('should remove PII fields when anonymizing', async () => {
      vi.mocked(consent.getConsentStatus).mockResolvedValue({
        analytics: false,
        marketing: false,
        functional: true,
      });

      const serverProvider = new MockProvider({ logToConsole: false });
      Object.defineProperty(serverProvider, 'name', { value: 'server' });
      service.addProvider(serverProvider);

      await service.track({
        name: 'test_event',
        properties: {
          email: 'test@example.com',
          name: 'John Doe',
          phone: '555-1234',
          amount: 2500,
        },
      });

      const event = serverProvider.getLastEvent();
      expect(event?.event.properties.email).toBeUndefined();
      expect(event?.event.properties.name).toBeUndefined();
      expect(event?.event.properties.phone).toBeUndefined();
      expect(event?.event.properties.amount).toBe(2500);
    });
  });

  describe('identify', () => {
    it('should identify user when consent is given', async () => {
      await service.identify('user123', { plan: 'pro' });

      // Mock provider should have the identify call
      const user = mockProvider.getIdentifiedUser(expect.any(String));
      expect(user).toBeDefined();
    });

    it('should not identify when consent is not given', async () => {
      vi.mocked(consent.getConsentStatus).mockResolvedValue({
        analytics: false,
        marketing: false,
        functional: true,
      });

      await service.identify('user123', { plan: 'pro' });

      // Should not have identified any user
      expect(mockProvider.getIdentifiedUser('user123')).toBeUndefined();
    });
  });

  describe('getProvider', () => {
    it('should return provider by name', () => {
      const provider = service.getProvider('mock');
      expect(provider).toBe(mockProvider);
    });

    it('should return undefined for unknown provider', () => {
      const provider = service.getProvider('unknown');
      expect(provider).toBeUndefined();
    });
  });
});

describe('MockProvider', () => {
  let provider: MockProvider;

  beforeEach(() => {
    provider = new MockProvider({ logToConsole: false });
  });

  afterEach(() => {
    provider.clear();
  });

  it('should track events', async () => {
    await provider.track({ name: 'test', properties: { foo: 'bar' } });

    expect(provider.getEventCount()).toBe(1);
    expect(provider.wasEventTracked('test')).toBe(true);
  });

  it('should get events by name', async () => {
    await provider.track({ name: 'event1', properties: {} });
    await provider.track({ name: 'event2', properties: {} });
    await provider.track({ name: 'event1', properties: {} });

    expect(provider.getEventsByName('event1')).toHaveLength(2);
    expect(provider.getEventsByName('event2')).toHaveLength(1);
  });

  it('should get last event', async () => {
    await provider.track({ name: 'first', properties: {} });
    await provider.track({ name: 'second', properties: {} });

    const lastEvent = provider.getLastEvent();
    expect(lastEvent?.event.name).toBe('second');
  });

  it('should clear all events', async () => {
    await provider.track({ name: 'test', properties: {} });
    provider.clear();

    expect(provider.getEventCount()).toBe(0);
  });

  it('should assert event was tracked', async () => {
    await provider.track({ name: 'test', properties: { foo: 'bar' } });

    expect(() => provider.assertEventTracked('test')).not.toThrow();
    expect(() => provider.assertEventTracked('test', { foo: 'bar' })).not.toThrow();
  });

  it('should fail assertion when event not tracked', () => {
    expect(() => provider.assertEventTracked('missing')).toThrow();
  });

  it('should fail assertion with wrong properties', async () => {
    await provider.track({ name: 'test', properties: { foo: 'bar' } });

    expect(() => provider.assertEventTracked('test', { foo: 'baz' })).toThrow();
  });
});
