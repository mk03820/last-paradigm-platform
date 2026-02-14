/**
 * Password Utilities Tests
 *
 * Tests for bcrypt password hashing and validation.
 *
 * Covers: Story 15.2 Task 1
 */

import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  validatePassword,
  getPasswordStrength,
  PASSWORD_MIN_LENGTH,
} from '@/lib/auth/password';

describe('Password Utilities', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'TestPassword123';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.startsWith('$2')).toBe(true); // bcrypt prefix
    });

    it('should produce different hashes for same password', async () => {
      const password = 'TestPassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2); // Salt should differ
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'TestPassword123';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'TestPassword123';
      const wrongPassword = 'WrongPassword456';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(wrongPassword, hash);
      expect(isValid).toBe(false);
    });

    it('should handle invalid hash gracefully', async () => {
      const password = 'TestPassword123';
      const invalidHash = 'not-a-valid-hash';

      const isValid = await verifyPassword(password, invalidHash);
      expect(isValid).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should accept valid password', () => {
      const result = validatePassword('Password123');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject short password', () => {
      const result = validatePassword('Pass1');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
    });

    it('should reject password without number', () => {
      const result = validatePassword('PasswordOnly');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should reject password without letter', () => {
      const result = validatePassword('12345678');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one letter');
    });

    it('should return multiple errors', () => {
      const result = validatePassword('123');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('getPasswordStrength', () => {
    it('should rate empty password as very weak', () => {
      const result = getPasswordStrength('');
      expect(result.score).toBe(0);
      expect(result.label).toBe('Very weak');
    });

    it('should rate short simple password as weak', () => {
      const result = getPasswordStrength('pass123');
      expect(result.score).toBeLessThanOrEqual(2);
    });

    it('should rate complex password as strong', () => {
      const result = getPasswordStrength('MyP@ssw0rd123!');
      expect(result.score).toBeGreaterThanOrEqual(3);
    });

    it('should rate very long complex password as very strong', () => {
      const result = getPasswordStrength('MyVeryL0ng&Compl3xP@ssw0rd!');
      expect(result.score).toBe(4);
      expect(result.label).toBe('Very strong');
    });

    it('should cap score at 4', () => {
      const result = getPasswordStrength('ExtremelyL0ng&Compl3x!P@ssw0rd#W1thM@nyChar$');
      expect(result.score).toBeLessThanOrEqual(4);
    });
  });
});
