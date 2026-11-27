import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { notes } from "@/db/schema";
import { failure, identity, json, readJsonBody, withoutUserId } from "@/lib/api";

const input = z.object({
  lessonId: z.number().int().min(1).max(64),
  expectedOwnerId: z.string().min(1).optional(),
  content: z.string().max(10000),
  expectedRevision: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER - 1).optional(),
});
const savedFields = { revision: notes.revision, updatedAt: notes.updatedAt };

export async function PUT(request: Request) {
  try {
    const { user, db } = await identity(request);
    const { lessonId, content, expectedOwnerId, expectedRevision = 0 } = input.parse(await readJsonBody(request));
    if (expectedOwnerId && expectedOwnerId !== user.userId) {
      return json({error:"Your signed-in account changed. Reload to continue with that account. This draft is kept for the original account."}, 409);
    }
    const ownerLesson = and(eq(notes.userId, user.userId), eq(notes.lessonId, lessonId));
    const updatedAt = new Date().toISOString();
    const [saved] = expectedRevision === 0
      ? await db.insert(notes).values({ userId: user.userId, lessonId, content, updatedAt })
          .onConflictDoNothing().returning(savedFields)
      : await db.update(notes).set({ content, updatedAt, revision: expectedRevision + 1 })
          .where(and(ownerLesson, eq(notes.revision, expectedRevision), ne(notes.content, content)))
          .returning(savedFields);
    if (saved) return json({ ok: true, ...saved });

    const [current] = await db.select().from(notes).where(ownerLesson).limit(1);
    if (current && current.content === content) {
      return json({ ok: true, revision: current.revision, updatedAt: current.updatedAt });
    }
    return json({
      error: "The saved note has changed. Compare it with your draft before saving again.",
      note: current ? withoutUserId(current) : null,
    }, 409);
  } catch (error) {
    return failure(error);
  }
}
