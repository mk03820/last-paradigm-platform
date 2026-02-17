/**
 * Privacy Consent Utilities
 *
 * Handles user privacy consent for analytics tracking.
 * Implements privacy-first approach: default to minimal tracking.
 *
 * Story 17.8: Purchase Analytics Events
 * Task 1.4: Add privacy consent check before tracking
 * Covers: AC7 (Respect user privacy preferences)
 */

/**
 * Consent status for different tracking categories
 */
export interface ConsentStatus {
  /** Consent for analytics/performance tracking */
  analytics: boolean;
  /** Consent for marketing/advertising tracking */
  marketing: boolean;
  /** Consent for functional cookies (session, preferences) */
  functional: boolean;
  /** When consent was last updated */
  updatedAt?: string;
}

/**
 * Default consent status - minimal tracking only
 */
const DEFAULT_CONSENT: ConsentStatus = {
  analytics: false,
  marketing: false,
  functional: true,
};

/**
 * LocalStorage key for consent preferences
 */
const CONSENT_STORAGE_KEY = 'privacy_consent';

/**
 * Get the current consent status
 *
 * Server-side: Returns minimal consent (no tracking)
 * Client-side: Reads from localStorage
 *
 * @returns Current consent status
 */
export async function getConsentStatus(): Promise<ConsentStatus> {
  // Server-side: no tracking consent
  if (typeof window === 'undefined') {
    return { ...DEFAULT_CONSENT };
  }

  // Check localStorage for saved consent
  const savedConsent = localStorage.getItem(CONSENT_STORAGE_KEY);

  if (!savedConsent) {
    // No explicit consent given - default to minimal tracking
    return { ...DEFAULT_CONSENT };
  }

  try {
    const parsed = JSON.parse(savedConsent) as Partial<ConsentStatus>;
    return {
      analytics: parsed.analytics ?? false,
      marketing: parsed.marketing ?? false,
      functional: parsed.functional ?? true,
      updatedAt: parsed.updatedAt,
    };
  } catch {
    // Invalid stored consent - reset to defaults
    localStorage.removeItem(CONSENT_STORAGE_KEY);
    return { ...DEFAULT_CONSENT };
  }
}

/**
 * Synchronous version of getConsentStatus for use in non-async contexts
 * Note: Returns default consent on server-side
 */
export function getConsentStatusSync(): ConsentStatus {
  // Server-side: no tracking consent
  if (typeof window === 'undefined') {
    return { ...DEFAULT_CONSENT };
  }

  const savedConsent = localStorage.getItem(CONSENT_STORAGE_KEY);

  if (!savedConsent) {
    return { ...DEFAULT_CONSENT };
  }

  try {
    const parsed = JSON.parse(savedConsent) as Partial<ConsentStatus>;
    return {
      analytics: parsed.analytics ?? false,
      marketing: parsed.marketing ?? false,
      functional: parsed.functional ?? true,
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return { ...DEFAULT_CONSENT };
  }
}

/**
 * Set consent status
 *
 * @param status Consent preferences to save
 */
export function setConsentStatus(status: Partial<ConsentStatus>): void {
  if (typeof window === 'undefined') {
    return;
  }

  const fullStatus: ConsentStatus = {
    analytics: status.analytics ?? false,
    marketing: status.marketing ?? false,
    functional: status.functional ?? true,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(fullStatus));
}

/**
 * Accept all tracking categories
 */
export function acceptAllConsent(): void {
  setConsentStatus({
    analytics: true,
    marketing: true,
    functional: true,
  });
}

/**
 * Reject all optional tracking (functional only)
 */
export function rejectAllConsent(): void {
  setConsentStatus({
    analytics: false,
    marketing: false,
    functional: true,
  });
}

/**
 * Check if analytics tracking is allowed
 *
 * @returns true if analytics consent has been given
 */
export function hasAnalyticsConsent(): boolean {
  const consent = getConsentStatusSync();
  return consent.analytics;
}

/**
 * Check if marketing tracking is allowed
 *
 * @returns true if marketing consent has been given
 */
export function hasMarketingConsent(): boolean {
  const consent = getConsentStatusSync();
  return consent.marketing;
}

/**
 * Clear all consent preferences
 * Useful for testing or when user requests data deletion
 */
export function clearConsent(): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(CONSENT_STORAGE_KEY);
}
