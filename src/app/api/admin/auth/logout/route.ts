/**
 * Admin Logout API Route
 *
 * POST /api/admin/auth/logout - Logout admin user
 *
 * Story 21.1: Admin Authentication & Layout
 * Task 3: Create admin login API (AC: 3)
 * Covers: AC3 (session invalidated on logout)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getAdminSession,
  logAdminAction,
  ADMIN_TOKEN_COOKIE_OPTIONS,
} from '@/lib/auth/admin-auth';

/**
 * POST /api/admin/auth/logout
 *
 * Invalidates the admin session by clearing the cookie.
 */
export async function POST(request: NextRequest) {
  try {
    // Get current session for audit logging
    const session = await getAdminSession();

    if (session) {
      // Log logout action
      await logAdminAction({
        adminId: session.sub,
        action: 'logout',
        ipAddress:
          request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      });
    }

    // Create response and clear cookie
    const response = NextResponse.json({ success: true });

    response.cookies.set(ADMIN_TOKEN_COOKIE_OPTIONS.name, '', {
      httpOnly: ADMIN_TOKEN_COOKIE_OPTIONS.httpOnly,
      secure: ADMIN_TOKEN_COOKIE_OPTIONS.secure,
      sameSite: ADMIN_TOKEN_COOKIE_OPTIONS.sameSite,
      path: ADMIN_TOKEN_COOKIE_OPTIONS.path,
      maxAge: 0, // Expire immediately
    });

    return response;
  } catch (error) {
    console.error('[Admin Logout] Error:', error);

    // Even on error, try to clear the cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set(ADMIN_TOKEN_COOKIE_OPTIONS.name, '', {
      path: ADMIN_TOKEN_COOKIE_OPTIONS.path,
      maxAge: 0,
    });

    return response;
  }
}
