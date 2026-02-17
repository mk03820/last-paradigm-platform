/**
 * Resume Registration API Endpoint
 *
 * Validates resume token and returns email address for form pre-fill.
 * Used when user clicks the "Complete Registration" link in abandonment email.
 *
 * Story 15.9: Registration Abandonment Recovery
 * Covers: Task 6, AC3 (Pre-fill email from resume link)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { abandonedRegistrations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'No token provided.',
          },
        },
        { status: 400 }
      );
    }

    // Look up the abandonment record by token
    const [record] = await db
      .select()
      .from(abandonedRegistrations)
      .where(eq(abandonedRegistrations.token, token))
      .limit(1);

    if (!record) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid or expired token.',
          },
        },
        { status: 404 }
      );
    }

    // Check if already completed
    if (record.completedAt) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ALREADY_COMPLETED',
            message: 'Registration has already been completed.',
          },
        },
        { status: 400 }
      );
    }

    // Return the email for form pre-fill
    return NextResponse.json({
      success: true,
      email: record.email,
    });
  } catch (error) {
    console.error('[resume-registration/GET] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An unexpected error occurred. Please try again.',
        },
      },
      { status: 500 }
    );
  }
}
