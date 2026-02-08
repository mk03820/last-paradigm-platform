/**
 * Calculation Engine - Public API
 *
 * Exports calculation functions and types for use by API routes.
 * IMPORTANT: This module contains protected methodology - server-side only (NFR12).
 *
 * Covers: Story 3-1
 */

// Calculation functions
export {
  calculateMeetingWaste,
  calculateWeightedHourlyRate,
  SALARY_BAND_RATES,
  WEEKS_PER_YEAR,
  CALCULATION_CONFIG,
} from './meeting-audit';

// Types
export type {
  SalaryBandRates,
  MeetingWasteInput,
  MeetingWasteResult,
  CalculationConfig,
} from './types';
