/**
 * Meeting Audit Calculator - Server-side calculation logic.
 *
 * SECURITY: This module contains protected salary band rates (NFR12).
 * These rates should NEVER be exposed in client-side code.
 *
 * Formula (FR11, FR14):
 * Annual Meeting Waste = meetingCount x averageAttendees x (duration/60) x weightedRate x 52
 *
 * Covers: Story 3-1 Tasks 1, 3
 */

import type { SalaryBandDistribution } from '@/types/calculator.types';
import type {
  SalaryBandRates,
  MeetingWasteInput,
  MeetingWasteResult,
  CalculationConfig,
} from './types';

/**
 * Protected salary band hourly rates.
 * These are the proprietary rates from the book methodology.
 *
 * IMPORTANT: Server-side only - never expose to clients (NFR12).
 */
export const SALARY_BAND_RATES: SalaryBandRates = {
  executive: 150, // $150/hour - C-suite, VP compensation
  senior: 100, // $100/hour - Director-level
  midLevel: 65, // $65/hour - Manager, Senior IC
  entry: 35, // $35/hour - Junior staff
} as const;

/**
 * Calculation constants.
 */
export const WEEKS_PER_YEAR = 52;

/**
 * Full calculation configuration.
 */
export const CALCULATION_CONFIG: CalculationConfig = {
  weeksPerYear: WEEKS_PER_YEAR,
  salaryBandRates: SALARY_BAND_RATES,
};

/**
 * Calculates the weighted average hourly rate based on salary distribution.
 *
 * @param distribution - The salary band distribution (count of attendees per band)
 * @param rates - The hourly rates for each salary band
 * @returns The weighted average hourly rate
 */
export function calculateWeightedHourlyRate(
  distribution: SalaryBandDistribution,
  rates: SalaryBandRates = SALARY_BAND_RATES
): number {
  const totalAttendees =
    distribution.executive +
    distribution.senior +
    distribution.midLevel +
    distribution.entry;

  if (totalAttendees === 0) {
    return 0;
  }

  const weightedSum =
    distribution.executive * rates.executive +
    distribution.senior * rates.senior +
    distribution.midLevel * rates.midLevel +
    distribution.entry * rates.entry;

  return weightedSum / totalAttendees;
}

/**
 * Calculates annual meeting waste cost.
 *
 * Formula:
 * Annual Meeting Waste = meetingCount x averageAttendees x (duration/60) x weightedRate x 52
 *
 * This implements the book methodology for calculating meeting waste (FR11, FR14).
 *
 * @param input - The meeting audit input data
 * @returns The calculated meeting waste result
 */
export function calculateMeetingWaste(input: MeetingWasteInput): MeetingWasteResult {
  const { meetingCount, averageAttendees, averageDuration, salaryDistribution } = input;

  // Calculate weighted hourly rate based on salary distribution
  const weightedHourlyRate = calculateWeightedHourlyRate(salaryDistribution);

  // Convert duration from minutes to hours
  const durationInHours = averageDuration / 60;

  // Calculate cost per meeting (hourly waste)
  // hourlyWaste = attendees x durationInHours x weightedRate
  const hourlyWaste = averageAttendees * durationInHours * weightedHourlyRate;

  // Calculate annual meeting waste
  // meetingWaste = meetingCount x hourlyWaste x 52 weeks
  const meetingWaste = meetingCount * hourlyWaste * WEEKS_PER_YEAR;

  return {
    meetingWaste,
    hourlyWaste,
    weightedHourlyRate,
  };
}
