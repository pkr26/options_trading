ALTER TABLE `attempts` ADD `sequence` integer;--> statement-breakpoint
ALTER TABLE `attempts` ADD `answers` text;--> statement-breakpoint
ALTER TABLE `attempts` ADD `feedback` text;--> statement-breakpoint
ALTER TABLE `attempts` ADD `course_version` text;--> statement-breakpoint
ALTER TABLE `attempts` ADD `question_version` text;--> statement-breakpoint
CREATE UNIQUE INDEX `attempts_user_module_sequence` ON `attempts` (`user_id`,`module_id`,`sequence`);--> statement-breakpoint
ALTER TABLE `progress` ADD `review_revision` integer DEFAULT 0 NOT NULL;