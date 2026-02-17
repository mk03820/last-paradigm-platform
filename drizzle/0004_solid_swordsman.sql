CREATE TABLE "analytics_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_name" varchar(100) NOT NULL,
	"event_data" jsonb NOT NULL,
	"user_id" varchar(100),
	"session_id" varchar(100),
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"user_agent" text,
	"ip_hash" varchar(50)
);
--> statement-breakpoint
ALTER TABLE "purchases" ADD COLUMN "stripe_customer_id" varchar(255);--> statement-breakpoint
ALTER TABLE "purchases" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "has_pb2_access" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "pb2_purchased_at" timestamp;--> statement-breakpoint
CREATE INDEX "idx_analytics_events_event_name" ON "analytics_events" USING btree ("event_name");--> statement-breakpoint
CREATE INDEX "idx_analytics_events_timestamp" ON "analytics_events" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "idx_analytics_events_user_id" ON "analytics_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_analytics_events_session_id" ON "analytics_events" USING btree ("session_id");--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_stripe_session_id_unique" UNIQUE("stripe_session_id");