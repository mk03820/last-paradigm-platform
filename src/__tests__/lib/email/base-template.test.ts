/**
 * Base Email Template Tests
 *
 * Tests for the base email template generation.
 *
 * Story 20.1: Email Template System
 * Task 5.1: Unit tests for base template rendering
 */

import { describe, it, expect } from 'vitest';
import {
  generateBaseTemplate,
  generateBaseTextTemplate,
} from '@/lib/email/templates/base-template';

describe('Base Email Template', () => {
  describe('generateBaseTemplate', () => {
    const baseParams = {
      content: '<p>Test content</p>',
      baseUrl: 'https://test.lastparadigm.com',
    };

    it('should generate valid HTML document', () => {
      const html = generateBaseTemplate(baseParams);
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html lang="en">');
      expect(html).toContain('</html>');
    });

    it('should include The Last Paradigm branding (AC1)', () => {
      const html = generateBaseTemplate(baseParams);
      expect(html).toContain('The Last Paradigm');
    });

    it('should include brand gold color (#D4AF37)', () => {
      const html = generateBaseTemplate(baseParams);
      expect(html).toContain('#D4AF37');
    });

    it('should include charcoal background color (#0A0A0A)', () => {
      const html = generateBaseTemplate(baseParams);
      expect(html).toContain('#0A0A0A');
    });

    it('should include content in email body', () => {
      const html = generateBaseTemplate({
        ...baseParams,
        content: '<p>My custom content here</p>',
      });
      expect(html).toContain('My custom content here');
    });

    it('should include book attribution in footer (FR65)', () => {
      const html = generateBaseTemplate(baseParams);
      expect(html).toContain('Based on the methodology from');
      expect(html).toContain('The Last Paradigm');
      expect(html).toContain('Quantifying Your Alignment Tax');
    });

    it('should include unsubscribe link by default (NFR30)', () => {
      const html = generateBaseTemplate(baseParams);
      expect(html).toContain('Unsubscribe from marketing emails');
      expect(html).toContain('/unsubscribe');
    });

    it('should include unsubscribe URL with token when provided', () => {
      const html = generateBaseTemplate({
        ...baseParams,
        userEmail: 'test@example.com',
        unsubscribeToken: 'token123',
      });
      expect(html).toContain('token=token123');
      expect(html).toContain('email=test%40example.com');
    });

    it('should hide unsubscribe link when showUnsubscribe is false', () => {
      const html = generateBaseTemplate({
        ...baseParams,
        showUnsubscribe: false,
      });
      expect(html).not.toContain('Unsubscribe from marketing emails');
    });

    it('should include preview text when provided', () => {
      const html = generateBaseTemplate({
        ...baseParams,
        previewText: 'This is preview text',
      });
      expect(html).toContain('This is preview text');
      expect(html).toContain('display: none');
    });

    it('should include responsive meta tags', () => {
      const html = generateBaseTemplate(baseParams);
      expect(html).toContain('viewport');
      expect(html).toContain('width=device-width');
    });

    it('should include mobile-specific CSS media query', () => {
      const html = generateBaseTemplate(baseParams);
      expect(html).toContain('@media screen and (max-width: 600px)');
      expect(html).toContain('mobile-padding');
    });

    it('should use table-based layout for email client compatibility (AC3)', () => {
      const html = generateBaseTemplate(baseParams);
      expect(html).toContain('role="presentation"');
      expect(html).toContain('<table');
      expect(html).toContain('</table>');
    });

    it('should include MSO conditional comments for Outlook', () => {
      const html = generateBaseTemplate(baseParams);
      expect(html).toContain('<!--[if mso]>');
      expect(html).toContain('OfficeDocumentSettings');
    });

    it('should escape host in footer', () => {
      const html = generateBaseTemplate({
        ...baseParams,
        baseUrl: 'https://my.site.com',
      });
      expect(html).toContain('my.site.com');
    });
  });

  describe('generateBaseTextTemplate', () => {
    it('should include content', () => {
      const text = generateBaseTextTemplate('Test content');
      expect(text).toContain('Test content');
    });

    it('should include book attribution', () => {
      const text = generateBaseTextTemplate('Content');
      expect(text).toContain('The Last Paradigm');
      expect(text).toContain('Quantifying Your Alignment Tax');
    });

    it('should include unsubscribe URL when provided', () => {
      const text = generateBaseTextTemplate(
        'Content',
        true,
        'https://example.com/unsubscribe'
      );
      expect(text).toContain('Unsubscribe: https://example.com/unsubscribe');
    });

    it('should not include unsubscribe when showUnsubscribe is false', () => {
      const text = generateBaseTextTemplate('Content', false);
      expect(text).not.toContain('Unsubscribe');
    });
  });
});
