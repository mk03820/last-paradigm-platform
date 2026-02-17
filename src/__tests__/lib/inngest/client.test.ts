/**
 * Inngest Client Tests
 *
 * Tests for Inngest client configuration.
 *
 * Covers: Story 15.10 Task 1, Story 18.1 Task 2
 */

import { describe, it, expect } from 'vitest';
import { inngest } from '@/lib/inngest/client';
import type { InngestEvents, ToolkitDocumentType } from '@/lib/inngest/client';

describe('Inngest Client', () => {
  it('should have correct id', () => {
    expect(inngest.id).toBe('last-paradigm-platform');
  });

  it('should be defined', () => {
    expect(inngest).toBeDefined();
  });

  it('should have createFunction method', () => {
    expect(typeof inngest.createFunction).toBe('function');
  });

  it('should have send method', () => {
    expect(typeof inngest.send).toBe('function');
  });
});

// ==========================================================================
// Story 18.1: Toolkit Generation Event Types
// ==========================================================================

describe('Toolkit Generation Event Types (Story 18.1)', () => {
  it('should have ToolkitDocumentType with correct values', () => {
    const validTypes: ToolkitDocumentType[] = ['word', 'excel', 'pptx', 'pdf'];
    validTypes.forEach((type) => {
      expect(['word', 'excel', 'pptx', 'pdf']).toContain(type);
    });
  });

  it('should define toolkit/generate event type', () => {
    // Type assertion test - if types are wrong, TypeScript will error
    const event: InngestEvents['toolkit/generate'] = {
      data: {
        userId: 'user-123',
        purchaseId: 'purchase-456',
        diagnosticData: {
          tool1: { compositeScore: 75, completedAt: '2026-02-14' },
        },
      },
    };
    expect(event.data.userId).toBe('user-123');
    expect(event.data.purchaseId).toBe('purchase-456');
    expect(event.data.diagnosticData).toBeDefined();
  });

  it('should define toolkit/document.generate event type', () => {
    const event: InngestEvents['toolkit/document.generate'] = {
      data: {
        documentId: 'doc-789',
        userId: 'user-123',
        purchaseId: 'purchase-456',
        documentType: 'word',
        documentName: 'Strategic Alignment Brief',
        documentIndex: 1,
        diagnosticData: {},
      },
    };
    expect(event.data.documentId).toBe('doc-789');
    expect(event.data.documentType).toBe('word');
    expect(event.data.documentIndex).toBe(1);
  });

  it('should define toolkit/ready event type', () => {
    const event: InngestEvents['toolkit/ready'] = {
      data: {
        userId: 'user-123',
        purchaseId: 'purchase-456',
        completedCount: 9,
        failedCount: 1,
        documentIds: ['doc-1', 'doc-2', 'doc-3'],
      },
    };
    expect(event.data.completedCount).toBe(9);
    expect(event.data.failedCount).toBe(1);
    expect(event.data.documentIds).toHaveLength(3);
  });

  it('should define toolkit/document.completed event type', () => {
    const event: InngestEvents['toolkit/document.completed'] = {
      data: {
        documentId: 'doc-789',
        purchaseId: 'purchase-456',
        userId: 'user-123',
        status: 'completed',
        documentName: 'Strategic Alignment Brief',
      },
    };
    expect(event.data.status).toBe('completed');
    expect(event.data.documentName).toBe('Strategic Alignment Brief');
  });

  it('should allow failed status in document.completed event', () => {
    const event: InngestEvents['toolkit/document.completed'] = {
      data: {
        documentId: 'doc-789',
        purchaseId: 'purchase-456',
        userId: 'user-123',
        status: 'failed',
        documentName: 'Meeting Cost Tracker',
      },
    };
    expect(event.data.status).toBe('failed');
  });
});
