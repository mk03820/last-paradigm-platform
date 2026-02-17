/**
 * Admin Audit Logger
 *
 * Utility for logging admin actions with standardized format.
 *
 * Story 21.1: Admin Authentication & Layout
 * Task 7: Implement audit logging (AC: 5)
 * Covers: AC5 (admin actions logged with timestamp, admin ID, action type, affected entity)
 */

import { db } from '@/lib/db';
import { adminAuditLogs } from '@/lib/db/schema';
import { desc, eq, and, gte, lte, sql } from 'drizzle-orm';

/**
 * Standard admin actions for consistency
 */
export const ADMIN_ACTIONS = {
  // Authentication
  LOGIN: 'login',
  LOGOUT: 'logout',
  LOGIN_FAILED: 'login_failed',

  // Invoice management
  INVOICE_VIEW: 'invoice_view',
  INVOICE_STATUS_UPDATE: 'invoice_status_update',
  INVOICE_SENT: 'invoice_sent',
  INVOICE_PAID: 'invoice_paid',
  INVOICE_CANCELLED: 'invoice_cancelled',

  // Refund processing
  REFUND_VIEW: 'refund_view',
  REFUND_INITIATED: 'refund_initiated',
  REFUND_COMPLETED: 'refund_completed',
  REFUND_FAILED: 'refund_failed',

  // Webhook management
  WEBHOOK_VIEW: 'webhook_view',
  WEBHOOK_RETRY: 'webhook_retry',
  WEBHOOK_ACKNOWLEDGE: 'webhook_acknowledge',
  WEBHOOK_RECONCILE: 'webhook_reconcile',
  MANUAL_RECONCILE: 'manual_reconcile',

  // Metrics
  METRICS_VIEW: 'metrics_view',
} as const;

export type AdminAction = (typeof ADMIN_ACTIONS)[keyof typeof ADMIN_ACTIONS];

/**
 * Entity types for audit logging
 */
export const ENTITY_TYPES = {
  INVOICE_REQUEST: 'invoice_request',
  PURCHASE: 'purchase',
  REFUND: 'refund',
  WEBHOOK: 'webhook',
  USER: 'user',
  ADMIN: 'admin',
} as const;

export type EntityType = (typeof ENTITY_TYPES)[keyof typeof ENTITY_TYPES];

/**
 * Log an admin action
 */
export async function logAdminAction(data: {
  adminId: string;
  action: AdminAction | string;
  entityType?: EntityType | string;
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
    console.error('[audit-logger] Failed to log admin action:', error);
  }
}

/**
 * Query audit logs with filtering
 */
export async function queryAuditLogs(options: {
  adminId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}): Promise<{
  logs: Array<{
    id: string;
    adminId: string;
    action: string;
    entityType: string | null;
    entityId: string | null;
    details: Record<string, unknown> | null;
    ipAddress: string | null;
    createdAt: Date;
  }>;
  total: number;
}> {
  const conditions = [];

  if (options.adminId) {
    conditions.push(eq(adminAuditLogs.adminId, options.adminId));
  }
  if (options.action) {
    conditions.push(eq(adminAuditLogs.action, options.action));
  }
  if (options.entityType) {
    conditions.push(eq(adminAuditLogs.entityType, options.entityType));
  }
  if (options.entityId) {
    conditions.push(eq(adminAuditLogs.entityId, options.entityId));
  }
  if (options.startDate) {
    conditions.push(gte(adminAuditLogs.createdAt, options.startDate));
  }
  if (options.endDate) {
    conditions.push(lte(adminAuditLogs.createdAt, options.endDate));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const limit = Math.min(options.limit || 50, 100);
  const offset = options.offset || 0;

  const [logs, countResult] = await Promise.all([
    db
      .select({
        id: adminAuditLogs.id,
        adminId: adminAuditLogs.adminId,
        action: adminAuditLogs.action,
        entityType: adminAuditLogs.entityType,
        entityId: adminAuditLogs.entityId,
        details: adminAuditLogs.details,
        ipAddress: adminAuditLogs.ipAddress,
        createdAt: adminAuditLogs.createdAt,
      })
      .from(adminAuditLogs)
      .where(whereClause)
      .orderBy(desc(adminAuditLogs.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(adminAuditLogs)
      .where(whereClause),
  ]);

  return {
    logs,
    total: Number(countResult[0].count),
  };
}

/**
 * Get recent activity for an admin
 */
export async function getAdminRecentActivity(
  adminId: string,
  limit: number = 10
): Promise<
  Array<{
    action: string;
    entityType: string | null;
    entityId: string | null;
    createdAt: Date;
  }>
> {
  return db
    .select({
      action: adminAuditLogs.action,
      entityType: adminAuditLogs.entityType,
      entityId: adminAuditLogs.entityId,
      createdAt: adminAuditLogs.createdAt,
    })
    .from(adminAuditLogs)
    .where(eq(adminAuditLogs.adminId, adminId))
    .orderBy(desc(adminAuditLogs.createdAt))
    .limit(limit);
}
