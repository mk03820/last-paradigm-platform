import { describe, it, expect } from 'vitest';
import { generateMagicLinkEmail } from '@/lib/auth/magic-link-email';

describe('generateMagicLinkEmail', () => {
  const mockUrl = 'https://lastparadigm.com/api/auth/callback/resend?callbackUrl=...&token=abc123';
  const mockHost = 'lastparadigm.com';

  describe('email content', () => {
    it('should generate email with correct subject', () => {
      const result = generateMagicLinkEmail({ url: mockUrl, host: mockHost });
      expect(result.subject).toBe('Sign in to The Last Paradigm');
    });

    it('should include magic link URL in text version', () => {
      const result = generateMagicLinkEmail({ url: mockUrl, host: mockHost });
      expect(result.text).toContain(mockUrl);
    });

    it('should include magic link URL in HTML version', () => {
      const result = generateMagicLinkEmail({ url: mockUrl, host: mockHost });
      expect(result.html).toContain(mockUrl);
    });

    it('should include host in text version', () => {
      const result = generateMagicLinkEmail({ url: mockUrl, host: mockHost });
      expect(result.text).toContain(mockHost);
    });

    it('should mention 15-minute expiry in text version', () => {
      const result = generateMagicLinkEmail({ url: mockUrl, host: mockHost });
      expect(result.text).toContain('15 minutes');
    });

    it('should mention 15-minute expiry in HTML version', () => {
      const result = generateMagicLinkEmail({ url: mockUrl, host: mockHost });
      expect(result.html).toContain('15 minutes');
    });

    it('should mention single-use in text version', () => {
      const result = generateMagicLinkEmail({ url: mockUrl, host: mockHost });
      expect(result.text).toContain('only be used once');
    });

    it('should include brand name in text version', () => {
      const result = generateMagicLinkEmail({ url: mockUrl, host: mockHost });
      expect(result.text).toContain('The Last Paradigm');
    });

    it('should include brand name in HTML version', () => {
      const result = generateMagicLinkEmail({ url: mockUrl, host: mockHost });
      expect(result.html).toContain('The Last Paradigm');
    });
  });

  describe('HTML structure', () => {
    it('should include proper HTML doctype and structure', () => {
      const result = generateMagicLinkEmail({ url: mockUrl, host: mockHost });
      expect(result.html).toContain('<!DOCTYPE html>');
      expect(result.html).toContain('<html');
      expect(result.html).toContain('</html>');
    });

    it('should include clickable button with magic link', () => {
      const result = generateMagicLinkEmail({ url: mockUrl, host: mockHost });
      expect(result.html).toContain(`href="${mockUrl}"`);
      expect(result.html).toContain('Sign in to The Last Paradigm');
    });

    it('should use brand colors', () => {
      const result = generateMagicLinkEmail({ url: mockUrl, host: mockHost });
      // Gold accent color
      expect(result.html).toContain('#D4AF37');
      // Charcoal background
      expect(result.html).toContain('#0A0A0A');
    });

    it('should include safety notice', () => {
      const result = generateMagicLinkEmail({ url: mockUrl, host: mockHost });
      expect(result.html).toContain('did not request this email');
      expect(result.html).toContain('safely ignore');
    });
  });

  describe('edge cases', () => {
    it('should handle host with special characters', () => {
      const specialHost = 'sub.domain.com';
      const result = generateMagicLinkEmail({ url: mockUrl, host: specialHost });
      expect(result.text).toContain(specialHost);
    });

    it('should handle long URLs', () => {
      const longUrl = `https://lastparadigm.com/api/auth/callback/resend?token=${'a'.repeat(500)}`;
      const result = generateMagicLinkEmail({ url: longUrl, host: mockHost });
      expect(result.text).toContain(longUrl);
      expect(result.html).toContain(longUrl);
    });
  });
});
