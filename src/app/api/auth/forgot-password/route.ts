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
import { generatePasswordResetEmail } from '@/lib/email/templates/password-reset';
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

    // Check rate limit (5 requests per email per hour)
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
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const host = new URL(baseUrl).host;

      // Generate branded email using template
      const emailContent = generatePasswordResetEmail({
        resetUrl,
        host,
        expiresInMinutes: 60, // 1 hour
      });

      try {
        await getResend().emails.send({
          from: process.env.EMAIL_FROM || 'The Last Paradigm <noreply@thelastparadigm.com>',
          to: normalizedEmail,
          subject: emailContent.subject,
          text: emailContent.text,
          html: emailContent.html,
        });
      } catch (emailError) {
        console.error('[forgot-password] Email send error:', emailError);
        // Don't reveal email failure to prevent enumeration
      }
    }

    // Always return success to prevent enumeration (AC8)
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
