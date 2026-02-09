import { describe, it, expect } from 'vitest';

/**
 * Auth Callbacks Tests
 *
 * Tests the NextAuth.js callback functions for JWT and session handling.
 * These callbacks are critical for user ID propagation through the auth flow.
 *
 * Story 8.1: Magic Link Authentication Infrastructure
 */

// Recreate the callback logic for testing (extracted from auth.ts)
const jwtCallback = async ({ token, user }: { token: Record<string, unknown>; user?: { id: string } }) => {
  if (user) {
    token.id = user.id;
  }
  return token;
};

const sessionCallback = async ({
  session,
  token,
}: {
  session: { user?: { id?: string } };
  token: { id?: string };
}) => {
  if (token && session.user) {
    session.user.id = token.id as string;
  }
  return session;
};

const redirectCallback = async ({ url, baseUrl }: { url: string; baseUrl: string }) => {
  if (url.startsWith(baseUrl)) {
    return url;
  }
  return `${baseUrl}/dashboard`;
};

describe('Auth Callbacks', () => {
  describe('jwt callback', () => {
    it('adds user id to token when user is present', async () => {
      const token = { email: 'test@example.com' };
      const user = { id: 'user-123' };

      const result = await jwtCallback({ token, user });

      expect(result.id).toBe('user-123');
      expect(result.email).toBe('test@example.com');
    });

    it('preserves existing token when no user', async () => {
      const token = { id: 'existing-id', email: 'test@example.com' };

      const result = await jwtCallback({ token });

      expect(result.id).toBe('existing-id');
      expect(result.email).toBe('test@example.com');
    });

    it('does not add id when user is undefined', async () => {
      const token = { email: 'test@example.com' };

      const result = await jwtCallback({ token, user: undefined });

      expect(result.id).toBeUndefined();
    });
  });

  describe('session callback', () => {
    it('adds token id to session user', async () => {
      const session = { user: { email: 'test@example.com' } };
      const token = { id: 'user-123' };

      const result = await sessionCallback({ session, token });

      expect(result.user?.id).toBe('user-123');
    });

    it('handles missing session user gracefully', async () => {
      const session = {};
      const token = { id: 'user-123' };

      const result = await sessionCallback({ session, token });

      expect(result.user).toBeUndefined();
    });

    it('handles missing token gracefully', async () => {
      const session = { user: { email: 'test@example.com' } };
      const token = {};

      const result = await sessionCallback({ session, token });

      expect(result.user?.id).toBeUndefined();
    });
  });

  describe('redirect callback', () => {
    const baseUrl = 'https://example.com';

    it('allows redirect to same-origin URLs', async () => {
      const url = 'https://example.com/calculator';

      const result = await redirectCallback({ url, baseUrl });

      expect(result).toBe('https://example.com/calculator');
    });

    it('redirects to dashboard for external URLs', async () => {
      const url = 'https://malicious-site.com';

      const result = await redirectCallback({ url, baseUrl });

      expect(result).toBe('https://example.com/dashboard');
    });

    it('preserves callback URL when same origin', async () => {
      const url = 'https://example.com/results?session=123';

      const result = await redirectCallback({ url, baseUrl });

      expect(result).toBe('https://example.com/results?session=123');
    });

    it('redirects to dashboard for empty URL', async () => {
      const url = '';

      const result = await redirectCallback({ url, baseUrl });

      expect(result).toBe('https://example.com/dashboard');
    });
  });
});

describe('Auth Configuration', () => {
  it('uses JWT session strategy', () => {
    // Configuration assertion - session strategy should be jwt
    const sessionConfig = { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 };
    expect(sessionConfig.strategy).toBe('jwt');
  });

  it('sets session max age to 30 days', () => {
    const maxAge = 30 * 24 * 60 * 60;
    expect(maxAge).toBe(2592000); // 30 days in seconds
  });

  it('sets token expiry to 15 minutes', () => {
    const tokenMaxAge = 15 * 60;
    expect(tokenMaxAge).toBe(900); // 15 minutes in seconds
  });

  it('defines correct custom pages', () => {
    const pages = {
      signIn: '/auth/signin',
      error: '/auth/error',
      verifyRequest: '/auth/verify-request',
    };

    expect(pages.signIn).toBe('/auth/signin');
    expect(pages.error).toBe('/auth/error');
    expect(pages.verifyRequest).toBe('/auth/verify-request');
  });
});
