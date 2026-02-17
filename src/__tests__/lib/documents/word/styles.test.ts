/**
 * Word Document Styles Tests
 *
 * Tests for brand style constants and helper functions.
 *
 * Story 18.2: Word Document Templates & Generation
 * Task 8.1: Unit tests for brand style constants
 */

import { describe, it, expect } from 'vitest';
import {
  BRAND_COLORS,
  BRAND_FONTS,
  DOCUMENT_STYLES,
  PAGE_MARGINS,
  SPACING,
  SCORE_THRESHOLDS,
  getScoreColor,
  getScoreInterpretation,
} from '@/lib/documents/word/styles';

describe('Brand Colors', () => {
  it('should have all required color constants', () => {
    expect(BRAND_COLORS.navy).toBe('0F172A');
    expect(BRAND_COLORS.slate).toBe('334155');
    expect(BRAND_COLORS.gold).toBe('D97706');
    expect(BRAND_COLORS.lightGray).toBe('F1F5F9');
    expect(BRAND_COLORS.white).toBe('FFFFFF');
  });

  it('should have valid hex color format (6 characters)', () => {
    Object.values(BRAND_COLORS).forEach((color) => {
      expect(color).toMatch(/^[0-9A-F]{6}$/);
    });
  });
});

describe('Brand Fonts', () => {
  it('should define heading, body, and mono fonts', () => {
    expect(BRAND_FONTS.heading).toBe('Calibri');
    expect(BRAND_FONTS.body).toBe('Calibri');
    expect(BRAND_FONTS.mono).toBe('Consolas');
  });
});

describe('Document Styles', () => {
  it('should define title style', () => {
    expect(DOCUMENT_STYLES.title.size).toBe(48); // 24pt
    expect(DOCUMENT_STYLES.title.bold).toBe(true);
    expect(DOCUMENT_STYLES.title.color).toBe(BRAND_COLORS.navy);
  });

  it('should define heading styles', () => {
    expect(DOCUMENT_STYLES.heading1.size).toBe(36); // 18pt
    expect(DOCUMENT_STYLES.heading2.size).toBe(28); // 14pt
    expect(DOCUMENT_STYLES.heading3.size).toBe(24); // 12pt
  });

  it('should define body style', () => {
    expect(DOCUMENT_STYLES.body.size).toBe(22); // 11pt
    expect(DOCUMENT_STYLES.body.font).toBe(BRAND_FONTS.body);
  });

  it('should define highlight styles with gold color', () => {
    expect(DOCUMENT_STYLES.highlight.color).toBe(BRAND_COLORS.gold);
    expect(DOCUMENT_STYLES.highlight.bold).toBe(true);
    expect(DOCUMENT_STYLES.highlightLarge.color).toBe(BRAND_COLORS.gold);
  });
});

describe('Page Margins', () => {
  it('should define standard page margins', () => {
    // Margins should be in twips (1 inch = 1440 twips)
    expect(PAGE_MARGINS.top).toBe(1440); // 1 inch
    expect(PAGE_MARGINS.bottom).toBe(1440);
    expect(PAGE_MARGINS.left).toBe(1800); // 1.25 inches
    expect(PAGE_MARGINS.right).toBe(1800);
  });
});

describe('Spacing Constants', () => {
  it('should define spacing values', () => {
    expect(SPACING.sectionBefore).toBeGreaterThan(0);
    expect(SPACING.sectionAfter).toBeGreaterThan(0);
    expect(SPACING.paragraphAfter).toBeGreaterThan(0);
    expect(SPACING.listItemAfter).toBeGreaterThan(0);
  });
});

describe('Score Thresholds', () => {
  it('should define score thresholds', () => {
    expect(SCORE_THRESHOLDS.excellent).toBe(80);
    expect(SCORE_THRESHOLDS.good).toBe(60);
    expect(SCORE_THRESHOLDS.moderate).toBe(40);
    expect(SCORE_THRESHOLDS.poor).toBe(20);
  });
});

describe('getScoreColor', () => {
  it('should return green for excellent scores (80+)', () => {
    expect(getScoreColor(80)).toBe(BRAND_COLORS.green);
    expect(getScoreColor(90)).toBe(BRAND_COLORS.green);
    expect(getScoreColor(100)).toBe(BRAND_COLORS.green);
  });

  it('should return gold for good scores (60-79)', () => {
    expect(getScoreColor(60)).toBe(BRAND_COLORS.gold);
    expect(getScoreColor(70)).toBe(BRAND_COLORS.gold);
    expect(getScoreColor(79)).toBe(BRAND_COLORS.gold);
  });

  it('should return amber for moderate scores (40-59)', () => {
    expect(getScoreColor(40)).toBe(BRAND_COLORS.amber);
    expect(getScoreColor(50)).toBe(BRAND_COLORS.amber);
    expect(getScoreColor(59)).toBe(BRAND_COLORS.amber);
  });

  it('should return red for poor scores (<40)', () => {
    expect(getScoreColor(39)).toBe(BRAND_COLORS.red);
    expect(getScoreColor(20)).toBe(BRAND_COLORS.red);
    expect(getScoreColor(0)).toBe(BRAND_COLORS.red);
  });
});

describe('getScoreInterpretation', () => {
  it('should return Excellent for scores 80+', () => {
    expect(getScoreInterpretation(80)).toBe('Excellent');
    expect(getScoreInterpretation(100)).toBe('Excellent');
  });

  it('should return Good for scores 60-79', () => {
    expect(getScoreInterpretation(60)).toBe('Good');
    expect(getScoreInterpretation(79)).toBe('Good');
  });

  it('should return Needs Improvement for scores 40-59', () => {
    expect(getScoreInterpretation(40)).toBe('Needs Improvement');
    expect(getScoreInterpretation(59)).toBe('Needs Improvement');
  });

  it('should return Critical for scores 20-39', () => {
    expect(getScoreInterpretation(20)).toBe('Critical');
    expect(getScoreInterpretation(39)).toBe('Critical');
  });

  it('should return Severe for scores <20', () => {
    expect(getScoreInterpretation(19)).toBe('Severe');
    expect(getScoreInterpretation(0)).toBe('Severe');
  });
});
