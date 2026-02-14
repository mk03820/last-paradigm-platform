/**
 * Registration API Tests
 *
 * Tests for the registration endpoint.
 *
 * Covers: Story 15.2 Task 3
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    }),
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{
          id: 'test-user-id',
          email: 'test@example.com',
          name: 'Test User',
          purchaseStatus: 'none',
        }]),
      }),
    }),
  },
}));

// Mock auth utilities
vi.mock('@/lib/auth', () => ({
  hashPassword: vi.fn().mockResolvedValue('$2b$12$hashedpassword'),
  createTokenPair: vi.fn().mockResolvedValue({
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  }),
  REFRESH_TOKEN_COOKIE_OPTIONS: {
    name: 'refresh_token',
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 604800,
  },
}));

// Mock cookies
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    set: vi.fn(),
  }),
}));

let testCounter = 0;

function createRequest(body: object): NextRequest {
  testCounter++;
  return new NextRequest('http://localhost/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': `127.0.0.${testCounter}`, // Unique IP per test to avoid rate limiting
    },
    body: JSON.stringify(body),
  });
}

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should register a new user successfully', async () => {
    const request = createRequest({
      email: 'newuser@example.com',
      password: 'Password123',
      name: 'New User',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.user.email).toBe('test@example.com');
    expect(data.data.accessToken).toBe('mock-access-token');
  });

  it('should reject invalid email', async () => {
    const request = createRequest({
      email: 'not-an-email',
      password: 'Password123',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('should reject short password', async () => {
    const request = createRequest({
      email: 'test@example.com',
      password: 'short',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('should reject password without number', async () => {
    const request = createRequest({
      email: 'test@example.com',
      password: 'PasswordOnly',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('should normalize email to lowercase', async () => {
    const request = createRequest({
      email: 'TEST@EXAMPLE.COM',
      password: 'Password123',
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
  });

  it('should allow registration without name', async () => {
    const request = createRequest({
      email: 'noname@example.com',
      password: 'Password123',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
