/**
 * Password Reset Service Tests
 *
 * Tests for password reset token creation, verification, and cleanup.
 *
 * Story 15.5: Password Reset Flow
 * Covers: Task 9.1, 9.2 - Unit tests for password reset APIs
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateResetToken,
  isResetRateLimited,
  buildResetUrl,
} from '@/lib/auth/password-reset';

// Mock the database module
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([{ id: 'test-user-id' }])),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => Promise.resolve()),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => ({
        returning: vi.fn(() => Promise.resolve([{ id: 'test-id' }])),
      })),
    })),
  },
}));

describe('Password Reset Service', () => {
  describe('generateResetToken', () => {
    it('should generate a token with sufficient entropy', () => {
      const token = generateResetToken();

      // Base64url encoded 32 bytes should be about 43 characters
      expect(token).toBeDefined();
      expect(token.length).toBeGreaterThan(20);
    });

    it('should generate unique tokens', () => {
      const token1 = generateResetToken();
      const token2 = generateResetToken();

      expect(token1).not.toBe(token2);
    });

    it('should generate URL-safe tokens', () => {
      const token = generateResetToken();

      // Base64url should not contain +, /, or =
      expect(token).not.toMatch(/[+/=]/);
    });
  });

  describe('isResetRateLimited', () => {
    beforeEach(() => {
      // Clear rate limit state between tests
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should allow first request', () => {
      const email = 'test1@example.com';
      const result = isResetRateLimited(email);

      expect(result).toBe(false);
    });

    it('should allow up to 5 requests per hour', () => {
      const email = 'test2@example.com';

      // First 5 requests should not be rate limited
      expect(isResetRateLimited(email)).toBe(false); // 1
      expect(isResetRateLimited(email)).toBe(false); // 2
      expect(isResetRateLimited(email)).toBe(false); // 3
      expect(isResetRateLimited(email)).toBe(false); // 4
      expect(isResetRateLimited(email)).toBe(false); // 5
    });

    it('should block after 5 requests', () => {
      const email = 'test3@example.com';

      // Make 5 requests
      for (let i = 0; i < 5; i++) {
        isResetRateLimited(email);
      }

      // 6th request should be blocked
      expect(isResetRateLimited(email)).toBe(true);
    });

    it('should reset rate limit after 1 hour', () => {
      const email = 'test4@example.com';

      // Make 5 requests
      for (let i = 0; i < 5; i++) {
        isResetRateLimited(email);
      }

      // Should be blocked
      expect(isResetRateLimited(email)).toBe(true);

      // Advance time by 1 hour + 1 second
      vi.advanceTimersByTime(60 * 60 * 1000 + 1000);

      // Should be allowed again
      expect(isResetRateLimited(email)).toBe(false);
    });

    it('should normalize email to lowercase', () => {
      const email1 = 'Test5@Example.COM';
      const email2 = 'test5@example.com';

      // Both should count against the same limit
      isResetRateLimited(email1);
      isResetRateLimited(email1);
      isResetRateLimited(email1);
      isResetRateLimited(email1);
      isResetRateLimited(email2); // 5th request

      // 6th request should be blocked
      expect(isResetRateLimited(email2)).toBe(true);
    });

    it('should track different emails separately', () => {
      const email1 = 'user1@example.com';
      const email2 = 'user2@example.com';

      // Exhaust rate limit for email1
      for (let i = 0; i < 5; i++) {
        isResetRateLimited(email1);
      }
      expect(isResetRateLimited(email1)).toBe(true);

      // email2 should still be allowed
      expect(isResetRateLimited(email2)).toBe(false);
    });
  });

  describe('buildResetUrl', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      vi.resetModules();
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should build URL with token', () => {
      process.env.NEXT_PUBLIC_APP_URL = 'https://example.com';

      const token = 'test-token-123';
      const url = buildResetUrl(token);

      expect(url).toBe('https://example.com/auth/reset-password?token=test-token-123');
    });

    it('should use localhost as default when env not set', () => {
      delete process.env.NEXT_PUBLIC_APP_URL;

      const token = 'test-token-456';
      const url = buildResetUrl(token);

      expect(url).toContain('localhost:3000');
      expect(url).toContain('token=test-token-456');
    });

    it('should URL-encode special characters in token', () => {
      process.env.NEXT_PUBLIC_APP_URL = 'https://example.com';

      const token = 'abc+def/ghi=jkl';
      const url = buildResetUrl(token);

      expect(url).toContain('token=');
      // URL should be properly encoded
      const parsedUrl = new URL(url);
      expect(parsedUrl.searchParams.get('token')).toBe(token);
    });
  });
});

describe('Password Reset Security', () => {
  describe('Token Generation', () => {
    it('should generate tokens with 256-bit entropy', () => {
      // Base64url encoding of 32 bytes (256 bits) produces ~43 characters
      const token = generateResetToken();

      // 32 bytes = 256 bits, base64url encodes to ceil(32/3)*4 = 44 chars, minus padding
      expect(token.length).toBeGreaterThanOrEqual(42);
    });

    it('should not generate predictable tokens', () => {
      const tokens = new Set<string>();

      // Generate 100 tokens and check uniqueness
      for (let i = 0; i < 100; i++) {
        const token = generateResetToken();
        expect(tokens.has(token)).toBe(false);
        tokens.add(token);
      }
    });
  });

  describe('Rate Limiting', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should prevent email bombing attacks', () => {
      const email = 'victim@example.com';

      // Attacker tries to spam reset requests
      for (let i = 0; i < 100; i++) {
        const isLimited = isResetRateLimited(email);
        if (i >= 5) {
          expect(isLimited).toBe(true);
        }
      }
    });
  });
});
