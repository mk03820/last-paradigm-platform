/**
 * Tests for PDF Document Generators
 *
 * Story 18.4: PowerPoint & PDF Generation
 * Task 6: Write comprehensive tests
 */

import { describe, it, expect } from 'vitest';
import { generateBoardSummaryReport } from '@/lib/documents/pdf/board-summary-report';
import {
  PDF_DOCUMENT_GENERATORS,
  getPdfDocumentGenerator,
  isPdfDocument,
  getPdfDocumentNames,
} from '@/lib/documents/pdf';
import type { DiagnosticSessionData } from '@/lib/db/schema';

// Helper to create mock diagnostic data
function createMockDiagnosticData(overrides: Partial<DiagnosticSessionData> = {}): DiagnosticSessionData {
  return {
    tool1: {
      scores: {
        strategic: 75,
        execution: 65,
        technology: 80,
        people: 70,
        governance: 60,
      },
      compositeScore: 70,
      completedAt: '2024-01-15T10:00:00Z',
    },
    tool2: {
      inputs: {
        meetingCount: 50,
        averageAttendees: 6,
        averageDuration: 60,
      },
      results: {
        totalMeetingHours: 300,
        totalMeetingCost: 150000,
        wastedHours: 120,
        wastedCost: 60000,
        effectiveHours: 180,
        effectiveCost: 90000,
      },
      completedAt: '2024-01-15T11:00:00Z',
    },
    tool3: {
      decisions: [
        { archetype: 'Operational', medianDays: 3, p90Days: 7 },
        { archetype: 'Strategic', medianDays: 14, p90Days: 30 },
      ],
      metrics: {
        overallMedian: 7,
        overallP90: 21,
      },
      completedAt: '2024-01-15T12:00:00Z',
    },
    tool4: {
      stakeholders: [
        { name: 'CEO', power: 90, interest: 80, sentiment: 'champion' },
        { name: 'CFO', power: 80, interest: 70, sentiment: 'neutral' },
      ],
      completedAt: '2024-01-15T13:00:00Z',
    },
    tool5: {
      journeys: [
        { name: 'Sales Pipeline', frictionPoints: 5 },
        { name: 'Customer Support', frictionPoints: 3 },
      ],
      frictionCost: 45000,
      completedAt: '2024-01-15T14:00:00Z',
    },
    tool6: {
      metrics: {
        healthScore: 65,
        antiPatternCount: 3,
      },
      antiPatterns: ['Meeting Overload', 'Email Chaos', 'After-Hours Communication'],
      completedAt: '2024-01-15T15:00:00Z',
    },
    tool7: {
      totalCost: 500000,
      alignmentTaxPercent: 15,
      completedAt: '2024-01-15T16:00:00Z',
    },
    ...overrides,
  };
}

describe('Board Summary Report Generator', () => {
  it('should generate a valid PDF buffer', async () => {
    const data = createMockDiagnosticData();
    const result = await generateBoardSummaryReport(data);

    expect(result.buffer).toBeInstanceOf(Buffer);
    expect(result.fileSizeBytes).toBeGreaterThan(0);
  });

  it('should handle empty diagnostic data', async () => {
    const data: DiagnosticSessionData = {};
    const result = await generateBoardSummaryReport(data);

    expect(result.buffer).toBeInstanceOf(Buffer);
    expect(result.fileSizeBytes).toBeGreaterThan(0);
  });

  it('should handle partial diagnostic data', async () => {
    const data = createMockDiagnosticData({
      tool1: undefined,
      tool3: undefined,
      tool5: undefined,
    });
    const result = await generateBoardSummaryReport(data);

    expect(result.buffer).toBeInstanceOf(Buffer);
    expect(result.fileSizeBytes).toBeGreaterThan(0);
  });

  it('should generate PDF with minimum expected size', async () => {
    const data = createMockDiagnosticData();
    const result = await generateBoardSummaryReport(data);

    // Verify buffer is substantial enough for 6+ pages
    expect(result.fileSizeBytes).toBeGreaterThan(5000);
  });
});

describe('PDF Module Exports', () => {
  it('should export generator registry', () => {
    expect(PDF_DOCUMENT_GENERATORS).toBeDefined();
    expect(PDF_DOCUMENT_GENERATORS['board-summary-report']).toBeDefined();
  });

  it('getPdfDocumentGenerator should return correct generator', () => {
    const generator = getPdfDocumentGenerator('board-summary-report');
    expect(generator).toBe(generateBoardSummaryReport);
  });

  it('isPdfDocument should correctly identify valid names', () => {
    expect(isPdfDocument('board-summary-report')).toBe(true);
    expect(isPdfDocument('not-a-document')).toBe(false);
  });

  it('getPdfDocumentNames should return all document names', () => {
    const names = getPdfDocumentNames();
    expect(names).toContain('board-summary-report');
    expect(names.length).toBe(1);
  });
});
