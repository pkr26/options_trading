import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";

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
});
