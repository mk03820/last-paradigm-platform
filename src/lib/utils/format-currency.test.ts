import { describe, it, expect } from 'vitest';
import { formatCurrency } from './format-currency';

describe('formatCurrency', () => {
  describe('basic formatting', () => {
    it('formats small amounts correctly', () => {
      expect(formatCurrency(0)).toBe('$0');
      expect(formatCurrency(1)).toBe('$1');
      expect(formatCurrency(99)).toBe('$99');
    });

    it('formats hundreds correctly', () => {
      expect(formatCurrency(100)).toBe('$100');
      expect(formatCurrency(500)).toBe('$500');
      expect(formatCurrency(999)).toBe('$999');
    });

    it('formats thousands with commas', () => {
      expect(formatCurrency(1000)).toBe('$1,000');
      expect(formatCurrency(1234)).toBe('$1,234');
      expect(formatCurrency(9999)).toBe('$9,999');
    });

    it('formats tens of thousands correctly', () => {
      expect(formatCurrency(10000)).toBe('$10,000');
      expect(formatCurrency(50000)).toBe('$50,000');
      expect(formatCurrency(99999)).toBe('$99,999');
    });

    it('formats hundreds of thousands correctly', () => {
      expect(formatCurrency(100000)).toBe('$100,000');
      expect(formatCurrency(500000)).toBe('$500,000');
      expect(formatCurrency(999999)).toBe('$999,999');
    });

    it('formats millions correctly', () => {
      expect(formatCurrency(1000000)).toBe('$1,000,000');
      expect(formatCurrency(5000000)).toBe('$5,000,000');
      expect(formatCurrency(12345678)).toBe('$12,345,678');
    });
  });

  describe('decimal handling', () => {
    it('rounds decimal values to whole dollars (no decimal places)', () => {
      expect(formatCurrency(100.49)).toBe('$100');
      expect(formatCurrency(100.50)).toBe('$101');
      expect(formatCurrency(100.99)).toBe('$101');
    });

    it('handles very small decimals', () => {
      expect(formatCurrency(0.01)).toBe('$0');
      expect(formatCurrency(0.99)).toBe('$1');
    });
  });

  describe('locale handling', () => {
    it('uses US dollar formatting by default', () => {
      const result = formatCurrency(1234567);
      expect(result).toContain('$');
      expect(result).toContain(',');
    });
  });

  describe('edge cases', () => {
    it('handles negative numbers', () => {
      expect(formatCurrency(-100)).toBe('-$100');
      expect(formatCurrency(-1000)).toBe('-$1,000');
    });

    it('handles very large numbers', () => {
      expect(formatCurrency(1000000000)).toBe('$1,000,000,000');
    });
  });
});
