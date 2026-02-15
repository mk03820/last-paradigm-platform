/**
 * Logout API Endpoint
 *
 * Clears the refresh token cookie to log out the user.
 *
 * Covers: Story 15.2 Task 6.3, NFR18 (JWT session management)
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { REFRESH_TOKEN_COOKIE_OPTIONS } from '@/lib/auth/jwt';

interface LogoutResponse {
  success: boolean;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * POST /api/auth/logout
 * Clear session and refresh token cookie
 */
export async function POST(): Promise<NextResponse<LogoutResponse>> {
  try {
    const cookieStore = await cookies();

    // Clear the refresh token cookie
    cookieStore.delete(REFRESH_TOKEN_COOKIE_OPTIONS.name);

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    console.error('[logout/POST] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred during logout.',
        },
      },
      { status: 500 }
    );
  }
}
