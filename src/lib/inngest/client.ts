/**
 * Inngest Client Configuration
 *
 * Centralized Inngest client for background job processing.
 * Used for scheduled tasks, email sequences, and async operations.
 *
 * Covers: Story 15.10 Task 1, FR72 (Scheduled task infrastructure)
 */

import { Inngest } from 'inngest';

// Create the Inngest client
export const inngest = new Inngest({
  id: 'last-paradigm-platform',
  name: 'The Last Paradigm Platform',
});

// Event types for type safety
export type InngestEvents = {
  // Magic link cleanup
  'magic-link/cleanup': {
    data: Record<string, never>;
  };
  // Registration abandonment
  'registration/abandoned': {
    data: {
      email: string;
      abandonedAt: string;
    };
  };
  // Session preservation reminder
  'session/preservation-reminder': {
    data: {
      email: string;
      sessionId: string;
    };
  };
  // Email sequence
  'email/send-sequence': {
    data: {
      userId: string;
      sequenceType: string;
      step: number;
    };
  };
  // Document generation
  'document/generate': {
    data: {
      userId: string;
      documentType: string;
      documentId: string;
    };
  };
};
