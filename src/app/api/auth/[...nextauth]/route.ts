/**
 * NextAuth.js API Route Handler
 *
 * Handles all authentication routes:
 * - GET/POST /api/auth/signin - Sign in page
 * - GET/POST /api/auth/signout - Sign out
 * - GET /api/auth/session - Get session
 * - POST /api/auth/callback/resend - Magic link callback
 * - GET /api/auth/csrf - CSRF token
 * - GET /api/auth/providers - Available providers
 *
 * Covers: FR2-1, FR2-2 (Magic link authentication)
 */

import { handlers } from '@/auth';

export const { GET, POST } = handlers;
