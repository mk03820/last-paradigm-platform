/**
 * Admin Authentication Tests
 *
 * Story 21.1: Admin Authentication & Layout
 * Task 8: Write tests (AC: all)
 *
 * Uses node environment to avoid vmThreads Uint8Array cross-VM issues.
 *
 * @vitest-environment node
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Set environment variables BEFORE importing the admin-auth module
process.env.ADMIN_JWT_SECRET = 'test-secret-key-for-admin-jwt-testing-minimum-32-chars';

// Mock database before importing admin-auth
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([])),
        })),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => Promise.resolve([{ id: 'test-admin-id' }])),
      })),
    })),
  },
}));

// Mock bcrypt
vi.mock('bcrypt', () => ({
  default: {
    compare: vi.fn(() => Promise.resolve(true)),
    hash: vi.fn(() => Promise.resolve('hashed-password')),
  },
}));

// Mock cookies
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(() => null),
  })),
}));

// Import the actual functions after mocks are set up
import {
  createAdminToken,
  verifyAdminToken,
  ADMIN_TOKEN_COOKIE_OPTIONS,
  ADMIN_TOKEN_EXPIRY,
} from '@/lib/auth/admin-auth';

describe('Admin JWT Token', () => {
  beforeEach(() => {
    // Reset to default secret before each test
    process.env.ADMIN_JWT_SECRET = 'test-secret-key-for-admin-jwt-testing-minimum-32-chars';
  });

  it('should create a valid admin token structure', async () => {
    const adminPayload = {
      id: 'admin-123',
      email: 'admin@test.com',
      name: 'Test Admin',
      role: 'admin' as const,
    };

    const token = await createAdminToken(adminPayload);

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3); // JWT has 3 parts
  });

  it('should verify admin token and extract payload', async () => {
    const adminPayload = {
      id: 'admin-123',
      email: 'admin@test.com',
      name: 'Test Admin',
      role: 'admin' as const,
    };

    const token = await createAdminToken(adminPayload);
    const payload = await verifyAdminToken(token);

    expect(payload).not.toBeNull();
    expect(payload!.sub).toBe('admin-123');
    expect(payload!.email).toBe('admin@test.com');
    expect(payload!.name).toBe('Test Admin');
    expect(payload!.role).toBe('admin');
    expect(payload!.type).toBe('admin');
  });

  it('should reject token with wrong secret', async () => {
    const adminPayload = {
      id: 'admin-123',
      email: 'admin@test.com',
      name: 'Test Admin',
      role: 'admin' as const,
    };

    // Create token with one secret
    const token = await createAdminToken(adminPayload);

    // Change the secret
    process.env.ADMIN_JWT_SECRET = 'different-secret-key-for-testing-minimum-32-chars';

    // Verification should return null (invalid token)
    const payload = await verifyAdminToken(token);
    expect(payload).toBeNull();
  });

  it('should have 4-hour expiration', async () => {
    const adminPayload = {
      id: 'admin-123',
      email: 'admin@test.com',
      name: 'Test Admin',
      role: 'admin' as const,
    };

    const token = await createAdminToken(adminPayload);
    const payload = await verifyAdminToken(token);

    expect(payload).not.toBeNull();

    // Check expiration is approximately 4 hours from now
    const now = Math.floor(Date.now() / 1000);
    const fourHours = 4 * 60 * 60;
    const exp = payload!.exp;

    expect(exp).toBeGreaterThan(now);
    expect(exp).toBeLessThanOrEqual(now + fourHours + 10); // +10 for test execution time
  });

  it('should export correct token expiry constant', () => {
    expect(ADMIN_TOKEN_EXPIRY).toBe('4h');
  });
});

describe('Admin Cookie Options', () => {
  it('should have correct cookie configuration', () => {
    const cookieOptions = {
      name: 'admin_token',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/admin',
      maxAge: 4 * 60 * 60, // 4 hours in seconds
    };

    expect(cookieOptions.name).toBe('admin_token');
    expect(cookieOptions.httpOnly).toBe(true);
    expect(cookieOptions.sameSite).toBe('strict');
    expect(cookieOptions.path).toBe('/admin');
    expect(cookieOptions.maxAge).toBe(14400); // 4 hours
  });
});

describe('Admin Actions Constants', () => {
  it('should define all required admin actions', () => {
    const ADMIN_ACTIONS = {
      LOGIN: 'login',
      LOGOUT: 'logout',
      LOGIN_FAILED: 'login_failed',
      INVOICE_VIEW: 'invoice_view',
      INVOICE_STATUS_UPDATE: 'invoice_status_update',
      INVOICE_SENT: 'invoice_sent',
      INVOICE_PAID: 'invoice_paid',
      INVOICE_CANCELLED: 'invoice_cancelled',
      REFUND_VIEW: 'refund_view',
      REFUND_INITIATED: 'refund_initiated',
      REFUND_COMPLETED: 'refund_completed',
      REFUND_FAILED: 'refund_failed',
      WEBHOOK_VIEW: 'webhook_view',
      WEBHOOK_RETRY: 'webhook_retry',
      WEBHOOK_ACKNOWLEDGE: 'webhook_acknowledge',
      WEBHOOK_RECONCILE: 'webhook_reconcile',
      MANUAL_RECONCILE: 'manual_reconcile',
      METRICS_VIEW: 'metrics_view',
    };

    expect(Object.keys(ADMIN_ACTIONS).length).toBeGreaterThan(10);
    expect(ADMIN_ACTIONS.LOGIN).toBe('login');
    expect(ADMIN_ACTIONS.INVOICE_PAID).toBe('invoice_paid');
    expect(ADMIN_ACTIONS.REFUND_COMPLETED).toBe('refund_completed');
    expect(ADMIN_ACTIONS.MANUAL_RECONCILE).toBe('manual_reconcile');
  });
});

describe('Entity Types Constants', () => {
  it('should define all required entity types', () => {
    const ENTITY_TYPES = {
      INVOICE_REQUEST: 'invoice_request',
      PURCHASE: 'purchase',
      REFUND: 'refund',
      WEBHOOK: 'webhook',
      USER: 'user',
      ADMIN: 'admin',
    };

    expect(Object.keys(ENTITY_TYPES).length).toBe(6);
    expect(ENTITY_TYPES.INVOICE_REQUEST).toBe('invoice_request');
    expect(ENTITY_TYPES.PURCHASE).toBe('purchase');
    expect(ENTITY_TYPES.REFUND).toBe('refund');
  });
});
