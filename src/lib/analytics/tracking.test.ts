/**
 * Analytics Tracking Functions Tests
 *
 * Unit tests for the purchase funnel tracking functions.
 *
 * Story 17.8: Purchase Analytics Events
 * Task 8: Write comprehensive tests (AC: all)
 * Task 8.4: Test single-fire prevention for duplicate events
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  trackCheckoutStarted,
  trackCheckoutCompleted,
  trackCheckoutAbandoned,
  trackInvoiceRequested,
  trackInvoiceFormAbandoned,
  trackPreviewViewed,
  clearCheckoutStartTime,
} from './tracking';
import { analytics } from './service';
import * as consent from '@/lib/privacy/consent';

// Mock the analytics service
vi.mock('./service', () => ({
  analytics: {
    track: vi.fn().mockResolvedValue(undefined),
    initialize: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock privacy consent
vi.mock('@/lib/privacy/consent', () => ({
  getConsentStatus: vi.fn().mockResolvedValue({
    analytics: true,
    marketing: false,
    functional: true,
  }),
}));

describe('trackCheckoutStarted', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('should track checkout started event with required fields', async () => {
    await trackCheckoutStarted({
      ctaLocation: 'hero',
    });

    expect(analytics.track).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'checkout_started',
        properties: expect.objectContaining({
          ctaLocation: 'hero',
          timestamp: expect.any(String),
          sessionId: expect.any(String),
          deviceType: expect.any(String),
        }),
      })
    );
  });

  it('should include optional fields when provided', async () => {
    await trackCheckoutStarted({
      ctaLocation: 'sticky',
      userId: 'user123',
      savingsAmount: 50000,
      severityLevel: 'critical',
      displayedPrice: 250000,
    });

    expect(analytics.track).toHaveBeenCalledWith(
      expect.objectContaining({
        properties: expect.objectContaining({
          ctaLocation: 'sticky',
          savingsAmount: 50000,
          severityLevel: 'critical',
          displayedPrice: 250000,
        }),
      })
    );
  });

  it('should store start time in sessionStorage', async () => {
    await trackCheckoutStarted({ ctaLocation: 'hero' });

    const startTime = sessionStorage.getItem('analytics_checkout_start_time');
    expect(startTime).toBeDefined();
    expect(parseInt(startTime!, 10)).toBeLessThanOrEqual(Date.now());
  });
});

describe('trackCheckoutCompleted', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    localStorage.clear();
  });

  it('should track checkout completed event', async () => {
    await trackCheckoutCompleted({
      amount: 250000,
      currency: 'USD',
      stripeSessionId: 'cs_test_123',
    });

    expect(analytics.track).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'checkout_completed',
        properties: expect.objectContaining({
          amount: 250000,
          currency: 'USD',
          stripeSessionId: 'cs_test_123',
        }),
      })
    );
  });

  it('should calculate time to complete from start time', async () => {
    // Set a start time 5 seconds ago
    const startTime = Date.now() - 5000;
    sessionStorage.setItem('analytics_checkout_start_time', startTime.toString());

    await trackCheckoutCompleted({
      amount: 250000,
      currency: 'USD',
      stripeSessionId: 'cs_test_123',
    });

    expect(analytics.track).toHaveBeenCalledWith(
      expect.objectContaining({
        properties: expect.objectContaining({
          timeToComplete: expect.any(Number),
        }),
      })
    );

    const call = vi.mocked(analytics.track).mock.calls[0][0];
    expect((call.properties as { timeToComplete: number }).timeToComplete).toBeGreaterThanOrEqual(5000);
  });

  it('should prevent duplicate tracking for same session', async () => {
    await trackCheckoutCompleted({
      amount: 250000,
      currency: 'USD',
      stripeSessionId: 'cs_test_123',
    });

    // Try to track again
    await trackCheckoutCompleted({
      amount: 250000,
      currency: 'USD',
      stripeSessionId: 'cs_test_123',
    });

    // Should only be called once
    expect(analytics.track).toHaveBeenCalledTimes(1);
  });

  it('should allow tracking different sessions', async () => {
    await trackCheckoutCompleted({
      amount: 250000,
      currency: 'USD',
      stripeSessionId: 'cs_test_123',
    });

    await trackCheckoutCompleted({
      amount: 250000,
      currency: 'USD',
      stripeSessionId: 'cs_test_456',
    });

    expect(analytics.track).toHaveBeenCalledTimes(2);
  });

  it('should hash customer email', async () => {
    await trackCheckoutCompleted({
      amount: 250000,
      currency: 'USD',
      stripeSessionId: 'cs_test_123',
      customerEmail: 'test@example.com',
    });

    const call = vi.mocked(analytics.track).mock.calls[0][0];
    expect((call.properties as { customerEmail: string }).customerEmail).not.toBe('test@example.com');
    expect((call.properties as { customerEmail: string }).customerEmail).toBeDefined();
  });
});

describe('trackCheckoutAbandoned', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('should track checkout abandoned event', async () => {
    await trackCheckoutAbandoned({});

    expect(analytics.track).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'checkout_abandoned',
        properties: expect.objectContaining({
          timestamp: expect.any(String),
          sessionId: expect.any(String),
        }),
      })
    );
  });

  it('should calculate time on stripe from start time', async () => {
    const startTime = Date.now() - 30000;
    sessionStorage.setItem('analytics_checkout_start_time', startTime.toString());

    await trackCheckoutAbandoned({});

    expect(analytics.track).toHaveBeenCalledWith(
      expect.objectContaining({
        properties: expect.objectContaining({
          timeOnStripe: expect.any(Number),
        }),
      })
    );
  });

  it('should include abandonment context', async () => {
    await trackCheckoutAbandoned({
      stripeSessionId: 'cs_test_123',
      abandonmentPoint: 'payment_method',
      abandonmentReason: 'user_cancelled',
    });

    expect(analytics.track).toHaveBeenCalledWith(
      expect.objectContaining({
        properties: expect.objectContaining({
          stripeSessionId: 'cs_test_123',
          abandonmentPoint: 'payment_method',
          abandonmentReason: 'user_cancelled',
        }),
      })
    );
  });

  it('should clear start time after tracking', async () => {
    sessionStorage.setItem('analytics_checkout_start_time', Date.now().toString());

    await trackCheckoutAbandoned({});

    expect(sessionStorage.getItem('analytics_checkout_start_time')).toBeNull();
  });
});

describe('trackInvoiceRequested', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should track invoice requested event', async () => {
    await trackInvoiceRequested({
      companyName: 'Acme Corp',
      hasPoNumber: true,
      hasContactEmail: true,
    });

    expect(analytics.track).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'invoice_requested',
        properties: expect.objectContaining({
          hasPoNumber: true,
          hasContactEmail: true,
          companyNameLength: 9, // 'Acme Corp'.length
        }),
      })
    );
  });

  it('should NOT include actual company name (privacy)', async () => {
    await trackInvoiceRequested({
      companyName: 'Secret Corp Inc',
      hasPoNumber: false,
      hasContactEmail: false,
    });

    const call = vi.mocked(analytics.track).mock.calls[0][0];
    expect((call.properties as Record<string, unknown>).companyName).toBeUndefined();
    expect((call.properties as { companyNameLength: number }).companyNameLength).toBe(15);
  });
});

describe('trackInvoiceFormAbandoned', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should track form abandonment', async () => {
    await trackInvoiceFormAbandoned({
      timeOnForm: 45000,
      filledFields: ['companyName', 'billingAddress'],
    });

    expect(analytics.track).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'invoice_form_abandoned',
        properties: expect.objectContaining({
          timeOnForm: 45000,
          filledFields: ['companyName', 'billingAddress'],
        }),
      })
    );
  });
});

describe('trackPreviewViewed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should track preview viewed event', async () => {
    await trackPreviewViewed({
      totalAlignmentTax: 500000,
      estimatedSavings: 250000,
      severityLevel: 'severe',
      toolsCompleted: 7,
    });

    expect(analytics.track).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'preview_viewed',
        properties: expect.objectContaining({
          totalAlignmentTax: 500000,
          estimatedSavings: 250000,
          severityLevel: 'severe',
          toolsCompleted: 7,
        }),
      })
    );
  });
});

describe('clearCheckoutStartTime', () => {
  it('should clear the start time from storage', () => {
    sessionStorage.setItem('analytics_checkout_start_time', Date.now().toString());

    clearCheckoutStartTime();

    expect(sessionStorage.getItem('analytics_checkout_start_time')).toBeNull();
  });
});
