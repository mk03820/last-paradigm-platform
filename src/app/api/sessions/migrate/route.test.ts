import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

// Mock auth
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

// Mock db
vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn(),
  },
}));

import { auth } from '@/auth';
import { db } from '@/lib/db';

describe('POST /api/sessions/migrate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = (body: object) => {
    return new NextRequest('http://localhost/api/sessions/migrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  };

  const validMeetingData = {
    meetingCount: 10,
    averageAttendees: 5,
    averageDuration: 60,
    salaryDistribution: {
      executive: 1,
      senior: 2,
      midLevel: 1,
      entry: 1,
    },
  };

  const validResults = {
    meetingWaste: 50000,
    estimatedAlignmentTaxMin: 100000,
    estimatedAlignmentTaxMax: 200000,
    inputs: validMeetingData,
    calculatedAt: '2024-01-01T00:00:00.000Z',
  };

  describe('authentication', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const request = createRequest({ meetingData: validMeetingData });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 401 when user ID is missing', async () => {
      vi.mocked(auth).mockResolvedValue({ user: { email: 'test@example.com' } } as never);

      const request = createRequest({ meetingData: validMeetingData });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });
  });

  describe('validation', () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
      } as never);
    });

    it('should return 400 for invalid request body', async () => {
      const request = createRequest({ invalid: 'data' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when no data to migrate', async () => {
      const request = createRequest({
        meetingData: null,
        results: null,
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NO_DATA');
    });
  });

  describe('successful migration', () => {
    const mockSession = {
      id: 'session-123',
      userId: 'user-123',
      name: 'Migrated Session',
      status: 'in_progress',
      toolsCompleted: 1,
      data: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
      } as never);
      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockSession]),
        }),
      } as never);
    });

    it('should create session with results data', async () => {
      const request = createRequest({
        meetingData: null,
        results: validResults,
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.session.id).toBe('session-123');
    });

    it('should create session with meeting data only', async () => {
      const request = createRequest({
        meetingData: validMeetingData,
        results: null,
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
    });

    it('should create session with both meeting data and results', async () => {
      const request = createRequest({
        meetingData: validMeetingData,
        results: validResults,
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should return 500 on database error', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
      } as never);
      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockRejectedValue(new Error('DB error')),
        }),
      } as never);

      const request = createRequest({
        meetingData: validMeetingData,
        results: null,
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('SERVER_ERROR');
    });
  });
});
