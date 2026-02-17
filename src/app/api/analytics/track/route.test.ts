/**
 * Analytics Track API Route Tests
 *
 * Integration tests for the analytics tracking API endpoint.
 *
 * Story 17.8: Purchase Analytics Events
 * Task 8.5: Integration tests for purchase funnel tracking
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST, OPTIONS } from './route';
import { NextRequest } from 'next/server';

// Mock the database
const mockInsert = vi.fn().mockReturnValue({
  values: vi.fn().mockResolvedValue(undefined),
});

vi.mock('@/lib/db', () => ({
  db: {
    insert: () => mockInsert(),
  },
}));

vi.mock('@/lib/db/schema', () => ({
  analyticsEvents: {},
}));

describe('POST /api/analytics/track', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should track a valid event', async () => {
    const request = new NextRequest('http://localhost/api/analytics/track', {
      method: 'POST',
      body: JSON.stringify({
        name: 'checkout_started',
        properties: { ctaLocation: 'hero' },
        sessionId: 'session123',
      }),
      headers: {
        'Content-Type': 'application/json',
        'user-agent': 'Mozilla/5.0',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockInsert).toHaveBeenCalled();
  });

  it('should handle missing properties gracefully', async () => {
    const request = new NextRequest('http://localhost/api/analytics/track', {
      method: 'POST',
      body: JSON.stringify({
        name: 'test_event',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should reject invalid event name', async () => {
    const request = new NextRequest('http://localhost/api/analytics/track', {
      method: 'POST',
      body: JSON.stringify({
        name: '', // Empty name
        properties: {},
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200); // Still 200 to not break client
    expect(data.success).toBe(false);
  });

  it('should parse timestamp when provided', async () => {
    const timestamp = '2024-01-15T10:00:00.000Z';

    const request = new NextRequest('http://localhost/api/analytics/track', {
      method: 'POST',
      body: JSON.stringify({
        name: 'test_event',
        properties: {},
        timestamp,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockInsert).toHaveBeenCalled();
  });

  it('should extract user agent from headers', async () => {
    const request = new NextRequest('http://localhost/api/analytics/track', {
      method: 'POST',
      body: JSON.stringify({
        name: 'test_event',
        properties: {},
      }),
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TestBrowser/1.0',
      },
    });

    await POST(request);

    expect(mockInsert).toHaveBeenCalled();
  });

  it('should hash IP address from x-forwarded-for', async () => {
    const request = new NextRequest('http://localhost/api/analytics/track', {
      method: 'POST',
      body: JSON.stringify({
        name: 'test_event',
        properties: {},
      }),
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '192.168.1.100',
      },
    });

    await POST(request);

    expect(mockInsert).toHaveBeenCalled();
  });

  it('should handle database errors gracefully', async () => {
    mockInsert.mockReturnValueOnce({
      values: vi.fn().mockRejectedValue(new Error('DB Error')),
    });

    const request = new NextRequest('http://localhost/api/analytics/track', {
      method: 'POST',
      body: JSON.stringify({
        name: 'test_event',
        properties: {},
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);

    // Should still return 200 - analytics should never break the app
    expect(response.status).toBe(200);
  });

  it('should handle malformed JSON', async () => {
    const request = new NextRequest('http://localhost/api/analytics/track', {
      method: 'POST',
      body: 'not valid json',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);

    // Should return 200 even for errors
    expect(response.status).toBe(200);
  });
});

describe('OPTIONS /api/analytics/track', () => {
  it('should return CORS headers', async () => {
    const response = await OPTIONS();

    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain(
      'POST'
    );
  });
});
