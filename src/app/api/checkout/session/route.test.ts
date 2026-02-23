/**
 * Checkout Session API Route Tests
 *
 * Tests for POST /api/checkout/session endpoint.
 *
 * Story 17.2: Stripe Checkout Integration
 * Task 6.2-6.6: Integration tests for checkout session API
 * Covers: AC1, AC3, AC4, AC8 (authentication, metadata, URLs)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

// Mock auth
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

// Mock Stripe client
vi.mock('@/lib/stripe/client', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: vi.fn(),
      },
    },
  },
  STRIPE_CONFIG: {
    priceId: 'price_test_123',
    currency: 'usd',
    productName: 'Playbook 2 - Complete Diagnostic Access',
    productDescription: 'Full access to all 10 diagnostic tools',
    priceAmount: 2500,
    priceFormatted: '$2,500',
  },
}));

import { auth } from '@/auth';
import { stripe, STRIPE_CONFIG } from '@/lib/stripe/client';
import Stripe from 'stripe';

describe('POST /api/checkout/session', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
  };

  const mockCheckoutSession = {
    id: 'cs_test_123456789',
    url: 'https://checkout.stripe.com/c/pay/cs_test_123456789',
    payment_status: 'unpaid',
    status: 'open',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Set default env
    process.env.NEXT_PUBLIC_APP_URL = 'https://example.com';
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_APP_URL;
  });

  const createRequest = (body?: object) => {
    return new NextRequest('http://localhost/api/checkout/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
  };

  describe('Authentication (AC8)', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null as never);

      const request = createRequest({});
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
      expect(data.code).toBe('SERVER_ERROR');
    });

    it('should return 401 when user ID is missing', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { email: 'test@example.com' },
      } as never);

      const request = createRequest({});
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });

    it('should return 400 when user email is missing', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user-123' },
      } as never);

      const request = createRequest({});
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('User email is required');
    });
  });

  describe('Checkout Session Creation (AC1)', () => {
    it('should create checkout session for authenticated user', async () => {
      vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);
      vi.mocked(stripe.checkout.sessions.create).mockResolvedValue(
        mockCheckoutSession as never
      );

      const request = createRequest({});
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.url).toBe(mockCheckoutSession.url);
      expect(data.sessionId).toBe(mockCheckoutSession.id);
    });

    it('should pre-fill customer email (AC1)', async () => {
      vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);
      vi.mocked(stripe.checkout.sessions.create).mockResolvedValue(
        mockCheckoutSession as never
      );

      const request = createRequest({});
      await POST(request);

      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          customer_email: 'test@example.com',
        })
      );
    });

    it('should use correct price ID (AC1)', async () => {
      vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);
      vi.mocked(stripe.checkout.sessions.create).mockResolvedValue(
        mockCheckoutSession as never
      );

      const request = createRequest({});
      await POST(request);

      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          line_items: [
            {
              price: STRIPE_CONFIG.priceId,
              quantity: 1,
            },
          ],
        })
      );
    });

    it('should set payment mode to one-time', async () => {
      vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);
      vi.mocked(stripe.checkout.sessions.create).mockResolvedValue(
        mockCheckoutSession as never
      );

      const request = createRequest({});
      await POST(request);

      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'payment',
        })
      );
    });
  });

  describe('Metadata (AC3)', () => {
    it('should include userId in metadata', async () => {
      vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);
      vi.mocked(stripe.checkout.sessions.create).mockResolvedValue(
        mockCheckoutSession as never
      );

      const request = createRequest({});
      await POST(request);

      const createCall = vi.mocked(stripe.checkout.sessions.create).mock
        .calls[0]?.[0] as Stripe.Checkout.SessionCreateParams | undefined;
      expect(createCall?.metadata?.userId).toBe('user-123');
    });

    it('should include userEmail in metadata', async () => {
      vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);
      vi.mocked(stripe.checkout.sessions.create).mockResolvedValue(
        mockCheckoutSession as never
      );

      const request = createRequest({});
      await POST(request);

      const createCall = vi.mocked(stripe.checkout.sessions.create).mock
        .calls[0]?.[0] as Stripe.Checkout.SessionCreateParams | undefined;
      expect(createCall?.metadata?.userEmail).toBe('test@example.com');
    });

    it('should include createdAt timestamp in metadata', async () => {
      vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);
      vi.mocked(stripe.checkout.sessions.create).mockResolvedValue(
        mockCheckoutSession as never
      );

      const request = createRequest({});
      await POST(request);

      const createCall = vi.mocked(stripe.checkout.sessions.create).mock
        .calls[0]?.[0] as Stripe.Checkout.SessionCreateParams | undefined;
      expect(createCall?.metadata?.createdAt).toBeDefined();
      // Verify it's a valid ISO timestamp
      const date = new Date(createCall?.metadata?.createdAt as string);
      expect(date.toISOString()).toBe(createCall?.metadata?.createdAt);
    });

    it('should include sessionSource in metadata', async () => {
      vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);
      vi.mocked(stripe.checkout.sessions.create).mockResolvedValue(
        mockCheckoutSession as never
      );

      const request = createRequest({ sessionSource: 'tool_unlock' });
      await POST(request);

      const createCall = vi.mocked(stripe.checkout.sessions.create).mock
        .calls[0]?.[0] as Stripe.Checkout.SessionCreateParams | undefined;
      expect(createCall?.metadata?.sessionSource).toBe('tool_unlock');
    });

    it('should default sessionSource to preview_page', async () => {
      vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);
      vi.mocked(stripe.checkout.sessions.create).mockResolvedValue(
        mockCheckoutSession as never
      );

      const request = createRequest({});
      await POST(request);

      const createCall = vi.mocked(stripe.checkout.sessions.create).mock
        .calls[0]?.[0] as Stripe.Checkout.SessionCreateParams | undefined;
      expect(createCall?.metadata?.sessionSource).toBe('preview_page');
    });

    it('should include optional diagnosticResultId when provided', async () => {
      vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);
      vi.mocked(stripe.checkout.sessions.create).mockResolvedValue(
        mockCheckoutSession as never
      );

      const request = createRequest({ diagnosticResultId: 'diag-789' });
      await POST(request);

      const createCall = vi.mocked(stripe.checkout.sessions.create).mock
        .calls[0]?.[0] as Stripe.Checkout.SessionCreateParams | undefined;
      expect(createCall?.metadata?.diagnosticResultId).toBe('diag-789');
    });
  });

  describe('Success and Cancel URLs (AC4)', () => {
    it('should set success_url with session ID parameter', async () => {
      vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);
      vi.mocked(stripe.checkout.sessions.create).mockResolvedValue(
        mockCheckoutSession as never
      );

      const request = createRequest({});
      await POST(request);

      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          success_url:
            'https://example.com/purchase/success?session_id={CHECKOUT_SESSION_ID}',
        })
      );
    });

    it('should set cancel_url to preview page with parameter', async () => {
      vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);
      vi.mocked(stripe.checkout.sessions.create).mockResolvedValue(
        mockCheckoutSession as never
      );

      const request = createRequest({});
      await POST(request);

      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          cancel_url: 'https://example.com/preview?checkout=cancelled',
        })
      );
    });

    it('should use localhost when NEXT_PUBLIC_APP_URL is not set', async () => {
      delete process.env.NEXT_PUBLIC_APP_URL;
      vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);
      vi.mocked(stripe.checkout.sessions.create).mockResolvedValue(
        mockCheckoutSession as never
      );

      const request = createRequest({});
      await POST(request);

      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          success_url:
            'http://localhost:3000/purchase/success?session_id={CHECKOUT_SESSION_ID}',
          cancel_url: 'http://localhost:3000/preview?checkout=cancelled',
        })
      );
    });
  });

  describe('Error Handling (AC7)', () => {
    it('should return 502 when Stripe API fails', async () => {
      vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);
      const stripeError = new Error('Stripe API error');
      Object.setPrototypeOf(stripeError, Stripe.errors.StripeError.prototype);
      vi.mocked(stripe.checkout.sessions.create).mockRejectedValue(stripeError);

      const request = createRequest({});
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(502);
      expect(data.error).toBe('Payment service unavailable. Please try again.');
      expect(data.code).toBe('STRIPE_ERROR');
    });

    it('should return 502 when no checkout URL is returned', async () => {
      vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);
      vi.mocked(stripe.checkout.sessions.create).mockResolvedValue({
        id: 'cs_test_123',
        url: null,
      } as never);

      const request = createRequest({});
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(502);
      expect(data.error).toBe('Failed to create checkout URL');
      expect(data.code).toBe('STRIPE_ERROR');
    });

    it('should return 500 for unexpected errors', async () => {
      vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);
      vi.mocked(stripe.checkout.sessions.create).mockRejectedValue(
        new Error('Unexpected error')
      );

      const request = createRequest({});
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('An unexpected error occurred');
      expect(data.code).toBe('SERVER_ERROR');
    });

    it('should handle empty request body gracefully', async () => {
      vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);
      vi.mocked(stripe.checkout.sessions.create).mockResolvedValue(
        mockCheckoutSession as never
      );

      // Create request with no body
      const request = new NextRequest('http://localhost/api/checkout/session', {
        method: 'POST',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.url).toBeDefined();
    });
  });

  describe('Checkout Session Configuration', () => {
    it('should enable promotion codes', async () => {
      vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);
      vi.mocked(stripe.checkout.sessions.create).mockResolvedValue(
        mockCheckoutSession as never
      );

      const request = createRequest({});
      await POST(request);

      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          allow_promotion_codes: true,
        })
      );
    });

    it('should require billing address collection', async () => {
      vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);
      vi.mocked(stripe.checkout.sessions.create).mockResolvedValue(
        mockCheckoutSession as never
      );

      const request = createRequest({});
      await POST(request);

      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          billing_address_collection: 'required',
        })
      );
    });

    it('should use card payment method', async () => {
      vi.mocked(auth).mockResolvedValue({ user: mockUser } as never);
      vi.mocked(stripe.checkout.sessions.create).mockResolvedValue(
        mockCheckoutSession as never
      );

      const request = createRequest({});
      await POST(request);

      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          payment_method_types: ['card'],
        })
      );
    });
  });
});
