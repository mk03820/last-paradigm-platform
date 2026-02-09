/**
 * Sessions API Route
 *
 * GET /api/sessions - List user's diagnostic sessions
 * POST /api/sessions - Create a new diagnostic session
 *
 * Covers: FR2-3 (View saved sessions), FR2-4 (Cross-device continuity)
 */

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { diagnosticSessions } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { toSessionSummary } from '@/types/session.types';
import type {
  SessionListResponse,
  SessionResponse,
  SessionErrorResponse,
  CreateSessionRequest,
} from '@/types/session.types';

/**
 * GET /api/sessions
 * Returns all diagnostic sessions for the authenticated user
 */
export async function GET(): Promise<
  NextResponse<SessionListResponse | SessionErrorResponse>
> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be signed in to view sessions',
          },
        },
        { status: 401 }
      );
    }

    const sessions = await db
      .select()
      .from(diagnosticSessions)
      .where(eq(diagnosticSessions.userId, session.user.id))
      .orderBy(desc(diagnosticSessions.updatedAt));

    return NextResponse.json({
      success: true,
      data: {
        sessions: sessions.map(toSessionSummary),
      },
    });
  } catch (error) {
    console.error('[sessions/GET] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch sessions',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sessions
 * Creates a new diagnostic session for the authenticated user
 */
export async function POST(
  request: Request
): Promise<NextResponse<SessionResponse | SessionErrorResponse>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be signed in to create a session',
          },
        },
        { status: 401 }
      );
    }

    let body: CreateSessionRequest = {};
    try {
      body = await request.json();
    } catch {
      // Empty body is fine, we'll use defaults
    }

    // Generate a default name if not provided
    const sessionCount = await db
      .select()
      .from(diagnosticSessions)
      .where(eq(diagnosticSessions.userId, session.user.id));

    const defaultName = `Diagnostic Session ${sessionCount.length + 1}`;

    const [newSession] = await db
      .insert(diagnosticSessions)
      .values({
        userId: session.user.id,
        name: body.name || defaultName,
        status: 'in_progress',
        toolsCompleted: 0,
        data: {},
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        data: {
          session: newSession,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[sessions/POST] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to create session',
        },
      },
      { status: 500 }
    );
  }
}
