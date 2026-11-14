import { and,desc,eq,getTableColumns,max } from "drizzle-orm";
import { identity,json,failure,withoutUserId } from "@/lib/api";
import { graduatePractice,graduateSubmissions,teachingEvents } from "@/db/schema";
import { buildTutorPlan } from "@/lib/adaptive-teaching";
import { pilotView } from "@/lib/learning-pilot";
import type { PilotEnrollment,WritingFeedback } from "@/lib/teaching-types";
export async function GET(){
  try{
    const {user,db}=await identity();
    const current=db.select({kind:teachingEvents.kind,entityId:teachingEvents.entityId,revision:max(teachingEvents.revision).as("last_revision")}).from(teachingEvents).where(eq(teachingEvents.userId,user.userId)).groupBy(teachingEvents.kind,teachingEvents.entityId).as("current_evidence");
    const [events,submissions,practice]=await Promise.all([
      db.select({...getTableColumns(teachingEvents)}).from(teachingEvents).innerJoin(current,and(eq(teachingEvents.kind,current.kind),eq(teachingEvents.entityId,current.entityId),eq(teachingEvents.revision,current.revision))).where(eq(teachingEvents.userId,user.userId)).orderBy(desc(teachingEvents.createdAt),desc(teachingEvents.revision)),
      db.select().from(graduateSubmissions).where(eq(graduateSubmissions.userId,user.userId)),
      db.select().from(graduatePractice).where(eq(graduatePractice.userId,user.userId)),
    ]);
    const pilot=events.filter(event=>event.kind==="pilot").sort((a,b)=>b.revision-a.revision)[0];
    return json({events:events.map(withoutUserId),plan:buildTutorPlan({submissions,practice,feedback:events.filter(event=>event.kind==="feedback").map(event=>event.payload as WritingFeedback)}),pilot:pilotView(pilot?(pilot.payload as PilotEnrollment):null,pilot?.revision??0)});
  }catch(error){return failure(error);}
}
