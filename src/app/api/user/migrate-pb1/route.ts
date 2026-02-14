/**
 * PB1 Data Migration API Endpoint
 *
 * Migrates PB1 session data to database after user registration.
 * Called after successful registration to persist diagnostic results.
 *
 * Covers: Story 15.7, FR40 (Session migration), FR55 (PB1→PB2 data)
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { migratePB1Session, type PB1SessionData } from '@/lib/auth/session-migration';

export async function POST(request: NextRequest) {
  try {
    // Get access token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required.',
          },
        },
        { status: 401 }
      );
    }

    // Verify token
    const payload = await verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid or expired token.',
          },
        },
        { status: 401 }
      );
    }

    // Parse session data from request body
    const body = await request.json();
    const sessionData: PB1SessionData = body.sessionData;

    if (!sessionData) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_DATA',
            message: 'No session data provided.',
          },
        },
        { status: 400 }
      );
    }

    // Migrate the session data
    const result = await migratePB1Session(payload.sub, sessionData);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MIGRATION_FAILED',
            message: result.error || 'Failed to migrate session data.',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        diagnosticResultId: result.diagnosticResultId,
        message: 'Session data migrated successfully.',
      },
    });
  } catch (error) {
    console.error('[migrate-pb1/POST] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An unexpected error occurred.',
        },
      },
      { status: 500 }
    );
  }
}
