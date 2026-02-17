/**
 * Nurture Email Templates Tests
 *
 * Tests for all 5 nurture email templates.
 *
 * Story 20.3: Nurture Sequence Content
 * Task 4: Write tests (AC: all)
 */

import { describe, it, expect } from 'vitest';
import { generateNurtureEmail } from '@/lib/email/templates/nurture';
import { generateNurtureEmailDay0 } from '@/lib/email/templates/nurture/day-0';
import { generateNurtureEmailDay3 } from '@/lib/email/templates/nurture/day-3';
import { generateNurtureEmailDay7, FREE_ROI_DASHBOARD_URL } from '@/lib/email/templates/nurture/day-7';
import { generateNurtureEmailDay10 } from '@/lib/email/templates/nurture/day-10';
import { generateNurtureEmailDay14 } from '@/lib/email/templates/nurture/day-14';
import type { NurtureEmailContext } from '@/lib/email/nurture-config';

const baseContext: NurtureEmailContext = {
  firstName: 'John',
  userEmail: 'john@example.com',
  totalAlignmentTax: '$2,500,000',
  estimatedSavings: '$1,200,000',
  previewUrl: 'https://lastparadigm.com/preview',
  purchaseUrl: 'https://lastparadigm.com/purchase',
  unsubscribeUrl: 'https://lastparadigm.com/unsubscribe?token=abc123',
  unsubscribeToken: 'abc123',
  baseUrl: 'https://lastparadigm.com',
};

describe('Nurture Email Templates', () => {
  describe('generateNurtureEmail', () => {
    it('should generate Day 0 email', () => {
      const { subject, html, text } = generateNurtureEmail(0, baseContext);
      expect(subject).toContain('diagnostic results');
      expect(html).toBeDefined();
      expect(text).toBeDefined();
    });

    it('should generate Day 3 email', () => {
      const { subject, html, text } = generateNurtureEmail(3, baseContext);
      expect(subject).toContain('47%');
      expect(html).toBeDefined();
      expect(text).toBeDefined();
    });

    it('should generate Day 7 email', () => {
      const { subject, html, text } = generateNurtureEmail(7, baseContext);
      expect(subject).toContain('Free tool');
      expect(html).toBeDefined();
      expect(text).toBeDefined();
    });

    it('should generate Day 10 email', () => {
      const { subject, html, text } = generateNurtureEmail(10, baseContext);
      expect(subject).toContain('$1,200,000');
      expect(html).toBeDefined();
      expect(text).toBeDefined();
    });

    it('should generate Day 14 email', () => {
      const { subject, html, text } = generateNurtureEmail(14, baseContext);
      expect(subject).toContain('Questions');
      expect(html).toBeDefined();
      expect(text).toBeDefined();
    });

    it('should throw error for invalid day', () => {
      expect(() => generateNurtureEmail(5 as any, baseContext)).toThrow();
    });
  });

  describe('Day 0 Email', () => {
    it('should have correct subject', () => {
      const { subject } = generateNurtureEmailDay0(baseContext);
      expect(subject).toBe('Your diagnostic results are saved');
    });

    it('should include alignment tax and savings (AC2)', () => {
      const { html, text } = generateNurtureEmailDay0(baseContext);
      expect(html).toContain('$2,500,000');
      expect(html).toContain('$1,200,000');
      expect(text).toContain('$2,500,000');
      expect(text).toContain('$1,200,000');
    });

    it('should include personalized greeting (AC2)', () => {
      const { html, text } = generateNurtureEmailDay0(baseContext);
      expect(html).toContain('Hi John');
      expect(text).toContain('Hi John');
    });

    it('should include book attribution (AC3, FR65)', () => {
      const { html, text } = generateNurtureEmailDay0(baseContext);
      expect(html).toContain('The Last Paradigm');
      expect(text).toContain('The Last Paradigm');
    });

    it('should include CTA to preview page (AC5)', () => {
      const { html, text } = generateNurtureEmailDay0(baseContext);
      expect(html).toContain(baseContext.previewUrl);
      expect(text).toContain(baseContext.previewUrl);
      expect(html).toContain('View Your Savings Preview');
    });

    it('should include unsubscribe link (AC6, NFR30)', () => {
      const { html } = generateNurtureEmailDay0(baseContext);
      expect(html).toContain('unsubscribe');
    });
  });

  describe('Day 3 Email', () => {
    it('should have case study subject', () => {
      const { subject } = generateNurtureEmailDay3(baseContext);
      expect(subject).toContain('47%');
    });

    it('should include case study metrics', () => {
      const { html, text } = generateNurtureEmailDay3(baseContext);
      expect(html).toContain('47%');
      expect(html).toContain('62%');
      expect(html).toContain('$1.5M');
      expect(text).toContain('47%');
    });

    it('should reference user alignment tax', () => {
      const { html, text } = generateNurtureEmailDay3(baseContext);
      expect(html).toContain('$2,500,000');
      expect(text).toContain('$2,500,000');
    });

    it('should include CTA to preview (AC5)', () => {
      const { html } = generateNurtureEmailDay3(baseContext);
      expect(html).toContain('See Your Transformation Potential');
      expect(html).toContain(baseContext.previewUrl);
    });
  });

  describe('Day 7 Email', () => {
    it('should have free tool subject', () => {
      const { subject } = generateNurtureEmailDay7(baseContext);
      expect(subject).toContain('Free tool');
      expect(subject).toContain('ROI Dashboard');
    });

    it('should include download link for free sample (AC4)', () => {
      const { html, text } = generateNurtureEmailDay7(baseContext);
      expect(html).toContain(FREE_ROI_DASHBOARD_URL);
      expect(text).toContain(FREE_ROI_DASHBOARD_URL);
      expect(html).toContain('Download Free Template');
    });

    it('should tease full toolkit (AC4)', () => {
      const { html, text } = generateNurtureEmailDay7(baseContext);
      expect(html).toContain('10 enterprise-grade documents');
      expect(text).toContain('10 enterprise-grade documents');
    });

    it('should include CTA to purchase (AC5)', () => {
      const { html } = generateNurtureEmailDay7(baseContext);
      expect(html).toContain('Unlock the Full Toolkit');
      expect(html).toContain(baseContext.purchaseUrl);
    });
  });

  describe('Day 10 Email', () => {
    it('should have personalized urgency subject', () => {
      const { subject } = generateNurtureEmailDay10(baseContext);
      expect(subject).toContain('$1,200,000');
      expect(subject).toContain('waiting');
    });

    it('should include testimonial', () => {
      const { html, text } = generateNurtureEmailDay10(baseContext);
      expect(html).toContain('Sarah Chen');
      expect(html).toContain('Meridian Tech');
      expect(text).toContain('Sarah Chen');
    });

    it('should include 30-day guarantee', () => {
      const { html, text } = generateNurtureEmailDay10(baseContext);
      expect(html).toContain('30-day money-back guarantee');
      expect(text).toContain('30-day money-back guarantee');
    });

    it('should include CTA to purchase (AC5)', () => {
      const { html } = generateNurtureEmailDay10(baseContext);
      expect(html).toContain('Start Saving Now');
      expect(html).toContain(baseContext.purchaseUrl);
    });
  });

  describe('Day 14 Email', () => {
    it('should have questions subject', () => {
      const { subject } = generateNurtureEmailDay14(baseContext);
      expect(subject).toBe('Questions about the toolkit?');
    });

    it('should address common objections', () => {
      const { html, text } = generateNurtureEmailDay14(baseContext);
      expect(html).toContain('Is the $2,500 worth it?');
      expect(html).toContain('Do I need to get buy-in first?');
      expect(html).toContain('What if it doesn\'t work');
    });

    it('should offer consultation/support', () => {
      const { html, text } = generateNurtureEmailDay14(baseContext);
      expect(html).toContain('Reply to this email');
      expect(text).toContain('Reply to this email');
    });

    it('should note this is final email', () => {
      const { html, text } = generateNurtureEmailDay14(baseContext);
      expect(html).toContain('last email in our series');
      expect(text).toContain('last email in our series');
    });

    it('should include CTA to preview (AC5)', () => {
      const { html } = generateNurtureEmailDay14(baseContext);
      expect(html).toContain('Get Your Questions Answered');
      expect(html).toContain(baseContext.previewUrl);
    });
  });

  describe('All templates', () => {
    const days = [0, 3, 7, 10, 14] as const;

    days.forEach((day) => {
      describe(`Day ${day}`, () => {
        it('should follow branded template (AC6, FR62)', () => {
          const { html } = generateNurtureEmail(day, baseContext);
          expect(html).toContain('#D4AF37'); // Brand gold
          expect(html).toContain('#0A0A0A'); // Charcoal background
          expect(html).toContain('The Last Paradigm');
        });

        it('should include unsubscribe link (AC6, NFR30)', () => {
          const { html, text } = generateNurtureEmail(day, baseContext);
          expect(html.toLowerCase()).toContain('unsubscribe');
          expect(text.toLowerCase()).toContain('unsubscribe');
        });

        it('should be mobile responsive (AC6)', () => {
          const { html } = generateNurtureEmail(day, baseContext);
          expect(html).toContain('viewport');
          expect(html).toContain('width=device-width');
        });

        it('should generate valid HTML', () => {
          const { html } = generateNurtureEmail(day, baseContext);
          expect(html).toContain('<!DOCTYPE html>');
          expect(html).toContain('<html');
          expect(html).toContain('</html>');
        });
      });
    });
  });
});
