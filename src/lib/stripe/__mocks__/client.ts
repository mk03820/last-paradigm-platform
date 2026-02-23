/**
 * Mock Stripe Client for Testing
 *
 * Provides a mock implementation of the Stripe client for unit tests.
 * All methods return predictable mock data.
 *
 * Story 17.2: Stripe Checkout Integration
 * Task 6: Write comprehensive tests
 */

import { vi } from 'vitest';

/**
 * Mock checkout session response
 */
export const mockCheckoutSession = {
  id: 'cs_test_123456789',
  url: 'https://checkout.stripe.com/c/pay/cs_test_123456789',
  payment_status: 'unpaid',
  status: 'open',
  customer_email: 'test@example.com',
  metadata: {
    userId: 'user-123',
    userEmail: 'test@example.com',
    createdAt: '2024-01-15T10:00:00.000Z',
    sessionSource: 'preview_page',
  },
};

/**
 * Mock Stripe client with mocked methods
 */
export const stripe = {
  checkout: {
    sessions: {
      create: vi.fn().mockResolvedValue(mockCheckoutSession),
      retrieve: vi.fn().mockResolvedValue(mockCheckoutSession),
      list: vi.fn().mockResolvedValue({ data: [mockCheckoutSession] }),
    },
  },
  prices: {
    retrieve: vi.fn().mockResolvedValue({
      id: 'price_test_123',
      unit_amount: 250000,
      currency: 'usd',
      product: 'prod_test_123',
    }),
  },
  products: {
    retrieve: vi.fn().mockResolvedValue({
      id: 'prod_test_123',
      name: 'Playbook 2 - Complete Diagnostic Access',
      description: 'Full access to all 10 diagnostic tools',
    }),
  },
};

/**
 * Mock Stripe configuration
 */
export const STRIPE_CONFIG = {
  priceId: 'price_test_123',
  currency: 'usd' as const,
  productName: 'Playbook 2 - Complete Diagnostic Access',
  productDescription:
    'Full access to all 10 diagnostic tools with personalized transformation roadmap',
  priceAmount: 2500,
  priceFormatted: '$2,500',
} as const;

/**
 * Mock types for checkout metadata
 */
export interface CheckoutMetadata {
  userId: string;
  userEmail: string;
  diagnosticResultId?: string;
  createdAt: string;
  sessionSource: 'preview_page' | 'tool_unlock' | 'direct';
}

export interface CreateCheckoutSessionResponse {
  url: string;
  sessionId: string;
}

export interface CheckoutSessionError {
  error: string;
  code: 'STRIPE_ERROR' | 'CONFIG_ERROR' | 'SERVER_ERROR';
}

/**
 * Helper to reset all mocks
 */
export function resetStripeMocks(): void {
  stripe.checkout.sessions.create.mockClear();
  stripe.checkout.sessions.retrieve.mockClear();
  stripe.checkout.sessions.list.mockClear();
  stripe.prices.retrieve.mockClear();
  stripe.products.retrieve.mockClear();
}

/**
 * Helper to simulate Stripe API error
 */
export function mockStripeError(
  method: keyof typeof stripe.checkout.sessions,
  errorType: 'card_declined' | 'api_error' | 'invalid_request'
): void {
  const error = new Error(`Stripe ${errorType}`);
  (error as unknown as { type: string }).type = errorType;
  stripe.checkout.sessions[method].mockRejectedValueOnce(error);
}
