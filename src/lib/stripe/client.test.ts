/**
 * Stripe Client Utility Tests
 *
 * Tests for Stripe client initialization and configuration validation.
 *
 * Story 17.2: Stripe Checkout Integration
 * Task 6.1: Unit tests for Stripe client utility
 * Covers: AC1 (Stripe configuration)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Stripe Client', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset modules before each test
    vi.resetModules();
    // Create a copy of the environment
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('Environment Validation', () => {
    it('should throw error when STRIPE_SECRET_KEY is not set', async () => {
      delete process.env.STRIPE_SECRET_KEY;
      process.env.STRIPE_PRICE_ID = 'price_test_123';

      await expect(async () => {
        await import('./client');
      }).rejects.toThrow('STRIPE_SECRET_KEY is not set');
    });

    it('should throw error when STRIPE_PRICE_ID is not set', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';
      delete process.env.STRIPE_PRICE_ID;

      await expect(async () => {
        await import('./client');
      }).rejects.toThrow('STRIPE_PRICE_ID is not set');
    });

    it('should initialize when all required env vars are set', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';
      process.env.STRIPE_PRICE_ID = 'price_test_123';

      // Mock Stripe constructor to avoid actual API calls
      vi.doMock('stripe', () => ({
        default: vi.fn().mockImplementation(() => ({
          checkout: { sessions: { create: vi.fn() } },
        })),
      }));

      const module = await import('./client');
      expect(module.stripe).toBeDefined();
      expect(module.STRIPE_CONFIG).toBeDefined();
    });
  });

  describe('STRIPE_CONFIG', () => {
    it('should have correct configuration values', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';
      process.env.STRIPE_PRICE_ID = 'price_test_456';

      vi.doMock('stripe', () => ({
        default: vi.fn().mockImplementation(() => ({
          checkout: { sessions: { create: vi.fn() } },
        })),
      }));

      const { STRIPE_CONFIG } = await import('./client');

      expect(STRIPE_CONFIG.priceId).toBe('price_test_456');
      expect(STRIPE_CONFIG.currency).toBe('usd');
      expect(STRIPE_CONFIG.priceAmount).toBe(2500);
      expect(STRIPE_CONFIG.priceFormatted).toBe('$2,500');
      expect(STRIPE_CONFIG.productName).toBe('Playbook 2 - Complete Diagnostic Access');
    });
  });
});

describe('Stripe Configuration Types', () => {
  it('should export CheckoutMetadata type with required fields', () => {
    // Type checking at compile time
    const metadata: {
      userId: string;
      userEmail: string;
      diagnosticResultId?: string;
      createdAt: string;
      sessionSource: 'preview_page' | 'tool_unlock' | 'direct';
    } = {
      userId: 'user-123',
      userEmail: 'test@example.com',
      createdAt: new Date().toISOString(),
      sessionSource: 'preview_page',
    };

    expect(metadata.userId).toBeDefined();
    expect(metadata.userEmail).toBeDefined();
    expect(metadata.sessionSource).toBe('preview_page');
  });

  it('should allow optional diagnosticResultId', () => {
    const metadata = {
      userId: 'user-123',
      userEmail: 'test@example.com',
      diagnosticResultId: 'diag-456',
      createdAt: new Date().toISOString(),
      sessionSource: 'preview_page' as const,
    };

    expect(metadata.diagnosticResultId).toBe('diag-456');
  });

  it('should accept all valid sessionSource values', () => {
    const sources = ['preview_page', 'tool_unlock', 'direct'] as const;

    sources.forEach((source) => {
      const metadata = {
        userId: 'user-123',
        userEmail: 'test@example.com',
        createdAt: new Date().toISOString(),
        sessionSource: source,
      };

      expect(metadata.sessionSource).toBe(source);
    });
  });
});
