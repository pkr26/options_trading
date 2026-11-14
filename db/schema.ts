import { sqliteTable, text, integer, primaryKey, uniqueIndex } from "drizzle-orm/sqlite-core";
import type { GradedQuestion } from "../lib/types";

export const profiles = sqliteTable("profiles", {
  userId: text("user_id").primaryKey(),
  dailyMinutes: integer("daily_minutes").notNull().default(15),
  timezone: text("timezone").notNull().default("America/Phoenix"),
});
export const progress = sqliteTable("progress", {
  userId: text("user_id").notNull(),
  lessonId: integer("lesson_id").notNull(),
  completedAt: text("completed_at").notNull(),
  nextReviewAt: text("next_review_at").notNull(),
  reviewCount: integer("review_count").notNull().default(0),
  reviewRevision: integer("review_revision").notNull().default(0),
}, t => [primaryKey({ columns: [t.userId, t.lessonId] })]);
export const notes = sqliteTable("notes", {
  userId: text("user_id").notNull(),
  lessonId: integer("lesson_id").notNull(),
  content: text("content").notNull(),
  updatedAt: text("updated_at").notNull(),
}, t => [primaryKey({ columns: [t.userId, t.lessonId] })]);
export const attempts = sqliteTable("attempts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  moduleId: integer("module_id").notNull(),
  variant: integer("variant").notNull(),
  score: integer("score").notNull(),
  total: integer("total").notNull(),
  passed: integer("passed", { mode: "boolean" }).notNull(),
  createdAt: text("created_at").notNull(),
  // Legacy rows keep NULL sequence and evidence; no historical answers invented.
  sequence: integer("sequence"),
  answers: text("answers", { mode: "json" }).$type<Record<string, number>>(),
  feedback: text("feedback", { mode: "json" }).$type<GradedQuestion[]>(),
  courseVersion: text("course_version"),
  questionVersion: text("question_version"),
}, t => [uniqueIndex("attempts_user_module_sequence").on(t.userId, t.moduleId, t.sequence)]);
