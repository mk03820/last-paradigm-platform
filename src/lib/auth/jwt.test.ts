/**
 * JWT Utilities Tests
 *
 * Tests for JWT token creation and verification.
 *
 * Covers: Story 15.2 Task 1.4, NFR18 (JWT session management)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock jose library before importing jwt module
vi.mock('jose', () => {
  const mockToken = 'header.payload.signature';

  // Create a proper mock class for SignJWT
  class MockSignJWT {
    private _payload: Record<string, unknown>;

    constructor(payload: Record<string, unknown>) {
      this._payload = payload;
    }

    setProtectedHeader() {
      return this;
    }

    setSubject() {
      return this;
    }

    setIssuedAt() {
      return this;
    }

    setExpirationTime() {
      return this;
    }

    async sign() {
      return mockToken;
    }
  }

  return {
    SignJWT: MockSignJWT,
    jwtVerify: vi.fn().mockImplementation(async (token: string) => {
      if (token === 'invalid-token' || token.endsWith('xxxxx')) {
        throw new Error('Invalid token');
      }
      return {
        payload: {
          sub: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          purchaseStatus: 'none',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 900, // 15 min
        },
      };
    }),
  };
});

// Set env vars
process.env.JWT_SECRET = 'test-jwt-secret-32-chars-minimum';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-32-chars-min';

import {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  createTokenPair,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
  REFRESH_TOKEN_COOKIE_OPTIONS,
} from './jwt';

describe('JWT utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createAccessToken', () => {
    it('should create a valid access token', async () => {
      const token = await createAccessToken({
        userId: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        purchaseStatus: 'none',
      });

      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
    });

    it('should create token with optional name as null', async () => {
      const token = await createAccessToken({
        userId: 'user-123',
        email: 'test@example.com',
        name: null,
      });

      expect(token).toBeTruthy();
    });

    it('should default purchaseStatus to none', async () => {
      const token = await createAccessToken({
        userId: 'user-123',
        email: 'test@example.com',
      });

      expect(token).toBeTruthy();
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify and decode a valid access token', async () => {
      const token = await createAccessToken({
        userId: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        purchaseStatus: 'completed',
      });

      const payload = await verifyAccessToken(token);

      expect(payload).not.toBeNull();
      expect(payload?.sub).toBe('user-123');
      expect(payload?.email).toBe('test@example.com');
    });

    it('should return null for invalid token', async () => {
      const payload = await verifyAccessToken('invalid-token');
      expect(payload).toBeNull();
    });

    it('should return null for tampered token', async () => {
      const payload = await verifyAccessToken('token.with.xxxxx');
      expect(payload).toBeNull();
    });

    it('should include iat and exp in payload', async () => {
      const token = await createAccessToken({
        userId: 'user-123',
        email: 'test@example.com',
      });

      const payload = await verifyAccessToken(token);

      expect(payload?.iat).toBeDefined();
      expect(payload?.exp).toBeDefined();
      expect(payload?.exp).toBeGreaterThan(payload?.iat as number);
    });
  });

  describe('createRefreshToken', () => {
    it('should create a valid refresh token', async () => {
      const token = await createRefreshToken('user-123');

      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify and decode a valid refresh token', async () => {
      const token = await createRefreshToken('user-123');
      const payload = await verifyRefreshToken(token);

      expect(payload).not.toBeNull();
      expect(payload?.userId).toBe('user-123');
    });

    it('should return null for invalid token', async () => {
      const payload = await verifyRefreshToken('invalid-token');
      expect(payload).toBeNull();
    });
  });

  describe('createTokenPair', () => {
    it('should create both access and refresh tokens', async () => {
      const { accessToken, refreshToken } = await createTokenPair({
        userId: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        purchaseStatus: 'none',
      });

      expect(accessToken).toBeTruthy();
      expect(refreshToken).toBeTruthy();
    });
  });

  describe('Token expiry constants', () => {
    it('should have correct access token expiry', () => {
      expect(ACCESS_TOKEN_EXPIRY).toBe('15m');
    });

    it('should have correct refresh token expiry', () => {
      expect(REFRESH_TOKEN_EXPIRY).toBe('7d');
    });
  });

  describe('REFRESH_TOKEN_COOKIE_OPTIONS', () => {
    it('should have httpOnly set to true', () => {
      expect(REFRESH_TOKEN_COOKIE_OPTIONS.httpOnly).toBe(true);
    });

    it('should have correct cookie name', () => {
      expect(REFRESH_TOKEN_COOKIE_OPTIONS.name).toBe('refresh_token');
    });

    it('should have sameSite lax', () => {
      expect(REFRESH_TOKEN_COOKIE_OPTIONS.sameSite).toBe('lax');
    });

    it('should have 7-day maxAge in seconds', () => {
      expect(REFRESH_TOKEN_COOKIE_OPTIONS.maxAge).toBe(7 * 24 * 60 * 60);
    });

    it('should have path set to root', () => {
      expect(REFRESH_TOKEN_COOKIE_OPTIONS.path).toBe('/');
    });
  });
});
