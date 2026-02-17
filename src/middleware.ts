/**
 * Auth Middleware for Route Protection
 *
 * Protects routes that require authentication.
 * Uses JWT access token verification for Phase 3 custom auth.
 *
 * Covers: Story 15.3 Task 10, NFR18 (JWT session management)
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/jwt';

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/preview',
  '/purchase',
];

// Routes that are always public
const PUBLIC_ROUTES = [
  '/',
  '/api',
  '/auth',
  '/tool',
  '/diagnostic',
  '/templates',
  '/recover-session',
  '/verify-magic-link',
  '/shared',
  '/unsubscribe',
  '/admin',
  '/_next',
  '/favicon.ico',
];

/**
 * Check if a path matches any of the protected route patterns
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

/**
 * Check if a path matches any of the public route patterns
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Check protected routes
  if (isProtectedRoute(pathname)) {
    // Get access token from Authorization header
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    // Also check for refresh token cookie as fallback
    const refreshToken = request.cookies.get('refresh_token')?.value;

    // If no tokens at all, redirect to signin
    if (!accessToken && !refreshToken) {
      const url = new URL('/auth/signin', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    // If we have an access token, verify it
    if (accessToken) {
      try {
        const payload = await verifyAccessToken(accessToken);
        if (!payload) {
          // Token is invalid/expired, but we have refresh token
          // Let the request through - the client will handle refresh
          if (refreshToken) {
            return NextResponse.next();
          }
          // No refresh token either - redirect to signin
          const url = new URL('/auth/signin', request.url);
          url.searchParams.set('callbackUrl', pathname);
          return NextResponse.redirect(url);
        }
        // Valid token - proceed
        return NextResponse.next();
      } catch {
        // Token verification failed
        if (refreshToken) {
          // Has refresh token, let client handle refresh
          return NextResponse.next();
        }
        // No refresh token - redirect
        const url = new URL('/auth/signin', request.url);
        url.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(url);
      }
    }

    // No access token but has refresh token
    // Allow request through - client will refresh on load
    if (refreshToken) {
      return NextResponse.next();
    }
  }

  // Default: allow the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
