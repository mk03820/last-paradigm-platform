/**
 * Password Utilities for Phase 3 Custom Auth (Server-only)
 *
 * Uses bcrypt for secure password hashing.
 * Cost factor 12 per NFR17 requirements.
 *
 * NOTE: This file uses bcrypt (native module) and can only be used server-side.
 * For client-side password utilities (validation, strength), use password-utils.ts
 *
 * Covers: Story 15.2 Task 1, NFR17 (Password hashing)
 */

import 'server-only';
import bcrypt from 'bcrypt';

// Re-export client-safe utilities for backward compatibility in server code
export {
  PASSWORD_MIN_LENGTH,
  PASSWORD_REQUIREMENTS,
  validatePassword,
  getPasswordStrength,
} from './password-utils';

// bcrypt cost factor - 12 rounds is a good balance of security and performance
const BCRYPT_ROUNDS = 12;

/**
 * Hash a plain text password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Verify a password against a hash
 * Uses timing-safe comparison to prevent timing attacks
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('[password] Verification error:', error);
    return false;
  }
}

