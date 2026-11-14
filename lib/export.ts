import type { Attempt, Note, Progress } from "./types";

export type LearningExport = {
  formatVersion: number;
  courseVersion: string;
  exportedAt: string;
  profile: { dailyMinutes: number; timezone: string }[];
  progress: Progress[];
  notes: Note[];
  attempts: Attempt[];
};

/** Quote every field and neutralize formula prefixes in spreadsheet applications. */
export function csvCell(value: unknown): string {
  let text = value == null ? "" : String(value);
  if (/^[\s\u0000-\u001f\uFEFF]*[=+\-@]/u.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text;
  return `"${text.replaceAll('"', '""')}"`;
}

export function exportLearningCsv(data: LearningExport): string {
  const headers = ["record_type", "id", "lesson_id", "module_id", "content", "completed_at", "next_review_at", "review_count", "variant", "score", "total", "passed", "created_at", "daily_minutes", "timezone", "course_version", "exported_at"];
  const rows: Record<string, unknown>[] = [
    { record_type: "metadata", course_version: data.courseVersion, exported_at: data.exportedAt },
    ...data.profile.map(row => ({ record_type: "profile", daily_minutes: row.dailyMinutes, timezone: row.timezone })),
    ...data.progress.map(row => ({ record_type: "progress", lesson_id: row.lessonId, completed_at: row.completedAt, next_review_at: row.nextReviewAt, review_count: row.reviewCount })),
    ...data.notes.map(row => ({ record_type: "note", lesson_id: row.lessonId, content: row.content, created_at: row.updatedAt })),
    ...data.attempts.map(row => ({ record_type: "attempt", id: row.id, module_id: row.moduleId, variant: row.variant, score: row.score, total: row.total, passed: row.passed, created_at: row.createdAt })),
  ];
  return [headers.map(csvCell).join(","), ...rows.map(row => headers.map(header => csvCell(row[header])).join(","))].join("\r\n") + "\r\n";
}
