/**
 * Savings Calculator Service
 *
 * Calculates estimated savings from alignment tax reduction
 * and provides severity-based context messaging.
 *
 * Story 16.1: Preview Page Layout & Savings Headline
 * Task 2: Create savings calculation service
 * Covers: AC1, AC3 (FR43)
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Severity level for alignment tax interpretation
 */
export type SeverityLevel = 'normal' | 'significant' | 'crisis' | 'existential';

/**
 * Context for personalized savings messaging
 */
export interface SavingsContext {
  headline: string;
  subheadline: string;
  severityLevel: SeverityLevel;
  ctaMessage: string;
  color: string;
  bgColor: string;
}

/**
 * User diagnostic data for savings calculation
 */
export interface DiagnosticDataForSavings {
  totalAlignmentTax: number;
  annualRevenue: number;
  percentOfRevenue: number;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Default recovery rate (50% alignment tax reduction target)
 * Based on industry benchmarks for organizational transformation
 */
export const DEFAULT_RECOVERY_RATE = 0.5;

/**
 * Interpretation thresholds for alignment tax as % of revenue
 * - <2%: Normal (green)
 * - 2-4%: Significant (yellow)
 * - 4-7%: Crisis (orange)
 * - >7%: Existential (red)
 */
export const SEVERITY_THRESHOLDS = {
  normal: { min: 0, max: 2 },
  significant: { min: 2, max: 4 },
  crisis: { min: 4, max: 7 },
  existential: { min: 7, max: Infinity },
} as const;

// ============================================================================
// Calculation Functions
// ============================================================================

/**
 * Calculate estimated annual savings from alignment tax reduction
 *
 * @param totalAlignmentTax - Current annual alignment tax in dollars
 * @param recoveryRate - Target reduction rate (default 50%)
 * @returns Estimated annual savings in dollars
 */
export function calculateEstimatedSavings(
  totalAlignmentTax: number,
  recoveryRate: number = DEFAULT_RECOVERY_RATE
): number {
  if (totalAlignmentTax < 0 || recoveryRate < 0 || recoveryRate > 1) {
    return 0;
  }
  return Math.round(totalAlignmentTax * recoveryRate);
}

/**
 * Determine severity level based on alignment tax as percentage of revenue
 *
 * @param percentOfRevenue - Alignment tax as % of revenue
 * @returns Severity level classification
 */
export function getSeverityLevel(percentOfRevenue: number): SeverityLevel {
  if (percentOfRevenue < SEVERITY_THRESHOLDS.normal.max) {
    return 'normal';
  }
  if (percentOfRevenue < SEVERITY_THRESHOLDS.significant.max) {
    return 'significant';
  }
  if (percentOfRevenue < SEVERITY_THRESHOLDS.crisis.max) {
    return 'crisis';
  }
  return 'existential';
}

/**
 * Get personalized savings context based on severity level
 *
 * @param percentOfRevenue - Alignment tax as % of revenue
 * @returns Context with headline, subheadline, and styling
 */
export function getSavingsContext(percentOfRevenue: number): SavingsContext {
  const severityLevel = getSeverityLevel(percentOfRevenue);

  switch (severityLevel) {
    case 'normal':
      return {
        headline: 'Fine-tune your operations',
        subheadline:
          'Your alignment tax is within normal ranges, but optimization can still deliver meaningful returns.',
        severityLevel: 'normal',
        ctaMessage: 'Capture available savings',
        color: 'text-green-700 dark:text-green-300',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
      };

    case 'significant':
      return {
        headline: 'Meaningful savings await',
        subheadline:
          'Your alignment tax is above average. Focused intervention will deliver significant returns.',
        severityLevel: 'significant',
        ctaMessage: 'Unlock your savings potential',
        color: 'text-yellow-700 dark:text-yellow-300',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      };

    case 'crisis':
      return {
        headline: 'Urgent intervention required',
        subheadline:
          'Your alignment tax is at crisis level. Immediate transformation is essential for competitiveness.',
        severityLevel: 'crisis',
        ctaMessage: 'Start your transformation now',
        color: 'text-orange-700 dark:text-orange-300',
        bgColor: 'bg-orange-100 dark:bg-orange-900/30',
      };

    case 'existential':
      return {
        headline: 'Transform or face extinction',
        subheadline:
          'Your alignment tax poses an existential threat. Comprehensive transformation is required for survival.',
        severityLevel: 'existential',
        ctaMessage: 'Begin your survival plan',
        color: 'text-red-700 dark:text-red-300',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
      };
  }
}

// ============================================================================
// Formatting Functions
// ============================================================================

/**
 * Format currency for executive presentation
 *
 * Examples:
 * - 2400000 -> "$2.4M annually"
 * - 500000 -> "$500K annually"
 * - 50000 -> "$50K annually"
 *
 * @param amount - Dollar amount
 * @returns Formatted string (e.g., "$2.4M")
 */
export function formatSavingsAmount(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  }
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `$${Math.round(amount / 1_000)}K`;
  }
  return `$${Math.round(amount).toLocaleString()}`;
}

/**
 * Format percentage for display
 *
 * @param value - Percentage value (e.g., 5.2 for 5.2%)
 * @returns Formatted string (e.g., "5.2%")
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Parse numeric string from database to number
 *
 * @param value - String or number value
 * @returns Parsed number
 */
export function parseNumericValue(value: string | number | null): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}
