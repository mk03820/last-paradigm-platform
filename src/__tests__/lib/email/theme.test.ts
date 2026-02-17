/**
 * Email Theme Tests
 *
 * Tests for email theme constants and styles.
 *
 * Story 20.1: Email Template System
 * Task 5.3: Unit tests for theme constants
 */

import { describe, it, expect } from 'vitest';
import {
  emailTheme,
  emailTypography,
  emailButtonStyles,
  emailSpacing,
  emailLayout,
} from '@/lib/email/theme';

describe('Email Theme', () => {
  describe('emailTheme colors', () => {
    it('should define brand gold color', () => {
      expect(emailTheme.brandGold).toBe('#D4AF37');
    });

    it('should define background colors', () => {
      expect(emailTheme.backgroundColor).toBe('#0A0A0A');
      expect(emailTheme.cardBg).toBe('#1A1A1A');
      expect(emailTheme.navyBg).toBe('#1e293b');
    });

    it('should define text colors', () => {
      expect(emailTheme.textColor).toBe('#E5E7EB');
      expect(emailTheme.mutedColor).toBe('#9CA3AF');
      expect(emailTheme.headingColor).toBe('#FFFFFF');
    });

    it('should define button colors', () => {
      expect(emailTheme.buttonBg).toBe('#D4AF37');
      expect(emailTheme.buttonText).toBe('#0A0A0A');
    });

    it('should have valid hex color format for all colors', () => {
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
      Object.values(emailTheme).forEach((color) => {
        expect(color).toMatch(hexColorRegex);
      });
    });
  });

  describe('emailTypography', () => {
    it('should define system font family', () => {
      expect(emailTypography.fontFamily).toContain('-apple-system');
      expect(emailTypography.fontFamily).toContain('Segoe UI');
      expect(emailTypography.fontFamily).toContain('Arial');
    });

    it('should define font sizes', () => {
      expect(emailTypography.sizes.base).toBe('15px');
      expect(emailTypography.sizes.lg).toBe('18px');
      expect(emailTypography.sizes.xl).toBe('20px');
    });

    it('should define font weights', () => {
      expect(emailTypography.weights.normal).toBe('400');
      expect(emailTypography.weights.semibold).toBe('600');
      expect(emailTypography.weights.bold).toBe('700');
    });

    it('should define line heights', () => {
      expect(emailTypography.lineHeights.normal).toBe('1.5');
      expect(emailTypography.lineHeights.relaxed).toBe('1.6');
    });
  });

  describe('emailButtonStyles', () => {
    it('should define primary button styles with tap-friendly height', () => {
      expect(emailButtonStyles.primary.padding).toBe('16px 36px');
      expect(emailButtonStyles.primary.backgroundColor).toBe(emailTheme.brandGold);
      expect(emailButtonStyles.primary.minHeight).toBe('44px');
    });

    it('should define secondary button styles', () => {
      expect(emailButtonStyles.secondary.backgroundColor).toBe('transparent');
      expect(emailButtonStyles.secondary.minHeight).toBe('44px');
    });

    it('should have minimum 44px height for tap targets (AC2)', () => {
      expect(parseInt(emailButtonStyles.primary.minHeight)).toBeGreaterThanOrEqual(44);
      expect(parseInt(emailButtonStyles.secondary.minHeight)).toBeGreaterThanOrEqual(44);
    });
  });

  describe('emailSpacing', () => {
    it('should define spacing values', () => {
      expect(emailSpacing.xs).toBe('8px');
      expect(emailSpacing.sm).toBe('12px');
      expect(emailSpacing.md).toBe('16px');
      expect(emailSpacing.lg).toBe('24px');
      expect(emailSpacing.xl).toBe('32px');
    });
  });

  describe('emailLayout', () => {
    it('should define max width', () => {
      expect(emailLayout.maxWidth).toBe('520px');
    });

    it('should define padding values', () => {
      expect(emailLayout.contentPadding).toBe('32px');
      expect(emailLayout.mobilePadding).toBe('20px');
    });
  });
});
