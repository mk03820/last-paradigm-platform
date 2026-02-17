/**
 * Resume Registration API Tests
 *
 * Tests for the resume registration endpoint.
 *
 * Story 15.9: Registration Abandonment Recovery
 * Covers: Task 6, AC3 (Pre-fill email from resume link)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

// Mock database
const mockSelect = vi.fn();

vi.mock('@/lib/db', () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: mockSelect,
        }),
      }),
    }),
  },
}));

// Mock schema
vi.mock('@/lib/db/schema', () => ({
  abandonedRegistrations: {
    token: 'token',
  },
}));

// Mock drizzle-orm
vi.mock('drizzle-orm', () => ({
  eq: vi.fn((col, val) => ({ col, val })),
}));

describe('GET /api/auth/resume-registration/[token]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return email for valid token', async () => {
    mockSelect.mockResolvedValue([{
      id: 'test-id',
      email: 'test@example.com',
      token: 'valid-token',
      completedAt: null,
    }]);

    const request = new NextRequest('http://localhost/api/auth/resume-registration/valid-token');
    const response = await GET(request, { params: Promise.resolve({ token: 'valid-token' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.email).toBe('test@example.com');
  });

  it('should return error for invalid token', async () => {
    mockSelect.mockResolvedValue([]);

    const request = new NextRequest('http://localhost/api/auth/resume-registration/invalid-token');
    const response = await GET(request, { params: Promise.resolve({ token: 'invalid-token' }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_TOKEN');
  });

  it('should return error for already completed registration', async () => {
    mockSelect.mockResolvedValue([{
      id: 'test-id',
      email: 'test@example.com',
      token: 'completed-token',
      completedAt: new Date(),
    }]);

    const request = new NextRequest('http://localhost/api/auth/resume-registration/completed-token');
    const response = await GET(request, { params: Promise.resolve({ token: 'completed-token' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('ALREADY_COMPLETED');
  });

  it('should handle missing token parameter', async () => {
    const request = new NextRequest('http://localhost/api/auth/resume-registration/');
    const response = await GET(request, { params: Promise.resolve({ token: '' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_TOKEN');
  });
});
