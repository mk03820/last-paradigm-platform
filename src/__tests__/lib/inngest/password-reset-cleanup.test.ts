/**
 * Password Reset Cleanup Function Tests
 *
 * Tests for the scheduled password reset cleanup Inngest function.
 *
 * Covers: Story 15.10 Task 6.2, Story 15.5 cleanup
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the cleanupExpiredResets function
vi.mock('@/lib/auth/password-reset', () => ({
  cleanupExpiredResets: vi.fn(),
}));

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

import { cleanupExpiredResets } from '@/lib/auth/password-reset';
import { passwordResetCleanup as _passwordResetCleanup } from '@/lib/inngest/functions/password-reset-cleanup';

// Type for the mocked Inngest function
interface MockedInngestFunction {
  config: { id: string; name: string; retries: number };
  trigger: { cron: string };
  handler: (ctx: { step: unknown }) => Promise<{ success: boolean; deletedCount: number; timestamp: string }>;
}

const passwordResetCleanup = _passwordResetCleanup as unknown as MockedInngestFunction;

describe('Password Reset Cleanup Function', () => {
  const mockCleanup = cleanupExpiredResets as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Function Configuration', () => {
    it('should have correct function id', () => {
      expect(passwordResetCleanup.config.id).toBe('password-reset-cleanup');
    });

    it('should have correct function name', () => {
      expect(passwordResetCleanup.config.name).toBe('Password Reset Cleanup');
    });

    it('should have retry configuration', () => {
      expect(passwordResetCleanup.config.retries).toBe(3);
    });

    it('should be scheduled to run daily at 2 AM', () => {
      expect(passwordResetCleanup.trigger).toEqual({ cron: '0 2 * * *' });
    });
  });

  describe('Function Handler', () => {
    it('should call cleanupExpiredResets and return success', async () => {
      mockCleanup.mockResolvedValue(5);

      const mockStep = {
        run: vi.fn(async (_name: string, fn: () => Promise<number>) => fn()),
      };

      const result = await passwordResetCleanup.handler({ step: mockStep } as any);

      expect(mockStep.run).toHaveBeenCalledWith(
        'cleanup-expired-resets',
        expect.any(Function)
      );
      expect(result).toEqual({
        success: true,
        deletedCount: 5,
        timestamp: expect.any(String),
      });
    });

    it('should return 0 deleted count when no expired tokens', async () => {
      mockCleanup.mockResolvedValue(0);

      const mockStep = {
        run: vi.fn(async (_name: string, fn: () => Promise<number>) => fn()),
      };

      const result = await passwordResetCleanup.handler({ step: mockStep } as any);

      expect(result.deletedCount).toBe(0);
      expect(result.success).toBe(true);
    });

    it('should include ISO timestamp in result', async () => {
      mockCleanup.mockResolvedValue(3);

      const mockStep = {
        run: vi.fn(async (_name: string, fn: () => Promise<number>) => fn()),
      };

      const before = new Date().toISOString();
      const result = await passwordResetCleanup.handler({ step: mockStep } as any);
      const after = new Date().toISOString();

      expect(result.timestamp).toBeDefined();
      expect(result.timestamp >= before).toBe(true);
      expect(result.timestamp <= after).toBe(true);
    });

    it('should handle large cleanup counts', async () => {
      mockCleanup.mockResolvedValue(1000);

      const mockStep = {
        run: vi.fn(async (_name: string, fn: () => Promise<number>) => fn()),
      };

      const result = await passwordResetCleanup.handler({ step: mockStep } as any);

      expect(result.deletedCount).toBe(1000);
      expect(result.success).toBe(true);
    });
  });
});
