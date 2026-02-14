/**
 * Magic Link Service Tests
 *
 * Tests for token generation, rate limiting, and verification logic.
 *
 * Covers: Story 15.4 Task 1.8, Task 2.10
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  generateMagicLinkToken,
  isRateLimited,
  getRateLimitRemaining,
  buildMagicLinkUrl,
} from '@/lib/auth/magic-link';

// Mock environment variables
vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://lastparadigm.com');

describe('Magic Link Service', () => {
  beforeEach(() => {
    // Reset rate limiting between tests by advancing time
    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 20 * 60 * 1000); // Advance 20 minutes
    vi.useRealTimers();
  });

  describe('generateMagicLinkToken', () => {
    it('generates a token of expected length', () => {
      const token = generateMagicLinkToken();
      // 32 bytes base64url encoded = approximately 43 characters
      expect(token.length).toBeGreaterThanOrEqual(40);
    });

    it('generates unique tokens', () => {
      const tokens = new Set<string>();
      for (let i = 0; i < 100; i++) {
        tokens.add(generateMagicLinkToken());
      }
      expect(tokens.size).toBe(100);
    });

    it('generates URL-safe tokens (base64url)', () => {
      const token = generateMagicLinkToken();
      // base64url should not contain +, /, or =
      expect(token).not.toMatch(/[+/=]/);
      // Should only contain base64url characters
      expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it('generates tokens with sufficient entropy', () => {
      const token = generateMagicLinkToken();
      // 32 bytes = 256 bits, base64 encodes ~6 bits per char
      // So we expect at least 42 characters (256/6 = 42.67)
      expect(token.length).toBeGreaterThanOrEqual(42);
    });
  });

  describe('isRateLimited', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(Date.now() + 30 * 60 * 1000); // Fresh time window
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('allows first request', () => {
      const email = 'test@example.com';
      expect(isRateLimited(email)).toBe(false);
    });

    it('allows up to 3 requests', () => {
      const email = 'limit-test@example.com';
      expect(isRateLimited(email)).toBe(false);
      expect(isRateLimited(email)).toBe(false);
      expect(isRateLimited(email)).toBe(false);
    });

    it('blocks 4th request within window', () => {
      const email = 'blocked@example.com';
      isRateLimited(email); // 1
      isRateLimited(email); // 2
      isRateLimited(email); // 3
      expect(isRateLimited(email)).toBe(true); // 4th should be blocked
    });

    it('normalizes email to lowercase', () => {
      const email1 = 'Test@Example.Com';
      const email2 = 'test@example.com';

      isRateLimited(email1);
      isRateLimited(email2);
      isRateLimited(email1);

      // All 3 should count as same email
      expect(isRateLimited(email2)).toBe(true);
    });

    it('resets after 15 minute window', () => {
      const email = 'reset-test@example.com';
      isRateLimited(email);
      isRateLimited(email);
      isRateLimited(email);
      expect(isRateLimited(email)).toBe(true);

      // Advance time by 16 minutes
      vi.advanceTimersByTime(16 * 60 * 1000);

      expect(isRateLimited(email)).toBe(false);
    });

    it('tracks different emails independently', () => {
      const email1 = 'user1@example.com';
      const email2 = 'user2@example.com';

      // Max out email1
      isRateLimited(email1);
      isRateLimited(email1);
      isRateLimited(email1);
      expect(isRateLimited(email1)).toBe(true);

      // email2 should still work
      expect(isRateLimited(email2)).toBe(false);
    });
  });

  describe('getRateLimitRemaining', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(Date.now() + 60 * 60 * 1000); // Fresh time window
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns 3 for new email', () => {
      const email = 'new-user@example.com';
      expect(getRateLimitRemaining(email)).toBe(3);
    });

    it('decrements correctly', () => {
      const email = 'decrement-test@example.com';
      expect(getRateLimitRemaining(email)).toBe(3);

      isRateLimited(email);
      expect(getRateLimitRemaining(email)).toBe(2);

      isRateLimited(email);
      expect(getRateLimitRemaining(email)).toBe(1);

      isRateLimited(email);
      expect(getRateLimitRemaining(email)).toBe(0);
    });

    it('returns 0 when exhausted', () => {
      const email = 'exhausted@example.com';
      isRateLimited(email);
      isRateLimited(email);
      isRateLimited(email);

      expect(getRateLimitRemaining(email)).toBe(0);
    });
  });

  describe('buildMagicLinkUrl', () => {
    it('builds URL with token', () => {
      const token = 'test-token-123';
      const url = buildMagicLinkUrl(token);

      expect(url).toBe('https://lastparadigm.com/verify-magic-link?token=test-token-123');
    });

    it('includes callback URL when provided', () => {
      const token = 'test-token-456';
      const callbackUrl = '/dashboard/settings';
      const url = buildMagicLinkUrl(token, callbackUrl);

      expect(url).toContain('token=test-token-456');
      expect(url).toContain('callbackUrl=%2Fdashboard%2Fsettings');
    });

    it('handles special characters in callback URL', () => {
      const token = 'abc123';
      const callbackUrl = '/path?param=value&other=123';
      const url = buildMagicLinkUrl(token, callbackUrl);

      expect(url).toContain('callbackUrl=');
      expect(url).toContain(encodeURIComponent(callbackUrl));
    });
  });
});
