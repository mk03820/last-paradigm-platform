/**
 * Shared calculation types for the calculation engine.
 *
 * Covers: Story 3-1 Task 1 - Calculation Module Types
 */

import type { SalaryBandDistribution } from '@/types/calculator.types';

/**
 * Salary band hourly rates.
 * IMPORTANT: These values are server-side only and should never be exposed to clients.
 * This satisfies NFR12 - Methodology Protection.
 */
export interface SalaryBandRates {
  executive: number;
  senior: number;
  midLevel: number;
  entry: number;
}

/**
 * Input for meeting waste calculation.
 */
export interface MeetingWasteInput {
  meetingCount: number;
  averageAttendees: number;
  averageDuration: number; // in minutes
  salaryDistribution: SalaryBandDistribution;
}

/**
 * Result of meeting waste calculation.
 */
export interface MeetingWasteResult {
  meetingWaste: number; // Annual meeting waste in dollars
  hourlyWaste: number; // Cost per meeting
  weightedHourlyRate: number; // Weighted average hourly rate
}

/**
 * Configuration constants for calculations.
 */
export interface CalculationConfig {
  weeksPerYear: number;
  salaryBandRates: SalaryBandRates;
}
