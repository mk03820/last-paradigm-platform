-- Story 15.9: Registration Abandonment Recovery
-- Creates abandoned_registrations table for tracking users who start but don't complete registration
-- Covers: FR67 (Registration abandonment recovery)

CREATE TABLE IF NOT EXISTS "abandoned_registrations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" varchar(255) NOT NULL,
  "token" varchar(255) NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "completed_at" timestamp,
  "email_sent_at" timestamp,
  CONSTRAINT "abandoned_registrations_email_unique" UNIQUE("email"),
  CONSTRAINT "abandoned_registrations_token_unique" UNIQUE("token")
);

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS "idx_abandoned_registrations_email" ON "abandoned_registrations" ("email");
CREATE INDEX IF NOT EXISTS "idx_abandoned_registrations_token" ON "abandoned_registrations" ("token");
