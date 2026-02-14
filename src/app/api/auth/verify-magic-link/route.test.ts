/**
 * Magic Link Verification API Tests
 *
 * Tests for GET /api/auth/verify-magic-link endpoint.
 *
 * Covers: Story 15.4 Task 2.10
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

// Mock the magic-link module
vi.mock('@/lib/auth/magic-link', () => ({
  verifyMagicLink: vi.fn(),
  findOrCreateUserByEmail: vi.fn(),
}));

// Mock the JWT module
vi.mock('@/lib/auth/jwt', () => ({
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

// Mock cookies
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => Promise.resolve({
    set: vi.fn(),
  })),
}));

import { verifyMagicLink, findOrCreateUserByEmail } from '@/lib/auth/magic-link';
import { createTokenPair } from '@/lib/auth/jwt';

describe('GET /api/auth/verify-magic-link', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks for successful flow
    vi.mocked(verifyMagicLink).mockResolvedValue({
      success: true,
      magicLink: {
        id: 'link-123',
        email: 'user@example.com',
        token: 'test-token',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        usedAt: null,
        createdAt: new Date(),
      },
    });

    vi.mocked(findOrCreateUserByEmail).mockResolvedValue({
      id: 'user-123',
      email: 'user@example.com',
      name: 'Test User',
      purchaseStatus: 'none',
      isNewUser: false,
    });

    vi.mocked(createTokenPair).mockResolvedValue({
      accessToken: 'access-token-123',
      refreshToken: 'refresh-token-123',
    });
  });

  it('returns 400 for missing token', async () => {
    const request = new Request('http://test.com/api/auth/verify-magic-link');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_TOKEN');
  });

  it('returns 400 for empty token', async () => {
    const request = new Request('http://test.com/api/auth/verify-magic-link?token=');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_TOKEN');
  });

  it('returns 400 for invalid token', async () => {
    vi.mocked(verifyMagicLink).mockResolvedValue({
      success: false,
      error: 'INVALID_TOKEN',
    });

    const request = new Request('http://test.com/api/auth/verify-magic-link?token=invalid');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_TOKEN');
    expect(data.error.message).toContain('invalid');
  });

  it('returns 400 for expired token', async () => {
    vi.mocked(verifyMagicLink).mockResolvedValue({
      success: false,
      error: 'EXPIRED',
    });

    const request = new Request('http://test.com/api/auth/verify-magic-link?token=expired');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('EXPIRED');
    expect(data.error.message).toContain('expired');
  });

  it('returns 400 for already used token', async () => {
    vi.mocked(verifyMagicLink).mockResolvedValue({
      success: false,
      error: 'ALREADY_USED',
    });

    const request = new Request('http://test.com/api/auth/verify-magic-link?token=used');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('ALREADY_USED');
    expect(data.error.message).toContain('already been used');
  });

  it('returns success for valid token', async () => {
    const request = new Request('http://test.com/api/auth/verify-magic-link?token=valid-token');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.accessToken).toBe('access-token-123');
    expect(data.data.user.id).toBe('user-123');
    expect(data.data.user.email).toBe('user@example.com');
  });

  it('returns isNewUser flag for new users', async () => {
    vi.mocked(findOrCreateUserByEmail).mockResolvedValue({
      id: 'new-user-123',
      email: 'new@example.com',
      name: null,
      purchaseStatus: 'none',
      isNewUser: true,
    });

    const request = new Request('http://test.com/api/auth/verify-magic-link?token=valid-token');

    const response = await GET(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data.isNewUser).toBe(true);
  });

  it('returns isNewUser false for existing users', async () => {
    const request = new Request('http://test.com/api/auth/verify-magic-link?token=valid-token');

    const response = await GET(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data.isNewUser).toBe(false);
  });

  it('uses default redirect URL', async () => {
    const request = new Request('http://test.com/api/auth/verify-magic-link?token=valid-token');

    const response = await GET(request);
    const data = await response.json();

    expect(data.data.redirectUrl).toBe('/dashboard');
  });

  it('respects callbackUrl parameter', async () => {
    const request = new Request(
      'http://test.com/api/auth/verify-magic-link?token=valid-token&callbackUrl=/settings'
    );

    const response = await GET(request);
    const data = await response.json();

    expect(data.data.redirectUrl).toBe('/settings');
  });

  it('verifies the token with correct value', async () => {
    const request = new Request('http://test.com/api/auth/verify-magic-link?token=my-token-123');

    await GET(request);

    expect(verifyMagicLink).toHaveBeenCalledWith('my-token-123');
  });

  it('creates user with correct email', async () => {
    const request = new Request('http://test.com/api/auth/verify-magic-link?token=valid-token');

    await GET(request);

    expect(findOrCreateUserByEmail).toHaveBeenCalledWith('user@example.com');
  });

  it('creates tokens with correct user data', async () => {
    const request = new Request('http://test.com/api/auth/verify-magic-link?token=valid-token');

    await GET(request);

    expect(createTokenPair).toHaveBeenCalledWith({
      userId: 'user-123',
      email: 'user@example.com',
      name: 'Test User',
      purchaseStatus: 'none',
    });
  });

  it('returns 500 for user creation failure', async () => {
    vi.mocked(findOrCreateUserByEmail).mockResolvedValue(null);

    const request = new Request('http://test.com/api/auth/verify-magic-link?token=valid-token');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('SERVER_ERROR');
  });

  it('returns 500 for server errors in verification', async () => {
    vi.mocked(verifyMagicLink).mockResolvedValue({
      success: false,
      error: 'SERVER_ERROR',
    });

    const request = new Request('http://test.com/api/auth/verify-magic-link?token=error-token');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('SERVER_ERROR');
  });
});
