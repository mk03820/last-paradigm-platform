/**
 * Aggregation Engine Unit Tests
 *
 * Story 14.1: Cross-Tool Data Aggregation
 * Task 8.1: Unit tests for aggregation-engine
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  aggregateFromTool1,
  aggregateFromTool2,
  aggregateFromTool3,
  aggregateFromTool4,
  aggregateFromTool5,
  aggregateFromTool6,
  aggregateAllTools,
  isToolComplete,
  getAllToolCompletionStatus,
} from './aggregation-engine';

// Mock the stores
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

// Import mocked stores
import { useTool1Store } from '@/lib/store/tool1-store';
import { useCalculatorStore } from '@/lib/store/calculator-store';
import { useTool3Store } from '@/lib/store/tool3-store';
import { useTool4Store } from '@/lib/store/tool4-store';
import { useTool5Store } from '@/lib/store/tool5-store';
import { useTool6Store } from '@/lib/store/tool6-store';

describe('Aggregation Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('aggregateFromTool1', () => {
    it('returns null when tool is not complete', () => {
      vi.mocked(useTool1Store.getState).mockReturnValue({
        scores: {},
        completion: null,
        isComplete: () => false,
      } as ReturnType<typeof useTool1Store.getState>);

      const result = aggregateFromTool1();
      expect(result).toBeNull();
    });

    it('returns aggregated data when tool is complete', () => {
      vi.mocked(useTool1Store.getState).mockReturnValue({
        scores: {
          strategic: 3,
          execution: 2,
          technology: 3,
          people: 3,
          governance: 2,
        },
        completion: {
          compositeScore: 2.6,
          completedAt: '2024-01-15T10:00:00Z',
        },
        isComplete: () => true,
      } as ReturnType<typeof useTool1Store.getState>);

      const result = aggregateFromTool1();
      expect(result).not.toBeNull();
      // Average of scores: (3+2+3+3+2)/5 = 2.6
      expect(result?.compositeScore).toBeCloseTo(2.6, 1);
      expect(result?.category).toBe('coordinated');
      expect(result?.completedAt).toBe('2024-01-15T10:00:00Z');
    });

    it('identifies weakest dimension correctly', () => {
      vi.mocked(useTool1Store.getState).mockReturnValue({
        scores: {
          strategic: 3,
          execution: 1, // Lowest
          technology: 3,
          people: 2,
          governance: 3,
        },
        completion: {
          compositeScore: 2.4,
          completedAt: '2024-01-15T10:00:00Z',
        },
        isComplete: () => true,
      } as ReturnType<typeof useTool1Store.getState>);

      const result = aggregateFromTool1();
      expect(result?.weakestDimension).toBe('Execution Alignment');
    });
  });

  describe('aggregateFromTool2', () => {
    it('returns null when tool has no results', () => {
      vi.mocked(useCalculatorStore.getState).mockReturnValue({
        meetingData: null,
        results: null,
      } as ReturnType<typeof useCalculatorStore.getState>);

      const result = aggregateFromTool2();
      expect(result).toBeNull();
    });

    it('returns aggregated data when tool has results', () => {
      vi.mocked(useCalculatorStore.getState).mockReturnValue({
        meetingData: {
          meetingCount: 20,
          averageDuration: 1,
          averageAttendees: 5,
        },
        results: {
          meetingWaste: 1200000,
          calculatedAt: '2024-01-15T10:00:00Z',
        },
      } as ReturnType<typeof useCalculatorStore.getState>);

      const result = aggregateFromTool2();
      expect(result).not.toBeNull();
      expect(result?.annualizedWaste).toBe(1200000);
      expect(result?.meetingsPerWeek).toBe(20);
      expect(result?.totalAttendeeHours).toBe(100); // 20 * 1 * 5
    });
  });

  describe('aggregateFromTool3', () => {
    it('returns null when tool is not complete', () => {
      vi.mocked(useTool3Store.getState).mockReturnValue({
        archetypes: {},
        completion: null,
      } as ReturnType<typeof useTool3Store.getState>);

      const result = aggregateFromTool3();
      expect(result).toBeNull();
    });

    it('calculates average latency from samples', () => {
      const today = new Date();
      const tenDaysAgo = new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000);
      const twentyDaysAgo = new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000);

      vi.mocked(useTool3Store.getState).mockReturnValue({
        archetypes: {
          strategic: {
            archetypeId: 'strategic',
            skipped: false,
            samples: [
              {
                id: '1',
                requestDate: twentyDaysAgo.toISOString(),
                decisionDate: tenDaysAgo.toISOString(),
                description: 'Test',
              },
            ],
          },
        },
        completion: {
          completedAt: '2024-01-15T10:00:00Z',
        },
      } as unknown as ReturnType<typeof useTool3Store.getState>);

      const result = aggregateFromTool3();
      expect(result).not.toBeNull();
      expect(result?.avgDecisionLatencyDays).toBeCloseTo(10, 0);
      expect(result?.decisionTypeCount).toBe(1);
    });
  });

  describe('aggregateFromTool4', () => {
    it('returns null when tool is not complete', () => {
      vi.mocked(useTool4Store.getState).mockReturnValue({
        stakeholders: [],
        completion: null,
        getQuadrantCounts: () => ({}),
      } as unknown as ReturnType<typeof useTool4Store.getState>);

      const result = aggregateFromTool4();
      expect(result).toBeNull();
    });

    it('returns aggregated stakeholder data', () => {
      vi.mocked(useTool4Store.getState).mockReturnValue({
        stakeholders: [
          { id: '1', name: 'Alice' },
          { id: '2', name: 'Bob' },
          { id: '3', name: 'Carol' },
        ],
        completion: {
          completedAt: '2024-01-15T10:00:00Z',
        },
        getQuadrantCounts: () => ({
          key_players: 2,
          keep_satisfied: 1,
          keep_informed: 0,
          monitor: 0,
        }),
      } as unknown as ReturnType<typeof useTool4Store.getState>);

      const result = aggregateFromTool4();
      expect(result).not.toBeNull();
      expect(result?.stakeholderCount).toBe(3);
      expect(result?.keyPlayerCount).toBe(2);
      expect(result?.blockerCount).toBe(1);
    });

    it('determines risk level based on blocker ratio', () => {
      // High risk: >30% blockers
      vi.mocked(useTool4Store.getState).mockReturnValue({
        stakeholders: [{ id: '1' }, { id: '2' }, { id: '3' }],
        completion: { completedAt: '2024-01-15T10:00:00Z' },
        getQuadrantCounts: () => ({
          key_players: 0,
          keep_satisfied: 2, // 66% blockers
          keep_informed: 0,
          monitor: 1,
        }),
      } as unknown as ReturnType<typeof useTool4Store.getState>);

      const result = aggregateFromTool4();
      expect(result?.riskLevel).toBe('high');
    });
  });

  describe('aggregateFromTool5', () => {
    it('returns null when tool is not complete', () => {
      vi.mocked(useTool5Store.getState).mockReturnValue({
        journeys: [],
        frictionPoints: [],
        completion: null,
        getEnterpriseTotalCost: () => 0,
      } as unknown as ReturnType<typeof useTool5Store.getState>);

      const result = aggregateFromTool5();
      expect(result).toBeNull();
    });

    it('returns aggregated friction data', () => {
      vi.mocked(useTool5Store.getState).mockReturnValue({
        journeys: [{ id: '1' }, { id: '2' }],
        frictionPoints: [
          { id: 'f1', severity: { frequency: 3, effort: 3, impact: 3 } }, // total 9 = critical
          { id: 'f2', severity: { frequency: 3, effort: 2, impact: 2 } }, // total 7 = high
          { id: 'f3', severity: { frequency: 2, effort: 2, impact: 2 } }, // total 6 = not critical
        ],
        completion: {
          completedAt: '2024-01-15T10:00:00Z',
        },
        getEnterpriseTotalCost: () => 450000,
      } as unknown as ReturnType<typeof useTool5Store.getState>);

      const result = aggregateFromTool5();
      expect(result).not.toBeNull();
      expect(result?.totalFrictionCost).toBe(450000);
      expect(result?.journeyCount).toBe(2);
      expect(result?.frictionPointCount).toBe(3);
      expect(result?.criticalFrictionCount).toBe(2); // total >= 7
    });
  });

  describe('aggregateFromTool6', () => {
    it('returns null when tool is not complete', () => {
      vi.mocked(useTool6Store.getState).mockReturnValue({
        analysisResults: null,
        completion: null,
      } as unknown as ReturnType<typeof useTool6Store.getState>);

      const result = aggregateFromTool6();
      expect(result).toBeNull();
    });

    it('calculates health score from pattern analysis', () => {
      vi.mocked(useTool6Store.getState).mockReturnValue({
        analysisResults: {
          results: [
            { patternId: 'p1', detected: true, severity: 'high' },
            { patternId: 'p2', detected: true, severity: 'medium' },
            { patternId: 'p3', detected: false, severity: 'none' },
          ],
          detectedCount: 2,
        },
        completion: {
          completedAt: '2024-01-15T10:00:00Z',
        },
      } as unknown as ReturnType<typeof useTool6Store.getState>);

      const result = aggregateFromTool6();
      expect(result).not.toBeNull();
      expect(result?.patternsDetected).toBe(2);
      expect(result?.healthScore).toBeLessThan(100);
      expect(result?.healthStatus).toBe('warning');
    });
  });

  describe('aggregateAllTools', () => {
    it('aggregates all tools and sets canProceed based on Tool 2', () => {
      // Mock all stores as not complete
      vi.mocked(useTool1Store.getState).mockReturnValue({
        scores: {},
        completion: null,
        isComplete: () => false,
      } as ReturnType<typeof useTool1Store.getState>);

      vi.mocked(useCalculatorStore.getState).mockReturnValue({
        meetingData: { meetingCount: 10, averageDuration: 1, averageAttendees: 5 },
        results: { meetingWaste: 500000, calculatedAt: '2024-01-15T10:00:00Z' },
      } as ReturnType<typeof useCalculatorStore.getState>);

      vi.mocked(useTool3Store.getState).mockReturnValue({
        archetypes: {},
        completion: null,
      } as ReturnType<typeof useTool3Store.getState>);

      vi.mocked(useTool4Store.getState).mockReturnValue({
        stakeholders: [],
        completion: null,
        getQuadrantCounts: () => ({}),
      } as unknown as ReturnType<typeof useTool4Store.getState>);

      vi.mocked(useTool5Store.getState).mockReturnValue({
        journeys: [],
        frictionPoints: [],
        completion: null,
        getEnterpriseTotalCost: () => 0,
      } as unknown as ReturnType<typeof useTool5Store.getState>);

      vi.mocked(useTool6Store.getState).mockReturnValue({
        analysisResults: null,
        completion: null,
      } as unknown as ReturnType<typeof useTool6Store.getState>);

      const result = aggregateAllTools();

      expect(result.tool1).toBeNull();
      expect(result.tool2).not.toBeNull();
      expect(result.tool3).toBeNull();
      expect(result.completedToolsCount).toBe(1);
      expect(result.canProceed).toBe(true); // Tool 2 is complete
      expect(result.aggregatedAt).toBeDefined();
    });

    it('sets canProceed to false when Tool 2 is incomplete', () => {
      vi.mocked(useTool1Store.getState).mockReturnValue({
        scores: {},
        completion: null,
        isComplete: () => false,
      } as ReturnType<typeof useTool1Store.getState>);

      vi.mocked(useCalculatorStore.getState).mockReturnValue({
        meetingData: null,
        results: null,
      } as ReturnType<typeof useCalculatorStore.getState>);

      vi.mocked(useTool3Store.getState).mockReturnValue({
        archetypes: {},
        completion: null,
      } as ReturnType<typeof useTool3Store.getState>);

      vi.mocked(useTool4Store.getState).mockReturnValue({
        stakeholders: [],
        completion: null,
        getQuadrantCounts: () => ({}),
      } as unknown as ReturnType<typeof useTool4Store.getState>);

      vi.mocked(useTool5Store.getState).mockReturnValue({
        journeys: [],
        frictionPoints: [],
        completion: null,
        getEnterpriseTotalCost: () => 0,
      } as unknown as ReturnType<typeof useTool5Store.getState>);

      vi.mocked(useTool6Store.getState).mockReturnValue({
        analysisResults: null,
        completion: null,
      } as unknown as ReturnType<typeof useTool6Store.getState>);

      const result = aggregateAllTools();

      expect(result.canProceed).toBe(false);
      expect(result.completedToolsCount).toBe(0);
    });
  });

  describe('isToolComplete', () => {
    it('returns correct status for each tool', () => {
      // Setup Tool 2 as complete
      vi.mocked(useCalculatorStore.getState).mockReturnValue({
        meetingData: { meetingCount: 10, averageDuration: 1, averageAttendees: 5 },
        results: { meetingWaste: 500000, calculatedAt: '2024-01-15T10:00:00Z' },
      } as ReturnType<typeof useCalculatorStore.getState>);

      // Setup other tools as incomplete
      vi.mocked(useTool1Store.getState).mockReturnValue({
        scores: {},
        completion: null,
        isComplete: () => false,
      } as ReturnType<typeof useTool1Store.getState>);

      expect(isToolComplete(1)).toBe(false);
      expect(isToolComplete(2)).toBe(true);
      expect(isToolComplete(99)).toBe(false); // Invalid tool number
    });
  });

  describe('getAllToolCompletionStatus', () => {
    it('returns status for all 6 tools', () => {
      // Setup mocks
      vi.mocked(useTool1Store.getState).mockReturnValue({
        scores: {},
        completion: null,
        isComplete: () => false,
      } as ReturnType<typeof useTool1Store.getState>);

      vi.mocked(useCalculatorStore.getState).mockReturnValue({
        meetingData: { meetingCount: 10, averageDuration: 1, averageAttendees: 5 },
        results: { meetingWaste: 500000, calculatedAt: '2024-01-15T10:00:00Z' },
      } as ReturnType<typeof useCalculatorStore.getState>);

      vi.mocked(useTool3Store.getState).mockReturnValue({
        archetypes: {},
        completion: null,
      } as ReturnType<typeof useTool3Store.getState>);

      vi.mocked(useTool4Store.getState).mockReturnValue({
        stakeholders: [],
        completion: null,
        getQuadrantCounts: () => ({}),
      } as unknown as ReturnType<typeof useTool4Store.getState>);

      vi.mocked(useTool5Store.getState).mockReturnValue({
        journeys: [],
        frictionPoints: [],
        completion: null,
        getEnterpriseTotalCost: () => 0,
      } as unknown as ReturnType<typeof useTool5Store.getState>);

      vi.mocked(useTool6Store.getState).mockReturnValue({
        analysisResults: null,
        completion: null,
      } as unknown as ReturnType<typeof useTool6Store.getState>);

      const status = getAllToolCompletionStatus();

      expect(status).toHaveProperty('1');
      expect(status).toHaveProperty('2');
      expect(status).toHaveProperty('3');
      expect(status).toHaveProperty('4');
      expect(status).toHaveProperty('5');
      expect(status).toHaveProperty('6');
      expect(status[2]).toBe(true);
      expect(status[1]).toBe(false);
    });
  });
});
