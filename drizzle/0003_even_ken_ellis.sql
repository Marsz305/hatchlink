ALTER TABLE `accounts` ADD `dedupe_key` text;--> statement-breakpoint
CREATE UNIQUE INDEX `accounts_dedupe_key_unique` ON `accounts` (`dedupe_key`);