import { and,eq } from "drizzle-orm";
import { ApiError,identity,json,failure,readJsonBody } from "@/lib/api";
import { graduateSubmissions } from "@/db/schema";
import { reviewInput } from "@/lib/teaching-validation";
import { appendTeachingEvent,latestTeachingEvent } from "@/lib/teaching-store";
import type { RecordedReview } from "@/lib/teaching-types";
export async function GET(request:Request){
 try{
  const {user,db}=await identity(),submissionId=new URL(request.url).searchParams.get("submissionId");
  const [submission]=await db.select().from(graduateSubmissions).where(and(eq(graduateSubmissions.userId,user.userId),eq(graduateSubmissions.id,submissionId??"")));
  if(!submission||submission.kind!=="submission")throw new ApiError("Choose one of your submitted decision memos.",404);
  const packet={formatVersion:1,submissionId:submission.id,contentVersion:submission.contentVersion,answers:submission.answers,case:submission.contentSnapshot,rubricScale:{0:"Missing or incorrect",1:"Partial, with unresolved errors",2:"Supported, with stated limitations",3:"Reproducible, challenged, and clearly defended"},reviewInstructions:"Quote the actual submitted text for each criterion. Identify a counterexample and request a revision where reasoning is unsupported. Record only a review that actually occurred."};
  return new Response(JSON.stringify(packet,null,2),{headers:{"Content-Type":"application/json; charset=utf-8","Content-Disposition":'attachment; filename="options-academy-review-packet.json"',"Cache-Control":"private, no-store"}});
 }catch(error){return failure(error);}
}
export async function POST(request:Request){
 try{
  const {user,db}=await identity(request),input=reviewInput.parse(await readJsonBody(request));
  const [submission]=await db.select().from(graduateSubmissions).where(and(eq(graduateSubmissions.userId,user.userId),eq(graduateSubmissions.id,input.submissionId)));
  if(!submission||submission.kind!=="submission")throw new ApiError("Choose one of your submitted decision memos.",404);
  const expected=submission.contentSnapshot.caseStudy.rubric.map(item=>item.dimension);
  if(input.criteria.length!==expected.length||new Set(input.criteria.map(item=>item.dimension)).size!==expected.length||expected.some(name=>!input.criteria.some(item=>item.dimension===name)))throw new ApiError("Assess each criterion from this submission's original rubric exactly once.");
  const submittedText=Object.values(submission.answers).join("\n");
  if(input.criteria.some(item=>!submittedText.includes(item.evidence)))throw new ApiError("Each evidence quotation must appear exactly in the saved submission.");
  const reviewedAt=Date.parse(input.reviewedAt);
  if(reviewedAt>Date.now()+300000||reviewedAt<Date.parse(submission.createdAt)-300000)throw new ApiError("Use the actual review date after the submission was saved.");
  if(input.decision==="accepted"&&input.criteria.some(item=>item.score<2))throw new ApiError("Resolve rubric scores below 2 before recording acceptance.");
  const latest=await latestTeachingEvent(db,user.userId,"review",submission.id);
  const payload:RecordedReview={...input};
  const event=await appendTeachingEvent(db,user.userId,"review",submission.id,latest?.revision??0,payload);
  return json({event},201);
 }catch(error){return failure(error);}
}
