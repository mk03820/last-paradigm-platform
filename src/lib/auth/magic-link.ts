/**
 * Magic Link Authentication Service
 *
 * Handles magic link creation, verification, and cleanup.
 * Links expire after 15 minutes and are single-use.
 *
 * Covers: Story 15.4 Task 6.1, FR39 (Magic link authentication)
 * Security: NFR17 (256-bit token entropy), NFR21 (Rate limiting)
 */

import { randomBytes } from 'crypto';
import { db } from '@/lib/db';
import { magicLinks, users } from '@/lib/db/schema';
import { eq, and, lt, isNull } from 'drizzle-orm';
import type { MagicLink } from '@/types/auth.types';

// Magic link expiry: 15 minutes
const MAGIC_LINK_EXPIRY_MS = 15 * 60 * 1000;

// Rate limiting: 3 requests per email per 15 minutes
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

// In-memory rate limiting (use Redis in production at scale)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

/**
 * Generate a cryptographically secure magic link token
 * Uses 32 bytes (256 bits) of entropy for security
 */
export function generateMagicLinkToken(): string {
  return randomBytes(32).toString('base64url');
}

/**
 * Check if an email is rate limited for magic link requests
 */
export function isRateLimited(email: string): boolean {
  const normalized = email.toLowerCase();
  const now = Date.now();
  const entry = rateLimitMap.get(normalized);

  if (!entry || entry.resetAt < now) {
    // No entry or expired window, start fresh
    rateLimitMap.set(normalized, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }

  // Increment count within window
  entry.count += 1;
  return false;
}

/**
 * Get remaining rate limit attempts for an email
 */
export function getRateLimitRemaining(email: string): number {
  const normalized = email.toLowerCase();
  const now = Date.now();
  const entry = rateLimitMap.get(normalized);

  if (!entry || entry.resetAt < now) {
    return RATE_LIMIT_MAX;
  }

  return Math.max(0, RATE_LIMIT_MAX - entry.count);
}

export interface CreateMagicLinkResult {
  success: boolean;
  token?: string;
  error?: string;
}

/**
 * Create a new magic link for an email address
 * Stores the token in the database with a 15-minute expiry
 */
export async function createMagicLink(email: string): Promise<CreateMagicLinkResult> {
  const normalizedEmail = email.toLowerCase().trim();

  // Check rate limit (but don't consume on this check, actual consumption happens elsewhere)
  // This is just validation - the route handler should call isRateLimited() first

  try {
    const token = generateMagicLinkToken();
    const expiresAt = new Date(Date.now() + MAGIC_LINK_EXPIRY_MS);

    // Insert the magic link into the database
    await db.insert(magicLinks).values({
      email: normalizedEmail,
      token,
      expiresAt,
    });

    return {
      success: true,
      token,
    };
  } catch (error) {
    console.error('[magic-link] Create error:', error);
    return {
      success: false,
      error: 'Failed to create magic link',
    };
  }
}

export interface VerifyMagicLinkResult {
  success: boolean;
  magicLink?: MagicLink;
  error?: 'INVALID_TOKEN' | 'EXPIRED' | 'ALREADY_USED' | 'SERVER_ERROR';
}

/**
 * Verify a magic link token
 * Checks that the token exists, is not expired, and has not been used
 */
export async function verifyMagicLink(token: string): Promise<VerifyMagicLinkResult> {
  try {
    // Look up the token
    const [magicLinkRecord] = await db
      .select()
      .from(magicLinks)
      .where(eq(magicLinks.token, token))
      .limit(1);

    if (!magicLinkRecord) {
      return {
        success: false,
        error: 'INVALID_TOKEN',
      };
    }

    // Check if already used
    if (magicLinkRecord.usedAt) {
      return {
        success: false,
        error: 'ALREADY_USED',
      };
    }

    // Check if expired
    if (new Date(magicLinkRecord.expiresAt) < new Date()) {
      return {
        success: false,
        error: 'EXPIRED',
      };
    }

    // Mark as used (atomic operation to prevent race conditions)
    // Check return value to ensure we actually updated a row (handles race condition)
    const updateResult = await db
      .update(magicLinks)
      .set({ usedAt: new Date() })
      .where(
        and(
          eq(magicLinks.token, token),
          isNull(magicLinks.usedAt)
        )
      )
      .returning({ id: magicLinks.id });

    // If no rows updated, another request already used this token (race condition)
    if (updateResult.length === 0) {
      return {
        success: false,
        error: 'ALREADY_USED',
      };
    }

    return {
      success: true,
      magicLink: magicLinkRecord,
    };
  } catch (error) {
    console.error('[magic-link] Verify error:', error);
    return {
      success: false,
      error: 'SERVER_ERROR',
    };
  }
}

/**
 * Find or create a user by email
 * Used after successful magic link verification
 */
export async function findOrCreateUserByEmail(email: string): Promise<{
  id: string;
  email: string;
  name: string | null;
  purchaseStatus: string;
  isNewUser: boolean;
} | null> {
  const normalizedEmail = email.toLowerCase().trim();

  try {
    // Check if user exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existingUser) {
      // Update emailVerified timestamp if not already verified
      if (!existingUser.emailVerified) {
        await db
          .update(users)
          .set({ emailVerified: new Date() })
          .where(eq(users.id, existingUser.id));
      }

      return {
        id: existingUser.id,
        email: existingUser.email!,
        name: existingUser.name,
        purchaseStatus: existingUser.purchaseStatus || 'none',
        isNewUser: false,
      };
    }

    // Create new user
    const [newUser] = await db
      .insert(users)
      .values({
        email: normalizedEmail,
        emailVerified: new Date(),
        purchaseStatus: 'none',
      })
      .returning();

    return {
      id: newUser.id,
      email: newUser.email!,
      name: newUser.name,
      purchaseStatus: newUser.purchaseStatus || 'none',
      isNewUser: true,
    };
  } catch (error) {
    console.error('[magic-link] Find/create user error:', error);
    return null;
  }
}

/**
 * Clean up expired and used magic links
 * Should be called periodically by a scheduled task
 */
export async function cleanupExpiredMagicLinks(): Promise<number> {
  try {
    const result = await db
      .delete(magicLinks)
      .where(lt(magicLinks.expiresAt, new Date()))
      .returning({ id: magicLinks.id });

    return result.length;
  } catch (error) {
    console.error('[magic-link] Cleanup error:', error);
    return 0;
  }
}

/**
 * Build the magic link URL
 */
export function buildMagicLinkUrl(
  token: string,
  callbackUrl?: string
): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const url = new URL('/verify-magic-link', baseUrl);
  url.searchParams.set('token', token);

  if (callbackUrl) {
    url.searchParams.set('callbackUrl', callbackUrl);
  }

  return url.toString();
}
