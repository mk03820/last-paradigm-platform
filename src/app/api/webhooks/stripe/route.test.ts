/**
 * Stripe Webhook API Route Tests
 *
 * Tests for POST /api/webhooks/stripe endpoint.
 *
 * Story 17.4: Stripe Webhook Handler
 * Task 6.1, 6.3, 6.4, 6.5, 6.6: Comprehensive webhook tests
 * Covers: AC1, AC5, AC6, AC7, AC8
 */

import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';
import type Stripe from 'stripe';

// Mock dependencies
vi.mock('@/lib/stripe/client', () => ({
  stripe: {
    webhooks: {
      constructEvent: vi.fn(),
    },
  },
}));

vi.mock('@/lib/stripe/webhooks', () => ({
  handleCheckoutCompleted: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('@/lib/db/schema', () => ({
  webhookLogs: { id: 'id', eventId: 'event_id', status: 'status' },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((a, b) => ({ field: a, value: b })),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));

import { stripe } from '@/lib/stripe/client';
import { handleCheckoutCompleted } from '@/lib/stripe/webhooks';
import { db } from '@/lib/db';
import { headers } from 'next/headers';

describe('POST /api/webhooks/stripe', () => {
  const mockEventId = 'evt_test_123456789';
  const mockSignature = 'test_signature_123';

  const createMockEvent = (
    type: string,
    data: Record<string, unknown> = {}
  ): Stripe.Event => ({
    id: mockEventId,
    object: 'event',
    api_version: '2024-06-20' as Stripe.LatestApiVersion,
    created: Math.floor(Date.now() / 1000),
    type,
    data: { object: data },
    livemode: false,
    pending_webhooks: 0,
    request: null,
  }) as unknown as Stripe.Event;

  const createRequest = (body: string = '{}') => {
    return new NextRequest('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': mockSignature,
      },
      body,
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret';

    // Default mock for headers
    vi.mocked(headers).mockResolvedValue({
      get: vi.fn((name: string) => {
        if (name === 'stripe-signature') return mockSignature;
        return null;
      }),
    } as never);
  });

  afterEach(() => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
    vi.restoreAllMocks();
  });

  describe('Signature Verification (AC1, AC5)', () => {
    it('should return 400 when stripe-signature header is missing', async () => {
      vi.mocked(headers).mockResolvedValue({
        get: vi.fn().mockReturnValue(null),
      } as never);

      const request = createRequest('{}');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing signature');
      expect(data.received).toBe(false);
    });

    it('should return 500 when STRIPE_WEBHOOK_SECRET is not configured', async () => {
      delete process.env.STRIPE_WEBHOOK_SECRET;

      const request = createRequest('{}');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Webhook secret not configured');
    });

    it('should return 400 when signature verification fails (AC5)', async () => {
      vi.mocked(stripe.webhooks.constructEvent).mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const request = createRequest('{}');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid signature');
      expect(data.received).toBe(false);
    });

    it('should verify signature using webhook secret', async () => {
      const mockEvent = createMockEvent('checkout.session.completed');
      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(mockEvent);

      // Mock database operations
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as never);

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 'log-123' }]),
        }),
      } as never);

      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      } as never);

      vi.mocked(handleCheckoutCompleted).mockResolvedValue({
        success: true,
        userId: 'user-123',
        purchaseId: 'purchase-123',
      });

      const body = '{"test": true}';
      const request = createRequest(body);
      await POST(request);

      expect(stripe.webhooks.constructEvent).toHaveBeenCalledWith(
        body,
        mockSignature,
        'whsec_test_secret'
      );
    });
  });

  describe('Idempotency (AC6)', () => {
    it('should return 200 for already processed events', async () => {
      const mockEvent = createMockEvent('checkout.session.completed');
      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(mockEvent);

      // Mock: event already processed
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: 'log-123', status: 'processed' }]),
          }),
        }),
      } as never);

      const request = createRequest('{}');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
      expect(data.eventId).toBe(mockEventId);
      expect(handleCheckoutCompleted).not.toHaveBeenCalled();
    });

    it('should process event if previous attempt failed', async () => {
      const mockEvent = createMockEvent('checkout.session.completed');
      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(mockEvent);

      // Mock: event exists but failed
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: 'log-123', status: 'failed' }]),
          }),
        }),
      } as never);

      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      } as never);

      vi.mocked(handleCheckoutCompleted).mockResolvedValue({
        success: true,
        userId: 'user-123',
        purchaseId: 'purchase-123',
      });

      const request = createRequest('{}');
      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(handleCheckoutCompleted).toHaveBeenCalled();
    });
  });

  describe('Event Processing', () => {
    it('should handle checkout.session.completed event', async () => {
      const sessionData = {
        id: 'cs_test_123',
        amount_total: 250000,
        currency: 'usd',
        metadata: { userId: 'user-123' },
      };
      const mockEvent = createMockEvent('checkout.session.completed', sessionData);
      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(mockEvent);

      // Mock: no existing event
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as never);

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 'log-123' }]),
        }),
      } as never);

      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      } as never);

      vi.mocked(handleCheckoutCompleted).mockResolvedValue({
        success: true,
        userId: 'user-123',
        purchaseId: 'purchase-123',
      });

      const request = createRequest('{}');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
      expect(handleCheckoutCompleted).toHaveBeenCalledWith(sessionData);
    });

    it('should handle unrecognized event types gracefully', async () => {
      const mockEvent = createMockEvent('unknown.event.type', {});
      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(mockEvent);

      // Mock database operations
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as never);

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 'log-123' }]),
        }),
      } as never);

      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      } as never);

      const request = createRequest('{}');
      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(handleCheckoutCompleted).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling (AC7)', () => {
    it('should return 500 when handler throws error', async () => {
      const mockEvent = createMockEvent('checkout.session.completed', {});
      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(mockEvent);

      // Mock: no existing event
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as never);

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 'log-123' }]),
        }),
      } as never);

      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      } as never);

      vi.mocked(handleCheckoutCompleted).mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = createRequest('{}');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Processing failed');
      expect(data.received).toBe(false);
    });

    it('should update webhook log with error on failure', async () => {
      const mockEvent = createMockEvent('checkout.session.completed', {});
      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(mockEvent);

      // Mock: no existing event
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as never);

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 'log-123' }]),
        }),
      } as never);

      const updateSetMock = vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      });
      vi.mocked(db.update).mockReturnValue({
        set: updateSetMock,
      } as never);

      vi.mocked(handleCheckoutCompleted).mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = createRequest('{}');
      await POST(request);

      // Should have been called to log the error
      expect(updateSetMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'failed',
          errorMessage: 'Database connection failed',
        })
      );
    });
  });

  describe('Webhook Logging (AC8)', () => {
    it('should log event receipt in database', async () => {
      const mockEvent = createMockEvent('checkout.session.completed', {});
      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(mockEvent);

      // Mock: no existing event
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as never);

      const insertValuesMock = vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 'log-123' }]),
      });
      vi.mocked(db.insert).mockReturnValue({
        values: insertValuesMock,
      } as never);

      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      } as never);

      vi.mocked(handleCheckoutCompleted).mockResolvedValue({
        success: true,
        userId: 'user-123',
        purchaseId: 'purchase-123',
      });

      const request = createRequest('{}');
      await POST(request);

      expect(insertValuesMock).toHaveBeenCalledWith(
        expect.objectContaining({
          source: 'stripe',
          eventType: 'checkout.session.completed',
          eventId: mockEventId,
          status: 'processing',
        })
      );
    });

    it('should mark event as processed on success', async () => {
      const mockEvent = createMockEvent('checkout.session.completed', {});
      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(mockEvent);

      // Mock: no existing event
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as never);

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 'log-123' }]),
        }),
      } as never);

      const updateSetMock = vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      });
      vi.mocked(db.update).mockReturnValue({
        set: updateSetMock,
      } as never);

      vi.mocked(handleCheckoutCompleted).mockResolvedValue({
        success: true,
        userId: 'user-123',
        purchaseId: 'purchase-123',
      });

      const request = createRequest('{}');
      await POST(request);

      // Find the call that marked it as processed
      const processedCall = updateSetMock.mock.calls.find(
        (call) => (call[0] as Record<string, unknown>).status === 'processed'
      );
      expect(processedCall).toBeDefined();
      expect((processedCall![0] as Record<string, unknown>).processedAt).toBeInstanceOf(Date);
    });
  });
});
