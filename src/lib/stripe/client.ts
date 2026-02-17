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
 * Validate required environment variables at module load
 */
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error(
    'STRIPE_SECRET_KEY is not set. Add it to your .env.local file.'
  );
}

if (!process.env.STRIPE_PRICE_ID) {
  throw new Error(
    'STRIPE_PRICE_ID is not set. Add it to your .env.local file.'
  );
}

/**
 * Singleton Stripe client instance
 *
 * Uses the latest stable API version with TypeScript support enabled.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  typescript: true,
});

/**
 * Stripe configuration constants
 *
 * Centralizes product and pricing information for consistent use
 * across checkout, webhooks, and display components.
 */
export const STRIPE_CONFIG = {
  /**
   * Stripe Price ID for Playbook 2 ($2,500 one-time payment)
   */
  priceId: process.env.STRIPE_PRICE_ID!,

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
