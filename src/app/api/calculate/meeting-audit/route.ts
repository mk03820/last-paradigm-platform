import { NextRequest, NextResponse } from 'next/server';
import { meetingAuditRequestWithTotalValidation } from '@/lib/schemas/meeting-audit-request.schema';
import { calculateMeetingWaste, SALARY_BAND_RATES, WEEKS_PER_YEAR } from '@/lib/calculations';
import type { ApiResponse, MeetingAuditResult } from '@/types/api.types';

/**
 * POST /api/calculate/meeting-audit
 *
 * Calculates annual meeting waste based on the book methodology.
 * This endpoint protects the calculation logic and salary rates (NFR12).
 *
 * Request body: MeetingAuditRequest
 * Response: ApiResponse<MeetingAuditResult>
 *
 * Covers: Story 3-1 Tasks 2, 5
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<MeetingAuditResult>>> {
  // Development timing log
  const startTime = performance.now();

  let body: unknown;

  try {
    // Parse request body
    body = await request.json();
  } catch {
    // Handle JSON parsing errors
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INVALID_JSON',
          message: 'Request body must be valid JSON',
        },
      },
      { status: 400 }
    );
  }

  try {

    // Validate input with Zod schema
    const validationResult = meetingAuditRequestWithTotalValidation.safeParse(body);

    if (!validationResult.success) {
      // Return validation error response
      const firstError = validationResult.error.errors[0];
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: firstError?.message || 'Invalid input',
          },
        },
        { status: 400 }
      );
    }

    const input = validationResult.data;

    // Perform calculation
    const result = calculateMeetingWaste(input);

    // Build response with transparency data
    const response: MeetingAuditResult = {
      meetingWaste: result.meetingWaste,
      hourlyWaste: result.hourlyWaste,
      weightedHourlyRate: result.weightedHourlyRate,
      assumptions: {
        weeksPerYear: WEEKS_PER_YEAR,
        salaryBands: {
          executive: SALARY_BAND_RATES.executive,
          senior: SALARY_BAND_RATES.senior,
          midLevel: SALARY_BAND_RATES.midLevel,
          entry: SALARY_BAND_RATES.entry,
        },
      },
    };

    // Development timing log
    const endTime = performance.now();
    if (process.env.NODE_ENV === 'development') {
      console.log(`[meeting-audit] Calculation completed in ${(endTime - startTime).toFixed(2)}ms`);
    }

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    // Log unexpected errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[meeting-audit] Unexpected error:', error);
    }

    // Return generic error for unexpected issues
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}
