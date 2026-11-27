import { and, eq, sql } from "drizzle-orm";
import { teachingEvents } from "@/db/schema";
import type { getDb } from "@/db";

export type PracticalSummary = {
  started: number;
  initialAttempts: number;
  firstCorrect: number;
  transferCorrect: number;
  nextTransferAt: string | null;
};

export async function practicalSummary(db:ReturnType<typeof getDb>, userId:string):Promise<PracticalSummary> {
  const payload=teachingEvents.payload;
  const submission=sql`json_extract(${payload}, '$.action')='submit'`;
  const initial=sql`json_extract(${payload}, '$.stage')='initial'`;
  const first=sql`json_extract(${payload}, '$.attemptType')='first'`;
  const correct=sql`json_extract(${payload}, '$.allCorrect')=1`;
  const rows=await db.select({
    initialAt:sql<string|null>`min(case when ${submission} and ${initial} then ${teachingEvents.createdAt} end)`,
    firstCorrect:sql<number>`max(case when ${submission} and ${initial} and ${first} and ${correct} and json_extract(${payload}, '$.assistance')='none' then 1 else 0 end)`,
    transfer:sql<number>`max(case when ${submission} and not (${initial}) then 1 else 0 end)`,
    transferCorrect:sql<number>`max(case when ${submission} and json_extract(${payload}, '$.independent')=1 and ${correct} then 1 else 0 end)`,
  }).from(teachingEvents).where(and(eq(teachingEvents.userId,userId),eq(teachingEvents.kind,"practical"))).groupBy(teachingEvents.entityId);
  const dates=rows.flatMap(row=>row.initialAt && !row.transfer?[Date.parse(row.initialAt)+7*86_400_000]:[]);
  return {started:rows.length,initialAttempts:rows.filter(row=>row.initialAt).length,firstCorrect:rows.reduce((n,r)=>n+r.firstCorrect,0),
    transferCorrect:rows.reduce((n,r)=>n+r.transferCorrect,0),nextTransferAt:dates.length?new Date(Math.min(...dates)).toISOString():null};
}
