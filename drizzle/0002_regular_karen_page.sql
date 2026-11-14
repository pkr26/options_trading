CREATE TABLE `graduate_practice` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`module_id` integer NOT NULL,
	`sequence` integer NOT NULL,
	`score` integer NOT NULL,
	`total` integer NOT NULL,
	`feedback` text NOT NULL,
	`content_version` text NOT NULL,
	`question_version` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `graduate_practice_owner_module_sequence` ON `graduate_practice` (`user_id`,`module_id`,`sequence`);--> statement-breakpoint
CREATE TABLE `graduate_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`module_id` integer NOT NULL,
	`revision` integer NOT NULL,
	`kind` text NOT NULL,
	`answers` text NOT NULL,
	`content_version` text NOT NULL,
	`content_snapshot` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `graduate_submissions_owner_module_revision` ON `graduate_submissions` (`user_id`,`module_id`,`revision`);