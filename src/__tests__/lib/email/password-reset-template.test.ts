/**
 * Password Reset Email Template Tests
 *
 * Tests for the password reset email template generation.
 *
 * Story 15.5: Password Reset Flow
 * Covers: Task 2 - Password reset email template
 */

import { describe, it, expect } from 'vitest';
import { generatePasswordResetEmail } from '@/lib/email/templates/password-reset';

describe('Password Reset Email Template', () => {
  const defaultParams = {
    resetUrl: 'https://example.com/auth/reset-password?token=test-token-123',
    host: 'example.com',
    expiresInMinutes: 60,
  };

  describe('generatePasswordResetEmail', () => {
    it('should return subject, text, and html', () => {
      const result = generatePasswordResetEmail(defaultParams);

      expect(result).toHaveProperty('subject');
      expect(result).toHaveProperty('text');
      expect(result).toHaveProperty('html');
    });

    it('should include correct subject line', () => {
      const result = generatePasswordResetEmail(defaultParams);

      expect(result.subject).toBe('Reset Your Password - The Last Paradigm');
    });

    describe('Text Content', () => {
      it('should include reset URL in text', () => {
        const result = generatePasswordResetEmail(defaultParams);

        expect(result.text).toContain(defaultParams.resetUrl);
      });

      it('should include host in text', () => {
        const result = generatePasswordResetEmail(defaultParams);

        expect(result.text).toContain(defaultParams.host);
      });

      it('should include expiry notice in text', () => {
        const result = generatePasswordResetEmail(defaultParams);

        expect(result.text).toContain('60 minutes');
      });

      it('should include security notice in text', () => {
        const result = generatePasswordResetEmail(defaultParams);

        expect(result.text).toContain("didn't request this");
        expect(result.text).toContain('safely ignore');
      });

      it('should include book attribution in text (FR65)', () => {
        const result = generatePasswordResetEmail(defaultParams);

        expect(result.text).toContain('The Last Paradigm');
        expect(result.text).toContain('Quantifying Your Alignment Tax');
      });
    });

    describe('HTML Content', () => {
      it('should include reset URL as clickable link', () => {
        const result = generatePasswordResetEmail(defaultParams);

        expect(result.html).toContain(`href="${defaultParams.resetUrl}"`);
      });

      it('should include branded header with The Last Paradigm', () => {
        const result = generatePasswordResetEmail(defaultParams);

        expect(result.html).toContain('The Last Paradigm');
      });

      it('should include Reset Password button', () => {
        const result = generatePasswordResetEmail(defaultParams);

        expect(result.html).toContain('Reset Password');
      });

      it('should include 1-hour expiry notice', () => {
        const result = generatePasswordResetEmail(defaultParams);

        expect(result.html).toContain('60 minutes');
      });

      it('should include security notice about unexpected requests', () => {
        const result = generatePasswordResetEmail(defaultParams);

        expect(result.html).toContain("didn't request");
        expect(result.html).toContain('safely ignore');
      });

      it('should include book attribution in footer (FR65)', () => {
        const result = generatePasswordResetEmail(defaultParams);

        expect(result.html).toContain('Based on the methodology from');
        expect(result.html).toContain('Quantifying Your Alignment Tax');
      });

      it('should use Executive Clarity theme colors', () => {
        const result = generatePasswordResetEmail(defaultParams);

        // Brand gold
        expect(result.html).toContain('#D4AF37');
        // Background/card colors
        expect(result.html).toContain('#0A0A0A');
        expect(result.html).toContain('#1A1A1A');
      });

      it('should have valid HTML structure', () => {
        const result = generatePasswordResetEmail(defaultParams);

        expect(result.html).toContain('<!DOCTYPE html>');
        expect(result.html).toContain('<html');
        expect(result.html).toContain('</html>');
        expect(result.html).toContain('<body');
        expect(result.html).toContain('</body>');
      });

      it('should include email client meta tags', () => {
        const result = generatePasswordResetEmail(defaultParams);

        expect(result.html).toContain('charset="UTF-8"');
        expect(result.html).toContain('viewport');
      });
    });

    describe('Custom Parameters', () => {
      it('should use custom expiry time', () => {
        const result = generatePasswordResetEmail({
          ...defaultParams,
          expiresInMinutes: 30,
        });

        expect(result.text).toContain('30 minutes');
        expect(result.html).toContain('30 minutes');
      });

      it('should use default 60 minutes when not specified', () => {
        const result = generatePasswordResetEmail({
          resetUrl: defaultParams.resetUrl,
          host: defaultParams.host,
        });

        expect(result.text).toContain('60 minutes');
        expect(result.html).toContain('60 minutes');
      });

      it('should handle different hosts', () => {
        const customHost = 'thelastparadigm.com';
        const result = generatePasswordResetEmail({
          ...defaultParams,
          host: customHost,
        });

        expect(result.text).toContain(customHost);
        // HTML escapes dots, so check for partial match
        expect(result.html).toContain('thelastparadigm');
      });
    });

    describe('Security', () => {
      it('should escape dots in host for HTML', () => {
        // Dots escaped with zero-width space to prevent email client issues
        const result = generatePasswordResetEmail(defaultParams);

        // The HTML version should have escaped dots
        expect(result.html).toContain('&#8203;');
      });

      it('should include single-use notice', () => {
        const result = generatePasswordResetEmail(defaultParams);

        expect(result.text).toContain('only be used once');
        expect(result.html).toContain('only be used once');
      });
    });
  });
});
