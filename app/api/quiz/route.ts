import { identity,json,failure,ApiError } from "@/lib/api";
import { attempts,progress } from "@/db/schema";
import {and,eq} from "drizzle-orm";
import {z} from "zod";
import {buildQuiz} from "@/lib/quiz-bank";
import {gradeQuestions} from "@/lib/learning";
const moduleInput=z.coerce.number().int().min(1).max(8);
const input=z.object({moduleId:z.number().int().min(1).max(8),variant:z.number().int().min(0).max(1),answers:z.record(z.number().int().min(0).max(3))});
async function ready(userId:string,db:ReturnType<(typeof import('@/db'))['getDb']>,moduleId:number) {
 const rows=await db.select().from(progress).where(eq(progress.userId,userId));
 const completed=new Set(rows.map(r=>r.lessonId));
 if(Array.from({length:8},(_,i)=>(moduleId-1)*8+i+1).some(id=>!completed.has(id))) throw new ApiError("Complete all eight lessons in this module before its checkpoint.",409);
}
export async function GET(request:Request) {
 try {
  const {user,db}=await identity();
  const moduleId=moduleInput.parse(new URL(request.url).searchParams.get('moduleId'));
  await ready(user.userId,db,moduleId);
  const previous=await db.select().from(attempts).where(and(eq(attempts.userId,user.userId),eq(attempts.moduleId,moduleId)));
  const variant=previous.length%2;
  return json({moduleId,variant,questions:buildQuiz(moduleId,variant).map(({correctIndex,explanation,...q})=>q)});
 } catch(e) {return failure(e);}
}
export async function POST(request:Request) {
 try {
  const {user,db}=await identity(request);
  const body=input.parse(await request.json());
  await ready(user.userId,db,body.moduleId);
  const previous=await db.select().from(attempts).where(and(eq(attempts.userId,user.userId),eq(attempts.moduleId,body.moduleId)));
  if(body.variant!==previous.length%2) throw new ApiError("This checkpoint has changed. Reload it before submitting.",409);
  let result;
  try {result=gradeQuestions(buildQuiz(body.moduleId,body.variant),body.answers);} catch {throw new ApiError("Answer every question before submitting.");}
  await db.insert(attempts).values({id:crypto.randomUUID(),userId:user.userId,moduleId:body.moduleId,variant:body.variant,score:result.score,total:result.total,passed:result.passed,createdAt:new Date().toISOString()});
  return json(result);
 } catch(e) {return failure(e);}
}
