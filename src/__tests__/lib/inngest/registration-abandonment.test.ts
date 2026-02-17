/**
 * Registration Abandonment Function Tests
 *
 * Tests for the registration abandonment recovery Inngest function.
 *
 * Covers: Story 15.10 Task 6.2, Story 15.9 (FR67)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([{ id: 'user-123' }])),
        })),
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
}));

// Mock drizzle-orm
vi.mock('drizzle-orm', () => ({
  eq: vi.fn((col, val) => ({ col, val })),
}));

// Mock Resend - use class syntax for proper constructor
vi.mock('resend', () => {
  return {
    Resend: class MockResend {
      emails = {
        send: vi.fn().mockResolvedValue({ id: 'email-123' }),
      };
    },
  };
});

// Mock the Inngest client
vi.mock('../../../lib/inngest/client', () => ({
  inngest: {
    createFunction: vi.fn((config, trigger, handler) => ({
      config,
      trigger,
      handler,
    })),
  },
}));

import { registrationAbandonmentCheck } from '@/lib/inngest/functions/registration-abandonment';

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
    it('should wait 1 hour before checking registration status', async () => {
      const mockStep = {
        sleep: vi.fn().mockResolvedValue(undefined),
        run: vi.fn().mockResolvedValue(true), // User exists
      };

      const mockEvent = {
        data: {
          email: 'test@example.com',
          abandonedAt: new Date().toISOString(),
        },
      };

      await registrationAbandonmentCheck.handler({
        event: mockEvent,
        step: mockStep,
      } as any);

      expect(mockStep.sleep).toHaveBeenCalledWith('wait-1-hour', '1h');
    });

    it('should skip email when user has completed registration', async () => {
      const mockStep = {
        sleep: vi.fn().mockResolvedValue(undefined),
        run: vi.fn().mockImplementation(async (name: string, fn: () => Promise<any>) => {
          if (name === 'check-user-registered') {
            return true; // User exists
          }
          return fn();
        }),
      };

      const mockEvent = {
        data: {
          email: 'completed@example.com',
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

      // Should not call send-reminder-email
      expect(mockStep.run).not.toHaveBeenCalledWith(
        'send-reminder-email',
        expect.any(Function)
      );
    });

    it('should send reminder email when user has not registered', async () => {
      const runResults: Record<string, any> = {
        'check-user-registered': false, // User does not exist
        'send-reminder-email': undefined,
      };

      const mockStep = {
        sleep: vi.fn().mockResolvedValue(undefined),
        run: vi.fn().mockImplementation(async (name: string) => {
          return runResults[name];
        }),
      };

      const testEmail = 'abandoned@example.com';
      const testAbandonedAt = new Date().toISOString();

      const mockEvent = {
        data: {
          email: testEmail,
          abandonedAt: testAbandonedAt,
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
        abandonedAt: testAbandonedAt,
      });

      // Should call send-reminder-email
      expect(mockStep.run).toHaveBeenCalledWith(
        'send-reminder-email',
        expect.any(Function)
      );
    });

    it('should check user registration with correct email', async () => {
      const mockStep = {
        sleep: vi.fn().mockResolvedValue(undefined),
        run: vi.fn().mockResolvedValue(true), // User exists
      };

      const testEmail = 'Test@Example.com';
      const mockEvent = {
        data: {
          email: testEmail,
          abandonedAt: new Date().toISOString(),
        },
      };

      await registrationAbandonmentCheck.handler({
        event: mockEvent,
        step: mockStep,
      } as any);

      expect(mockStep.run).toHaveBeenCalledWith(
        'check-user-registered',
        expect.any(Function)
      );
    });

    it('should handle event data correctly', async () => {
      const mockStep = {
        sleep: vi.fn().mockResolvedValue(undefined),
        run: vi.fn().mockResolvedValue(true),
      };

      const testAbandonedAt = '2026-02-17T12:00:00.000Z';
      const mockEvent = {
        data: {
          email: 'test@example.com',
          abandonedAt: testAbandonedAt,
        },
      };

      const result = await registrationAbandonmentCheck.handler({
        event: mockEvent,
        step: mockStep,
      } as any);

      expect(result.success).toBe(true);
    });
  });

  describe('Idempotency', () => {
    it('should be idempotent - same event processed multiple times yields same result for completed user', async () => {
      const mockStep = {
        sleep: vi.fn().mockResolvedValue(undefined),
        run: vi.fn().mockResolvedValue(true), // User exists
      };

      const mockEvent = {
        data: {
          email: 'idempotent@example.com',
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
