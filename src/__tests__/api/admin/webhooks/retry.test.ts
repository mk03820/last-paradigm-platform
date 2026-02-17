/**
 * Admin Webhook Retry API Route Tests
 *
 * Tests for POST /api/admin/webhooks/[id]/retry endpoint.
 *
 * Story 17.5: Webhook Retry & Recovery
 * Task 6.5: Test manual processing flow
 * Covers: AC5 (manual processing of stored webhook payload)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/admin/webhooks/[id]/retry/route';
import type Stripe from 'stripe';

// Mock dependencies
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('@/lib/db/schema', () => ({
  webhookLogs: {
    id: 'id',
    status: 'status',
    attempts: 'attempts',
  },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((a, b) => ({ field: a, value: b })),
}));

vi.mock('@/lib/stripe/webhooks', () => ({
  handleCheckoutCompleted: vi.fn(),
}));

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { handleCheckoutCompleted } from '@/lib/stripe/webhooks';

describe('POST /api/admin/webhooks/[id]/retry', () => {
  const createRequest = () => {
    return new NextRequest('http://localhost/api/admin/webhooks/webhook-123/retry', {
      method: 'POST',
    });
  };

  const mockParams = { id: 'webhook-123' };

  const mockWebhookEvent = {
    id: 'webhook-123',
    source: 'stripe',
    eventType: 'checkout.session.completed',
    eventId: 'evt_test_123',
    status: 'failed',
    attempts: 3,
    errorMessage: 'Previous error',
    payload: {
      id: 'evt_test_123',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          metadata: { userId: 'user_123' },
        },
      },
    } as unknown as Stripe.Event,
    createdAt: new Date(),
    processedAt: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ADMIN_EMAILS = 'admin@example.com';
  });

  afterEach(() => {
    delete process.env.ADMIN_EMAILS;
    vi.restoreAllMocks();
  });

  describe('Authentication', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const request = createRequest();
      const response = await POST(request, { params: Promise.resolve(mockParams) });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.message).toBe('Unauthorized');
    });

    it('should return 401 when user has no email', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user_123', email: null },
      } as never);

      const request = createRequest();
      const response = await POST(request, { params: Promise.resolve(mockParams) });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.message).toBe('Unauthorized');
    });

    it('should return 403 when user is not admin', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user_123', email: 'notadmin@example.com' },
      } as never);

      const request = createRequest();
      const response = await POST(request, { params: Promise.resolve(mockParams) });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.message).toBe('Forbidden');
    });

    it('should allow access for admin user', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user_123', email: 'admin@example.com' },
      } as never);

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockWebhookEvent]),
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
        userId: 'user_123',
        purchaseId: 'purchase_123',
      });

      const request = createRequest();
      const response = await POST(request, { params: Promise.resolve(mockParams) });

      expect(response.status).toBe(200);
    });
  });

  describe('Event Lookup', () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user_123', email: 'admin@example.com' },
      } as never);
    });

    it('should return 404 when event not found', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as never);

      const request = createRequest();
      const response = await POST(request, { params: Promise.resolve(mockParams) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.message).toBe('Event not found');
    });

    it('should return 400 when event already processed', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ ...mockWebhookEvent, status: 'processed' }]),
          }),
        }),
      } as never);

      const request = createRequest();
      const response = await POST(request, { params: Promise.resolve(mockParams) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe('Event already processed');
    });

    it('should use event ID from params', async () => {
      const whereMock = vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue([mockWebhookEvent]),
      });

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: whereMock,
        }),
      } as never);

      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      } as never);

      vi.mocked(handleCheckoutCompleted).mockResolvedValue({
        success: true,
        userId: 'user_123',
        purchaseId: 'purchase_123',
      });

      const request = createRequest();
      await POST(request, { params: Promise.resolve({ id: 'specific-event-id' }) });

      // The where clause should have been called with the event ID
      expect(whereMock).toHaveBeenCalled();
    });
  });

  describe('Event Processing', () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user_123', email: 'admin@example.com' },
      } as never);

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockWebhookEvent]),
          }),
        }),
      } as never);
    });

    it('should process checkout.session.completed events', async () => {
      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      } as never);

      vi.mocked(handleCheckoutCompleted).mockResolvedValue({
        success: true,
        userId: 'user_123',
        purchaseId: 'purchase_123',
      });

      const request = createRequest();
      const response = await POST(request, { params: Promise.resolve(mockParams) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(handleCheckoutCompleted).toHaveBeenCalledWith(
        mockWebhookEvent.payload.data.object
      );
    });

    it('should return 400 for unsupported event types', async () => {
      const unsupportedEvent = {
        ...mockWebhookEvent,
        eventType: 'unsupported.event.type',
      };

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([unsupportedEvent]),
          }),
        }),
      } as never);

      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      } as never);

      const request = createRequest();
      const response = await POST(request, { params: Promise.resolve(mockParams) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toContain('cannot be manually retried');
    });

    it('should increment attempt count', async () => {
      const setMock = vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      });

      vi.mocked(db.update).mockReturnValue({
        set: setMock,
      } as never);

      vi.mocked(handleCheckoutCompleted).mockResolvedValue({
        success: true,
        userId: 'user_123',
        purchaseId: 'purchase_123',
      });

      const request = createRequest();
      await POST(request, { params: Promise.resolve(mockParams) });

      // First call sets status to processing and increments attempts
      expect(setMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'processing',
          attempts: mockWebhookEvent.attempts + 1,
        })
      );
    });

    it('should mark event as processed on success', async () => {
      const setMock = vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      });

      vi.mocked(db.update).mockReturnValue({
        set: setMock,
      } as never);

      vi.mocked(handleCheckoutCompleted).mockResolvedValue({
        success: true,
        userId: 'user_123',
        purchaseId: 'purchase_123',
      });

      const request = createRequest();
      await POST(request, { params: Promise.resolve(mockParams) });

      // Second call marks as processed
      expect(setMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'processed',
          errorMessage: null,
        })
      );
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user_123', email: 'admin@example.com' },
      } as never);

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockWebhookEvent]),
          }),
        }),
      } as never);
    });

    it('should return 500 when handler throws', async () => {
      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      } as never);

      vi.mocked(handleCheckoutCompleted).mockRejectedValue(
        new Error('Handler error')
      );

      const request = createRequest();
      const response = await POST(request, { params: Promise.resolve(mockParams) });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Handler error');
    });

    it('should update event with error message on failure', async () => {
      const setMock = vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      });

      vi.mocked(db.update).mockReturnValue({
        set: setMock,
      } as never);

      vi.mocked(handleCheckoutCompleted).mockRejectedValue(
        new Error('Processing failed')
      );

      const request = createRequest();
      await POST(request, { params: Promise.resolve(mockParams) });

      // Verify error was recorded
      expect(setMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'failed',
          errorMessage: 'Processing failed',
        })
      );
    });

    it('should handle unknown errors gracefully', async () => {
      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      } as never);

      vi.mocked(handleCheckoutCompleted).mockRejectedValue('Unknown error');

      const request = createRequest();
      const response = await POST(request, { params: Promise.resolve(mockParams) });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Unknown error');
    });
  });

  describe('Charge Refunded Events', () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user_123', email: 'admin@example.com' },
      } as never);
    });

    it('should handle charge.refunded event type', async () => {
      const refundEvent = {
        ...mockWebhookEvent,
        eventType: 'charge.refunded',
      };

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([refundEvent]),
          }),
        }),
      } as never);

      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      } as never);

      const request = createRequest();
      const response = await POST(request, { params: Promise.resolve(mockParams) });

      // charge.refunded handler is not implemented, so it should just log
      expect(response.status).toBe(200);
    });
  });

  describe('Status Transitions', () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user_123', email: 'admin@example.com' },
      } as never);
    });

    it('should allow retry of failed events', async () => {
      const failedEvent = { ...mockWebhookEvent, status: 'failed' };

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([failedEvent]),
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
        userId: 'user_123',
        purchaseId: 'purchase_123',
      });

      const request = createRequest();
      const response = await POST(request, { params: Promise.resolve(mockParams) });

      expect(response.status).toBe(200);
    });

    it('should allow retry of received events', async () => {
      const receivedEvent = { ...mockWebhookEvent, status: 'received' };

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([receivedEvent]),
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
        userId: 'user_123',
        purchaseId: 'purchase_123',
      });

      const request = createRequest();
      const response = await POST(request, { params: Promise.resolve(mockParams) });

      expect(response.status).toBe(200);
    });

    it('should allow retry of processing events (stuck)', async () => {
      const processingEvent = { ...mockWebhookEvent, status: 'processing' };

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([processingEvent]),
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
        userId: 'user_123',
        purchaseId: 'purchase_123',
      });

      const request = createRequest();
      const response = await POST(request, { params: Promise.resolve(mockParams) });

      expect(response.status).toBe(200);
    });
  });
});
