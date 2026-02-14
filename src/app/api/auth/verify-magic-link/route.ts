/**
 * Magic Link Verification API Route
 *
 * GET /api/auth/verify-magic-link - Verify a magic link and create session
 *
 * Implements:
 * - Token validation (exists, not expired, not used)
 * - Single-use enforcement (AC4)
 * - User creation or retrieval
 * - JWT session creation (AC6)
 * - Refresh token in httpOnly cookie
 *
 * Covers: Story 15.4 Task 2, AC2, AC3, AC4, AC6
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { magicLinkVerifySchema } from '@/lib/schemas/magic-link.schema';
import {
  verifyMagicLink,
  findOrCreateUserByEmail,
} from '@/lib/auth/magic-link';
import {
  createTokenPair,
  REFRESH_TOKEN_COOKIE_OPTIONS,
} from '@/lib/auth/jwt';

interface VerifyMagicLinkResponse {
  success: boolean;
  data?: {
    accessToken: string;
    user: {
      id: string;
      email: string;
      name: string | null;
      purchaseStatus: string;
    };
    isNewUser: boolean;
    redirectUrl: string;
  };
  error?: {
    code: 'INVALID_TOKEN' | 'EXPIRED' | 'ALREADY_USED' | 'SERVER_ERROR';
    message: string;
  };
}

/**
 * GET /api/auth/verify-magic-link
 * Verify a magic link token and create a session
 */
export async function GET(
  request: Request
): Promise<NextResponse<VerifyMagicLinkResponse>> {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    const callbackUrl = url.searchParams.get('callbackUrl');

    // Validate token parameter
    const validation = magicLinkVerifySchema.safeParse({ token });
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_TOKEN' as const,
            message: 'Invalid or missing token.',
          },
        },
        { status: 400 }
      );
    }

    // Verify the magic link
    const verifyResult = await verifyMagicLink(validation.data.token);

    if (!verifyResult.success) {
      const errorMessages: Record<string, string> = {
        INVALID_TOKEN: 'This link is invalid. Please request a new sign-in link.',
        EXPIRED: 'This link has expired. Please request a new sign-in link.',
        ALREADY_USED: 'This link has already been used. Please request a new sign-in link.',
        SERVER_ERROR: 'An error occurred. Please try again.',
      };

      return NextResponse.json(
        {
          success: false,
          error: {
            code: verifyResult.error || 'SERVER_ERROR',
            message: errorMessages[verifyResult.error || 'SERVER_ERROR'],
          },
        },
        { status: verifyResult.error === 'SERVER_ERROR' ? 500 : 400 }
      );
    }

    // Find or create user by email
    const userResult = await findOrCreateUserByEmail(verifyResult.magicLink!.email);

    if (!userResult) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SERVER_ERROR' as const,
            message: 'Failed to create user account. Please try again.',
          },
        },
        { status: 500 }
      );
    }

    // Create JWT tokens
    const { accessToken, refreshToken } = await createTokenPair({
      userId: userResult.id,
      email: userResult.email,
      name: userResult.name,
      purchaseStatus: userResult.purchaseStatus,
    });

    // Set refresh token as httpOnly cookie
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

    // Determine redirect URL
    const defaultRedirect = '/dashboard';
    const redirectUrl = callbackUrl || defaultRedirect;

    return NextResponse.json({
      success: true,
      data: {
        accessToken,
        user: {
          id: userResult.id,
          email: userResult.email,
          name: userResult.name,
          purchaseStatus: userResult.purchaseStatus,
        },
        isNewUser: userResult.isNewUser,
        redirectUrl,
      },
    });
  } catch (error) {
    console.error('[verify-magic-link/GET] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR' as const,
          message: 'An unexpected error occurred. Please try again.',
        },
      },
      { status: 500 }
    );
  }
}
