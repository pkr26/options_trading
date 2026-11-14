import { sqliteTable, text, integer, primaryKey, uniqueIndex } from "drizzle-orm/sqlite-core";
import type { GradedQuestion } from "../lib/types";
import type { GraduateAnswer, GraduateModule, GraduatePracticeFeedback } from "../lib/graduate-types";

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

export const graduateSubmissions = sqliteTable("graduate_submissions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  moduleId: integer("module_id").notNull(),
  revision: integer("revision").notNull(),
  kind: text("kind").$type<"draft" | "submission">().notNull(),
  answers: text("answers", { mode: "json" }).$type<GraduateAnswer>().notNull(),
  contentVersion: text("content_version").notNull(),
  contentSnapshot: text("content_snapshot", { mode: "json" }).$type<GraduateModule>().notNull(),
  createdAt: text("created_at").notNull(),
}, t => [uniqueIndex("graduate_submissions_owner_module_revision").on(t.userId, t.moduleId, t.revision)]);

export const graduatePractice = sqliteTable("graduate_practice", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  moduleId: integer("module_id").notNull(),
  sequence: integer("sequence").notNull(),
  score: integer("score").notNull(),
  total: integer("total").notNull(),
  feedback: text("feedback", { mode: "json" }).$type<GraduatePracticeFeedback[]>().notNull(),
  contentVersion: text("content_version").notNull(),
  questionVersion: text("question_version").notNull(),
  createdAt: text("created_at").notNull(),
}, t => [uniqueIndex("graduate_practice_owner_module_sequence").on(t.userId, t.moduleId, t.sequence)]);
