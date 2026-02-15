/**
 * Logout API Tests
 *
 * Tests for the logout endpoint.
 *
 * Covers: Story 15.2 auth store requirements
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

// Mock dependencies
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

vi.mock('@/lib/auth/jwt', () => ({
  REFRESH_TOKEN_COOKIE_OPTIONS: {
    name: 'refresh_token',
  },
}));

import { cookies } from 'next/headers';

describe('POST /api/auth/logout', () => {
  const mockCookies = cookies as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should clear refresh token cookie and return success', async () => {
    const mockDelete = vi.fn();
    mockCookies.mockResolvedValue({
      delete: mockDelete,
    });

    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Logged out successfully.');
    expect(mockDelete).toHaveBeenCalledWith('refresh_token');
  });

  it('should handle errors gracefully', async () => {
    mockCookies.mockRejectedValue(new Error('Cookie error'));

    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('SERVER_ERROR');
  });
});
