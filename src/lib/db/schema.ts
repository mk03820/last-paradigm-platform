import {
  pgTable,
  serial,
  varchar,
  timestamp,
  text,
  primaryKey,
  integer,
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
