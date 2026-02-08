import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/email/route';

// Mock the database module
vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    }),
  },
}));

vi.mock('@/lib/db/schema', () => ({
  emails: {},
}));

// Helper to create a mock NextRequest with JSON body
function createMockRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/email', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// Helper to create request with invalid JSON
function createInvalidJsonRequest(): NextRequest {
  return new NextRequest('http://localhost:3000/api/email', {
    method: 'POST',
    body: 'not valid json',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

describe('POST /api/email', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('successful email submission', () => {
    it('should return success response for valid email', async () => {
      const request = createMockRequest({
        email: 'test@example.com',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.message).toBe('Email registered successfully');
    });

    it('should accept email with source field', async () => {
      const request = createMockRequest({
        email: 'user@domain.org',
        source: 'meeting-audit-results',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should trim whitespace from email', async () => {
      const request = createMockRequest({
        email: '  spaced@example.com  ',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('validation errors', () => {
    it('should return 400 for missing email', async () => {
      const request = createMockRequest({});

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_EMAIL');
    });

    it('should return 400 for empty email', async () => {
      const request = createMockRequest({
        email: '',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_EMAIL');
    });

    it('should return 400 for invalid email format', async () => {
      const request = createMockRequest({
        email: 'not-an-email',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_EMAIL');
      expect(data.error.message).toContain('valid email');
    });

    it('should return 400 for email without domain', async () => {
      const request = createMockRequest({
        email: 'user@',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should return 400 for invalid JSON', async () => {
      const request = createInvalidJsonRequest();

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_JSON');
    });

    it('should return 400 for email too long', async () => {
      const request = createMockRequest({
        email: 'a'.repeat(250) + '@example.com',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe('duplicate email handling', () => {
    it('should return success for duplicate email (privacy protection)', async () => {
      // Mock the database to throw a unique constraint error
      const { db } = await import('@/lib/db');
      const uniqueError = Object.assign(new Error('duplicate key'), { code: '23505' });
      (db.insert as ReturnType<typeof vi.fn>).mockReturnValue({
        values: vi.fn().mockRejectedValue(uniqueError),
      });

      const request = createMockRequest({
        email: 'existing@example.com',
      });

      const response = await POST(request);
      const data = await response.json();

      // Should return success to not reveal email exists
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.message).toBe('Email registered successfully');
    });
  });

  describe('response format', () => {
    it('should match expected success response format', async () => {
      const request = createMockRequest({
        email: 'format@example.com',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data).toEqual({
        success: true,
        data: {
          message: 'Email registered successfully',
        },
      });
    });

    it('should match expected error response format', async () => {
      const request = createMockRequest({
        email: 'invalid',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data).toMatchObject({
        success: false,
        error: {
          code: expect.any(String),
          message: expect.any(String),
        },
      });
    });
  });
});
