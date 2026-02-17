/**
 * User Access Control Utilities
 *
 * Functions for checking and verifying user access to paid features.
 *
 * Story 17.4: Stripe Webhook Handler
 * Task 4.4: Create utility function to check user access
 * Covers: AC4 (user access verification)
 */

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * User access information
 */
export interface UserAccess {
  hasPb2Access: boolean;
  pb2PurchasedAt: Date | null;
  purchaseStatus: string | null;
}

/**
 * Access check error
 */
export class AccessDeniedError extends Error {
  constructor(message: string = 'Playbook 2 access required') {
    super(message);
    this.name = 'AccessDeniedError';
  }
}

/**
 * Check if a user has Playbook 2 access
 *
 * @param userId - User ID to check
 * @returns boolean indicating if user has access
 */
export async function checkPb2Access(userId: string): Promise<boolean> {
  const user = await db
    .select({
      hasPb2Access: users.hasPb2Access,
      purchaseStatus: users.purchaseStatus,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (user.length === 0) {
    return false;
  }

  // User has access if hasPb2Access is true OR purchaseStatus is completed
  return user[0].hasPb2Access || user[0].purchaseStatus === 'completed';
}

/**
 * Get full user access information
 *
 * @param userId - User ID to check
 * @returns UserAccess object with detailed access info
 */
export async function getUserAccess(userId: string): Promise<UserAccess | null> {
  const user = await db
    .select({
      hasPb2Access: users.hasPb2Access,
      pb2PurchasedAt: users.pb2PurchasedAt,
      purchaseStatus: users.purchaseStatus,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return {
    hasPb2Access: user[0].hasPb2Access || user[0].purchaseStatus === 'completed',
    pb2PurchasedAt: user[0].pb2PurchasedAt,
    purchaseStatus: user[0].purchaseStatus,
  };
}

/**
 * Require Playbook 2 access or throw error
 *
 * Use this in API routes or server actions that require PB2 access.
 *
 * @param userId - User ID to verify
 * @throws AccessDeniedError if user does not have access
 */
export async function requirePb2Access(userId: string): Promise<void> {
  const hasAccess = await checkPb2Access(userId);

  if (!hasAccess) {
    throw new AccessDeniedError();
  }
}

/**
 * Check if a user has access by email
 *
 * Useful for webhook handlers where we may not have the user ID.
 *
 * @param email - User email to check
 * @returns boolean indicating if user has access
 */
export async function checkPb2AccessByEmail(email: string): Promise<boolean> {
  const user = await db
    .select({
      hasPb2Access: users.hasPb2Access,
      purchaseStatus: users.purchaseStatus,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (user.length === 0) {
    return false;
  }

  return user[0].hasPb2Access || user[0].purchaseStatus === 'completed';
}
