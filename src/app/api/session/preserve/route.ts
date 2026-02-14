/**
 * Session Preservation API Route
 *
 * POST /api/session/preserve - Save session data for later recovery
 *
 * Allows users to save their PB1 diagnostic results via email link
 * before creating a full account. Links are valid for 7 days.
 *
 * Covers: Story 15.8, FR70 (Pre-account results preservation)
 * Covers: AC2, AC3, AC8
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { preservedSessions } from '@/lib/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import { emailSchema } from '@/lib/schemas/email.schema';
import type {
  PreserveSessionRequest,
  PreserveSessionResponse,
  PreservedSessionData,
} from '@/types/auth.types';
import { sendSaveResultsEmail } from '@/lib/email/send-save-results-email';

// Rate limit tracking (in-memory for simplicity, would use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

// 7 days in milliseconds
const EXPIRY_DAYS = 7;
const EXPIRY_MS = EXPIRY_DAYS * 24 * 60 * 60 * 1000;

/**
 * Check if email is rate limited
 */
function isRateLimited(email: string): boolean {
  const normalized = email.toLowerCase();
  const now = Date.now();
  const entry = rateLimitMap.get(normalized);

  if (!entry || entry.resetAt < now) {
    // No entry or expired, allow request
    rateLimitMap.set(normalized, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }

  // Increment count
  entry.count += 1;
  return false;
}

/**
 * Generate a secure token
 */
function generateToken(): string {
  return crypto.randomUUID();
}

/**
 * Validate session data structure
 */
function isValidSessionData(data: unknown): data is PreservedSessionData {
  if (!data || typeof data !== 'object') return false;

  const sessionData = data as Record<string, unknown>;

  // Must have preservedAt timestamp
  if (typeof sessionData.preservedAt !== 'string') return false;

  // Tool data is optional but if present should be objects
  const toolKeys = ['tool1', 'tool2', 'tool3', 'tool4', 'tool5', 'tool6', 'tool7'];
  for (const key of toolKeys) {
    if (key in sessionData && sessionData[key] !== null && typeof sessionData[key] !== 'object') {
      return false;
    }
  }

  return true;
}

/**
 * POST /api/session/preserve
 * Save session data to database and send recovery email
 */
export async function POST(
  request: Request
): Promise<NextResponse<PreserveSessionResponse>> {
  try {
    // Parse request body
    let body: PreserveSessionRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_EMAIL' as const,
            message: 'Invalid request body',
          },
        },
        { status: 400 }
      );
    }

    // Validate email
    const emailValidation = emailSchema.safeParse({ email: body.email });
    if (!emailValidation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_EMAIL' as const,
            message: emailValidation.error.errors[0]?.message || 'Invalid email address',
          },
        },
        { status: 400 }
      );
    }

    const email = emailValidation.data.email.toLowerCase();

    // Check rate limit
    if (isRateLimited(email)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMITED' as const,
            message: 'Too many requests. Please try again later.',
          },
        },
        { status: 429 }
      );
    }

    // Validate session data
    if (!body.sessionData || !isValidSessionData(body.sessionData)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_EMAIL' as const,
            message: 'Invalid session data',
          },
        },
        { status: 400 }
      );
    }

    const token = generateToken();
    const expiresAt = new Date(Date.now() + EXPIRY_MS);

    // Check if email already has a preserved session (for upsert logic)
    const existing = await db
      .select()
      .from(preservedSessions)
      .where(eq(preservedSessions.email, email))
      .limit(1);

    if (existing.length > 0) {
      // Update existing session (AC8: update not duplicate)
      await db
        .update(preservedSessions)
        .set({
          token,
          sessionData: body.sessionData,
          expiresAt,
          usedAt: null, // Reset used status
        })
        .where(eq(preservedSessions.email, email));
    } else {
      // Create new session
      await db.insert(preservedSessions).values({
        email,
        token,
        sessionData: body.sessionData,
        expiresAt,
      });
    }

    // Send recovery email
    const emailResult = await sendSaveResultsEmail({
      email,
      token,
    });

    if (!emailResult.success) {
      console.error('[session/preserve/POST] Email failed:', emailResult.error);
      // Still return success since the session is saved
      // User can try again or use the same link
    }

    return NextResponse.json({
      success: true,
      message: 'Recovery link sent to your email',
    });
  } catch (error) {
    console.error('[session/preserve/POST] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR' as const,
          message: 'Failed to save session',
        },
      },
      { status: 500 }
    );
  }
}
