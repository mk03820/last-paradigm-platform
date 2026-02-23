/**
 * Magic Link Database Operations Tests
 *
 * Tests for magic link creation, verification, and cleanup with database mocking.
 *
 * Covers: Story 15.4 Task 6.6, Task 7.3
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the database module
vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock drizzle-orm
vi.mock('drizzle-orm', () => ({
  eq: vi.fn((column, value) => ({ type: 'eq', column, value })),
  and: vi.fn((...conditions) => ({ type: 'and', conditions })),
  lt: vi.fn((column, value) => ({ type: 'lt', column, value })),
  isNull: vi.fn((column) => ({ type: 'isNull', column })),
}));

// Mock schema
vi.mock('@/lib/db/schema', () => ({
  magicLinks: {
    id: 'id',
    email: 'email',
    token: 'token',
    expiresAt: 'expires_at',
    usedAt: 'used_at',
    createdAt: 'created_at',
  },
  users: {
    id: 'id',
    email: 'email',
    name: 'name',
    emailVerified: 'email_verified',
    purchaseStatus: 'purchase_status',
  },
}));

import { db } from '@/lib/db';
import {
  createMagicLink,
  verifyMagicLink,
  findOrCreateUserByEmail,
  cleanupExpiredMagicLinks,
} from '@/lib/auth/magic-link';

describe('Magic Link Database Operations', () => {
  const mockDb = db as unknown as {
    insert: ReturnType<typeof vi.fn>;
    select: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createMagicLink', () => {
    it('should create magic link successfully', async () => {
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      });

      const result = await createMagicLink('test@example.com');

      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe('string');
    });

    it('should normalize email to lowercase', async () => {
      let capturedValues: { email: string };
      mockDb.insert.mockReturnValue({
        values: vi.fn((vals) => {
          capturedValues = vals;
          return Promise.resolve(undefined);
        }),
      });

      await createMagicLink('TEST@EXAMPLE.COM');

      expect(capturedValues!.email).toBe('test@example.com');
    });

    it('should trim whitespace from email', async () => {
      let capturedValues: { email: string };
      mockDb.insert.mockReturnValue({
        values: vi.fn((vals) => {
          capturedValues = vals;
          return Promise.resolve(undefined);
        }),
      });

      await createMagicLink('  test@example.com  ');

      expect(capturedValues!.email).toBe('test@example.com');
    });

    it('should set expiry to 15 minutes from now', async () => {
      let capturedValues: { expiresAt: Date };
      mockDb.insert.mockReturnValue({
        values: vi.fn((vals) => {
          capturedValues = vals;
          return Promise.resolve(undefined);
        }),
      });

      const before = Date.now();
      await createMagicLink('test@example.com');
      const after = Date.now();

      const expiryMs = capturedValues!.expiresAt.getTime();
      const expectedMs = 15 * 60 * 1000;

      // Expiry should be ~15 minutes from now
      expect(expiryMs - before).toBeGreaterThanOrEqual(expectedMs - 1000);
      expect(expiryMs - after).toBeLessThanOrEqual(expectedMs + 1000);
    });

    it('should return error on database failure', async () => {
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockRejectedValue(new Error('DB Error')),
      });

      const result = await createMagicLink('test@example.com');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create magic link');
    });
  });

  describe('verifyMagicLink', () => {
    it('should return INVALID_TOKEN for non-existent token', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await verifyMagicLink('invalid-token');

      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_TOKEN');
    });

    it('should return ALREADY_USED for used token', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                id: '1',
                email: 'test@example.com',
                token: 'used-token',
                expiresAt: new Date(Date.now() + 10 * 60 * 1000),
                usedAt: new Date(), // Already used
              },
            ]),
          }),
        }),
      });

      const result = await verifyMagicLink('used-token');

      expect(result.success).toBe(false);
      expect(result.error).toBe('ALREADY_USED');
    });

    it('should return EXPIRED for expired token', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                id: '1',
                email: 'test@example.com',
                token: 'expired-token',
                expiresAt: new Date(Date.now() - 10 * 60 * 1000), // Expired 10 min ago
                usedAt: null,
              },
            ]),
          }),
        }),
      });

      const result = await verifyMagicLink('expired-token');

      expect(result.success).toBe(false);
      expect(result.error).toBe('EXPIRED');
    });

    it('should verify valid token and mark as used', async () => {
      const validMagicLink = {
        id: '1',
        email: 'test@example.com',
        token: 'valid-token',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        usedAt: null,
      };

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([validMagicLink]),
          }),
        }),
      });

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{ id: '1' }]), // Successful update returns the row
          }),
        }),
      });

      const result = await verifyMagicLink('valid-token');

      expect(result.success).toBe(true);
      expect(result.magicLink).toEqual(validMagicLink);
      expect(mockDb.update).toHaveBeenCalled();
    });

    it('should return ALREADY_USED when concurrent request already used token', async () => {
      const validMagicLink = {
        id: '1',
        email: 'test@example.com',
        token: 'race-condition-token',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        usedAt: null,
      };

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([validMagicLink]),
          }),
        }),
      });

      // Simulate race condition: update returns no rows (another request already used it)
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]), // No rows updated
          }),
        }),
      });

      const result = await verifyMagicLink('race-condition-token');

      expect(result.success).toBe(false);
      expect(result.error).toBe('ALREADY_USED');
    });

    it('should return SERVER_ERROR on database failure', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockRejectedValue(new Error('DB Error')),
          }),
        }),
      });

      const result = await verifyMagicLink('any-token');

      expect(result.success).toBe(false);
      expect(result.error).toBe('SERVER_ERROR');
    });
  });

  describe('findOrCreateUserByEmail', () => {
    it('should return existing user', async () => {
      const existingUser = {
        id: 'user-123',
        email: 'existing@example.com',
        name: 'Existing User',
        purchaseStatus: 'purchased',
        emailVerified: new Date(),
      };

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([existingUser]),
          }),
        }),
      });

      const result = await findOrCreateUserByEmail('existing@example.com');

      expect(result).toEqual({
        id: 'user-123',
        email: 'existing@example.com',
        name: 'Existing User',
        purchaseStatus: 'purchased',
        isNewUser: false,
      });
    });

    it('should update emailVerified for unverified existing user', async () => {
      const unverifiedUser = {
        id: 'user-456',
        email: 'unverified@example.com',
        name: 'Unverified User',
        purchaseStatus: 'none',
        emailVerified: null,
      };

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([unverifiedUser]),
          }),
        }),
      });

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });

      await findOrCreateUserByEmail('unverified@example.com');

      expect(mockDb.update).toHaveBeenCalled();
    });

    it('should create new user if not found', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const newUser = {
        id: 'new-user-789',
        email: 'new@example.com',
        name: null,
        purchaseStatus: 'none',
      };

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([newUser]),
        }),
      });

      const result = await findOrCreateUserByEmail('new@example.com');

      expect(result?.isNewUser).toBe(true);
      expect(result?.email).toBe('new@example.com');
    });

    it('should normalize email to lowercase', async () => {
      let capturedEmail: string;

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn((condition) => {
            capturedEmail = condition.value;
            return {
              limit: vi.fn().mockResolvedValue([
                {
                  id: '1',
                  email: 'test@example.com',
                  name: null,
                  purchaseStatus: 'none',
                  emailVerified: new Date(),
                },
              ]),
            };
          }),
        }),
      });

      await findOrCreateUserByEmail('TEST@EXAMPLE.COM');

      expect(capturedEmail!).toBe('test@example.com');
    });

    it('should return null on database error', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockRejectedValue(new Error('DB Error')),
          }),
        }),
      });

      const result = await findOrCreateUserByEmail('error@example.com');

      expect(result).toBeNull();
    });
  });

  describe('cleanupExpiredMagicLinks', () => {
    it('should delete expired magic links', async () => {
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([
            { id: '1' },
            { id: '2' },
            { id: '3' },
          ]),
        }),
      });

      const result = await cleanupExpiredMagicLinks();

      expect(result).toBe(3);
      expect(mockDb.delete).toHaveBeenCalled();
    });

    it('should return 0 when no expired links exist', async () => {
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      });

      const result = await cleanupExpiredMagicLinks();

      expect(result).toBe(0);
    });

    it('should return 0 on database error', async () => {
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockRejectedValue(new Error('DB Error')),
        }),
      });

      const result = await cleanupExpiredMagicLinks();

      expect(result).toBe(0);
    });

    it('should handle large cleanup operations', async () => {
      const manyExpiredLinks = Array.from({ length: 100 }, (_, i) => ({
        id: `expired-${i}`,
      }));

      mockDb.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue(manyExpiredLinks),
        }),
      });

      const result = await cleanupExpiredMagicLinks();

      expect(result).toBe(100);
    });
  });
});
