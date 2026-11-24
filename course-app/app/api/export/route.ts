import {identity,failure,ApiError,withoutUserId} from "@/lib/api";
import {profiles,progress,notes,attempts} from "@/db/schema";
import {eq} from "drizzle-orm";
import {exportLearningCsv} from "@/lib/export";
import {COURSE_VERSION} from "@/lib/learning";
export async function GET(request:Request) {
 try {
  const {user,db}=await identity();
  const format=new URL(request.url).searchParams.get("format")??"json";
  if(format!=="json" && format!=="csv") throw new ApiError("Choose JSON or CSV export.");
  const [p,done,n,a]=await Promise.all([db.select().from(profiles).where(eq(profiles.userId,user.userId)),db.select().from(progress).where(eq(progress.userId,user.userId)),db.select().from(notes).where(eq(notes.userId,user.userId)),db.select().from(attempts).where(eq(attempts.userId,user.userId))]);
  const data={formatVersion:2,courseVersion:COURSE_VERSION,exportedAt:new Date().toISOString(),profile:p.map(withoutUserId),progress:done.map(withoutUserId),notes:n.map(withoutUserId),attempts:a.map(withoutUserId)};
  return new Response(format==="csv"?exportLearningCsv(data):JSON.stringify(data,null,2),{headers:{"Content-Type":format==="csv"?"text/csv; charset=utf-8":"application/json; charset=utf-8","Content-Disposition":`attachment; filename="options-academy-learning.${format}"`,"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
 } catch(e) {return failure(e);}
}
