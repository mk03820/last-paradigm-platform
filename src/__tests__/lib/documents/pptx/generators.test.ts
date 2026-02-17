/**
 * Tests for PowerPoint Document Generators
 *
 * Story 18.4: PowerPoint & PDF Generation
 * Task 6: Write comprehensive tests
 */

import { describe, it, expect } from 'vitest';
import { generateExecutivePresentationDeck } from '@/lib/documents/pptx/executive-presentation-deck';
import {
  PPTX_DOCUMENT_GENERATORS,
  getPptxDocumentGenerator,
  isPptxDocument,
  getPptxDocumentNames,
} from '@/lib/documents/pptx';
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

describe('Executive Presentation Deck Generator', () => {
  it('should generate a valid PowerPoint buffer', async () => {
    const data = createMockDiagnosticData();
    const result = await generateExecutivePresentationDeck(data);

    expect(result.buffer).toBeInstanceOf(Buffer);
    expect(result.fileSizeBytes).toBeGreaterThan(0);
  });

  it('should handle empty diagnostic data', async () => {
    const data: DiagnosticSessionData = {};
    const result = await generateExecutivePresentationDeck(data);

    expect(result.buffer).toBeInstanceOf(Buffer);
    expect(result.fileSizeBytes).toBeGreaterThan(0);
  });

  it('should handle partial diagnostic data', async () => {
    const data = createMockDiagnosticData({
      tool1: undefined,
      tool3: undefined,
      tool5: undefined,
    });
    const result = await generateExecutivePresentationDeck(data);

    expect(result.buffer).toBeInstanceOf(Buffer);
    expect(result.fileSizeBytes).toBeGreaterThan(0);
  });

  it('should generate presentation with minimum expected slides', async () => {
    const data = createMockDiagnosticData();
    const result = await generateExecutivePresentationDeck(data);

    // Verify buffer is substantial enough for 15+ slides
    expect(result.fileSizeBytes).toBeGreaterThan(10000);
  });
});

describe('PowerPoint Module Exports', () => {
  it('should export generator registry', () => {
    expect(PPTX_DOCUMENT_GENERATORS).toBeDefined();
    expect(PPTX_DOCUMENT_GENERATORS['executive-presentation-deck']).toBeDefined();
  });

  it('getPptxDocumentGenerator should return correct generator', () => {
    const generator = getPptxDocumentGenerator('executive-presentation-deck');
    expect(generator).toBe(generateExecutivePresentationDeck);
  });

  it('isPptxDocument should correctly identify valid names', () => {
    expect(isPptxDocument('executive-presentation-deck')).toBe(true);
    expect(isPptxDocument('not-a-document')).toBe(false);
  });

  it('getPptxDocumentNames should return all document names', () => {
    const names = getPptxDocumentNames();
    expect(names).toContain('executive-presentation-deck');
    expect(names.length).toBe(1);
  });
});
