/**
 * Magic Link Verification Page Tests
 *
 * Tests for the verification landing page.
 *
 * Covers: Story 15.4 Task 5.8
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import VerifyMagicLinkPage from './page';

// Mock next/navigation
const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock sessionStorage
const mockSetItem = vi.fn();
Object.defineProperty(window, 'sessionStorage', {
  value: {
    setItem: mockSetItem,
    getItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

describe('VerifyMagicLinkPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.delete('token');
    mockSearchParams.delete('callbackUrl');
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows loading state initially', () => {
    mockSearchParams.set('token', 'test-token');
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<VerifyMagicLinkPage />);

    expect(screen.getByText(/verifying link/i)).toBeInTheDocument();
    expect(screen.getByText(/please wait/i)).toBeInTheDocument();
  });

  it('shows invalid state for missing token', async () => {
    render(<VerifyMagicLinkPage />);

    await waitFor(() => {
      expect(screen.getByText(/invalid link/i)).toBeInTheDocument();
      expect(screen.getByText(/no verification token/i)).toBeInTheDocument();
    });
  });

  it('shows success state for valid token', async () => {
    mockSearchParams.set('token', 'valid-token');
    mockFetch.mockResolvedValue({
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            accessToken: 'access-123',
            user: { id: 'user-1', email: 'test@example.com' },
            redirectUrl: '/dashboard',
          },
        }),
    });

    render(<VerifyMagicLinkPage />);

    await waitFor(() => {
      expect(screen.getByText(/sign in successful/i)).toBeInTheDocument();
      expect(screen.getByText(/redirecting/i)).toBeInTheDocument();
    });
  });

  it('stores access token on success', async () => {
    mockSearchParams.set('token', 'valid-token');
    mockFetch.mockResolvedValue({
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            accessToken: 'my-access-token',
            user: { id: 'user-1', email: 'test@example.com' },
            redirectUrl: '/dashboard',
          },
        }),
    });

    render(<VerifyMagicLinkPage />);

    await waitFor(() => {
      expect(mockSetItem).toHaveBeenCalledWith('accessToken', 'my-access-token');
    });
  });

  it('redirects after successful verification', async () => {
    mockSearchParams.set('token', 'valid-token');
    mockFetch.mockResolvedValue({
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            accessToken: 'token',
            user: { id: 'user-1', email: 'test@example.com' },
            redirectUrl: '/dashboard',
          },
        }),
    });

    render(<VerifyMagicLinkPage />);

    await waitFor(() => {
      expect(screen.getByText(/sign in successful/i)).toBeInTheDocument();
    });

    // Advance timer for redirect
    vi.advanceTimersByTime(1500);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows expired state for expired token', async () => {
    mockSearchParams.set('token', 'expired-token');
    mockFetch.mockResolvedValue({
      json: () =>
        Promise.resolve({
          success: false,
          error: { code: 'EXPIRED', message: 'Link has expired' },
        }),
    });

    render(<VerifyMagicLinkPage />);

    await waitFor(() => {
      expect(screen.getByText(/link expired/i)).toBeInTheDocument();
      expect(screen.getByText(/15 minutes/i)).toBeInTheDocument();
    });
  });

  it('shows used state for already used token', async () => {
    mockSearchParams.set('token', 'used-token');
    mockFetch.mockResolvedValue({
      json: () =>
        Promise.resolve({
          success: false,
          error: { code: 'ALREADY_USED', message: 'Link already used' },
        }),
    });

    render(<VerifyMagicLinkPage />);

    await waitFor(() => {
      expect(screen.getByText(/link already used/i)).toBeInTheDocument();
      expect(screen.getByText(/can only be used once/i)).toBeInTheDocument();
    });
  });

  it('shows request new link button for expired token', async () => {
    mockSearchParams.set('token', 'expired-token');
    mockFetch.mockResolvedValue({
      json: () =>
        Promise.resolve({
          success: false,
          error: { code: 'EXPIRED', message: 'Link expired' },
        }),
    });

    render(<VerifyMagicLinkPage />);

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /request new link/i })).toHaveAttribute(
        'href',
        '/auth/signin'
      );
    });
  });

  it('shows request new link button for used token', async () => {
    mockSearchParams.set('token', 'used-token');
    mockFetch.mockResolvedValue({
      json: () =>
        Promise.resolve({
          success: false,
          error: { code: 'ALREADY_USED', message: 'Already used' },
        }),
    });

    render(<VerifyMagicLinkPage />);

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /request new link/i })).toBeInTheDocument();
    });
  });

  it('shows return home link in error states', async () => {
    mockSearchParams.set('token', 'bad-token');
    mockFetch.mockResolvedValue({
      json: () =>
        Promise.resolve({
          success: false,
          error: { code: 'INVALID_TOKEN', message: 'Invalid' },
        }),
    });

    render(<VerifyMagicLinkPage />);

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /return home/i })).toHaveAttribute('href', '/');
    });
  });

  it('shows error state for network failure', async () => {
    mockSearchParams.set('token', 'valid-token');
    mockFetch.mockRejectedValue(new Error('Network error'));

    render(<VerifyMagicLinkPage />);

    await waitFor(() => {
      expect(screen.getByText(/verification failed/i)).toBeInTheDocument();
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  it('shows try again button for error state', async () => {
    mockSearchParams.set('token', 'valid-token');
    mockFetch.mockRejectedValue(new Error('Network error'));

    render(<VerifyMagicLinkPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });
  });

  it('displays The Last Paradigm branding', () => {
    mockSearchParams.set('token', 'test');
    mockFetch.mockImplementation(() => new Promise(() => {}));

    render(<VerifyMagicLinkPage />);

    expect(screen.getByText(/the last paradigm/i)).toBeInTheDocument();
    expect(screen.getByText(/alignment tax/i)).toBeInTheDocument();
  });

  it('passes token to API correctly', async () => {
    mockSearchParams.set('token', 'my-specific-token');
    mockFetch.mockResolvedValue({
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            accessToken: 'token',
            user: { id: 'user-1' },
            redirectUrl: '/dashboard',
          },
        }),
    });

    render(<VerifyMagicLinkPage />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('token=my-specific-token')
      );
    });
  });

  it('passes callbackUrl to API when provided', async () => {
    mockSearchParams.set('token', 'valid-token');
    mockSearchParams.set('callbackUrl', '/settings');
    mockFetch.mockResolvedValue({
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            accessToken: 'token',
            user: { id: 'user-1' },
            redirectUrl: '/settings',
          },
        }),
    });

    render(<VerifyMagicLinkPage />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('callbackUrl=%2Fsettings')
      );
    });
  });

  it('shows book attribution in footer', async () => {
    mockSearchParams.set('token', 'test');
    mockFetch.mockResolvedValue({
      json: () =>
        Promise.resolve({
          success: true,
          data: { accessToken: 'token', user: {}, redirectUrl: '/' },
        }),
    });

    render(<VerifyMagicLinkPage />);

    await waitFor(() => {
      expect(screen.getByText(/methodology from/i)).toBeInTheDocument();
    });
  });
});
