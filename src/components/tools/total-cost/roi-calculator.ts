/**
 * ROI Calculator Engine
 *
 * Calculates transformation ROI based on alignment tax and investment.
 *
 * Story 14.5: Transformation ROI Calculator
 * Covers: FR2-35 (Calculate annual savings, 3-year NPV, ROI ratio)
 */

import type {
  ROIResult,
  ROICalculatorInput,
  ROIScenarioType,
} from './cost-constants';
import {
  ROI_SCENARIOS,
  ROI_DEFAULTS,
  getROIScenario,
} from './cost-constants';

// ============================================================================
// Core NPV Calculation
// ============================================================================

/**
 * Calculate Net Present Value of a series of cash flows
 *
 * @param cashflows - Array of cash flows (index 0 = year 0/initial, index 1 = year 1, etc.)
 * @param discountRate - Annual discount rate (e.g., 0.10 for 10%)
 * @returns Net Present Value
 */
export function calculateNPV(cashflows: number[], discountRate: number): number {
  if (cashflows.length === 0) return 0;
  if (discountRate < 0) throw new Error('Discount rate cannot be negative');

  return cashflows.reduce((npv, cashflow, year) => {
    const discountFactor = Math.pow(1 + discountRate, year);
    return npv + cashflow / discountFactor;
  }, 0);
}

/**
 * Calculate Internal Rate of Return (IRR) using Newton-Raphson method
 *
 * @param cashflows - Array of cash flows (index 0 = initial investment as negative)
 * @param maxIterations - Maximum iterations for convergence
 * @param tolerance - Convergence tolerance
 * @returns IRR as decimal (e.g., 0.25 for 25%)
 */
export function calculateIRR(
  cashflows: number[],
  maxIterations = 100,
  tolerance = 0.0001
): number {
  if (cashflows.length < 2) return 0;

  // Initial guess
  let rate = 0.1;

  for (let i = 0; i < maxIterations; i++) {
    const npv = calculateNPV(cashflows, rate);
    const npvDerivative = calculateNPVDerivative(cashflows, rate);

    if (Math.abs(npvDerivative) < tolerance) break;

    const newRate = rate - npv / npvDerivative;

    if (Math.abs(newRate - rate) < tolerance) {
      return newRate;
    }

    rate = newRate;
  }

  return rate;
}

/**
 * Calculate derivative of NPV with respect to discount rate
 * Used for Newton-Raphson IRR calculation
 */
function calculateNPVDerivative(cashflows: number[], discountRate: number): number {
  return cashflows.reduce((derivative, cashflow, year) => {
    if (year === 0) return derivative;
    const discountFactor = Math.pow(1 + discountRate, year + 1);
    return derivative - (year * cashflow) / discountFactor;
  }, 0);
}

// ============================================================================
// ROI Calculation Functions
// ============================================================================

/**
 * Calculate ROI for a single scenario
 *
 * @param input - ROI calculator input parameters
 * @param scenarioType - The scenario type to calculate
 * @returns ROI result for the scenario
 */
export function calculateROIScenario(
  input: ROICalculatorInput,
  scenarioType: ROIScenarioType
): ROIResult {
  const scenario = getROIScenario(scenarioType);
  const discountRate = input.discountRate ?? ROI_DEFAULTS.discountRate;

  // Calculate effective reduction based on scenario multiplier
  // Cap at 100% reduction
  const effectiveReduction = Math.min(
    input.targetReduction * scenario.reductionMultiplier,
    100
  );

  // Calculate annual savings (alignment tax reduction)
  const annualSavings = (input.alignmentTax * effectiveReduction) / 100;

  // Calculate three-year savings (simple sum)
  const threeYearSavings = annualSavings * 3;

  // Build cash flow array for NPV calculation
  // Year 0: Investment (negative)
  // Years 1-3: Annual savings (adjusted for ramp-up during timeline)
  const cashflows = buildCashflows(
    input.investment,
    annualSavings,
    input.timelineMonths,
    3 // 3-year analysis period
  );

  // Calculate NPV
  const npv = calculateNPV(cashflows, discountRate);

  // Calculate ROI ratio (total return / investment)
  const totalReturn = cashflows.slice(1).reduce((sum, cf) => sum + cf, 0);
  const roiRatio = input.investment > 0 ? totalReturn / input.investment : 0;
  const roiPercent = roiRatio * 100;

  // Calculate payback period in months
  const paybackMonths = calculatePaybackPeriod(
    input.investment,
    annualSavings,
    input.timelineMonths
  );

  return {
    scenarioType,
    scenarioLabel: scenario.label,
    targetReduction: effectiveReduction,
    timelineMonths: input.timelineMonths,
    investment: input.investment,
    annualSavings,
    threeYearSavings,
    npv,
    roiRatio,
    roiPercent,
    paybackMonths,
    probability: scenario.achievementProbability,
  };
}

/**
 * Build cash flow array for ROI analysis
 *
 * Accounts for ramp-up period during transformation timeline:
 * - Year 0: Full investment as outflow
 * - Year 1-N: Savings ramped based on timeline
 *
 * @param investment - Initial investment (positive number, will be made negative)
 * @param annualSavings - Annual savings once fully realized
 * @param timelineMonths - Months to achieve full savings
 * @param years - Number of years to project
 * @returns Array of cash flows
 */
export function buildCashflows(
  investment: number,
  annualSavings: number,
  timelineMonths: number,
  years: number
): number[] {
  const cashflows: number[] = [-investment]; // Year 0: Investment outflow

  const timelineYears = timelineMonths / 12;

  for (let year = 1; year <= years; year++) {
    if (year <= timelineYears) {
      // During ramp-up: partial savings
      // Linear ramp from 0 to full over timeline
      const rampProgress = year / timelineYears;
      // Average savings during this year considering ramp
      const avgSavings = annualSavings * (rampProgress - 0.5 / timelineYears);
      cashflows.push(Math.max(0, avgSavings));
    } else {
      // After ramp-up: full savings
      cashflows.push(annualSavings);
    }
  }

  return cashflows;
}

/**
 * Calculate payback period in months
 *
 * @param investment - Initial investment
 * @param annualSavings - Annual savings once fully realized
 * @param timelineMonths - Months to achieve full savings
 * @returns Payback period in months
 */
export function calculatePaybackPeriod(
  investment: number,
  annualSavings: number,
  timelineMonths: number
): number {
  if (investment <= 0) return 0;
  if (annualSavings <= 0) return Infinity;

  // During ramp-up, savings increase linearly
  // After ramp-up, savings are constant
  const monthlySavingsAtFull = annualSavings / 12;
  const timelineYears = timelineMonths / 12;

  // Calculate cumulative savings during ramp-up
  // Savings ramp linearly from 0 to full over timeline
  let cumulativeSavings = 0;
  let month = 0;

  // During ramp-up period
  while (month < timelineMonths && cumulativeSavings < investment) {
    const rampProgress = (month + 1) / timelineMonths;
    const monthSavings = monthlySavingsAtFull * rampProgress;
    cumulativeSavings += monthSavings;
    month++;
  }

  // If not paid back during ramp-up, continue at full rate
  while (cumulativeSavings < investment && month < 360) {
    // Cap at 30 years
    cumulativeSavings += monthlySavingsAtFull;
    month++;
  }

  return month >= 360 ? Infinity : month;
}

// ============================================================================
// High-Level Calculator Functions
// ============================================================================

/**
 * Calculate ROI for all three scenarios
 *
 * @param alignmentTax - Current annual alignment tax
 * @param investment - Proposed transformation investment
 * @param targetReduction - Target reduction percentage (default 50%)
 * @param timelineMonths - Timeline in months (default 18)
 * @returns Array of ROI results for all scenarios
 */
export function generateScenarios(
  alignmentTax: number,
  investment: number,
  targetReduction = ROI_DEFAULTS.targetReduction,
  timelineMonths = ROI_DEFAULTS.timelineMonths
): ROIResult[] {
  const input: ROICalculatorInput = {
    alignmentTax,
    investment,
    targetReduction,
    timelineMonths,
    discountRate: ROI_DEFAULTS.discountRate,
  };

  return ROI_SCENARIOS.map((scenario) =>
    calculateROIScenario(input, scenario.type)
  );
}

/**
 * Calculate single ROI result (moderate scenario by default)
 *
 * @param alignmentTax - Current annual alignment tax
 * @param investment - Proposed transformation investment
 * @param targetReduction - Target reduction percentage (default 50%)
 * @param timelineMonths - Timeline in months (default 18)
 * @returns ROI result for moderate scenario
 */
export function calculateROI(
  alignmentTax: number,
  investment: number,
  targetReduction = ROI_DEFAULTS.targetReduction,
  timelineMonths = ROI_DEFAULTS.timelineMonths
): ROIResult {
  return calculateROIScenario(
    {
      alignmentTax,
      investment,
      targetReduction,
      timelineMonths,
      discountRate: ROI_DEFAULTS.discountRate,
    },
    'moderate'
  );
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate ROI calculator inputs
 *
 * @param input - Input parameters to validate
 * @returns Object with isValid flag and error messages
 */
export function validateROIInput(input: Partial<ROICalculatorInput>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (input.alignmentTax !== undefined && input.alignmentTax < 0) {
    errors.push('Alignment tax cannot be negative');
  }

  if (input.investment !== undefined) {
    if (input.investment < 0) {
      errors.push('Investment cannot be negative');
    }
    if (input.investment < ROI_DEFAULTS.minInvestment) {
      errors.push(`Investment must be at least $${ROI_DEFAULTS.minInvestment.toLocaleString()}`);
    }
    if (input.investment > ROI_DEFAULTS.maxInvestment) {
      errors.push(`Investment cannot exceed $${ROI_DEFAULTS.maxInvestment.toLocaleString()}`);
    }
  }

  if (input.targetReduction !== undefined) {
    if (input.targetReduction < 0 || input.targetReduction > 100) {
      errors.push('Target reduction must be between 0% and 100%');
    }
  }

  if (input.timelineMonths !== undefined) {
    if (input.timelineMonths < 1 || input.timelineMonths > 60) {
      errors.push('Timeline must be between 1 and 60 months');
    }
  }

  if (input.discountRate !== undefined) {
    if (input.discountRate < 0 || input.discountRate > 1) {
      errors.push('Discount rate must be between 0% and 100%');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Check if ROI calculation is feasible
 *
 * @param alignmentTax - Current alignment tax
 * @param investment - Proposed investment
 * @returns True if inputs are sufficient for meaningful calculation
 */
export function canCalculateROI(alignmentTax: number, investment: number): boolean {
  return (
    alignmentTax > 0 &&
    investment >= ROI_DEFAULTS.minInvestment &&
    investment <= ROI_DEFAULTS.maxInvestment
  );
}

// ============================================================================
// Formatting Utilities
// ============================================================================

/**
 * Get scenario recommendation based on results
 *
 * @param results - Array of ROI results from generateScenarios
 * @returns Recommendation object
 */
export function getScenarioRecommendation(results: ROIResult[]): {
  recommended: ROIScenarioType;
  reason: string;
} {
  const moderate = results.find((r) => r.scenarioType === 'moderate');

  if (!moderate) {
    return {
      recommended: 'moderate',
      reason: 'Unable to analyze scenarios',
    };
  }

  // If payback is fast and ROI is high, conservative might be recommended
  if (moderate.paybackMonths < 12 && moderate.roiRatio > 3) {
    return {
      recommended: 'conservative',
      reason: 'Strong ROI allows for conservative approach with high certainty',
    };
  }

  // If payback is slow, aggressive might be needed
  if (moderate.paybackMonths > 24) {
    return {
      recommended: 'aggressive',
      reason: 'Longer payback period may require more ambitious targets',
    };
  }

  // Default to moderate
  return {
    recommended: 'moderate',
    reason: 'Balanced approach provides good returns with reasonable certainty',
  };
}

/**
 * Format NPV for executive presentation
 *
 * @param npv - Net Present Value
 * @returns Formatted string
 */
export function formatNPV(npv: number): string {
  const absNpv = Math.abs(npv);
  const sign = npv < 0 ? '-' : '';

  if (absNpv >= 1_000_000_000) {
    return `${sign}$${(absNpv / 1_000_000_000).toFixed(1)}B`;
  }
  if (absNpv >= 1_000_000) {
    return `${sign}$${(absNpv / 1_000_000).toFixed(1)}M`;
  }
  if (absNpv >= 1_000) {
    return `${sign}$${Math.round(absNpv / 1_000)}K`;
  }
  return `${sign}$${Math.round(absNpv).toLocaleString()}`;
}
