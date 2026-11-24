import { identity,json,failure,ApiError,readJsonBody } from "@/lib/api";
import { attempts,progress } from "@/db/schema";
import {and,eq} from "drizzle-orm";
import {z} from "zod";
import {buildQuiz} from "@/lib/quiz-bank";
import {gradeQuestions,COURSE_VERSION,QUESTION_VERSION} from "@/lib/learning";
const moduleInput=z.coerce.number().int().min(1).max(8);
// Validate just the small envelope first. An arbitrary answer record is not
// traversed until its keys match this form's five known question IDs.
const input=z.object({moduleId:z.number().int().min(1).max(8),variant:z.number().int().min(0).max(1),revision:z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),answers:z.unknown()});
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
  return json({moduleId,variant,revision:previous.length,questions:buildQuiz(moduleId,variant).map(q=>({id:q.id,prompt:q.prompt,options:q.options}))});
 } catch(e) {return failure(e);}
}
export async function POST(request:Request) {
 try {
  const {user,db}=await identity(request);
  const body=input.parse(await readJsonBody(request));
  await ready(user.userId,db,body.moduleId);
  const previous=await db.select().from(attempts).where(and(eq(attempts.userId,user.userId),eq(attempts.moduleId,body.moduleId)));
  if(body.revision!==previous.length || body.variant!==previous.length%2) throw new ApiError("This checkpoint has changed. Reload it before submitting.",409);
  const questions=buildQuiz(body.moduleId,body.variant);
  const supplied=body.answers;
  if(!supplied || typeof supplied!=="object" || Array.isArray(supplied) || Object.keys(supplied).length!==questions.length || questions.some(q=>!Object.hasOwn(supplied,q.id))) {
    throw new ApiError("Answer every question once, using only the questions in this form.");
  }
  const answers:Record<string,number>={};
  for(const question of questions) {
    answers[question.id]=z.number().int().min(0).max(3).parse((supplied as Record<string,unknown>)[question.id]);
  }
  const result=gradeQuestions(questions,answers);
  const inserted=await db.insert(attempts).values({id:crypto.randomUUID(),userId:user.userId,moduleId:body.moduleId,variant:body.variant,sequence:body.revision,answers,feedback:result.feedback,courseVersion:COURSE_VERSION,questionVersion:QUESTION_VERSION,score:result.score,total:result.total,passed:result.passed,createdAt:new Date().toISOString()})
    .onConflictDoNothing({target:[attempts.userId,attempts.moduleId,attempts.sequence]}).returning({id:attempts.id});
  if(!inserted.length) throw new ApiError("This checkpoint has already been submitted. Reload it before trying again.",409);
  return json(result);
 } catch(e) {return failure(e);}
}
