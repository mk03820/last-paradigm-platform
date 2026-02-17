/**
 * Resume Registration Page Tests
 *
 * Tests for the resume registration page component.
 *
 * Story 15.9: Registration Abandonment Recovery
 * Covers: Task 7, AC3 (Pre-filled email), AC4 (Welcome back message)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ResumeRegistrationPage from './page';

// Mock Next.js navigation
const mockPush = vi.fn();
const mockSearchParams = new Map<string, string>();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: (key: string) => mockSearchParams.get(key),
  }),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock RegisterForm component
vi.mock('@/components/auth/RegisterForm', () => ({
  RegisterForm: ({ defaultEmail }: { defaultEmail?: string }) => (
    <div data-testid="register-form" data-email={defaultEmail}>
      Mocked Register Form
    </div>
  ),
}));

describe('ResumeRegistrationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.clear();
  });

  it('should show loading state initially when token is present', () => {
    mockSearchParams.set('token', 'test-token');
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<ResumeRegistrationPage />);

    expect(screen.getByText(/loading your registration/i)).toBeInTheDocument();
  });

  it('should show invalid state when no token is provided', async () => {
    // No token set

    render(<ResumeRegistrationPage />);

    await waitFor(() => {
      expect(screen.getByText(/invalid link/i)).toBeInTheDocument();
    });
  });

  it('should show form with pre-filled email on successful token validation (AC3)', async () => {
    mockSearchParams.set('token', 'valid-token');
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({
        success: true,
        email: 'test@example.com',
      }),
    });

    render(<ResumeRegistrationPage />);

    await waitFor(() => {
      const form = screen.getByTestId('register-form');
      expect(form).toBeInTheDocument();
      expect(form).toHaveAttribute('data-email', 'test@example.com');
    });
  });

  it('should show welcome back message (AC4)', async () => {
    mockSearchParams.set('token', 'valid-token');
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({
        success: true,
        email: 'test@example.com',
      }),
    });

    render(<ResumeRegistrationPage />);

    await waitFor(() => {
      expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    });
  });

  it('should show completed state when registration already done', async () => {
    mockSearchParams.set('token', 'completed-token');
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({
        success: false,
        error: {
          code: 'ALREADY_COMPLETED',
          message: 'Registration has already been completed.',
        },
      }),
    });

    render(<ResumeRegistrationPage />);

    await waitFor(() => {
      expect(screen.getByText(/already registered/i)).toBeInTheDocument();
    });
  });

  it('should show invalid state for invalid token', async () => {
    mockSearchParams.set('token', 'invalid-token');
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token.',
        },
      }),
    });

    render(<ResumeRegistrationPage />);

    await waitFor(() => {
      expect(screen.getByText(/invalid link/i)).toBeInTheDocument();
    });
  });

  it('should show error state on fetch failure', async () => {
    mockSearchParams.set('token', 'test-token');
    mockFetch.mockRejectedValue(new Error('Network error'));

    render(<ResumeRegistrationPage />);

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  it('should have link to sign in', async () => {
    mockSearchParams.set('token', 'valid-token');
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({
        success: true,
        email: 'test@example.com',
      }),
    });

    render(<ResumeRegistrationPage />);

    await waitFor(() => {
      expect(screen.getByText(/sign in with magic link/i)).toBeInTheDocument();
    });
  });
});
