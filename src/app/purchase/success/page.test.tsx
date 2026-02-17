/**
 * Purchase Success Page Tests
 *
 * Story 17.6: Purchase Success Page
 * Task 7.4: Integration tests for page with session validation
 * Task 7.5: Test error states for invalid sessions
 *
 * Tests cover:
 * - AC1: Session validation
 * - AC7: Error states for invalid/missing sessions
 * - AC8: Page refresh handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock the auth module
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

// Mock the database
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
  },
}));

// Mock drizzle-orm
vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
}));

// Mock the stripe client
vi.mock('@/lib/stripe/client', () => ({
  stripe: {
    checkout: {
      sessions: {
        retrieve: vi.fn(),
      },
    },
  },
}));

// Mock the analytics component
vi.mock('@/components/purchase', async () => {
  const actual = await vi.importActual<typeof import('@/components/purchase')>(
    '@/components/purchase'
  );
  return {
    ...actual,
    SuccessAnalytics: () => null,
  };
});

import PurchaseSuccessPage from './page';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { stripe } from '@/lib/stripe/client';

// Type assertions for mocks
const mockAuth = auth as unknown as ReturnType<typeof vi.fn>;
const mockStripeRetrieve = stripe.checkout.sessions
  .retrieve as unknown as ReturnType<typeof vi.fn>;
const mockDbLimit = (db.select().from(null as unknown as never).leftJoin(null as unknown as never, null as unknown as never).where(null as unknown as never)
  .limit as unknown as ReturnType<typeof vi.fn>);

describe('PurchaseSuccessPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Missing Session ID (AC7)', () => {
    it('shows error when session_id is missing', async () => {
      const Page = await PurchaseSuccessPage({
        searchParams: Promise.resolve({}),
      });

      render(Page);

      expect(
        screen.getByRole('heading', { name: /session not found/i })
      ).toBeInTheDocument();
      expect(
        screen.getByText(/we could not find your checkout session/i)
      ).toBeInTheDocument();
    });

    it('shows Return to Preview button for missing session', async () => {
      const Page = await PurchaseSuccessPage({
        searchParams: Promise.resolve({}),
      });

      render(Page);

      expect(
        screen.getByRole('link', { name: /return to preview/i })
      ).toHaveAttribute('href', '/preview');
    });

    it('shows Contact Support link for missing session', async () => {
      const Page = await PurchaseSuccessPage({
        searchParams: Promise.resolve({}),
      });

      render(Page);

      expect(
        screen.getByRole('link', { name: /contact support/i })
      ).toHaveAttribute('href', 'mailto:support@lastparadigm.com');
    });
  });

  describe('Unauthenticated User (AC7)', () => {
    it('shows sign in prompt when user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const Page = await PurchaseSuccessPage({
        searchParams: Promise.resolve({ session_id: 'cs_test_123' }),
      });

      render(Page);

      expect(
        screen.getByRole('heading', { name: /please sign in/i })
      ).toBeInTheDocument();
    });

    it('shows Sign In button with callback URL', async () => {
      mockAuth.mockResolvedValue(null);

      const Page = await PurchaseSuccessPage({
        searchParams: Promise.resolve({ session_id: 'cs_test_123' }),
      });

      render(Page);

      expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute(
        'href',
        '/auth/signin?callbackUrl=/purchase/success'
      );
    });
  });

  describe('Incomplete Checkout (AC7)', () => {
    it('shows error when checkout is not complete', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user_123', email: 'test@example.com' },
      });
      mockStripeRetrieve.mockResolvedValue({
        status: 'open',
        customer_email: 'test@example.com',
        amount_total: 250000,
      });

      const Page = await PurchaseSuccessPage({
        searchParams: Promise.resolve({ session_id: 'cs_test_123' }),
      });

      render(Page);

      expect(
        screen.getByRole('heading', { name: /payment incomplete/i })
      ).toBeInTheDocument();
    });
  });

  describe('Pending Purchase (AC8)', () => {
    it('shows pending state when purchase not yet in database', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user_123', email: 'test@example.com' },
      });
      mockStripeRetrieve.mockResolvedValue({
        status: 'complete',
        customer_email: 'test@example.com',
        amount_total: 250000,
      });
      mockDbLimit.mockResolvedValue([]);

      const Page = await PurchaseSuccessPage({
        searchParams: Promise.resolve({ session_id: 'cs_test_123' }),
      });

      render(Page);

      expect(
        screen.getByRole('heading', { name: /processing your purchase/i })
      ).toBeInTheDocument();
      expect(
        screen.getByText(/your payment of \$2,500 was successful/i)
      ).toBeInTheDocument();
    });

    it('shows email in pending state', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user_123', email: 'test@example.com' },
      });
      mockStripeRetrieve.mockResolvedValue({
        status: 'complete',
        customer_email: 'test@example.com',
        amount_total: 250000,
      });
      mockDbLimit.mockResolvedValue([]);

      const Page = await PurchaseSuccessPage({
        searchParams: Promise.resolve({ session_id: 'cs_test_123' }),
      });

      render(Page);

      expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
    });
  });

  describe('Unauthorized Access (AC7)', () => {
    it('shows error when purchase belongs to different user', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user_123', email: 'test@example.com' },
      });
      mockStripeRetrieve.mockResolvedValue({
        status: 'complete',
        customer_email: 'other@example.com',
        amount_total: 250000,
      });
      mockDbLimit.mockResolvedValue([
        {
          purchase: {
            id: 'purchase_123',
            userId: 'user_different', // Different user
            amount: 250000,
            currency: 'usd',
            stripeSessionId: 'cs_test_123',
          },
          user: { email: 'other@example.com', name: 'Other User' },
        },
      ]);

      const Page = await PurchaseSuccessPage({
        searchParams: Promise.resolve({ session_id: 'cs_test_123' }),
      });

      render(Page);

      expect(
        screen.getByRole('heading', { name: /access denied/i })
      ).toBeInTheDocument();
    });
  });

  describe('Successful Purchase (AC1, AC2, AC3, AC4, AC6)', () => {
    const successfulPurchase = {
      purchase: {
        id: 'purchase_123',
        userId: 'user_123',
        amount: 250000,
        currency: 'usd',
        stripeSessionId: 'cs_test_123',
        completedAt: new Date('2026-02-14T12:00:00Z'),
        createdAt: new Date('2026-02-14T12:00:00Z'),
      },
      user: { email: 'test@example.com', name: 'Test User' },
    };

    beforeEach(() => {
      mockAuth.mockResolvedValue({
        user: { id: 'user_123', email: 'test@example.com', name: 'Test User' },
      });
      mockStripeRetrieve.mockResolvedValue({
        status: 'complete',
        customer_email: 'test@example.com',
        amount_total: 250000,
      });
      mockDbLimit.mockResolvedValue([successfulPurchase]);
    });

    it('renders success hero with user name (AC2)', async () => {
      const Page = await PurchaseSuccessPage({
        searchParams: Promise.resolve({ session_id: 'cs_test_123' }),
      });

      render(Page);

      expect(
        screen.getByRole('heading', { name: /congratulations, test user/i })
      ).toBeInTheDocument();
    });

    it('renders purchase confirmation details (AC3)', async () => {
      const Page = await PurchaseSuccessPage({
        searchParams: Promise.resolve({ session_id: 'cs_test_123' }),
      });

      render(Page);

      expect(
        screen.getByRole('heading', { name: /purchase confirmation/i })
      ).toBeInTheDocument();
      expect(screen.getByText('$2,500')).toBeInTheDocument();
    });

    it('renders next steps section (AC4)', async () => {
      const Page = await PurchaseSuccessPage({
        searchParams: Promise.resolve({ session_id: 'cs_test_123' }),
      });

      render(Page);

      expect(
        screen.getByRole('heading', { name: /what's next/i })
      ).toBeInTheDocument();
    });

    it('renders primary CTA (AC6)', async () => {
      const Page = await PurchaseSuccessPage({
        searchParams: Promise.resolve({ session_id: 'cs_test_123' }),
      });

      render(Page);

      expect(
        screen.getByRole('link', { name: /start your transformation/i })
      ).toBeInTheDocument();
    });
  });

  describe('Stripe API Errors (AC7)', () => {
    it('shows error when Stripe API fails', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user_123', email: 'test@example.com' },
      });
      mockStripeRetrieve.mockRejectedValue(new Error('Stripe API error'));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const Page = await PurchaseSuccessPage({
        searchParams: Promise.resolve({ session_id: 'cs_test_123' }),
      });

      render(Page);

      expect(
        screen.getByRole('heading', { name: /something went wrong/i })
      ).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });
});
