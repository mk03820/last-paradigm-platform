/**
 * Purchase Confirmation Email Tests
 *
 * Tests for purchase confirmation email template and send function.
 *
 * Story 20.2: Purchase Confirmation Email
 * Task 4: Write tests (AC: all)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generatePurchaseConfirmationEmail } from '@/lib/email/templates/purchase-confirmation';

// Mock the email client
vi.mock('@/lib/email/client', () => ({
  sendEmail: vi.fn(),
}));

describe('Purchase Confirmation Email', () => {
  describe('generatePurchaseConfirmationEmail', () => {
    const baseParams = {
      userName: 'John Doe',
      userEmail: 'john@example.com',
      amount: 2500,
      purchaseId: 'abc12345-6789-defg',
      downloadPortalUrl: 'https://lastparadigm.com/dashboard/toolkit',
      baseUrl: 'https://lastparadigm.com',
    };

    it('should generate correct subject line (AC2)', () => {
      const { subject } = generatePurchaseConfirmationEmail(baseParams);
      expect(subject).toBe('Your Playbook 2 Toolkit is Ready');
    });

    it('should include order amount in HTML (AC2)', () => {
      const { html } = generatePurchaseConfirmationEmail(baseParams);
      expect(html).toContain('$2,500');
    });

    it('should include order reference in HTML (AC2)', () => {
      const { html } = generatePurchaseConfirmationEmail(baseParams);
      expect(html).toContain('ABC12345'); // First 8 chars uppercase
    });

    it('should include download portal link (AC2)', () => {
      const { html } = generatePurchaseConfirmationEmail(baseParams);
      expect(html).toContain('https://lastparadigm.com/dashboard/toolkit');
      expect(html).toContain('Access Your Toolkit');
    });

    it('should list all 10 toolkit documents (AC2)', () => {
      const { html } = generatePurchaseConfirmationEmail(baseParams);
      expect(html).toContain('Strategic Alignment Brief');
      expect(html).toContain('Stakeholder Communication Pack');
      expect(html).toContain('Decision Framework Guide');
      expect(html).toContain('Data Flow Optimization Plan');
      expect(html).toContain('Communication Improvement Playbook');
      expect(html).toContain('Meeting Cost Tracker');
      expect(html).toContain('Alignment Tax Calculator');
      expect(html).toContain('Transformation Roadmap Planner');
      expect(html).toContain('Executive Presentation Deck');
      expect(html).toContain('Board Summary Report');
    });

    it('should include document types (AC2)', () => {
      const { html } = generatePurchaseConfirmationEmail(baseParams);
      expect(html).toContain('(Word)');
      expect(html).toContain('(Excel)');
      expect(html).toContain('(PowerPoint)');
      expect(html).toContain('(PDF)');
    });

    it('should include Getting Started guidance (AC2)', () => {
      const { html } = generatePurchaseConfirmationEmail(baseParams);
      expect(html).toContain('Getting Started');
      expect(html).toContain('Strategic Alignment Brief');
    });

    it('should include 30-day guarantee reminder (AC2)', () => {
      const { html } = generatePurchaseConfirmationEmail(baseParams);
      expect(html).toContain('30-Day Money-Back Guarantee');
      expect(html).toContain('full refund');
    });

    it('should include book attribution (AC3, FR65)', () => {
      const { html, text } = generatePurchaseConfirmationEmail(baseParams);
      expect(html).toContain('The Last Paradigm');
      expect(text).toContain('The Last Paradigm');
    });

    it('should use Executive Clarity theme colors (AC4)', () => {
      const { html } = generatePurchaseConfirmationEmail(baseParams);
      expect(html).toContain('#D4AF37'); // Brand gold
      expect(html).toContain('#0A0A0A'); // Charcoal background
    });

    it('should be mobile-responsive (AC4)', () => {
      const { html } = generatePurchaseConfirmationEmail(baseParams);
      expect(html).toContain('viewport');
      expect(html).toContain('width=device-width');
    });

    it('should not include unsubscribe link (transactional email)', () => {
      const { html } = generatePurchaseConfirmationEmail(baseParams);
      expect(html).not.toContain('Unsubscribe from marketing emails');
    });

    it('should personalize greeting with user name', () => {
      const { html, text } = generatePurchaseConfirmationEmail(baseParams);
      expect(html).toContain('Hi John');
      expect(text).toContain('Hi John');
    });

    it('should handle missing user name gracefully', () => {
      const { html } = generatePurchaseConfirmationEmail({
        ...baseParams,
        userName: null,
      });
      // Should use email-derived name or fallback
      expect(html).toContain('Hi');
    });

    it('should include support email', () => {
      const { html, text } = generatePurchaseConfirmationEmail(baseParams);
      expect(html).toContain('support@lastparadigm.com');
      expect(text).toContain('support@lastparadigm.com');
    });

    it('should generate valid HTML document', () => {
      const { html } = generatePurchaseConfirmationEmail(baseParams);
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html');
      expect(html).toContain('</html>');
    });

    it('should include preview text', () => {
      const { html } = generatePurchaseConfirmationEmail(baseParams);
      expect(html).toContain('Your Playbook 2 Toolkit is ready');
    });
  });

  describe('generatePurchaseConfirmationEmail - text version', () => {
    const baseParams = {
      userName: 'Jane Smith',
      userEmail: 'jane@example.com',
      amount: 2500,
      purchaseId: 'xyz98765-4321-abcd',
      downloadPortalUrl: 'https://lastparadigm.com/dashboard/toolkit',
    };

    it('should include all key information in text version', () => {
      const { text } = generatePurchaseConfirmationEmail(baseParams);
      expect(text).toContain('Hi Jane');
      expect(text).toContain('$2,500');
      expect(text).toContain('XYZ98765');
      expect(text).toContain('https://lastparadigm.com/dashboard/toolkit');
    });

    it('should list all documents in text version', () => {
      const { text } = generatePurchaseConfirmationEmail(baseParams);
      expect(text).toContain('Strategic Alignment Brief');
      expect(text).toContain('Board Summary Report');
    });

    it('should include 30-day guarantee in text version', () => {
      const { text } = generatePurchaseConfirmationEmail(baseParams);
      expect(text).toContain('30-DAY MONEY-BACK GUARANTEE');
    });
  });
});
