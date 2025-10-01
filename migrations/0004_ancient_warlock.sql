PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_expenses` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`amount` real NOT NULL,
	`description` text,
	`category` text,
	`payment_method` text,
	`notes` text,
	`currency` text DEFAULT 'ZAR' NOT NULL,
	`createdAt` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_expenses`("id", "user_id", "name", "amount", "description", "category", "payment_method", "notes", "currency", "createdAt", "updatedAt") SELECT "id", "user_id", "name", "amount", "description", "category", "payment_method", "notes", "currency", "createdAt", "updatedAt" FROM `expenses`;--> statement-breakpoint
DROP TABLE `expenses`;--> statement-breakpoint
ALTER TABLE `__new_expenses` RENAME TO `expenses`;--> statement-breakpoint
PRAGMA foreign_keys=ON;