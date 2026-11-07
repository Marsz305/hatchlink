CREATE TABLE `listings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`batch_code` text NOT NULL,
	`breed` text NOT NULL,
	`district` text NOT NULL,
	`crates` integer NOT NULL,
	`price` real NOT NULL,
	`oldest_egg` text NOT NULL,
	`newest_egg` text NOT NULL,
	`fertility` integer,
	`purity` text NOT NULL,
	`status` text DEFAULT 'Under review' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `listings_batch_code_unique` ON `listings` (`batch_code`);--> statement-breakpoint
CREATE TABLE `orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_code` text NOT NULL,
	`listing_id` integer NOT NULL,
	`breed` text NOT NULL,
	`crates` integer NOT NULL,
	`total` real NOT NULL,
	`status` text DEFAULT 'Awaiting EcoCash' NOT NULL,
	`collection_date` text,
	`settlement_date` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_order_code_unique` ON `orders` (`order_code`);