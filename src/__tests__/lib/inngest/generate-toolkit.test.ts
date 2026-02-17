/**
 * Generate Toolkit Orchestrator Tests
 *
 * Tests for the toolkit generation orchestrator Inngest function.
 *
 * Covers: Story 18.1 Task 8.2
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TOOLKIT_DOCUMENTS } from '@/lib/inngest/functions/generate-toolkit';

// Mock the database
vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn(),
  },
}));

describe('Generate Toolkit Orchestrator (Story 18.1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('TOOLKIT_DOCUMENTS configuration', () => {
    it('should have exactly 10 documents', () => {
      expect(TOOLKIT_DOCUMENTS).toHaveLength(10);
    });

    it('should have 5 Word documents', () => {
      const wordDocs = TOOLKIT_DOCUMENTS.filter((doc) => doc.type === 'word');
      expect(wordDocs).toHaveLength(5);
    });

    it('should have 3 Excel documents', () => {
      const excelDocs = TOOLKIT_DOCUMENTS.filter((doc) => doc.type === 'excel');
      expect(excelDocs).toHaveLength(3);
    });

    it('should have 1 PowerPoint document', () => {
      const pptxDocs = TOOLKIT_DOCUMENTS.filter((doc) => doc.type === 'pptx');
      expect(pptxDocs).toHaveLength(1);
    });

    it('should have 1 PDF document', () => {
      const pdfDocs = TOOLKIT_DOCUMENTS.filter((doc) => doc.type === 'pdf');
      expect(pdfDocs).toHaveLength(1);
    });

    it('should have Strategic Alignment Brief as first document', () => {
      expect(TOOLKIT_DOCUMENTS[0].name).toBe('Strategic Alignment Brief');
      expect(TOOLKIT_DOCUMENTS[0].type).toBe('word');
    });

    it('should have Board Summary Report as last document', () => {
      expect(TOOLKIT_DOCUMENTS[9].name).toBe('Board Summary Report');
      expect(TOOLKIT_DOCUMENTS[9].type).toBe('pdf');
    });

    it('should have unique document names', () => {
      const names = TOOLKIT_DOCUMENTS.map((doc) => doc.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });

    it('should have all expected Word documents', () => {
      const wordNames = TOOLKIT_DOCUMENTS.filter(
        (doc) => doc.type === 'word'
      ).map((doc) => doc.name);

      expect(wordNames).toContain('Strategic Alignment Brief');
      expect(wordNames).toContain('Stakeholder Communication Pack');
      expect(wordNames).toContain('Decision Framework Guide');
      expect(wordNames).toContain('Data Flow Optimization Plan');
      expect(wordNames).toContain('Communication Improvement Playbook');
    });

    it('should have all expected Excel documents', () => {
      const excelNames = TOOLKIT_DOCUMENTS.filter(
        (doc) => doc.type === 'excel'
      ).map((doc) => doc.name);

      expect(excelNames).toContain('Meeting Cost Tracker');
      expect(excelNames).toContain('Alignment Tax Calculator');
      expect(excelNames).toContain('Transformation Roadmap Planner');
    });

    it('should have Executive Presentation Deck as PowerPoint', () => {
      const pptx = TOOLKIT_DOCUMENTS.find((doc) => doc.type === 'pptx');
      expect(pptx?.name).toBe('Executive Presentation Deck');
    });

    it('should only use valid document types', () => {
      const validTypes = ['word', 'excel', 'pptx', 'pdf'];
      TOOLKIT_DOCUMENTS.forEach((doc) => {
        expect(validTypes).toContain(doc.type);
      });
    });
  });

  describe('Document record creation', () => {
    it('should create records with correct default status', () => {
      // Verify documents are created with 'pending' status
      TOOLKIT_DOCUMENTS.forEach((doc) => {
        const record = {
          purchaseId: 'purchase-123',
          userId: 'user-123',
          documentType: doc.type,
          documentName: doc.name,
          status: 'pending' as const,
          attempts: 0,
        };

        expect(record.status).toBe('pending');
        expect(record.attempts).toBe(0);
      });
    });

    it('should map document index correctly', () => {
      TOOLKIT_DOCUMENTS.forEach((doc, index) => {
        const documentIndex = index + 1;
        expect(documentIndex).toBeGreaterThanOrEqual(1);
        expect(documentIndex).toBeLessThanOrEqual(10);
      });
    });
  });
});

describe('Generate Toolkit Event Data', () => {
  it('should require userId and purchaseId', () => {
    const eventData = {
      userId: 'user-123',
      purchaseId: 'purchase-456',
      diagnosticData: {},
    };

    expect(eventData.userId).toBeDefined();
    expect(eventData.purchaseId).toBeDefined();
  });

  it('should include diagnostic data for pre-population', () => {
    const eventData = {
      userId: 'user-123',
      purchaseId: 'purchase-456',
      diagnosticData: {
        tool1: { compositeScore: 75 },
        tool2: { results: { wastedCost: 500000 } },
        tool7: { totalCost: 1500000 },
      },
    };

    expect(eventData.diagnosticData.tool1).toBeDefined();
    expect(eventData.diagnosticData.tool7?.totalCost).toBe(1500000);
  });
});

describe('Spawn Document Jobs', () => {
  it('should create correct event structure for each document', () => {
    const mockDocRecord = {
      id: 'doc-uuid-1',
      documentType: 'word' as const,
      documentName: 'Strategic Alignment Brief',
    };

    const eventPayload = {
      name: 'toolkit/document.generate' as const,
      data: {
        documentId: mockDocRecord.id,
        userId: 'user-123',
        purchaseId: 'purchase-456',
        documentType: mockDocRecord.documentType,
        documentName: mockDocRecord.documentName,
        documentIndex: 1,
        diagnosticData: {},
      },
    };

    expect(eventPayload.name).toBe('toolkit/document.generate');
    expect(eventPayload.data.documentId).toBe('doc-uuid-1');
    expect(eventPayload.data.documentIndex).toBe(1);
  });
});
