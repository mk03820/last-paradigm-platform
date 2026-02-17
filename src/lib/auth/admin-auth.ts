/**
 * Admin Authentication Utilities
 *
 * Separate authentication system for admin users with:
 * - 4-hour session expiration (Story 21.1 AC3)
 * - Invite-only accounts (AC2)
 * - Audit logging integration
 *
 * Uses jose library for Edge-compatible JWT operations.
 *
 * Covers: Story 21.1, FR75 (Admin authentication)
 */

import * as jose from 'jose';
import bcrypt from 'bcrypt';
import { db } from '@/lib/db';
import { adminUsers, adminAuditLogs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';

// Admin token expiry - 4 hours for security
export const ADMIN_TOKEN_EXPIRY = '4h';

/**
 * Admin JWT Payload interface
 */
export interface AdminJWTPayload {
  sub: string; // Admin user ID
  email: string;
  name: string | null;
  role: 'admin' | 'super_admin';
  type: 'admin'; // Distinguish from user tokens
  iat: number;
  exp: number;
}

/**
 * Get admin JWT secret
 */
function getAdminJWTSecret(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET || process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error('ADMIN_JWT_SECRET or AUTH_SECRET environment variable is required');
  }
  return new TextEncoder().encode(secret);
}

/**
 * Create an admin access token
 */
export async function createAdminToken(admin: {
  id: string;
  email: string;
  name: string | null;
  role: 'admin' | 'super_admin';
}): Promise<string> {
  const secret = getAdminJWTSecret();

  const token = await new jose.SignJWT({
    email: admin.email,
    name: admin.name,
    role: admin.role,
    type: 'admin',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(admin.id)
    .setIssuedAt()
    .setExpirationTime(ADMIN_TOKEN_EXPIRY)
    .sign(secret);

  return token;
}

/**
 * Verify and decode an admin token
 */
export async function verifyAdminToken(token: string): Promise<AdminJWTPayload | null> {
  try {
    const secret = getAdminJWTSecret();
    const { payload } = await jose.jwtVerify(token, secret);

    // Verify this is an admin token
    if (payload.type !== 'admin') {
      console.error('[admin-auth] Token is not an admin token');
      return null;
    }

    return {
      sub: payload.sub as string,
      email: payload.email as string,
      name: (payload.name as string) || null,
      role: payload.role as 'admin' | 'super_admin',
      type: 'admin',
      iat: payload.iat as number,
      exp: payload.exp as number,
    };
  } catch (error) {
    // Token expired, invalid, or tampered
    console.error('[admin-auth] Admin token verification failed:', error);
    return null;
  }
}

/**
 * Authenticate an admin user with email and password
 */
export async function authenticateAdmin(
  email: string,
  password: string
): Promise<{ success: true; admin: AdminJWTPayload; token: string } | { success: false; error: string }> {
  try {
    // Find admin by email
    const [admin] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, email.toLowerCase()))
      .limit(1);

    if (!admin) {
      return { success: false, error: 'Invalid credentials' };
    }

    if (!admin.isActive) {
      return { success: false, error: 'Account is disabled' };
    }

    // Verify password
    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) {
      return { success: false, error: 'Invalid credentials' };
    }

    // Update last login
    await db
      .update(adminUsers)
      .set({ lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(adminUsers.id, admin.id));

    // Create token
    const token = await createAdminToken({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });

    const payload: AdminJWTPayload = {
      sub: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      type: 'admin',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 4 * 60 * 60, // 4 hours
    };

    return { success: true, admin: payload, token };
  } catch (error) {
    console.error('[admin-auth] Authentication error:', error);
    return { success: false, error: 'Authentication failed' };
  }
}

/**
 * Create an admin user (invite-only, used by CLI or super_admin)
 */
export async function createAdmin(data: {
  email: string;
  password: string;
  name?: string;
  role?: 'admin' | 'super_admin';
}): Promise<{ success: true; adminId: string } | { success: false; error: string }> {
  try {
    // Check if admin already exists
    const [existing] = await db
      .select({ id: adminUsers.id })
      .from(adminUsers)
      .where(eq(adminUsers.email, data.email.toLowerCase()))
      .limit(1);

    if (existing) {
      return { success: false, error: 'Admin with this email already exists' };
    }

    // Hash password with bcrypt (cost factor 12 for security)
    const passwordHash = await bcrypt.hash(data.password, 12);

    // Create admin
    const [admin] = await db
      .insert(adminUsers)
      .values({
        email: data.email.toLowerCase(),
        passwordHash,
        name: data.name || null,
        role: data.role || 'admin',
      })
      .returning({ id: adminUsers.id });

    return { success: true, adminId: admin.id };
  } catch (error) {
    console.error('[admin-auth] Create admin error:', error);
    return { success: false, error: 'Failed to create admin' };
  }
}

/**
 * Get the current admin session from cookies
 */
export async function getAdminSession(): Promise<AdminJWTPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token) {
      return null;
    }

    return verifyAdminToken(token);
  } catch (error) {
    console.error('[admin-auth] Get session error:', error);
    return null;
  }
}

/**
 * Admin authentication middleware for API routes
 */
export async function requireAdmin(): Promise<
  | { authenticated: true; admin: AdminJWTPayload }
  | { authenticated: false; error: string }
> {
  const session = await getAdminSession();

  if (!session) {
    return { authenticated: false, error: 'Unauthorized' };
  }

  // Verify admin is still active in database
  const [admin] = await db
    .select({ isActive: adminUsers.isActive })
    .from(adminUsers)
    .where(eq(adminUsers.id, session.sub))
    .limit(1);

  if (!admin || !admin.isActive) {
    return { authenticated: false, error: 'Account disabled' };
  }

  return { authenticated: true, admin: session };
}

/**
 * Log an admin action for audit trail
 */
export async function logAdminAction(data: {
  adminId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  try {
    await db.insert(adminAuditLogs).values({
      adminId: data.adminId,
      action: data.action,
      entityType: data.entityType || null,
      entityId: data.entityId || null,
      details: data.details || null,
      ipAddress: data.ipAddress || null,
      userAgent: data.userAgent || null,
    });
  } catch (error) {
    // Log but don't throw - audit logging should not break operations
    console.error('[admin-auth] Failed to log admin action:', error);
  }
}

/**
 * Cookie options for admin token
 */
export const ADMIN_TOKEN_COOKIE_OPTIONS = {
  name: 'admin_token',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/admin',
  maxAge: 4 * 60 * 60, // 4 hours in seconds
};
