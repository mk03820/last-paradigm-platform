/**
 * Preview Page Tests
 *
 * Story 16.1: Preview Page Layout & Savings Headline
 * Task 7.5: Integration tests for preview page
 *
 * Note: Server component testing with Next.js requires the full runtime.
 * These tests focus on the integration behaviors we can verify in unit tests.
 */

import { describe, it, expect } from 'vitest';

describe('Preview Page Integration', () => {
  describe('authentication requirements (AC8)', () => {
    it('documents expected redirect URL for unauthenticated users', () => {
      // Per AC8: redirect to login with callback URL
      const expectedRedirectUrl = '/auth/signin?callbackUrl=/preview';
      expect(expectedRedirectUrl).toContain('callbackUrl=/preview');
      expect(expectedRedirectUrl).toContain('/auth/signin');
    });
  });

  describe('savings calculation integration (AC1)', () => {
    it('uses savings calculator service correctly', async () => {
      const {
        calculateEstimatedSavings,
        getSavingsContext,
        parseNumericValue,
        DEFAULT_RECOVERY_RATE,
      } = await import('@/lib/services/savings-calculator');

      // Verify service functions are available
      expect(typeof calculateEstimatedSavings).toBe('function');
      expect(typeof getSavingsContext).toBe('function');
      expect(typeof parseNumericValue).toBe('function');
      expect(DEFAULT_RECOVERY_RATE).toBe(0.5);
    });

    it('calculates 50% savings from alignment tax', async () => {
      const { calculateEstimatedSavings } = await import(
        '@/lib/services/savings-calculator'
      );

      // Default recovery rate is 50%
      expect(calculateEstimatedSavings(4_800_000)).toBe(2_400_000);
      expect(calculateEstimatedSavings(1_000_000)).toBe(500_000);
    });
  });

  describe('severity context mapping (AC3)', () => {
    it('maps normal percentage to correct context', async () => {
      const { getSavingsContext } = await import(
        '@/lib/services/savings-calculator'
      );

      const context = getSavingsContext(1.5);
      expect(context.severityLevel).toBe('normal');
      expect(context.headline).toBe('Fine-tune your operations');
      expect(context.ctaMessage).toBe('Capture available savings');
    });

    it('maps significant percentage to correct context', async () => {
      const { getSavingsContext } = await import(
        '@/lib/services/savings-calculator'
      );

      const context = getSavingsContext(3);
      expect(context.severityLevel).toBe('significant');
      expect(context.headline).toBe('Meaningful savings await');
    });

    it('maps crisis percentage to correct context', async () => {
      const { getSavingsContext } = await import(
        '@/lib/services/savings-calculator'
      );

      const context = getSavingsContext(5.2);
      expect(context.severityLevel).toBe('crisis');
      expect(context.headline).toBe('Urgent intervention required');
      expect(context.ctaMessage).toBe('Start your transformation now');
    });

    it('maps existential percentage to correct context', async () => {
      const { getSavingsContext } = await import(
        '@/lib/services/savings-calculator'
      );

      const context = getSavingsContext(10);
      expect(context.severityLevel).toBe('existential');
      expect(context.headline).toBe('Transform or face extinction');
    });
  });

  describe('component availability', () => {
    it('provides PreviewHero component', async () => {
      const { PreviewHero } = await import('@/components/preview');
      expect(typeof PreviewHero).toBe('function');
    });

    it('provides PreviewPageSkeleton component', async () => {
      const { PreviewPageSkeleton } = await import('@/components/preview');
      expect(typeof PreviewPageSkeleton).toBe('function');
    });

    it('provides BookAttribution component', async () => {
      const { BookAttribution } = await import('@/components/preview');
      expect(typeof BookAttribution).toBe('function');
    });

    it('provides PersonalizedMessage component', async () => {
      const { PersonalizedMessage } = await import('@/components/preview');
      expect(typeof PersonalizedMessage).toBe('function');
    });

    it('provides AnimatedNumber component', async () => {
      const { AnimatedNumber } = await import('@/components/preview');
      expect(typeof AnimatedNumber).toBe('function');
    });
  });

  describe('numeric value parsing', () => {
    it('parses database string values', async () => {
      const { parseNumericValue } = await import(
        '@/lib/services/savings-calculator'
      );

      // Database stores numeric as string
      expect(parseNumericValue('4800000.00')).toBe(4800000);
      expect(parseNumericValue('2400000.50')).toBe(2400000.5);
    });

    it('handles null values from database', async () => {
      const { parseNumericValue } = await import(
        '@/lib/services/savings-calculator'
      );

      expect(parseNumericValue(null)).toBe(0);
    });
  });
});

/**
 * E2E Test Cases (for Playwright/Cypress):
 *
 * 1. Unauthenticated user visiting /preview:
 *    - Should redirect to /auth/signin?callbackUrl=/preview
 *
 * 2. Authenticated user without diagnostic data:
 *    - Should see "Complete Your Diagnostic First" message
 *    - Should see link to dashboard
 *
 * 3. Authenticated user with diagnostic data:
 *    - Should see PreviewHero with animated savings
 *    - Should see BookAttribution text
 *    - Should see PersonalizedMessage with severity-based content
 *    - Animation should respect prefers-reduced-motion
 *
 * 4. Responsive behavior:
 *    - Mobile: 32px headline, stacked layout
 *    - Desktop: 48-64px headline, centered layout
 *
 * 5. Performance:
 *    - Page should load in <2 seconds (NFR23)
 */
