/**
 * Login API Endpoint
 *
 * Handles user login with email/password.
 * Verifies credentials and returns JWT session.
 *
 * Covers: Story 15.3 Task 1, FR41 (User login), NFR18 (JWT), NFR21 (Rate limiting)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { verifyPassword, createTokenPair, REFRESH_TOKEN_COOKIE_OPTIONS } from '@/lib/auth';
import { cookies } from 'next/headers';

// Login schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
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
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMITED',
            message: 'Too many login attempts. Please try again later.',
          },
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid login data',
            details: validation.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    // Security: Generic error to prevent email enumeration
    if (!user || !user.passwordHash) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password.',
          },
        },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password.',
          },
        },
        { status: 401 }
      );
    }

    // Create JWT tokens
    const { accessToken, refreshToken } = await createTokenPair({
      userId: user.id,
      email: user.email!,
      name: user.name,
      purchaseStatus: user.purchaseStatus || 'none',
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
          id: user.id,
          email: user.email,
          name: user.name,
          purchaseStatus: user.purchaseStatus,
        },
        accessToken,
      },
    });
  } catch (error) {
    console.error('[login/POST] Error:', error);
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
