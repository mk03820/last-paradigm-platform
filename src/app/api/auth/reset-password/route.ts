/**
 * Reset Password API Endpoint
 *
 * Resets the user's password using a valid reset token.
 * Auto-logs in the user after successful reset.
 *
 * Covers: Story 15.5 Task 2, FR42 (Password reset flow)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { cookies } from 'next/headers';
import {
  verifyPasswordReset,
  markResetUsed,
} from '@/lib/auth/password-reset';
import {
  hashPassword,
  validatePassword,
  createTokenPair,
  REFRESH_TOKEN_COOKIE_OPTIONS,
} from '@/lib/auth';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = resetPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data.',
            details: validation.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { token, password } = validation.data;

    // Validate password requirements
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PASSWORD',
            message: passwordValidation.errors[0],
          },
        },
        { status: 400 }
      );
    }

    // Verify reset token
    const verifyResult = await verifyPasswordReset(token);

    if (!verifyResult.success) {
      const errorMessages: Record<string, string> = {
        INVALID_TOKEN: 'This reset link is invalid.',
        EXPIRED: 'This reset link has expired. Please request a new one.',
        ALREADY_USED: 'This reset link has already been used.',
        SERVER_ERROR: 'An error occurred. Please try again.',
      };

      return NextResponse.json(
        {
          success: false,
          error: {
            code: verifyResult.error,
            message: errorMessages[verifyResult.error || 'SERVER_ERROR'],
          },
        },
        { status: 400 }
      );
    }

    // Hash new password
    const passwordHash = await hashPassword(password);

    // Update user's password
    const [updatedUser] = await db
      .update(users)
      .set({
        passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, verifyResult.userId!))
      .returning();

    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found.',
          },
        },
        { status: 400 }
      );
    }

    // Mark reset token as used
    await markResetUsed(token);

    // Auto-login: Create JWT tokens
    const { accessToken, refreshToken } = await createTokenPair({
      userId: updatedUser.id,
      email: updatedUser.email!,
      name: updatedUser.name,
      purchaseStatus: updatedUser.purchaseStatus || 'none',
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
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
        },
        accessToken,
      },
    });
  } catch (error) {
    console.error('[reset-password/POST] Error:', error);
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
