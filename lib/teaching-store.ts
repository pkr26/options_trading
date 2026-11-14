import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { teachingEvents } from "@/db/schema";
import { ApiError, withoutUserId } from "./api";
import type { TeachingEvidence } from "./teaching-types";

type Db=ReturnType<typeof getDb>;
export const TEACHING_VERSION="2026-11-14.3";
export async function latestTeachingEvent(db:Db,userId:string,kind:TeachingEvidence["kind"],entityId:string){
  const [row]=await db.select().from(teachingEvents).where(and(eq(teachingEvents.userId,userId),eq(teachingEvents.kind,kind),eq(teachingEvents.entityId,entityId))).orderBy(desc(teachingEvents.revision)).limit(1);
  return row;
}
export async function appendTeachingEvent(db:Db,userId:string,kind:TeachingEvidence["kind"],entityId:string,expectedRevision:number,payload:unknown){
  const latest=await latestTeachingEvent(db,userId,kind,entityId);
  if((latest?.revision??0)!==expectedRevision)throw new ApiError("A newer record is saved. Reload and compare your current work before continuing.",409);
  const row={id:crypto.randomUUID(),userId,kind,entityId,revision:expectedRevision+1,payload,version:TEACHING_VERSION,createdAt:new Date().toISOString()};
  const inserted=await db.insert(teachingEvents).values(row).onConflictDoNothing().returning();
  if(!inserted.length)throw new ApiError("Another tab saved first. Reload the saved record before retrying.",409);
  return withoutUserId(inserted[0]);
}
