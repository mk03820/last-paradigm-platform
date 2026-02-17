import {
  pgTable,
  serial,
  varchar,
  timestamp,
  text,
  primaryKey,
  integer,
  jsonb,
  pgEnum,
  numeric,
  uuid,
  index,
  boolean,
} from 'drizzle-orm/pg-core';
import type { AdapterAccountType } from 'next-auth/adapters';

// ============================================================================
// PHASE 1 SCHEMA - Email Lead Capture
// ============================================================================

/**
 * Email table schema for storing Phase 2 notification signups.
 *
 * Covers: FR30 (Email storage in Vercel Postgres)
 * Security: NFR10 (Encryption at rest provided by Vercel Postgres)
 */
export const emails = pgTable('emails', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  source: varchar('source', { length: 50 }).default('meeting-audit-results'),
  createdAt: timestamp('created_at').defaultNow(),
});

export type Email = typeof emails.$inferSelect;
export type NewEmail = typeof emails.$inferInsert;

// ============================================================================
// PHASE 2 SCHEMA - NextAuth.js Authentication (Existing)
// ============================================================================

/**
 * NextAuth.js User table - Extended for Phase 3
 *
 * Stores user accounts created via magic link authentication.
 * Phase 3 additions: passwordHash, purchaseStatus, purchasedAt, stripeCustomerId
 * Story 17.4 additions: hasPb2Access, pb2PurchasedAt
 *
 * Covers: FR2-1, FR2-2 (Magic link account creation and sign in)
 * Phase 3: FR38 (Email/password registration), FR46-48 (Stripe integration)
 */
export const users = pgTable(
  'users',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text('name'),
    email: text('email').unique(),
    emailVerified: timestamp('email_verified', { mode: 'date' }),
    image: text('image'),
    // Phase 3 additions
    passwordHash: varchar('password_hash', { length: 255 }), // bcrypt output (NFR17)
    purchaseStatus: varchar('purchase_status', { length: 20 }).default('none'), // none, pending, completed, refunded
    purchasedAt: timestamp('purchased_at'),
    stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
    // Story 17.4: PB2 Access fields (AC4)
    hasPb2Access: boolean('has_pb2_access').default(false).notNull(),
    pb2PurchasedAt: timestamp('pb2_purchased_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [index('idx_users_email').on(table.email)]
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

/**
 * NextAuth.js Account table
 *
 * Links authentication providers to users.
 * For magic link auth, this stores the email provider link.
 */
export const accounts = pgTable(
  'accounts',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ]
);

/**
 * NextAuth.js Session table
 *
 * Stores active user sessions for database session strategy.
 * Note: We use JWT strategy, so this table is optional but included for flexibility.
 */
export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

/**
 * NextAuth.js Verification Token table
 *
 * Stores magic link tokens for email verification.
 * Tokens expire after 15 minutes (NFR2-1) and are single-use.
 * Covers: AC3 (15-minute expiry), AC4 (single-use enforcement)
 */
export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (verificationToken) => [
    primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  ]
);

/**
 * Session status enum for diagnostic sessions
 */
export const sessionStatusEnum = pgEnum('session_status', [
  'in_progress',
  'completed',
]);

/**
 * Diagnostic Sessions table (Phase 2)
 *
 * Stores user diagnostic sessions for the 7-tool assessment.
 * Each session tracks progress across all tools and stores results.
 *
 * Covers: FR2-3 (View saved sessions), FR2-4 (Cross-device continuity)
 */
export const diagnosticSessions = pgTable('diagnostic_sessions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name'),
  status: sessionStatusEnum('status').default('in_progress').notNull(),
  toolsCompleted: integer('tools_completed').default(0).notNull(),
  // JSONB stores all tool inputs and results
  // Structure: { tool1: {...}, tool2: {...}, ... }
  data: jsonb('data').$type<DiagnosticSessionData>().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type DiagnosticSession = typeof diagnosticSessions.$inferSelect;
export type NewDiagnosticSession = typeof diagnosticSessions.$inferInsert;

/**
 * Type for diagnostic session data stored in JSONB
 */
export interface DiagnosticSessionData {
  // Tool 1: Organizational Alignment Assessment
  tool1?: {
    scores?: {
      strategic?: number;
      execution?: number;
      technology?: number;
      people?: number;
      governance?: number;
    };
    compositeScore?: number;
    completedAt?: string;
  };
  // Tool 2: Meeting Audit Calculator
  tool2?: {
    inputs?: {
      meetingCount?: number;
      averageAttendees?: number;
      averageDuration?: number;
      salaryDistribution?: {
        executive?: number;
        senior?: number;
        midLevel?: number;
        entry?: number;
      };
    };
    results?: {
      totalMeetingHours?: number;
      totalMeetingCost?: number;
      wastedHours?: number;
      wastedCost?: number;
      effectiveHours?: number;
      effectiveCost?: number;
    };
    completedAt?: string;
  };
  // Tool 3: Decision Velocity Scorecard
  tool3?: {
    decisions?: unknown[];
    metrics?: unknown;
    completedAt?: string;
  };
  // Tool 4: Stakeholder Power/Interest Mapping
  tool4?: {
    stakeholders?: unknown[];
    completedAt?: string;
  };
  // Tool 5: Data Flow Friction Analysis
  tool5?: {
    journeys?: unknown[];
    frictionCost?: number;
    completedAt?: string;
  };
  // Tool 6: Communication Pattern Diagnostic
  tool6?: {
    metrics?: unknown;
    antiPatterns?: unknown[];
    completedAt?: string;
  };
  // Tool 7: Total Cost of Misalignment
  tool7?: {
    totalCost?: number;
    alignmentTaxPercent?: number;
    completedAt?: string;
  };
}

// ============================================================================
// PHASE 3 SCHEMA - Monetization & User Accounts
// ============================================================================

/**
 * Diagnostic Results table (Phase 3)
 *
 * Stores user's completed PB1 diagnostic data for permanent storage.
 * Different from diagnosticSessions - this is the final, complete result.
 *
 * Covers: AC3 (Story 15.1), FR40 (PB1 data persistence), FR55 (PB1→PB2 data transformation)
 */
export const diagnosticResults = pgTable(
  'diagnostic_results',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    toolResults: jsonb('tool_results')
      .notNull()
      .$type<DiagnosticSessionData>(), // All 7 tools JSON
    totalAlignmentTax: numeric('total_alignment_tax', {
      precision: 12,
      scale: 2,
    }),
    estimatedSavings: numeric('estimated_savings', { precision: 12, scale: 2 }),
    completedAt: timestamp('completed_at').defaultNow(),
  },
  (table) => [index('idx_diagnostic_results_user_id').on(table.userId)]
);

export type DiagnosticResult = typeof diagnosticResults.$inferSelect;
export type NewDiagnosticResult = typeof diagnosticResults.$inferInsert;

/**
 * Magic Links table (Phase 3)
 *
 * Custom magic links for passwordless auth (separate from NextAuth verification tokens).
 * Used for Phase 3 custom JWT auth system.
 *
 * Covers: AC4 (Story 15.1), FR39 (Magic link authentication)
 */
export const magicLinks = pgTable(
  'magic_links',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull(),
    token: varchar('token', { length: 255 }).notNull().unique(),
    expiresAt: timestamp('expires_at').notNull(),
    usedAt: timestamp('used_at'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [
    index('idx_magic_links_token').on(table.token),
    index('idx_magic_links_email').on(table.email),
  ]
);

export type MagicLink = typeof magicLinks.$inferSelect;
export type NewMagicLink = typeof magicLinks.$inferInsert;

/**
 * Password Resets table (Phase 3)
 *
 * Stores password reset tokens with 1-hour expiry.
 *
 * Covers: AC5 (Story 15.1), FR42 (Password reset flow)
 */
export const passwordResets = pgTable(
  'password_resets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    token: varchar('token', { length: 255 }).notNull().unique(),
    expiresAt: timestamp('expires_at').notNull(),
    usedAt: timestamp('used_at'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [index('idx_password_resets_token').on(table.token)]
);

export type PasswordReset = typeof passwordResets.$inferSelect;
export type NewPasswordReset = typeof passwordResets.$inferInsert;

/**
 * Purchases table (Phase 3)
 *
 * Records Stripe payment transactions.
 *
 * Covers: FR46-48 (Stripe checkout integration)
 * Story 17.4: Added stripeCustomerId, unique constraint on stripeSessionId for idempotency
 */
export const purchases = pgTable(
  'purchases',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    stripeSessionId: varchar('stripe_session_id', { length: 255 })
      .notNull()
      .unique(), // Unique for idempotency (AC6)
    stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
    stripeCustomerId: varchar('stripe_customer_id', { length: 255 }), // Added for Story 17.4
    amount: integer('amount').notNull(), // cents
    currency: varchar('currency', { length: 3 }).default('usd').notNull(),
    status: varchar('status', { length: 20 }).notNull(), // pending, completed, failed, refunded
    metadata: jsonb('metadata').$type<Record<string, unknown>>(), // Store Stripe metadata
    createdAt: timestamp('created_at').defaultNow(),
    completedAt: timestamp('completed_at'),
  },
  (table) => [
    index('idx_purchases_user_id').on(table.userId),
    index('idx_purchases_stripe_session_id').on(table.stripeSessionId),
  ]
);

export type Purchase = typeof purchases.$inferSelect;
export type NewPurchase = typeof purchases.$inferInsert;

/**
 * Invoice Requests table (Phase 3)
 *
 * Enterprise invoice request flow for organizations that can't use credit cards.
 *
 * Covers: FR47 (Enterprise invoice option), FR59 (Enterprise-grade UX)
 */
export const invoiceRequests = pgTable(
  'invoice_requests',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    companyName: varchar('company_name', { length: 255 }).notNull(),
    billingAddress: text('billing_address').notNull(),
    poNumber: varchar('po_number', { length: 100 }),
    contactEmail: varchar('contact_email', { length: 255 }),
    status: varchar('status', { length: 20 }).default('pending').notNull(), // pending, invoice_sent, paid, cancelled
    adminNotes: text('admin_notes'),
    // Epic 21 additions
    invoiceNumber: varchar('invoice_number', { length: 100 }),
    cancellationReason: text('cancellation_reason'),
    processedBy: uuid('processed_by'), // References adminUsers.id - forward reference handled separately
    createdAt: timestamp('created_at').defaultNow(),
    processedAt: timestamp('processed_at'),
  },
  (table) => [
    index('idx_invoice_requests_user_id').on(table.userId),
    index('idx_invoice_requests_status').on(table.status),
  ]
);

export type InvoiceRequest = typeof invoiceRequests.$inferSelect;
export type NewInvoiceRequest = typeof invoiceRequests.$inferInsert;

/**
 * Generated Documents table (Phase 3)
 *
 * Tracks toolkit document generation status and S3 storage.
 *
 * Covers: FR49-51 (Document generation and delivery), FR60-61 (Download portal)
 */
export const generatedDocuments = pgTable(
  'generated_documents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    fileName: varchar('file_name', { length: 255 }).notNull(),
    fileType: varchar('file_type', { length: 20 }).notNull(), // docx, xlsx, pptx, pdf
    s3Key: varchar('s3_key', { length: 500 }).notNull(),
    fileSizeBytes: integer('file_size_bytes'),
    status: varchar('status', { length: 20 }).default('pending').notNull(), // pending, generating, completed, failed
    errorMessage: text('error_message'),
    createdAt: timestamp('created_at').defaultNow(),
    generatedAt: timestamp('generated_at'),
  },
  (table) => [index('idx_generated_documents_user_id').on(table.userId)]
);

export type GeneratedDocument = typeof generatedDocuments.$inferSelect;
export type NewGeneratedDocument = typeof generatedDocuments.$inferInsert;

/**
 * Email Sequences table (Phase 3)
 *
 * Tracks email nurture sequence progress per user.
 *
 * Covers: FR52-53 (Post-purchase email sequences)
 */
export const emailSequences = pgTable(
  'email_sequences',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    sequenceType: varchar('sequence_type', { length: 50 }).notNull(), // post_purchase, nurture, abandoned_cart
    currentStep: integer('current_step').default(0).notNull(),
    totalSteps: integer('total_steps').notNull(),
    status: varchar('status', { length: 20 }).default('active').notNull(), // active, paused, completed, unsubscribed
    lastSentAt: timestamp('last_sent_at'),
    nextSendAt: timestamp('next_send_at'),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [
    index('idx_email_sequences_user_id').on(table.userId),
    index('idx_email_sequences_status').on(table.status),
  ]
);

export type EmailSequence = typeof emailSequences.$inferSelect;
export type NewEmailSequence = typeof emailSequences.$inferInsert;

/**
 * Webhook Logs table (Phase 3)
 *
 * Audit log for all incoming webhooks (Stripe, etc.) for debugging and recovery.
 *
 * Covers: FR73 (Webhook retry & recovery), FR75 (Admin webhook monitoring)
 */
export const webhookLogs = pgTable(
  'webhook_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    source: varchar('source', { length: 50 }).notNull(), // stripe, resend, etc.
    eventType: varchar('event_type', { length: 100 }).notNull(),
    eventId: varchar('event_id', { length: 255 }), // Provider's event ID for deduplication
    payload: jsonb('payload').notNull(),
    status: varchar('status', { length: 20 }).notNull(), // received, processing, processed, failed
    attempts: integer('attempts').default(1).notNull(),
    errorMessage: text('error_message'),
    // Epic 21 additions for alert acknowledgement
    acknowledgedAt: timestamp('acknowledged_at'),
    acknowledgedBy: uuid('acknowledged_by'), // References adminUsers.id
    createdAt: timestamp('created_at').defaultNow(),
    processedAt: timestamp('processed_at'),
  },
  (table) => [
    index('idx_webhook_logs_source').on(table.source),
    index('idx_webhook_logs_event_id').on(table.eventId),
    index('idx_webhook_logs_status').on(table.status),
    index('idx_webhook_logs_attempts').on(table.attempts),
  ]
);

export type WebhookLog = typeof webhookLogs.$inferSelect;
export type NewWebhookLog = typeof webhookLogs.$inferInsert;

// ============================================================================
// PHASE 3 SCHEMA - Pre-Account Results Preservation
// ============================================================================

/**
 * Preserved Sessions table (Phase 3)
 *
 * Stores PB1 diagnostic session data for users who want to save their results
 * before creating an account. Links sent via email are valid for 7 days.
 *
 * Covers: Story 15.8, FR70 (Pre-account results preservation)
 */
export const preservedSessions = pgTable(
  'preserved_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull(),
    token: varchar('token', { length: 255 }).notNull().unique(),
    sessionData: jsonb('session_data').notNull().$type<PreservedSessionData>(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    usedAt: timestamp('used_at'),
  },
  (table) => [
    index('idx_preserved_sessions_token').on(table.token),
    index('idx_preserved_sessions_email').on(table.email),
  ]
);

export type PreservedSession = typeof preservedSessions.$inferSelect;
export type NewPreservedSession = typeof preservedSessions.$inferInsert;

/**
 * Type for preserved session data stored in JSONB
 * Contains the complete diagnostic session from all 7 tools
 */
export interface PreservedSessionData {
  // Tool data from existing session stores
  tool1?: DiagnosticSessionData['tool1'];
  tool2?: DiagnosticSessionData['tool2'];
  tool3?: DiagnosticSessionData['tool3'];
  tool4?: DiagnosticSessionData['tool4'];
  tool5?: DiagnosticSessionData['tool5'];
  tool6?: DiagnosticSessionData['tool6'];
  tool7?: DiagnosticSessionData['tool7'];
  // Session metadata
  lastToolCompleted?: number;
  preservedAt: string; // ISO timestamp
}

// ============================================================================
// PHASE 3 SCHEMA - Analytics Events
// ============================================================================

/**
 * Analytics Events table (Phase 3)
 *
 * Stores analytics events for purchase funnel tracking and conversion analysis.
 * Server-side backup for critical events with privacy-first design.
 *
 * Story 17.8: Purchase Analytics Events
 * Task 7: Create analytics database schema (AC: 6)
 * Covers: FR54 (Purchase analytics events)
 */
export const analyticsEvents = pgTable(
  'analytics_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventName: varchar('event_name', { length: 100 }).notNull(),
    eventData: jsonb('event_data').notNull().$type<Record<string, unknown>>(),
    userId: varchar('user_id', { length: 100 }), // Hashed user ID
    sessionId: varchar('session_id', { length: 100 }),
    timestamp: timestamp('timestamp').defaultNow().notNull(),
    userAgent: text('user_agent'),
    ipHash: varchar('ip_hash', { length: 50 }), // Hashed IP for privacy
  },
  (table) => [
    index('idx_analytics_events_event_name').on(table.eventName),
    index('idx_analytics_events_timestamp').on(table.timestamp),
    index('idx_analytics_events_user_id').on(table.userId),
    index('idx_analytics_events_session_id').on(table.sessionId),
  ]
);

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type NewAnalyticsEvent = typeof analyticsEvents.$inferInsert;

// ============================================================================
// PHASE 3 SCHEMA - Toolkit Document Generation (Epic 18)
// ============================================================================

/**
 * Document status enum for toolkit documents
 *
 * Covers: Story 18.1, FR71 (Background job processing)
 */
export const documentStatusEnum = pgEnum('document_status', [
  'pending',
  'generating',
  'completed',
  'failed',
]);

/**
 * Document type enum for toolkit documents
 *
 * Covers: Story 18.1, FR49 (Document generation)
 */
export const documentTypeEnum = pgEnum('document_type', [
  'word',
  'excel',
  'pptx',
  'pdf',
]);

/**
 * Toolkit Documents table (Phase 3 - Epic 18)
 *
 * Tracks individual document generation status for purchased toolkits.
 * Each purchase generates 10 documents (5 Word, 3 Excel, 1 PPT, 1 PDF).
 *
 * Covers: Story 18.1, FR71 (Background job processing), FR74 (Individual retry)
 */
export const toolkitDocuments = pgTable(
  'toolkit_documents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    purchaseId: uuid('purchase_id')
      .notNull()
      .references(() => purchases.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    documentType: documentTypeEnum('document_type').notNull(),
    documentName: varchar('document_name', { length: 255 }).notNull(),
    status: documentStatusEnum('status').default('pending').notNull(),
    fileUrl: varchar('file_url', { length: 1000 }), // S3 presigned URL (temporary)
    s3Key: varchar('s3_key', { length: 500 }), // Permanent S3 reference
    fileSizeBytes: integer('file_size_bytes'),
    errorMessage: text('error_message'),
    attempts: integer('attempts').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    generatedAt: timestamp('generated_at'),
  },
  (table) => [
    index('idx_toolkit_documents_purchase_id').on(table.purchaseId),
    index('idx_toolkit_documents_user_id').on(table.userId),
    index('idx_toolkit_documents_status').on(table.status),
  ]
);

export type ToolkitDocument = typeof toolkitDocuments.$inferSelect;
export type NewToolkitDocument = typeof toolkitDocuments.$inferInsert;

// ============================================================================
// PHASE 3 SCHEMA - Email Communications (Epic 20)
// ============================================================================

/**
 * Email Preferences table (Phase 3 - Epic 20)
 *
 * Stores user email preferences and unsubscribe status.
 * Supports GDPR-compliant unsubscribe mechanism with secure tokens.
 *
 * Covers: Story 20.1, NFR30 (GDPR compliance)
 */
export const emailPreferences = pgTable(
  'email_preferences',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }), // Optional - can track by email alone
    unsubscribeToken: varchar('unsubscribe_token', { length: 255 }).notNull().unique(),
    marketingOptOut: boolean('marketing_opt_out').default(false).notNull(),
    nurturOptOut: boolean('nurture_opt_out').default(false).notNull(),
    transactionalOnly: boolean('transactional_only').default(false).notNull(), // Only allow transactional emails
    unsubscribedAt: timestamp('unsubscribed_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_email_preferences_email').on(table.email),
    index('idx_email_preferences_user_id').on(table.userId),
    index('idx_email_preferences_unsubscribe_token').on(table.unsubscribeToken),
  ]
);

export type EmailPreference = typeof emailPreferences.$inferSelect;
export type NewEmailPreference = typeof emailPreferences.$inferInsert;

/**
 * Nurture Sequence Emails table (Phase 3 - Epic 20)
 *
 * Tracks individual nurture emails sent to users.
 * Used for delivery tracking and analytics.
 *
 * Covers: Story 20.3, Story 20.4, FR52 (Nurture sequence)
 */
export const nurtureEmails = pgTable(
  'nurture_emails',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sequenceId: uuid('sequence_id')
      .notNull()
      .references(() => emailSequences.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    emailDay: integer('email_day').notNull(), // 0, 3, 7, 10, 14
    subject: varchar('subject', { length: 255 }).notNull(),
    sentAt: timestamp('sent_at'),
    deliveredAt: timestamp('delivered_at'),
    openedAt: timestamp('opened_at'),
    clickedAt: timestamp('clicked_at'),
    status: varchar('status', { length: 20 }).default('pending').notNull(), // pending, sent, delivered, opened, clicked, bounced, failed
    resendMessageId: varchar('resend_message_id', { length: 255 }), // Resend tracking ID
    errorMessage: text('error_message'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_nurture_emails_sequence_id').on(table.sequenceId),
    index('idx_nurture_emails_user_id').on(table.userId),
    index('idx_nurture_emails_status').on(table.status),
  ]
);

export type NurtureEmail = typeof nurtureEmails.$inferSelect;
export type NewNurtureEmail = typeof nurtureEmails.$inferInsert;

// ============================================================================
// PHASE 3 SCHEMA - Admin & Operations (Epic 21)
// ============================================================================

/**
 * Admin role enum for admin users
 *
 * Covers: Story 21.1, FR75 (Admin authentication)
 */
export const adminRoleEnum = pgEnum('admin_role', ['admin', 'super_admin']);

/**
 * Admin Users table (Phase 3 - Epic 21)
 *
 * Separate authentication system for admin users.
 * Admin accounts are invite-only with no self-registration.
 *
 * Covers: Story 21.1 AC2 (Separate admin auth), FR75 (Admin operations)
 */
export const adminUsers = pgTable(
  'admin_users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    name: varchar('name', { length: 255 }),
    role: adminRoleEnum('role').default('admin').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    lastLoginAt: timestamp('last_login_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [index('idx_admin_users_email').on(table.email)]
);

export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;

/**
 * Admin Audit Logs table (Phase 3 - Epic 21)
 *
 * Tracks all admin actions for compliance and security.
 *
 * Covers: Story 21.1 AC5 (Audit logging), FR75 (Admin operations)
 */
export const adminAuditLogs = pgTable(
  'admin_audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    adminId: uuid('admin_id')
      .notNull()
      .references(() => adminUsers.id, { onDelete: 'cascade' }),
    action: varchar('action', { length: 100 }).notNull(), // login, logout, invoice_update, refund_process, etc.
    entityType: varchar('entity_type', { length: 50 }), // invoice_request, purchase, webhook, user, etc.
    entityId: varchar('entity_id', { length: 255 }),
    details: jsonb('details').$type<Record<string, unknown>>(),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_admin_audit_logs_admin_id').on(table.adminId),
    index('idx_admin_audit_logs_action').on(table.action),
    index('idx_admin_audit_logs_entity_type').on(table.entityType),
    index('idx_admin_audit_logs_created_at').on(table.createdAt),
  ]
);

export type AdminAuditLog = typeof adminAuditLogs.$inferSelect;
export type NewAdminAuditLog = typeof adminAuditLogs.$inferInsert;

/**
 * Refunds table (Phase 3 - Epic 21)
 *
 * Tracks refunds processed through the admin interface.
 *
 * Covers: Story 21.3 AC4 (Refund logging), NFR27 (<5% refund rate target)
 */
export const refunds = pgTable(
  'refunds',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    purchaseId: uuid('purchase_id')
      .notNull()
      .references(() => purchases.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    processedBy: uuid('processed_by').references(() => adminUsers.id),
    amount: integer('amount').notNull(), // cents
    stripeRefundId: varchar('stripe_refund_id', { length: 255 }),
    status: varchar('status', { length: 20 }).notNull(), // initiated, completed, failed
    reason: text('reason'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    completedAt: timestamp('completed_at'),
  },
  (table) => [
    index('idx_refunds_purchase_id').on(table.purchaseId),
    index('idx_refunds_user_id').on(table.userId),
    index('idx_refunds_status').on(table.status),
    index('idx_refunds_created_at').on(table.createdAt),
  ]
);

export type Refund = typeof refunds.$inferSelect;
export type NewRefund = typeof refunds.$inferInsert;

// ============================================================================
// PHASE 3 SCHEMA - Registration Abandonment Recovery (Story 15.9)
// ============================================================================

/**
 * Abandoned Registrations table (Phase 3 - Story 15.9)
 *
 * Tracks users who start registration (enter email) but don't complete it.
 * Used to trigger recovery emails after 1 hour of inactivity.
 *
 * Covers: Story 15.9 Task 1, FR67 (Registration abandonment recovery)
 */
export const abandonedRegistrations = pgTable(
  'abandoned_registrations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    token: varchar('token', { length: 255 }).notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    completedAt: timestamp('completed_at'),
    emailSentAt: timestamp('email_sent_at'),
  },
  (table) => [
    index('idx_abandoned_registrations_email').on(table.email),
    index('idx_abandoned_registrations_token').on(table.token),
  ]
);

export type AbandonedRegistration = typeof abandonedRegistrations.$inferSelect;
export type NewAbandonedRegistration = typeof abandonedRegistrations.$inferInsert;
