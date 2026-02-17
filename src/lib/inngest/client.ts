/**
 * Inngest Client Configuration
 *
 * Centralized Inngest client for background job processing.
 * Used for scheduled tasks, email sequences, and async operations.
 *
 * Covers: Story 15.10 Task 1, FR72 (Scheduled task infrastructure)
 * Story 18.1: Added toolkit generation events (FR71, FR74)
 */

import { Inngest } from 'inngest';
import type { DiagnosticSessionData } from '@/lib/db/schema';

// Create the Inngest client
export const inngest = new Inngest({
  id: 'last-paradigm-platform',
  name: 'The Last Paradigm Platform',
});

// Document type for toolkit documents
export type ToolkitDocumentType = 'word' | 'excel' | 'pptx' | 'pdf';

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
      token: string;
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
  // Document generation (legacy - keeping for backwards compatibility)
  'document/generate': {
    data: {
      userId: string;
      documentType: string;
      documentId: string;
    };
  };
  // ==========================================================================
  // Toolkit Generation Events (Story 18.1 - FR71, FR74)
  // ==========================================================================

  /**
   * Triggered when a user completes purchase to initiate toolkit generation.
   * Orchestrator event that spawns individual document generation jobs.
   */
  'toolkit/generate': {
    data: {
      userId: string;
      purchaseId: string;
      diagnosticData: DiagnosticSessionData;
    };
  };

  /**
   * Individual document generation event.
   * One event per document, allowing parallel generation and independent retries.
   */
  'toolkit/document.generate': {
    data: {
      documentId: string;
      userId: string;
      purchaseId: string;
      documentType: ToolkitDocumentType;
      documentName: string;
      documentIndex: number; // 1-10
      diagnosticData: DiagnosticSessionData;
    };
  };

  /**
   * Emitted when all documents have been processed (completed or failed).
   * Triggers user notification (email/UI).
   */
  'toolkit/ready': {
    data: {
      userId: string;
      purchaseId: string;
      completedCount: number;
      failedCount: number;
      documentIds: string[];
    };
  };

  /**
   * Emitted when a single document completes or fails.
   * Used by completion checker to track overall progress.
   */
  'toolkit/document.completed': {
    data: {
      documentId: string;
      purchaseId: string;
      userId: string;
      status: 'completed' | 'failed';
      documentName: string;
    };
  };

  // ==========================================================================
  // Nurture Sequence Events (Story 20.4 - FR52, NFR30)
  // ==========================================================================

  /**
   * Triggered 24 hours after user creates account without purchasing.
   * Starts the 5-email nurture sequence.
   */
  'nurture/trigger': {
    data: {
      userId: string;
      triggerReason: 'account_created_no_purchase';
    };
  };

  /**
   * Check if nurture sequence should be started.
   * Called 24 hours after account creation.
   */
  'nurture/check-trigger': {
    data: {
      userId: string;
      accountCreatedAt: string;
    };
  };

  /**
   * Send individual nurture email.
   * Called for each email in the sequence (Day 0, 3, 7, 10, 14).
   */
  'nurture/send-email': {
    data: {
      userId: string;
      sequenceId: string;
      day: 0 | 3 | 7 | 10 | 14;
    };
  };

  /**
   * Check if user should exit nurture sequence.
   * Called before each email send to check purchase/unsubscribe status.
   */
  'nurture/check-exit': {
    data: {
      userId: string;
      sequenceId: string;
      reason: 'purchase' | 'unsubscribe';
    };
  };
};
