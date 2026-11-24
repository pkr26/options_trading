CREATE TABLE `attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`module_id` integer NOT NULL,
	`variant` integer NOT NULL,
	`score` integer NOT NULL,
	`total` integer NOT NULL,
	`passed` integer NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `notes` (
	`user_id` text NOT NULL,
	`lesson_id` integer NOT NULL,
	`content` text NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`user_id`, `lesson_id`)
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`daily_minutes` integer DEFAULT 15 NOT NULL,
	`timezone` text DEFAULT 'America/Phoenix' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `progress` (
	`user_id` text NOT NULL,
	`lesson_id` integer NOT NULL,
	`completed_at` text NOT NULL,
	`next_review_at` text NOT NULL,
	`review_count` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`user_id`, `lesson_id`)
);
