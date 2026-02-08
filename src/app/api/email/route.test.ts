import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock the database before importing the route
vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    }),
  },
}));

// Import after mocking
import { POST } from './route';
import { db } from '@/lib/db';

// Helper to create a mock NextRequest with JSON body
function createMockRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

// Helper to create a mock request with invalid JSON
function createInvalidJsonRequest(): NextRequest {
  return new NextRequest('http://localhost:3000/api/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: 'not valid json',
  });
}

describe('POST /api/email', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock to successful insert
    (db.insert as ReturnType<typeof vi.fn>).mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    });
  });

  describe('Input Validation', () => {
    it('should return 400 for invalid JSON', async () => {
      const request = createInvalidJsonRequest();
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_JSON');
    });

    it('should return 400 when email is missing', async () => {
      const request = createMockRequest({});
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_EMAIL');
    });

    it('should return 400 for empty email', async () => {
      const request = createMockRequest({ email: '' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_EMAIL');
    });

    it('should return 400 for whitespace-only email', async () => {
      const request = createMockRequest({ email: '   ' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_EMAIL');
    });

    it('should return 400 for invalid email format', async () => {
      const request = createMockRequest({ email: 'not-an-email' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_EMAIL');
    });

    it('should return 400 for email without domain', async () => {
      const request = createMockRequest({ email: 'test@' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_EMAIL');
    });

    it('should return 400 for email without @ symbol', async () => {
      const request = createMockRequest({ email: 'testexample.com' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_EMAIL');
    });

    it('should return 400 for email that is too long', async () => {
      const longEmail = 'a'.repeat(250) + '@test.com';
      const request = createMockRequest({ email: longEmail });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_EMAIL');
    });
  });

  describe('Successful Email Registration', () => {
    it('should return 200 with success message for valid email', async () => {
      const request = createMockRequest({ email: 'test@example.com' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.message).toBe('Email registered successfully');
    });

    it('should accept email with subdomains', async () => {
      const request = createMockRequest({ email: 'test@mail.example.com' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should accept email with plus addressing', async () => {
      const request = createMockRequest({ email: 'test+tag@example.com' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should trim whitespace from email', async () => {
      const insertValues = vi.fn().mockResolvedValue(undefined);
      (db.insert as ReturnType<typeof vi.fn>).mockReturnValue({
        values: insertValues,
      });

      const request = createMockRequest({ email: '  test@example.com  ' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      // Email should be trimmed and lowercased
      expect(insertValues).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
        })
      );
    });

    it('should lowercase email before storing', async () => {
      const insertValues = vi.fn().mockResolvedValue(undefined);
      (db.insert as ReturnType<typeof vi.fn>).mockReturnValue({
        values: insertValues,
      });

      const request = createMockRequest({ email: 'TEST@EXAMPLE.COM' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(insertValues).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
        })
      );
    });

    it('should accept optional source parameter', async () => {
      const insertValues = vi.fn().mockResolvedValue(undefined);
      (db.insert as ReturnType<typeof vi.fn>).mockReturnValue({
        values: insertValues,
      });

      const request = createMockRequest({
        email: 'test@example.com',
        source: 'landing-page',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(insertValues).toHaveBeenCalledWith(
        expect.objectContaining({
          source: 'landing-page',
        })
      );
    });

    it('should use default source when not provided', async () => {
      const insertValues = vi.fn().mockResolvedValue(undefined);
      (db.insert as ReturnType<typeof vi.fn>).mockReturnValue({
        values: insertValues,
      });

      const request = createMockRequest({ email: 'test@example.com' });
      await POST(request);

      expect(insertValues).toHaveBeenCalledWith(
        expect.objectContaining({
          source: 'meeting-audit-results',
        })
      );
    });
  });

  describe('Duplicate Email Handling', () => {
    it('should return success for duplicate email (privacy protection)', async () => {
      // Simulate unique constraint violation
      const uniqueViolationError = new Error('duplicate key value') as Error & {
        code: string;
      };
      uniqueViolationError.code = '23505';

      (db.insert as ReturnType<typeof vi.fn>).mockReturnValue({
        values: vi.fn().mockRejectedValue(uniqueViolationError),
      });

      const request = createMockRequest({ email: 'existing@example.com' });
      const response = await POST(request);
      const data = await response.json();

      // Should return success to not reveal email exists
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.message).toBe('Email registered successfully');
    });
  });

  describe('Response Format', () => {
    it('should return proper success response structure', async () => {
      const request = createMockRequest({ email: 'test@example.com' });
      const response = await POST(request);
      const data = await response.json();

      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('message');
    });

    it('should return proper error response structure', async () => {
      const request = createMockRequest({ email: 'invalid' });
      const response = await POST(request);
      const data = await response.json();

      expect(data).toHaveProperty('success', false);
      expect(data).toHaveProperty('error');
      expect(data.error).toHaveProperty('code');
      expect(data.error).toHaveProperty('message');
    });
  });
});
