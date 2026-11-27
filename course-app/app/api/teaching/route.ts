import { and,or,desc,eq,notInArray,getTableColumns,max } from "drizzle-orm";
import { identity,json,failure,withoutUserId } from "@/lib/api";
import { graduatePractice,graduateSubmissions,teachingEvents } from "@/db/schema";
import { buildTutorPlan,presentTutorSession } from "@/lib/adaptive-teaching";
import { pilotView } from "@/lib/learning-pilot";
import type { PilotEnrollment,WritingFeedback,TutorSession } from "@/lib/teaching-types";
export async function GET(){
  try{
    const {user,db}=await identity();
    const current=db.select({kind:teachingEvents.kind,entityId:teachingEvents.entityId,revision:max(teachingEvents.revision).as("last_revision")}).from(teachingEvents).where(and(eq(teachingEvents.userId,user.userId),notInArray(teachingEvents.kind,["practical","practical-solutions"]))).groupBy(teachingEvents.kind,teachingEvents.entityId).as("current_evidence");
    const [events,submissions,practice]=await Promise.all([
      db.select({...getTableColumns(teachingEvents)}).from(teachingEvents).innerJoin(current,and(eq(teachingEvents.kind,current.kind),eq(teachingEvents.entityId,current.entityId))).where(and(eq(teachingEvents.userId,user.userId),or(eq(teachingEvents.kind,"review"),eq(teachingEvents.revision,current.revision)))).orderBy(desc(teachingEvents.createdAt),desc(teachingEvents.revision)),
      db.select().from(graduateSubmissions).where(eq(graduateSubmissions.userId,user.userId)),
      db.select().from(graduatePractice).where(eq(graduatePractice.userId,user.userId)),
    ]);
    const pilot=events.filter(event=>event.kind==="pilot").sort((a,b)=>b.revision-a.revision)[0];
    return json({events:events.map(row=>row.kind==="tutor"?{...withoutUserId(row),payload:presentTutorSession(row.payload as TutorSession)}:withoutUserId(row)),plan:buildTutorPlan({submissions,practice,feedback:events.filter(event=>event.kind==="feedback").map(event=>event.payload as WritingFeedback)}),pilot:pilotView(pilot?(pilot.payload as PilotEnrollment):null,pilot?.revision??0)});
  }catch(error){return failure(error);}
}
