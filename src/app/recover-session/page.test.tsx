/**
 * Tests for Session Recovery Page
 *
 * Story 15.8: Pre-Account Results Preservation
 * Covers: AC5, AC6, AC7, AC9 (all states)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

// Mock Next.js navigation
const mockSearchParams = new Map<string, string>();
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
};

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => mockSearchParams.get(key) || null,
  }),
  useRouter: () => mockRouter,
  usePathname: () => '/recover-session',
}));

// Mock Next Auth session
vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock the stores
vi.mock('@/lib/store/calculator-store', () => ({
  useCalculatorStore: {
    getState: () => ({
      setMeetingData: vi.fn(),
      setResults: vi.fn(),
    }),
  },
}));

vi.mock('@/lib/store/tool1-store', () => ({
  useTool1Store: {
    getState: () => ({
      setScores: vi.fn(),
      markComplete: vi.fn(),
    }),
  },
}));

vi.mock('@/lib/store/tool3-store', () => ({
  useTool3Store: {
    getState: () => ({
      resetTool3: vi.fn(),
    }),
  },
}));

vi.mock('@/lib/store/tool4-store', () => ({
  useTool4Store: {
    getState: () => ({
      resetTool4: vi.fn(),
    }),
  },
}));

vi.mock('@/lib/store/tool5-store', () => ({
  useTool5Store: {
    getState: () => ({
      resetTool5: vi.fn(),
    }),
  },
}));

vi.mock('@/lib/store/tool6-store', () => ({
  useTool6Store: {
    getState: () => ({
      resetTool6: vi.fn(),
    }),
  },
}));

vi.mock('@/lib/store/tool7-store', () => ({
  useTool7Store: {
    getState: () => ({
      markComplete: vi.fn(),
    }),
  },
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Import after mocks
import RecoverSessionPage from './page';

describe('RecoverSessionPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
    mockSearchParams.clear();
  });

  describe('Invalid token state', () => {
    it('should show invalid state when no token provided', async () => {
      // No token in search params

      render(<RecoverSessionPage />);

      await waitFor(() => {
        expect(screen.getByText(/invalid link/i)).toBeInTheDocument();
      });
    });
  });

  describe('Expired state (AC9)', () => {
    it('should show expired state for expired token', async () => {
      mockSearchParams.set('token', 'expired-token');
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: false,
            error: { code: 'EXPIRED', message: 'This link has expired' },
          }),
      });

      render(<RecoverSessionPage />);

      await waitFor(() => {
        expect(screen.getByText(/link expired/i)).toBeInTheDocument();
      });
    });
  });

  describe('Success state (AC5, AC6, AC7)', () => {
    const successResponse = {
      success: true,
      data: {
        preservedAt: '2024-01-01T00:00:00.000Z',
        tool1: {
          scores: { strategic: 3 },
          compositeScore: 2.5,
          completedAt: '2024-01-01T00:00:00.000Z',
        },
      },
    };

    it('should show success state for valid token', async () => {
      mockSearchParams.set('token', 'valid-token');
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(successResponse),
      });

      render(<RecoverSessionPage />);

      await waitFor(() => {
        expect(screen.getByText(/results restored/i)).toBeInTheDocument();
      });
    });

    it('should show create account CTA (AC7)', async () => {
      mockSearchParams.set('token', 'valid-token');
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(successResponse),
      });

      render(<RecoverSessionPage />);

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /create account/i })).toBeInTheDocument();
      });
    });
  });

  describe('Error state', () => {
    it('should show error state on server error', async () => {
      mockSearchParams.set('token', 'test-token');
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Server error' },
          }),
      });

      render(<RecoverSessionPage />);

      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });
    });
  });
});
