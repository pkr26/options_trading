import { and, asc, eq, exists, max, or, sql } from "drizzle-orm";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { teachingEvents } from "@/db/schema";
import { ApiError, failure, identity, json, readJsonBody } from "@/lib/api";
import { appendTeachingEvent } from "@/lib/teaching-store";
import { practicalEvent, PracticalError, practicalInput, projectPracticalState } from "@/lib/practical-state";
import type { PracticalRow } from "@/lib/practical-state";

function initialSolutionExposure(db: ReturnType<typeof getDb>, userId: string) {
  return db.select({ seen: sql<number>`1` }).from(teachingEvents).where(and(
    eq(teachingEvents.userId, userId), eq(teachingEvents.kind, "practical-solutions"), eq(teachingEvents.entityId, "63"),
  )).limit(1);
}

async function readRecord(db: ReturnType<typeof getDb>, userId: string) {
  const owned = and(eq(teachingEvents.userId, userId), eq(teachingEvents.kind, "practical"));
  const stage = sql<string>`json_extract(${teachingEvents.payload}, '$.stage')`;
  const latest = db.select({
    entityId: teachingEvents.entityId,
    stage: stage.as("practical_stage"),
    revision: max(teachingEvents.revision).as("last_revision"),
  }).from(teachingEvents).where(owned).groupBy(teachingEvents.entityId, stage).as("latest_practical");
  // Retain immutable submissions and only the most recent working state for each stage.
  const history = db.select({
    entityId: teachingEvents.entityId,
    revision: teachingEvents.revision,
    createdAt: teachingEvents.createdAt,
    payload: teachingEvents.payload,
  }).from(teachingEvents).innerJoin(latest, and(eq(teachingEvents.entityId, latest.entityId), eq(stage, latest.stage)))
    .where(and(owned, or(sql`json_extract(${teachingEvents.payload}, '$.action') = 'submit'`, eq(teachingEvents.revision, latest.revision))))
    .orderBy(asc(teachingEvents.revision));
  const [rows, exposure] = await db.batch([history, initialSolutionExposure(db, userId)]);
  return { ...projectPracticalState(rows as PracticalRow[], true, Date.now(), exposure.length > 0), ownerId: userId };
}

export async function GET() {
  try {
    const user = await getChatGPTUser();
    if (!user) return json(projectPracticalState([], false));
    return json(await readRecord(getDb(), user.userId));
  } catch (error) { return failure(error); }
}

export async function POST(request: Request) {
  try {
    const { db, user } = await identity(request);
    const input = practicalInput.parse(await readJsonBody(request));
    if (input.expectedOwnerId && input.expectedOwnerId !== user.userId) {
      return json({ code: "account_changed", error: "Your signed-in account changed. Reload before saving this case." }, 409);
    }
    const record = await readRecord(db, user.userId);
    const current = record.cases.find(item => item.id === input.id)!;
    const event = practicalEvent(input, current);
    // Determine assistance in the same SQL statement as the insert, including when another tab
    // opens the answer key between this handler's record read and the write.
    const payload = event.stage === "initial" && event.assistance === "none"
      ? sql`json_set(${JSON.stringify(event)}, '$.assistance',
          CASE WHEN ${exists(initialSolutionExposure(db, user.userId))} THEN 'help' ELSE 'none' END)`
      : event;
    await appendTeachingEvent(db, user.userId, "practical", input.id, input.expectedRevision, payload);
    return json(await readRecord(db, user.userId), 201);
  } catch (error) {
    return failure(error instanceof PracticalError ? new ApiError(error.message, error.status) : error);
  }
}
