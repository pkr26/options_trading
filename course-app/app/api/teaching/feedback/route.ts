import { and,eq } from "drizzle-orm";
import { ApiError,identity,json,failure,readJsonBody } from "@/lib/api";
import { graduateSubmissions } from "@/db/schema";
import { feedbackInput } from "@/lib/teaching-validation";
import { appendTeachingEvent,latestTeachingEvent } from "@/lib/teaching-store";
import { evaluateWriting } from "@/lib/writing-feedback";
import { graduateModule } from "@/lib/graduate";
export async function POST(request:Request){
 try{
  const {user,db}=await identity(request),input=feedbackInput.parse(await readJsonBody(request));
  const [submission]=await db.select().from(graduateSubmissions).where(and(eq(graduateSubmissions.userId,user.userId),eq(graduateSubmissions.id,input.submissionId)));
  if(!submission||submission.kind!=="submission")throw new ApiError("Choose one of your submitted decision memos.",404);
  if(JSON.stringify(submission.contentSnapshot)!==JSON.stringify(graduateModule(submission.moduleId)))throw new ApiError("This memo uses an earlier teaching packet. Download its original review packet for assessment, or submit a separate revision against the current case before requesting automated checks.",409);
  const feedback=evaluateWriting(submission.moduleId,submission.answers,submission.id);
  const attributedFeedback={...feedback,contentVersion:submission.contentVersion};
  const latest=await latestTeachingEvent(db,user.userId,"feedback",submission.id);
  const event=await appendTeachingEvent(db,user.userId,"feedback",submission.id,latest?.revision??0,attributedFeedback);
  return json({feedback:attributedFeedback,event},201);
 }catch(error){return failure(error);}
}
