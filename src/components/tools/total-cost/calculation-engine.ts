/**
 * Alignment Tax Calculation Engine
 *
 * Core calculation logic for the Total Cost of Misalignment Calculator.
 * Aggregates costs from diagnostic tools and manual inputs.
 *
 * Story 14.3: Alignment Tax Calculation and Interpretation
 * Covers: FR2-33 (Calculate total alignment tax)
 */

import type {
  AggregatedToolData,
  AdditionalCosts,
  AlignmentTaxResult,
  InterpretationThreshold,
  CostSourceItem,
  CostSourceId,
} from './cost-constants';
import {
  getInterpretationByPercent,
  COST_SOURCES,
  createEmptyAdditionalCosts,
} from './cost-constants';

// ============================================================================
// Core Calculation Functions
// ============================================================================

/**
 * Calculate total alignment tax from all sources
 *
 * Sums:
 * - Meeting waste (Tool 2)
 * - Data friction (Tool 5)
 * - Project delays (manual input)
 * - Rework (manual input)
 * - Turnover (manual input)
 * - Opportunity cost (manual input)
 *
 * @param aggregatedData - Data aggregated from diagnostic tools
 * @param additionalCosts - Manually entered additional costs
 * @param revenue - Annual revenue for percentage calculation
 * @returns Complete alignment tax result
 */
export function calculateTotalAlignmentTax(
  aggregatedData: AggregatedToolData,
  additionalCosts: AdditionalCosts | null,
  revenue: number
): AlignmentTaxResult {
  // Extract tool-based costs
  const meetingWaste = aggregatedData.tool2?.annualizedWaste ?? 0;
  const dataFriction = aggregatedData.tool5?.totalFrictionCost ?? 0;

  // Use empty costs if null
  const costs = additionalCosts ?? createEmptyAdditionalCosts();

  // Calculate subtotals
  const toolsSubtotal = meetingWaste + dataFriction;
  const additionalSubtotal = costs.total;
  const total = toolsSubtotal + additionalSubtotal;

  // Calculate percentage of revenue
  const percentOfRevenue = calculatePercentOfRevenue(total, revenue);

  // Get interpretation based on percentage
  const interpretation = getInterpretation(percentOfRevenue);

  return {
    meetingWaste,
    dataFriction,
    projectDelays: costs.projectDelays.subtotal,
    rework: costs.rework.subtotal,
    turnover: costs.turnover.subtotal,
    opportunityCost: costs.opportunityCost.subtotal,
    toolsSubtotal,
    additionalSubtotal,
    total,
    revenue,
    percentOfRevenue,
    interpretation,
  };
}

/**
 * Calculate alignment tax as percentage of revenue
 *
 * @param total - Total alignment tax in dollars
 * @param revenue - Annual revenue in dollars
 * @returns Percentage (0-100+)
 */
export function calculatePercentOfRevenue(total: number, revenue: number): number {
  if (revenue <= 0) return 0;
  return (total / revenue) * 100;
}

/**
 * Get interpretation based on percentage of revenue
 *
 * Thresholds:
 * - <2%: Normal (green)
 * - 2-4%: Significant (yellow)
 * - 4-7%: Crisis (orange)
 * - >7%: Existential (red)
 *
 * @param percentOfRevenue - Alignment tax as % of revenue
 * @returns Interpretation threshold configuration
 */
export function getInterpretation(percentOfRevenue: number): InterpretationThreshold {
  return getInterpretationByPercent(percentOfRevenue);
}

// ============================================================================
// Cost Source Breakdown Functions
// ============================================================================

/**
 * Build cost source items for breakdown display
 *
 * @param result - Alignment tax calculation result
 * @returns Array of cost source items with percentages
 */
export function buildCostSourceItems(result: AlignmentTaxResult): CostSourceItem[] {
  const items: CostSourceItem[] = [];
  const total = result.total;

  // Helper to calculate percentage
  const calcPercent = (amount: number) => (total > 0 ? (amount / total) * 100 : 0);

  // Add meeting waste (Tool 2)
  if (result.meetingWaste > 0) {
    items.push({
      id: 'meetingWaste',
      label: 'Meeting Waste',
      amount: result.meetingWaste,
      percentage: calcPercent(result.meetingWaste),
      source: 'tool',
      toolNumber: 2,
    });
  }

  // Add data friction (Tool 5)
  if (result.dataFriction > 0) {
    items.push({
      id: 'dataFriction',
      label: 'Data Friction',
      amount: result.dataFriction,
      percentage: calcPercent(result.dataFriction),
      source: 'tool',
      toolNumber: 5,
    });
  }

  // Add project delays
  if (result.projectDelays > 0) {
    items.push({
      id: 'projectDelays',
      label: 'Project Delays',
      amount: result.projectDelays,
      percentage: calcPercent(result.projectDelays),
      source: 'input',
    });
  }

  // Add rework
  if (result.rework > 0) {
    items.push({
      id: 'rework',
      label: 'Rework',
      amount: result.rework,
      percentage: calcPercent(result.rework),
      source: 'input',
    });
  }

  // Add turnover
  if (result.turnover > 0) {
    items.push({
      id: 'turnover',
      label: 'Excess Turnover',
      amount: result.turnover,
      percentage: calcPercent(result.turnover),
      source: 'input',
    });
  }

  // Add opportunity cost
  if (result.opportunityCost > 0) {
    items.push({
      id: 'opportunityCost',
      label: 'Opportunity Cost',
      amount: result.opportunityCost,
      percentage: calcPercent(result.opportunityCost),
      source: 'input',
    });
  }

  return items;
}

/**
 * Get tool-sourced cost items only
 */
export function getToolCostItems(items: CostSourceItem[]): CostSourceItem[] {
  return items.filter((item) => item.source === 'tool');
}

/**
 * Get manually-input cost items only
 */
export function getInputCostItems(items: CostSourceItem[]): CostSourceItem[] {
  return items.filter((item) => item.source === 'input');
}

// ============================================================================
// Formatting Functions
// ============================================================================

/**
 * Format currency for executive presentation
 *
 * Abbreviates large numbers:
 * - >= 1B: $X.XB
 * - >= 1M: $X.XM
 * - >= 1K: $XXK
 * - < 1K: $XXX
 *
 * @param value - Dollar amount
 * @returns Formatted string (e.g., "$2.9M")
 */
export function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${Math.round(value / 1_000)}K`;
  }
  return `$${Math.round(value).toLocaleString()}`;
}

/**
 * Format currency with full precision
 *
 * @param value - Dollar amount
 * @returns Formatted string with commas (e.g., "$2,900,000")
 */
export function formatFullCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

/**
 * Format percentage for display
 *
 * @param value - Percentage value (e.g., 4.2 for 4.2%)
 * @returns Formatted string (e.g., "4.2%")
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Format percentage with appropriate precision
 *
 * Uses 1 decimal for values < 10%, 0 decimals otherwise
 *
 * @param value - Percentage value
 * @returns Formatted string
 */
export function formatPercentSmart(value: number): string {
  if (value < 10) {
    return `${value.toFixed(1)}%`;
  }
  return `${Math.round(value)}%`;
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Check if alignment tax calculation has valid data
 *
 * @param result - Alignment tax result
 * @returns True if result has meaningful data
 */
export function hasValidResult(result: AlignmentTaxResult | null): boolean {
  if (!result) return false;
  return result.total > 0 && result.revenue > 0;
}

/**
 * Check if all required inputs are present
 *
 * @param aggregatedData - Tool data
 * @param revenue - Revenue amount
 * @returns True if minimum requirements met (Tool 2 data + revenue)
 */
export function hasMinimumRequirements(
  aggregatedData: AggregatedToolData | null,
  revenue: number
): boolean {
  if (!aggregatedData) return false;
  return aggregatedData.tool2 !== null && revenue > 0;
}

// ============================================================================
// Summary Functions
// ============================================================================

/**
 * Get count of cost sources with non-zero values
 *
 * @param result - Alignment tax result
 * @returns Number of active cost sources
 */
export function countActiveCostSources(result: AlignmentTaxResult): number {
  let count = 0;
  if (result.meetingWaste > 0) count++;
  if (result.dataFriction > 0) count++;
  if (result.projectDelays > 0) count++;
  if (result.rework > 0) count++;
  if (result.turnover > 0) count++;
  if (result.opportunityCost > 0) count++;
  return count;
}

/**
 * Get the largest cost source
 *
 * @param result - Alignment tax result
 * @returns Cost source ID and amount, or null if no costs
 */
export function getLargestCostSource(
  result: AlignmentTaxResult
): { id: CostSourceId; amount: number } | null {
  const sources: { id: CostSourceId; amount: number }[] = [
    { id: 'meetingWaste', amount: result.meetingWaste },
    { id: 'dataFriction', amount: result.dataFriction },
    { id: 'projectDelays', amount: result.projectDelays },
    { id: 'rework', amount: result.rework },
    { id: 'turnover', amount: result.turnover },
    { id: 'opportunityCost', amount: result.opportunityCost },
  ];

  const sorted = sources.sort((a, b) => b.amount - a.amount);
  if (sorted[0].amount > 0) {
    return sorted[0];
  }
  return null;
}

/**
 * Get cost source label by ID
 */
export function getCostSourceLabel(id: CostSourceId): string {
  const source = COST_SOURCES.find((s) => s.id === id);
  return source?.label ?? id;
}
