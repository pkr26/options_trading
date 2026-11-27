import { z } from "zod";
import { teachingEvents } from "@/db/schema";
import { failure, identity, json, readJsonBody } from "@/lib/api";
import { TEACHING_VERSION } from "@/lib/teaching-store";

const input = z.object({ expectedOwnerId: z.string().min(1).optional() }).strict();

export async function POST(request: Request) {
  try {
    const { user, db } = await identity(request);
    const { expectedOwnerId } = input.parse(await readJsonBody(request));
    if (expectedOwnerId && expectedOwnerId !== user.userId) {
      return json({ code: "account_changed", error: "Your signed-in account changed. Reload before opening these solutions." }, 409);
    }
    await db.insert(teachingEvents).values({
      id: crypto.randomUUID(), userId: user.userId, kind: "practical-solutions", entityId: "63",
      revision: 1, payload: { lessonId: 63, resource: "initial-solutions" }, version: TEACHING_VERSION,
      createdAt: new Date().toISOString(),
    }).onConflictDoNothing({ target: [teachingEvents.userId, teachingEvents.kind, teachingEvents.entityId, teachingEvents.revision] });
    return json({ recorded: true });
  } catch (error) { return failure(error); }
}
