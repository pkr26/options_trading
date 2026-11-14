CREATE TABLE `teaching_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`kind` text NOT NULL,
	`entity_id` text NOT NULL,
	`revision` integer NOT NULL,
	`payload` text NOT NULL,
	`version` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `teaching_events_owner_kind_entity_revision` ON `teaching_events` (`user_id`,`kind`,`entity_id`,`revision`);