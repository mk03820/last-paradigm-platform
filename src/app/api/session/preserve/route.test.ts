/**
 * Tests for Session Preservation API
 *
 * Story 15.8: Pre-Account Results Preservation
 * Covers: AC2, AC3, AC8 (token generation, upsert, validation)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

// Create chainable mock functions
const mockLimit = vi.fn();
const mockWhere = vi.fn(() => ({ limit: mockLimit }));
const mockFrom = vi.fn(() => ({ where: mockWhere, limit: mockLimit }));
const mockSelect = vi.fn(() => ({ from: mockFrom }));

const mockValues = vi.fn(() => Promise.resolve(undefined));
const mockInsert = vi.fn(() => ({ values: mockValues }));

const mockSetWhere = vi.fn(() => Promise.resolve(undefined));
const mockSet = vi.fn(() => ({ where: mockSetWhere }));
const mockUpdate = vi.fn(() => ({ set: mockSet }));

// Mock db
vi.mock('@/lib/db', () => ({
  db: {
    select: () => ({ from: mockFrom }),
    insert: () => ({ values: mockValues }),
    update: () => ({ set: mockSet }),
  },
}));

// Mock email sending
vi.mock('@/lib/email/send-save-results-email', () => ({
  sendSaveResultsEmail: vi.fn().mockResolvedValue({ success: true }),
}));

import { sendSaveResultsEmail } from '@/lib/email/send-save-results-email';

describe('/api/session/preserve', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validSessionData = {
    preservedAt: new Date().toISOString(),
    tool1: { scores: { strategic: 3 } },
    tool2: { inputs: { meetingCount: 10 } },
  };

  const createRequest = (body: object) => {
    return new Request('http://localhost/api/session/preserve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  };

  describe('POST /api/session/preserve', () => {
    it('should return 400 for invalid email', async () => {
      const request = createRequest({
        email: 'invalid-email',
        sessionData: validSessionData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_EMAIL');
    });

    it('should return 400 for missing email', async () => {
      const request = createRequest({
        sessionData: validSessionData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should return 400 for invalid session data', async () => {
      const request = createRequest({
        email: 'test@example.com',
        sessionData: { invalid: 'data' }, // Missing preservedAt
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should create new preserved session for new email', async () => {
      mockLimit.mockResolvedValue([]);
      mockValues.mockResolvedValue(undefined);

      const request = createRequest({
        email: 'new@example.com',
        sessionData: validSessionData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('Recovery link sent');
      expect(sendSaveResultsEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'new@example.com',
        })
      );
    });

    it('should update existing session for same email (AC8)', async () => {
      // Existing session found
      mockLimit.mockResolvedValue([
        { id: 'existing-id', email: 'existing@example.com' },
      ]);
      mockSetWhere.mockResolvedValue(undefined);

      const request = createRequest({
        email: 'existing@example.com',
        sessionData: validSessionData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should normalize email to lowercase', async () => {
      mockLimit.mockResolvedValue([]);
      mockValues.mockResolvedValue(undefined);

      const request = createRequest({
        email: 'Test@EXAMPLE.com',
        sessionData: validSessionData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(sendSaveResultsEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
        })
      );
    });

    it('should still succeed if email sending fails', async () => {
      mockLimit.mockResolvedValue([]);
      mockValues.mockResolvedValue(undefined);
      vi.mocked(sendSaveResultsEmail).mockResolvedValue({
        success: false,
        error: 'Email failed',
      });

      const request = createRequest({
        email: 'test@example.com',
        sessionData: validSessionData,
      });

      const response = await POST(request);
      const data = await response.json();

      // Should still return success since session was saved
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should return 400 for empty request body', async () => {
      const request = new Request('http://localhost/api/session/preserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should return 500 on database error', async () => {
      mockLimit.mockRejectedValue(new Error('DB connection failed'));

      const request = createRequest({
        email: 'test@example.com',
        sessionData: validSessionData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('SERVER_ERROR');
    });
  });
});
