CREATE TABLE `support_messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`participant_email` text NOT NULL,
	`participant_role` text NOT NULL,
	`sender_role` text NOT NULL,
	`sender_name` text NOT NULL,
	`body` text NOT NULL,
	`read_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
