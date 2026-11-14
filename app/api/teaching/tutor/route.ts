import { and,eq } from "drizzle-orm";
import { ApiError,identity,json,failure,readJsonBody } from "@/lib/api";
import { graduatePractice,graduateSubmissions,teachingEvents } from "@/db/schema";
import { tutorInput } from "@/lib/teaching-validation";
import { latestTeachingEvent,appendTeachingEvent } from "@/lib/teaching-store";
import { advanceTutorSession,buildTutorPlan,startTutorSession } from "@/lib/adaptive-teaching";
import type { TutorSession,WritingFeedback } from "@/lib/teaching-types";
export async function POST(request:Request){
 try{
  const {user,db}=await identity(request);
  const input=tutorInput.parse(await readJsonBody(request));
  if(input.action==="start"){
    let moduleId=input.moduleId;
    if(!moduleId){
      const [submissions,practice,events]=await Promise.all([db.select().from(graduateSubmissions).where(eq(graduateSubmissions.userId,user.userId)),db.select().from(graduatePractice).where(eq(graduatePractice.userId,user.userId)),db.select({kind:teachingEvents.kind,payload:teachingEvents.payload}).from(teachingEvents).where(and(eq(teachingEvents.userId,user.userId),eq(teachingEvents.kind,"feedback")))]);
      moduleId=buildTutorPlan({submissions,practice,feedback:events.filter(event=>event.kind==="feedback").map(event=>event.payload as WritingFeedback)}).recommendations[0]?.moduleId??1;
    }
    const id=crypto.randomUUID(),sequence=crypto.getRandomValues(new Uint32Array(1))[0]%900_000;
    const session=startTutorSession(moduleId,sequence,id);
    session.revision=1;
    await appendTeachingEvent(db,user.userId,"tutor",id,0,session);
    return json({session},201);
  }
  const latest=await latestTeachingEvent(db,user.userId,"tutor",input.sessionId);
  if(!latest)throw new ApiError("Choose one of your saved tutoring sessions.",404);
  if(latest.revision!==input.expectedRevision)throw new ApiError("This session changed in another tab. Reload it before answering again.",409);
  const current=latest.payload as TutorSession;
  if(current.turns.length>=200)throw new ApiError("This session has reached its saved-turn limit. Start a new session; this history is retained.",409);
  if(current.phase==="complete")throw new ApiError("This session is complete. Start a new teaching session.",409);
  const next=advanceTutorSession(current,{action:input.action,...(input.action==="answer"?{answer:input.answer}:{})});
  next.revision=latest.revision+1;
  await appendTeachingEvent(db,user.userId,"tutor",input.sessionId,latest.revision,next);
  return json({session:next},201);
 }catch(error){return failure(error);}
}
