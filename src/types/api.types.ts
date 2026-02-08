import type { MeetingAuditInput, SalaryBandDistribution } from './calculator.types';

/**
 * API Response types for calculation endpoints.
 *
 * Covers: Story 3-1 Task 4 - Response Types
 */

// Success response wrapper
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

// Error response wrapper
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

// Union type for API responses
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Meeting Audit calculation request body.
 * Same as MeetingAuditInput but explicitly typed for API consumption.
 */
export interface MeetingAuditRequest {
  meetingCount: number;
  averageAttendees: number;
  averageDuration: number; // in minutes
  salaryDistribution: SalaryBandDistribution;
}

/**
 * Meeting Audit calculation result.
 *
 * Contains the calculated waste amount and breakdown for transparency.
 */
export interface MeetingAuditResult {
  meetingWaste: number; // Annual waste in dollars
  hourlyWaste: number; // Per-meeting waste (cost per meeting)
  weightedHourlyRate: number; // Calculated weighted rate based on salary distribution
  assumptions: {
    weeksPerYear: number; // 52
    salaryBands: Record<string, number>; // Rates used (for transparency)
  };
}

/**
 * Helper type to ensure request matches input type.
 */
export type ValidMeetingAuditRequest = MeetingAuditInput;
