/**
 * PB1 Data Collection Tests
 *
 * Tests for collect-pb1-data.ts utility functions.
 *
 * Story 15.7: PB1 Data Migration to Database
 * Task 7.1: Unit tests for collect-pb1-data.ts
 *
 * @vitest-environment node
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock all Zustand stores before importing the collection module
vi.mock('@/lib/store/tool1-store', () => ({
  useTool1Store: {
    getState: vi.fn(),
  },
}));

vi.mock('@/lib/store/calculator-store', () => ({
  useCalculatorStore: {
    getState: vi.fn(),
  },
}));

vi.mock('@/lib/store/tool3-store', () => ({
  useTool3Store: {
    getState: vi.fn(),
  },
}));

vi.mock('@/lib/store/tool4-store', () => ({
  useTool4Store: {
    getState: vi.fn(),
  },
}));

vi.mock('@/lib/store/tool5-store', () => ({
  useTool5Store: {
    getState: vi.fn(),
  },
}));

vi.mock('@/lib/store/tool6-store', () => ({
  useTool6Store: {
    getState: vi.fn(),
  },
}));

vi.mock('@/lib/store/tool7-store', () => ({
  useTool7Store: {
    getState: vi.fn(),
  },
}));

import { useTool1Store } from '@/lib/store/tool1-store';
import { useCalculatorStore } from '@/lib/store/calculator-store';
import { useTool3Store } from '@/lib/store/tool3-store';
import { useTool4Store } from '@/lib/store/tool4-store';
import { useTool5Store } from '@/lib/store/tool5-store';
import { useTool6Store } from '@/lib/store/tool6-store';
import { useTool7Store } from '@/lib/store/tool7-store';
import {
  collectAllToolData,
  collectTool1Data,
  collectTool2Data,
  collectTool3Data,
  collectTool4Data,
  collectTool5Data,
  collectTool6Data,
  collectTool7Data,
  toSessionData,
} from '@/lib/migration/collect-pb1-data';

describe('collect-pb1-data', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default empty states
    vi.mocked(useTool1Store.getState).mockReturnValue({
      scores: {},
      completion: null,
      sessionId: null,
      isDirty: false,
    } as ReturnType<typeof useTool1Store.getState>);

    vi.mocked(useCalculatorStore.getState).mockReturnValue({
      meetingData: null,
      results: null,
      isCalculating: false,
      sessionId: null,
      isDirty: false,
      isSyncing: false,
    } as ReturnType<typeof useCalculatorStore.getState>);

    vi.mocked(useTool3Store.getState).mockReturnValue({
      archetypes: {
        budget: { archetypeId: 'budget', skipped: false, samples: [] },
        hiring: { archetypeId: 'hiring', skipped: false, samples: [] },
        strategy: { archetypeId: 'strategy', skipped: false, samples: [] },
        technical: { archetypeId: 'technical', skipped: false, samples: [] },
        policy: { archetypeId: 'policy', skipped: false, samples: [] },
        vendor: { archetypeId: 'vendor', skipped: false, samples: [] },
      },
      completion: null,
      sessionId: null,
      isDirty: false,
    } as unknown as ReturnType<typeof useTool3Store.getState>);

    vi.mocked(useTool4Store.getState).mockReturnValue({
      stakeholders: [],
      ownerAssignments: {},
      completion: null,
      sessionId: null,
      isDirty: false,
    } as unknown as ReturnType<typeof useTool4Store.getState>);

    vi.mocked(useTool5Store.getState).mockReturnValue({
      journeys: [],
      frictionPoints: [],
      activeJourneyId: null,
      completion: null,
      sessionId: null,
      isDirty: false,
      getEnterpriseTotalCost: () => 0,
    } as unknown as ReturnType<typeof useTool5Store.getState>);

    vi.mocked(useTool6Store.getState).mockReturnValue({
      email: null,
      chat: null,
      meetings: null,
      analysisResults: null,
      completion: null,
      sessionId: null,
      isDirty: false,
    } as ReturnType<typeof useTool6Store.getState>);

    vi.mocked(useTool7Store.getState).mockReturnValue({
      aggregatedData: null,
      calculationResults: null,
      completion: null,
      sessionId: null,
      isDirty: false,
      revenue: 0,
      additionalCosts: [],
      additionalCostsInput: { projectDelays: {}, rework: {}, turnover: {}, opportunityCost: {}, total: 0 },
      aggregationStatus: 'idle',
      aggregationError: null,
    } as unknown as ReturnType<typeof useTool7Store.getState>);
  });

  describe('collectTool1Data', () => {
    it('returns null when no scores exist', () => {
      const result = collectTool1Data();
      expect(result).toBeNull();
    });

    it('collects partial scores', () => {
      vi.mocked(useTool1Store.getState).mockReturnValue({
        scores: { strategic: 3, execution: 2 },
        completion: null,
        sessionId: null,
        isDirty: false,
      } as ReturnType<typeof useTool1Store.getState>);

      const result = collectTool1Data();

      expect(result).not.toBeNull();
      expect(result?.scores?.strategic).toBe(3);
      expect(result?.scores?.execution).toBe(2);
      expect(result?.scores?.technology).toBeUndefined();
    });

    it('collects complete scores with composite', () => {
      vi.mocked(useTool1Store.getState).mockReturnValue({
        scores: {
          strategic: 3,
          execution: 3,
          technology: 2,
          people: 4,
          governance: 3,
        },
        completion: {
          compositeScore: 2.9,
          completedAt: '2024-01-15T10:00:00Z',
        },
        sessionId: null,
        isDirty: false,
      } as ReturnType<typeof useTool1Store.getState>);

      const result = collectTool1Data();

      expect(result?.compositeScore).toBe(2.9);
      expect(result?.completedAt).toBe('2024-01-15T10:00:00Z');
    });
  });

  describe('collectTool2Data', () => {
    it('returns null when no meeting data exists', () => {
      const result = collectTool2Data();
      expect(result).toBeNull();
    });

    it('collects meeting data with results', () => {
      vi.mocked(useCalculatorStore.getState).mockReturnValue({
        meetingData: {
          meetingCount: 20,
          averageAttendees: 8,
          averageDuration: 60,
          salaryDistribution: { executive: 10, senior: 30, midLevel: 40, entry: 20 },
        },
        results: {
          meetingWaste: 150000,
          estimatedAlignmentTaxMin: 400000,
          estimatedAlignmentTaxMax: 600000,
          inputs: {
            meetingCount: 20,
            averageAttendees: 8,
            averageDuration: 60,
            salaryDistribution: { executive: 10, senior: 30, midLevel: 40, entry: 20 },
          },
          calculatedAt: '2024-01-15T10:00:00Z',
        },
        isCalculating: false,
        sessionId: null,
        isDirty: false,
        isSyncing: false,
      } as unknown as ReturnType<typeof useCalculatorStore.getState>);

      const result = collectTool2Data();

      expect(result?.inputs?.meetingCount).toBe(20);
      expect(result?.results?.wastedCost).toBe(150000);
      expect(result?.completedAt).toBe('2024-01-15T10:00:00Z');
    });
  });

  describe('collectTool3Data', () => {
    it('returns null when no samples exist', () => {
      const result = collectTool3Data();
      expect(result).toBeNull();
    });

    it('collects decision samples', () => {
      vi.mocked(useTool3Store.getState).mockReturnValue({
        archetypes: {
          budget: {
            archetypeId: 'budget',
            skipped: false,
            samples: [
              { id: '1', daysToDecision: 14, description: 'Test decision' },
            ],
          },
          hiring: { archetypeId: 'hiring', skipped: false, samples: [] },
          strategy: { archetypeId: 'strategy', skipped: false, samples: [] },
          technical: { archetypeId: 'technical', skipped: false, samples: [] },
          policy: { archetypeId: 'policy', skipped: false, samples: [] },
          vendor: { archetypeId: 'vendor', skipped: false, samples: [] },
        },
        completion: { completedAt: '2024-01-15T10:00:00Z' },
        sessionId: null,
        isDirty: false,
      } as unknown as ReturnType<typeof useTool3Store.getState>);

      const result = collectTool3Data();

      expect(result?.decisions).toHaveLength(1);
      expect(result?.completedAt).toBe('2024-01-15T10:00:00Z');
    });
  });

  describe('collectTool4Data', () => {
    it('returns null when no stakeholders exist', () => {
      const result = collectTool4Data();
      expect(result).toBeNull();
    });

    it('collects stakeholder data', () => {
      vi.mocked(useTool4Store.getState).mockReturnValue({
        stakeholders: [
          { id: '1', name: 'John CEO', role: 'CEO', power: 5, interest: 4 },
          { id: '2', name: 'Jane CTO', role: 'CTO', power: 4, interest: 5 },
        ],
        ownerAssignments: {},
        completion: { completedAt: '2024-01-15T10:00:00Z' },
        sessionId: null,
        isDirty: false,
      } as unknown as ReturnType<typeof useTool4Store.getState>);

      const result = collectTool4Data();

      expect(result?.stakeholders).toHaveLength(2);
      expect(result?.completedAt).toBe('2024-01-15T10:00:00Z');
    });
  });

  describe('collectTool5Data', () => {
    it('returns null when no journeys exist', () => {
      const result = collectTool5Data();
      expect(result).toBeNull();
    });

    it('collects journey data with friction cost', () => {
      vi.mocked(useTool5Store.getState).mockReturnValue({
        journeys: [
          { id: '1', name: 'Order Processing', stages: [] },
        ],
        frictionPoints: [],
        activeJourneyId: null,
        completion: { completedAt: '2024-01-15T10:00:00Z' },
        sessionId: null,
        isDirty: false,
        getEnterpriseTotalCost: () => 75000,
      } as unknown as ReturnType<typeof useTool5Store.getState>);

      const result = collectTool5Data();

      expect(result?.journeys).toHaveLength(1);
      expect(result?.frictionCost).toBe(75000);
    });
  });

  describe('collectTool6Data', () => {
    it('returns null when no metrics exist', () => {
      const result = collectTool6Data();
      expect(result).toBeNull();
    });

    it('collects communication metrics', () => {
      vi.mocked(useTool6Store.getState).mockReturnValue({
        email: { avgResponseTimeHours: 4, avgCcCount: 3 },
        chat: { afterHoursPercent: 15 },
        meetings: { infoCascadeMeetingsPerWeek: 3 },
        analysisResults: { results: [{ pattern: 'info-hoarding', severity: 'high' }] },
        completion: { completedAt: '2024-01-15T10:00:00Z' },
        sessionId: null,
        isDirty: false,
      } as unknown as ReturnType<typeof useTool6Store.getState>);

      const result = collectTool6Data();

      expect(result?.metrics).toBeDefined();
      expect(result?.antiPatterns).toHaveLength(1);
    });
  });

  describe('collectTool7Data', () => {
    it('returns null when no calculation results exist', () => {
      const result = collectTool7Data();
      expect(result).toBeNull();
    });

    it('collects total cost data', () => {
      vi.mocked(useTool7Store.getState).mockReturnValue({
        aggregatedData: { completedToolsCount: 5 },
        calculationResults: {
          totalAnnualCost: 500000,
          breakdown: [],
          confidenceLevel: 'medium',
          calculatedAt: '2024-01-15T10:00:00Z',
        },
        completion: { completedAt: '2024-01-15T10:00:00Z', totalCost: 500000, toolsIncluded: 5 },
        sessionId: null,
        isDirty: false,
        revenue: 10000000,
        additionalCosts: [],
        additionalCostsInput: { total: 0 },
        aggregationStatus: 'complete',
        aggregationError: null,
      } as unknown as ReturnType<typeof useTool7Store.getState>);

      const result = collectTool7Data();

      expect(result?.totalCost).toBe(500000);
      expect(result?.alignmentTaxPercent).toBe(5); // 500k / 10M = 5%
    });
  });

  describe('collectAllToolData', () => {
    it('returns hasData: false when all stores are empty', () => {
      const result = collectAllToolData();

      expect(result.hasData).toBe(false);
      expect(result.completedToolsCount).toBe(0);
      expect(result.tool1).toBeNull();
      expect(result.tool2).toBeNull();
    });

    it('collects data from multiple tools', () => {
      // Setup Tool 1 with data
      vi.mocked(useTool1Store.getState).mockReturnValue({
        scores: { strategic: 3, execution: 2, technology: 2, people: 3, governance: 3 },
        completion: { compositeScore: 2.6, completedAt: '2024-01-15T10:00:00Z' },
        sessionId: null,
        isDirty: false,
      } as ReturnType<typeof useTool1Store.getState>);

      // Setup Tool 2 with data
      vi.mocked(useCalculatorStore.getState).mockReturnValue({
        meetingData: {
          meetingCount: 20,
          averageAttendees: 8,
          averageDuration: 60,
          salaryDistribution: { executive: 10, senior: 30, midLevel: 40, entry: 20 },
        },
        results: {
          meetingWaste: 150000,
          inputs: { meetingCount: 20, averageAttendees: 8, averageDuration: 60, salaryDistribution: {} },
          calculatedAt: '2024-01-15T10:00:00Z',
        },
        isCalculating: false,
        sessionId: null,
        isDirty: false,
        isSyncing: false,
      } as unknown as ReturnType<typeof useCalculatorStore.getState>);

      const result = collectAllToolData();

      expect(result.hasData).toBe(true);
      expect(result.completedToolsCount).toBe(2);
      expect(result.tool1).not.toBeNull();
      expect(result.tool2).not.toBeNull();
      expect(result.tool3).toBeNull();
    });

    it('calculates totalAlignmentTax from Tool 7', () => {
      vi.mocked(useTool7Store.getState).mockReturnValue({
        aggregatedData: { completedToolsCount: 5 },
        calculationResults: { totalAnnualCost: 500000 },
        completion: { completedAt: '2024-01-15T10:00:00Z', totalCost: 500000 },
        sessionId: null,
        isDirty: false,
        revenue: 0,
        additionalCosts: [],
        additionalCostsInput: { total: 0 },
        aggregationStatus: 'complete',
        aggregationError: null,
      } as unknown as ReturnType<typeof useTool7Store.getState>);

      const result = collectAllToolData();

      expect(result.totalAlignmentTax).toBe(500000);
      expect(result.estimatedSavings).toBe(200000); // 40% of 500k
    });

    it('estimates totalAlignmentTax from Tool 2 when Tool 7 missing', () => {
      vi.mocked(useCalculatorStore.getState).mockReturnValue({
        meetingData: { meetingCount: 20 },
        results: { meetingWaste: 150000, calculatedAt: '2024-01-15T10:00:00Z' },
        isCalculating: false,
        sessionId: null,
        isDirty: false,
        isSyncing: false,
      } as unknown as ReturnType<typeof useCalculatorStore.getState>);

      const result = collectAllToolData();

      // 150000 / 0.275 = ~545454
      expect(result.totalAlignmentTax).toBeCloseTo(545454, -2);
    });
  });

  describe('toSessionData', () => {
    it('converts collected data to DiagnosticSessionData format', () => {
      const collected = {
        tool1: { scores: { strategic: 3 }, compositeScore: 3 },
        tool2: { inputs: { meetingCount: 20 }, results: { wastedCost: 150000 } },
        tool3: null,
        tool4: null,
        tool5: null,
        tool6: null,
        tool7: null,
        totalAlignmentTax: 500000,
        estimatedSavings: 200000,
        completedToolsCount: 2,
        hasData: true,
      };

      const result = toSessionData(collected);

      expect(result.tool1).toEqual({ scores: { strategic: 3 }, compositeScore: 3 });
      expect(result.tool2).toEqual({ inputs: { meetingCount: 20 }, results: { wastedCost: 150000 } });
      expect(result.tool3).toBeUndefined();
    });
  });
});
