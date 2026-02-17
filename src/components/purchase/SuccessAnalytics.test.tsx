/**
 * SuccessAnalytics Component Tests
 *
 * Story 17.6: Purchase Success Page
 * Task 7.6: Test analytics event firing
 *
 * Tests cover:
 * - AC5: purchase_completed analytics event
 * - Single-fire prevention
 * - LocalStorage interaction
 * - Error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { SuccessAnalytics } from './SuccessAnalytics';

// Mock the analytics tracking function
const mockTrackCheckoutCompleted = vi.fn().mockResolvedValue(undefined);
vi.mock('@/lib/analytics/tracking', () => ({
  trackCheckoutCompleted: (...args: unknown[]) => mockTrackCheckoutCompleted(...args),
}));

// Mock localStorage
const mockLocalStorage: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    mockLocalStorage[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete mockLocalStorage[key];
  }),
  clear: vi.fn(() => {
    Object.keys(mockLocalStorage).forEach((key) => delete mockLocalStorage[key]);
  }),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('SuccessAnalytics', () => {
  const defaultProps = {
    purchaseId: 'purchase_123',
    sessionId: 'cs_test_abc123',
    amount: 250000,
    currency: 'usd',
    userId: 'user_456',
    customerEmail: 'user@example.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    Object.keys(mockLocalStorage).forEach((key) => delete mockLocalStorage[key]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Analytics Event Firing (AC5)', () => {
    it('fires checkout_completed event on mount', async () => {
      render(<SuccessAnalytics {...defaultProps} />);

      await waitFor(() => {
        expect(mockTrackCheckoutCompleted).toHaveBeenCalledTimes(1);
      });
    });

    it('passes correct parameters to tracking function', async () => {
      render(<SuccessAnalytics {...defaultProps} />);

      await waitFor(() => {
        expect(mockTrackCheckoutCompleted).toHaveBeenCalledWith({
          amount: 250000,
          currency: 'usd',
          stripeSessionId: 'cs_test_abc123',
          userId: 'user_456',
          customerEmail: 'user@example.com',
          paymentMethod: 'card',
        });
      });
    });

    it('uses default currency when not provided', async () => {
      const { currency, ...propsWithoutCurrency } = defaultProps;
      render(<SuccessAnalytics {...propsWithoutCurrency} />);

      await waitFor(() => {
        expect(mockTrackCheckoutCompleted).toHaveBeenCalledWith(
          expect.objectContaining({ currency: 'usd' })
        );
      });
    });
  });

  describe('Single-Fire Prevention (AC8)', () => {
    it('does not fire event if already tracked in localStorage', async () => {
      // Pre-set localStorage
      mockLocalStorage[`checkout_completed_${defaultProps.sessionId}`] =
        '2026-02-14T12:00:00.000Z';

      render(<SuccessAnalytics {...defaultProps} />);

      // Wait a bit to ensure effect has run
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(mockTrackCheckoutCompleted).not.toHaveBeenCalled();
    });

    it('stores completion timestamp in localStorage after tracking', async () => {
      render(<SuccessAnalytics {...defaultProps} />);

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          `checkout_completed_${defaultProps.sessionId}`,
          expect.any(String)
        );
      });
    });

    it('fires once even with React Strict Mode double-render', async () => {
      // Render twice to simulate Strict Mode
      const { rerender } = render(<SuccessAnalytics {...defaultProps} />);
      rerender(<SuccessAnalytics {...defaultProps} />);

      await waitFor(() => {
        // Should only fire once due to ref protection
        expect(mockTrackCheckoutCompleted).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Error Handling', () => {
    it('logs error when tracking fails', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockTrackCheckoutCompleted.mockRejectedValueOnce(new Error('Network error'));

      render(<SuccessAnalytics {...defaultProps} />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          '[SuccessAnalytics] Failed to track event:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });

    it('does not break the page when tracking fails', async () => {
      mockTrackCheckoutCompleted.mockRejectedValueOnce(new Error('Network error'));

      // Should not throw
      expect(() => render(<SuccessAnalytics {...defaultProps} />)).not.toThrow();
    });
  });

  describe('Rendering', () => {
    it('renders nothing (invisible component)', () => {
      const { container } = render(<SuccessAnalytics {...defaultProps} />);

      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('Optional Props', () => {
    it('works without userId', async () => {
      const { userId, ...propsWithoutUserId } = defaultProps;
      render(<SuccessAnalytics {...propsWithoutUserId} />);

      await waitFor(() => {
        expect(mockTrackCheckoutCompleted).toHaveBeenCalledWith(
          expect.objectContaining({ userId: undefined })
        );
      });
    });

    it('works without customerEmail', async () => {
      const { customerEmail, ...propsWithoutEmail } = defaultProps;
      render(<SuccessAnalytics {...propsWithoutEmail} />);

      await waitFor(() => {
        expect(mockTrackCheckoutCompleted).toHaveBeenCalledWith(
          expect.objectContaining({ customerEmail: undefined })
        );
      });
    });
  });
});
