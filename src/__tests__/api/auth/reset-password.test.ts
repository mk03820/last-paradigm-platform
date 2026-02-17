/**
 * Reset Password API Route Tests
 *
 * Tests for the reset password endpoint including validation,
 * token verification, password updates, and auto-login.
 *
 * Story 15.5: Password Reset Flow
 * Covers: Task 9.2 - Unit tests for reset-password API
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock all dependencies
vi.mock('@/lib/db', () => ({
  db: {
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(),
        })),
      })),
    })),
  },
}));

vi.mock('@/lib/auth/password-reset', () => ({
  verifyPasswordReset: vi.fn(),
  markResetUsed: vi.fn(),
  invalidateAllUserResets: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  hashPassword: vi.fn(),
  validatePassword: vi.fn(),
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

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => Promise.resolve({
    set: vi.fn(),
  })),
}));

// Import after mocking
import { POST } from '@/app/api/auth/reset-password/route';
import { verifyPasswordReset, markResetUsed, invalidateAllUserResets } from '@/lib/auth/password-reset';
import { hashPassword, validatePassword, createTokenPair } from '@/lib/auth';
import { db } from '@/lib/db';

function createMockRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

describe('POST /api/auth/reset-password', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'test-jwt-secret-at-least-32-characters-long';

    // Default mock implementations
    vi.mocked(validatePassword).mockReturnValue({ valid: true, errors: [] });
    vi.mocked(hashPassword).mockResolvedValue('$2b$12$hashedpassword');
    vi.mocked(createTokenPair).mockResolvedValue({
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
    });
    vi.mocked(markResetUsed).mockResolvedValue(true);
    vi.mocked(invalidateAllUserResets).mockResolvedValue(true);
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  describe('Validation', () => {
    it('should reject request with missing token', async () => {
      const request = createMockRequest({ password: 'NewPassword123' });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject request with missing password', async () => {
      const request = createMockRequest({ token: 'valid-token' });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject password shorter than 8 characters', async () => {
      const request = createMockRequest({ token: 'valid-token', password: 'short' });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe('Password Validation (AC3)', () => {
    it('should reject password without number', async () => {
      vi.mocked(validatePassword).mockReturnValue({
        valid: false,
        errors: ['Password must contain at least one number'],
      });

      const request = createMockRequest({ token: 'valid-token', password: 'NoNumbers' });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_PASSWORD');
    });

    it('should accept valid password meeting requirements', async () => {
      vi.mocked(validatePassword).mockReturnValue({ valid: true, errors: [] });
      vi.mocked(verifyPasswordReset).mockResolvedValue({
        success: true,
        userId: 'test-user-id',
      });

      // Mock db.update to return a user
      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{
              id: 'test-user-id',
              email: 'user@example.com',
              name: 'Test User',
              purchaseStatus: 'none',
            }]),
          }),
        }),
      } as unknown as ReturnType<typeof db.update>);

      const request = createMockRequest({ token: 'valid-token', password: 'ValidPass123' });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('Token Verification', () => {
    it('should reject invalid token (AC2)', async () => {
      vi.mocked(verifyPasswordReset).mockResolvedValue({
        success: false,
        error: 'INVALID_TOKEN',
      });

      const request = createMockRequest({ token: 'invalid-token', password: 'ValidPass123' });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_TOKEN');
      expect(data.error.message).toBe('This reset link is invalid.');
    });

    it('should reject expired token (AC6)', async () => {
      vi.mocked(verifyPasswordReset).mockResolvedValue({
        success: false,
        error: 'EXPIRED',
      });

      const request = createMockRequest({ token: 'expired-token', password: 'ValidPass123' });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('EXPIRED');
      expect(data.error.message).toContain('expired');
    });

    it('should reject already used token (AC7)', async () => {
      vi.mocked(verifyPasswordReset).mockResolvedValue({
        success: false,
        error: 'ALREADY_USED',
      });

      const request = createMockRequest({ token: 'used-token', password: 'ValidPass123' });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('ALREADY_USED');
      expect(data.error.message).toContain('already been used');
    });
  });

  describe('Password Update (AC3)', () => {
    beforeEach(() => {
      vi.mocked(verifyPasswordReset).mockResolvedValue({
        success: true,
        userId: 'test-user-id',
      });

      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{
              id: 'test-user-id',
              email: 'user@example.com',
              name: 'Test User',
              purchaseStatus: 'none',
            }]),
          }),
        }),
      } as unknown as ReturnType<typeof db.update>);
    });

    it('should hash password with bcrypt', async () => {
      const request = createMockRequest({ token: 'valid-token', password: 'NewPassword123' });

      await POST(request);

      expect(hashPassword).toHaveBeenCalledWith('NewPassword123');
    });

    it('should mark token as used after successful reset', async () => {
      const request = createMockRequest({ token: 'valid-token', password: 'NewPassword123' });

      await POST(request);

      expect(markResetUsed).toHaveBeenCalledWith('valid-token');
    });

    it('should invalidate all other pending tokens (Task 3.10)', async () => {
      const request = createMockRequest({ token: 'valid-token', password: 'NewPassword123' });

      await POST(request);

      expect(invalidateAllUserResets).toHaveBeenCalledWith('test-user-id');
    });
  });

  describe('Auto-Login (AC4)', () => {
    beforeEach(() => {
      vi.mocked(verifyPasswordReset).mockResolvedValue({
        success: true,
        userId: 'test-user-id',
      });

      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{
              id: 'test-user-id',
              email: 'user@example.com',
              name: 'Test User',
              purchaseStatus: 'none',
            }]),
          }),
        }),
      } as unknown as ReturnType<typeof db.update>);
    });

    it('should create JWT tokens after successful reset', async () => {
      const request = createMockRequest({ token: 'valid-token', password: 'NewPassword123' });

      await POST(request);

      expect(createTokenPair).toHaveBeenCalledWith({
        userId: 'test-user-id',
        email: 'user@example.com',
        name: 'Test User',
        purchaseStatus: 'none',
      });
    });

    it('should return access token in response', async () => {
      const request = createMockRequest({ token: 'valid-token', password: 'NewPassword123' });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.accessToken).toBe('test-access-token');
    });

    it('should return user data in response', async () => {
      const request = createMockRequest({ token: 'valid-token', password: 'NewPassword123' });

      const response = await POST(request);
      const data = await response.json();

      expect(data.data.user).toEqual({
        id: 'test-user-id',
        email: 'user@example.com',
        name: 'Test User',
      });
    });
  });

  describe('Error Handling', () => {
    it('should return 500 for database errors', async () => {
      vi.mocked(verifyPasswordReset).mockResolvedValue({
        success: true,
        userId: 'test-user-id',
      });

      vi.mocked(db.update).mockImplementation(() => {
        throw new Error('Database error');
      });

      const request = createMockRequest({ token: 'valid-token', password: 'NewPassword123' });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('SERVER_ERROR');
    });

    it('should handle user not found after verification', async () => {
      vi.mocked(verifyPasswordReset).mockResolvedValue({
        success: true,
        userId: 'test-user-id',
      });

      // Return empty array (user not found)
      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as unknown as ReturnType<typeof db.update>);

      const request = createMockRequest({ token: 'valid-token', password: 'NewPassword123' });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('USER_NOT_FOUND');
    });
  });
});
