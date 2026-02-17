/**
 * Complete Registration Email Template Tests
 *
 * Tests for the registration abandonment recovery email template.
 *
 * Story 15.9: Registration Abandonment Recovery
 * Covers: Task 5.1-5.7, AC2 (Resume link), AC4 (Value proposition), FR65 (Book attribution)
 */

import { describe, it, expect } from 'vitest';
import { generateCompleteRegistrationEmail } from './complete-registration';

describe('generateCompleteRegistrationEmail', () => {
  const baseParams = {
    resumeUrl: 'https://example.com/auth/register/resume?token=test-token',
    userEmail: 'test@example.com',
  };

  describe('HTML Generation', () => {
    it('should include the resume URL in the email', () => {
      const { html } = generateCompleteRegistrationEmail(baseParams);

      expect(html).toContain(baseParams.resumeUrl);
    });

    it('should include "Complete Your Account" heading', () => {
      const { html } = generateCompleteRegistrationEmail(baseParams);

      expect(html).toContain('Complete Your Account');
    });

    it('should include value proposition about diagnostic results (AC4)', () => {
      const { html } = generateCompleteRegistrationEmail(baseParams);

      expect(html).toContain('diagnostic results are waiting');
    });

    it('should include benefits list', () => {
      const { html } = generateCompleteRegistrationEmail(baseParams);

      expect(html).toContain('Save your diagnostic results permanently');
      expect(html).toContain('personalized transformation roadmap');
      expect(html).toContain('Playbook 2 tools');
    });

    it('should include book attribution (FR65)', () => {
      const { html } = generateCompleteRegistrationEmail(baseParams);

      expect(html).toContain('The Last Paradigm');
    });

    it('should include CTA button with resume URL', () => {
      const { html } = generateCompleteRegistrationEmail(baseParams);

      expect(html).toContain('Complete Registration');
      expect(html).toContain(`href="${baseParams.resumeUrl}"`);
    });

    it('should include estimated savings when provided', () => {
      const { html } = generateCompleteRegistrationEmail({
        ...baseParams,
        estimatedSavings: 50000,
      });

      expect(html).toContain('$50,000');
      expect(html).toContain('Potential Annual Savings Identified');
    });

    it('should not include savings section when not provided', () => {
      const { html } = generateCompleteRegistrationEmail(baseParams);

      expect(html).not.toContain('Potential Annual Savings Identified');
    });

    it('should include unsubscribe link when token provided', () => {
      const { html } = generateCompleteRegistrationEmail({
        ...baseParams,
        unsubscribeToken: 'unsub-token',
      });

      expect(html).toContain('unsubscribe');
    });
  });

  describe('Plain Text Generation', () => {
    it('should include resume URL in plain text', () => {
      const { text } = generateCompleteRegistrationEmail(baseParams);

      expect(text).toContain(baseParams.resumeUrl);
    });

    it('should include value proposition in plain text', () => {
      const { text } = generateCompleteRegistrationEmail(baseParams);

      expect(text).toContain('diagnostic results are waiting');
    });

    it('should include benefits in plain text', () => {
      const { text } = generateCompleteRegistrationEmail(baseParams);

      expect(text).toContain('Save your diagnostic results permanently');
    });

    it('should include book attribution in plain text', () => {
      const { text } = generateCompleteRegistrationEmail(baseParams);

      expect(text).toContain('The Last Paradigm');
    });

    it('should include estimated savings in plain text when provided', () => {
      const { text } = generateCompleteRegistrationEmail({
        ...baseParams,
        estimatedSavings: 75000,
      });

      expect(text).toContain('$75,000');
    });
  });

  describe('Preview Text', () => {
    it('should have appropriate preview text', () => {
      const { html } = generateCompleteRegistrationEmail(baseParams);

      // The preview text should be about completing account and saving results
      expect(html).toContain('Your diagnostic results are waiting');
    });
  });
});
