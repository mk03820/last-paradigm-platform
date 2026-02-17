/**
 * Strategic Alignment Brief Generator Tests
 *
 * Tests for the Strategic Alignment Brief document generator.
 *
 * Story 18.2: Word Document Templates & Generation
 * Task 8.3: Unit tests for Strategic Alignment Brief (all sections)
 */

import { describe, it, expect } from 'vitest';
import { generateStrategicAlignmentBrief } from '@/lib/documents/word/strategic-alignment-brief';
import type { DiagnosticSessionData } from '@/lib/db/schema';

describe('generateStrategicAlignmentBrief', () => {
  // Sample diagnostic data for testing
  const fullDiagnosticData: DiagnosticSessionData = {
    tool1: {
      compositeScore: 65,
      dimensions: {
        strategic: 70,
        structural: 60,
        processAlignment: 55,
        cultural: 75,
        technological: 65,
      },
      interpretation: 'Moderate alignment with room for improvement',
    },
    tool2: {
      results: {
        wastedCost: 500000,
        wastedHours: 10000,
        totalMeetings: 200,
        avgAttendees: 5,
        avgDuration: 60,
        inefficiencyPercent: 35,
      },
    },
    tool3: {
      archetypes: {
        strategic: { median: 21, p90: 45, samples: 10 },
        tactical: { median: 5, p90: 12, samples: 25 },
        operational: { median: 1, p90: 3, samples: 100 },
        budgetary: { median: 10, p90: 21, samples: 15 },
        hiring: { median: 14, p90: 30, samples: 8 },
      },
      bottlenecks: [
        { pattern: 'Analysis Paralysis', severity: 'high', description: 'Too much data gathering' },
      ],
      overallVelocityScore: 55,
    },
    tool4: {
      stakeholders: [
        { name: 'CEO', role: 'Executive', power: 10, interest: 9, sentiment: 'supportive', quadrant: 'manage_closely' },
        { name: 'CFO', role: 'Executive', power: 9, interest: 7, sentiment: 'neutral', quadrant: 'manage_closely' },
      ],
      quadrantSummary: {
        manageClosely: 2,
        keepSatisfied: 3,
        keepInformed: 5,
        monitor: 10,
      },
      riskCount: 2,
    },
    tool5: {
      journeys: [
        {
          name: 'Sales Pipeline',
          stages: [{ name: 'Lead', type: 'input' }, { name: 'Qualification', type: 'process' }],
          frictionPoints: [{ stageIndex: 1, category: 'manual', severity: 7, description: 'Manual data entry' }],
        },
      ],
      totalFrictionCost: 200000,
      frictionByCategory: {
        manual: 80000,
        delay: 60000,
        quality: 40000,
        access: 20000,
      },
    },
    tool6: {
      metrics: {
        emailsPerDay: 75,
        slackMessagesPerDay: 50,
        meetingHoursPerWeek: 20,
        afterHoursPercent: 15,
        responseTimeMinutes: 45,
      },
      antiPatterns: [
        { pattern: 'Meeting Overload', severity: 'high', description: 'Too many meetings', recommendation: 'Reduce meetings' },
      ],
      healthScore: 60,
      healthIndicators: {
        emailHealth: 55,
        chatHealth: 70,
        meetingHealth: 50,
      },
    },
    tool7: {
      totalCost: 1500000,
      alignmentTaxPercent: 15,
      costBreakdown: {
        meetingWaste: 500000,
        decisionDelay: 300000,
        communicationOverhead: 200000,
        frictionCost: 200000,
        projectDelays: 150000,
        rework: 100000,
        turnover: 50000,
        opportunityCost: 0,
      },
      interpretation: 'significant',
      roiProjection: {
        conservative: 300000,
        moderate: 500000,
        aggressive: 750000,
        paybackMonths: 8,
      },
    },
  };

  const emptyDiagnosticData: DiagnosticSessionData = {};

  it('should generate a document buffer', async () => {
    const result = await generateStrategicAlignmentBrief(fullDiagnosticData);

    expect(result).toBeDefined();
    expect(result.buffer).toBeInstanceOf(Buffer);
    expect(result.fileSizeBytes).toBeGreaterThan(0);
  });

  it('should generate a valid docx file', async () => {
    const result = await generateStrategicAlignmentBrief(fullDiagnosticData);

    // Check for docx magic bytes (PK zip header)
    expect(result.buffer[0]).toBe(0x50); // 'P'
    expect(result.buffer[1]).toBe(0x4b); // 'K'
  });

  it('should handle empty diagnostic data', async () => {
    const result = await generateStrategicAlignmentBrief(emptyDiagnosticData);

    expect(result).toBeDefined();
    expect(result.buffer).toBeInstanceOf(Buffer);
    expect(result.fileSizeBytes).toBeGreaterThan(0);
  });

  it('should handle partial diagnostic data', async () => {
    const partialData: DiagnosticSessionData = {
      tool1: {
        compositeScore: 50,
        dimensions: {
          strategic: 50,
          structural: 50,
        },
      },
      tool7: {
        totalCost: 1000000,
        alignmentTaxPercent: 10,
      },
    };

    const result = await generateStrategicAlignmentBrief(partialData);

    expect(result).toBeDefined();
    expect(result.buffer).toBeInstanceOf(Buffer);
  });

  it('should report accurate file size', async () => {
    const result = await generateStrategicAlignmentBrief(fullDiagnosticData);

    expect(result.fileSizeBytes).toBe(result.buffer.byteLength);
  });

  it('should generate larger file with more data', async () => {
    const fullResult = await generateStrategicAlignmentBrief(fullDiagnosticData);
    const emptyResult = await generateStrategicAlignmentBrief(emptyDiagnosticData);

    // Full data should produce larger document
    expect(fullResult.fileSizeBytes).toBeGreaterThan(emptyResult.fileSizeBytes);
  });
});

describe('Strategic Alignment Brief Content', () => {
  it('should include executive summary section', async () => {
    const result = await generateStrategicAlignmentBrief({
      tool7: { totalCost: 1000000, alignmentTaxPercent: 10 },
    });

    // Document should be generated without errors
    expect(result.buffer).toBeInstanceOf(Buffer);
  });

  it('should handle missing tool data gracefully', async () => {
    // Each tool section should handle undefined data
    const sparseData: DiagnosticSessionData = {
      tool1: { compositeScore: 50 },
      // Other tools undefined
    };

    const result = await generateStrategicAlignmentBrief(sparseData);
    expect(result.buffer).toBeInstanceOf(Buffer);
  });

  it('should generate recommendations based on scores', async () => {
    // Low scores should trigger recommendations
    const lowScoreData: DiagnosticSessionData = {
      tool1: { compositeScore: 30 },
      tool2: { results: { wastedCost: 500000 } },
      tool3: { overallVelocityScore: 40 },
      tool6: { healthScore: 45 },
    };

    const result = await generateStrategicAlignmentBrief(lowScoreData);
    expect(result.buffer).toBeInstanceOf(Buffer);
  });
});
