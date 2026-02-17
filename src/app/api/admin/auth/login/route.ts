/**
 * Admin Login API Route
 *
 * POST /api/admin/auth/login - Authenticate admin user
 *
 * Story 21.1: Admin Authentication & Layout
 * Task 3: Create admin login API (AC: 1, 2, 3)
 * Covers: AC1 (admin login required), AC3 (secure JWT session)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  authenticateAdmin,
  logAdminAction,
  ADMIN_TOKEN_COOKIE_OPTIONS,
} from '@/lib/auth/admin-auth';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * Login request validation schema
 */
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Rate limiter for admin login - stricter than user login
 * 5 attempts per 15 minutes per IP
 */
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  analytics: true,
  prefix: 'admin_login',
});

/**
 * POST /api/admin/auth/login
 *
 * Authenticates an admin user and sets a secure cookie.
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { success: rateLimitSuccess } = await ratelimit.limit(ip);

    if (!rateLimitSuccess) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = loginSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // Authenticate admin
    const result = await authenticateAdmin(email, password);

    if (!result.success) {
      // Don't reveal whether email exists
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Log successful login
    await logAdminAction({
      adminId: result.admin.sub,
      action: 'login',
      details: { email: result.admin.email },
      ipAddress: ip,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      admin: {
        id: result.admin.sub,
        email: result.admin.email,
        name: result.admin.name,
        role: result.admin.role,
      },
    });

    // Set admin token cookie
    response.cookies.set(ADMIN_TOKEN_COOKIE_OPTIONS.name, result.token, {
      httpOnly: ADMIN_TOKEN_COOKIE_OPTIONS.httpOnly,
      secure: ADMIN_TOKEN_COOKIE_OPTIONS.secure,
      sameSite: ADMIN_TOKEN_COOKIE_OPTIONS.sameSite,
      path: ADMIN_TOKEN_COOKIE_OPTIONS.path,
      maxAge: ADMIN_TOKEN_COOKIE_OPTIONS.maxAge,
    });

    return response;
  } catch (error) {
    console.error('[Admin Login] Error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
