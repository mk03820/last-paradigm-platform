/**
 * Forgot Password API Route Tests
 *
 * Tests for the forgot password endpoint including validation,
 * rate limiting, and email enumeration prevention.
 *
 * Story 15.5: Password Reset Flow
 * Covers: Task 9.1 - Unit tests for forgot-password API
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock dependencies before importing the route
const mockCreatePasswordReset = vi.fn();
const mockIsResetRateLimited = vi.fn();
const mockBuildResetUrl = vi.fn();
const mockSendEmail = vi.fn();

vi.mock('@/lib/auth/password-reset', () => ({
  createPasswordReset: (...args: unknown[]) => mockCreatePasswordReset(...args),
  isResetRateLimited: (...args: unknown[]) => mockIsResetRateLimited(...args),
  buildResetUrl: (...args: unknown[]) => mockBuildResetUrl(...args),
}));

vi.mock('@/lib/email/templates/password-reset', () => ({
  generatePasswordResetEmail: vi.fn(() => ({
    subject: 'Reset Your Password',
    text: 'Reset link text',
    html: '<html>Reset link</html>',
  })),
}));

vi.mock('resend', () => ({
  Resend: class {
    emails = {
      send: (...args: unknown[]) => mockSendEmail(...args),
    };
  },
}));

// Import after mocking
import { POST } from '@/app/api/auth/forgot-password/route';

function createMockRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

describe('POST /api/auth/forgot-password', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = 'test-api-key';
    process.env.NEXT_PUBLIC_APP_URL = 'https://example.com';

    // Default mock implementations
    mockIsResetRateLimited.mockReturnValue(false);
    mockBuildResetUrl.mockReturnValue('https://example.com/auth/reset-password?token=test');
    mockSendEmail.mockResolvedValue({ id: 'msg_123' });
  });

  afterEach(() => {
    delete process.env.RESEND_API_KEY;
    delete process.env.NEXT_PUBLIC_APP_URL;
  });

  describe('Validation', () => {
    it('should reject request with missing email', async () => {
      const request = createMockRequest({});

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject request with invalid email format', async () => {
      const request = createMockRequest({ email: 'not-an-email' });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should accept valid email', async () => {
      mockCreatePasswordReset.mockResolvedValue({ success: true });

      const request = createMockRequest({ email: 'user@example.com' });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('Rate Limiting (Task 1.7)', () => {
    it('should return success when rate limited (prevent enumeration)', async () => {
      mockIsResetRateLimited.mockReturnValue(true);

      const request = createMockRequest({ email: 'user@example.com' });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('If an account exists');
    });

    it('should not create token when rate limited', async () => {
      mockIsResetRateLimited.mockReturnValue(true);

      const request = createMockRequest({ email: 'user@example.com' });

      await POST(request);

      expect(mockCreatePasswordReset).not.toHaveBeenCalled();
    });
  });

  describe('Email Enumeration Prevention (AC8)', () => {
    it('should return same success message for existing user', async () => {
      mockCreatePasswordReset.mockResolvedValue({
        success: true,
        token: 'test-token-123',
      });

      const request = createMockRequest({ email: 'existing@example.com' });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('If an account exists with this email, you will receive a password reset link.');
    });

    it('should return same success message for non-existing user', async () => {
      // User doesn't exist - no token returned
      mockCreatePasswordReset.mockResolvedValue({ success: true });

      const request = createMockRequest({ email: 'nonexistent@example.com' });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('If an account exists with this email, you will receive a password reset link.');
    });
  });

  describe('Token Creation', () => {
    it('should call createPasswordReset with normalized email', async () => {
      mockCreatePasswordReset.mockResolvedValue({ success: true });

      // Use simple lowercase email since Zod validates before our normalization
      const request = createMockRequest({ email: 'USER@EXAMPLE.COM' });

      await POST(request);

      expect(mockCreatePasswordReset).toHaveBeenCalledWith('user@example.com');
    });
  });

  describe('Email Sending', () => {
    it('should send email when user exists and token created', async () => {
      mockCreatePasswordReset.mockResolvedValue({
        success: true,
        token: 'test-token-123',
      });

      const request = createMockRequest({ email: 'user@example.com' });

      await POST(request);

      expect(mockBuildResetUrl).toHaveBeenCalledWith('test-token-123');
      expect(mockSendEmail).toHaveBeenCalled();
    });

    it('should not send email when user does not exist', async () => {
      // No token means user doesn't exist
      mockCreatePasswordReset.mockResolvedValue({ success: true });

      const request = createMockRequest({ email: 'nonexistent@example.com' });

      await POST(request);

      // buildResetUrl should not be called if there's no token
      expect(mockBuildResetUrl).not.toHaveBeenCalled();
      expect(mockSendEmail).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle email send errors gracefully', async () => {
      mockCreatePasswordReset.mockResolvedValue({
        success: true,
        token: 'test-token-123',
      });
      mockSendEmail.mockRejectedValue(new Error('Email service error'));

      const request = createMockRequest({ email: 'user@example.com' });

      // Should still return success (don't reveal email failure)
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should return 500 for unexpected errors', async () => {
      mockCreatePasswordReset.mockRejectedValue(new Error('Database error'));

      const request = createMockRequest({ email: 'user@example.com' });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('SERVER_ERROR');
    });
  });
});
