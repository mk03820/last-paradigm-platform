/**
 * Cost Calculation Constants and Types
 *
 * Defines cost types, calculation formulas, and helpers
 * for the Data Flow Friction Analysis tool.
 *
 * Story 12.3: Friction Cost Calculation
 * Covers: FR2-23 (Calculate friction costs)
 */

import type { FrictionPoint, FrictionCategory } from './friction-constants';

/**
 * Cost data associated with a friction point
 */
export interface FrictionCost {
  hoursPerWeek: number;      // Hours spent per week dealing with friction (0-40)
  hourlyRate: number;        // Blended hourly rate
  opportunityCost: number;   // Estimated annual opportunity cost
}

/**
 * Friction point extended with optional cost data
 */
export interface FrictionPointWithCost extends FrictionPoint {
  cost?: FrictionCost | null;
}

/**
 * Cost calculation constants (Playbook 1 methodology)
 */
export const WORKING_WEEKS_PER_YEAR = 48;  // Standard weeks minus PTO/holidays
export const DEFAULT_HOURLY_RATE = 75;     // $75/hour baseline
export const MAX_HOURS_PER_WEEK = 40;      // Maximum hours input

/**
 * Hourly rate presets
 */
export interface HourlyRatePreset {
  value: number;
  label: string;
  description: string;
  isDefault?: boolean;
}

export const HOURLY_RATE_PRESETS: HourlyRatePreset[] = [
  {
    value: 50,
    label: '$50/hr',
    description: 'Junior Staff / Entry Level',
  },
  {
    value: 75,
    label: '$75/hr',
    description: 'Mid-Level Staff',
    isDefault: true,
  },
  {
    value: 100,
    label: '$100/hr',
    description: 'Senior Staff / Specialists',
  },
  {
    value: 150,
    label: '$150/hr',
    description: 'Leadership / Executives',
  },
];

/**
 * Get default hourly rate preset
 */
export function getDefaultHourlyRatePreset(): HourlyRatePreset {
  return HOURLY_RATE_PRESETS.find((p) => p.isDefault) || HOURLY_RATE_PRESETS[1];
}

/**
 * Calculate annualized FTE cost
 * Formula: Hours/Week × Hourly Rate × 48 weeks
 */
export function calculateFTECost(hoursPerWeek: number, hourlyRate: number): number {
  return hoursPerWeek * hourlyRate * WORKING_WEEKS_PER_YEAR;
}

/**
 * Calculate total friction cost (FTE + opportunity)
 */
export function calculateTotalFrictionCost(cost: FrictionCost): number {
  return calculateFTECost(cost.hoursPerWeek, cost.hourlyRate) + cost.opportunityCost;
}

/**
 * Calculate total cost for a friction point
 * Returns 0 if no cost data
 */
export function calculateFrictionPointCost(point: FrictionPointWithCost): number {
  if (!point.cost) return 0;
  return calculateTotalFrictionCost(point.cost);
}

/**
 * Calculate total cost for a journey
 */
export function calculateJourneyCost(points: FrictionPointWithCost[]): number {
  return points.reduce((sum, point) => sum + calculateFrictionPointCost(point), 0);
}

/**
 * Calculate enterprise-wide total cost across all journeys
 */
export function calculateEnterpriseTotalCost(
  allPoints: FrictionPointWithCost[]
): number {
  return allPoints.reduce((sum, point) => sum + calculateFrictionPointCost(point), 0);
}

/**
 * Calculate cost breakdown by category
 */
export function calculateCostByCategory(
  points: FrictionPointWithCost[]
): Record<FrictionCategory, number> {
  const costs: Record<FrictionCategory, number> = {
    access_bureaucracy: 0,
    quality_degradation: 0,
    multiple_sources: 0,
    technical_debt: 0,
  };

  for (const point of points) {
    costs[point.category] += calculateFrictionPointCost(point);
  }

  return costs;
}

/**
 * Calculate FTE vs opportunity cost breakdown
 */
export function calculateCostBreakdown(
  points: FrictionPointWithCost[]
): { fteCost: number; opportunityCost: number; total: number } {
  let fteCost = 0;
  let opportunityCost = 0;

  for (const point of points) {
    if (point.cost) {
      fteCost += calculateFTECost(point.cost.hoursPerWeek, point.cost.hourlyRate);
      opportunityCost += point.cost.opportunityCost;
    }
  }

  return {
    fteCost,
    opportunityCost,
    total: fteCost + opportunityCost,
  };
}

/**
 * Create default cost data
 */
export function createDefaultCost(): FrictionCost {
  return {
    hoursPerWeek: 0,
    hourlyRate: DEFAULT_HOURLY_RATE,
    opportunityCost: 0,
  };
}

/**
 * Validate cost data
 */
export interface CostValidation {
  valid: boolean;
  errors: {
    hoursPerWeek?: string;
    hourlyRate?: string;
    opportunityCost?: string;
  };
}

export function validateCost(cost: Partial<FrictionCost>): CostValidation {
  const errors: CostValidation['errors'] = {};

  if (cost.hoursPerWeek !== undefined) {
    if (cost.hoursPerWeek < 0) {
      errors.hoursPerWeek = 'Hours per week cannot be negative';
    } else if (cost.hoursPerWeek > MAX_HOURS_PER_WEEK) {
      errors.hoursPerWeek = `Hours per week cannot exceed ${MAX_HOURS_PER_WEEK}`;
    }
  }

  if (cost.hourlyRate !== undefined && cost.hourlyRate < 0) {
    errors.hourlyRate = 'Hourly rate cannot be negative';
  }

  if (cost.opportunityCost !== undefined && cost.opportunityCost < 0) {
    errors.opportunityCost = 'Opportunity cost cannot be negative';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format large currency with abbreviation
 */
export function formatCurrencyAbbreviated(amount: number): string {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(0)}K`;
  }
  return formatCurrency(amount);
}

/**
 * Get cost methodology explanation
 */
export function getCostMethodology(): {
  formula: string;
  assumptions: string[];
  example: { inputs: string; calculation: string; result: string };
} {
  return {
    formula: 'Annual Cost = (Hours/Week × Hourly Rate × 48 weeks) + Opportunity Cost',
    assumptions: [
      '48 working weeks per year (accounting for PTO and holidays)',
      'Blended hourly rate includes fully-loaded cost (salary + benefits + overhead)',
      'Opportunity cost includes revenue delayed, decisions postponed, and competitive disadvantage',
    ],
    example: {
      inputs: '10 hours/week at $75/hour + $5,000 opportunity cost',
      calculation: '(10 × $75 × 48) + $5,000',
      result: '$36,000 + $5,000 = $41,000/year',
    },
  };
}

/**
 * Count friction points with cost data
 */
export function countPointsWithCost(points: FrictionPointWithCost[]): number {
  return points.filter((p) => p.cost && (p.cost.hoursPerWeek > 0 || p.cost.opportunityCost > 0)).length;
}

/**
 * Calculate completion percentage for cost entry
 */
export function calculateCostCompletion(points: FrictionPointWithCost[]): number {
  if (points.length === 0) return 0;
  return Math.round((countPointsWithCost(points) / points.length) * 100);
}

/**
 * Generate unique cost ID
 */
export function generateCostId(): string {
  return `cost_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
