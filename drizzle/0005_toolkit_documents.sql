-- Story 18.1: Document Generation Job Infrastructure
-- Creates toolkit_documents table for tracking document generation status
-- Covers: FR71 (Background job processing), FR74 (Individual retry)

-- Create document status enum
DO $$ BEGIN
    CREATE TYPE "document_status" AS ENUM('pending', 'generating', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create document type enum
DO $$ BEGIN
    CREATE TYPE "document_type" AS ENUM('word', 'excel', 'pptx', 'pdf');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create toolkit_documents table
CREATE TABLE IF NOT EXISTS "toolkit_documents" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "purchase_id" uuid NOT NULL REFERENCES "purchases"("id") ON DELETE CASCADE,
    "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "document_type" "document_type" NOT NULL,
    "document_name" varchar(255) NOT NULL,
    "status" "document_status" DEFAULT 'pending' NOT NULL,
    "file_url" varchar(1000),
    "s3_key" varchar(500),
    "file_size_bytes" integer,
    "error_message" text,
    "attempts" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "generated_at" timestamp
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS "idx_toolkit_documents_purchase_id" ON "toolkit_documents" ("purchase_id");
CREATE INDEX IF NOT EXISTS "idx_toolkit_documents_user_id" ON "toolkit_documents" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_toolkit_documents_status" ON "toolkit_documents" ("status");
