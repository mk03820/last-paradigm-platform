/**
 * Password Reset Service
 *
 * Handles password reset token generation, verification, and cleanup.
 * Tokens expire after 1 hour and are single-use.
 *
 * Covers: Story 15.5 Task 1-2, FR42 (Password reset flow)
 */

import { randomBytes } from 'crypto';
import { db } from '@/lib/db';
import { passwordResets, users } from '@/lib/db/schema';
import { eq, and, lt, isNull } from 'drizzle-orm';

// Password reset expiry: 1 hour
const RESET_EXPIRY_MS = 60 * 60 * 1000;

// Rate limiting: 5 requests per email per hour (Story 15.5 Task 1.7)
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

// In-memory rate limiting (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

/**
 * Generate a cryptographically secure reset token
 */
export function generateResetToken(): string {
  return randomBytes(32).toString('base64url');
}

/**
 * Check if an email is rate limited for reset requests
 */
export function isResetRateLimited(email: string): boolean {
  const normalized = email.toLowerCase();
  const now = Date.now();
  const entry = rateLimitMap.get(normalized);

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(normalized, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }

  entry.count += 1;
  return false;
}

export interface CreateResetResult {
  success: boolean;
  token?: string;
  error?: string;
}

/**
 * Create a password reset token for a user
 */
export async function createPasswordReset(email: string): Promise<CreateResetResult> {
  const normalizedEmail = email.toLowerCase().trim();

  try {
    // Find user by email
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    // Always return success to prevent email enumeration
    if (!user) {
      return { success: true }; // Don't reveal user doesn't exist
    }

    const token = generateResetToken();
    const expiresAt = new Date(Date.now() + RESET_EXPIRY_MS);

    // Insert reset token
    await db.insert(passwordResets).values({
      userId: user.id,
      token,
      expiresAt,
    });

    return {
      success: true,
      token,
    };
  } catch (error) {
    console.error('[password-reset] Create error:', error);
    return {
      success: false,
      error: 'Failed to create reset token',
    };
  }
}

export interface VerifyResetResult {
  success: boolean;
  userId?: string;
  error?: 'INVALID_TOKEN' | 'EXPIRED' | 'ALREADY_USED' | 'SERVER_ERROR';
}

/**
 * Verify a password reset token
 */
export async function verifyPasswordReset(token: string): Promise<VerifyResetResult> {
  try {
    // Look up the token
    const [resetRecord] = await db
      .select()
      .from(passwordResets)
      .where(eq(passwordResets.token, token))
      .limit(1);

    if (!resetRecord) {
      return {
        success: false,
        error: 'INVALID_TOKEN',
      };
    }

    // Check if already used
    if (resetRecord.usedAt) {
      return {
        success: false,
        error: 'ALREADY_USED',
      };
    }

    // Check if expired
    if (new Date(resetRecord.expiresAt) < new Date()) {
      return {
        success: false,
        error: 'EXPIRED',
      };
    }

    return {
      success: true,
      userId: resetRecord.userId,
    };
  } catch (error) {
    console.error('[password-reset] Verify error:', error);
    return {
      success: false,
      error: 'SERVER_ERROR',
    };
  }
}

/**
 * Mark a reset token as used
 */
export async function markResetUsed(token: string): Promise<boolean> {
  try {
    await db
      .update(passwordResets)
      .set({ usedAt: new Date() })
      .where(
        and(
          eq(passwordResets.token, token),
          isNull(passwordResets.usedAt)
        )
      );
    return true;
  } catch (error) {
    console.error('[password-reset] Mark used error:', error);
    return false;
  }
}

/**
 * Invalidate all pending reset tokens for a user
 * Called after successful password reset to ensure single-use (Task 3.10)
 */
export async function invalidateAllUserResets(userId: string): Promise<boolean> {
  try {
    await db
      .update(passwordResets)
      .set({ usedAt: new Date() })
      .where(
        and(
          eq(passwordResets.userId, userId),
          isNull(passwordResets.usedAt)
        )
      );
    return true;
  } catch (error) {
    console.error('[password-reset] Invalidate user resets error:', error);
    return false;
  }
}

/**
 * Clean up expired reset tokens
 */
export async function cleanupExpiredResets(): Promise<number> {
  try {
    const result = await db
      .delete(passwordResets)
      .where(lt(passwordResets.expiresAt, new Date()))
      .returning({ id: passwordResets.id });

    return result.length;
  } catch (error) {
    console.error('[password-reset] Cleanup error:', error);
    return 0;
  }
}

/**
 * Build the password reset URL
 */
export function buildResetUrl(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const url = new URL('/auth/reset-password', baseUrl);
  url.searchParams.set('token', token);
  return url.toString();
}
