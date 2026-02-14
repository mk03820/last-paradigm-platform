/**
 * Password Utilities for Phase 3 Custom Auth
 *
 * Uses bcrypt for secure password hashing.
 * Cost factor 12 per NFR17 requirements.
 *
 * Covers: Story 15.2 Task 1, NFR17 (Password hashing)
 */

import bcrypt from 'bcrypt';

// bcrypt cost factor - 12 rounds is a good balance of security and performance
const BCRYPT_ROUNDS = 12;

// Password requirements
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_REQUIREMENTS = {
  minLength: PASSWORD_MIN_LENGTH,
  requireNumber: true,
  requireLetter: true,
};

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

/**
 * Validate password meets requirements
 */
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
  }

  if (PASSWORD_REQUIREMENTS.requireNumber && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (PASSWORD_REQUIREMENTS.requireLetter && !/[a-zA-Z]/.test(password)) {
    errors.push('Password must contain at least one letter');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get password strength score (0-4)
 * 0: Very weak, 1: Weak, 2: Fair, 3: Strong, 4: Very strong
 */
export function getPasswordStrength(password: string): {
  score: number;
  label: string;
} {
  let score = 0;

  // Length checks
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;

  // Complexity checks
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  // Cap at 4
  score = Math.min(score, 4);

  const labels = ['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'];

  return {
    score,
    label: labels[score],
  };
}
