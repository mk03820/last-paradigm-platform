/**
 * Tests for Session Recovery API
 *
 * Story 15.8: Pre-Account Results Preservation
 * Covers: AC5, AC6, AC9 (token validation, expiry check)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

// Create chainable mock functions
const mockLimit = vi.fn();
const mockWhere = vi.fn(() => ({ limit: mockLimit }));
const mockFrom = vi.fn(() => ({ where: mockWhere }));

const mockUpdateWhere = vi.fn(() => Promise.resolve(undefined));
const mockSet = vi.fn(() => ({ where: mockUpdateWhere }));

// Mock db
vi.mock('@/lib/db', () => ({
  db: {
    select: () => ({ from: mockFrom }),
    update: () => ({ set: mockSet }),
  },
}));

describe('/api/session/recover', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Valid UUID v4 test tokens
  const VALID_TOKEN = '550e8400-e29b-41d4-a716-446655440000';
  const EXPIRED_TOKEN = '550e8400-e29b-41d4-a716-446655440001';
  const USED_TOKEN = '550e8400-e29b-41d4-a716-446655440002';
  const UNKNOWN_TOKEN = '550e8400-e29b-41d4-a716-446655440003';
  const INVALID_FORMAT_TOKEN = 'invalid-token-format';

  const validSessionData = {
    preservedAt: '2024-01-01T00:00:00.000Z',
    tool1: { scores: { strategic: 3 } },
    tool2: { inputs: { meetingCount: 10 } },
  };

  const createRequest = (token: string | null) => {
    const url = token
      ? `http://localhost/api/session/recover?token=${token}`
      : 'http://localhost/api/session/recover';
    return new Request(url, { method: 'GET' });
  };

  describe('GET /api/session/recover', () => {
    it('should return 400 for missing token', async () => {
      const request = createRequest(null);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_TOKEN');
    });

    it('should return 400 for invalid token format', async () => {
      const request = createRequest(INVALID_FORMAT_TOKEN);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_TOKEN');
    });

    it('should return 404 for unknown token', async () => {
      mockLimit.mockResolvedValue([]);

      const request = createRequest(UNKNOWN_TOKEN);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_TOKEN');
    });

    it('should return 410 for expired token (AC9)', async () => {
      const expiredSession = {
        id: 'session-id',
        token: EXPIRED_TOKEN,
        email: 'test@example.com',
        sessionData: validSessionData,
        expiresAt: new Date('2020-01-01'), // Past date
        createdAt: new Date('2019-12-25'),
        usedAt: null,
      };
      mockLimit.mockResolvedValue([expiredSession]);

      const request = createRequest(EXPIRED_TOKEN);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(410);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('EXPIRED');
      expect(data.error.message).toContain('expired');
    });

    it('should return session data for valid token (AC5)', async () => {
      const validSession = {
        id: 'session-id',
        token: VALID_TOKEN,
        email: 'test@example.com',
        sessionData: validSessionData,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        createdAt: new Date(),
        usedAt: null,
      };
      mockLimit.mockResolvedValue([validSession]);
      mockUpdateWhere.mockResolvedValue(undefined);

      const request = createRequest(VALID_TOKEN);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(validSessionData);
    });

    it('should update usedAt timestamp on successful recovery', async () => {
      const validSession = {
        id: 'session-id',
        token: VALID_TOKEN,
        email: 'test@example.com',
        sessionData: validSessionData,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        usedAt: null,
      };
      mockLimit.mockResolvedValue([validSession]);
      mockUpdateWhere.mockResolvedValue(undefined);

      const request = createRequest(VALID_TOKEN);

      await GET(request);

      // Should have called update to set usedAt
      expect(mockSet).toHaveBeenCalled();
    });

    it('should return session data even if already used (AC6 - any device)', async () => {
      // Session was used before but is still valid
      const usedSession = {
        id: 'session-id',
        token: USED_TOKEN,
        email: 'test@example.com',
        sessionData: validSessionData,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        usedAt: new Date(), // Previously used
      };
      mockLimit.mockResolvedValue([usedSession]);
      mockUpdateWhere.mockResolvedValue(undefined);

      const request = createRequest(USED_TOKEN);

      const response = await GET(request);
      const data = await response.json();

      // Should still work - links can be used multiple times until expired
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should return 500 on database error', async () => {
      mockLimit.mockRejectedValue(new Error('DB connection failed'));

      const request = createRequest(VALID_TOKEN);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('SERVER_ERROR');
    });
  });
});
