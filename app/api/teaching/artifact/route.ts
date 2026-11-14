import { desc,and,eq } from "drizzle-orm";
import { ApiError,identity,json,failure,readJsonBody,withoutUserId } from "@/lib/api";
import { teachingEvents } from "@/db/schema";
import { artifactInput } from "@/lib/teaching-validation";
import { appendTeachingEvent,latestTeachingEvent } from "@/lib/teaching-store";
export async function GET(){
 try{
  const {user,db}=await identity();
  const events=await db.select().from(teachingEvents).where(and(eq(teachingEvents.userId,user.userId),eq(teachingEvents.kind,"artifact"))).orderBy(desc(teachingEvents.createdAt),desc(teachingEvents.revision));
  return json({artifacts:events.map(withoutUserId)});
 }catch(error){return failure(error);}
}
export async function POST(request:Request){
 try{
  const {user,db}=await identity(request),input=artifactInput.parse(await readJsonBody(request));
  const id=input.artifactId??crypto.randomUUID();
  const latest=await latestTeachingEvent(db,user.userId,"artifact",id);
  if(input.artifactId&&!latest)throw new ApiError("Choose one of your saved capstone artifacts.",404);
  const payload={kind:input.kind,title:input.title,body:input.body,sourceUrl:input.sourceUrl??""};
  const event=await appendTeachingEvent(db,user.userId,"artifact",id,input.expectedRevision,payload);
  return json({event},201);
 }catch(error){return failure(error);}
}
