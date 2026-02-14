/**
 * Recommendation Scoring Tests
 *
 * Story 16.2: Tool Recommendation Algorithm
 * Task 8.3: Unit tests for recommendation-scoring.ts
 */

import { describe, it, expect } from 'vitest';
import {
  calculateSeverityScore,
  calculatePercentageSeverityScore,
  calculateCountSeverityScore,
  determinePriority,
  rankRecommendations,
  filterByMinimumSeverity,
  needsFallbackRecommendation,
} from './recommendation-scoring';
import {
  MAX_SEVERITY_SCORE,
  ROI_DASHBOARD_TOOL_ID,
} from './recommendation-constants';
import { getPB2Tool } from './tool-catalog';
import type { ToolRecommendation } from './types';

describe('Recommendation Scoring', () => {
  describe('calculateSeverityScore', () => {
    it('should return 0 when actual is below threshold', () => {
      expect(calculateSeverityScore(10, 14, 7)).toBe(0);
    });

    it('should return 0 when actual equals threshold', () => {
      expect(calculateSeverityScore(14, 14, 7)).toBe(0);
    });

    it('should calculate severity correctly when above threshold', () => {
      // (28 - 14) / 7 = 2.0
      expect(calculateSeverityScore(28, 14, 7)).toBe(2);
    });

    it('should handle different benchmark values', () => {
      // (20 - 10) / 5 = 2.0
      expect(calculateSeverityScore(20, 10, 5)).toBe(2);
    });

    it('should cap at MAX_SEVERITY_SCORE', () => {
      // Very high actual should cap at MAX_SEVERITY_SCORE
      expect(calculateSeverityScore(1000, 14, 7)).toBe(MAX_SEVERITY_SCORE);
    });

    it('should return 0 for zero benchmark', () => {
      expect(calculateSeverityScore(100, 50, 0)).toBe(0);
    });

    it('should return 0 for negative benchmark', () => {
      expect(calculateSeverityScore(100, 50, -10)).toBe(0);
    });
  });

  describe('calculatePercentageSeverityScore', () => {
    it('should return 0 when actual is below threshold', () => {
      expect(calculatePercentageSeverityScore(25, 30)).toBe(0);
    });

    it('should return 0 when actual equals threshold', () => {
      expect(calculatePercentageSeverityScore(30, 30)).toBe(0);
    });

    it('should calculate severity for percentage above threshold', () => {
      // (45 - 30) / 100 * 10 = 1.5
      const result = calculatePercentageSeverityScore(45, 30);
      expect(result).toBeCloseTo(1.5);
    });

    it('should cap at MAX_SEVERITY_SCORE', () => {
      const result = calculatePercentageSeverityScore(200, 30);
      expect(result).toBe(MAX_SEVERITY_SCORE);
    });
  });

  describe('calculateCountSeverityScore', () => {
    it('should return 0 when count is below threshold', () => {
      expect(calculateCountSeverityScore(0, 1)).toBe(0);
    });

    it('should return 1.0 for exactly threshold count', () => {
      expect(calculateCountSeverityScore(1, 1)).toBe(1.0);
    });

    it('should increase severity for each additional blocker', () => {
      // 1 blocker = 1.0, 2 blockers = 1.5
      expect(calculateCountSeverityScore(2, 1)).toBe(1.5);
      // 3 blockers = 2.0
      expect(calculateCountSeverityScore(3, 1)).toBe(2.0);
    });

    it('should cap at MAX_SEVERITY_SCORE', () => {
      const result = calculateCountSeverityScore(100, 1);
      expect(result).toBe(MAX_SEVERITY_SCORE);
    });
  });

  describe('determinePriority', () => {
    it('should return critical for severity >= 2.0', () => {
      expect(determinePriority(2.0)).toBe('critical');
      expect(determinePriority(3.5)).toBe('critical');
    });

    it('should return high for severity >= 1.0 and < 2.0', () => {
      expect(determinePriority(1.0)).toBe('high');
      expect(determinePriority(1.5)).toBe('high');
      expect(determinePriority(1.99)).toBe('high');
    });

    it('should return moderate for severity < 1.0', () => {
      expect(determinePriority(0)).toBe('moderate');
      expect(determinePriority(0.5)).toBe('moderate');
      expect(determinePriority(0.99)).toBe('moderate');
    });
  });

  describe('rankRecommendations', () => {
    function createMockRecommendation(
      toolId: number,
      severityScore: number
    ): ToolRecommendation {
      const tool = getPB2Tool(toolId)!;
      return {
        rank: 0,
        toolId,
        tool,
        reasoning: 'Test reasoning',
        triggerMetric: 'Test metric',
        triggerValue: 'Test value',
        severityScore,
        priority: determinePriority(severityScore),
      };
    }

    it('should rank by severity score descending', () => {
      const recommendations = [
        createMockRecommendation(3, 1.0),
        createMockRecommendation(4, 3.0),
        createMockRecommendation(6, 2.0),
      ];

      const ranked = rankRecommendations(recommendations);

      expect(ranked[0].toolId).toBe(4); // Highest severity
      expect(ranked[1].toolId).toBe(6);
      expect(ranked[2].toolId).toBe(3); // Lowest severity
    });

    it('should assign ranks 1, 2, 3', () => {
      const recommendations = [
        createMockRecommendation(3, 2.0),
        createMockRecommendation(4, 1.0),
        createMockRecommendation(6, 3.0),
      ];

      const ranked = rankRecommendations(recommendations);

      expect(ranked[0].rank).toBe(1);
      expect(ranked[1].rank).toBe(2);
      expect(ranked[2].rank).toBe(3);
    });

    it('should take only top 3 when more recommendations exist', () => {
      const recommendations = [
        createMockRecommendation(2, 1.0),
        createMockRecommendation(3, 2.0),
        createMockRecommendation(4, 3.0),
        createMockRecommendation(6, 4.0),
      ];

      const ranked = rankRecommendations(recommendations);

      expect(ranked).toHaveLength(3);
      expect(ranked.map((r) => r.toolId)).toEqual([6, 4, 3]);
    });

    it('should always place ROI Dashboard last (fallback)', () => {
      const recommendations = [
        createMockRecommendation(ROI_DASHBOARD_TOOL_ID, 5.0), // High severity
        createMockRecommendation(3, 1.0), // Low severity
      ];

      const ranked = rankRecommendations(recommendations);

      expect(ranked[0].toolId).toBe(3);
      expect(ranked[1].toolId).toBe(ROI_DASHBOARD_TOOL_ID);
    });

    it('should prefer spreadsheet outputs on tie', () => {
      const recommendations = [
        createMockRecommendation(4, 2.0), // Meeting Protocol (.docx)
        createMockRecommendation(3, 2.0), // Delegation Framework (.xlsx)
      ];

      const ranked = rankRecommendations(recommendations);

      // Tool 3 has .xlsx output, should come first
      expect(ranked[0].toolId).toBe(3);
      expect(ranked[1].toolId).toBe(4);
    });

    it('should handle empty array', () => {
      const ranked = rankRecommendations([]);
      expect(ranked).toHaveLength(0);
    });

    it('should handle single recommendation', () => {
      const recommendations = [createMockRecommendation(3, 2.0)];
      const ranked = rankRecommendations(recommendations);

      expect(ranked).toHaveLength(1);
      expect(ranked[0].rank).toBe(1);
    });
  });

  describe('filterByMinimumSeverity', () => {
    function createMockRecommendation(
      toolId: number,
      severityScore: number
    ): ToolRecommendation {
      const tool = getPB2Tool(toolId)!;
      return {
        rank: 0,
        toolId,
        tool,
        reasoning: 'Test',
        triggerMetric: 'Test',
        triggerValue: 'Test',
        severityScore,
        priority: determinePriority(severityScore),
      };
    }

    it('should filter out recommendations below minimum severity', () => {
      const recommendations = [
        createMockRecommendation(3, 0.5),
        createMockRecommendation(4, 1.5),
        createMockRecommendation(6, 2.5),
      ];

      const filtered = filterByMinimumSeverity(recommendations, 1.0);

      expect(filtered).toHaveLength(2);
      expect(filtered.map((r) => r.toolId)).toEqual([4, 6]);
    });

    it('should include recommendations at exactly minimum severity', () => {
      const recommendations = [createMockRecommendation(3, 1.0)];

      const filtered = filterByMinimumSeverity(recommendations, 1.0);

      expect(filtered).toHaveLength(1);
    });

    it('should return all with minimum severity 0', () => {
      const recommendations = [
        createMockRecommendation(3, 0),
        createMockRecommendation(4, 0.5),
      ];

      const filtered = filterByMinimumSeverity(recommendations, 0);

      expect(filtered).toHaveLength(2);
    });
  });

  describe('needsFallbackRecommendation', () => {
    function createMockRecommendation(toolId: number): ToolRecommendation {
      const tool = getPB2Tool(toolId)!;
      return {
        rank: 1,
        toolId,
        tool,
        reasoning: 'Test',
        triggerMetric: 'Test',
        triggerValue: 'Test',
        severityScore: 1.0,
        priority: 'high',
      };
    }

    it('should return true for empty array', () => {
      expect(needsFallbackRecommendation([])).toBe(true);
    });

    it('should return true for 1 recommendation', () => {
      const recs = [createMockRecommendation(3)];
      expect(needsFallbackRecommendation(recs)).toBe(true);
    });

    it('should return true for 2 recommendations', () => {
      const recs = [createMockRecommendation(3), createMockRecommendation(4)];
      expect(needsFallbackRecommendation(recs)).toBe(true);
    });

    it('should return false for 3 or more recommendations', () => {
      const recs = [
        createMockRecommendation(3),
        createMockRecommendation(4),
        createMockRecommendation(6),
      ];
      expect(needsFallbackRecommendation(recs)).toBe(false);
    });
  });
});
