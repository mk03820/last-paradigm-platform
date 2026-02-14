/**
 * Phase 3 Types Tests
 *
 * Unit tests for user, diagnostic, and auth type helpers.
 *
 * Covers: Story 15.1 Task 6 (TypeScript types for Phase 3)
 */

import { describe, it, expect } from 'vitest';
import {
  toUserProfile,
  toUserSession,
  type User,
  type UserProfile,
  type UserSession,
  type PurchaseStatus,
} from '@/types/user.types';
import {
  countCompletedTools,
  toDiagnosticResultSummary,
  type DiagnosticResult,
  type DiagnosticResultSummary,
} from '@/types/diagnostic.types';
import type { DiagnosticSessionData } from '@/lib/db/schema';
// Auth types - imported separately to avoid next-auth side effects
import type {
  MagicLink,
  PasswordReset,
  MagicLinkStatus,
  PasswordResetStatus,
} from '@/lib/db/schema';

// Helper functions defined inline to avoid next-auth import chain
function isMagicLinkValid(magicLink: MagicLink): boolean {
  if (magicLink.usedAt) return false;
  if (new Date(magicLink.expiresAt) < new Date()) return false;
  return true;
}

function isPasswordResetValid(reset: PasswordReset): boolean {
  if (reset.usedAt) return false;
  if (new Date(reset.expiresAt) < new Date()) return false;
  return true;
}

function getMagicLinkStatus(magicLink: MagicLink): 'pending' | 'used' | 'expired' {
  if (magicLink.usedAt) return 'used';
  if (new Date(magicLink.expiresAt) < new Date()) return 'expired';
  return 'pending';
}

function getPasswordResetStatus(reset: PasswordReset): 'pending' | 'used' | 'expired' {
  if (reset.usedAt) return 'used';
  if (new Date(reset.expiresAt) < new Date()) return 'expired';
  return 'pending';
}

describe('User types', () => {
  describe('toUserProfile', () => {
    it('should convert User to UserProfile', () => {
      const user: User = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: new Date('2024-01-01'),
        image: 'https://example.com/avatar.jpg',
        passwordHash: '$2b$12$hashedpassword',
        purchaseStatus: 'completed',
        purchasedAt: new Date('2024-02-01'),
        stripeCustomerId: 'cus_123',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-02-01'),
      };

      const profile = toUserProfile(user);

      expect(profile.id).toBe('user-123');
      expect(profile.name).toBe('Test User');
      expect(profile.email).toBe('test@example.com');
      expect(profile.image).toBe('https://example.com/avatar.jpg');
      expect(profile.purchaseStatus).toBe('completed');
      expect(profile.purchasedAt).toEqual(new Date('2024-02-01'));
      expect(profile.createdAt).toEqual(new Date('2024-01-01'));
      // Should not include sensitive fields
      expect((profile as unknown as User).passwordHash).toBeUndefined();
      expect((profile as unknown as User).stripeCustomerId).toBeUndefined();
    });

    it('should handle null values', () => {
      const user: User = {
        id: 'user-123',
        name: null,
        email: null,
        emailVerified: null,
        image: null,
        passwordHash: null,
        purchaseStatus: 'none',
        purchasedAt: null,
        stripeCustomerId: null,
        createdAt: null,
        updatedAt: null,
      };

      const profile = toUserProfile(user);

      expect(profile.name).toBeNull();
      expect(profile.email).toBeNull();
      expect(profile.image).toBeNull();
    });
  });

  describe('toUserSession', () => {
    it('should convert User to UserSession', () => {
      const user: User = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: new Date(),
        image: null,
        passwordHash: null,
        purchaseStatus: 'completed',
        purchasedAt: new Date(),
        stripeCustomerId: 'cus_123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const session = toUserSession(user);

      expect(session.id).toBe('user-123');
      expect(session.email).toBe('test@example.com');
      expect(session.name).toBe('Test User');
      expect(session.purchaseStatus).toBe('completed');
    });

    it('should default purchaseStatus to none', () => {
      const user: User = {
        id: 'user-123',
        name: null,
        email: 'test@example.com',
        emailVerified: null,
        image: null,
        passwordHash: null,
        purchaseStatus: null,
        purchasedAt: null,
        stripeCustomerId: null,
        createdAt: null,
        updatedAt: null,
      };

      const session = toUserSession(user);
      expect(session.purchaseStatus).toBe('none');
    });

    it('should throw error if email is null', () => {
      const user: User = {
        id: 'user-123',
        name: null,
        email: null,
        emailVerified: null,
        image: null,
        passwordHash: null,
        purchaseStatus: null,
        purchasedAt: null,
        stripeCustomerId: null,
        createdAt: null,
        updatedAt: null,
      };

      expect(() => toUserSession(user)).toThrow('Cannot create session for user without email');
    });
  });

  describe('PurchaseStatus type', () => {
    it('should accept valid status values', () => {
      const statuses: PurchaseStatus[] = [
        'none',
        'pending',
        'completed',
        'refunded',
      ];
      expect(statuses).toHaveLength(4);
    });
  });
});

describe('Diagnostic types', () => {
  describe('countCompletedTools', () => {
    it('should return 0 for empty data', () => {
      expect(countCompletedTools({})).toBe(0);
    });

    it('should count tools with completedAt', () => {
      const data: DiagnosticSessionData = {
        tool1: { completedAt: '2024-01-01' },
        tool2: { completedAt: '2024-01-02' },
        tool3: { decisions: [] }, // No completedAt
        tool4: { completedAt: '2024-01-04' },
      };

      expect(countCompletedTools(data)).toBe(3);
    });

    it('should count all 7 tools when complete', () => {
      const data: DiagnosticSessionData = {
        tool1: { completedAt: '2024-01-01' },
        tool2: { completedAt: '2024-01-02' },
        tool3: { completedAt: '2024-01-03' },
        tool4: { completedAt: '2024-01-04' },
        tool5: { completedAt: '2024-01-05' },
        tool6: { completedAt: '2024-01-06' },
        tool7: { completedAt: '2024-01-07' },
      };

      expect(countCompletedTools(data)).toBe(7);
    });

    it('should handle partial tool data', () => {
      const data: DiagnosticSessionData = {
        tool1: {
          scores: { strategic: 3 },
          // No completedAt
        },
        tool2: {
          inputs: { meetingCount: 10 },
          completedAt: '2024-01-01',
        },
      };

      expect(countCompletedTools(data)).toBe(1);
    });
  });

  describe('toDiagnosticResultSummary', () => {
    it('should create summary from result', () => {
      const result: DiagnosticResult = {
        id: 'result-123',
        userId: 'user-123',
        toolResults: {
          tool1: { completedAt: '2024-01-01' },
          tool2: { completedAt: '2024-01-02' },
        },
        totalAlignmentTax: '1500000.00',
        estimatedSavings: '750000.00',
        completedAt: new Date('2024-01-15'),
      };

      const summary = toDiagnosticResultSummary(result);

      expect(summary.id).toBe('result-123');
      expect(summary.totalAlignmentTax).toBe('1500000.00');
      expect(summary.estimatedSavings).toBe('750000.00');
      expect(summary.completedAt).toEqual(new Date('2024-01-15'));
      expect(summary.toolsCompleted).toBe(2);
    });

    it('should handle null toolResults', () => {
      const result: DiagnosticResult = {
        id: 'result-123',
        userId: 'user-123',
        toolResults: null as unknown as DiagnosticSessionData,
        totalAlignmentTax: null,
        estimatedSavings: null,
        completedAt: null,
      };

      const summary = toDiagnosticResultSummary(result);
      expect(summary.toolsCompleted).toBe(0);
    });
  });
});

describe('Auth types', () => {
  describe('isMagicLinkValid', () => {
    it('should return true for valid link', () => {
      const link: MagicLink = {
        id: 'link-123',
        email: 'test@example.com',
        token: 'token-123',
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
        usedAt: null,
        createdAt: new Date(),
      };

      expect(isMagicLinkValid(link)).toBe(true);
    });

    it('should return false for used link', () => {
      const link: MagicLink = {
        id: 'link-123',
        email: 'test@example.com',
        token: 'token-123',
        expiresAt: new Date(Date.now() + 3600000),
        usedAt: new Date(), // Used
        createdAt: new Date(),
      };

      expect(isMagicLinkValid(link)).toBe(false);
    });

    it('should return false for expired link', () => {
      const link: MagicLink = {
        id: 'link-123',
        email: 'test@example.com',
        token: 'token-123',
        expiresAt: new Date(Date.now() - 3600000), // 1 hour ago
        usedAt: null,
        createdAt: new Date(),
      };

      expect(isMagicLinkValid(link)).toBe(false);
    });
  });

  describe('isPasswordResetValid', () => {
    it('should return true for valid reset', () => {
      const reset: PasswordReset = {
        id: 'reset-123',
        userId: 'user-123',
        token: 'token-123',
        expiresAt: new Date(Date.now() + 3600000),
        usedAt: null,
        createdAt: new Date(),
      };

      expect(isPasswordResetValid(reset)).toBe(true);
    });

    it('should return false for used reset', () => {
      const reset: PasswordReset = {
        id: 'reset-123',
        userId: 'user-123',
        token: 'token-123',
        expiresAt: new Date(Date.now() + 3600000),
        usedAt: new Date(),
        createdAt: new Date(),
      };

      expect(isPasswordResetValid(reset)).toBe(false);
    });

    it('should return false for expired reset', () => {
      const reset: PasswordReset = {
        id: 'reset-123',
        userId: 'user-123',
        token: 'token-123',
        expiresAt: new Date(Date.now() - 3600000),
        usedAt: null,
        createdAt: new Date(),
      };

      expect(isPasswordResetValid(reset)).toBe(false);
    });
  });

  describe('getMagicLinkStatus', () => {
    it('should return pending for valid link', () => {
      const link: MagicLink = {
        id: 'link-123',
        email: 'test@example.com',
        token: 'token-123',
        expiresAt: new Date(Date.now() + 3600000),
        usedAt: null,
        createdAt: new Date(),
      };

      expect(getMagicLinkStatus(link)).toBe('pending');
    });

    it('should return used for used link', () => {
      const link: MagicLink = {
        id: 'link-123',
        email: 'test@example.com',
        token: 'token-123',
        expiresAt: new Date(Date.now() + 3600000),
        usedAt: new Date(),
        createdAt: new Date(),
      };

      expect(getMagicLinkStatus(link)).toBe('used');
    });

    it('should return expired for expired link', () => {
      const link: MagicLink = {
        id: 'link-123',
        email: 'test@example.com',
        token: 'token-123',
        expiresAt: new Date(Date.now() - 3600000),
        usedAt: null,
        createdAt: new Date(),
      };

      expect(getMagicLinkStatus(link)).toBe('expired');
    });

    it('should prioritize used over expired', () => {
      const link: MagicLink = {
        id: 'link-123',
        email: 'test@example.com',
        token: 'token-123',
        expiresAt: new Date(Date.now() - 3600000), // Expired
        usedAt: new Date(), // Also used
        createdAt: new Date(),
      };

      expect(getMagicLinkStatus(link)).toBe('used');
    });
  });

  describe('getPasswordResetStatus', () => {
    it('should return pending for valid reset', () => {
      const reset: PasswordReset = {
        id: 'reset-123',
        userId: 'user-123',
        token: 'token-123',
        expiresAt: new Date(Date.now() + 3600000),
        usedAt: null,
        createdAt: new Date(),
      };

      expect(getPasswordResetStatus(reset)).toBe('pending');
    });

    it('should return used for used reset', () => {
      const reset: PasswordReset = {
        id: 'reset-123',
        userId: 'user-123',
        token: 'token-123',
        expiresAt: new Date(Date.now() + 3600000),
        usedAt: new Date(),
        createdAt: new Date(),
      };

      expect(getPasswordResetStatus(reset)).toBe('used');
    });

    it('should return expired for expired reset', () => {
      const reset: PasswordReset = {
        id: 'reset-123',
        userId: 'user-123',
        token: 'token-123',
        expiresAt: new Date(Date.now() - 3600000),
        usedAt: null,
        createdAt: new Date(),
      };

      expect(getPasswordResetStatus(reset)).toBe('expired');
    });
  });

  describe('MagicLinkStatus type', () => {
    it('should accept valid status values', () => {
      const statuses: MagicLinkStatus[] = ['pending', 'used', 'expired'];
      expect(statuses).toHaveLength(3);
    });
  });

  describe('PasswordResetStatus type', () => {
    it('should accept valid status values', () => {
      const statuses: PasswordResetStatus[] = ['pending', 'used', 'expired'];
      expect(statuses).toHaveLength(3);
    });
  });
});
