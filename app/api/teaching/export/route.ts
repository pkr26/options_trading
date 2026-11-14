import { and,asc,eq,gt,lte } from "drizzle-orm";
import { identity,failure,withoutUserId } from "@/lib/api";
import { teachingEvents } from "@/db/schema";
import { TEACHING_VERSION } from "@/lib/teaching-store";
export async function GET(){
 try{
  const {user,db}=await identity();
  const exportedAt=new Date().toISOString(),encoder=new TextEncoder();
  let cursor="",count=0,started=false,cancelled=false;
  const stream=new ReadableStream<Uint8Array>({async pull(controller){
    try{
      if(cancelled)return;
      if(!started){const header=JSON.stringify({formatVersion:1,teachingVersion:TEACHING_VERSION,exportedAt});controller.enqueue(encoder.encode(header.slice(0,-1)+',"events":['));started=true;return;}
      const rows=await db.select().from(teachingEvents).where(and(eq(teachingEvents.userId,user.userId),lte(teachingEvents.createdAt,exportedAt),...(cursor?[gt(teachingEvents.id,cursor)]:[]))).orderBy(asc(teachingEvents.id)).limit(10);
      if(cancelled)return;
      if(rows.length){for(const row of rows){controller.enqueue(encoder.encode((count++?",":"")+JSON.stringify(withoutUserId(row))));cursor=row.id;}return;}
      controller.enqueue(encoder.encode('],"interpretation":'+JSON.stringify("Automated checks provide formative guidance. Reviews have the source recorded by the learner. Pilot results are observed checks; missing measurements stay missing.")+'}'));
      controller.close();
    }catch(error){if(!cancelled)controller.error(error);}
  },cancel(){cancelled=true;}});
  return new Response(stream,{headers:{"Content-Type":"application/json; charset=utf-8","Content-Disposition":'attachment; filename="options-academy-teaching-evidence.json"',"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
 }catch(error){return failure(error);}
}
