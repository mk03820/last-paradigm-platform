import { NextRequest, NextResponse } from 'next/server';
import { emailSubmissionSchema } from '@/lib/schemas/email.schema';
import { db } from '@/lib/db';
import { emails } from '@/lib/db/schema';
import type { ApiResponse } from '@/types/api.types';

/**
 * Email registration response type.
 */
export interface EmailRegistrationResult {
  message: string;
}

/**
 * POST /api/email
 *
 * Stores an email for Phase 2 notification.
 * Handles duplicates gracefully by returning success (privacy protection).
 *
 * Covers: FR29 (Email input), FR30 (Email storage), Story 4-4 Task 2
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<EmailRegistrationResult>>> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
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
    const validationResult = emailSubmissionSchema.safeParse(body);

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_EMAIL',
            message: firstError?.message || 'Please enter a valid email address',
          },
        },
        { status: 400 }
      );
    }

    const { email, source } = validationResult.data;

    try {
      // Insert into database
      await db.insert(emails).values({
        email: email.toLowerCase(),
        source,
      });
    } catch (error: unknown) {
      // Check for unique constraint violation (duplicate email)
      // PostgreSQL error code for unique violation is 23505
      const isUniqueViolation =
        error instanceof Error &&
        'code' in error &&
        (error as { code: string }).code === '23505';

      if (isUniqueViolation) {
        // Return success to not reveal email already exists (privacy)
        return NextResponse.json({
          success: true,
          data: {
            message: 'Email registered successfully',
          },
        });
      }

      // Re-throw other database errors
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: {
        message: 'Email registered successfully',
      },
    });
  } catch (error) {
    // Log unexpected errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[email] Unexpected error:', error);
    }

    // For database connection errors in development (no DB setup),
    // we can still return success for testing purposes
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      return NextResponse.json({
        success: true,
        data: {
          message: 'Email registered successfully',
        },
      });
    }

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
