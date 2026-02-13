/**
 * ROI Calculator Unit Tests
 *
 * Tests for the Transformation ROI Calculator.
 *
 * Story 14.5: Transformation ROI Calculator
 * Task 7: Write tests for calculator logic
 */

import { describe, it, expect } from 'vitest';
import {
  calculateNPV,
  calculateIRR,
  calculateROIScenario,
  buildCashflows,
  calculatePaybackPeriod,
  generateScenarios,
  calculateROI,
  validateROIInput,
  canCalculateROI,
  getScenarioRecommendation,
  formatNPV,
} from './roi-calculator';
import {
  ROI_DEFAULTS,
  formatROIRatio,
  formatPaybackPeriod,
} from './cost-constants';

// ============================================================================
// NPV Calculation Tests
// ============================================================================

describe('calculateNPV', () => {
  it('should return 0 for empty cashflows', () => {
    expect(calculateNPV([], 0.10)).toBe(0);
  });

  it('should calculate NPV correctly for simple cashflows', () => {
    // Investment of 1000, returns 500 per year for 3 years
    const cashflows = [-1000, 500, 500, 500];
    const npv = calculateNPV(cashflows, 0.10);

    // Manual calculation:
    // -1000 + 500/1.1 + 500/1.21 + 500/1.331
    // = -1000 + 454.55 + 413.22 + 375.66 = 243.43
    expect(npv).toBeCloseTo(243.43, 0);
  });

  it('should return sum of cashflows when discount rate is 0', () => {
    const cashflows = [-1000, 400, 400, 400];
    const npv = calculateNPV(cashflows, 0);
    expect(npv).toBe(200);
  });

  it('should handle single initial investment', () => {
    const cashflows = [-1000];
    const npv = calculateNPV(cashflows, 0.10);
    expect(npv).toBe(-1000);
  });

  it('should throw error for negative discount rate', () => {
    expect(() => calculateNPV([100], -0.10)).toThrow();
  });
});

describe('calculateIRR', () => {
  it('should calculate IRR for break-even scenario', () => {
    // Investment of 1000, return of 1100 in year 1 (10% return)
    const cashflows = [-1000, 1100];
    const irr = calculateIRR(cashflows);
    expect(irr).toBeCloseTo(0.10, 2);
  });

  it('should calculate IRR for multi-year returns', () => {
    // Investment of 1000, returns 400 per year for 4 years
    const cashflows = [-1000, 400, 400, 400, 400];
    const irr = calculateIRR(cashflows);
    // IRR should be around 21.9%
    expect(irr).toBeCloseTo(0.219, 1);
  });

  it('should return 0 for insufficient cashflows', () => {
    expect(calculateIRR([-1000])).toBe(0);
    expect(calculateIRR([])).toBe(0);
  });
});

// ============================================================================
// Cash Flow Building Tests
// ============================================================================

describe('buildCashflows', () => {
  it('should create correct cashflow array structure', () => {
    const cashflows = buildCashflows(100000, 50000, 12, 3);

    expect(cashflows).toHaveLength(4); // Year 0 + 3 years
    expect(cashflows[0]).toBe(-100000); // Investment
  });

  it('should ramp up savings during timeline', () => {
    const cashflows = buildCashflows(100000, 60000, 24, 3);

    // Year 1: partial savings (midway through 2-year ramp)
    expect(cashflows[1]).toBeGreaterThan(0);
    expect(cashflows[1]).toBeLessThan(60000);

    // Year 2: still ramping (end of 2-year ramp)
    expect(cashflows[2]).toBeGreaterThan(cashflows[1]);

    // Year 3: full savings
    expect(cashflows[3]).toBe(60000);
  });

  it('should provide full savings after timeline completes', () => {
    const cashflows = buildCashflows(100000, 60000, 12, 3);

    // Years 2 and 3 should have full savings
    expect(cashflows[2]).toBe(60000);
    expect(cashflows[3]).toBe(60000);
  });

  it('should handle zero investment', () => {
    const cashflows = buildCashflows(0, 50000, 12, 3);
    expect(cashflows[0]).toBe(-0); // -0 and 0 are the same value but Object.is sees them as different
  });
});

// ============================================================================
// Payback Period Tests
// ============================================================================

describe('calculatePaybackPeriod', () => {
  it('should return 0 for zero investment', () => {
    expect(calculatePaybackPeriod(0, 50000, 12)).toBe(0);
  });

  it('should return Infinity for zero savings', () => {
    expect(calculatePaybackPeriod(100000, 0, 12)).toBe(Infinity);
  });

  it('should calculate payback correctly for immediate full savings', () => {
    // $120K annual savings = $10K/month
    // $30K investment = 3 months (but ramp-up affects this)
    const payback = calculatePaybackPeriod(30000, 120000, 1);
    expect(payback).toBeLessThan(6);
  });

  it('should account for ramp-up period', () => {
    // 18-month timeline means savings ramp up gradually
    const payback = calculatePaybackPeriod(100000, 200000, 18);

    // Should take longer than simple division would suggest
    expect(payback).toBeGreaterThan(6);
  });

  it('should handle very long payback periods', () => {
    // Very small savings relative to investment
    const payback = calculatePaybackPeriod(1000000, 1000, 12);
    expect(payback).toBe(Infinity);
  });
});

// ============================================================================
// ROI Scenario Calculation Tests
// ============================================================================

describe('calculateROIScenario', () => {
  const baseInput = {
    alignmentTax: 2000000,
    investment: 500000,
    targetReduction: 50,
    timelineMonths: 18,
  };

  it('should calculate conservative scenario with lower reduction', () => {
    const result = calculateROIScenario(baseInput, 'conservative');

    expect(result.scenarioType).toBe('conservative');
    expect(result.targetReduction).toBe(30); // 50% * 0.6 = 30%
    expect(result.annualSavings).toBe(600000); // 2M * 30% = 600K
    expect(result.probability).toBe(85);
  });

  it('should calculate moderate scenario with target reduction', () => {
    const result = calculateROIScenario(baseInput, 'moderate');

    expect(result.scenarioType).toBe('moderate');
    expect(result.targetReduction).toBe(50); // 50% * 1.0 = 50%
    expect(result.annualSavings).toBe(1000000); // 2M * 50% = 1M
    expect(result.probability).toBe(65);
  });

  it('should calculate aggressive scenario with higher reduction', () => {
    const result = calculateROIScenario(baseInput, 'aggressive');

    expect(result.scenarioType).toBe('aggressive');
    expect(result.targetReduction).toBe(70); // 50% * 1.4 = 70%
    expect(result.annualSavings).toBe(1400000); // 2M * 70% = 1.4M
    expect(result.probability).toBe(35);
  });

  it('should cap reduction at 100%', () => {
    const highReductionInput = {
      ...baseInput,
      targetReduction: 80,
    };

    const result = calculateROIScenario(highReductionInput, 'aggressive');
    // 80% * 1.4 = 112%, but should cap at 100%
    expect(result.targetReduction).toBe(100);
    expect(result.annualSavings).toBe(2000000); // Full alignment tax
  });

  it('should calculate three-year savings correctly', () => {
    const result = calculateROIScenario(baseInput, 'moderate');
    expect(result.threeYearSavings).toBe(result.annualSavings * 3);
  });

  it('should calculate positive NPV for good investment', () => {
    const result = calculateROIScenario(baseInput, 'moderate');
    expect(result.npv).toBeGreaterThan(0);
  });

  it('should calculate ROI ratio correctly', () => {
    const result = calculateROIScenario(baseInput, 'moderate');
    expect(result.roiRatio).toBeGreaterThan(1);
    expect(result.roiPercent).toBe(result.roiRatio * 100);
  });

  it('should handle zero investment gracefully', () => {
    const zeroInvestment = { ...baseInput, investment: 0 };
    const result = calculateROIScenario(zeroInvestment, 'moderate');
    expect(result.roiRatio).toBe(0);
    expect(result.paybackMonths).toBe(0);
  });
});

// ============================================================================
// Scenario Generation Tests
// ============================================================================

describe('generateScenarios', () => {
  it('should generate all three scenarios', () => {
    const results = generateScenarios(2000000, 500000);

    expect(results).toHaveLength(3);
    expect(results.map((r) => r.scenarioType)).toEqual([
      'conservative',
      'moderate',
      'aggressive',
    ]);
  });

  it('should use default values when not specified', () => {
    const results = generateScenarios(2000000, 500000);

    results.forEach((result) => {
      expect(result.timelineMonths).toBe(ROI_DEFAULTS.timelineMonths);
    });
  });

  it('should apply custom parameters to all scenarios', () => {
    const results = generateScenarios(2000000, 500000, 75, 24);

    results.forEach((result) => {
      expect(result.timelineMonths).toBe(24);
    });

    // Moderate should have 75% target
    const moderate = results.find((r) => r.scenarioType === 'moderate');
    expect(moderate?.targetReduction).toBe(75);
  });

  it('should order scenarios by risk/reward', () => {
    const results = generateScenarios(2000000, 500000);

    // Conservative has lowest savings, aggressive has highest
    expect(results[0].annualSavings).toBeLessThan(results[1].annualSavings);
    expect(results[1].annualSavings).toBeLessThan(results[2].annualSavings);

    // Conservative has highest probability, aggressive has lowest
    expect(results[0].probability).toBeGreaterThan(results[1].probability);
    expect(results[1].probability).toBeGreaterThan(results[2].probability);
  });
});

describe('calculateROI', () => {
  it('should return moderate scenario by default', () => {
    const result = calculateROI(2000000, 500000);
    expect(result.scenarioType).toBe('moderate');
  });

  it('should accept custom parameters', () => {
    const result = calculateROI(2000000, 500000, 75, 24);
    expect(result.targetReduction).toBe(75);
    expect(result.timelineMonths).toBe(24);
  });
});

// ============================================================================
// Validation Tests
// ============================================================================

describe('validateROIInput', () => {
  it('should accept valid inputs', () => {
    const result = validateROIInput({
      alignmentTax: 2000000,
      investment: 500000,
      targetReduction: 50,
      timelineMonths: 18,
    });

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject negative alignment tax', () => {
    const result = validateROIInput({ alignmentTax: -100 });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Alignment tax cannot be negative');
  });

  it('should reject investment below minimum', () => {
    const result = validateROIInput({ investment: 100 });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('at least'))).toBe(true);
  });

  it('should reject investment above maximum', () => {
    const result = validateROIInput({ investment: 100000000 });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('cannot exceed'))).toBe(true);
  });

  it('should reject target reduction outside range', () => {
    expect(validateROIInput({ targetReduction: -10 }).isValid).toBe(false);
    expect(validateROIInput({ targetReduction: 150 }).isValid).toBe(false);
  });

  it('should reject invalid timeline', () => {
    expect(validateROIInput({ timelineMonths: 0 }).isValid).toBe(false);
    expect(validateROIInput({ timelineMonths: 100 }).isValid).toBe(false);
  });

  it('should collect multiple errors', () => {
    const result = validateROIInput({
      alignmentTax: -100,
      investment: -500,
      targetReduction: 200,
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });
});

describe('canCalculateROI', () => {
  it('should return true for valid inputs', () => {
    expect(canCalculateROI(2000000, 500000)).toBe(true);
  });

  it('should return false for zero alignment tax', () => {
    expect(canCalculateROI(0, 500000)).toBe(false);
  });

  it('should return false for investment below minimum', () => {
    expect(canCalculateROI(2000000, 100)).toBe(false);
  });

  it('should return false for investment above maximum', () => {
    expect(canCalculateROI(2000000, 100000000)).toBe(false);
  });
});

// ============================================================================
// Recommendation Tests
// ============================================================================

describe('getScenarioRecommendation', () => {
  it('should recommend conservative for high ROI quick payback', () => {
    const results = generateScenarios(5000000, 100000); // Very high alignment tax vs investment

    const recommendation = getScenarioRecommendation(results);
    expect(recommendation.recommended).toBe('conservative');
  });

  it('should recommend aggressive for slow payback', () => {
    const results = generateScenarios(100000, 500000); // Low alignment tax vs high investment

    const recommendation = getScenarioRecommendation(results);
    expect(recommendation.recommended).toBe('aggressive');
  });

  it('should recommend moderate for balanced scenario', () => {
    const results = generateScenarios(2000000, 500000); // Reasonable ratio

    const recommendation = getScenarioRecommendation(results);
    expect(recommendation.recommended).toBe('moderate');
  });

  it('should provide a reason for recommendation', () => {
    const results = generateScenarios(2000000, 500000);
    const recommendation = getScenarioRecommendation(results);

    expect(recommendation.reason).toBeTruthy();
    expect(recommendation.reason.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// Formatting Tests
// ============================================================================

describe('formatNPV', () => {
  it('should format billions', () => {
    expect(formatNPV(1500000000)).toBe('$1.5B');
  });

  it('should format millions', () => {
    expect(formatNPV(2500000)).toBe('$2.5M');
  });

  it('should format thousands', () => {
    expect(formatNPV(750000)).toBe('$750K');
  });

  it('should format small values', () => {
    expect(formatNPV(500)).toBe('$500');
  });

  it('should handle negative values', () => {
    expect(formatNPV(-1500000)).toBe('-$1.5M');
    expect(formatNPV(-500)).toBe('-$500');
  });
});

describe('formatROIRatio', () => {
  it('should format positive ratios', () => {
    expect(formatROIRatio(3.5)).toBe('3.5x');
    expect(formatROIRatio(1.0)).toBe('1.0x');
  });

  it('should handle negative ratios', () => {
    expect(formatROIRatio(-0.5)).toBe('Negative');
  });

  it('should handle special values', () => {
    expect(formatROIRatio(Infinity)).toBe('N/A');
    expect(formatROIRatio(NaN)).toBe('N/A');
  });
});

describe('formatPaybackPeriod', () => {
  it('should format months', () => {
    expect(formatPaybackPeriod(6)).toBe('6 months');
    expect(formatPaybackPeriod(1)).toBe('1 month');
  });

  it('should format years', () => {
    expect(formatPaybackPeriod(24)).toBe('2 years');
    expect(formatPaybackPeriod(12)).toBe('1 year');
  });

  it('should format years and months', () => {
    expect(formatPaybackPeriod(18)).toBe('1y 6m');
    expect(formatPaybackPeriod(30)).toBe('2y 6m');
  });

  it('should handle edge cases', () => {
    expect(formatPaybackPeriod(0)).toBe('Immediate');
    expect(formatPaybackPeriod(Infinity)).toBe('Never');
    expect(formatPaybackPeriod(200)).toBe('10+ years');
  });
});
