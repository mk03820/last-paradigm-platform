/**
 * Tests for Save Results Email Template
 *
 * Story 15.8: Pre-Account Results Preservation
 * Covers: AC4 (email template rendering)
 */

import { describe, it, expect } from 'vitest';
import { generateSaveResultsEmail } from './save-results';

describe('generateSaveResultsEmail', () => {
  const defaultParams = {
    recoveryUrl: 'https://example.com/recover-session?token=abc123',
    host: 'example.com',
    expiresInDays: 7,
  };

  it('should generate email with correct subject', () => {
    const email = generateSaveResultsEmail(defaultParams);

    expect(email.subject).toBe('Your Diagnostic Results - The Last Paradigm');
  });

  it('should include recovery URL in text version', () => {
    const email = generateSaveResultsEmail(defaultParams);

    expect(email.text).toContain(defaultParams.recoveryUrl);
    expect(email.text).toContain('Click the link below to recover your results');
  });

  it('should include recovery URL in HTML version', () => {
    const email = generateSaveResultsEmail(defaultParams);

    expect(email.html).toContain(defaultParams.recoveryUrl);
    expect(email.html).toContain('Recover My Results');
  });

  it('should include host in both versions', () => {
    const email = generateSaveResultsEmail(defaultParams);

    // Text version uses original host
    expect(email.text).toContain('example.com');
    // HTML version escapes dots for security
    expect(email.html).toContain('example');
  });

  it('should include expiration notice', () => {
    const email = generateSaveResultsEmail(defaultParams);

    expect(email.text).toContain('7 days');
    expect(email.html).toContain('7 days');
  });

  it('should use custom expiration days', () => {
    const email = generateSaveResultsEmail({
      ...defaultParams,
      expiresInDays: 14,
    });

    expect(email.text).toContain('14 days');
    expect(email.html).toContain('14 days');
  });

  it('should include book methodology attribution (FR65)', () => {
    const email = generateSaveResultsEmail(defaultParams);

    expect(email.text).toContain('The Last Paradigm');
    expect(email.html).toContain('The Last Paradigm');
  });

  it('should include account creation CTA', () => {
    const email = generateSaveResultsEmail(defaultParams);

    expect(email.text).toContain('Create an account');
    expect(email.html).toContain('Create an account');
  });

  it('should use Executive Clarity theme colors in HTML', () => {
    const email = generateSaveResultsEmail(defaultParams);

    // Gold accent color
    expect(email.html).toContain('#D4AF37');
    // Navy background
    expect(email.html).toContain('#1e293b');
  });

  it('should have valid HTML structure', () => {
    const email = generateSaveResultsEmail(defaultParams);

    expect(email.html).toContain('<!DOCTYPE html>');
    expect(email.html).toContain('<html');
    expect(email.html).toContain('</html>');
    expect(email.html).toContain('<body');
    expect(email.html).toContain('</body>');
  });

  it('should include meta viewport for mobile responsiveness (NFR24)', () => {
    const email = generateSaveResultsEmail(defaultParams);

    expect(email.html).toContain('viewport');
    expect(email.html).toContain('width=device-width');
  });
});
