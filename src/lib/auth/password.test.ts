/**
 * Password Utilities Tests
 *
 * Tests for bcrypt password hashing and verification.
 *
 * Covers: Story 15.2 Task 1.4, NFR17 (Password hashing)
 */

import { describe, it, expect } from 'vitest';
import {
  validatePassword,
  getPasswordStrength,
  PASSWORD_MIN_LENGTH,
  PASSWORD_REQUIREMENTS,
} from './password-utils';

describe('password-utils', () => {
  describe('validatePassword', () => {
    it('should accept valid password with letters and numbers', () => {
      const result = validatePassword('Password123');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject password shorter than minimum length', () => {
      const result = validatePassword('Pass1');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        `Password must be at least ${PASSWORD_MIN_LENGTH} characters`
      );
    });

    it('should reject password without numbers', () => {
      const result = validatePassword('PasswordOnly');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'Password must contain at least one number'
      );
    });

    it('should reject password without letters', () => {
      const result = validatePassword('12345678');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'Password must contain at least one letter'
      );
    });

    it('should return multiple errors for multiple violations', () => {
      const result = validatePassword('123');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });

    it('should accept password at exactly minimum length', () => {
      const result = validatePassword('Passwo1d'); // 8 chars
      expect(result.valid).toBe(true);
    });
  });

  describe('getPasswordStrength', () => {
    it('should return score 0 for very weak password', () => {
      const result = getPasswordStrength('');
      expect(result.score).toBe(0);
      expect(result.label).toBe('Very weak');
    });

    it('should return score 1 for weak password', () => {
      const result = getPasswordStrength('password');
      expect(result.score).toBe(1);
      expect(result.label).toBe('Weak');
    });

    it('should return higher score for mixed case', () => {
      const result = getPasswordStrength('Password');
      expect(result.score).toBeGreaterThanOrEqual(2);
    });

    it('should return higher score for numbers', () => {
      const result = getPasswordStrength('Password1');
      expect(result.score).toBeGreaterThanOrEqual(3);
    });

    it('should return highest score for complex password', () => {
      const result = getPasswordStrength('MyP@ssword123!');
      expect(result.score).toBe(4);
      expect(result.label).toBe('Very strong');
    });

    it('should increase score with length', () => {
      const short = getPasswordStrength('Pass1');
      const medium = getPasswordStrength('Password1');
      const long = getPasswordStrength('VeryLongPassword1');

      expect(medium.score).toBeGreaterThanOrEqual(short.score);
      expect(long.score).toBeGreaterThanOrEqual(medium.score);
    });
  });

  describe('PASSWORD_REQUIREMENTS', () => {
    it('should have correct minimum length', () => {
      expect(PASSWORD_MIN_LENGTH).toBe(8);
    });

    it('should require number', () => {
      expect(PASSWORD_REQUIREMENTS.requireNumber).toBe(true);
    });

    it('should require letter', () => {
      expect(PASSWORD_REQUIREMENTS.requireLetter).toBe(true);
    });
  });
});
