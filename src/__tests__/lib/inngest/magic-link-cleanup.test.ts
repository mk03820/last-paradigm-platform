/**
 * Magic Link Cleanup Function Tests
 *
 * Tests for the scheduled magic link cleanup Inngest function.
 *
 * Covers: Story 15.4 Task 7.3
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the cleanupExpiredMagicLinks function
vi.mock('@/lib/auth/magic-link', () => ({
  cleanupExpiredMagicLinks: vi.fn(),
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

import { cleanupExpiredMagicLinks } from '@/lib/auth/magic-link';
import { magicLinkCleanup as _magicLinkCleanup } from '@/lib/inngest/functions/magic-link-cleanup';

// Type for the mocked Inngest function
interface MockedInngestFunction {
  config: { id: string; name: string; retries: number };
  trigger: { cron: string };
  handler: (ctx: { step: unknown }) => Promise<{ success: boolean; deletedCount: number; timestamp: string }>;
}

const magicLinkCleanup = _magicLinkCleanup as unknown as MockedInngestFunction;

describe('Magic Link Cleanup Function', () => {
  const mockCleanup = cleanupExpiredMagicLinks as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Function Configuration', () => {
    it('should have correct function id', () => {
      expect(magicLinkCleanup.config.id).toBe('magic-link-cleanup');
    });

    it('should have correct function name', () => {
      expect(magicLinkCleanup.config.name).toBe('Magic Link Cleanup');
    });

    it('should have retry configuration', () => {
      expect(magicLinkCleanup.config.retries).toBe(3);
    });

    it('should be scheduled to run hourly', () => {
      expect(magicLinkCleanup.trigger).toEqual({ cron: '0 * * * *' });
    });
  });

  describe('Function Handler', () => {
    it('should call cleanupExpiredMagicLinks and return success', async () => {
      mockCleanup.mockResolvedValue(5);

      const mockStep = {
        run: vi.fn(async (_name: string, fn: () => Promise<number>) => fn()),
      };

      const result = await magicLinkCleanup.handler({ step: mockStep } as any);

      expect(mockStep.run).toHaveBeenCalledWith(
        'cleanup-expired-links',
        expect.any(Function)
      );
      expect(result).toEqual({
        success: true,
        deletedCount: 5,
        timestamp: expect.any(String),
      });
    });

    it('should return 0 deleted count when no expired links', async () => {
      mockCleanup.mockResolvedValue(0);

      const mockStep = {
        run: vi.fn(async (_name: string, fn: () => Promise<number>) => fn()),
      };

      const result = await magicLinkCleanup.handler({ step: mockStep } as any);

      expect(result.deletedCount).toBe(0);
      expect(result.success).toBe(true);
    });

    it('should include ISO timestamp in result', async () => {
      mockCleanup.mockResolvedValue(3);

      const mockStep = {
        run: vi.fn(async (_name: string, fn: () => Promise<number>) => fn()),
      };

      const before = new Date().toISOString();
      const result = await magicLinkCleanup.handler({ step: mockStep } as any);
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

      const result = await magicLinkCleanup.handler({ step: mockStep } as any);

      expect(result.deletedCount).toBe(1000);
      expect(result.success).toBe(true);
    });
  });
});
