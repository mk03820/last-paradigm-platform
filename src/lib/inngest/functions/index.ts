/**
 * Inngest Functions Index
 *
 * Export all Inngest functions for registration with the serve handler.
 *
 * Covers: Story 15.10 Task 2
 */

import { magicLinkCleanup } from './magic-link-cleanup';
import { passwordResetCleanup } from './password-reset-cleanup';
import { registrationAbandonmentCheck } from './registration-abandonment';

// Export all functions as an array for the serve handler
export const functions = [
  magicLinkCleanup,
  passwordResetCleanup,
  registrationAbandonmentCheck,
];

// Re-export individual functions for direct imports
export { magicLinkCleanup, passwordResetCleanup, registrationAbandonmentCheck };
