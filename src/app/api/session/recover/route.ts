/**
 * Session Recovery API Route
 *
 * GET /api/session/recover?token=xxx - Retrieve saved session data
 *
 * Validates the recovery token and returns the saved PB1 diagnostic data.
 * Updates the usedAt timestamp on successful recovery.
 *
 * Covers: Story 15.8, FR70 (Pre-account results preservation)
 * Covers: AC5, AC6, AC9
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { preservedSessions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { RecoverSessionResponse } from '@/types/auth.types';

/**
 * GET /api/session/recover?token=xxx
 * Retrieve and validate a preserved session
 */
export async function GET(
  request: Request
): Promise<NextResponse<RecoverSessionResponse>> {
  try {
    // Extract token from query params
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_TOKEN' as const,
            message: 'No recovery token provided',
          },
        },
        { status: 400 }
      );
    }

    // Validate token format (UUID v4 format from crypto.randomUUID())
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(token)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_TOKEN' as const,
            message: 'Invalid or unknown recovery link.',
          },
        },
        { status: 400 }
      );
    }

    // Look up the preserved session
    const sessions = await db
      .select()
      .from(preservedSessions)
      .where(eq(preservedSessions.token, token))
      .limit(1);

    const session = sessions[0];

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_TOKEN' as const,
            message: 'Invalid or unknown recovery link.',
          },
        },
        { status: 404 }
      );
    }

    // Check if expired (AC9)
    const now = new Date();
    if (new Date(session.expiresAt) < now) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'EXPIRED' as const,
            message: 'This link has expired. Please request a new one.',
          },
        },
        { status: 410 }
      );
    }

    // Update usedAt timestamp for audit purposes
    await db
      .update(preservedSessions)
      .set({ usedAt: now })
      .where(eq(preservedSessions.token, token));

    // Return the session data (AC5, AC6 - works on any device/browser)
    return NextResponse.json({
      success: true,
      data: session.sessionData,
    });
  } catch (error) {
    console.error('[session/recover/GET] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR' as const,
          message: 'Failed to recover session',
        },
      },
      { status: 500 }
    );
  }
}
