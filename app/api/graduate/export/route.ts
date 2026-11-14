import { desc, eq } from "drizzle-orm";
import { failure, identity, withoutUserId } from "@/lib/api";
import { graduatePractice, graduateSubmissions } from "@/db/schema";
import { GRADUATE_VERSION } from "@/lib/graduate";

export async function GET() {
  try {
    const {user, db} = await identity();
    const [submissions, practice] = await Promise.all([
      db.select().from(graduateSubmissions).where(eq(graduateSubmissions.userId, user.userId)).orderBy(desc(graduateSubmissions.createdAt)),
      db.select().from(graduatePractice).where(eq(graduatePractice.userId, user.userId)).orderBy(desc(graduatePractice.createdAt)),
    ]);
    const data = {formatVersion: 1, courseVersion: GRADUATE_VERSION, exportedAt: new Date().toISOString(),
      submissions: submissions.map(withoutUserId), practice: practice.map(withoutUserId)};
    return new Response(JSON.stringify(data, null, 2), {headers: {
      "Content-Type": "application/json; charset=utf-8", "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff", "Content-Disposition": 'attachment; filename="options-academy-advanced-evidence.json"',
    }});
  } catch (error) { return failure(error); }
}
