/**
 * Logout API Endpoint
 *
 * Clears the refresh token cookie to log the user out.
 *
 * Covers: Story 15.3 Task 3, FR41 (Session management)
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { REFRESH_TOKEN_COOKIE_OPTIONS } from '@/lib/auth';

export async function POST() {
  try {
    const cookieStore = await cookies();

    // Clear refresh token cookie
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
          message: 'An unexpected error occurred.',
        },
      },
      { status: 500 }
    );
  }
}
