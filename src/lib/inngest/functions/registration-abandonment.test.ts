/**
 * Registration Abandonment Function Tests
 *
 * Tests for the registration abandonment recovery Inngest function.
 *
 * Story 15.9: Registration Abandonment Recovery
 * Covers: Task 4, AC1 (1-hour trigger), AC5 (One email per abandonment), AC6 (Cancel if completed)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue([{ id: 'user-123' }]),
        })),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn().mockResolvedValue(undefined),
      })),
    })),
  },
}));

// Mock the schema
vi.mock('@/lib/db/schema', () => ({
  users: {
    id: 'id',
    email: 'email',
  },
  abandonedRegistrations: {
    email: 'email',
    completedAt: 'completed_at',
    emailSentAt: 'email_sent_at',
  },
}));

// Mock drizzle-orm
vi.mock('drizzle-orm', () => ({
  eq: vi.fn((col, val) => ({ col, val })),
  and: vi.fn((...conditions) => conditions),
  isNull: vi.fn((col) => ({ isNull: col })),
}));

// Mock the email sender
vi.mock('@/lib/email/send-complete-registration-email', () => ({
  sendCompleteRegistrationEmail: vi.fn().mockResolvedValue({ success: true, id: 'email-123' }),
}));

// Mock the Inngest client
vi.mock('../client', () => ({
  inngest: {
    createFunction: vi.fn((config, trigger, handler) => ({
      config,
      trigger,
      handler,
    })),
  },
}));

import { registrationAbandonmentCheck as _registrationAbandonmentCheck } from './registration-abandonment';

// Type for the mocked Inngest function
interface MockedInngestFunction {
  config: { id: string; name: string; retries: number };
  trigger: { event: string };
  handler: (ctx: { event: unknown; step: unknown }) => Promise<{ success: boolean; action: string; reason?: string; email?: string; emailId?: string; error?: string }>;
}

const registrationAbandonmentCheck = _registrationAbandonmentCheck as unknown as MockedInngestFunction;

describe('Registration Abandonment Check Function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Function Configuration', () => {
    it('should have correct function id', () => {
      expect(registrationAbandonmentCheck.config.id).toBe('registration-abandonment-check');
    });

    it('should have correct function name', () => {
      expect(registrationAbandonmentCheck.config.name).toBe('Registration Abandonment Check');
    });

    it('should have retry configuration', () => {
      expect(registrationAbandonmentCheck.config.retries).toBe(3);
    });

    it('should be triggered by registration/abandoned event', () => {
      expect(registrationAbandonmentCheck.trigger).toEqual({ event: 'registration/abandoned' });
    });
  });

  describe('Function Handler', () => {
    it('should wait 1 hour before checking registration status (AC1)', async () => {
      const mockStep = {
        sleep: vi.fn().mockResolvedValue(undefined),
        run: vi.fn().mockResolvedValue(true), // User exists
      };

      const mockEvent = {
        data: {
          email: 'test@example.com',
          token: 'test-token',
          abandonedAt: new Date().toISOString(),
        },
      };

      await registrationAbandonmentCheck.handler({
        event: mockEvent,
        step: mockStep,
      } as any);

      expect(mockStep.sleep).toHaveBeenCalledWith('wait-1-hour', '1h');
    });

    it('should skip email when user has completed registration (AC6)', async () => {
      const mockStep = {
        sleep: vi.fn().mockResolvedValue(undefined),
        run: vi.fn().mockImplementation(async (name: string) => {
          if (name === 'check-user-registered') {
            return true; // User exists
          }
          return undefined;
        }),
      };

      const mockEvent = {
        data: {
          email: 'completed@example.com',
          token: 'test-token',
          abandonedAt: new Date().toISOString(),
        },
      };

      const result = await registrationAbandonmentCheck.handler({
        event: mockEvent,
        step: mockStep,
      } as any);

      expect(result).toEqual({
        success: true,
        action: 'skipped',
        reason: 'User completed registration',
      });
    });

    it('should send reminder email when user has not registered', async () => {
      const mockStep = {
        sleep: vi.fn().mockResolvedValue(undefined),
        run: vi.fn().mockImplementation(async (name: string) => {
          if (name === 'check-user-registered') {
            return false; // User does not exist
          }
          if (name === 'check-and-send') {
            return { shouldSend: true, record: { id: 'test-id' } };
          }
          if (name === 'send-reminder-email') {
            return { success: true, id: 'email-123' };
          }
          return undefined;
        }),
      };

      const testEmail = 'abandoned@example.com';
      const testToken = 'test-token';

      const mockEvent = {
        data: {
          email: testEmail,
          token: testToken,
          abandonedAt: new Date().toISOString(),
        },
      };

      const result = await registrationAbandonmentCheck.handler({
        event: mockEvent,
        step: mockStep,
      } as any);

      expect(result).toEqual({
        success: true,
        action: 'email_sent',
        email: testEmail,
        emailId: 'email-123',
      });
    });

    it('should skip if email already sent (AC5 - idempotency)', async () => {
      const mockStep = {
        sleep: vi.fn().mockResolvedValue(undefined),
        run: vi.fn().mockImplementation(async (name: string) => {
          if (name === 'check-user-registered') {
            return false; // User does not exist
          }
          if (name === 'check-and-send') {
            return { shouldSend: false, record: null }; // Email already sent
          }
          return undefined;
        }),
      };

      const mockEvent = {
        data: {
          email: 'test@example.com',
          token: 'test-token',
          abandonedAt: new Date().toISOString(),
        },
      };

      const result = await registrationAbandonmentCheck.handler({
        event: mockEvent,
        step: mockStep,
      } as any);

      expect(result).toEqual({
        success: true,
        action: 'skipped',
        reason: 'Email already sent or registration completed',
      });
    });

    it('should handle email send failure gracefully', async () => {
      const mockStep = {
        sleep: vi.fn().mockResolvedValue(undefined),
        run: vi.fn().mockImplementation(async (name: string) => {
          if (name === 'check-user-registered') {
            return false;
          }
          if (name === 'check-and-send') {
            return { shouldSend: true, record: { id: 'test-id' } };
          }
          if (name === 'send-reminder-email') {
            return { success: false, error: 'Email service unavailable' };
          }
          return undefined;
        }),
      };

      const mockEvent = {
        data: {
          email: 'test@example.com',
          token: 'test-token',
          abandonedAt: new Date().toISOString(),
        },
      };

      const result = await registrationAbandonmentCheck.handler({
        event: mockEvent,
        step: mockStep,
      } as any);

      expect(result).toEqual({
        success: false,
        action: 'email_failed',
        error: 'Email service unavailable',
      });
    });
  });

  describe('Idempotency', () => {
    it('should be idempotent - same event processed multiple times yields same result', async () => {
      const mockStep = {
        sleep: vi.fn().mockResolvedValue(undefined),
        run: vi.fn().mockResolvedValue(true), // User exists
      };

      const mockEvent = {
        data: {
          email: 'idempotent@example.com',
          token: 'test-token',
          abandonedAt: new Date().toISOString(),
        },
      };

      const result1 = await registrationAbandonmentCheck.handler({
        event: mockEvent,
        step: mockStep,
      } as any);

      const result2 = await registrationAbandonmentCheck.handler({
        event: mockEvent,
        step: mockStep,
      } as any);

      expect(result1).toEqual(result2);
      expect(result1.action).toBe('skipped');
    });
  });
});
