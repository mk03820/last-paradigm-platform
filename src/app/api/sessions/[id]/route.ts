/**
 * Session by ID API Route
 *
 * GET /api/sessions/[id] - Get session details
 * PUT /api/sessions/[id] - Update session data
 * DELETE /api/sessions/[id] - Delete a session
 *
 * Covers: FR2-3 (View saved sessions), FR2-4 (Cross-device continuity)
 */

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { diagnosticSessions } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import type {
  SessionResponse,
  SessionErrorResponse,
  UpdateSessionRequest,
  DiagnosticSessionData,
} from '@/types/session.types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/sessions/[id]
 * Returns a specific diagnostic session
 */
export async function GET(
  request: Request,
  { params }: RouteParams
): Promise<NextResponse<SessionResponse | SessionErrorResponse>> {
  try {
    const session = await auth();
    const { id } = await params;

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

    const [diagnosticSession] = await db
      .select()
      .from(diagnosticSessions)
      .where(
        and(
          eq(diagnosticSessions.id, id),
          eq(diagnosticSessions.userId, session.user.id)
        )
      );

    if (!diagnosticSession) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Session not found',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        session: diagnosticSession,
      },
    });
  } catch (error) {
    console.error('[sessions/[id]/GET] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch session',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/sessions/[id]
 * Updates a diagnostic session
 */
export async function PUT(
  request: Request,
  { params }: RouteParams
): Promise<NextResponse<SessionResponse | SessionErrorResponse>> {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be signed in to update sessions',
          },
        },
        { status: 401 }
      );
    }

    // Verify ownership
    const [existing] = await db
      .select()
      .from(diagnosticSessions)
      .where(
        and(
          eq(diagnosticSessions.id, id),
          eq(diagnosticSessions.userId, session.user.id)
        )
      );

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Session not found',
          },
        },
        { status: 404 }
      );
    }

    const body: UpdateSessionRequest = await request.json();

    // Merge data if provided
    let mergedData: DiagnosticSessionData | undefined;
    if (body.data) {
      mergedData = {
        ...(existing.data || {}),
        ...body.data,
      };
    }

    // Count completed tools
    let toolsCompleted = existing.toolsCompleted;
    if (mergedData) {
      toolsCompleted = 0;
      for (let i = 1; i <= 7; i++) {
        const toolKey = `tool${i}` as keyof DiagnosticSessionData;
        const toolData = mergedData[toolKey];
        if (toolData && 'completedAt' in toolData && toolData.completedAt) {
          toolsCompleted++;
        }
      }
    }

    const [updated] = await db
      .update(diagnosticSessions)
      .set({
        ...(body.name !== undefined && { name: body.name }),
        ...(body.status !== undefined && { status: body.status }),
        toolsCompleted,
        ...(mergedData && { data: mergedData }),
        updatedAt: new Date(),
      })
      .where(eq(diagnosticSessions.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      data: {
        session: updated,
      },
    });
  } catch (error) {
    console.error('[sessions/[id]/PUT] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to update session',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/sessions/[id]
 * Deletes a diagnostic session
 */
export async function DELETE(
  request: Request,
  { params }: RouteParams
): Promise<NextResponse<{ success: true } | SessionErrorResponse>> {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be signed in to delete sessions',
          },
        },
        { status: 401 }
      );
    }

    // Verify ownership and delete
    const result = await db
      .delete(diagnosticSessions)
      .where(
        and(
          eq(diagnosticSessions.id, id),
          eq(diagnosticSessions.userId, session.user.id)
        )
      )
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Session not found',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[sessions/[id]/DELETE] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to delete session',
        },
      },
      { status: 500 }
    );
  }
}
