CREATE TABLE `claims` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer NOT NULL,
	`category` text NOT NULL,
	`details` text NOT NULL,
	`remedy` text NOT NULL,
	`status` text DEFAULT 'Evidence review' NOT NULL,
	`due_date` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `receipts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer NOT NULL,
	`receipt_code` text NOT NULL,
	`batch_code` text NOT NULL,
	`crates` integer NOT NULL,
	`eggs` integer NOT NULL,
	`officer` text NOT NULL,
	`collected_at` text NOT NULL,
	`buyer_confirmed` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `receipts_receipt_code_unique` ON `receipts` (`receipt_code`);