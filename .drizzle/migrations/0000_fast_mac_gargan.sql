CREATE TABLE `customers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`image_url` text
);
--> statement-breakpoint
CREATE TABLE `email_verification_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`email` text NOT NULL,
	`code` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`customer_id` text NOT NULL,
	`amount` integer NOT NULL,
	`status` text NOT NULL,
	`date` text NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `passkeys` (
	`id` blob PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`name` text NOT NULL,
	`algorithm` integer NOT NULL,
	`public_key` blob NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `password_reset_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`email` text NOT NULL,
	`code` text NOT NULL,
	`expires_at` integer NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`two_factor_verified` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `revenues` (
	`month` text NOT NULL,
	`revenue` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `security_keys` (
	`id` blob PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`name` text NOT NULL,
	`algorithm` integer NOT NULL,
	`public_key` blob NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`two_factor_verified` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `totps` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`key` blob NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `totps_user_id_unique` ON `totps` (`user_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`recovery_code` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `email_index` ON `users` (`email`);