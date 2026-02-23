/**
 * Admin Webhooks API Route Tests
 *
 * Tests for GET /api/admin/webhooks endpoint.
 *
 * Story 17.5: Webhook Retry & Recovery
 * Task 6.3: Integration tests for admin API endpoints
 * Covers: AC4 (view pending/failed webhook events with full details)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/admin/webhooks/route';

// Mock dependencies
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
  },
}));

vi.mock('@/lib/db/schema', () => ({
  webhookLogs: {
    id: 'id',
    source: 'source',
    eventType: 'event_type',
    eventId: 'event_id',
    status: 'status',
    attempts: 'attempts',
    errorMessage: 'error_message',
    createdAt: 'created_at',
    processedAt: 'processed_at',
  },
}));

vi.mock('drizzle-orm', () => ({
  desc: vi.fn((col) => ({ column: col, order: 'desc' })),
  eq: vi.fn((a, b) => ({ field: a, value: b })),
  sql: vi.fn(),
}));

import { auth } from '@/auth';
import { db } from '@/lib/db';

describe('GET /api/admin/webhooks', () => {
  const createRequest = (params: Record<string, string> = {}) => {
    const url = new URL('http://localhost/api/admin/webhooks');
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    return new NextRequest(url);
  };

  const mockWebhookEvents = [
    {
      id: 'webhook-1',
      source: 'stripe',
      eventType: 'checkout.session.completed',
      eventId: 'evt_123',
      status: 'processed',
      attempts: 1,
      errorMessage: null,
      createdAt: new Date('2026-02-14T10:00:00Z'),
      processedAt: new Date('2026-02-14T10:00:01Z'),
    },
    {
      id: 'webhook-2',
      source: 'stripe',
      eventType: 'checkout.session.completed',
      eventId: 'evt_456',
      status: 'failed',
      attempts: 3,
      errorMessage: 'Database error',
      createdAt: new Date('2026-02-14T11:00:00Z'),
      processedAt: null,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ADMIN_EMAILS = 'admin@example.com,admin2@example.com';
  });

  afterEach(() => {
    delete process.env.ADMIN_EMAILS;
    vi.restoreAllMocks();
  });

  describe('Authentication', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null as never);

      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 401 when user has no email', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user_123', email: null },
      } as never);

      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 403 when user is not admin', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user_123', email: 'notadmin@example.com' },
      } as never);

      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Forbidden');
    });

    it('should allow access for admin user', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user_123', email: 'admin@example.com' },
      } as never);

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              offset: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      } as never);

      const request = createRequest();
      const response = await GET(request);

      expect(response.status).toBe(200);
    });

    it('should be case-insensitive for admin email check', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user_123', email: 'ADMIN@EXAMPLE.COM' },
      } as never);

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              offset: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      } as never);

      const request = createRequest();
      const response = await GET(request);

      expect(response.status).toBe(200);
    });
  });

  describe('Response Data', () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user_123', email: 'admin@example.com' },
      } as never);
    });

    it('should return webhook events with correct structure', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              offset: vi.fn().mockResolvedValue(mockWebhookEvents),
            }),
          }),
        }),
      } as never);

      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(data.events).toEqual(mockWebhookEvents);
      expect(data.events[0]).toHaveProperty('id');
      expect(data.events[0]).toHaveProperty('source');
      expect(data.events[0]).toHaveProperty('eventType');
      expect(data.events[0]).toHaveProperty('eventId');
      expect(data.events[0]).toHaveProperty('status');
      expect(data.events[0]).toHaveProperty('attempts');
      expect(data.events[0]).toHaveProperty('errorMessage');
      expect(data.events[0]).toHaveProperty('createdAt');
      expect(data.events[0]).toHaveProperty('processedAt');
    });

    it('should include pagination data', async () => {
      vi.mocked(db.select)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue(mockWebhookEvents),
              }),
            }),
          }),
        } as never)
        .mockReturnValueOnce({
          from: vi.fn().mockResolvedValue([{ count: 100 }]),
        } as never);

      const request = createRequest({ limit: '10', offset: '20' });
      const response = await GET(request);
      const data = await response.json();

      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('limit', 10);
      expect(data).toHaveProperty('offset', 20);
    });

    it('should return empty array when no events exist', async () => {
      vi.mocked(db.select)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue([]),
              }),
            }),
          }),
        } as never)
        .mockReturnValueOnce({
          from: vi.fn().mockResolvedValue([{ count: 0 }]),
        } as never);

      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(data.events).toEqual([]);
    });
  });

  describe('Filtering', () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user_123', email: 'admin@example.com' },
      } as never);
    });

    it('should filter by status when provided', async () => {
      const whereMock = vi.fn().mockReturnValue({
        orderBy: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            offset: vi.fn().mockResolvedValue([mockWebhookEvents[1]]),
          }),
        }),
      });

      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              offset: vi.fn().mockResolvedValue([mockWebhookEvents[1]]),
              where: whereMock,
            }),
          }),
          where: whereMock,
        }),
      } as never);

      const request = createRequest({ status: 'failed' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.events).toBeDefined();
    });

    it('should return all events when status is not provided', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              offset: vi.fn().mockResolvedValue(mockWebhookEvents),
            }),
          }),
        }),
      } as never);

      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(data.events).toHaveLength(2);
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user_123', email: 'admin@example.com' },
      } as never);
    });

    it('should use default limit of 50', async () => {
      const limitMock = vi.fn().mockReturnValue({
        offset: vi.fn().mockResolvedValue([]),
      });

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: limitMock,
          }),
        }),
      } as never);

      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(limitMock).toHaveBeenCalledWith(50);
      expect(data.limit).toBe(50);
    });

    it('should use provided limit', async () => {
      const limitMock = vi.fn().mockReturnValue({
        offset: vi.fn().mockResolvedValue([]),
      });

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: limitMock,
          }),
        }),
      } as never);

      const request = createRequest({ limit: '25' });
      const response = await GET(request);
      const data = await response.json();

      expect(limitMock).toHaveBeenCalledWith(25);
      expect(data.limit).toBe(25);
    });

    it('should cap limit at 100', async () => {
      const limitMock = vi.fn().mockReturnValue({
        offset: vi.fn().mockResolvedValue([]),
      });

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: limitMock,
          }),
        }),
      } as never);

      const request = createRequest({ limit: '500' });
      const response = await GET(request);
      const data = await response.json();

      expect(limitMock).toHaveBeenCalledWith(100);
      expect(data.limit).toBe(100);
    });

    it('should use default offset of 0', async () => {
      const offsetMock = vi.fn().mockResolvedValue([]);

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              offset: offsetMock,
            }),
          }),
        }),
      } as never);

      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(offsetMock).toHaveBeenCalledWith(0);
      expect(data.offset).toBe(0);
    });

    it('should use provided offset', async () => {
      const offsetMock = vi.fn().mockResolvedValue([]);

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              offset: offsetMock,
            }),
          }),
        }),
      } as never);

      const request = createRequest({ offset: '50' });
      const response = await GET(request);
      const data = await response.json();

      expect(offsetMock).toHaveBeenCalledWith(50);
      expect(data.offset).toBe(50);
    });
  });

  describe('Ordering', () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user_123', email: 'admin@example.com' },
      } as never);
    });

    it('should order by createdAt descending', async () => {
      const orderByMock = vi.fn().mockReturnValue({
        limit: vi.fn().mockReturnValue({
          offset: vi.fn().mockResolvedValue([]),
        }),
      });

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          orderBy: orderByMock,
        }),
      } as never);

      const request = createRequest();
      await GET(request);

      expect(orderByMock).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user_123', email: 'admin@example.com' },
      } as never);
    });

    it('should return 500 on database error', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              offset: vi.fn().mockRejectedValue(new Error('Database error')),
            }),
          }),
        }),
      } as never);

      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch webhook events');
    });
  });
});
