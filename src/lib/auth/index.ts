/**
 * Auth Module Index
 *
 * Re-exports all auth utilities for convenient imports.
 *
 * Covers: Story 15.2, 15.3, 15.4
 */

// JWT utilities
export {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  createTokenPair,
  REFRESH_TOKEN_COOKIE_OPTIONS,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
} from './jwt';

// Password utilities
export {
  hashPassword,
  verifyPassword,
  validatePassword,
  getPasswordStrength,
  PASSWORD_MIN_LENGTH,
  PASSWORD_REQUIREMENTS,
} from './password';

// Magic link utilities
export {
  generateMagicLinkToken,
  createMagicLink,
  verifyMagicLink,
  findOrCreateUserByEmail,
  cleanupExpiredMagicLinks,
  buildMagicLinkUrl,
  isRateLimited,
  getRateLimitRemaining,
} from './magic-link';

// Password reset utilities
export {
  generateResetToken,
  createPasswordReset,
  verifyPasswordReset,
  markResetUsed,
  cleanupExpiredResets,
  buildResetUrl,
  isResetRateLimited,
} from './password-reset';
