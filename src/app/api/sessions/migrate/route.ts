/**
 * Session Migration API Route
 *
 * POST /api/sessions/migrate - Migrate anonymous session data to authenticated user
 *
 * Accepts calculator data from sessionStorage and creates a new diagnostic session
 * for the authenticated user with that data preserved.
 *
 * Covers: FR2-4 (Cross-device continuity), FR2-5 (Anonymous Tool 2 access)
 * Story 8.3: Anonymous to Authenticated Session Migration
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { diagnosticSessions } from '@/lib/db/schema';
import type { DiagnosticSessionData } from '@/lib/db/schema';
import type { SessionResponse, SessionErrorResponse } from '@/types/session.types';

/**
 * Schema for migration request body
 */
const migrationSchema = z.object({
  meetingData: z.object({
    meetingCount: z.number(),
    averageAttendees: z.number(),
    averageDuration: z.number(),
    salaryDistribution: z.object({
      executive: z.number(),
      senior: z.number(),
      midLevel: z.number(),
      entry: z.number(),
    }),
  }).nullable(),
  results: z.object({
    meetingWaste: z.number(),
    estimatedAlignmentTaxMin: z.number(),
    estimatedAlignmentTaxMax: z.number(),
    inputs: z.object({
      meetingCount: z.number(),
      averageAttendees: z.number(),
      averageDuration: z.number(),
      salaryDistribution: z.object({
        executive: z.number(),
        senior: z.number(),
        midLevel: z.number(),
        entry: z.number(),
      }),
    }),
    calculatedAt: z.string(),
  }).nullable(),
});

type MigrationRequest = z.infer<typeof migrationSchema>;

/**
 * POST /api/sessions/migrate
 * Migrates anonymous session data to a new diagnostic session for the authenticated user
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
            message: 'You must be signed in to migrate session data',
          },
        },
        { status: 401 }
      );
    }

    // Parse and validate request body
    let body: MigrationRequest;
    try {
      const rawBody = await request.json();
      body = migrationSchema.parse(rawBody);
    } catch (error) {
      console.error('[sessions/migrate] Validation error:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid migration data',
          },
        },
        { status: 400 }
      );
    }

    // Check if there's actually data to migrate
    if (!body.meetingData && !body.results) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NO_DATA',
            message: 'No session data to migrate',
          },
        },
        { status: 400 }
      );
    }

    // Build the session data structure
    const sessionData: DiagnosticSessionData = {};
    let toolsCompleted = 0;

    if (body.results) {
      // If we have results, Tool 2 is complete
      sessionData.tool2 = {
        inputs: body.results.inputs,
        results: {
          totalMeetingHours: 0, // Will be recalculated if needed
          totalMeetingCost: 0,
          wastedHours: 0,
          wastedCost: body.results.meetingWaste,
          effectiveHours: 0,
          effectiveCost: 0,
        },
        completedAt: body.results.calculatedAt,
      };
      toolsCompleted = 1;
    } else if (body.meetingData) {
      // If we only have inputs, save as in-progress
      sessionData.tool2 = {
        inputs: body.meetingData,
      };
    }

    // Create the diagnostic session
    const [newSession] = await db
      .insert(diagnosticSessions)
      .values({
        userId: session.user.id,
        name: 'Migrated Session',
        status: toolsCompleted > 0 ? 'in_progress' : 'in_progress',
        toolsCompleted,
        data: sessionData,
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
    console.error('[sessions/migrate] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to migrate session data',
        },
      },
      { status: 500 }
    );
  }
}
