/**
 * Tests for cost-constants interpretation helpers
 *
 * Story 12.4: Friction Category Breakdown and Recommendations
 * Task 8.5: Unit tests for interpretation helpers
 */

import { describe, it, expect } from 'vitest';
import {
  calculateOrganizationalVsTechnicalCost,
  interpretFrictionBreakdown,
  getCriticalFrictionPoints,
  isCriticalSeverity,
  CRITICAL_SEVERITY_THRESHOLD,
  INTERPRETATION_TEXT,
  type FrictionPointWithCost,
} from './cost-constants';
import type { FrictionCategory } from './friction-constants';

describe('cost-constants interpretation helpers', () => {
  describe('calculateOrganizationalVsTechnicalCost', () => {
    it('calculates organizational vs technical cost correctly', () => {
      const costByCategory: Record<FrictionCategory, number> = {
        access_bureaucracy: 30000,
        quality_degradation: 20000,
        multiple_sources: 10000,
        technical_debt: 40000,
      };

      const result = calculateOrganizationalVsTechnicalCost(costByCategory);

      expect(result.organizationalCost).toBe(60000); // 30k + 20k + 10k
      expect(result.technicalCost).toBe(40000);
      expect(result.total).toBe(100000);
    });

    it('handles all zeros', () => {
      const costByCategory: Record<FrictionCategory, number> = {
        access_bureaucracy: 0,
        quality_degradation: 0,
        multiple_sources: 0,
        technical_debt: 0,
      };

      const result = calculateOrganizationalVsTechnicalCost(costByCategory);

      expect(result.organizationalCost).toBe(0);
      expect(result.technicalCost).toBe(0);
      expect(result.total).toBe(0);
    });

    it('handles only organizational costs', () => {
      const costByCategory: Record<FrictionCategory, number> = {
        access_bureaucracy: 50000,
        quality_degradation: 30000,
        multiple_sources: 20000,
        technical_debt: 0,
      };

      const result = calculateOrganizationalVsTechnicalCost(costByCategory);

      expect(result.organizationalCost).toBe(100000);
      expect(result.technicalCost).toBe(0);
    });

    it('handles only technical costs', () => {
      const costByCategory: Record<FrictionCategory, number> = {
        access_bureaucracy: 0,
        quality_degradation: 0,
        multiple_sources: 0,
        technical_debt: 75000,
      };

      const result = calculateOrganizationalVsTechnicalCost(costByCategory);

      expect(result.organizationalCost).toBe(0);
      expect(result.technicalCost).toBe(75000);
    });
  });

  describe('interpretFrictionBreakdown', () => {
    it('returns organizational dominant when >= 70%', () => {
      const costByCategory: Record<FrictionCategory, number> = {
        access_bureaucracy: 50000,
        quality_degradation: 30000,
        multiple_sources: 10000, // Total org: 90,000
        technical_debt: 10000, // 10%
      };

      const result = interpretFrictionBreakdown(costByCategory);

      expect(result.dominantType).toBe('organizational');
      expect(result.ratio).toBe(0.9);
      expect(result.percentage).toBe(90);
      expect(result.headline).toBe(INTERPRETATION_TEXT.organizational.headline);
    });

    it('returns technical dominant when <= 30%', () => {
      const costByCategory: Record<FrictionCategory, number> = {
        access_bureaucracy: 5000,
        quality_degradation: 3000,
        multiple_sources: 2000, // Total org: 10,000 (10%)
        technical_debt: 90000, // 90%
      };

      const result = interpretFrictionBreakdown(costByCategory);

      expect(result.dominantType).toBe('technical');
      expect(result.ratio).toBe(0.1);
      expect(result.percentage).toBe(10);
      expect(result.headline).toBe(INTERPRETATION_TEXT.technical.headline);
    });

    it('returns balanced when between 30% and 70%', () => {
      const costByCategory: Record<FrictionCategory, number> = {
        access_bureaucracy: 25000,
        quality_degradation: 15000,
        multiple_sources: 10000, // Total org: 50,000
        technical_debt: 50000, // 50%
      };

      const result = interpretFrictionBreakdown(costByCategory);

      expect(result.dominantType).toBe('balanced');
      expect(result.ratio).toBe(0.5);
      expect(result.percentage).toBe(50);
      expect(result.headline).toBe(INTERPRETATION_TEXT.balanced.headline);
    });

    it('handles boundary at 70%', () => {
      const costByCategory: Record<FrictionCategory, number> = {
        access_bureaucracy: 70000,
        quality_degradation: 0,
        multiple_sources: 0,
        technical_debt: 30000,
      };

      const result = interpretFrictionBreakdown(costByCategory);

      expect(result.dominantType).toBe('organizational');
    });

    it('handles boundary at 30%', () => {
      const costByCategory: Record<FrictionCategory, number> = {
        access_bureaucracy: 30000,
        quality_degradation: 0,
        multiple_sources: 0,
        technical_debt: 70000,
      };

      const result = interpretFrictionBreakdown(costByCategory);

      expect(result.dominantType).toBe('technical');
    });

    it('handles zero total cost', () => {
      const costByCategory: Record<FrictionCategory, number> = {
        access_bureaucracy: 0,
        quality_degradation: 0,
        multiple_sources: 0,
        technical_debt: 0,
      };

      const result = interpretFrictionBreakdown(costByCategory);

      expect(result.dominantType).toBe('balanced');
      expect(result.ratio).toBe(0.5);
      expect(result.percentage).toBe(50);
    });

    it('includes recommendations', () => {
      const costByCategory: Record<FrictionCategory, number> = {
        access_bureaucracy: 80000,
        quality_degradation: 0,
        multiple_sources: 0,
        technical_debt: 20000,
      };

      const result = interpretFrictionBreakdown(costByCategory);

      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations).toContain(
        INTERPRETATION_TEXT.organizational.recommendations[0]
      );
    });

    it('includes description', () => {
      const costByCategory: Record<FrictionCategory, number> = {
        access_bureaucracy: 80000,
        quality_degradation: 0,
        multiple_sources: 0,
        technical_debt: 20000,
      };

      const result = interpretFrictionBreakdown(costByCategory);

      expect(result.description).toBe(INTERPRETATION_TEXT.organizational.description);
    });
  });

  describe('getCriticalFrictionPoints', () => {
    const baseFrictionPoint: FrictionPointWithCost = {
      id: 'fp_1',
      journeyId: 'j_1',
      stageId: 's_1',
      category: 'access_bureaucracy',
      description: 'Test',
      severity: { frequency: 3, effort: 3, impact: 3 }, // Total: 9
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    it('returns points with severity >= 7', () => {
      const points: FrictionPointWithCost[] = [
        { ...baseFrictionPoint, id: 'fp_1', severity: { frequency: 3, effort: 3, impact: 3 } }, // 9
        { ...baseFrictionPoint, id: 'fp_2', severity: { frequency: 2, effort: 2, impact: 3 } }, // 7
        { ...baseFrictionPoint, id: 'fp_3', severity: { frequency: 2, effort: 2, impact: 2 } }, // 6
      ];

      const result = getCriticalFrictionPoints(points);

      expect(result.length).toBe(2);
      expect(result.map((p) => p.id)).toContain('fp_1');
      expect(result.map((p) => p.id)).toContain('fp_2');
      expect(result.map((p) => p.id)).not.toContain('fp_3');
    });

    it('sorts by severity descending', () => {
      const points: FrictionPointWithCost[] = [
        { ...baseFrictionPoint, id: 'fp_7', severity: { frequency: 2, effort: 2, impact: 3 } }, // 7
        { ...baseFrictionPoint, id: 'fp_9', severity: { frequency: 3, effort: 3, impact: 3 } }, // 9
        { ...baseFrictionPoint, id: 'fp_8', severity: { frequency: 3, effort: 2, impact: 3 } }, // 8
      ];

      const result = getCriticalFrictionPoints(points);

      expect(result[0].id).toBe('fp_9');
      expect(result[1].id).toBe('fp_8');
      expect(result[2].id).toBe('fp_7');
    });

    it('returns empty array when no critical points', () => {
      const points: FrictionPointWithCost[] = [
        { ...baseFrictionPoint, id: 'fp_1', severity: { frequency: 2, effort: 2, impact: 2 } }, // 6
        { ...baseFrictionPoint, id: 'fp_2', severity: { frequency: 1, effort: 1, impact: 1 } }, // 3
      ];

      const result = getCriticalFrictionPoints(points);

      expect(result.length).toBe(0);
    });

    it('returns empty array for empty input', () => {
      const result = getCriticalFrictionPoints([]);

      expect(result.length).toBe(0);
    });

    it('handles boundary severity of 7', () => {
      const points: FrictionPointWithCost[] = [
        { ...baseFrictionPoint, id: 'fp_1', severity: { frequency: 2, effort: 2, impact: 3 } }, // 7
      ];

      const result = getCriticalFrictionPoints(points);

      expect(result.length).toBe(1);
    });
  });

  describe('isCriticalSeverity', () => {
    it('returns true for severity >= 7', () => {
      expect(isCriticalSeverity({ frequency: 3, effort: 3, impact: 3 })).toBe(true); // 9
      expect(isCriticalSeverity({ frequency: 3, effort: 2, impact: 3 })).toBe(true); // 8
      expect(isCriticalSeverity({ frequency: 2, effort: 2, impact: 3 })).toBe(true); // 7
    });

    it('returns false for severity < 7', () => {
      expect(isCriticalSeverity({ frequency: 2, effort: 2, impact: 2 })).toBe(false); // 6
      expect(isCriticalSeverity({ frequency: 1, effort: 2, impact: 2 })).toBe(false); // 5
      expect(isCriticalSeverity({ frequency: 1, effort: 1, impact: 1 })).toBe(false); // 3
    });
  });

  describe('CRITICAL_SEVERITY_THRESHOLD', () => {
    it('is 7', () => {
      expect(CRITICAL_SEVERITY_THRESHOLD).toBe(7);
    });
  });

  describe('INTERPRETATION_TEXT', () => {
    it('has organizational interpretation', () => {
      expect(INTERPRETATION_TEXT.organizational.headline).toBeDefined();
      expect(INTERPRETATION_TEXT.organizational.description).toBeDefined();
      expect(INTERPRETATION_TEXT.organizational.recommendations.length).toBeGreaterThan(0);
    });

    it('has technical interpretation', () => {
      expect(INTERPRETATION_TEXT.technical.headline).toBeDefined();
      expect(INTERPRETATION_TEXT.technical.description).toBeDefined();
      expect(INTERPRETATION_TEXT.technical.recommendations.length).toBeGreaterThan(0);
    });

    it('has balanced interpretation', () => {
      expect(INTERPRETATION_TEXT.balanced.headline).toBeDefined();
      expect(INTERPRETATION_TEXT.balanced.description).toBeDefined();
      expect(INTERPRETATION_TEXT.balanced.recommendations.length).toBeGreaterThan(0);
    });
  });
});
