/**
 * Privacy Module Export
 *
 * Central export for privacy-related functionality.
 *
 * Story 17.8: Purchase Analytics Events
 */

export {
  getConsentStatus,
  getConsentStatusSync,
  setConsentStatus,
  acceptAllConsent,
  rejectAllConsent,
  hasAnalyticsConsent,
  hasMarketingConsent,
  clearConsent,
} from './consent';

export type { ConsentStatus } from './consent';
