import { and, desc, eq } from "drizzle-orm";
import { ApiError, failure, identity, json, readJsonBody, withoutUserId } from "@/lib/api";
import { graduatePractice, graduateSubmissions } from "@/db/schema";
import { graduateModule, GRADUATE_VERSION } from "@/lib/graduate";
import { graduateSubmissionInput } from "@/lib/graduate-validation";
import { MEMO_BODY_BYTES } from "@/lib/memo-limits";

export async function GET() {
  try {
    const {user, db} = await identity();
    const [submissions, practice] = await Promise.all([
      db.select().from(graduateSubmissions).where(eq(graduateSubmissions.userId, user.userId)).orderBy(desc(graduateSubmissions.createdAt), desc(graduateSubmissions.revision)),
      db.select().from(graduatePractice).where(eq(graduatePractice.userId, user.userId)).orderBy(desc(graduatePractice.createdAt), desc(graduatePractice.sequence)),
    ]);
    return json({submissions: submissions.map(withoutUserId), practice: practice.map(withoutUserId)});
  } catch (error) { return failure(error); }
}

export async function PUT(request: Request) {
  try {
    const {user, db} = await identity(request, MEMO_BODY_BYTES);
    const input = graduateSubmissionInput.parse(await readJsonBody(request, MEMO_BODY_BYTES));
    const teachingModule = graduateModule(input.moduleId);
    if (!teachingModule) throw new ApiError("Choose an available advanced module.");
    const ownerModule = and(eq(graduateSubmissions.userId, user.userId), eq(graduateSubmissions.moduleId, input.moduleId));
    const [latest] = await db.select({revision: graduateSubmissions.revision}).from(graduateSubmissions).where(ownerModule).orderBy(desc(graduateSubmissions.revision)).limit(1);
    if (input.expectedRevision !== (latest?.revision ?? 0)) throw new ApiError("A newer version is saved. Reload the record and compare it with your draft before saving again.", 409);
    const row = {id: crypto.randomUUID(), userId: user.userId, moduleId: input.moduleId,
      revision: input.expectedRevision + 1, kind: input.kind, answers: input.answers,
      contentVersion: GRADUATE_VERSION, contentSnapshot: teachingModule, createdAt: new Date().toISOString()};
    // The unique owner/module/revision index also handles racing browser tabs.
    const saved = await db.insert(graduateSubmissions).values(row).onConflictDoNothing().returning();
    if (!saved.length) throw new ApiError("Another tab saved first. Reload the record; your current writing can still be copied and compared.", 409);
    return json({submission: withoutUserId(saved[0])}, 201);
  } catch (error) { return failure(error); }
}
