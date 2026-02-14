/**
 * Authentication Type Definitions
 *
 * Extends NextAuth.js types with custom session properties.
 * Phase 3 additions: Magic link and password reset types for custom JWT auth.
 *
 * Covers: Story 8.1 (Magic Link Authentication Infrastructure)
 * Covers: Story 15.1 Task 6.3 (MagicLink, PasswordReset types)
 */

import 'next-auth';
import 'next-auth/jwt';
import type {
  MagicLink as DrizzleMagicLink,
  NewMagicLink as DrizzleNewMagicLink,
  PasswordReset as DrizzlePasswordReset,
  NewPasswordReset as DrizzleNewPasswordReset,
  PreservedSession as DrizzlePreservedSession,
  NewPreservedSession as DrizzleNewPreservedSession,
  PreservedSessionData as DrizzlePreservedSessionData,
} from '@/lib/db/schema';

// ============================================================================
// NextAuth.js Type Extensions (Phase 2)
// ============================================================================

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    emailVerified?: Date | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
  }
}

// ============================================================================
// Phase 3 Custom Auth Types
// ============================================================================

/**
 * Full magic link record from database
 */
export type MagicLink = DrizzleMagicLink;

/**
 * Data required to create a new magic link
 */
export type MagicLinkCreate = DrizzleNewMagicLink;

/**
 * Full password reset record from database
 */
export type PasswordReset = DrizzlePasswordReset;

/**
 * Data required to create a new password reset
 */
export type PasswordResetCreate = DrizzleNewPasswordReset;

/**
 * Magic link request payload
 */
export interface MagicLinkRequest {
  email: string;
}

/**
 * Magic link verification payload
 */
export interface MagicLinkVerify {
  token: string;
}

/**
 * Password reset request payload
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password reset completion payload
 */
export interface PasswordResetComplete {
  token: string;
  newPassword: string;
}

/**
 * JWT payload for Phase 3 custom auth
 */
export interface JWTPayload {
  sub: string; // User ID
  email: string;
  name?: string | null;
  purchaseStatus: string;
  iat: number; // Issued at
  exp: number; // Expiration
}

/**
 * Auth response for login/registration endpoints
 */
export interface AuthResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string | null;
    purchaseStatus: string;
  };
  token?: string;
  error?: string;
}

/**
 * Magic link status for tracking
 */
export type MagicLinkStatus = 'pending' | 'used' | 'expired';

/**
 * Password reset status for tracking
 */
export type PasswordResetStatus = 'pending' | 'used' | 'expired';

/**
 * Helper to check if a magic link is valid (not expired, not used)
 */
export function isMagicLinkValid(magicLink: MagicLink): boolean {
  if (magicLink.usedAt) return false;
  if (new Date(magicLink.expiresAt) < new Date()) return false;
  return true;
}

/**
 * Helper to check if a password reset is valid (not expired, not used)
 */
export function isPasswordResetValid(reset: PasswordReset): boolean {
  if (reset.usedAt) return false;
  if (new Date(reset.expiresAt) < new Date()) return false;
  return true;
}

/**
 * Helper to get magic link status
 */
export function getMagicLinkStatus(magicLink: MagicLink): MagicLinkStatus {
  if (magicLink.usedAt) return 'used';
  if (new Date(magicLink.expiresAt) < new Date()) return 'expired';
  return 'pending';
}

/**
 * Helper to get password reset status
 */
export function getPasswordResetStatus(reset: PasswordReset): PasswordResetStatus {
  if (reset.usedAt) return 'used';
  if (new Date(reset.expiresAt) < new Date()) return 'expired';
  return 'pending';
}

// ============================================================================
// Phase 3 Pre-Account Results Preservation Types (Story 15.8)
// ============================================================================

/**
 * Full preserved session record from database
 */
export type PreservedSession = DrizzlePreservedSession;

/**
 * Data required to create a new preserved session
 */
export type PreservedSessionCreate = DrizzleNewPreservedSession;

/**
 * Session data structure for preservation
 */
export type PreservedSessionData = DrizzlePreservedSessionData;

/**
 * Preserved session status for tracking
 */
export type PreservedSessionStatus = 'pending' | 'used' | 'expired';

/**
 * Request payload for preserving a session
 */
export interface PreserveSessionRequest {
  email: string;
  sessionData: PreservedSessionData;
}

/**
 * Response for preserve session API
 */
export interface PreserveSessionResponse {
  success: boolean;
  message?: string;
  error?: {
    code: 'RATE_LIMITED' | 'INVALID_EMAIL' | 'SERVER_ERROR';
    message: string;
  };
}

/**
 * Response for recover session API
 */
export interface RecoverSessionResponse {
  success: boolean;
  data?: PreservedSessionData;
  error?: {
    code: 'EXPIRED' | 'INVALID_TOKEN' | 'SERVER_ERROR';
    message: string;
  };
}

/**
 * Helper to check if a preserved session is valid (not expired, not used)
 */
export function isPreservedSessionValid(session: PreservedSession): boolean {
  if (session.usedAt) return false;
  if (new Date(session.expiresAt) < new Date()) return false;
  return true;
}

/**
 * Helper to get preserved session status
 */
export function getPreservedSessionStatus(session: PreservedSession): PreservedSessionStatus {
  if (session.usedAt) return 'used';
  if (new Date(session.expiresAt) < new Date()) return 'expired';
  return 'pending';
}
