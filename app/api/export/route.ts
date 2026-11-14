import {identity,failure,ApiError} from "@/lib/api";
import {profiles,progress,notes,attempts} from "@/db/schema";
import {eq} from "drizzle-orm";
import {exportLearningCsv} from "@/lib/export";
export async function GET(request:Request) {
 try {
  const {user,db}=await identity();
  const format=new URL(request.url).searchParams.get("format")??"json";
  if(format!=="json" && format!=="csv") throw new ApiError("Choose JSON or CSV export.");
  const [p,done,n,a]=await Promise.all([db.select().from(profiles).where(eq(profiles.userId,user.userId)),db.select().from(progress).where(eq(progress.userId,user.userId)),db.select().from(notes).where(eq(notes.userId,user.userId)),db.select().from(attempts).where(eq(attempts.userId,user.userId))]);
  const data={formatVersion:1,courseVersion:"2026-11-14",exportedAt:new Date().toISOString(),profile:p.map(({userId,...row})=>row),progress:done.map(({userId,...row})=>row),notes:n.map(({userId,...row})=>row),attempts:a.map(({userId,...row})=>row)};
  return new Response(format==="csv"?exportLearningCsv(data):JSON.stringify(data,null,2),{headers:{"Content-Type":format==="csv"?"text/csv; charset=utf-8":"application/json; charset=utf-8","Content-Disposition":`attachment; filename="options-academy-learning.${format}"`,"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
 } catch(e) {return failure(e);}
}
