/**
 * Inngest Functions Index
 *
 * Export all Inngest functions for registration with the serve handler.
 *
 * Covers: Story 15.10 Task 2, Story 18.1 Task 7, Story 20.4
 */

import { magicLinkCleanup } from './magic-link-cleanup';
import { passwordResetCleanup } from './password-reset-cleanup';
import { registrationAbandonmentCheck } from './registration-abandonment';
// Story 18.1: Toolkit generation functions
import { generateToolkit } from './generate-toolkit';
import { generateDocument } from './generate-document';
import { checkToolkitCompletion } from './check-toolkit-completion';
// Story 20.4: Nurture sequence functions
import { checkNurtureTrigger, startNurtureSequence } from './nurture-sequence';

// Export all functions as an array for the serve handler
export const functions = [
  // Authentication & cleanup
  magicLinkCleanup,
  passwordResetCleanup,
  registrationAbandonmentCheck,
  // Toolkit generation (Story 18.1)
  generateToolkit,
  generateDocument,
  checkToolkitCompletion,
  // Nurture sequence (Story 20.4)
  checkNurtureTrigger,
  startNurtureSequence,
];

// Re-export individual functions for direct imports
export { magicLinkCleanup, passwordResetCleanup, registrationAbandonmentCheck };
// Story 18.1: Toolkit generation exports
export { generateToolkit, generateDocument, checkToolkitCompletion };
// Re-export toolkit document definitions for use in other modules
export { TOOLKIT_DOCUMENTS } from './generate-toolkit';
// Story 20.4: Nurture sequence exports
export { checkNurtureTrigger, startNurtureSequence } from './nurture-sequence';
