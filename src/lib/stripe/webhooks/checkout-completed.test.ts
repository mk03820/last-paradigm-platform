/**
 * Checkout Completed Handler Tests
 *
 * Tests for the handleCheckoutCompleted webhook handler.
 *
 * Story 17.4: Stripe Webhook Handler
 * Task 6.2: Unit tests for checkout completed handler
 * Covers: AC2, AC3, AC4, AC6
 *
 * Story 18.1: Document Generation Job Infrastructure
 * Task 6: Tests for toolkit generation trigger integration
 * Covers: AC1 (toolkit/generate event triggered on purchase)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handleCheckoutCompleted } from './checkout-completed';
import type Stripe from 'stripe';

// Mock Inngest client - use hoisted approach
vi.mock('@/lib/inngest/client', () => ({
  inngest: {
    send: vi.fn().mockResolvedValue({ ids: ['evt-123'] }),
  },
}));

// Import after mocking to get the mocked version
import { inngest } from '@/lib/inngest/client';
const mockInngestSend = vi.mocked(inngest.send);

// Mock the database module
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    transaction: vi.fn(),
  },
}));

vi.mock('@/lib/db/schema', () => ({
  users: { id: 'id', email: 'email' },
  purchases: { id: 'id', stripeSessionId: 'stripe_session_id' },
  diagnosticResults: { userId: 'user_id', toolResults: 'tool_results', completedAt: 'completed_at' },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((a, b) => ({ field: a, value: b })),
  desc: vi.fn((col) => ({ column: col, order: 'desc' })),
}));

import { db } from '@/lib/db';

describe('handleCheckoutCompleted', () => {
  const mockUserId = 'user-123';
  const mockSessionId = 'cs_test_123456789';
  const mockPurchaseId = 'purchase-456';

  const createMockSession = (
    overrides: Partial<Stripe.Checkout.Session> = {}
  ): Stripe.Checkout.Session => ({
    id: mockSessionId,
    object: 'checkout.session',
    amount_total: 250000,
    currency: 'usd',
    customer: 'cus_test_123',
    customer_email: 'test@example.com',
    payment_intent: 'pi_test_123',
    payment_status: 'paid',
    status: 'complete',
    metadata: {
      userId: mockUserId,
      userEmail: 'test@example.com',
      createdAt: new Date().toISOString(),
      sessionSource: 'preview_page',
    },
    mode: 'payment',
    livemode: false,
    ...overrides,
  } as Stripe.Checkout.Session);

  // Helper to create mock select chain for diagnostic results
  const createDiagnosticSelectMock = (toolResults: Record<string, unknown> | null) => ({
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        orderBy: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue(
            toolResults ? [{ toolResults }] : []
          ),
        }),
      }),
    }),
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockInngestSend.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('User Identification', () => {
    it('should process checkout with userId from metadata (AC2)', async () => {
      const mockSession = createMockSession();

      // Mock: no existing purchase
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as never);

      // Mock transaction
      vi.mocked(db.transaction).mockImplementation(async (callback) => {
        const tx = {
          insert: vi.fn().mockReturnValue({
            values: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue([{ id: mockPurchaseId }]),
            }),
          }),
          update: vi.fn().mockReturnValue({
            set: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue(undefined),
            }),
          }),
        };
        return callback(tx as never);
      });

      const result = await handleCheckoutCompleted(mockSession);

      expect(result.success).toBe(true);
      expect(result.userId).toBe(mockUserId);
      expect(result.purchaseId).toBe(mockPurchaseId);
    });

    it('should fallback to email lookup when userId is missing', async () => {
      const mockSession = createMockSession({
        metadata: {
          userEmail: 'test@example.com',
        },
      });

      // Mock: find user by email
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: mockUserId }]),
          }),
        }),
      } as never);

      // Mock: no existing purchase
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as never);

      // Mock transaction
      vi.mocked(db.transaction).mockImplementation(async (callback) => {
        const tx = {
          insert: vi.fn().mockReturnValue({
            values: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue([{ id: mockPurchaseId }]),
            }),
          }),
          update: vi.fn().mockReturnValue({
            set: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue(undefined),
            }),
          }),
        };
        return callback(tx as never);
      });

      const result = await handleCheckoutCompleted(mockSession);

      expect(result.success).toBe(true);
      expect(result.userId).toBe(mockUserId);
    });

    it('should throw error when user cannot be identified', async () => {
      const mockSession = createMockSession({
        metadata: {},
        customer_email: null,
      });

      await expect(handleCheckoutCompleted(mockSession)).rejects.toThrow(
        'Missing user identification in checkout session'
      );
    });
  });

  describe('Purchase Record Creation (AC3)', () => {
    it('should create purchase record with correct fields', async () => {
      const mockSession = createMockSession();

      // Mock: no existing purchase
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as never);

      let capturedValues: Record<string, unknown> | undefined;

      // Mock transaction
      vi.mocked(db.transaction).mockImplementation(async (callback) => {
        const tx = {
          insert: vi.fn().mockReturnValue({
            values: vi.fn().mockImplementation((values) => {
              capturedValues = values;
              return {
                returning: vi.fn().mockResolvedValue([{ id: mockPurchaseId }]),
              };
            }),
          }),
          update: vi.fn().mockReturnValue({
            set: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue(undefined),
            }),
          }),
        };
        return callback(tx as never);
      });

      await handleCheckoutCompleted(mockSession);

      expect(capturedValues).toBeDefined();
      expect(capturedValues?.userId).toBe(mockUserId);
      expect(capturedValues?.stripeSessionId).toBe(mockSessionId);
      expect(capturedValues?.stripePaymentIntentId).toBe('pi_test_123');
      expect(capturedValues?.stripeCustomerId).toBe('cus_test_123');
      expect(capturedValues?.amount).toBe(250000);
      expect(capturedValues?.currency).toBe('usd');
      expect(capturedValues?.status).toBe('completed');
    });
  });

  describe('User Access Update (AC4)', () => {
    it('should update user hasPb2Access to true', async () => {
      const mockSession = createMockSession();

      // Mock: no existing purchase
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as never);

      let capturedUserUpdate: Record<string, unknown> | undefined;

      // Mock transaction
      vi.mocked(db.transaction).mockImplementation(async (callback) => {
        const tx = {
          insert: vi.fn().mockReturnValue({
            values: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue([{ id: mockPurchaseId }]),
            }),
          }),
          update: vi.fn().mockReturnValue({
            set: vi.fn().mockImplementation((values) => {
              capturedUserUpdate = values;
              return {
                where: vi.fn().mockResolvedValue(undefined),
              };
            }),
          }),
        };
        return callback(tx as never);
      });

      await handleCheckoutCompleted(mockSession);

      expect(capturedUserUpdate).toBeDefined();
      expect(capturedUserUpdate?.hasPb2Access).toBe(true);
      expect(capturedUserUpdate?.purchaseStatus).toBe('completed');
      expect(capturedUserUpdate?.pb2PurchasedAt).toBeInstanceOf(Date);
    });
  });

  describe('Idempotency (AC6)', () => {
    it('should return alreadyProcessed for existing purchase', async () => {
      const mockSession = createMockSession();

      // Mock: existing purchase found
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: mockPurchaseId }]),
          }),
        }),
      } as never);

      const result = await handleCheckoutCompleted(mockSession);

      expect(result.success).toBe(true);
      expect(result.alreadyProcessed).toBe(true);
      expect(result.purchaseId).toBe(mockPurchaseId);
      expect(db.transaction).not.toHaveBeenCalled();
    });

    it('should handle unique constraint violation gracefully', async () => {
      const mockSession = createMockSession();

      // Mock: no existing purchase initially
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as never);

      // Mock transaction that throws unique constraint error
      vi.mocked(db.transaction).mockRejectedValue(
        new Error('unique constraint violation')
      );

      const result = await handleCheckoutCompleted(mockSession);

      expect(result.success).toBe(true);
      expect(result.alreadyProcessed).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should propagate non-duplicate errors', async () => {
      const mockSession = createMockSession();

      // Mock: no existing purchase
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as never);

      // Mock transaction that throws database error
      vi.mocked(db.transaction).mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(handleCheckoutCompleted(mockSession)).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should handle null payment_intent', async () => {
      const mockSession = createMockSession({
        payment_intent: null,
      });

      // Mock: no existing purchase, then diagnostic results
      vi.mocked(db.select)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        } as never)
        .mockReturnValueOnce(createDiagnosticSelectMock({}) as never);

      let capturedValues: Record<string, unknown> | undefined;

      // Mock transaction
      vi.mocked(db.transaction).mockImplementation(async (callback) => {
        const tx = {
          insert: vi.fn().mockReturnValue({
            values: vi.fn().mockImplementation((values) => {
              capturedValues = values;
              return {
                returning: vi.fn().mockResolvedValue([{ id: mockPurchaseId }]),
              };
            }),
          }),
          update: vi.fn().mockReturnValue({
            set: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue(undefined),
            }),
          }),
        };
        return callback(tx as never);
      });

      const result = await handleCheckoutCompleted(mockSession);

      expect(result.success).toBe(true);
      expect(capturedValues?.stripePaymentIntentId).toBeNull();
    });
  });

  describe('Toolkit Generation Trigger (Story 18.1 - AC1)', () => {
    it('should trigger toolkit/generate event after successful purchase', async () => {
      const mockSession = createMockSession();
      const mockDiagnosticData = {
        tool1: { compositeScore: 75 },
        tool2: { wastedCost: 500000 },
      };

      // Mock: no existing purchase, then diagnostic results
      vi.mocked(db.select)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        } as never)
        .mockReturnValueOnce(createDiagnosticSelectMock(mockDiagnosticData) as never);

      // Mock transaction
      vi.mocked(db.transaction).mockImplementation(async (callback) => {
        const tx = {
          insert: vi.fn().mockReturnValue({
            values: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue([{ id: mockPurchaseId }]),
            }),
          }),
          update: vi.fn().mockReturnValue({
            set: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue(undefined),
            }),
          }),
        };
        return callback(tx as never);
      });

      const result = await handleCheckoutCompleted(mockSession);

      expect(result.success).toBe(true);
      expect(mockInngestSend).toHaveBeenCalledTimes(1);
      expect(mockInngestSend).toHaveBeenCalledWith({
        name: 'toolkit/generate',
        data: {
          userId: mockUserId,
          purchaseId: mockPurchaseId,
          diagnosticData: mockDiagnosticData,
        },
      });
    });

    it('should trigger toolkit generation with empty data when no diagnostic results exist', async () => {
      const mockSession = createMockSession();

      // Mock: no existing purchase, no diagnostic results
      vi.mocked(db.select)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        } as never)
        .mockReturnValueOnce(createDiagnosticSelectMock(null) as never);

      // Mock transaction
      vi.mocked(db.transaction).mockImplementation(async (callback) => {
        const tx = {
          insert: vi.fn().mockReturnValue({
            values: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue([{ id: mockPurchaseId }]),
            }),
          }),
          update: vi.fn().mockReturnValue({
            set: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue(undefined),
            }),
          }),
        };
        return callback(tx as never);
      });

      const result = await handleCheckoutCompleted(mockSession);

      expect(result.success).toBe(true);
      expect(mockInngestSend).toHaveBeenCalledTimes(1);
      expect(mockInngestSend).toHaveBeenCalledWith({
        name: 'toolkit/generate',
        data: {
          userId: mockUserId,
          purchaseId: mockPurchaseId,
          diagnosticData: {},
        },
      });
    });

    it('should not fail purchase if toolkit generation trigger fails', async () => {
      const mockSession = createMockSession();

      // Mock: no existing purchase, then diagnostic results query fails
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
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockRejectedValue(new Error('Database error')),
              }),
            }),
          }),
        } as never);

      // Mock transaction
      vi.mocked(db.transaction).mockImplementation(async (callback) => {
        const tx = {
          insert: vi.fn().mockReturnValue({
            values: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue([{ id: mockPurchaseId }]),
            }),
          }),
          update: vi.fn().mockReturnValue({
            set: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue(undefined),
            }),
          }),
        };
        return callback(tx as never);
      });

      // Purchase should still succeed even if toolkit trigger fails
      const result = await handleCheckoutCompleted(mockSession);

      expect(result.success).toBe(true);
      expect(result.purchaseId).toBe(mockPurchaseId);
      // Inngest send should not have been called due to error
      expect(mockInngestSend).not.toHaveBeenCalled();
    });

    it('should not trigger toolkit generation for already processed purchase', async () => {
      const mockSession = createMockSession();

      // Mock: existing purchase found
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: mockPurchaseId }]),
          }),
        }),
      } as never);

      const result = await handleCheckoutCompleted(mockSession);

      expect(result.success).toBe(true);
      expect(result.alreadyProcessed).toBe(true);
      expect(mockInngestSend).not.toHaveBeenCalled();
    });
  });
});
