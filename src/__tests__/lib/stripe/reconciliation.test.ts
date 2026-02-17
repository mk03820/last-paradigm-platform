/**
 * Stripe Reconciliation Service Tests
 *
 * Tests for the payment reconciliation functionality.
 *
 * Story 17.5: Webhook Retry & Recovery
 * Task 6.6: Test Stripe reconciliation accuracy
 * Covers: AC7 (identify and process missing purchases)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  reconcileStripePayments,
  findMissingPurchases,
} from '@/lib/stripe/reconciliation';
import type Stripe from 'stripe';

// Mock Stripe client
vi.mock('@/lib/stripe/client', () => ({
  stripe: {
    checkout: {
      sessions: {
        list: vi.fn(),
      },
    },
  },
}));

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('@/lib/db/schema', () => ({
  purchases: { id: 'id', stripeSessionId: 'stripe_session_id' },
  users: { id: 'id', email: 'email' },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((a, b) => ({ field: a, value: b })),
}));

import { stripe } from '@/lib/stripe/client';
import { db } from '@/lib/db';

describe('reconcileStripePayments', () => {
  const mockSession = (overrides: Partial<Stripe.Checkout.Session> = {}): Stripe.Checkout.Session => ({
    id: 'cs_test_123',
    object: 'checkout.session',
    amount_total: 250000,
    currency: 'usd',
    customer: 'cus_test_123',
    customer_email: 'test@example.com',
    payment_intent: 'pi_test_123',
    payment_status: 'paid',
    status: 'complete',
    created: Math.floor(Date.now() / 1000),
    metadata: {
      userId: 'user_123',
    },
    mode: 'payment',
    livemode: false,
    ...overrides,
  } as Stripe.Checkout.Session);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Session Fetching', () => {
    it('should fetch completed sessions from Stripe', async () => {
      vi.mocked(stripe.checkout.sessions.list).mockResolvedValue({
        data: [],
        object: 'list',
        has_more: false,
        url: '/v1/checkout/sessions',
      } as Stripe.ApiList<Stripe.Checkout.Session>);

      await reconcileStripePayments();

      expect(stripe.checkout.sessions.list).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'complete',
          limit: 100,
        })
      );
    });

    it('should use default 7-day lookback', async () => {
      vi.mocked(stripe.checkout.sessions.list).mockResolvedValue({
        data: [],
        object: 'list',
        has_more: false,
        url: '/v1/checkout/sessions',
      } as Stripe.ApiList<Stripe.Checkout.Session>);

      const beforeCall = Date.now();
      await reconcileStripePayments();
      const afterCall = Date.now();

      expect(stripe.checkout.sessions.list).toHaveBeenCalledWith(
        expect.objectContaining({
          created: {
            gte: expect.any(Number),
          },
        })
      );

      const calledWith = vi.mocked(stripe.checkout.sessions.list).mock.calls[0][0];
      const createdGte = calledWith?.created as { gte: number };
      const expectedMin = Math.floor((beforeCall - 7 * 24 * 60 * 60 * 1000) / 1000);
      const expectedMax = Math.floor((afterCall - 7 * 24 * 60 * 60 * 1000) / 1000);

      expect(createdGte.gte).toBeGreaterThanOrEqual(expectedMin - 1);
      expect(createdGte.gte).toBeLessThanOrEqual(expectedMax + 1);
    });

    it('should use custom start date when provided', async () => {
      vi.mocked(stripe.checkout.sessions.list).mockResolvedValue({
        data: [],
        object: 'list',
        has_more: false,
        url: '/v1/checkout/sessions',
      } as Stripe.ApiList<Stripe.Checkout.Session>);

      const customDate = new Date('2026-01-15');
      await reconcileStripePayments(customDate);

      expect(stripe.checkout.sessions.list).toHaveBeenCalledWith(
        expect.objectContaining({
          created: {
            gte: Math.floor(customDate.getTime() / 1000),
          },
        })
      );
    });
  });

  describe('Matching Logic', () => {
    it('should count matched sessions correctly', async () => {
      vi.mocked(stripe.checkout.sessions.list).mockResolvedValue({
        data: [mockSession({ id: 'cs_test_1' }), mockSession({ id: 'cs_test_2' })],
        object: 'list',
        has_more: false,
        url: '/v1/checkout/sessions',
      } as Stripe.ApiList<Stripe.Checkout.Session>);

      // Both sessions exist in database
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: 'purchase_123' }]),
          }),
        }),
      } as never);

      const result = await reconcileStripePayments();

      expect(result.total).toBe(2);
      expect(result.matched).toBe(2);
      expect(result.missing).toBe(0);
    });

    it('should count missing sessions correctly', async () => {
      vi.mocked(stripe.checkout.sessions.list).mockResolvedValue({
        data: [mockSession({ id: 'cs_test_1' }), mockSession({ id: 'cs_test_2' })],
        object: 'list',
        has_more: false,
        url: '/v1/checkout/sessions',
      } as Stripe.ApiList<Stripe.Checkout.Session>);

      // No sessions exist in database
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as never);

      const result = await reconcileStripePayments();

      expect(result.total).toBe(2);
      expect(result.matched).toBe(0);
      expect(result.missing).toBe(2);
    });

    it('should handle mixed matched and missing', async () => {
      vi.mocked(stripe.checkout.sessions.list).mockResolvedValue({
        data: [
          mockSession({ id: 'cs_test_1' }),
          mockSession({ id: 'cs_test_2' }),
          mockSession({ id: 'cs_test_3' }),
        ],
        object: 'list',
        has_more: false,
        url: '/v1/checkout/sessions',
      } as Stripe.ApiList<Stripe.Checkout.Session>);

      // First exists, second and third don't
      vi.mocked(db.select)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([{ id: 'purchase_123' }]),
            }),
          }),
        } as never)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        } as never)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        } as never);

      const result = await reconcileStripePayments();

      expect(result.matched).toBe(1);
      expect(result.missing).toBe(2);
    });
  });

  describe('Auto Processing', () => {
    it('should not process when autoProcess is false', async () => {
      vi.mocked(stripe.checkout.sessions.list).mockResolvedValue({
        data: [mockSession()],
        object: 'list',
        has_more: false,
        url: '/v1/checkout/sessions',
      } as Stripe.ApiList<Stripe.Checkout.Session>);

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as never);

      const result = await reconcileStripePayments(undefined, false);

      expect(result.processed).toBe(0);
      expect(db.insert).not.toHaveBeenCalled();
    });

    it('should process missing sessions when autoProcess is true', async () => {
      const session = mockSession({ metadata: { userId: 'user_123' } });
      vi.mocked(stripe.checkout.sessions.list).mockResolvedValue({
        data: [session],
        object: 'list',
        has_more: false,
        url: '/v1/checkout/sessions',
      } as Stripe.ApiList<Stripe.Checkout.Session>);

      // Session not in database, then user exists
      vi.mocked(db.select)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        } as never)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([{ id: 'user_123' }]),
            }),
          }),
        } as never);

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      } as never);

      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      } as never);

      const result = await reconcileStripePayments(undefined, true);

      expect(result.processed).toBe(1);
      expect(db.insert).toHaveBeenCalled();
    });

    it('should create purchase record with correct data', async () => {
      const session = mockSession({
        id: 'cs_test_xyz',
        payment_intent: 'pi_test_xyz',
        customer: 'cus_test_xyz',
        amount_total: 500000,
        currency: 'eur',
        metadata: { userId: 'user_abc' },
      });

      vi.mocked(stripe.checkout.sessions.list).mockResolvedValue({
        data: [session],
        object: 'list',
        has_more: false,
        url: '/v1/checkout/sessions',
      } as Stripe.ApiList<Stripe.Checkout.Session>);

      vi.mocked(db.select)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        } as never)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([{ id: 'user_abc' }]),
            }),
          }),
        } as never);

      const insertValuesMock = vi.fn().mockResolvedValue(undefined);
      vi.mocked(db.insert).mockReturnValue({
        values: insertValuesMock,
      } as never);

      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      } as never);

      await reconcileStripePayments(undefined, true);

      expect(insertValuesMock).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user_abc',
          stripeSessionId: 'cs_test_xyz',
          stripePaymentIntentId: 'pi_test_xyz',
          stripeCustomerId: 'cus_test_xyz',
          amount: 500000,
          currency: 'eur',
          status: 'completed',
        })
      );
    });

    it('should update user access after creating purchase', async () => {
      vi.mocked(stripe.checkout.sessions.list).mockResolvedValue({
        data: [mockSession()],
        object: 'list',
        has_more: false,
        url: '/v1/checkout/sessions',
      } as Stripe.ApiList<Stripe.Checkout.Session>);

      vi.mocked(db.select)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        } as never)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([{ id: 'user_123' }]),
            }),
          }),
        } as never);

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      } as never);

      const updateSetMock = vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      });
      vi.mocked(db.update).mockReturnValue({
        set: updateSetMock,
      } as never);

      await reconcileStripePayments(undefined, true);

      expect(updateSetMock).toHaveBeenCalledWith(
        expect.objectContaining({
          hasPb2Access: true,
          purchaseStatus: 'completed',
        })
      );
    });
  });

  describe('User Resolution', () => {
    it('should use userId from metadata when available', async () => {
      const session = mockSession({ metadata: { userId: 'user_from_metadata' } });
      vi.mocked(stripe.checkout.sessions.list).mockResolvedValue({
        data: [session],
        object: 'list',
        has_more: false,
        url: '/v1/checkout/sessions',
      } as Stripe.ApiList<Stripe.Checkout.Session>);

      vi.mocked(db.select)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        } as never)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([{ id: 'user_from_metadata' }]),
            }),
          }),
        } as never);

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      } as never);

      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      } as never);

      const result = await reconcileStripePayments(undefined, true);

      expect(result.processedSessions[0].userId).toBe('user_from_metadata');
    });

    it('should fall back to email lookup when no userId in metadata', async () => {
      const session = mockSession({
        metadata: {},
        customer_email: 'test@example.com',
      });
      vi.mocked(stripe.checkout.sessions.list).mockResolvedValue({
        data: [session],
        object: 'list',
        has_more: false,
        url: '/v1/checkout/sessions',
      } as Stripe.ApiList<Stripe.Checkout.Session>);

      vi.mocked(db.select)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        } as never)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([{ id: 'user_from_email' }]),
            }),
          }),
        } as never);

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      } as never);

      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      } as never);

      const result = await reconcileStripePayments(undefined, true);

      expect(result.processedSessions[0].userId).toBe('user_from_email');
    });

    it('should report error when user cannot be resolved', async () => {
      const session = mockSession({
        id: 'cs_unresolvable',
        metadata: {},
        customer_email: 'unknown@example.com',
      });
      vi.mocked(stripe.checkout.sessions.list).mockResolvedValue({
        data: [session],
        object: 'list',
        has_more: false,
        url: '/v1/checkout/sessions',
      } as Stripe.ApiList<Stripe.Checkout.Session>);

      vi.mocked(db.select)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        } as never)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        } as never);

      const result = await reconcileStripePayments(undefined, true);

      expect(result.processed).toBe(0);
      expect(result.errors).toContain(
        expect.stringContaining('cs_unresolvable')
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle Stripe API errors', async () => {
      vi.mocked(stripe.checkout.sessions.list).mockRejectedValue(
        new Error('Stripe API error')
      );

      const result = await reconcileStripePayments();

      expect(result.errors).toContain(
        expect.stringContaining('Stripe API error')
      );
    });

    it('should handle database errors during processing', async () => {
      vi.mocked(stripe.checkout.sessions.list).mockResolvedValue({
        data: [mockSession()],
        object: 'list',
        has_more: false,
        url: '/v1/checkout/sessions',
      } as Stripe.ApiList<Stripe.Checkout.Session>);

      vi.mocked(db.select)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        } as never)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([{ id: 'user_123' }]),
            }),
          }),
        } as never);

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockRejectedValue(new Error('Database error')),
      } as never);

      const result = await reconcileStripePayments(undefined, true);

      expect(result.processed).toBe(0);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should continue processing after individual session errors', async () => {
      vi.mocked(stripe.checkout.sessions.list).mockResolvedValue({
        data: [
          mockSession({ id: 'cs_fail', metadata: {} }),
          mockSession({ id: 'cs_success', metadata: { userId: 'user_123' } }),
        ],
        object: 'list',
        has_more: false,
        url: '/v1/checkout/sessions',
      } as Stripe.ApiList<Stripe.Checkout.Session>);

      // First session can't find user, second session succeeds
      vi.mocked(db.select)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        } as never)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        } as never)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        } as never)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([{ id: 'user_123' }]),
            }),
          }),
        } as never);

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      } as never);

      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      } as never);

      const result = await reconcileStripePayments(undefined, true);

      expect(result.missing).toBe(2);
      expect(result.processed).toBe(1);
      expect(result.errors.length).toBe(1);
    });
  });

  describe('Result Summary', () => {
    it('should return correct totals', async () => {
      vi.mocked(stripe.checkout.sessions.list).mockResolvedValue({
        data: [
          mockSession({ id: 'cs_1' }),
          mockSession({ id: 'cs_2' }),
          mockSession({ id: 'cs_3' }),
        ],
        object: 'list',
        has_more: false,
        url: '/v1/checkout/sessions',
      } as Stripe.ApiList<Stripe.Checkout.Session>);

      // First matched, second and third missing
      vi.mocked(db.select)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([{ id: 'p_1' }]),
            }),
          }),
        } as never)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        } as never)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        } as never);

      const result = await reconcileStripePayments();

      expect(result.total).toBe(3);
      expect(result.matched).toBe(1);
      expect(result.missing).toBe(2);
      expect(result.total).toBe(result.matched + result.missing);
    });

    it('should include processed session details', async () => {
      const session = mockSession({
        id: 'cs_processed',
        amount_total: 300000,
        metadata: { userId: 'user_xyz' },
      });
      vi.mocked(stripe.checkout.sessions.list).mockResolvedValue({
        data: [session],
        object: 'list',
        has_more: false,
        url: '/v1/checkout/sessions',
      } as Stripe.ApiList<Stripe.Checkout.Session>);

      vi.mocked(db.select)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        } as never)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([{ id: 'user_xyz' }]),
            }),
          }),
        } as never);

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      } as never);

      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      } as never);

      const result = await reconcileStripePayments(undefined, true);

      expect(result.processedSessions).toEqual([
        {
          sessionId: 'cs_processed',
          userId: 'user_xyz',
          amount: 300000,
        },
      ]);
    });
  });
});

describe('findMissingPurchases', () => {
  const mockSession = (overrides: Partial<Stripe.Checkout.Session> = {}): Stripe.Checkout.Session => ({
    id: 'cs_test_123',
    object: 'checkout.session',
    amount_total: 250000,
    currency: 'usd',
    customer_email: 'test@example.com',
    payment_status: 'paid',
    status: 'complete',
    created: Math.floor(Date.now() / 1000),
    metadata: { userId: 'user_123' },
    mode: 'payment',
    livemode: false,
    ...overrides,
  } as Stripe.Checkout.Session);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return empty array when all sessions are matched', async () => {
    vi.mocked(stripe.checkout.sessions.list).mockResolvedValue({
      data: [mockSession()],
      object: 'list',
      has_more: false,
      url: '/v1/checkout/sessions',
    } as Stripe.ApiList<Stripe.Checkout.Session>);

    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ id: 'purchase_123' }]),
        }),
      }),
    } as never);

    const result = await findMissingPurchases();

    expect(result).toEqual([]);
  });

  it('should return missing purchases with correct data', async () => {
    const session = mockSession({
      id: 'cs_missing',
      customer_email: 'missing@example.com',
      amount_total: 500000,
      payment_status: 'paid',
      created: 1700000000,
      metadata: { userId: 'user_missing' },
    });

    vi.mocked(stripe.checkout.sessions.list).mockResolvedValue({
      data: [session],
      object: 'list',
      has_more: false,
      url: '/v1/checkout/sessions',
    } as Stripe.ApiList<Stripe.Checkout.Session>);

    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    } as never);

    const result = await findMissingPurchases();

    expect(result).toEqual([
      {
        sessionId: 'cs_missing',
        email: 'missing@example.com',
        amount: 500000,
        created: new Date(1700000000 * 1000),
        paymentStatus: 'paid',
        metadata: { userId: 'user_missing' },
      },
    ]);
  });

  it('should handle multiple missing purchases', async () => {
    vi.mocked(stripe.checkout.sessions.list).mockResolvedValue({
      data: [
        mockSession({ id: 'cs_1' }),
        mockSession({ id: 'cs_2' }),
      ],
      object: 'list',
      has_more: false,
      url: '/v1/checkout/sessions',
    } as Stripe.ApiList<Stripe.Checkout.Session>);

    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    } as never);

    const result = await findMissingPurchases();

    expect(result).toHaveLength(2);
  });

  it('should handle Stripe API errors gracefully', async () => {
    vi.mocked(stripe.checkout.sessions.list).mockRejectedValue(
      new Error('Stripe error')
    );

    const result = await findMissingPurchases();

    expect(result).toEqual([]);
  });

  it('should use custom start date', async () => {
    vi.mocked(stripe.checkout.sessions.list).mockResolvedValue({
      data: [],
      object: 'list',
      has_more: false,
      url: '/v1/checkout/sessions',
    } as Stripe.ApiList<Stripe.Checkout.Session>);

    const customDate = new Date('2026-01-01');
    await findMissingPurchases(customDate);

    expect(stripe.checkout.sessions.list).toHaveBeenCalledWith(
      expect.objectContaining({
        created: {
          gte: Math.floor(customDate.getTime() / 1000),
        },
      })
    );
  });
});
