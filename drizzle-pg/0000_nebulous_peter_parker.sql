CREATE TABLE "accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text,
	"full_name" text NOT NULL,
	"phone" text NOT NULL,
	"ecocash" text NOT NULL,
	"district" text NOT NULL,
	"role" text NOT NULL,
	"dedupe_key" text,
	"status" text DEFAULT 'Pending approval' NOT NULL,
	"terms_accepted" boolean DEFAULT false NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL,
	CONSTRAINT "accounts_dedupe_key_unique" UNIQUE("dedupe_key")
);
--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"role" text DEFAULT 'Administrator' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"appointed_by" text NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL,
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "claims" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"category" text NOT NULL,
	"details" text NOT NULL,
	"remedy" text NOT NULL,
	"status" text DEFAULT 'Evidence review' NOT NULL,
	"due_date" text NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demand_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"buyer_email" text NOT NULL,
	"breed" text NOT NULL,
	"crates" integer NOT NULL,
	"needed_by" text NOT NULL,
	"preferred_district" text,
	"notes" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'Submitted' NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inspections" (
	"id" serial PRIMARY KEY NOT NULL,
	"listing_id" integer NOT NULL,
	"accepted_eggs" integer NOT NULL,
	"rejected_eggs" integer NOT NULL,
	"condition" text NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"status" text NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listings" (
	"id" serial PRIMARY KEY NOT NULL,
	"batch_code" text NOT NULL,
	"seller_email" text,
	"breed" text NOT NULL,
	"district" text NOT NULL,
	"crates" integer NOT NULL,
	"price" real NOT NULL,
	"oldest_egg" text NOT NULL,
	"newest_egg" text NOT NULL,
	"fertility" integer,
	"purity" text NOT NULL,
	"storage_method" text,
	"storage_temperature" text,
	"eggs_turned" boolean,
	"flock_age" text,
	"male_female_ratio" text,
	"vaccination_status" text,
	"packaging_method" text,
	"proposed_delivery_date" text,
	"status" text DEFAULT 'Under review' NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL,
	CONSTRAINT "listings_batch_code_unique" UNIQUE("batch_code")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"audience" text DEFAULT 'admin' NOT NULL,
	"read_at" text,
	"created_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_code" text NOT NULL,
	"buyer_email" text,
	"listing_id" integer NOT NULL,
	"breed" text NOT NULL,
	"crates" integer NOT NULL,
	"total" real NOT NULL,
	"status" text DEFAULT 'Awaiting EcoCash' NOT NULL,
	"collection_date" text,
	"settlement_date" text,
	"created_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL,
	CONSTRAINT "orders_order_code_unique" UNIQUE("order_code")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"reference" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"status" text DEFAULT 'Awaiting verification' NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL,
	CONSTRAINT "payments_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "receipts" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"receipt_code" text NOT NULL,
	"batch_code" text NOT NULL,
	"crates" integer NOT NULL,
	"eggs" integer NOT NULL,
	"officer" text NOT NULL,
	"collection_code" text,
	"transport_method" text,
	"collected_at" text NOT NULL,
	"buyer_confirmed" boolean DEFAULT true NOT NULL,
	CONSTRAINT "receipts_receipt_code_unique" UNIQUE("receipt_code")
);
--> statement-breakpoint
CREATE TABLE "support_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"participant_email" text NOT NULL,
	"participant_role" text NOT NULL,
	"sender_role" text NOT NULL,
	"sender_name" text NOT NULL,
	"body" text NOT NULL,
	"read_at" text,
	"created_at" text DEFAULT CURRENT_TIMESTAMP::text NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_demand_requests_buyer" ON "demand_requests" USING btree ("buyer_email");--> statement-breakpoint
CREATE INDEX "idx_support_messages_participant" ON "support_messages" USING btree ("participant_email","participant_role");