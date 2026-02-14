/**
 * Savings Calculator Service Tests
 *
 * Story 16.1: Preview Page Layout & Savings Headline
 * Task 2.6: Add unit tests for savings calculation logic
 * Task 7.1: Unit tests for savings-calculator.ts
 */

import { describe, it, expect } from 'vitest';
import {
  calculateEstimatedSavings,
  getSeverityLevel,
  getSavingsContext,
  formatSavingsAmount,
  formatPercentage,
  parseNumericValue,
  DEFAULT_RECOVERY_RATE,
  type SeverityLevel,
} from './savings-calculator';

describe('calculateEstimatedSavings', () => {
  it('calculates savings with default recovery rate', () => {
    expect(calculateEstimatedSavings(1_000_000)).toBe(500_000);
    expect(calculateEstimatedSavings(4_800_000)).toBe(2_400_000);
  });

  it('calculates savings with custom recovery rate', () => {
    expect(calculateEstimatedSavings(1_000_000, 0.3)).toBe(300_000);
    expect(calculateEstimatedSavings(1_000_000, 0.75)).toBe(750_000);
  });

  it('returns 0 for negative alignment tax', () => {
    expect(calculateEstimatedSavings(-100_000)).toBe(0);
  });

  it('returns 0 for invalid recovery rates', () => {
    expect(calculateEstimatedSavings(1_000_000, -0.5)).toBe(0);
    expect(calculateEstimatedSavings(1_000_000, 1.5)).toBe(0);
  });

  it('handles zero alignment tax', () => {
    expect(calculateEstimatedSavings(0)).toBe(0);
  });

  it('handles very large numbers', () => {
    expect(calculateEstimatedSavings(100_000_000)).toBe(50_000_000);
    expect(calculateEstimatedSavings(1_000_000_000)).toBe(500_000_000);
  });

  it('rounds result to nearest dollar', () => {
    expect(calculateEstimatedSavings(1_000_001, 0.5)).toBe(500_001);
  });

  it('uses DEFAULT_RECOVERY_RATE of 0.5', () => {
    expect(DEFAULT_RECOVERY_RATE).toBe(0.5);
  });
});

describe('getSeverityLevel', () => {
  it('returns normal for < 2%', () => {
    expect(getSeverityLevel(0)).toBe('normal');
    expect(getSeverityLevel(1)).toBe('normal');
    expect(getSeverityLevel(1.9)).toBe('normal');
  });

  it('returns significant for 2-4%', () => {
    expect(getSeverityLevel(2)).toBe('significant');
    expect(getSeverityLevel(3)).toBe('significant');
    expect(getSeverityLevel(3.9)).toBe('significant');
  });

  it('returns crisis for 4-7%', () => {
    expect(getSeverityLevel(4)).toBe('crisis');
    expect(getSeverityLevel(5)).toBe('crisis');
    expect(getSeverityLevel(6.9)).toBe('crisis');
  });

  it('returns existential for >= 7%', () => {
    expect(getSeverityLevel(7)).toBe('existential');
    expect(getSeverityLevel(10)).toBe('existential');
    expect(getSeverityLevel(20)).toBe('existential');
  });

  it('handles edge cases at threshold boundaries', () => {
    expect(getSeverityLevel(1.99)).toBe('normal');
    expect(getSeverityLevel(2.0)).toBe('significant');
    expect(getSeverityLevel(3.99)).toBe('significant');
    expect(getSeverityLevel(4.0)).toBe('crisis');
    expect(getSeverityLevel(6.99)).toBe('crisis');
    expect(getSeverityLevel(7.0)).toBe('existential');
  });
});

describe('getSavingsContext', () => {
  const severityLevels: SeverityLevel[] = ['normal', 'significant', 'crisis', 'existential'];
  const testPercentages = [1, 3, 5, 10];

  it('returns context with all required fields', () => {
    testPercentages.forEach((percent) => {
      const context = getSavingsContext(percent);
      expect(context).toHaveProperty('headline');
      expect(context).toHaveProperty('subheadline');
      expect(context).toHaveProperty('severityLevel');
      expect(context).toHaveProperty('ctaMessage');
      expect(context).toHaveProperty('color');
      expect(context).toHaveProperty('bgColor');
    });
  });

  it('returns correct context for normal level', () => {
    const context = getSavingsContext(1);
    expect(context.severityLevel).toBe('normal');
    expect(context.headline).toBe('Fine-tune your operations');
    expect(context.ctaMessage).toBe('Capture available savings');
    expect(context.color).toContain('green');
    expect(context.bgColor).toContain('green');
  });

  it('returns correct context for significant level', () => {
    const context = getSavingsContext(3);
    expect(context.severityLevel).toBe('significant');
    expect(context.headline).toBe('Meaningful savings await');
    expect(context.ctaMessage).toBe('Unlock your savings potential');
    expect(context.color).toContain('yellow');
    expect(context.bgColor).toContain('yellow');
  });

  it('returns correct context for crisis level', () => {
    const context = getSavingsContext(5);
    expect(context.severityLevel).toBe('crisis');
    expect(context.headline).toBe('Urgent intervention required');
    expect(context.ctaMessage).toBe('Start your transformation now');
    expect(context.color).toContain('orange');
    expect(context.bgColor).toContain('orange');
  });

  it('returns correct context for existential level', () => {
    const context = getSavingsContext(10);
    expect(context.severityLevel).toBe('existential');
    expect(context.headline).toBe('Transform or face extinction');
    expect(context.ctaMessage).toBe('Begin your survival plan');
    expect(context.color).toContain('red');
    expect(context.bgColor).toContain('red');
  });

  it('includes dark mode classes in colors', () => {
    testPercentages.forEach((percent) => {
      const context = getSavingsContext(percent);
      expect(context.color).toContain('dark:');
      expect(context.bgColor).toContain('dark:');
    });
  });
});

describe('formatSavingsAmount', () => {
  it('formats billions correctly', () => {
    expect(formatSavingsAmount(1_000_000_000)).toBe('$1.0B');
    expect(formatSavingsAmount(2_500_000_000)).toBe('$2.5B');
  });

  it('formats millions correctly', () => {
    expect(formatSavingsAmount(1_000_000)).toBe('$1.0M');
    expect(formatSavingsAmount(2_400_000)).toBe('$2.4M');
    expect(formatSavingsAmount(12_300_000)).toBe('$12.3M');
  });

  it('formats thousands correctly', () => {
    expect(formatSavingsAmount(1_000)).toBe('$1K');
    expect(formatSavingsAmount(500_000)).toBe('$500K');
    expect(formatSavingsAmount(50_000)).toBe('$50K');
  });

  it('formats small amounts correctly', () => {
    expect(formatSavingsAmount(500)).toBe('$500');
    expect(formatSavingsAmount(999)).toBe('$999');
  });

  it('handles zero', () => {
    expect(formatSavingsAmount(0)).toBe('$0');
  });

  it('handles boundary cases', () => {
    expect(formatSavingsAmount(999_999)).toBe('$1000K');
    expect(formatSavingsAmount(1_000_001)).toBe('$1.0M');
    expect(formatSavingsAmount(999_999_999)).toBe('$1000.0M');
  });
});

describe('formatPercentage', () => {
  it('formats whole numbers', () => {
    expect(formatPercentage(5)).toBe('5.0%');
    expect(formatPercentage(10)).toBe('10.0%');
  });

  it('formats decimals with one decimal place', () => {
    expect(formatPercentage(5.2)).toBe('5.2%');
    expect(formatPercentage(3.14159)).toBe('3.1%');
  });

  it('handles zero', () => {
    expect(formatPercentage(0)).toBe('0.0%');
  });

  it('handles large percentages', () => {
    expect(formatPercentage(100)).toBe('100.0%');
    expect(formatPercentage(150)).toBe('150.0%');
  });
});

describe('parseNumericValue', () => {
  it('parses string numbers', () => {
    expect(parseNumericValue('1000000')).toBe(1_000_000);
    expect(parseNumericValue('2.5')).toBe(2.5);
  });

  it('passes through numbers unchanged', () => {
    expect(parseNumericValue(1_000_000)).toBe(1_000_000);
    expect(parseNumericValue(2.5)).toBe(2.5);
  });

  it('returns 0 for null', () => {
    expect(parseNumericValue(null)).toBe(0);
  });

  it('returns 0 for invalid strings', () => {
    expect(parseNumericValue('not a number')).toBe(0);
    expect(parseNumericValue('')).toBe(0);
  });

  it('handles negative numbers', () => {
    expect(parseNumericValue('-1000')).toBe(-1000);
    expect(parseNumericValue(-500)).toBe(-500);
  });
});
