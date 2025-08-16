DROP INDEX "users_email_unique";--> statement-breakpoint
ALTER TABLE `expense_items` ALTER COLUMN "description" TO "description" text;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
ALTER TABLE `expense_items` ADD `name` text NOT NULL;--> statement-breakpoint
ALTER TABLE `expenses` ALTER COLUMN "description" TO "description" text;--> statement-breakpoint
ALTER TABLE `expenses` ADD `name` text NOT NULL;--> statement-breakpoint
ALTER TABLE `expenses` DROP COLUMN `date`;