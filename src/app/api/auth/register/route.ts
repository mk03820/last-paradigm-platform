/**
 * Registration API Endpoint
 *
 * Handles user registration with email/password.
 * Creates user account, hashes password, and returns JWT session.
 *
 * Covers: Story 15.2 Task 3, FR38 (Account creation), NFR17 (bcrypt), NFR18 (JWT)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { registerApiSchema } from '@/lib/schemas/register.schema';
import { hashPassword, createTokenPair, REFRESH_TOKEN_COOKIE_OPTIONS } from '@/lib/auth';
import { cookies } from 'next/headers';

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
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMITED',
            message: 'Too many registration attempts. Please try again later.',
          },
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = registerApiSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid registration data',
            details: validation.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { email, password, name } = validation.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existingUser) {
      // Security: Generic error to prevent email enumeration
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'REGISTRATION_FAILED',
            message: 'Unable to create account. Please try a different email or sign in.',
          },
        },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email: normalizedEmail,
        name: name || null,
        passwordHash,
        emailVerified: new Date(), // Auto-verify for email/password registration
        purchaseStatus: 'none',
      })
      .returning();

    // Create JWT tokens
    const { accessToken, refreshToken } = await createTokenPair({
      userId: newUser.id,
      email: newUser.email!,
      name: newUser.name,
      purchaseStatus: newUser.purchaseStatus || 'none',
    });

    // Set refresh token cookie
    const cookieStore = await cookies();
    cookieStore.set(
      REFRESH_TOKEN_COOKIE_OPTIONS.name,
      refreshToken,
      {
        httpOnly: REFRESH_TOKEN_COOKIE_OPTIONS.httpOnly,
        secure: REFRESH_TOKEN_COOKIE_OPTIONS.secure,
        sameSite: REFRESH_TOKEN_COOKIE_OPTIONS.sameSite,
        path: REFRESH_TOKEN_COOKIE_OPTIONS.path,
        maxAge: REFRESH_TOKEN_COOKIE_OPTIONS.maxAge,
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          purchaseStatus: newUser.purchaseStatus,
        },
        accessToken,
      },
    });
  } catch (error) {
    console.error('[register/POST] Error:', error);
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
