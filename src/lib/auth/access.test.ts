/**
 * User Access Control Utilities Tests
 *
 * Tests for access check and verification functions.
 *
 * Story 17.4: Stripe Webhook Handler
 * Task 4.4 Tests: User access verification utilities
 * Covers: AC4
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  checkPb2Access,
  getUserAccess,
  requirePb2Access,
  checkPb2AccessByEmail,
  AccessDeniedError,
} from './access';

// Mock the database module
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
  },
}));

vi.mock('@/lib/db/schema', () => ({
  users: { id: 'id', email: 'email', hasPb2Access: 'has_pb2_access' },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((a, b) => ({ field: a, value: b })),
}));

import { db } from '@/lib/db';

describe('Access Control Utilities', () => {
  const mockUserId = 'user-123';
  const mockEmail = 'test@example.com';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkPb2Access', () => {
    it('should return true when hasPb2Access is true', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              { hasPb2Access: true, purchaseStatus: 'none' },
            ]),
          }),
        }),
      } as never);

      const result = await checkPb2Access(mockUserId);
      expect(result).toBe(true);
    });

    it('should return true when purchaseStatus is completed', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              { hasPb2Access: false, purchaseStatus: 'completed' },
            ]),
          }),
        }),
      } as never);

      const result = await checkPb2Access(mockUserId);
      expect(result).toBe(true);
    });

    it('should return false when user has no access', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              { hasPb2Access: false, purchaseStatus: 'none' },
            ]),
          }),
        }),
      } as never);

      const result = await checkPb2Access(mockUserId);
      expect(result).toBe(false);
    });

    it('should return false when user does not exist', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as never);

      const result = await checkPb2Access(mockUserId);
      expect(result).toBe(false);
    });

    it('should return false for pending purchase status', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              { hasPb2Access: false, purchaseStatus: 'pending' },
            ]),
          }),
        }),
      } as never);

      const result = await checkPb2Access(mockUserId);
      expect(result).toBe(false);
    });
  });

  describe('getUserAccess', () => {
    it('should return full access info for existing user', async () => {
      const purchaseDate = new Date('2024-01-15');
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                hasPb2Access: true,
                pb2PurchasedAt: purchaseDate,
                purchaseStatus: 'completed',
              },
            ]),
          }),
        }),
      } as never);

      const result = await getUserAccess(mockUserId);

      expect(result).toEqual({
        hasPb2Access: true,
        pb2PurchasedAt: purchaseDate,
        purchaseStatus: 'completed',
      });
    });

    it('should return null for non-existent user', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as never);

      const result = await getUserAccess(mockUserId);
      expect(result).toBeNull();
    });

    it('should compute hasPb2Access from purchaseStatus', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                hasPb2Access: false,
                pb2PurchasedAt: null,
                purchaseStatus: 'completed',
              },
            ]),
          }),
        }),
      } as never);

      const result = await getUserAccess(mockUserId);

      expect(result?.hasPb2Access).toBe(true);
    });
  });

  describe('requirePb2Access', () => {
    it('should not throw when user has access', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              { hasPb2Access: true, purchaseStatus: 'completed' },
            ]),
          }),
        }),
      } as never);

      await expect(requirePb2Access(mockUserId)).resolves.toBeUndefined();
    });

    it('should throw AccessDeniedError when user has no access', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              { hasPb2Access: false, purchaseStatus: 'none' },
            ]),
          }),
        }),
      } as never);

      await expect(requirePb2Access(mockUserId)).rejects.toThrow(
        AccessDeniedError
      );
      await expect(requirePb2Access(mockUserId)).rejects.toThrow(
        'Playbook 2 access required'
      );
    });

    it('should throw AccessDeniedError when user does not exist', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as never);

      await expect(requirePb2Access(mockUserId)).rejects.toThrow(
        AccessDeniedError
      );
    });
  });

  describe('checkPb2AccessByEmail', () => {
    it('should return true when user has access by email', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              { hasPb2Access: true, purchaseStatus: 'completed' },
            ]),
          }),
        }),
      } as never);

      const result = await checkPb2AccessByEmail(mockEmail);
      expect(result).toBe(true);
    });

    it('should return false when user has no access', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              { hasPb2Access: false, purchaseStatus: 'none' },
            ]),
          }),
        }),
      } as never);

      const result = await checkPb2AccessByEmail(mockEmail);
      expect(result).toBe(false);
    });

    it('should return false when email is not found', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as never);

      const result = await checkPb2AccessByEmail(mockEmail);
      expect(result).toBe(false);
    });
  });

  describe('AccessDeniedError', () => {
    it('should have correct name', () => {
      const error = new AccessDeniedError();
      expect(error.name).toBe('AccessDeniedError');
    });

    it('should have default message', () => {
      const error = new AccessDeniedError();
      expect(error.message).toBe('Playbook 2 access required');
    });

    it('should accept custom message', () => {
      const error = new AccessDeniedError('Custom message');
      expect(error.message).toBe('Custom message');
    });
  });
});
