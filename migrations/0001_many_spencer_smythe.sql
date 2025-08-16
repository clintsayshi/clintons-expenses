ALTER TABLE `expenses_table` RENAME TO `expenses`;--> statement-breakpoint
ALTER TABLE `users_table` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_expenses` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`amount` real NOT NULL,
	`description` text NOT NULL,
	`category` text,
	`payment_method` text,
	`notes` text,
	`currency` text DEFAULT 'ZAR',
	`date` integer,
	`createdAt` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_expenses`("id", "user_id", "amount", "description", "category", "payment_method", "notes", "currency", "date", "createdAt", "updatedAt") SELECT "id", "user_id", "amount", "description", "category", "payment_method", "notes", "currency", "date", "createdAt", "updatedAt" FROM `expenses`;--> statement-breakpoint
DROP TABLE `expenses`;--> statement-breakpoint
ALTER TABLE `__new_expenses` RENAME TO `expenses`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
DROP INDEX `users_table_email_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `__new_expense_items` (
	`id` text PRIMARY KEY NOT NULL,
	`expense_id` text NOT NULL,
	`description` text NOT NULL,
	`amount` real NOT NULL,
	`createdAt` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`expense_id`) REFERENCES `expenses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_expense_items`("id", "expense_id", "description", "amount", "createdAt", "updatedAt") SELECT "id", "expense_id", "description", "amount", "createdAt", "updatedAt" FROM `expense_items`;--> statement-breakpoint
DROP TABLE `expense_items`;--> statement-breakpoint
ALTER TABLE `__new_expense_items` RENAME TO `expense_items`;