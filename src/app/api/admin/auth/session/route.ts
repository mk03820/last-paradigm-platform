/**
 * Admin Session API Route
 *
 * GET /api/admin/auth/session - Validate admin session
 *
 * Story 21.1: Admin Authentication & Layout
 * Task 3: Create admin login API (AC: 3)
 * Covers: AC3 (session validation)
 */

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin-auth';

/**
 * GET /api/admin/auth/session
 *
 * Returns the current admin session if valid.
 */
export async function GET() {
  try {
    const result = await requireAdmin();

    if (!result.authenticated) {
      return NextResponse.json(
        { authenticated: false, error: result.error },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      admin: {
        id: result.admin.sub,
        email: result.admin.email,
        name: result.admin.name,
        role: result.admin.role,
      },
    });
  } catch (error) {
    console.error('[Admin Session] Error:', error);
    return NextResponse.json(
      { authenticated: false, error: 'Session check failed' },
      { status: 500 }
    );
  }
}
