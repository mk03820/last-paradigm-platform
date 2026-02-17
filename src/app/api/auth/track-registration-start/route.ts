/**
 * Track Registration Start API Endpoint
 *
 * Records when a user enters their email during registration.
 * Triggers Inngest job for abandonment recovery if registration not completed.
 *
 * Story 15.9: Registration Abandonment Recovery
 * Covers: Task 2, AC1 (Track email entry), AC5 (One reminder per abandonment)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { abandonedRegistrations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { inngest } from '@/lib/inngest';

// Validation schema
const trackRegistrationSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

// In-memory rate limiting (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }

  entry.count += 1;
  return false;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting (NFR21: 5 attempts per minute)
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMITED',
            message: 'Too many requests. Please try again later.',
          },
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = trackRegistrationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_EMAIL',
            message: 'Please enter a valid email address',
          },
        },
        { status: 400 }
      );
    }

    const { email } = validation.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Generate secure token
    const token = crypto.randomUUID();

    // Upsert - update if exists, insert if not
    // This prevents duplicate entries and resets the tracking if user tries again
    const [existing] = await db
      .select()
      .from(abandonedRegistrations)
      .where(eq(abandonedRegistrations.email, normalizedEmail))
      .limit(1);

    let record;
    if (existing) {
      // Update existing record if not completed
      if (!existing.completedAt) {
        [record] = await db
          .update(abandonedRegistrations)
          .set({
            token,
            createdAt: new Date(),
            emailSentAt: null, // Reset email sent status
          })
          .where(eq(abandonedRegistrations.email, normalizedEmail))
          .returning();
      } else {
        // User already completed registration, no need to track
        return NextResponse.json({
          success: true,
          token: existing.token,
        });
      }
    } else {
      // Insert new record
      [record] = await db
        .insert(abandonedRegistrations)
        .values({
          email: normalizedEmail,
          token,
        })
        .returning();
    }

    // Trigger Inngest event for abandonment check (AC1)
    // The Inngest function will wait 1 hour before checking
    await inngest.send({
      name: 'registration/abandoned',
      data: {
        email: normalizedEmail,
        token,
        abandonedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      token: record.token,
    });
  } catch (error) {
    console.error('[track-registration-start/POST] Error:', error);
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
