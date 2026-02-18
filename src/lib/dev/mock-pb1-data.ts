/**
 * Mock PB1 Data for Dev Preview
 *
 * Provides realistic mock diagnostic data for testing the Phase 3 preview experience
 * without completing all 7 diagnostic tools.
 *
 * Story: Hidden Dev Link to Preview Page with Mock Data
 * Task 2: Create mock data seeding utility
 */

import { useTool1Store } from '@/lib/store/tool1-store';
import { useCalculatorStore } from '@/lib/store/calculator-store';
import { useTool3Store } from '@/lib/store/tool3-store';
import { useTool4Store } from '@/lib/store/tool4-store';
import { useTool5Store } from '@/lib/store/tool5-store';
import { useTool6Store } from '@/lib/store/tool6-store';
import { useTool7Store } from '@/lib/store/tool7-store';

/**
 * Mock data profile from story specification:
 *
 * | Tool | Mock Values |
 * |------|-------------|
 * | Tool 1: Alignment | Composite: 2.4/4.0 (Strategic: 3, Execution: 2, Tech: 2, People: 3, Governance: 2) |
 * | Tool 2: Meeting Audit | 12 meetings/week, $340K annual waste |
 * | Tool 3: Decision Velocity | Median 14 days (benchmark: 5), bottleneck: "Approval Gridlock" |
 * | Tool 4: Stakeholders | 8 stakeholders, 2 high-power blockers |
 * | Tool 5: Data Friction | $215K annual friction cost, 3 critical bottlenecks |
 * | Tool 6: Communication | Health score: 42/100, 3 anti-patterns detected |
 * | Tool 7: Total Cost | $1.2M alignment tax (8.4% of revenue), $847K estimated savings |
 */

// ============================================================================
// Mock Data Constants
// ============================================================================

export const MOCK_TOOL1_DATA = {
  scores: {
    strategic: 3,
    execution: 2,
    technology: 2,
    people: 3,
    governance: 2,
  },
  compositeScore: 2.4,
};

export const MOCK_TOOL2_DATA = {
  meetingData: {
    meetingCount: 12, // 12 meetings/week
    averageAttendees: 6,
    averageDuration: 60, // minutes
    salaryDistribution: {
      executive: 10, // 10%
      senior: 25,    // 25%
      midLevel: 40,  // 40%
      entry: 25,     // 25%
    },
  },
  results: {
    meetingWaste: 340000, // $340K annual waste
    estimatedAlignmentTaxMin: 1000000,
    estimatedAlignmentTaxMax: 1400000,
    calculatedAt: new Date().toISOString(),
  },
};

export const MOCK_TOOL3_DATA = {
  // Tool 3 uses archetypes: strategic, budget, technology, hiring, analytics
  // Each sample needs requestDate and decisionDate
  samples: [
    {
      archetypeId: 'strategic' as const,
      description: 'Product feature prioritization',
      requestDate: '2025-01-01',
      decisionDate: '2025-01-22', // 21 days
    },
    {
      archetypeId: 'budget' as const,
      description: 'Budget reallocation request',
      requestDate: '2025-01-05',
      decisionDate: '2025-01-19', // 14 days
    },
    {
      archetypeId: 'technology' as const,
      description: 'Vendor tech selection',
      requestDate: '2025-01-10',
      decisionDate: '2025-01-28', // 18 days
    },
    {
      archetypeId: 'hiring' as const,
      description: 'Team resource allocation',
      requestDate: '2025-01-12',
      decisionDate: '2025-01-22', // 10 days
    },
  ],
  metrics: {
    medianDays: 14,
    benchmark: 5,
    bottleneck: 'Approval Gridlock',
  },
};

export const MOCK_TOOL4_DATA = {
  // Valid sentiments: 'supporter' | 'neutral' | 'blocker'
  stakeholders: [
    { name: 'Alex Johnson', role: 'CEO', power: 9, interest: 8, sentiment: 'supporter' as const },
    { name: 'Sarah Chen', role: 'CFO', power: 8, interest: 5, sentiment: 'neutral' as const },
    { name: 'Michael Park', role: 'CTO', power: 8, interest: 9, sentiment: 'supporter' as const },
    { name: 'Jennifer Mills', role: 'VP Operations', power: 6, interest: 7, sentiment: 'blocker' as const },
    { name: 'David Roberts', role: 'Legal Director', power: 7, interest: 4, sentiment: 'blocker' as const },
    { name: 'Maria Garcia', role: 'HR Director', power: 5, interest: 6, sentiment: 'neutral' as const },
    { name: 'Robert Kim', role: 'IT Director', power: 5, interest: 8, sentiment: 'supporter' as const },
    { name: 'Lisa Brown', role: 'Sales Director', power: 6, interest: 5, sentiment: 'neutral' as const },
  ],
};

export const MOCK_TOOL5_DATA = {
  // DataStage requires: type, systemName, owner, latency, latencyUnit, order
  // StageType: 'source' | 'extraction' | 'storage' | 'transformation' | 'consumption'
  journeys: [
    {
      name: 'Customer onboarding data flow',
      description: 'End-to-end customer data integration',
      stages: [
        { type: 'source' as const, systemName: 'CRM', owner: 'Sales Team', latency: 2, latencyUnit: 'hours' as const, order: 1 },
        { type: 'transformation' as const, systemName: 'ETL Pipeline', owner: 'Data Engineering', latency: 4, latencyUnit: 'hours' as const, order: 2 },
        { type: 'storage' as const, systemName: 'Data Warehouse', owner: 'Data Engineering', latency: 1, latencyUnit: 'hours' as const, order: 3 },
      ],
    },
    {
      name: 'Financial reporting pipeline',
      description: 'Monthly financial data consolidation',
      stages: [
        { type: 'source' as const, systemName: 'ERP System', owner: 'Finance', latency: 8, latencyUnit: 'hours' as const, order: 1 },
        { type: 'transformation' as const, systemName: 'Finance App', owner: 'Finance', latency: 4, latencyUnit: 'hours' as const, order: 2 },
        { type: 'consumption' as const, systemName: 'BI Tool', owner: 'Executive Team', latency: 2, latencyUnit: 'hours' as const, order: 3 },
      ],
    },
    {
      name: 'Inventory sync process',
      description: 'Real-time inventory updates across systems',
      stages: [
        { type: 'source' as const, systemName: 'POS System', owner: 'Operations', latency: 30, latencyUnit: 'hours' as const, order: 1 },
        { type: 'storage' as const, systemName: 'Inventory DB', owner: 'IT', latency: 1, latencyUnit: 'hours' as const, order: 2 },
      ],
    },
  ],
  frictionCost: 215000, // $215K annual friction cost
};

export const MOCK_TOOL6_DATA = {
  // EmailMetrics: distributionListCount, avgListSize, replyAllFrequency, urgentResponseTimeHours
  email: {
    distributionListCount: 25,
    avgListSize: 40,
    replyAllFrequency: 'often' as const,
    urgentResponseTimeHours: 4,
  },
  // ChatMetrics: activeChannels, dmRatioPercent, atHereFrequency, crossChannelRedundancyPercent
  chat: {
    activeChannels: 35,
    dmRatioPercent: 40,
    atHereFrequency: 'sometimes' as const,
    crossChannelRedundancyPercent: 35,
  },
  // MeetingMetrics: infoCascadeMeetingsPerWeek, decisionDocumentationRatePercent, pulledFromTool2
  meetings: {
    infoCascadeMeetingsPerWeek: 8,
    decisionDocumentationRatePercent: 25,
    pulledFromTool2: false,
  },
  healthScore: 42,
  antiPatterns: [
    { pattern: 'Meeting Culture', severity: 'high' },
    { pattern: 'Email Overload', severity: 'medium' },
    { pattern: 'Siloed Information', severity: 'high' },
  ],
};

export const MOCK_TOOL7_DATA = {
  totalAlignmentTax: 1200000, // $1.2M
  alignmentTaxPercent: 8.4,
  estimatedSavings: 847000, // $847K
  revenue: 14285714, // ~$14.3M (to get 8.4% alignment tax)
  // CostBreakdown: category (CostCategory), label, amount, source
  costBreakdown: [
    { category: 'meeting-waste' as const, label: 'Meeting Waste', amount: 340000, source: 'Tool 2' },
    { category: 'decision-latency' as const, label: 'Decision Delays', amount: 285000, source: 'Tool 3' },
    { category: 'data-friction' as const, label: 'Data Friction', amount: 215000, source: 'Tool 5' },
    { category: 'communication-overhead' as const, label: 'Communication Overhead', amount: 180000, source: 'Tool 6' },
    { category: 'additional-manual' as const, label: 'Alignment Gaps', amount: 180000, source: 'Tool 1' },
  ],
};

// ============================================================================
// Seeding Functions
// ============================================================================

/**
 * Seed Tool 1 store with mock alignment assessment data
 */
export function seedTool1(): void {
  const store = useTool1Store.getState();
  store.setScores(MOCK_TOOL1_DATA.scores);
  store.markComplete(MOCK_TOOL1_DATA.compositeScore);
}

/**
 * Seed Tool 2 (Calculator) store with mock meeting audit data
 */
export function seedTool2(): void {
  const store = useCalculatorStore.getState();
  store.setMeetingData(MOCK_TOOL2_DATA.meetingData);
  store.setResults({
    ...MOCK_TOOL2_DATA.results,
    inputs: MOCK_TOOL2_DATA.meetingData,
  });
}

/**
 * Seed Tool 3 store with mock decision velocity data
 */
export function seedTool3(): void {
  const store = useTool3Store.getState();
  // Tool 3 uses archetypes - add samples to each archetype
  MOCK_TOOL3_DATA.samples.forEach((sample) => {
    store.addSample(sample.archetypeId, {
      description: sample.description,
      requestDate: sample.requestDate,
      decisionDate: sample.decisionDate,
    });
  });
  store.markComplete();
}

/**
 * Seed Tool 4 store with mock stakeholder data
 */
export function seedTool4(): void {
  const store = useTool4Store.getState();
  MOCK_TOOL4_DATA.stakeholders.forEach((stakeholder) => {
    store.addStakeholder(stakeholder);
  });
  store.markComplete();
}

/**
 * Seed Tool 5 store with mock data friction data
 */
export function seedTool5(): void {
  const store = useTool5Store.getState();
  MOCK_TOOL5_DATA.journeys.forEach((journey) => {
    // Cast stages - the store generates IDs internally
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    store.addJourney(journey as any);
  });
  store.markComplete();
}

/**
 * Seed Tool 6 store with mock communication data
 */
export function seedTool6(): void {
  const store = useTool6Store.getState();
  store.setEmailMetrics(MOCK_TOOL6_DATA.email);
  store.setChatMetrics(MOCK_TOOL6_DATA.chat);
  store.setMeetingMetrics(MOCK_TOOL6_DATA.meetings);
  store.markComplete();
}

/**
 * Seed Tool 7 store with mock total cost data
 */
export function seedTool7(): void {
  const store = useTool7Store.getState();
  store.setRevenue(MOCK_TOOL7_DATA.revenue);
  store.setCalculationResults({
    totalAnnualCost: MOCK_TOOL7_DATA.totalAlignmentTax,
    breakdown: MOCK_TOOL7_DATA.costBreakdown,
    confidenceLevel: 'high',
    calculatedAt: new Date().toISOString(),
  });
  store.markComplete(MOCK_TOOL7_DATA.totalAlignmentTax, 7);
}

/**
 * Seed all PB1 tool stores with realistic mock data
 *
 * Call this function in the dev preview page to populate
 * all Zustand stores with mock diagnostic data.
 */
export function seedMockPB1Data(): void {
  seedTool1();
  seedTool2();
  seedTool3();
  seedTool4();
  seedTool5();
  seedTool6();
  seedTool7();
}

/**
 * Get mock diagnostic data in the format expected by the preview page
 *
 * This returns the data structure that would normally come from
 * the database after migration.
 */
export function getMockDiagnosticData() {
  return {
    totalAlignmentTax: MOCK_TOOL7_DATA.totalAlignmentTax,
    estimatedSavings: MOCK_TOOL7_DATA.estimatedSavings,
    percentOfRevenue: MOCK_TOOL7_DATA.alignmentTaxPercent,
    toolResults: {
      tool1: {
        scores: MOCK_TOOL1_DATA.scores,
        compositeScore: MOCK_TOOL1_DATA.compositeScore,
        completedAt: new Date().toISOString(),
      },
      tool2: {
        inputs: MOCK_TOOL2_DATA.meetingData,
        results: MOCK_TOOL2_DATA.results,
        completedAt: new Date().toISOString(),
      },
      tool3: {
        samples: MOCK_TOOL3_DATA.samples,
        metrics: MOCK_TOOL3_DATA.metrics,
        completedAt: new Date().toISOString(),
      },
      tool4: {
        stakeholders: MOCK_TOOL4_DATA.stakeholders,
        completedAt: new Date().toISOString(),
      },
      tool5: {
        journeys: MOCK_TOOL5_DATA.journeys,
        frictionCost: MOCK_TOOL5_DATA.frictionCost,
        completedAt: new Date().toISOString(),
      },
      tool6: {
        email: MOCK_TOOL6_DATA.email,
        chat: MOCK_TOOL6_DATA.chat,
        meetings: MOCK_TOOL6_DATA.meetings,
        healthScore: MOCK_TOOL6_DATA.healthScore,
        antiPatterns: MOCK_TOOL6_DATA.antiPatterns,
        completedAt: new Date().toISOString(),
      },
      tool7: {
        totalCost: MOCK_TOOL7_DATA.totalAlignmentTax,
        alignmentTaxPercent: MOCK_TOOL7_DATA.alignmentTaxPercent,
        completedAt: new Date().toISOString(),
      },
    },
  };
}
