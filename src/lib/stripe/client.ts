/**
 * Stripe Server-Side Client
 *
 * Singleton Stripe instance for server-side API operations.
 * Handles checkout session creation, webhook signature verification, etc.
 *
 * Story 17.2: Stripe Checkout Integration
 * Task 3: Create Stripe client utility
 * Covers: AC1 (Stripe Checkout Session API)
 */

import Stripe from 'stripe';

/**
 * Lazy-initialized Stripe client singleton
 *
 * We use lazy initialization to avoid throwing errors during Next.js build
 * when environment variables may not be available. The client is only
 * instantiated when first accessed at runtime.
 */
let _stripe: Stripe | null = null;

/**
 * Get the Stripe client instance
 *
 * Validates environment variables and creates the client on first access.
 * Throws at runtime if required env vars are missing.
 */
export function getStripe(): Stripe {
  if (_stripe) {
    return _stripe;
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error(
      'STRIPE_SECRET_KEY is not set. Add it to your .env.local file.'
    );
  }

  _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-01-28.clover',
    typescript: true,
  });

  return _stripe;
}

/**
 * Stripe client instance (legacy export for backward compatibility)
 *
 * @deprecated Use getStripe() instead for lazy initialization
 */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return getStripe()[prop as keyof Stripe];
  },
});

/**
 * Get the Stripe Price ID with validation
 */
export function getStripePriceId(): string {
  if (!process.env.STRIPE_PRICE_ID) {
    throw new Error(
      'STRIPE_PRICE_ID is not set. Add it to your .env.local file.'
    );
  }
  return process.env.STRIPE_PRICE_ID;
}

/**
 * Stripe configuration constants
 *
 * Centralizes product and pricing information for consistent use
 * across checkout, webhooks, and display components.
 */
export const STRIPE_CONFIG = {
  /**
   * Stripe Price ID for Playbook 2 ($2,500 one-time payment)
   * Use getStripePriceId() for runtime access with validation
   */
  get priceId(): string {
    return getStripePriceId();
  },

  /**
   * Currency for all transactions
   */
  currency: 'usd' as const,

  /**
   * Product display name
   */
  productName: 'Playbook 2 - Complete Diagnostic Access',

  /**
   * Product description shown on checkout
   */
  productDescription:
    'Full access to all 10 diagnostic tools with personalized transformation roadmap',

  /**
   * Price amount in dollars (for display purposes)
   */
  priceAmount: 2500,

  /**
   * Formatted price string (for display purposes)
   */
  priceFormatted: '$2,500',
} as const;

/**
 * Type for Stripe configuration
 */
export type StripeConfig = typeof STRIPE_CONFIG;

/**
 * Metadata fields required for checkout sessions
 *
 * Used for webhook reconciliation and analytics.
 */
export interface CheckoutMetadata {
  userId: string;
  userEmail: string;
  diagnosticResultId?: string;
  createdAt: string;
  sessionSource: 'preview_page' | 'tool_unlock' | 'direct';
}

/**
 * Response type for checkout session creation
 */
export interface CreateCheckoutSessionResponse {
  url: string;
  sessionId: string;
}

/**
 * Error response type for checkout session creation
 */
export interface CheckoutSessionError {
  error: string;
  code: 'STRIPE_ERROR' | 'CONFIG_ERROR' | 'SERVER_ERROR';
}
