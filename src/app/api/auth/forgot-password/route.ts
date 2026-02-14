/**
 * Forgot Password API Endpoint
 *
 * Sends a password reset email to the user.
 * Always returns success to prevent email enumeration.
 *
 * Covers: Story 15.5 Task 1, FR42 (Password reset flow)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  createPasswordReset,
  isResetRateLimited,
  buildResetUrl,
} from '@/lib/auth/password-reset';
import { Resend } from 'resend';

// Lazy-initialized Resend client to avoid build-time errors
let resend: Resend | null = null;
function getResend() {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = forgotPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Please enter a valid email address.',
          },
        },
        { status: 400 }
      );
    }

    const { email } = validation.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check rate limit
    if (isResetRateLimited(normalizedEmail)) {
      // Still return success to prevent enumeration
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link.',
      });
    }

    // Create reset token
    const result = await createPasswordReset(normalizedEmail);

    // Send email if token was created (user exists)
    if (result.token) {
      const resetUrl = buildResetUrl(result.token);

      try {
        await getResend().emails.send({
          from: process.env.EMAIL_FROM || 'The Last Paradigm <noreply@thelastparadigm.com>',
          to: normalizedEmail,
          subject: 'Reset Your Password - The Last Paradigm',
          html: `
            <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #1e293b; font-size: 24px; margin-bottom: 16px;">Reset Your Password</h1>
              <p style="color: #475569; font-size: 16px; line-height: 1.5;">
                You requested to reset your password for The Last Paradigm. Click the button below to set a new password.
              </p>
              <p style="margin: 24px 0;">
                <a href="${resetUrl}" style="display: inline-block; background-color: #b45309; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                  Reset Password
                </a>
              </p>
              <p style="color: #64748b; font-size: 14px;">
                This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.
              </p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
              <p style="color: #94a3b8; font-size: 12px;">
                Based on the methodology from <em>The Last Paradigm</em>
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error('[forgot-password] Email send error:', emailError);
        // Don't reveal email failure
      }
    }

    // Always return success to prevent enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link.',
    });
  } catch (error) {
    console.error('[forgot-password/POST] Error:', error);
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
