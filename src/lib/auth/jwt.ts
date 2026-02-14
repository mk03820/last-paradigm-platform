/**
 * JWT Utilities for Phase 3 Custom Auth
 *
 * Uses jose library for Edge-compatible JWT operations.
 * Implements access tokens (15min) and refresh tokens (7d).
 *
 * Covers: Story 15.4 Task 6.2, NFR18 (JWT session management)
 * Per architecture.md: jose library v5.x for Edge compatibility
 */

import * as jose from 'jose';
import type { JWTPayload } from '@/types/auth.types';

// Token expiry durations
export const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
export const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

// JWT secrets from environment
function getJWTSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET or AUTH_SECRET environment variable is required');
  }
  return new TextEncoder().encode(secret);
}

function getRefreshSecret(): Uint8Array {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET or AUTH_SECRET environment variable is required');
  }
  return new TextEncoder().encode(secret);
}

/**
 * Create an access token for the user
 */
export async function createAccessToken(payload: {
  userId: string;
  email: string;
  name?: string | null;
  purchaseStatus?: string;
}): Promise<string> {
  const secret = getJWTSecret();

  const token = await new jose.SignJWT({
    email: payload.email,
    name: payload.name,
    purchaseStatus: payload.purchaseStatus || 'none',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(secret);

  return token;
}

/**
 * Create a refresh token for the user
 */
export async function createRefreshToken(userId: string): Promise<string> {
  const secret = getRefreshSecret();

  const token = await new jose.SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(secret);

  return token;
}

/**
 * Verify and decode an access token
 */
export async function verifyAccessToken(token: string): Promise<JWTPayload | null> {
  try {
    const secret = getJWTSecret();
    const { payload } = await jose.jwtVerify(token, secret);

    return {
      sub: payload.sub as string,
      email: payload.email as string,
      name: payload.name as string | null | undefined,
      purchaseStatus: payload.purchaseStatus as string,
      iat: payload.iat as number,
      exp: payload.exp as number,
    };
  } catch (error) {
    // Token expired, invalid, or tampered
    console.error('[jwt] Access token verification failed:', error);
    return null;
  }
}

/**
 * Verify and decode a refresh token
 */
export async function verifyRefreshToken(
  token: string
): Promise<{ userId: string } | null> {
  try {
    const secret = getRefreshSecret();
    const { payload } = await jose.jwtVerify(token, secret);

    return {
      userId: payload.sub as string,
    };
  } catch (error) {
    // Token expired, invalid, or tampered
    console.error('[jwt] Refresh token verification failed:', error);
    return null;
  }
}

/**
 * Create both access and refresh tokens for a user
 */
export async function createTokenPair(payload: {
  userId: string;
  email: string;
  name?: string | null;
  purchaseStatus?: string;
}): Promise<{ accessToken: string; refreshToken: string }> {
  const [accessToken, refreshToken] = await Promise.all([
    createAccessToken(payload),
    createRefreshToken(payload.userId),
  ]);

  return { accessToken, refreshToken };
}

/**
 * Cookie options for refresh token
 */
export const REFRESH_TOKEN_COOKIE_OPTIONS = {
  name: 'refresh_token',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
};
