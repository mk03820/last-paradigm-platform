/**
 * Magic Link Request API Route
 *
 * POST /api/auth/magic-link - Request a magic link for passwordless auth
 *
 * Implements:
 * - Email validation with Zod
 * - Rate limiting: 3 requests per email per 15 minutes (NFR21)
 * - Cryptographically secure token generation
 * - Consistent response regardless of email registration (prevent enumeration)
 *
 * Covers: Story 15.4 Task 1, AC1, AC5
 */

import { NextResponse } from 'next/server';
import { magicLinkRequestSchema } from '@/lib/schemas/magic-link.schema';
import {
  createMagicLink,
  isRateLimited,
  buildMagicLinkUrl,
} from '@/lib/auth/magic-link';
import { sendEmail } from '@/lib/email/client';
import { generateMagicLinkEmail } from '@/lib/email/templates/magic-link';

interface MagicLinkResponse {
  success: boolean;
  data?: {
    message: string;
  };
  error?: {
    code: 'VALIDATION_ERROR' | 'RATE_LIMITED' | 'SERVER_ERROR';
    message: string;
  };
}

/**
 * POST /api/auth/magic-link
 * Request a magic link for passwordless authentication
 */
export async function POST(
  request: Request
): Promise<NextResponse<MagicLinkResponse>> {
  try {
    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR' as const,
            message: 'Invalid request body',
          },
        },
        { status: 400 }
      );
    }

    // Validate email with Zod
    const validation = magicLinkRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR' as const,
            message: validation.error.errors[0]?.message || 'Invalid email address',
          },
        },
        { status: 400 }
      );
    }

    const email = validation.data.email.toLowerCase().trim();

    // Check rate limit (3 requests per email per 15 minutes)
    if (isRateLimited(email)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMITED' as const,
            message: 'Too many requests. Please try again in a few minutes.',
          },
        },
        { status: 429 }
      );
    }

    // Create the magic link token
    const result = await createMagicLink(email);

    if (!result.success || !result.token) {
      console.error('[magic-link/POST] Failed to create magic link:', result.error);
      // Return success to prevent email enumeration
      return NextResponse.json({
        success: true,
        data: {
          message: 'If an account exists, a sign-in link has been sent to your email.',
        },
      });
    }

    // Build the magic link URL
    const host = new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').host;
    const magicLinkUrl = buildMagicLinkUrl(result.token);

    // Generate and send the email
    const emailContent = generateMagicLinkEmail({
      magicLinkUrl,
      host,
      expiresInMinutes: 15,
    });

    const emailResult = await sendEmail({
      to: email,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
    });

    if (!emailResult.success) {
      console.error('[magic-link/POST] Email send failed:', emailResult.error);
      // Still return success to prevent enumeration
      // The link is in the database, user can try again
    }

    // Always return the same success message regardless of:
    // - Whether the email exists in the system
    // - Whether the email was sent successfully
    // This prevents account enumeration (AC5)
    return NextResponse.json({
      success: true,
      data: {
        message: 'If an account exists, a sign-in link has been sent to your email.',
      },
    });
  } catch (error) {
    console.error('[magic-link/POST] Unexpected error:', error);
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
