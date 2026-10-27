CREATE TABLE `demand_requests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`buyer_email` text NOT NULL,
	`breed` text NOT NULL,
	`crates` integer NOT NULL,
	`needed_by` text NOT NULL,
	`preferred_district` text,
	`notes` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'Submitted' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_demand_requests_buyer` ON `demand_requests` (`buyer_email`);--> statement-breakpoint
ALTER TABLE `listings` ADD `storage_method` text;--> statement-breakpoint
ALTER TABLE `listings` ADD `storage_temperature` text;--> statement-breakpoint
ALTER TABLE `listings` ADD `eggs_turned` integer;--> statement-breakpoint
ALTER TABLE `listings` ADD `flock_age` text;--> statement-breakpoint
ALTER TABLE `listings` ADD `male_female_ratio` text;--> statement-breakpoint
ALTER TABLE `listings` ADD `vaccination_status` text;--> statement-breakpoint
ALTER TABLE `listings` ADD `packaging_method` text;--> statement-breakpoint
ALTER TABLE `listings` ADD `proposed_delivery_date` text;--> statement-breakpoint
ALTER TABLE `receipts` ADD `collection_code` text;--> statement-breakpoint
ALTER TABLE `receipts` ADD `transport_method` text;