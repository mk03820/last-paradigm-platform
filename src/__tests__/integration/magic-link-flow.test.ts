/**
 * Magic Link Flow Integration Tests
 *
 * End-to-end integration tests for the magic link authentication flow.
 * Tests the complete flow: request -> email -> verify -> login
 *
 * Covers: Story 15.4 Task 6.6
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((column, value) => ({ type: 'eq', column, value })),
  and: vi.fn((...conditions) => ({ type: 'and', conditions })),
  lt: vi.fn((column, value) => ({ type: 'lt', column, value })),
  isNull: vi.fn((column) => ({ type: 'isNull', column })),
}));

vi.mock('@/lib/db/schema', () => ({
  magicLinks: {
    id: 'id',
    email: 'email',
    token: 'token',
    expiresAt: 'expires_at',
    usedAt: 'used_at',
    createdAt: 'created_at',
  },
  users: {
    id: 'id',
    email: 'email',
    name: 'name',
    emailVerified: 'email_verified',
    purchaseStatus: 'purchase_status',
    passwordHash: 'password_hash',
  },
}));

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ data: { id: 'email-id' } }),
    },
  })),
}));

vi.mock('jose', () => ({
  SignJWT: vi.fn().mockImplementation(() => ({
    setProtectedHeader: vi.fn().mockReturnThis(),
    setSubject: vi.fn().mockReturnThis(),
    setIssuedAt: vi.fn().mockReturnThis(),
    setExpirationTime: vi.fn().mockReturnThis(),
    sign: vi.fn().mockResolvedValue('mock-jwt-token'),
  })),
  jwtVerify: vi.fn().mockResolvedValue({
    payload: { sub: 'user-123', email: 'test@example.com' },
  }),
}));

// Set env vars before importing modules
process.env.NEXT_PUBLIC_APP_URL = 'https://lastparadigm.com';
process.env.JWT_SECRET = 'test-secret-min-32-characters-long';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-min-32-chars';
process.env.RESEND_API_KEY = 'test-resend-key';

import { db } from '@/lib/db';
import {
  createMagicLink,
  verifyMagicLink,
  findOrCreateUserByEmail,
  isRateLimited,
  buildMagicLinkUrl,
} from '@/lib/auth/magic-link';

describe('Magic Link Integration Flow', () => {
  const mockDb = db as unknown as {
    insert: ReturnType<typeof vi.fn>;
    select: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Complete Magic Link Flow', () => {
    it('should complete full flow: request -> create -> verify -> login', async () => {
      const testEmail = 'user@example.com';
      let storedToken: string | undefined;
      let storedExpiry: Date | undefined;

      // Step 1: Create magic link (mocked DB insert)
      mockDb.insert.mockReturnValue({
        values: vi.fn((data) => {
          storedToken = data.token;
          storedExpiry = data.expiresAt;
          return Promise.resolve(undefined);
        }),
      });

      const createResult = await createMagicLink(testEmail);
      expect(createResult.success).toBe(true);
      expect(createResult.token).toBeDefined();
      expect(storedToken).toBe(createResult.token);

      // Step 2: Build magic link URL
      const magicLinkUrl = buildMagicLinkUrl(createResult.token!, '/dashboard');
      expect(magicLinkUrl).toContain('token=');
      expect(magicLinkUrl).toContain('callbackUrl=');

      // Step 3: Verify magic link (mocked DB lookup)
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                id: 'ml-1',
                email: testEmail,
                token: storedToken,
                expiresAt: storedExpiry,
                usedAt: null,
              },
            ]),
          }),
        }),
      });

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{ id: 'ml-1' }]),
          }),
        }),
      });

      const verifyResult = await verifyMagicLink(createResult.token!);
      expect(verifyResult.success).toBe(true);
      expect(verifyResult.magicLink?.email).toBe(testEmail);

      // Step 4: Find or create user
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                id: 'user-123',
                email: testEmail,
                name: 'Test User',
                purchaseStatus: 'none',
                emailVerified: new Date(),
              },
            ]),
          }),
        }),
      });

      const user = await findOrCreateUserByEmail(testEmail);
      expect(user).toBeDefined();
      expect(user?.email).toBe(testEmail);
      expect(user?.isNewUser).toBe(false);
    });

    it('should create new user on first magic link login', async () => {
      const newEmail = 'newuser@example.com';

      // Create magic link
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      });

      const createResult = await createMagicLink(newEmail);
      expect(createResult.success).toBe(true);

      // User doesn't exist, should be created
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]), // No existing user
          }),
        }),
      });

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([
            {
              id: 'new-user-456',
              email: newEmail,
              name: null,
              purchaseStatus: 'none',
            },
          ]),
        }),
      });

      const user = await findOrCreateUserByEmail(newEmail);
      expect(user?.isNewUser).toBe(true);
      expect(user?.email).toBe(newEmail);
    });
  });

  describe('Expired Token Rejection', () => {
    it('should reject expired magic link', async () => {
      // Create a magic link that's already expired
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                id: 'ml-expired',
                email: 'user@example.com',
                token: 'expired-token',
                expiresAt: new Date(Date.now() - 60 * 60 * 1000), // Expired 1 hour ago
                usedAt: null,
              },
            ]),
          }),
        }),
      });

      const result = await verifyMagicLink('expired-token');

      expect(result.success).toBe(false);
      expect(result.error).toBe('EXPIRED');
    });

    it('should reject token that expires exactly at verification time', async () => {
      // Token expires right now
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                id: 'ml-boundary',
                email: 'user@example.com',
                token: 'boundary-token',
                expiresAt: new Date(Date.now() - 1), // Just expired
                usedAt: null,
              },
            ]),
          }),
        }),
      });

      const result = await verifyMagicLink('boundary-token');

      expect(result.success).toBe(false);
      expect(result.error).toBe('EXPIRED');
    });
  });

  describe('Used Token Rejection', () => {
    it('should reject already-used magic link', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                id: 'ml-used',
                email: 'user@example.com',
                token: 'used-token',
                expiresAt: new Date(Date.now() + 15 * 60 * 1000), // Not expired
                usedAt: new Date(Date.now() - 5 * 60 * 1000), // Used 5 minutes ago
              },
            ]),
          }),
        }),
      });

      const result = await verifyMagicLink('used-token');

      expect(result.success).toBe(false);
      expect(result.error).toBe('ALREADY_USED');
    });

    it('should mark token as used immediately after verification', async () => {
      let updateCalled = false;

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                id: 'ml-fresh',
                email: 'user@example.com',
                token: 'fresh-token',
                expiresAt: new Date(Date.now() + 15 * 60 * 1000),
                usedAt: null,
              },
            ]),
          }),
        }),
      });

      mockDb.update.mockReturnValue({
        set: vi.fn((data) => {
          expect(data.usedAt).toBeInstanceOf(Date);
          updateCalled = true;
          return {
            where: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue([{ id: 'ml-fresh' }]),
            }),
          };
        }),
      });

      const result = await verifyMagicLink('fresh-token');

      expect(result.success).toBe(true);
      expect(updateCalled).toBe(true);
    });
  });

  describe('Rate Limiting Enforcement', () => {
    beforeEach(() => {
      // Reset fake timers for fresh rate limit window
      vi.advanceTimersByTime(30 * 60 * 1000);
    });

    it('should allow 3 requests within window', () => {
      const email = 'ratelimit@example.com';

      expect(isRateLimited(email)).toBe(false);
      expect(isRateLimited(email)).toBe(false);
      expect(isRateLimited(email)).toBe(false);
    });

    it('should block 4th request within window', () => {
      const email = 'blocked@example.com';

      isRateLimited(email);
      isRateLimited(email);
      isRateLimited(email);

      expect(isRateLimited(email)).toBe(true);
    });

    it('should reset rate limit after 15 minute window', () => {
      const email = 'reset@example.com';

      // Use up all attempts
      isRateLimited(email);
      isRateLimited(email);
      isRateLimited(email);
      expect(isRateLimited(email)).toBe(true);

      // Advance 16 minutes
      vi.advanceTimersByTime(16 * 60 * 1000);

      // Should be allowed again
      expect(isRateLimited(email)).toBe(false);
    });

    it('should track rate limits per email independently', () => {
      const email1 = 'user1@example.com';
      const email2 = 'user2@example.com';

      // Max out email1
      isRateLimited(email1);
      isRateLimited(email1);
      isRateLimited(email1);
      expect(isRateLimited(email1)).toBe(true);

      // email2 should still be allowed
      expect(isRateLimited(email2)).toBe(false);
      expect(isRateLimited(email2)).toBe(false);
      expect(isRateLimited(email2)).toBe(false);
    });
  });

  describe('Security: Enumeration Prevention', () => {
    it('should return same success response for existing email', async () => {
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      });

      const result = await createMagicLink('existing@example.com');

      // Should succeed without revealing if email exists
      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();
    });

    it('should return same success response for non-existing email', async () => {
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      });

      const result = await createMagicLink('nonexistent@example.com');

      // Should succeed without revealing if email exists
      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle concurrent verification attempts', async () => {
      // First verification succeeds
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                id: 'ml-race',
                email: 'user@example.com',
                token: 'race-token',
                expiresAt: new Date(Date.now() + 15 * 60 * 1000),
                usedAt: null,
              },
            ]),
          }),
        }),
      });

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{ id: 'ml-race' }]),
          }),
        }),
      });

      const result1 = await verifyMagicLink('race-token');
      expect(result1.success).toBe(true);

      // Second verification should find token already used
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                id: 'ml-race',
                email: 'user@example.com',
                token: 'race-token',
                expiresAt: new Date(Date.now() + 15 * 60 * 1000),
                usedAt: new Date(), // Now marked as used
              },
            ]),
          }),
        }),
      });

      const result2 = await verifyMagicLink('race-token');
      expect(result2.success).toBe(false);
      expect(result2.error).toBe('ALREADY_USED');
    });

    it('should handle special characters in callback URL', () => {
      const token = 'test-token';
      const callbackUrl = '/path?param=value&other=123';

      const url = buildMagicLinkUrl(token, callbackUrl);

      expect(url).toContain('token=test-token');
      expect(url).toContain(encodeURIComponent(callbackUrl));
    });

    it('should handle empty callback URL', () => {
      const token = 'test-token';
      const url = buildMagicLinkUrl(token);

      expect(url).toContain('token=test-token');
      expect(url).not.toContain('callbackUrl');
    });
  });
});
