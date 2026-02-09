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
} from 'drizzle-orm/pg-core';
import type { AdapterAccountType } from 'next-auth/adapters';

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

/**
 * NextAuth.js User table
 *
 * Stores user accounts created via magic link authentication.
 * Covers: FR2-1, FR2-2 (Magic link account creation and sign in)
 */
export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

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
 * Diagnostic Sessions table
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
