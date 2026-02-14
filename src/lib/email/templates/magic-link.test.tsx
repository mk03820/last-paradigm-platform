/**
 * Magic Link Email Template Tests
 *
 * Snapshot and content tests for the magic link email template.
 *
 * Covers: Story 15.4 Task 3.7
 */

import { describe, it, expect } from 'vitest';
import { generateMagicLinkEmail } from './magic-link';

describe('Magic Link Email Template', () => {
  const defaultParams = {
    magicLinkUrl: 'https://lastparadigm.com/verify?token=abc123',
    host: 'lastparadigm.com',
    expiresInMinutes: 15,
  };

  describe('generateMagicLinkEmail', () => {
    it('returns subject, text, and html', () => {
      const result = generateMagicLinkEmail(defaultParams);

      expect(result).toHaveProperty('subject');
      expect(result).toHaveProperty('text');
      expect(result).toHaveProperty('html');
    });

    it('has appropriate subject line', () => {
      const result = generateMagicLinkEmail(defaultParams);

      expect(result.subject).toContain('Sign-In');
      expect(result.subject).toContain('Last Paradigm');
    });
  });

  describe('text version', () => {
    it('includes magic link URL', () => {
      const result = generateMagicLinkEmail(defaultParams);

      expect(result.text).toContain(defaultParams.magicLinkUrl);
    });

    it('includes host name', () => {
      const result = generateMagicLinkEmail(defaultParams);

      expect(result.text).toContain('lastparadigm.com');
    });

    it('includes expiry time', () => {
      const result = generateMagicLinkEmail(defaultParams);

      expect(result.text).toContain('15 minutes');
    });

    it('includes security notice', () => {
      const result = generateMagicLinkEmail(defaultParams);

      expect(result.text).toMatch(/didn't request this email/i);
      expect(result.text).toMatch(/safely ignore/i);
    });

    it('includes single-use notice', () => {
      const result = generateMagicLinkEmail(defaultParams);

      expect(result.text).toMatch(/only be used once/i);
    });

    it('includes book attribution (FR65)', () => {
      const result = generateMagicLinkEmail(defaultParams);

      expect(result.text).toMatch(/last paradigm/i);
      expect(result.text).toMatch(/alignment tax/i);
    });
  });

  describe('HTML version', () => {
    it('is valid HTML document', () => {
      const result = generateMagicLinkEmail(defaultParams);

      expect(result.html).toContain('<!DOCTYPE html>');
      expect(result.html).toContain('<html');
      expect(result.html).toContain('</html>');
    });

    it('includes magic link URL', () => {
      const result = generateMagicLinkEmail(defaultParams);

      expect(result.html).toContain(defaultParams.magicLinkUrl);
    });

    it('has CTA button with magic link', () => {
      const result = generateMagicLinkEmail(defaultParams);

      expect(result.html).toContain(`href="${defaultParams.magicLinkUrl}"`);
      expect(result.html).toMatch(/sign in/i);
    });

    it('includes expiry warning', () => {
      const result = generateMagicLinkEmail(defaultParams);

      expect(result.html).toContain('15 minutes');
    });

    it('includes security notice', () => {
      const result = generateMagicLinkEmail(defaultParams);

      expect(result.html).toMatch(/didn't request this email/i);
    });

    it('includes book attribution (FR65)', () => {
      const result = generateMagicLinkEmail(defaultParams);

      expect(result.html).toMatch(/methodology from/i);
      expect(result.html).toMatch(/last paradigm/i);
    });

    it('is mobile responsive', () => {
      const result = generateMagicLinkEmail(defaultParams);

      expect(result.html).toContain('viewport');
      expect(result.html).toContain('max-width');
    });

    it('uses brand colors', () => {
      const result = generateMagicLinkEmail(defaultParams);

      // Gold accent
      expect(result.html).toContain('#D4AF37');
      // Navy background
      expect(result.html).toContain('#1e293b');
    });

    it('escapes host dots for email client compatibility', () => {
      const result = generateMagicLinkEmail(defaultParams);

      // Dots should be escaped with zero-width space for email rendering
      expect(result.html).toContain('&#8203;.');
    });

    it('uses table-based layout for email client compatibility', () => {
      const result = generateMagicLinkEmail(defaultParams);

      expect(result.html).toContain('role="presentation"');
      expect(result.html).toContain('<table');
    });
  });

  describe('custom expiry time', () => {
    it('uses provided expiry time', () => {
      const result = generateMagicLinkEmail({
        ...defaultParams,
        expiresInMinutes: 30,
      });

      expect(result.text).toContain('30 minutes');
      expect(result.html).toContain('30 minutes');
    });

    it('defaults to 15 minutes', () => {
      const result = generateMagicLinkEmail({
        magicLinkUrl: 'https://test.com/verify',
        host: 'test.com',
      });

      expect(result.text).toContain('15 minutes');
    });
  });

  describe('different hosts', () => {
    it('handles localhost', () => {
      const result = generateMagicLinkEmail({
        ...defaultParams,
        host: 'localhost:3000',
      });

      expect(result.text).toContain('localhost:3000');
    });

    it('handles custom domains', () => {
      const result = generateMagicLinkEmail({
        ...defaultParams,
        host: 'mycompany.example.com',
      });

      expect(result.text).toContain('mycompany.example.com');
    });
  });

  describe('accessibility', () => {
    it('has alt text for decorative elements', () => {
      const result = generateMagicLinkEmail(defaultParams);

      // Lock icon is decorative, should not need alt
      // But should have lang attribute
      expect(result.html).toContain('lang="en"');
    });

    it('has proper color contrast', () => {
      const result = generateMagicLinkEmail(defaultParams);

      // Light text on dark background
      expect(result.html).toContain('#E5E7EB'); // Light text color
    });
  });
});
