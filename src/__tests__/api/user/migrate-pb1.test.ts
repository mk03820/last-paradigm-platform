/**
 * PB1 Migration API Endpoint Tests
 *
 * Tests for POST /api/user/migrate-pb1 endpoint.
 *
 * Story 15.7: PB1 Data Migration to Database
 * Task 7.4: Integration test for API endpoint
 *
 * @vitest-environment node
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Mock auth module
vi.mock('@/lib/auth', () => ({
  verifyAccessToken: vi.fn(),
}));

// Mock session migration
vi.mock('@/lib/auth/session-migration', () => ({
  migratePB1Session: vi.fn(),
}));

import { POST } from '@/app/api/user/migrate-pb1/route';
import { verifyAccessToken } from '@/lib/auth';
import { migratePB1Session } from '@/lib/auth/session-migration';

function createRequest(
  body: unknown,
  headers: Record<string, string> = {}
): NextRequest {
  const url = 'http://localhost:3000/api/user/migrate-pb1';
  return new NextRequest(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

describe('POST /api/user/migrate-pb1', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication', () => {
    it('returns 401 when no authorization header', async () => {
      const request = createRequest({ sessionData: {} });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('returns 401 when token is invalid', async () => {
      vi.mocked(verifyAccessToken).mockResolvedValue(null);

      const request = createRequest(
        { sessionData: {} },
        { Authorization: 'Bearer invalid-token' }
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_TOKEN');
    });
  });

  describe('Validation', () => {
    it('returns 400 when sessionData is missing', async () => {
      vi.mocked(verifyAccessToken).mockResolvedValue({
        sub: 'user-123',
        email: 'test@example.com',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      });

      const request = createRequest(
        {},
        { Authorization: 'Bearer valid-token' }
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('MISSING_DATA');
    });
  });

  describe('Successful Migration', () => {
    it('migrates session data and returns result ID', async () => {
      vi.mocked(verifyAccessToken).mockResolvedValue({
        sub: 'user-123',
        email: 'test@example.com',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      });

      vi.mocked(migratePB1Session).mockResolvedValue({
        success: true,
        diagnosticResultId: 'result-456',
      });

      const sessionData = {
        tool1: { scores: { strategic: 3 } },
        tool2: { inputs: { meetingCount: 20 } },
        totalAlignmentTax: 150000,
      };

      const request = createRequest(
        { sessionData },
        { Authorization: 'Bearer valid-token' }
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.diagnosticResultId).toBe('result-456');
    });

    it('uses userId from verified token', async () => {
      vi.mocked(verifyAccessToken).mockResolvedValue({
        sub: 'user-789',
        email: 'test@example.com',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      });

      vi.mocked(migratePB1Session).mockResolvedValue({
        success: true,
        diagnosticResultId: 'result-123',
      });

      const request = createRequest(
        { sessionData: { tool1: {} } },
        { Authorization: 'Bearer valid-token' }
      );
      await POST(request);

      expect(migratePB1Session).toHaveBeenCalledWith(
        'user-789',
        expect.any(Object)
      );
    });
  });

  describe('Migration Failure', () => {
    it('returns 500 when migration fails', async () => {
      vi.mocked(verifyAccessToken).mockResolvedValue({
        sub: 'user-123',
        email: 'test@example.com',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      });

      vi.mocked(migratePB1Session).mockResolvedValue({
        success: false,
        error: 'Database connection failed',
      });

      const request = createRequest(
        { sessionData: { tool1: {} } },
        { Authorization: 'Bearer valid-token' }
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('MIGRATION_FAILED');
    });

    it('returns 500 on unexpected error', async () => {
      vi.mocked(verifyAccessToken).mockResolvedValue({
        sub: 'user-123',
        email: 'test@example.com',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      });

      vi.mocked(migratePB1Session).mockRejectedValue(new Error('Unexpected error'));

      const request = createRequest(
        { sessionData: { tool1: {} } },
        { Authorization: 'Bearer valid-token' }
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('SERVER_ERROR');
    });
  });

  describe('Complete Integration Flow', () => {
    it('handles full migration with all 7 tools', async () => {
      vi.mocked(verifyAccessToken).mockResolvedValue({
        sub: 'user-123',
        email: 'test@example.com',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      });

      vi.mocked(migratePB1Session).mockResolvedValue({
        success: true,
        diagnosticResultId: 'result-full-123',
      });

      const fullSessionData = {
        tool1: {
          scores: { strategic: 3, execution: 2, technology: 2, people: 3, governance: 3 },
          compositeScore: 2.6,
          completedAt: '2024-01-15T10:00:00Z',
        },
        tool2: {
          inputs: { meetingCount: 20, averageAttendees: 8, averageDuration: 60 },
          results: { wastedCost: 150000 },
          completedAt: '2024-01-15T10:00:00Z',
        },
        tool3: {
          decisions: [{ type: 'budget', daysToDecision: 21 }],
          completedAt: '2024-01-15T10:00:00Z',
        },
        tool4: {
          stakeholders: [{ name: 'CEO', power: 5, interest: 4 }],
          completedAt: '2024-01-15T10:00:00Z',
        },
        tool5: {
          journeys: [{ id: '1', name: 'Process' }],
          frictionCost: 75000,
          completedAt: '2024-01-15T10:00:00Z',
        },
        tool6: {
          metrics: { email: { avgResponseTimeHours: 4 } },
          antiPatterns: [],
          completedAt: '2024-01-15T10:00:00Z',
        },
        tool7: {
          totalCost: 500000,
          alignmentTaxPercent: 5,
          completedAt: '2024-01-15T10:00:00Z',
        },
        totalAlignmentTax: 500000,
        estimatedSavings: 200000,
        completedAt: '2024-01-15T10:00:00Z',
      };

      const request = createRequest(
        { sessionData: fullSessionData },
        { Authorization: 'Bearer valid-token' }
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.diagnosticResultId).toBe('result-full-123');

      // Verify migratePB1Session was called with complete data
      expect(migratePB1Session).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          tool1: expect.any(Object),
          tool2: expect.any(Object),
          tool7: expect.any(Object),
          totalAlignmentTax: 500000,
        })
      );
    });
  });
});
