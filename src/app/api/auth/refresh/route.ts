/**
 * Token Refresh API Endpoint
 *
 * Refreshes access token using refresh token from cookie.
 *
 * Covers: Story 15.3 Task 2, NFR18 (JWT session management)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import {
  verifyRefreshToken,
  createAccessToken,
  REFRESH_TOKEN_COOKIE_OPTIONS,
} from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE_OPTIONS.name)?.value;

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NO_REFRESH_TOKEN',
            message: 'No refresh token provided.',
          },
        },
        { status: 401 }
      );
    }

    // Verify refresh token
    const payload = await verifyRefreshToken(refreshToken);

    if (!payload) {
      // Clear invalid cookie
      cookieStore.delete(REFRESH_TOKEN_COOKIE_OPTIONS.name);

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REFRESH_TOKEN',
            message: 'Invalid or expired refresh token.',
          },
        },
        { status: 401 }
      );
    }

    // Get user from database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);

    if (!user) {
      // Clear cookie for non-existent user
      cookieStore.delete(REFRESH_TOKEN_COOKIE_OPTIONS.name);

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found.',
          },
        },
        { status: 401 }
      );
    }

    // Create new access token
    const accessToken = await createAccessToken({
      userId: user.id,
      email: user.email!,
      name: user.name,
      purchaseStatus: user.purchaseStatus || 'none',
    });

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
    console.error('[refresh/POST] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An unexpected error occurred.',
        },
      },
      { status: 500 }
    );
  }
}
