DROP INDEX "users_email_unique";--> statement-breakpoint
ALTER TABLE `expenses` ALTER COLUMN "currency" TO "currency" text NOT NULL DEFAULT 'ZAR';--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);