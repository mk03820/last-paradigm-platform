import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core';

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
