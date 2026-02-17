/**
 * Tests for Excel Document Generators
 *
 * Story 18.3: Excel Document Templates & Generation
 * Task 6: Write comprehensive tests for Excel generators
 */

import { describe, it, expect } from 'vitest';
import ExcelJS from 'exceljs';
import { generateMeetingCostTracker } from '@/lib/documents/excel/meeting-cost-tracker';
import { generateAlignmentTaxCalculator } from '@/lib/documents/excel/alignment-tax-calculator';
import { generateTransformationRoadmapPlanner } from '@/lib/documents/excel/transformation-roadmap-planner';
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
        salaryDistribution: {
          executive: 10,
          senior: 30,
          midLevel: 40,
          entry: 20,
        },
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

// Helper to parse Excel buffer
async function parseExcelBuffer(buffer: Buffer): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  return workbook;
}

describe('Meeting Cost Tracker Generator', () => {
  it('should generate a valid Excel workbook', async () => {
    const data = createMockDiagnosticData();
    const result = await generateMeetingCostTracker(data);

    expect(result.buffer).toBeInstanceOf(Buffer);
    expect(result.fileSizeBytes).toBeGreaterThan(0);
  });

  it('should create all required worksheets', async () => {
    const data = createMockDiagnosticData();
    const result = await generateMeetingCostTracker(data);
    const workbook = await parseExcelBuffer(result.buffer);

    const sheetNames = workbook.worksheets.map(ws => ws.name);
    expect(sheetNames).toContain('Summary');
    expect(sheetNames).toContain('Weekly Tracker');
    expect(sheetNames).toContain('Monthly Summary');
    expect(sheetNames).toContain('Dashboard');
  });

  it('should include diagnostic baseline in Summary', async () => {
    const data = createMockDiagnosticData();
    const result = await generateMeetingCostTracker(data);
    const workbook = await parseExcelBuffer(result.buffer);

    const summary = workbook.getWorksheet('Summary');
    expect(summary).toBeDefined();

    // Check that some diagnostic data is present
    const allValues: unknown[] = [];
    summary?.eachRow((row) => {
      row.eachCell((cell) => {
        allValues.push(cell.value);
      });
    });

    // Should contain the wasted cost value
    expect(allValues.some(v => v === 60000)).toBe(true);
  });

  it('should handle missing tool2 data gracefully', async () => {
    const data = createMockDiagnosticData({ tool2: undefined });
    const result = await generateMeetingCostTracker(data);

    expect(result.buffer).toBeInstanceOf(Buffer);
    expect(result.fileSizeBytes).toBeGreaterThan(0);
  });

  it('should include input cells for salary configuration', async () => {
    const data = createMockDiagnosticData();
    const result = await generateMeetingCostTracker(data);
    const workbook = await parseExcelBuffer(result.buffer);

    const summary = workbook.getWorksheet('Summary');

    // Look for salary band labels
    const allValues: string[] = [];
    summary?.eachRow((row) => {
      row.eachCell((cell) => {
        if (typeof cell.value === 'string') {
          allValues.push(cell.value);
        }
      });
    });

    expect(allValues.some(v => v.includes('Entry Level'))).toBe(true);
    expect(allValues.some(v => v.includes('Senior'))).toBe(true);
  });
});

describe('Alignment Tax Calculator Generator', () => {
  it('should generate a valid Excel workbook', async () => {
    const data = createMockDiagnosticData();
    const result = await generateAlignmentTaxCalculator(data);

    expect(result.buffer).toBeInstanceOf(Buffer);
    expect(result.fileSizeBytes).toBeGreaterThan(0);
  });

  it('should create all required worksheets', async () => {
    const data = createMockDiagnosticData();
    const result = await generateAlignmentTaxCalculator(data);
    const workbook = await parseExcelBuffer(result.buffer);

    const sheetNames = workbook.worksheets.map(ws => ws.name);
    expect(sheetNames).toContain('Diagnostic Inputs');
    expect(sheetNames).toContain('Master Calculation');
    expect(sheetNames).toContain('Scenario Modeling');
    expect(sheetNames).toContain('ROI Projection');
    expect(sheetNames).toContain('Dashboard');
  });

  it('should include all 7 tool sections in Diagnostic Inputs', async () => {
    const data = createMockDiagnosticData();
    const result = await generateAlignmentTaxCalculator(data);
    const workbook = await parseExcelBuffer(result.buffer);

    const inputsSheet = workbook.getWorksheet('Diagnostic Inputs');
    const allValues: string[] = [];
    inputsSheet?.eachRow((row) => {
      row.eachCell((cell) => {
        if (typeof cell.value === 'string') {
          allValues.push(cell.value);
        }
      });
    });

    expect(allValues.some(v => v.includes('Tool 1'))).toBe(true);
    expect(allValues.some(v => v.includes('Tool 2'))).toBe(true);
    expect(allValues.some(v => v.includes('Tool 3'))).toBe(true);
    expect(allValues.some(v => v.includes('Tool 4'))).toBe(true);
    expect(allValues.some(v => v.includes('Tool 5'))).toBe(true);
    expect(allValues.some(v => v.includes('Tool 6'))).toBe(true);
    expect(allValues.some(v => v.includes('Tool 7'))).toBe(true);
  });

  it('should include scenario modeling options', async () => {
    const data = createMockDiagnosticData();
    const result = await generateAlignmentTaxCalculator(data);
    const workbook = await parseExcelBuffer(result.buffer);

    const scenarioSheet = workbook.getWorksheet('Scenario Modeling');
    const allValues: string[] = [];
    scenarioSheet?.eachRow((row) => {
      row.eachCell((cell) => {
        if (typeof cell.value === 'string') {
          allValues.push(cell.value);
        }
      });
    });

    expect(allValues.some(v => v.includes('Conservative'))).toBe(true);
    expect(allValues.some(v => v.includes('Moderate'))).toBe(true);
    expect(allValues.some(v => v.includes('Aggressive'))).toBe(true);
  });

  it('should include 12 quarters in ROI Projection', async () => {
    const data = createMockDiagnosticData();
    const result = await generateAlignmentTaxCalculator(data);
    const workbook = await parseExcelBuffer(result.buffer);

    const roiSheet = workbook.getWorksheet('ROI Projection');
    const quarterValues: string[] = [];
    roiSheet?.eachRow((row) => {
      row.eachCell((cell) => {
        if (typeof cell.value === 'string' && cell.value.startsWith('Q')) {
          quarterValues.push(cell.value);
        }
      });
    });

    expect(quarterValues.length).toBeGreaterThanOrEqual(12);
  });

  it('should handle empty diagnostic data', async () => {
    const data: DiagnosticSessionData = {};
    const result = await generateAlignmentTaxCalculator(data);

    expect(result.buffer).toBeInstanceOf(Buffer);
    expect(result.fileSizeBytes).toBeGreaterThan(0);
  });
});

describe('Transformation Roadmap Planner Generator', () => {
  it('should generate a valid Excel workbook', async () => {
    const data = createMockDiagnosticData();
    const result = await generateTransformationRoadmapPlanner(data);

    expect(result.buffer).toBeInstanceOf(Buffer);
    expect(result.fileSizeBytes).toBeGreaterThan(0);
  });

  it('should create all required worksheets', async () => {
    const data = createMockDiagnosticData();
    const result = await generateTransformationRoadmapPlanner(data);
    const workbook = await parseExcelBuffer(result.buffer);

    const sheetNames = workbook.worksheets.map(ws => ws.name);
    expect(sheetNames).toContain('Priority Matrix');
    expect(sheetNames).toContain('Initiative Tracker');
    expect(sheetNames).toContain('Timeline');
    expect(sheetNames).toContain('Resource Allocation');
    expect(sheetNames).toContain('Milestones');
    expect(sheetNames).toContain('Risk Register');
  });

  it('should generate initiatives based on diagnostic data', async () => {
    const data = createMockDiagnosticData();
    const result = await generateTransformationRoadmapPlanner(data);
    const workbook = await parseExcelBuffer(result.buffer);

    const prioritySheet = workbook.getWorksheet('Priority Matrix');
    const allValues: string[] = [];
    prioritySheet?.eachRow((row) => {
      row.eachCell((cell) => {
        if (typeof cell.value === 'string') {
          allValues.push(cell.value);
        }
      });
    });

    // Should have generated some initiatives
    expect(allValues.some(v => v.includes('Tool'))).toBe(true);
  });

  it('should include 12-month timeline', async () => {
    const data = createMockDiagnosticData();
    const result = await generateTransformationRoadmapPlanner(data);
    const workbook = await parseExcelBuffer(result.buffer);

    const timelineSheet = workbook.getWorksheet('Timeline');
    const monthValues: string[] = [];
    timelineSheet?.eachRow((row) => {
      row.eachCell((cell) => {
        if (typeof cell.value === 'string' && cell.value.startsWith('M')) {
          monthValues.push(cell.value);
        }
      });
    });

    // Should have M1-M12 month headers
    expect(monthValues).toContain('M1');
    expect(monthValues).toContain('M12');
  });

  it('should include pre-populated milestones', async () => {
    const data = createMockDiagnosticData();
    const result = await generateTransformationRoadmapPlanner(data);
    const workbook = await parseExcelBuffer(result.buffer);

    const milestonesSheet = workbook.getWorksheet('Milestones');
    const allValues: string[] = [];
    milestonesSheet?.eachRow((row) => {
      row.eachCell((cell) => {
        if (typeof cell.value === 'string') {
          allValues.push(cell.value);
        }
      });
    });

    expect(allValues.some(v => v.includes('Kickoff'))).toBe(true);
  });

  it('should include pre-populated risks', async () => {
    const data = createMockDiagnosticData();
    const result = await generateTransformationRoadmapPlanner(data);
    const workbook = await parseExcelBuffer(result.buffer);

    const riskSheet = workbook.getWorksheet('Risk Register');
    const allValues: string[] = [];
    riskSheet?.eachRow((row) => {
      row.eachCell((cell) => {
        if (typeof cell.value === 'string') {
          allValues.push(cell.value);
        }
      });
    });

    // Should have pre-populated transformation risks
    expect(allValues.some(v => v.includes('resistance'))).toBe(true);
  });

  it('should handle minimal diagnostic data', async () => {
    const data: DiagnosticSessionData = {
      tool1: { completedAt: '2024-01-01' },
    };
    const result = await generateTransformationRoadmapPlanner(data);

    expect(result.buffer).toBeInstanceOf(Buffer);

    // Should still generate default initiatives
    const workbook = await parseExcelBuffer(result.buffer);
    const prioritySheet = workbook.getWorksheet('Priority Matrix');
    expect(prioritySheet).toBeDefined();
  });
});

describe('Excel Module Exports', () => {
  it('should export all generator functions', async () => {
    const {
      generateMeetingCostTracker,
      generateAlignmentTaxCalculator,
      generateTransformationRoadmapPlanner,
    } = await import('@/lib/documents/excel');

    expect(typeof generateMeetingCostTracker).toBe('function');
    expect(typeof generateAlignmentTaxCalculator).toBe('function');
    expect(typeof generateTransformationRoadmapPlanner).toBe('function');
  });

  it('should export generator registry', async () => {
    const { EXCEL_DOCUMENT_GENERATORS } = await import('@/lib/documents/excel');

    expect(EXCEL_DOCUMENT_GENERATORS).toBeDefined();
    expect(EXCEL_DOCUMENT_GENERATORS['meeting-cost-tracker']).toBeDefined();
    expect(EXCEL_DOCUMENT_GENERATORS['alignment-tax-calculator']).toBeDefined();
    expect(EXCEL_DOCUMENT_GENERATORS['transformation-roadmap-planner']).toBeDefined();
  });

  it('should export helper functions', async () => {
    const {
      getExcelDocumentGenerator,
      isExcelDocument,
      getExcelDocumentNames,
    } = await import('@/lib/documents/excel');

    expect(typeof getExcelDocumentGenerator).toBe('function');
    expect(typeof isExcelDocument).toBe('function');
    expect(typeof getExcelDocumentNames).toBe('function');
  });

  it('getExcelDocumentGenerator should return correct generator', async () => {
    const { getExcelDocumentGenerator, generateMeetingCostTracker } = await import('@/lib/documents/excel');

    const generator = getExcelDocumentGenerator('meeting-cost-tracker');
    expect(generator).toBe(generateMeetingCostTracker);
  });

  it('isExcelDocument should correctly identify valid names', async () => {
    const { isExcelDocument } = await import('@/lib/documents/excel');

    expect(isExcelDocument('meeting-cost-tracker')).toBe(true);
    expect(isExcelDocument('alignment-tax-calculator')).toBe(true);
    expect(isExcelDocument('transformation-roadmap-planner')).toBe(true);
    expect(isExcelDocument('not-a-document')).toBe(false);
  });

  it('getExcelDocumentNames should return all document names', async () => {
    const { getExcelDocumentNames } = await import('@/lib/documents/excel');

    const names = getExcelDocumentNames();
    expect(names).toContain('meeting-cost-tracker');
    expect(names).toContain('alignment-tax-calculator');
    expect(names).toContain('transformation-roadmap-planner');
    expect(names.length).toBe(3);
  });
});
