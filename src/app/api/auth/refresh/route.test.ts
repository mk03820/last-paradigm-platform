/**
 * Token Refresh API Tests
 *
 * Tests for the refresh token endpoint.
 *
 * Covers: Story 15.2 auth store requirements
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
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
  users: { id: 'id', email: 'email' },
}));

vi.mock('@/lib/auth/jwt', () => ({
  verifyRefreshToken: vi.fn(),
  createAccessToken: vi.fn(),
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
import { verifyRefreshToken, createAccessToken } from '@/lib/auth/jwt';

describe('POST /api/auth/refresh', () => {
  const mockCookies = cookies as ReturnType<typeof vi.fn>;
  const mockVerifyRefreshToken = verifyRefreshToken as ReturnType<typeof vi.fn>;
  const mockCreateAccessToken = createAccessToken as ReturnType<typeof vi.fn>;
  const mockDb = db as { select: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if no refresh token cookie exists', async () => {
    mockCookies.mockResolvedValue({
      get: vi.fn().mockReturnValue(undefined),
    });

    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('NO_REFRESH_TOKEN');
  });

  it('should return 401 if refresh token is invalid', async () => {
    mockCookies.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'invalid-token' }),
      delete: vi.fn(),
    });

    mockVerifyRefreshToken.mockResolvedValue(null);

    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_REFRESH_TOKEN');
  });

  it('should return 401 if user not found', async () => {
    mockCookies.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'valid-token' }),
      delete: vi.fn(),
    });

    mockVerifyRefreshToken.mockResolvedValue({ userId: 'user-123' });

    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    });

    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('USER_NOT_FOUND');
  });

  it('should return new access token on success', async () => {
    mockCookies.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'valid-token' }),
    });

    mockVerifyRefreshToken.mockResolvedValue({ userId: 'user-123' });

    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{
            id: 'user-123',
            email: 'test@example.com',
            name: 'Test User',
            purchaseStatus: 'none',
          }]),
        }),
      }),
    });

    mockCreateAccessToken.mockResolvedValue('new-access-token');

    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.accessToken).toBe('new-access-token');
    expect(data.data.user.id).toBe('user-123');
  });
});
