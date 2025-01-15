PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`email_verified` integer DEFAULT 0 NOT NULL,
	`recovery_code` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "email", "username", "password_hash", "email_verified", "recovery_code") SELECT "id", "email", "username", "password_hash", "email_verified", "recovery_code" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `email_index` ON `users` (`email`);