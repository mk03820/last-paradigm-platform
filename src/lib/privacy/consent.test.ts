/**
 * Privacy Consent Tests
 *
 * Unit tests for privacy consent handling.
 *
 * Story 17.8: Purchase Analytics Events
 * Task 8.3: Test privacy consent handling
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getConsentStatus,
  getConsentStatusSync,
  setConsentStatus,
  acceptAllConsent,
  rejectAllConsent,
  hasAnalyticsConsent,
  hasMarketingConsent,
  clearConsent,
} from './consent';

describe('getConsentStatus', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return default consent when no preference is saved', async () => {
    const consent = await getConsentStatus();

    expect(consent.analytics).toBe(false);
    expect(consent.marketing).toBe(false);
    expect(consent.functional).toBe(true);
  });

  it('should return saved consent preferences', async () => {
    localStorage.setItem(
      'privacy_consent',
      JSON.stringify({
        analytics: true,
        marketing: true,
        functional: true,
        updatedAt: '2024-01-15T10:00:00.000Z',
      })
    );

    const consent = await getConsentStatus();

    expect(consent.analytics).toBe(true);
    expect(consent.marketing).toBe(true);
    expect(consent.functional).toBe(true);
    expect(consent.updatedAt).toBe('2024-01-15T10:00:00.000Z');
  });

  it('should handle invalid JSON gracefully', async () => {
    localStorage.setItem('privacy_consent', 'invalid json');

    const consent = await getConsentStatus();

    expect(consent.analytics).toBe(false);
    expect(consent.marketing).toBe(false);
    expect(consent.functional).toBe(true);
    // Should have cleared invalid data
    expect(localStorage.getItem('privacy_consent')).toBeNull();
  });

  it('should handle partial consent data', async () => {
    localStorage.setItem('privacy_consent', JSON.stringify({ analytics: true }));

    const consent = await getConsentStatus();

    expect(consent.analytics).toBe(true);
    expect(consent.marketing).toBe(false);
    expect(consent.functional).toBe(true);
  });
});

describe('getConsentStatusSync', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return default consent synchronously', () => {
    const consent = getConsentStatusSync();

    expect(consent.analytics).toBe(false);
    expect(consent.marketing).toBe(false);
    expect(consent.functional).toBe(true);
  });

  it('should return saved preferences synchronously', () => {
    localStorage.setItem(
      'privacy_consent',
      JSON.stringify({ analytics: true, marketing: false, functional: true })
    );

    const consent = getConsentStatusSync();

    expect(consent.analytics).toBe(true);
  });
});

describe('setConsentStatus', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should save consent preferences', () => {
    setConsentStatus({
      analytics: true,
      marketing: true,
    });

    const saved = JSON.parse(localStorage.getItem('privacy_consent')!);

    expect(saved.analytics).toBe(true);
    expect(saved.marketing).toBe(true);
    expect(saved.functional).toBe(true);
    expect(saved.updatedAt).toBeDefined();
  });

  it('should default missing values', () => {
    setConsentStatus({});

    const saved = JSON.parse(localStorage.getItem('privacy_consent')!);

    expect(saved.analytics).toBe(false);
    expect(saved.marketing).toBe(false);
    expect(saved.functional).toBe(true);
  });

  it('should set updatedAt timestamp', () => {
    const before = new Date().toISOString();
    setConsentStatus({ analytics: true });
    const after = new Date().toISOString();

    const saved = JSON.parse(localStorage.getItem('privacy_consent')!);

    expect(saved.updatedAt >= before).toBe(true);
    expect(saved.updatedAt <= after).toBe(true);
  });
});

describe('acceptAllConsent', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should enable all consent categories', () => {
    acceptAllConsent();

    const consent = getConsentStatusSync();

    expect(consent.analytics).toBe(true);
    expect(consent.marketing).toBe(true);
    expect(consent.functional).toBe(true);
  });
});

describe('rejectAllConsent', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should disable optional consent, keep functional', () => {
    // First accept all
    acceptAllConsent();

    // Then reject
    rejectAllConsent();

    const consent = getConsentStatusSync();

    expect(consent.analytics).toBe(false);
    expect(consent.marketing).toBe(false);
    expect(consent.functional).toBe(true);
  });
});

describe('hasAnalyticsConsent', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return false when no consent', () => {
    expect(hasAnalyticsConsent()).toBe(false);
  });

  it('should return true when analytics consent given', () => {
    setConsentStatus({ analytics: true });
    expect(hasAnalyticsConsent()).toBe(true);
  });
});

describe('hasMarketingConsent', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return false when no consent', () => {
    expect(hasMarketingConsent()).toBe(false);
  });

  it('should return true when marketing consent given', () => {
    setConsentStatus({ marketing: true });
    expect(hasMarketingConsent()).toBe(true);
  });
});

describe('clearConsent', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should remove consent from storage', () => {
    setConsentStatus({ analytics: true });
    expect(localStorage.getItem('privacy_consent')).not.toBeNull();

    clearConsent();

    expect(localStorage.getItem('privacy_consent')).toBeNull();
  });
});
