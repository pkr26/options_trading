import { and, desc, eq } from "drizzle-orm";
import { ApiError, failure, identity, json, readJsonBody, withoutUserId } from "@/lib/api";
import { graduatePractice } from "@/db/schema";
import { graduateModuleId, graduatePracticeInput } from "@/lib/graduate-validation";
import { GRADUATE_VERSION, GRADUATE_QUESTION_VERSION } from "@/lib/graduate";
import { gradeGraduatePractice, makeGraduatePractice } from "@/lib/graduate-practice";

export async function GET(request: Request) {
  try {
    const {user, db} = await identity();
    const moduleId = graduateModuleId.parse(new URL(request.url).searchParams.get("moduleId"));
    const [latest] = await db.select({sequence: graduatePractice.sequence}).from(graduatePractice)
      .where(and(eq(graduatePractice.userId, user.userId), eq(graduatePractice.moduleId, moduleId)))
      .orderBy(desc(graduatePractice.sequence)).limit(1);
    const sequence = (latest?.sequence ?? -1) + 1;
    return json({moduleId, sequence, questions: makeGraduatePractice(moduleId, sequence)});
  } catch (error) { return failure(error); }
}

export async function POST(request: Request) {
  try {
    const {user, db} = await identity(request);
    const input = graduatePracticeInput.parse(await readJsonBody(request));
    const questions = makeGraduatePractice(input.moduleId, input.sequence);
    if (questions.some(question => !Object.hasOwn(input.answers, question.id))) throw new ApiError("Answer each issued question exactly once.");
    const [latest] = await db.select({sequence: graduatePractice.sequence}).from(graduatePractice)
      .where(and(eq(graduatePractice.userId, user.userId), eq(graduatePractice.moduleId, input.moduleId)))
      .orderBy(desc(graduatePractice.sequence)).limit(1);
    if (input.sequence !== (latest?.sequence ?? -1) + 1) throw new ApiError("This practice was already submitted or replaced. Request a fresh case.", 409);
    const feedback = gradeGraduatePractice(input.moduleId, input.sequence, input.answers);
    const row = {id: crypto.randomUUID(), userId: user.userId, moduleId: input.moduleId, sequence: input.sequence,
      score: feedback.filter(question => question.correct).length, total: feedback.length, feedback,
      contentVersion: GRADUATE_VERSION, questionVersion: GRADUATE_QUESTION_VERSION, createdAt: new Date().toISOString()};
    const saved = await db.insert(graduatePractice).values(row).onConflictDoNothing().returning();
    if (!saved.length) throw new ApiError("Another tab submitted this practice first. Request a fresh case.", 409);
    return json({attempt: withoutUserId(saved[0])}, 201);
  } catch (error) { return failure(error); }
}
