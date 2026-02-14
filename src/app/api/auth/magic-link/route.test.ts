/**
 * Magic Link Request API Tests
 *
 * Tests for POST /api/auth/magic-link endpoint.
 *
 * Covers: Story 15.4 Task 1.8
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

// Mock the magic-link module
vi.mock('@/lib/auth/magic-link', () => ({
  createMagicLink: vi.fn(),
  isRateLimited: vi.fn(),
  buildMagicLinkUrl: vi.fn((token) => `https://test.com/verify?token=${token}`),
}));

// Mock the email client
vi.mock('@/lib/email/client', () => ({
  sendEmail: vi.fn(),
}));

// Mock the email template
vi.mock('@/lib/email/templates/magic-link', () => ({
  generateMagicLinkEmail: vi.fn(() => ({
    subject: 'Test Subject',
    text: 'Test text',
    html: '<p>Test html</p>',
  })),
}));

import { createMagicLink, isRateLimited } from '@/lib/auth/magic-link';
import { sendEmail } from '@/lib/email/client';

describe('POST /api/auth/magic-link', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://test.com');

    // Default mocks
    vi.mocked(isRateLimited).mockReturnValue(false);
    vi.mocked(createMagicLink).mockResolvedValue({
      success: true,
      token: 'test-token-123',
    });
    vi.mocked(sendEmail).mockResolvedValue({
      success: true,
      id: 'email-id-123',
    });
  });

  it('returns 400 for invalid JSON body', async () => {
    const request = new Request('http://test.com/api/auth/magic-link', {
      method: 'POST',
      body: 'not json',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for missing email', async () => {
    const request = new Request('http://test.com/api/auth/magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for invalid email format', async () => {
    const request = new Request('http://test.com/api/auth/magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
    expect(data.error.message).toContain('valid email');
  });

  it('returns 429 when rate limited', async () => {
    vi.mocked(isRateLimited).mockReturnValue(true);

    const request = new Request('http://test.com/api/auth/magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('RATE_LIMITED');
  });

  it('returns success for valid email', async () => {
    const request = new Request('http://test.com/api/auth/magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.message).toContain('sign-in link');
  });

  it('normalizes email to lowercase', async () => {
    const request = new Request('http://test.com/api/auth/magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'Test@EXAMPLE.com' }),
    });

    await POST(request);

    expect(isRateLimited).toHaveBeenCalledWith('test@example.com');
  });

  it('creates magic link with correct email', async () => {
    const request = new Request('http://test.com/api/auth/magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@example.com' }),
    });

    await POST(request);

    expect(createMagicLink).toHaveBeenCalledWith('user@example.com');
  });

  it('sends email with magic link', async () => {
    const request = new Request('http://test.com/api/auth/magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'recipient@example.com' }),
    });

    await POST(request);

    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'recipient@example.com',
        subject: 'Test Subject',
      })
    );
  });

  it('returns success even if email fails (prevent enumeration)', async () => {
    vi.mocked(sendEmail).mockResolvedValue({
      success: false,
      error: 'Email service error',
    });

    const request = new Request('http://test.com/api/auth/magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('returns success even if createMagicLink fails (prevent enumeration)', async () => {
    vi.mocked(createMagicLink).mockResolvedValue({
      success: false,
      error: 'Database error',
    });

    const request = new Request('http://test.com/api/auth/magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('trims whitespace from email', async () => {
    const request = new Request('http://test.com/api/auth/magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: '  user@example.com  ' }),
    });

    await POST(request);

    expect(createMagicLink).toHaveBeenCalledWith('user@example.com');
  });
});
