/**
 * Track Registration Start API Tests
 *
 * Tests for the registration abandonment tracking endpoint.
 *
 * Story 15.9: Registration Abandonment Recovery
 * Covers: Task 2, AC1 (Track email entry), AC5 (One reminder per abandonment)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock database - must be defined before vi.mock
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue([]),
        })),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn().mockResolvedValue([{
            id: 'existing-id',
            email: 'test@example.com',
            token: 'new-token',
          }]),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn().mockResolvedValue([{
          id: 'new-id',
          email: 'test@example.com',
          token: 'test-token',
        }]),
      })),
    })),
  },
}));

// Mock schema
vi.mock('@/lib/db/schema', () => ({
  abandonedRegistrations: {
    email: 'email',
    token: 'token',
  },
}));

// Mock drizzle-orm
vi.mock('drizzle-orm', () => ({
  eq: vi.fn((col, val) => ({ col, val })),
}));

// Mock Inngest
vi.mock('@/lib/inngest', () => ({
  inngest: {
    send: vi.fn().mockResolvedValue({ ids: ['test-id'] }),
  },
}));

import { POST } from './route';
import { inngest } from '@/lib/inngest';
import { db } from '@/lib/db';

let testCounter = 0;

function createRequest(body: object, ip?: string): NextRequest {
  testCounter++;
  return new NextRequest('http://localhost/api/auth/track-registration-start', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': ip || `127.0.0.${testCounter}`,
    },
    body: JSON.stringify(body),
  });
}

describe('POST /api/auth/track-registration-start', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    testCounter = 0;
  });

  it('should create a new abandonment record for valid email', async () => {
    const request = createRequest({ email: 'test@example.com' });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.token).toBeDefined();
  });

  it('should trigger Inngest event for abandonment tracking', async () => {
    const request = createRequest({ email: 'test@example.com' });

    await POST(request);

    expect(inngest.send).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'registration/abandoned',
        data: expect.objectContaining({
          email: 'test@example.com',
          abandonedAt: expect.any(String),
        }),
      })
    );
  });

  it('should reject invalid email', async () => {
    const request = createRequest({ email: 'not-an-email' });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_EMAIL');
  });

  it('should reject empty email', async () => {
    const request = createRequest({ email: '' });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('should normalize email to lowercase', async () => {
    const request = createRequest({ email: 'TEST@EXAMPLE.COM' });

    await POST(request);

    expect(inngest.send).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'test@example.com',
        }),
      })
    );
  });

  it('should update existing record if same email tries again', async () => {
    // Mock existing record that's not completed
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{
            id: 'existing-id',
            email: 'test@example.com',
            token: 'old-token',
            completedAt: null,
          }]),
        }),
      }),
    } as any);

    // Use unique IP to avoid rate limiting from previous tests
    const request = createRequest({ email: 'test@example.com' }, '10.0.0.1');

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should skip tracking if registration already completed', async () => {
    // Mock completed registration
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{
            id: 'existing-id',
            email: 'test@example.com',
            token: 'old-token',
            completedAt: new Date(),
          }]),
        }),
      }),
    } as any);

    // Use unique IP to avoid rate limiting from previous tests
    const request = createRequest({ email: 'test@example.com' }, '10.0.0.2');

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should rate limit excessive requests', async () => {
    const sameIp = '192.168.1.100';

    // Make 5 requests from the same IP
    for (let i = 0; i < 5; i++) {
      await POST(createRequest({ email: `test${i}@example.com` }, sameIp));
    }

    // 6th request should be rate limited
    const response = await POST(createRequest({ email: 'test5@example.com' }, sameIp));
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.error.code).toBe('RATE_LIMITED');
  });
});
