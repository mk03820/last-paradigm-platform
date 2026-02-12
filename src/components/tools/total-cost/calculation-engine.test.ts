/**
 * Calculation Engine Unit Tests
 *
 * Tests for the Total Cost of Misalignment calculation engine.
 *
 * Story 14.3: Alignment Tax Calculation and Interpretation
 * Task 8.2: Unit tests for calculation-engine
 */

import { describe, it, expect } from 'vitest';
import {
  calculateTotalAlignmentTax,
  calculatePercentOfRevenue,
  getInterpretation,
  buildCostSourceItems,
  getToolCostItems,
  getInputCostItems,
  formatCurrency,
  formatFullCurrency,
  formatPercent,
  formatPercentSmart,
  hasValidResult,
  hasMinimumRequirements,
  countActiveCostSources,
  getLargestCostSource,
  getCostSourceLabel,
} from './calculation-engine';
import type { AggregatedToolData, AdditionalCosts } from './cost-constants';
import { createEmptyAdditionalCosts } from './cost-constants';

// ============================================================================
// Test Fixtures
// ============================================================================

function createMockAggregatedData(
  overrides: Partial<AggregatedToolData> = {}
): AggregatedToolData {
  return {
    tool1: null,
    tool2: {
      annualizedWaste: 1200000,
      meetingsPerWeek: 45,
      totalAttendeeHours: 540,
      completedAt: '2024-01-01T00:00:00Z',
    },
    tool3: null,
    tool4: null,
    tool5: {
      totalFrictionCost: 450000,
      journeyCount: 5,
      frictionPointCount: 12,
      criticalFrictionCount: 3,
      completedAt: '2024-01-01T00:00:00Z',
    },
    tool6: null,
    aggregatedAt: '2024-01-01T00:00:00Z',
    completedToolsCount: 2,
    canProceed: true,
    ...overrides,
  };
}

function createMockAdditionalCosts(
  overrides: Partial<AdditionalCosts> = {}
): AdditionalCosts {
  return {
    projectDelays: {
      annualProjectBudget: 2000000,
      delayPercentage: 15,
      subtotal: 350000,
    },
    rework: {
      annualLaborBudget: 3000000,
      reworkPercentage: 20,
      subtotal: 600000,
    },
    turnover: {
      annualTurnoverCost: 500000,
      alignmentAttributionPercent: 40,
      subtotal: 200000,
    },
    opportunityCost: {
      estimatedAmount: 100000,
      subtotal: 100000,
    },
    total: 1250000,
    ...overrides,
  };
}

// ============================================================================
// calculateTotalAlignmentTax Tests
// ============================================================================

describe('calculateTotalAlignmentTax', () => {
  it('should sum all cost sources correctly', () => {
    const aggregatedData = createMockAggregatedData();
    const additionalCosts = createMockAdditionalCosts();
    const revenue = 50000000;

    const result = calculateTotalAlignmentTax(aggregatedData, additionalCosts, revenue);

    // Tool costs: 1,200,000 + 450,000 = 1,650,000
    expect(result.toolsSubtotal).toBe(1650000);

    // Additional costs: 350,000 + 600,000 + 200,000 + 100,000 = 1,250,000
    expect(result.additionalSubtotal).toBe(1250000);

    // Total: 1,650,000 + 1,250,000 = 2,900,000
    expect(result.total).toBe(2900000);
  });

  it('should extract individual cost amounts correctly', () => {
    const aggregatedData = createMockAggregatedData();
    const additionalCosts = createMockAdditionalCosts();
    const revenue = 50000000;

    const result = calculateTotalAlignmentTax(aggregatedData, additionalCosts, revenue);

    expect(result.meetingWaste).toBe(1200000);
    expect(result.dataFriction).toBe(450000);
    expect(result.projectDelays).toBe(350000);
    expect(result.rework).toBe(600000);
    expect(result.turnover).toBe(200000);
    expect(result.opportunityCost).toBe(100000);
  });

  it('should handle missing tool data', () => {
    const aggregatedData = createMockAggregatedData({
      tool2: null,
      tool5: null,
    });
    const additionalCosts = createMockAdditionalCosts();
    const revenue = 50000000;

    const result = calculateTotalAlignmentTax(aggregatedData, additionalCosts, revenue);

    expect(result.meetingWaste).toBe(0);
    expect(result.dataFriction).toBe(0);
    expect(result.toolsSubtotal).toBe(0);
    expect(result.total).toBe(additionalCosts.total);
  });

  it('should handle null additional costs', () => {
    const aggregatedData = createMockAggregatedData();
    const revenue = 50000000;

    const result = calculateTotalAlignmentTax(aggregatedData, null, revenue);

    expect(result.additionalSubtotal).toBe(0);
    expect(result.total).toBe(1650000); // Only tool costs
  });

  it('should calculate percentage of revenue correctly', () => {
    const aggregatedData = createMockAggregatedData();
    const additionalCosts = createMockAdditionalCosts();
    const revenue = 50000000;

    const result = calculateTotalAlignmentTax(aggregatedData, additionalCosts, revenue);

    // 2,900,000 / 50,000,000 * 100 = 5.8%
    expect(result.percentOfRevenue).toBeCloseTo(5.8, 1);
  });

  it('should return correct interpretation for crisis level', () => {
    const aggregatedData = createMockAggregatedData();
    const additionalCosts = createMockAdditionalCosts();
    const revenue = 50000000; // 5.8% = crisis

    const result = calculateTotalAlignmentTax(aggregatedData, additionalCosts, revenue);

    expect(result.interpretation.level).toBe('crisis');
    expect(result.interpretation.label).toBe('Crisis');
  });
});

// ============================================================================
// calculatePercentOfRevenue Tests
// ============================================================================

describe('calculatePercentOfRevenue', () => {
  it('should calculate percentage correctly', () => {
    expect(calculatePercentOfRevenue(1000000, 50000000)).toBeCloseTo(2, 1);
    expect(calculatePercentOfRevenue(2500000, 50000000)).toBeCloseTo(5, 1);
    expect(calculatePercentOfRevenue(500000, 50000000)).toBeCloseTo(1, 1);
  });

  it('should return 0 for zero revenue', () => {
    expect(calculatePercentOfRevenue(1000000, 0)).toBe(0);
  });

  it('should return 0 for negative revenue', () => {
    expect(calculatePercentOfRevenue(1000000, -50000000)).toBe(0);
  });

  it('should handle large values', () => {
    expect(calculatePercentOfRevenue(10000000000, 100000000000)).toBeCloseTo(10, 1);
  });
});

// ============================================================================
// getInterpretation Tests
// ============================================================================

describe('getInterpretation', () => {
  it('should return normal for <2%', () => {
    expect(getInterpretation(0).level).toBe('normal');
    expect(getInterpretation(1).level).toBe('normal');
    expect(getInterpretation(1.9).level).toBe('normal');
  });

  it('should return significant for 2-4%', () => {
    expect(getInterpretation(2).level).toBe('significant');
    expect(getInterpretation(3).level).toBe('significant');
    expect(getInterpretation(3.9).level).toBe('significant');
  });

  it('should return crisis for 4-7%', () => {
    expect(getInterpretation(4).level).toBe('crisis');
    expect(getInterpretation(5.5).level).toBe('crisis');
    expect(getInterpretation(6.9).level).toBe('crisis');
  });

  it('should return existential for >7%', () => {
    expect(getInterpretation(7).level).toBe('existential');
    expect(getInterpretation(10).level).toBe('existential');
    expect(getInterpretation(100).level).toBe('existential');
  });

  it('should return threshold with correct colors', () => {
    const normal = getInterpretation(1);
    expect(normal.color).toContain('green');

    const significant = getInterpretation(3);
    expect(significant.color).toContain('yellow');

    const crisis = getInterpretation(5);
    expect(crisis.color).toContain('orange');

    const existential = getInterpretation(10);
    expect(existential.color).toContain('red');
  });
});

// ============================================================================
// buildCostSourceItems Tests
// ============================================================================

describe('buildCostSourceItems', () => {
  it('should build items for all non-zero sources', () => {
    const aggregatedData = createMockAggregatedData();
    const additionalCosts = createMockAdditionalCosts();
    const result = calculateTotalAlignmentTax(aggregatedData, additionalCosts, 50000000);

    const items = buildCostSourceItems(result);

    expect(items.length).toBe(6); // All 6 sources have values
    expect(items.map((i) => i.id)).toContain('meetingWaste');
    expect(items.map((i) => i.id)).toContain('dataFriction');
    expect(items.map((i) => i.id)).toContain('projectDelays');
  });

  it('should calculate percentages correctly', () => {
    const aggregatedData = createMockAggregatedData();
    const additionalCosts = createMockAdditionalCosts();
    const result = calculateTotalAlignmentTax(aggregatedData, additionalCosts, 50000000);

    const items = buildCostSourceItems(result);
    const meetingWasteItem = items.find((i) => i.id === 'meetingWaste');

    // 1,200,000 / 2,900,000 * 100 = ~41.4%
    expect(meetingWasteItem?.percentage).toBeCloseTo(41.4, 0);
  });

  it('should exclude zero-value sources', () => {
    const aggregatedData = createMockAggregatedData();
    const additionalCosts = createMockAdditionalCosts({
      opportunityCost: { estimatedAmount: 0, subtotal: 0 },
      total: 1150000,
    });
    const result = calculateTotalAlignmentTax(aggregatedData, additionalCosts, 50000000);

    const items = buildCostSourceItems(result);

    expect(items.map((i) => i.id)).not.toContain('opportunityCost');
  });

  it('should include tool numbers for tool-sourced items', () => {
    const aggregatedData = createMockAggregatedData();
    const additionalCosts = createMockAdditionalCosts();
    const result = calculateTotalAlignmentTax(aggregatedData, additionalCosts, 50000000);

    const items = buildCostSourceItems(result);
    const meetingWasteItem = items.find((i) => i.id === 'meetingWaste');
    const dataFrictionItem = items.find((i) => i.id === 'dataFriction');

    expect(meetingWasteItem?.toolNumber).toBe(2);
    expect(dataFrictionItem?.toolNumber).toBe(5);
  });
});

describe('getToolCostItems', () => {
  it('should return only tool-sourced items', () => {
    const aggregatedData = createMockAggregatedData();
    const additionalCosts = createMockAdditionalCosts();
    const result = calculateTotalAlignmentTax(aggregatedData, additionalCosts, 50000000);

    const items = buildCostSourceItems(result);
    const toolItems = getToolCostItems(items);

    expect(toolItems.length).toBe(2);
    expect(toolItems.every((i) => i.source === 'tool')).toBe(true);
  });
});

describe('getInputCostItems', () => {
  it('should return only input-sourced items', () => {
    const aggregatedData = createMockAggregatedData();
    const additionalCosts = createMockAdditionalCosts();
    const result = calculateTotalAlignmentTax(aggregatedData, additionalCosts, 50000000);

    const items = buildCostSourceItems(result);
    const inputItems = getInputCostItems(items);

    expect(inputItems.length).toBe(4);
    expect(inputItems.every((i) => i.source === 'input')).toBe(true);
  });
});

// ============================================================================
// Formatting Function Tests
// ============================================================================

describe('formatCurrency', () => {
  it('should format billions correctly', () => {
    expect(formatCurrency(1500000000)).toBe('$1.5B');
    expect(formatCurrency(2000000000)).toBe('$2.0B');
  });

  it('should format millions correctly', () => {
    expect(formatCurrency(2900000)).toBe('$2.9M');
    expect(formatCurrency(1200000)).toBe('$1.2M');
  });

  it('should format thousands correctly', () => {
    expect(formatCurrency(50000)).toBe('$50K');
    expect(formatCurrency(350000)).toBe('$350K');
  });

  it('should format small amounts correctly', () => {
    expect(formatCurrency(500)).toBe('$500');
    expect(formatCurrency(999)).toBe('$999');
  });
});

describe('formatFullCurrency', () => {
  it('should format with full precision', () => {
    expect(formatFullCurrency(2900000)).toBe('$2,900,000');
    expect(formatFullCurrency(1234567)).toBe('$1,234,567');
    expect(formatFullCurrency(500)).toBe('$500');
  });
});

describe('formatPercent', () => {
  it('should format with one decimal place', () => {
    expect(formatPercent(4.2)).toBe('4.2%');
    expect(formatPercent(10.0)).toBe('10.0%');
    expect(formatPercent(0.5)).toBe('0.5%');
  });
});

describe('formatPercentSmart', () => {
  it('should use 1 decimal for values < 10%', () => {
    expect(formatPercentSmart(4.23)).toBe('4.2%');
    expect(formatPercentSmart(0.5)).toBe('0.5%');
  });

  it('should use 0 decimals for values >= 10%', () => {
    expect(formatPercentSmart(10.5)).toBe('11%');
    expect(formatPercentSmart(45.7)).toBe('46%');
  });
});

// ============================================================================
// Validation Function Tests
// ============================================================================

describe('hasValidResult', () => {
  it('should return true for valid result', () => {
    const aggregatedData = createMockAggregatedData();
    const additionalCosts = createMockAdditionalCosts();
    const result = calculateTotalAlignmentTax(aggregatedData, additionalCosts, 50000000);

    expect(hasValidResult(result)).toBe(true);
  });

  it('should return false for null result', () => {
    expect(hasValidResult(null)).toBe(false);
  });

  it('should return false for zero total', () => {
    const aggregatedData = createMockAggregatedData({
      tool2: null,
      tool5: null,
    });
    const result = calculateTotalAlignmentTax(aggregatedData, null, 50000000);

    expect(hasValidResult(result)).toBe(false);
  });

  it('should return false for zero revenue', () => {
    const aggregatedData = createMockAggregatedData();
    const additionalCosts = createMockAdditionalCosts();
    const result = calculateTotalAlignmentTax(aggregatedData, additionalCosts, 0);

    expect(hasValidResult(result)).toBe(false);
  });
});

describe('hasMinimumRequirements', () => {
  it('should return true when Tool 2 is complete and revenue > 0', () => {
    const aggregatedData = createMockAggregatedData();
    expect(hasMinimumRequirements(aggregatedData, 50000000)).toBe(true);
  });

  it('should return false when Tool 2 is not complete', () => {
    const aggregatedData = createMockAggregatedData({ tool2: null });
    expect(hasMinimumRequirements(aggregatedData, 50000000)).toBe(false);
  });

  it('should return false when revenue is 0', () => {
    const aggregatedData = createMockAggregatedData();
    expect(hasMinimumRequirements(aggregatedData, 0)).toBe(false);
  });

  it('should return false for null aggregated data', () => {
    expect(hasMinimumRequirements(null, 50000000)).toBe(false);
  });
});

// ============================================================================
// Summary Function Tests
// ============================================================================

describe('countActiveCostSources', () => {
  it('should count all non-zero sources', () => {
    const aggregatedData = createMockAggregatedData();
    const additionalCosts = createMockAdditionalCosts();
    const result = calculateTotalAlignmentTax(aggregatedData, additionalCosts, 50000000);

    expect(countActiveCostSources(result)).toBe(6);
  });

  it('should not count zero sources', () => {
    const aggregatedData = createMockAggregatedData({ tool5: null });
    const additionalCosts = createMockAdditionalCosts({
      opportunityCost: { estimatedAmount: 0, subtotal: 0 },
      total: 1150000,
    });
    const result = calculateTotalAlignmentTax(aggregatedData, additionalCosts, 50000000);

    expect(countActiveCostSources(result)).toBe(4);
  });
});

describe('getLargestCostSource', () => {
  it('should return the largest cost source', () => {
    const aggregatedData = createMockAggregatedData();
    const additionalCosts = createMockAdditionalCosts();
    const result = calculateTotalAlignmentTax(aggregatedData, additionalCosts, 50000000);

    const largest = getLargestCostSource(result);

    expect(largest?.id).toBe('meetingWaste');
    expect(largest?.amount).toBe(1200000);
  });

  it('should return null when all sources are zero', () => {
    const aggregatedData = createMockAggregatedData({
      tool2: null,
      tool5: null,
    });
    const result = calculateTotalAlignmentTax(aggregatedData, null, 50000000);

    expect(getLargestCostSource(result)).toBeNull();
  });
});

describe('getCostSourceLabel', () => {
  it('should return correct labels', () => {
    expect(getCostSourceLabel('meetingWaste')).toBe('Meeting Waste');
    expect(getCostSourceLabel('dataFriction')).toBe('Data Friction');
    expect(getCostSourceLabel('projectDelays')).toBe('Project Delays');
    expect(getCostSourceLabel('rework')).toBe('Rework');
    expect(getCostSourceLabel('turnover')).toBe('Excess Turnover');
    expect(getCostSourceLabel('opportunityCost')).toBe('Opportunity Cost');
  });
});
