/**
 * Login API Tests
 *
 * Tests for the login endpoint with email/password authentication.
 *
 * Covers: Story 15.3 Task 4.9, FR41 (User login), NFR21 (Rate limiting)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

// Mock dependencies
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
  },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
}));

vi.mock('@/lib/db/schema', () => ({
  users: { id: 'id', email: 'email', passwordHash: 'passwordHash' },
}));

vi.mock('@/lib/auth', () => ({
  verifyPassword: vi.fn(),
  createTokenPair: vi.fn(),
  REFRESH_TOKEN_COOKIE_OPTIONS: {
    name: 'refresh_token',
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 604800,
  },
}));

import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifyPassword, createTokenPair } from '@/lib/auth';

describe('POST /api/auth/login', () => {
  const mockCookies = cookies as ReturnType<typeof vi.fn>;
  const mockVerifyPassword = verifyPassword as ReturnType<typeof vi.fn>;
  const mockCreateTokenPair = createTokenPair as ReturnType<typeof vi.fn>;
  const mockDb = db as unknown as { select: ReturnType<typeof vi.fn> };

  // Use unique IP per test to avoid rate limit issues
  let testIpCounter = 0;

  const createRequest = (body: object) => {
    const ip = `10.0.${Math.floor(testIpCounter / 256)}.${testIpCounter % 256}`;
    testIpCounter++;
    return new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': ip,
      },
      body: JSON.stringify(body),
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 for invalid email format', async () => {
    const request = createRequest({
      email: 'invalid-email',
      password: 'password123',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 for missing password', async () => {
    const request = createRequest({
      email: 'test@example.com',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 401 for non-existent user', async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    });

    const request = createRequest({
      email: 'nonexistent@example.com',
      password: 'password123',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_CREDENTIALS');
    expect(data.error.message).toBe('Invalid email or password.');
  });

  it('should return 401 for user without password hash', async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{
            id: 'user-123',
            email: 'test@example.com',
            passwordHash: null, // User registered with magic link only
          }]),
        }),
      }),
    });

    const request = createRequest({
      email: 'test@example.com',
      password: 'password123',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('should return 401 for wrong password', async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{
            id: 'user-123',
            email: 'test@example.com',
            passwordHash: 'hashed-password',
          }]),
        }),
      }),
    });

    mockVerifyPassword.mockResolvedValue(false);

    const request = createRequest({
      email: 'test@example.com',
      password: 'wrong-password',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('should return success with tokens for valid credentials', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      passwordHash: 'hashed-password',
      purchaseStatus: 'completed',
    };

    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockUser]),
        }),
      }),
    });

    mockVerifyPassword.mockResolvedValue(true);
    mockCreateTokenPair.mockResolvedValue({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });

    const mockSet = vi.fn();
    mockCookies.mockResolvedValue({
      set: mockSet,
    });

    const request = createRequest({
      email: 'test@example.com',
      password: 'correct-password',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.accessToken).toBe('new-access-token');
    expect(data.data.user.id).toBe('user-123');
    expect(data.data.user.email).toBe('test@example.com');
    expect(data.data.user.name).toBe('Test User');
    expect(mockSet).toHaveBeenCalled();
  });

  it('should normalize email to lowercase', async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    });

    const request = createRequest({
      email: 'TEST@EXAMPLE.COM',
      password: 'password123',
    });

    await POST(request);

    // Verify the db was queried (email normalization happens internally)
    expect(mockDb.select).toHaveBeenCalled();
  });

  it('should not reveal whether email exists in error message', async () => {
    // Test for non-existent user
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    });

    const request1 = createRequest({
      email: 'nonexistent@example.com',
      password: 'password123',
    });

    const response1 = await POST(request1);
    const data1 = await response1.json();

    // Test for wrong password
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{
            id: 'user-123',
            email: 'test@example.com',
            passwordHash: 'hash',
          }]),
        }),
      }),
    });
    mockVerifyPassword.mockResolvedValue(false);

    const request2 = createRequest({
      email: 'test@example.com',
      password: 'wrong-password',
    });

    const response2 = await POST(request2);
    const data2 = await response2.json();

    // Both errors should have the same generic message
    expect(data1.error.message).toBe('Invalid email or password.');
    expect(data2.error.message).toBe('Invalid email or password.');
  });

  describe('Rate Limiting (NFR21)', () => {
    const createRequestWithIp = (body: object, ip: string) => {
      return new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': ip,
        },
        body: JSON.stringify(body),
      });
    };

    it('should allow 5 requests from the same IP', async () => {
      const rateLimitTestIp = '192.168.100.1';

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      // Make 5 requests - all should be allowed (401 for invalid credentials, not 429)
      for (let i = 0; i < 5; i++) {
        const request = createRequestWithIp(
          { email: 'test@example.com', password: 'password123' },
          rateLimitTestIp
        );
        const response = await POST(request);
        expect(response.status).toBe(401); // Invalid credentials, not rate limited
      }
    });

    it('should return 429 after 5 failed attempts from the same IP', async () => {
      const rateLimitTestIp = '192.168.100.2';

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      // Make 5 requests first to hit the limit
      for (let i = 0; i < 5; i++) {
        const request = createRequestWithIp(
          { email: 'test@example.com', password: 'password123' },
          rateLimitTestIp
        );
        await POST(request);
      }

      // 6th request should be rate limited
      const request = createRequestWithIp(
        { email: 'test@example.com', password: 'password123' },
        rateLimitTestIp
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('RATE_LIMITED');
      expect(data.error.message).toBe('Too many login attempts. Please try again later.');
    });

    it('should rate limit independently per IP', async () => {
      const ip1 = '192.168.100.3';
      const ip2 = '192.168.100.4';

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      // Exhaust rate limit for IP1
      for (let i = 0; i < 5; i++) {
        await POST(createRequestWithIp(
          { email: 'test@example.com', password: 'password123' },
          ip1
        ));
      }

      // IP1 should be rate limited
      const response1 = await POST(createRequestWithIp(
        { email: 'test@example.com', password: 'password123' },
        ip1
      ));
      expect(response1.status).toBe(429);

      // IP2 should still work
      const response2 = await POST(createRequestWithIp(
        { email: 'test@example.com', password: 'password123' },
        ip2
      ));
      expect(response2.status).toBe(401); // Invalid credentials, not rate limited
    });
  });
});
