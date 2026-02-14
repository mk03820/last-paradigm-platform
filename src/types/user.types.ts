/**
 * User Type Definitions for Phase 3
 *
 * Application-level types for user management, separate from Drizzle schema types.
 * These types are used in API endpoints, services, and components.
 *
 * Covers: Story 15.1 Task 6.1 (User, UserCreate, UserUpdate types)
 */

import type { User as DrizzleUser, NewUser as DrizzleNewUser } from '@/lib/db/schema';

/**
 * Purchase status values for user accounts
 */
export type PurchaseStatus = 'none' | 'pending' | 'completed' | 'refunded';

/**
 * Full user record from database
 */
export type User = DrizzleUser;

/**
 * Data required to create a new user
 */
export type UserCreate = DrizzleNewUser;

/**
 * Data for updating an existing user (all fields optional)
 */
export interface UserUpdate {
  name?: string | null;
  email?: string;
  emailVerified?: Date | null;
  image?: string | null;
  passwordHash?: string | null;
  purchaseStatus?: PurchaseStatus;
  purchasedAt?: Date | null;
  stripeCustomerId?: string | null;
  updatedAt?: Date;
}

/**
 * Public user profile (excludes sensitive fields like passwordHash)
 */
export interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  purchaseStatus: string | null;
  purchasedAt: Date | null;
  createdAt: Date | null;
}

/**
 * User with purchase information for dashboard display
 */
export interface UserWithPurchaseInfo extends UserProfile {
  hasPurchased: boolean;
  stripeCustomerId: string | null;
}

/**
 * Registration request payload for email/password registration
 */
export interface RegistrationRequest {
  email: string;
  password: string;
  name?: string;
}

/**
 * Login request payload for email/password login
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * User session data (stored in JWT)
 */
export interface UserSession {
  id: string;
  email: string;
  name?: string | null;
  purchaseStatus: PurchaseStatus;
}

/**
 * Helper to convert database user to public profile
 */
export function toUserProfile(user: User): UserProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    purchaseStatus: user.purchaseStatus,
    purchasedAt: user.purchasedAt,
    createdAt: user.createdAt,
  };
}

/**
 * Helper to convert database user to session data
 * @throws Error if user.email is null (required for session)
 */
export function toUserSession(user: User): UserSession {
  if (!user.email) {
    throw new Error('Cannot create session for user without email');
  }
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    purchaseStatus: (user.purchaseStatus as PurchaseStatus) || 'none',
  };
}
