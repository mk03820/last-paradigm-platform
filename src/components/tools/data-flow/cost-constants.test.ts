/**
 * Tests for Cost Calculation Constants and Helpers
 *
 * Story 12.3: Friction Cost Calculation
 * Task 7.1: Unit tests for cost-constants
 */

import { describe, it, expect } from 'vitest';
import {
  calculateFTECost,
  calculateTotalFrictionCost,
  calculateFrictionPointCost,
  calculateJourneyCost,
  calculateEnterpriseTotalCost,
  calculateCostByCategory,
  calculateCostBreakdown,
  createDefaultCost,
  validateCost,
  formatCurrency,
  formatCurrencyAbbreviated,
  getCostMethodology,
  countPointsWithCost,
  calculateCostCompletion,
  generateCostId,
  getDefaultHourlyRatePreset,
  WORKING_WEEKS_PER_YEAR,
  DEFAULT_HOURLY_RATE,
  MAX_HOURS_PER_WEEK,
  HOURLY_RATE_PRESETS,
} from './cost-constants';
import type { FrictionPointWithCost } from './cost-constants';

describe('cost-constants', () => {
  describe('constants', () => {
    it('has 48 working weeks per year', () => {
      expect(WORKING_WEEKS_PER_YEAR).toBe(48);
    });

    it('has $75 default hourly rate', () => {
      expect(DEFAULT_HOURLY_RATE).toBe(75);
    });

    it('has 40 max hours per week', () => {
      expect(MAX_HOURS_PER_WEEK).toBe(40);
    });

    it('has hourly rate presets', () => {
      expect(HOURLY_RATE_PRESETS).toHaveLength(4);
      expect(HOURLY_RATE_PRESETS.map((p) => p.value)).toEqual([50, 75, 100, 150]);
    });
  });

  describe('getDefaultHourlyRatePreset', () => {
    it('returns the preset marked as default', () => {
      const preset = getDefaultHourlyRatePreset();
      expect(preset.value).toBe(75);
      expect(preset.isDefault).toBe(true);
    });
  });

  describe('calculateFTECost', () => {
    it('calculates annual FTE cost correctly', () => {
      // 10 hrs/week × $75/hr × 48 weeks = $36,000
      expect(calculateFTECost(10, 75)).toBe(36000);
    });

    it('returns 0 for 0 hours', () => {
      expect(calculateFTECost(0, 75)).toBe(0);
    });

    it('returns 0 for 0 hourly rate', () => {
      expect(calculateFTECost(10, 0)).toBe(0);
    });

    it('handles decimal hours', () => {
      // 2.5 hrs/week × $100/hr × 48 weeks = $12,000
      expect(calculateFTECost(2.5, 100)).toBe(12000);
    });
  });

  describe('calculateTotalFrictionCost', () => {
    it('adds FTE cost and opportunity cost', () => {
      const cost = {
        hoursPerWeek: 10,
        hourlyRate: 75,
        opportunityCost: 5000,
      };
      // FTE: 10 × 75 × 48 = 36,000 + 5,000 = 41,000
      expect(calculateTotalFrictionCost(cost)).toBe(41000);
    });

    it('works with zero opportunity cost', () => {
      const cost = {
        hoursPerWeek: 5,
        hourlyRate: 50,
        opportunityCost: 0,
      };
      // 5 × 50 × 48 = 12,000
      expect(calculateTotalFrictionCost(cost)).toBe(12000);
    });
  });

  describe('calculateFrictionPointCost', () => {
    it('returns 0 for friction point without cost', () => {
      const point: FrictionPointWithCost = {
        id: 'fp_1',
        journeyId: 'j_1',
        stageId: 's_1',
        category: 'access_bureaucracy',
        description: 'Test',
        severity: { frequency: 1, effort: 1, impact: 1 },
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };
      expect(calculateFrictionPointCost(point)).toBe(0);
    });

    it('returns 0 for friction point with null cost', () => {
      const point: FrictionPointWithCost = {
        id: 'fp_1',
        journeyId: 'j_1',
        stageId: 's_1',
        category: 'access_bureaucracy',
        description: 'Test',
        severity: { frequency: 1, effort: 1, impact: 1 },
        cost: null,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };
      expect(calculateFrictionPointCost(point)).toBe(0);
    });

    it('calculates total cost for friction point with cost', () => {
      const point: FrictionPointWithCost = {
        id: 'fp_1',
        journeyId: 'j_1',
        stageId: 's_1',
        category: 'access_bureaucracy',
        description: 'Test',
        severity: { frequency: 1, effort: 1, impact: 1 },
        cost: {
          hoursPerWeek: 10,
          hourlyRate: 75,
          opportunityCost: 5000,
        },
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };
      expect(calculateFrictionPointCost(point)).toBe(41000);
    });
  });

  describe('calculateJourneyCost', () => {
    it('sums costs across friction points', () => {
      const points: FrictionPointWithCost[] = [
        {
          id: 'fp_1',
          journeyId: 'j_1',
          stageId: 's_1',
          category: 'access_bureaucracy',
          description: 'Test 1',
          severity: { frequency: 1, effort: 1, impact: 1 },
          cost: { hoursPerWeek: 5, hourlyRate: 75, opportunityCost: 0 },
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
        {
          id: 'fp_2',
          journeyId: 'j_1',
          stageId: 's_2',
          category: 'technical_debt',
          description: 'Test 2',
          cost: { hoursPerWeek: 10, hourlyRate: 100, opportunityCost: 10000 },
          severity: { frequency: 2, effort: 2, impact: 2 },
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ];
      // Point 1: 5 × 75 × 48 = 18,000
      // Point 2: 10 × 100 × 48 + 10,000 = 58,000
      // Total: 76,000
      expect(calculateJourneyCost(points)).toBe(76000);
    });

    it('handles points without cost', () => {
      const points: FrictionPointWithCost[] = [
        {
          id: 'fp_1',
          journeyId: 'j_1',
          stageId: 's_1',
          category: 'access_bureaucracy',
          description: 'Test 1',
          severity: { frequency: 1, effort: 1, impact: 1 },
          cost: { hoursPerWeek: 5, hourlyRate: 75, opportunityCost: 0 },
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
        {
          id: 'fp_2',
          journeyId: 'j_1',
          stageId: 's_2',
          category: 'technical_debt',
          description: 'Test 2 - no cost',
          severity: { frequency: 2, effort: 2, impact: 2 },
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ];
      expect(calculateJourneyCost(points)).toBe(18000);
    });

    it('returns 0 for empty array', () => {
      expect(calculateJourneyCost([])).toBe(0);
    });
  });

  describe('calculateEnterpriseTotalCost', () => {
    it('sums costs across all friction points', () => {
      const points: FrictionPointWithCost[] = [
        {
          id: 'fp_1',
          journeyId: 'j_1',
          stageId: 's_1',
          category: 'access_bureaucracy',
          description: 'Journey 1',
          severity: { frequency: 1, effort: 1, impact: 1 },
          cost: { hoursPerWeek: 5, hourlyRate: 75, opportunityCost: 0 },
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
        {
          id: 'fp_2',
          journeyId: 'j_2',
          stageId: 's_2',
          category: 'technical_debt',
          description: 'Journey 2',
          severity: { frequency: 2, effort: 2, impact: 2 },
          cost: { hoursPerWeek: 10, hourlyRate: 50, opportunityCost: 5000 },
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ];
      // Point 1: 18,000
      // Point 2: 10 × 50 × 48 + 5,000 = 29,000
      // Total: 47,000
      expect(calculateEnterpriseTotalCost(points)).toBe(47000);
    });
  });

  describe('calculateCostByCategory', () => {
    it('groups costs by friction category', () => {
      const points: FrictionPointWithCost[] = [
        {
          id: 'fp_1',
          journeyId: 'j_1',
          stageId: 's_1',
          category: 'access_bureaucracy',
          description: 'Test',
          severity: { frequency: 1, effort: 1, impact: 1 },
          cost: { hoursPerWeek: 10, hourlyRate: 75, opportunityCost: 0 },
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
        {
          id: 'fp_2',
          journeyId: 'j_1',
          stageId: 's_2',
          category: 'access_bureaucracy',
          description: 'Test 2',
          severity: { frequency: 1, effort: 1, impact: 1 },
          cost: { hoursPerWeek: 5, hourlyRate: 75, opportunityCost: 0 },
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
        {
          id: 'fp_3',
          journeyId: 'j_1',
          stageId: 's_3',
          category: 'technical_debt',
          description: 'Test 3',
          severity: { frequency: 1, effort: 1, impact: 1 },
          cost: { hoursPerWeek: 20, hourlyRate: 100, opportunityCost: 10000 },
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ];

      const result = calculateCostByCategory(points);

      // access_bureaucracy: 36,000 + 18,000 = 54,000
      expect(result.access_bureaucracy).toBe(54000);
      // technical_debt: 20 × 100 × 48 + 10,000 = 106,000
      expect(result.technical_debt).toBe(106000);
      // Others should be 0
      expect(result.quality_degradation).toBe(0);
      expect(result.multiple_sources).toBe(0);
    });
  });

  describe('calculateCostBreakdown', () => {
    it('separates FTE and opportunity costs', () => {
      const points: FrictionPointWithCost[] = [
        {
          id: 'fp_1',
          journeyId: 'j_1',
          stageId: 's_1',
          category: 'access_bureaucracy',
          description: 'Test',
          severity: { frequency: 1, effort: 1, impact: 1 },
          cost: { hoursPerWeek: 10, hourlyRate: 75, opportunityCost: 5000 },
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
        {
          id: 'fp_2',
          journeyId: 'j_1',
          stageId: 's_2',
          category: 'technical_debt',
          description: 'Test 2',
          severity: { frequency: 1, effort: 1, impact: 1 },
          cost: { hoursPerWeek: 5, hourlyRate: 100, opportunityCost: 10000 },
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ];

      const result = calculateCostBreakdown(points);

      // FTE: (10 × 75 × 48) + (5 × 100 × 48) = 36,000 + 24,000 = 60,000
      expect(result.fteCost).toBe(60000);
      // Opportunity: 5,000 + 10,000 = 15,000
      expect(result.opportunityCost).toBe(15000);
      // Total: 75,000
      expect(result.total).toBe(75000);
    });

    it('handles points without cost', () => {
      const points: FrictionPointWithCost[] = [
        {
          id: 'fp_1',
          journeyId: 'j_1',
          stageId: 's_1',
          category: 'access_bureaucracy',
          description: 'Test',
          severity: { frequency: 1, effort: 1, impact: 1 },
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ];

      const result = calculateCostBreakdown(points);

      expect(result.fteCost).toBe(0);
      expect(result.opportunityCost).toBe(0);
      expect(result.total).toBe(0);
    });
  });

  describe('createDefaultCost', () => {
    it('creates cost with default values', () => {
      const cost = createDefaultCost();
      expect(cost.hoursPerWeek).toBe(0);
      expect(cost.hourlyRate).toBe(75);
      expect(cost.opportunityCost).toBe(0);
    });
  });

  describe('validateCost', () => {
    it('returns valid for correct data', () => {
      const result = validateCost({
        hoursPerWeek: 10,
        hourlyRate: 75,
        opportunityCost: 5000,
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('rejects negative hours per week', () => {
      const result = validateCost({ hoursPerWeek: -5 });
      expect(result.valid).toBe(false);
      expect(result.errors.hoursPerWeek).toBeDefined();
    });

    it('rejects hours over max', () => {
      const result = validateCost({ hoursPerWeek: 50 });
      expect(result.valid).toBe(false);
      expect(result.errors.hoursPerWeek).toContain('40');
    });

    it('rejects negative hourly rate', () => {
      const result = validateCost({ hourlyRate: -10 });
      expect(result.valid).toBe(false);
      expect(result.errors.hourlyRate).toBeDefined();
    });

    it('rejects negative opportunity cost', () => {
      const result = validateCost({ opportunityCost: -1000 });
      expect(result.valid).toBe(false);
      expect(result.errors.opportunityCost).toBeDefined();
    });

    it('allows zero values', () => {
      const result = validateCost({
        hoursPerWeek: 0,
        hourlyRate: 0,
        opportunityCost: 0,
      });
      expect(result.valid).toBe(true);
    });
  });

  describe('formatCurrency', () => {
    it('formats numbers as USD currency', () => {
      expect(formatCurrency(1234)).toBe('$1,234');
      expect(formatCurrency(0)).toBe('$0');
      expect(formatCurrency(1000000)).toBe('$1,000,000');
    });

    it('rounds to whole dollars', () => {
      expect(formatCurrency(1234.56)).toBe('$1,235');
    });
  });

  describe('formatCurrencyAbbreviated', () => {
    it('abbreviates millions', () => {
      expect(formatCurrencyAbbreviated(1000000)).toBe('$1.0M');
      expect(formatCurrencyAbbreviated(2500000)).toBe('$2.5M');
    });

    it('abbreviates thousands', () => {
      expect(formatCurrencyAbbreviated(1000)).toBe('$1K');
      expect(formatCurrencyAbbreviated(50000)).toBe('$50K');
    });

    it('shows full amount for small values', () => {
      expect(formatCurrencyAbbreviated(999)).toBe('$999');
      expect(formatCurrencyAbbreviated(0)).toBe('$0');
    });
  });

  describe('getCostMethodology', () => {
    it('returns formula explanation', () => {
      const methodology = getCostMethodology();
      expect(methodology.formula).toContain('Hours/Week');
      expect(methodology.formula).toContain('48 weeks');
    });

    it('returns assumptions', () => {
      const methodology = getCostMethodology();
      expect(methodology.assumptions).toHaveLength(3);
      expect(methodology.assumptions[0]).toContain('48');
    });

    it('returns example', () => {
      const methodology = getCostMethodology();
      expect(methodology.example.inputs).toBeDefined();
      expect(methodology.example.calculation).toBeDefined();
      expect(methodology.example.result).toBeDefined();
    });
  });

  describe('countPointsWithCost', () => {
    it('counts points with cost data', () => {
      const points: FrictionPointWithCost[] = [
        {
          id: 'fp_1',
          journeyId: 'j_1',
          stageId: 's_1',
          category: 'access_bureaucracy',
          description: 'With cost',
          severity: { frequency: 1, effort: 1, impact: 1 },
          cost: { hoursPerWeek: 10, hourlyRate: 75, opportunityCost: 0 },
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
        {
          id: 'fp_2',
          journeyId: 'j_1',
          stageId: 's_2',
          category: 'technical_debt',
          description: 'Without cost',
          severity: { frequency: 1, effort: 1, impact: 1 },
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
        {
          id: 'fp_3',
          journeyId: 'j_1',
          stageId: 's_3',
          category: 'quality_degradation',
          description: 'With opportunity cost only',
          severity: { frequency: 1, effort: 1, impact: 1 },
          cost: { hoursPerWeek: 0, hourlyRate: 75, opportunityCost: 5000 },
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ];

      expect(countPointsWithCost(points)).toBe(2);
    });

    it('returns 0 for empty array', () => {
      expect(countPointsWithCost([])).toBe(0);
    });

    it('excludes points with zero cost', () => {
      const points: FrictionPointWithCost[] = [
        {
          id: 'fp_1',
          journeyId: 'j_1',
          stageId: 's_1',
          category: 'access_bureaucracy',
          description: 'Zero cost',
          severity: { frequency: 1, effort: 1, impact: 1 },
          cost: { hoursPerWeek: 0, hourlyRate: 75, opportunityCost: 0 },
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ];

      expect(countPointsWithCost(points)).toBe(0);
    });
  });

  describe('calculateCostCompletion', () => {
    it('calculates percentage of points with cost', () => {
      const points: FrictionPointWithCost[] = [
        {
          id: 'fp_1',
          journeyId: 'j_1',
          stageId: 's_1',
          category: 'access_bureaucracy',
          description: 'With cost',
          severity: { frequency: 1, effort: 1, impact: 1 },
          cost: { hoursPerWeek: 10, hourlyRate: 75, opportunityCost: 0 },
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
        {
          id: 'fp_2',
          journeyId: 'j_1',
          stageId: 's_2',
          category: 'technical_debt',
          description: 'Without cost',
          severity: { frequency: 1, effort: 1, impact: 1 },
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ];

      expect(calculateCostCompletion(points)).toBe(50);
    });

    it('returns 0 for empty array', () => {
      expect(calculateCostCompletion([])).toBe(0);
    });

    it('returns 100 when all points have cost', () => {
      const points: FrictionPointWithCost[] = [
        {
          id: 'fp_1',
          journeyId: 'j_1',
          stageId: 's_1',
          category: 'access_bureaucracy',
          description: 'With cost',
          severity: { frequency: 1, effort: 1, impact: 1 },
          cost: { hoursPerWeek: 10, hourlyRate: 75, opportunityCost: 0 },
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ];

      expect(calculateCostCompletion(points)).toBe(100);
    });
  });

  describe('generateCostId', () => {
    it('generates unique IDs', () => {
      const id1 = generateCostId();
      const id2 = generateCostId();
      expect(id1).not.toBe(id2);
    });

    it('starts with cost_ prefix', () => {
      const id = generateCostId();
      expect(id.startsWith('cost_')).toBe(true);
    });
  });
});
