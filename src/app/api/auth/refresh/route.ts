/**
 * Token Refresh API Endpoint
 *
 * Refreshes the access token using the refresh token from httpOnly cookie.
 *
 * Covers: Story 15.2 Task 6.3, NFR18 (JWT session management)
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import {
  verifyRefreshToken,
  createAccessToken,
  REFRESH_TOKEN_COOKIE_OPTIONS,
} from '@/lib/auth/jwt';

interface RefreshResponse {
  success: boolean;
  data?: {
    accessToken: string;
    user: {
      id: string;
      email: string;
      name: string | null;
      purchaseStatus: string;
    };
  };
  error?: {
    code: string;
    message: string;
  };
}

/**
 * POST /api/auth/refresh
 * Refresh the access token using refresh token cookie
 */
export async function POST(): Promise<NextResponse<RefreshResponse>> {
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
            message: 'No refresh token found. Please sign in again.',
          },
        },
        { status: 401 }
      );
    }

    // Verify refresh token
    const tokenPayload = await verifyRefreshToken(refreshToken);

    if (!tokenPayload) {
      // Clear invalid cookie
      cookieStore.delete(REFRESH_TOKEN_COOKIE_OPTIONS.name);

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REFRESH_TOKEN',
            message: 'Session expired. Please sign in again.',
          },
        },
        { status: 401 }
      );
    }

    // Get user from database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, tokenPayload.userId))
      .limit(1);

    if (!user) {
      // Clear cookie for non-existent user
      cookieStore.delete(REFRESH_TOKEN_COOKIE_OPTIONS.name);

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found. Please sign in again.',
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
        accessToken,
        user: {
          id: user.id,
          email: user.email!,
          name: user.name,
          purchaseStatus: user.purchaseStatus || 'none',
        },
      },
    });
  } catch (error) {
    console.error('[refresh/POST] Error:', error);
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
