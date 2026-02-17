/**
 * Email Utilities Tests
 *
 * Tests for email utility functions.
 *
 * Story 20.1: Email Template System
 * Task 5: Write comprehensive tests
 */

import { describe, it, expect } from 'vitest';
import {
  generateEmailToken,
  escapeHtml,
  formatCurrency,
  formatNumber,
  formatPercent,
  getFirstName,
  generateUnsubscribeUrl,
  isValidEmail,
  daysBetween,
  getNurtureEmailSchedule,
} from '@/lib/email/utils';

describe('Email Utilities', () => {
  describe('generateEmailToken', () => {
    it('should generate a token of appropriate length', () => {
      const token = generateEmailToken();
      // Base64url encoding: 32 bytes = ~43 characters
      expect(token.length).toBeGreaterThanOrEqual(40);
    });

    it('should generate unique tokens', () => {
      const token1 = generateEmailToken();
      const token2 = generateEmailToken();
      expect(token1).not.toBe(token2);
    });

    it('should generate URL-safe tokens', () => {
      const token = generateEmailToken();
      // Base64url should not contain + / =
      expect(token).not.toMatch(/[+/=]/);
    });

    it('should respect custom length parameter', () => {
      const shortToken = generateEmailToken(16);
      const longToken = generateEmailToken(64);
      expect(shortToken.length).toBeLessThan(longToken.length);
    });
  });

  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
      expect(escapeHtml('"quoted"')).toBe('&quot;quoted&quot;');
      expect(escapeHtml("it's")).toBe('it&#039;s');
      expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
    });

    it('should handle empty strings', () => {
      expect(escapeHtml('')).toBe('');
    });

    it('should handle strings without special characters', () => {
      const input = 'Hello World 123';
      expect(escapeHtml(input)).toBe(input);
    });
  });

  describe('formatCurrency', () => {
    it('should format currency with default USD', () => {
      expect(formatCurrency(1000)).toBe('$1,000');
      expect(formatCurrency(2500000)).toBe('$2,500,000');
    });

    it('should format without decimal places', () => {
      expect(formatCurrency(1234.56)).toBe('$1,235');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('$0');
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with thousands separators', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
    });

    it('should handle small numbers', () => {
      expect(formatNumber(123)).toBe('123');
    });

    it('should handle zero', () => {
      expect(formatNumber(0)).toBe('0');
    });
  });

  describe('formatPercent', () => {
    it('should format decimal as percentage', () => {
      expect(formatPercent(0.25)).toBe('25%');
      expect(formatPercent(0.5)).toBe('50%');
      expect(formatPercent(1)).toBe('100%');
    });

    it('should handle decimal places', () => {
      expect(formatPercent(0.255, 1)).toBe('25.5%');
      expect(formatPercent(0.2555, 2)).toBe('25.55%');
    });
  });

  describe('getFirstName', () => {
    it('should extract first name from full name', () => {
      expect(getFirstName('John Doe')).toBe('John');
      expect(getFirstName('Jane Smith')).toBe('Jane');
    });

    it('should handle single name', () => {
      expect(getFirstName('Alice')).toBe('Alice');
    });

    it('should return "there" for null/undefined name', () => {
      expect(getFirstName(null)).toBe('there');
      expect(getFirstName(undefined)).toBe('there');
    });

    it('should extract name-like portion from email', () => {
      // With dots/underscores as separators
      expect(getFirstName(null, 'john.doe@example.com')).toBe('Johndoe');
      // With numbers stripped
      expect(getFirstName(null, 'jane123@example.com')).toBe('Jane');
    });

    it('should return "there" if email has no name-like portion', () => {
      expect(getFirstName(null, '123@example.com')).toBe('there');
    });
  });

  describe('generateUnsubscribeUrl', () => {
    it('should generate URL with email and token params', () => {
      const url = generateUnsubscribeUrl(
        'test@example.com',
        'abc123',
        'https://example.com'
      );
      expect(url).toContain('https://example.com/unsubscribe');
      expect(url).toContain('email=test%40example.com');
      expect(url).toContain('token=abc123');
    });

    it('should URL-encode special characters in email', () => {
      const url = generateUnsubscribeUrl(
        'test+special@example.com',
        'token',
        'https://example.com'
      );
      expect(url).toContain('test%2Bspecial');
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email formats', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.org')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(isValidEmail('notanemail')).toBe(false);
      expect(isValidEmail('missing@domain')).toBe(false);
      expect(isValidEmail('@nodomain.com')).toBe(false);
      expect(isValidEmail('spaces in@email.com')).toBe(false);
    });
  });

  describe('daysBetween', () => {
    it('should calculate days between dates', () => {
      const date1 = new Date('2026-01-01');
      const date2 = new Date('2026-01-08');
      expect(daysBetween(date1, date2)).toBe(7);
    });

    it('should return 0 for same date', () => {
      const date = new Date('2026-01-01');
      expect(daysBetween(date, date)).toBe(0);
    });

    it('should handle reverse order', () => {
      const date1 = new Date('2026-01-08');
      const date2 = new Date('2026-01-01');
      expect(daysBetween(date1, date2)).toBe(7);
    });
  });

  describe('getNurtureEmailSchedule', () => {
    it('should calculate Day 0 email (immediate)', () => {
      const trigger = new Date('2026-01-01T10:00:00Z');
      const scheduled = getNurtureEmailSchedule(trigger, 0);
      expect(scheduled.getDate()).toBe(trigger.getDate());
    });

    it('should calculate Day 3 email', () => {
      const trigger = new Date('2026-01-01T10:00:00Z');
      const scheduled = getNurtureEmailSchedule(trigger, 3);
      expect(scheduled.getDate()).toBe(4); // Jan 4
    });

    it('should calculate Day 14 email', () => {
      const trigger = new Date('2026-01-01T10:00:00Z');
      const scheduled = getNurtureEmailSchedule(trigger, 14);
      expect(scheduled.getDate()).toBe(15); // Jan 15
    });
  });
});
