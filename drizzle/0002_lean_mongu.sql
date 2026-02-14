CREATE TABLE "diagnostic_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"tool_results" jsonb NOT NULL,
	"total_alignment_tax" numeric(12, 2),
	"estimated_savings" numeric(12, 2),
	"completed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "email_sequences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"sequence_type" varchar(50) NOT NULL,
	"current_step" integer DEFAULT 0 NOT NULL,
	"total_steps" integer NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"last_sent_at" timestamp,
	"next_send_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "generated_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_type" varchar(20) NOT NULL,
	"s3_key" varchar(500) NOT NULL,
	"file_size_bytes" integer,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now(),
	"generated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "invoice_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"company_name" varchar(255) NOT NULL,
	"billing_address" text NOT NULL,
	"po_number" varchar(100),
	"contact_email" varchar(255),
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"admin_notes" text,
	"created_at" timestamp DEFAULT now(),
	"processed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "magic_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "magic_links_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "password_resets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "password_resets_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "purchases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"stripe_session_id" varchar(255) NOT NULL,
	"stripe_payment_intent_id" varchar(255),
	"amount" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'usd' NOT NULL,
	"status" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "webhook_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" varchar(50) NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"event_id" varchar(255),
	"payload" jsonb NOT NULL,
	"status" varchar(20) NOT NULL,
	"attempts" integer DEFAULT 1 NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now(),
	"processed_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_hash" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "purchase_status" varchar(20) DEFAULT 'none';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "purchased_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "stripe_customer_id" varchar(255);--> statement-breakpoint
ALTER TABLE "diagnostic_results" ADD CONSTRAINT "diagnostic_results_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_sequences" ADD CONSTRAINT "email_sequences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_documents" ADD CONSTRAINT "generated_documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_requests" ADD CONSTRAINT "invoice_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_diagnostic_results_user_id" ON "diagnostic_results" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_email_sequences_user_id" ON "email_sequences" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_email_sequences_status" ON "email_sequences" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_generated_documents_user_id" ON "generated_documents" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_invoice_requests_user_id" ON "invoice_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_magic_links_token" ON "magic_links" USING btree ("token");--> statement-breakpoint
CREATE INDEX "idx_password_resets_token" ON "password_resets" USING btree ("token");--> statement-breakpoint
CREATE INDEX "idx_purchases_user_id" ON "purchases" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_purchases_stripe_session_id" ON "purchases" USING btree ("stripe_session_id");--> statement-breakpoint
CREATE INDEX "idx_webhook_logs_source" ON "webhook_logs" USING btree ("source");--> statement-breakpoint
CREATE INDEX "idx_webhook_logs_event_id" ON "webhook_logs" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "idx_webhook_logs_status" ON "webhook_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_magic_links_email" ON "magic_links" USING btree ("email");