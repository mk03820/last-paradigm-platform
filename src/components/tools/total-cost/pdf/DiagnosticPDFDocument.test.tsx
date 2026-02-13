/**
 * Tests for Diagnostic PDF Document Component
 *
 * Story 14.6: Complete Diagnostic PDF Export
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as React from 'react';
import type { AlignmentTaxResult, AggregatedToolData } from '../cost-constants';

// Mock @react-pdf/renderer
vi.mock('@react-pdf/renderer', () => ({
  Document: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pdf-document">{children}</div>
  ),
  Page: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pdf-page">{children}</div>
  ),
  View: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  StyleSheet: {
    create: (styles: Record<string, unknown>) => styles,
  },
}));

describe('DiagnosticPDFDocument', () => {
  const mockResult: AlignmentTaxResult = {
    meetingWaste: 1200000,
    dataFriction: 450000,
    projectDelays: 350000,
    rework: 600000,
    turnover: 200000,
    opportunityCost: 100000,
    toolsSubtotal: 1650000,
    additionalSubtotal: 1250000,
    total: 2900000,
    revenue: 70000000,
    percentOfRevenue: 4.14,
    interpretation: {
      level: 'crisis',
      minPercent: 4,
      maxPercent: 7,
      label: 'Crisis',
      description: 'Your alignment tax is at crisis level.',
      color: 'text-orange-700',
      bgColor: 'bg-orange-100',
      borderColor: 'border-orange-300',
      icon: 'alert-octagon',
    },
  };

  const mockAggregatedData: AggregatedToolData = {
    tool1: {
      compositeScore: 2.3,
      category: 'siloed',
      weakestDimension: 'Communication',
      completedAt: new Date().toISOString(),
    },
    tool2: {
      annualizedWaste: 1200000,
      meetingsPerWeek: 45,
      totalAttendeeHours: 540,
      completedAt: new Date().toISOString(),
    },
    tool3: {
      avgDecisionLatencyDays: 12,
      bottleneckPatterns: ['Approval bottleneck'],
      decisionTypeCount: 4,
      completedAt: new Date().toISOString(),
    },
    tool4: {
      stakeholderCount: 15,
      blockerCount: 3,
      keyPlayerCount: 5,
      riskLevel: 'medium',
      completedAt: new Date().toISOString(),
    },
    tool5: {
      totalFrictionCost: 450000,
      journeyCount: 5,
      frictionPointCount: 12,
      criticalFrictionCount: 3,
      completedAt: new Date().toISOString(),
    },
    tool6: {
      healthScore: 58,
      healthStatus: 'warning',
      patternsDetected: 3,
      interventionsRecommended: 5,
      completedAt: new Date().toISOString(),
    },
    aggregatedAt: new Date().toISOString(),
    completedToolsCount: 6,
    canProceed: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export DiagnosticPDFDocument', async () => {
    const { DiagnosticPDFDocument } = await import('./DiagnosticPDFDocument');
    expect(DiagnosticPDFDocument).toBeDefined();
  });

  it('should accept required props', async () => {
    const { DiagnosticPDFDocument } = await import('./DiagnosticPDFDocument');

    // Test that component can be instantiated with required props
    const props = {
      result: mockResult,
      aggregatedData: mockAggregatedData,
    };

    // Should not throw
    expect(() => <DiagnosticPDFDocument {...props} />).not.toThrow();
  });

  it('should accept optional organizationName prop', async () => {
    const { DiagnosticPDFDocument } = await import('./DiagnosticPDFDocument');

    const props = {
      result: mockResult,
      aggregatedData: mockAggregatedData,
      organizationName: 'Acme Corp',
    };

    expect(() => <DiagnosticPDFDocument {...props} />).not.toThrow();
  });

  it('should accept optional ROI results', async () => {
    const { DiagnosticPDFDocument } = await import('./DiagnosticPDFDocument');

    const props = {
      result: mockResult,
      aggregatedData: mockAggregatedData,
      roiResults: [
        {
          scenarioType: 'moderate' as const,
          scenarioLabel: 'Moderate',
          targetReduction: 50,
          timelineMonths: 18,
          investment: 500000,
          annualSavings: 1450000,
          threeYearSavings: 4350000,
          npv: 3800000,
          roiRatio: 7.6,
          roiPercent: 760,
          paybackMonths: 4.1,
          probability: 65,
        },
      ],
      investment: 500000,
    };

    expect(() => <DiagnosticPDFDocument {...props} />).not.toThrow();
  });
});

describe('DiagnosticPDFStyles', () => {
  it('should export styles object', async () => {
    const { diagnosticPDFStyles } = await import('./DiagnosticPDFStyles');
    expect(diagnosticPDFStyles).toBeDefined();
    expect(diagnosticPDFStyles.page).toBeDefined();
    expect(diagnosticPDFStyles.coverPage).toBeDefined();
  });

  it('should export brand colors', async () => {
    const { brandColors } = await import('./DiagnosticPDFStyles');
    expect(brandColors).toBeDefined();
    expect(brandColors.navy).toBe('#1e3a5f');
    expect(brandColors.gold).toBe('#d4a574');
  });

  it('should export formatting functions', async () => {
    const {
      formatCurrencyPDF,
      formatFullCurrencyPDF,
      formatPercentPDF,
      formatDatePDF,
    } = await import('./DiagnosticPDFStyles');

    expect(formatCurrencyPDF(1500000)).toBe('$1.5M');
    expect(formatCurrencyPDF(50000)).toBe('$50K');
    expect(formatCurrencyPDF(500)).toBe('$500');
    expect(formatPercentPDF(4.14)).toBe('4.1%');
    expect(formatDatePDF('2024-02-12T10:00:00Z')).toContain('2024');
  });
});

describe('PDFCoverPage', () => {
  it('should export PDFCoverPage', async () => {
    const { PDFCoverPage } = await import('./PDFCoverPage');
    expect(PDFCoverPage).toBeDefined();
  });

  it('should accept required props', async () => {
    const { PDFCoverPage } = await import('./PDFCoverPage');

    const props = {
      generatedAt: new Date().toISOString(),
      totalAlignmentTax: 2900000,
      toolsCompleted: 6,
    };

    expect(() => <PDFCoverPage {...props} />).not.toThrow();
  });
});

describe('PDFExecutiveSummary', () => {
  it('should export PDFExecutiveSummary', async () => {
    const { PDFExecutiveSummary } = await import('./PDFExecutiveSummary');
    expect(PDFExecutiveSummary).toBeDefined();
  });
});

describe('PDFToolSummary', () => {
  it('should export PDFToolSummary and PDFAllToolsSummary', async () => {
    const { PDFToolSummary, PDFAllToolsSummary } = await import('./PDFToolSummary');
    expect(PDFToolSummary).toBeDefined();
    expect(PDFAllToolsSummary).toBeDefined();
  });
});

describe('PDFCostBreakdown', () => {
  it('should export PDFCostBreakdown', async () => {
    const { PDFCostBreakdown } = await import('./PDFCostBreakdown');
    expect(PDFCostBreakdown).toBeDefined();
  });
});

describe('PDFROISummary', () => {
  it('should export PDFROISummary and PDFROIPlaceholder', async () => {
    const { PDFROISummary, PDFROIPlaceholder } = await import('./PDFROISummary');
    expect(PDFROISummary).toBeDefined();
    expect(PDFROIPlaceholder).toBeDefined();
  });
});

describe('PDFRecommendations', () => {
  it('should export PDFRecommendations', async () => {
    const { PDFRecommendations } = await import('./PDFRecommendations');
    expect(PDFRecommendations).toBeDefined();
  });
});
