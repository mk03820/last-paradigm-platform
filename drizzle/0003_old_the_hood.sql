CREATE TABLE "preserved_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"session_data" jsonb NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"used_at" timestamp,
	CONSTRAINT "preserved_sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE INDEX "idx_preserved_sessions_token" ON "preserved_sessions" USING btree ("token");--> statement-breakpoint
CREATE INDEX "idx_preserved_sessions_email" ON "preserved_sessions" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_magic_links_email" ON "magic_links" USING btree ("email");