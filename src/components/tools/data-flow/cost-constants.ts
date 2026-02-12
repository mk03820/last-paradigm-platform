/**
 * Cost Calculation Constants and Types
 *
 * Defines cost types, calculation formulas, and helpers
 * for the Data Flow Friction Analysis tool.
 *
 * Story 12.3: Friction Cost Calculation
 * Covers: FR2-23 (Calculate friction costs)
 */

import type { FrictionPoint, FrictionCategory, SeverityScore } from './friction-constants';
import {
  isOrganizationalFriction,
  calculateTotalSeverity,
} from './friction-constants';

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

/**
 * Friction interpretation types and constants
 * Story 12.4: Friction Category Breakdown and Recommendations
 */

export type DominantFrictionType = 'organizational' | 'technical' | 'balanced';

export interface FrictionInterpretation {
  dominantType: DominantFrictionType;
  ratio: number; // organizational / total (0-1)
  percentage: number; // organizational percentage (0-100)
  headline: string;
  description: string;
  recommendations: string[];
}

/**
 * Critical severity threshold (AC4: severity 7-9 highlighted as critical)
 */
export const CRITICAL_SEVERITY_THRESHOLD = 7;

/**
 * Interpretation text constants for dominant friction types
 */
export const INTERPRETATION_TEXT: Record<
  DominantFrictionType,
  { headline: string; description: string; recommendations: string[] }
> = {
  organizational: {
    headline: 'Friction is primarily organizational',
    description:
      "Most data friction comes from process and governance issues, not technical limitations. Technology investment alone won't solve these problems.",
    recommendations: [
      'Review data access policies and approval workflows',
      'Establish single sources of truth with clear ownership',
      'Implement data quality standards and monitoring',
      'Consider organizational change before platform changes',
    ],
  },
  technical: {
    headline: 'Friction is primarily technical',
    description:
      'Most data friction stems from technical debt and infrastructure limitations. Technology modernization may provide significant returns.',
    recommendations: [
      'Prioritize technical debt reduction in data pipelines',
      'Evaluate modern data platform options',
      'Invest in automation and self-service capabilities',
      'Consider incremental platform modernization',
    ],
  },
  balanced: {
    headline: 'Friction is balanced across organizational and technical factors',
    description:
      'Data friction comes from both process and technology issues. A holistic approach addressing both is needed.',
    recommendations: [
      'Address quick-win organizational improvements first',
      'Create roadmap for technical modernization',
      'Ensure governance keeps pace with technology changes',
      'Consider phased transformation approach',
    ],
  },
};

/**
 * Calculate organizational vs technical cost breakdown
 */
export function calculateOrganizationalVsTechnicalCost(
  costByCategory: Record<FrictionCategory, number>
): { organizationalCost: number; technicalCost: number; total: number } {
  let organizationalCost = 0;
  let technicalCost = 0;

  for (const [category, cost] of Object.entries(costByCategory)) {
    if (isOrganizationalFriction(category as FrictionCategory)) {
      organizationalCost += cost;
    } else {
      technicalCost += cost;
    }
  }

  return {
    organizationalCost,
    technicalCost,
    total: organizationalCost + technicalCost,
  };
}

/**
 * Interpret friction breakdown based on cost distribution
 * - >= 70% organizational: "organizational" dominant
 * - <= 30% organizational: "technical" dominant
 * - Between: "balanced"
 */
export function interpretFrictionBreakdown(
  costByCategory: Record<FrictionCategory, number>
): FrictionInterpretation {
  const { organizationalCost, technicalCost, total } =
    calculateOrganizationalVsTechnicalCost(costByCategory);

  // Handle edge case of no costs
  if (total === 0) {
    return {
      dominantType: 'balanced',
      ratio: 0.5,
      percentage: 50,
      ...INTERPRETATION_TEXT.balanced,
    };
  }

  const ratio = organizationalCost / total;
  const percentage = Math.round(ratio * 100);

  let dominantType: DominantFrictionType;
  if (ratio >= 0.7) {
    dominantType = 'organizational';
  } else if (ratio <= 0.3) {
    dominantType = 'technical';
  } else {
    dominantType = 'balanced';
  }

  return {
    dominantType,
    ratio,
    percentage,
    ...INTERPRETATION_TEXT[dominantType],
  };
}

/**
 * Get critical friction points (severity 7-9)
 * AC4: Highlight severity 7-9 friction points as critical
 */
export function getCriticalFrictionPoints(
  points: FrictionPointWithCost[]
): FrictionPointWithCost[] {
  return points
    .filter((p) => calculateTotalSeverity(p.severity) >= CRITICAL_SEVERITY_THRESHOLD)
    .sort((a, b) => calculateTotalSeverity(b.severity) - calculateTotalSeverity(a.severity));
}

/**
 * Check if a severity score is critical
 */
export function isCriticalSeverity(severity: SeverityScore): boolean {
  return calculateTotalSeverity(severity) >= CRITICAL_SEVERITY_THRESHOLD;
}
