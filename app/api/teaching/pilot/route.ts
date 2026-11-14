import { ApiError,identity,json,failure,readJsonBody } from "@/lib/api";
import { pilotInput } from "@/lib/teaching-validation";
import { appendTeachingEvent,latestTeachingEvent,TEACHING_VERSION } from "@/lib/teaching-store";
import { completePilot,pilotQuestions,pilotView } from "@/lib/learning-pilot";
import type { PilotEnrollment,PilotStage } from "@/lib/teaching-types";
export async function GET(request:Request){
 try{
  const {user,db}=await identity();
  const latest=await latestTeachingEvent(db,user.userId,"pilot","learner-pilot");
  const enrollment=latest?(latest.payload as PilotEnrollment):null;
  const view=pilotView(enrollment,latest?.revision??0);
  const stage=new URL(request.url).searchParams.get("stage");
  if(stage){
    if(!["baseline","day7","day30"].includes(stage))throw new ApiError("Choose a valid pilot stage.");
    if(!enrollment)throw new ApiError("Enroll before requesting assessment questions.",409);
    try{view.questions=pilotQuestions(enrollment,stage as PilotStage);view.stage=stage as PilotStage;}catch(error){throw new ApiError((error as Error).message,409);}
  }
  return json(view);
 }catch(error){return failure(error);}
}
export async function POST(request:Request){
 try{
  const {user,db}=await identity(request),input=pilotInput.parse(await readJsonBody(request));
  const latest=await latestTeachingEvent(db,user.userId,"pilot","learner-pilot");
  if(input.action==="enroll"){
    if(latest)throw new ApiError("Your frozen pilot is already enrolled. Continue its scheduled assessments.",409);
    const enrollment:PilotEnrollment={id:crypto.randomUUID(),moduleIds:[...input.moduleIds],version:TEACHING_VERSION,enrolledAt:new Date().toISOString(),baselineAt:null,seed:crypto.getRandomValues(new Uint32Array(1))[0]%800_000,results:[]};
    const event=await appendTeachingEvent(db,user.userId,"pilot","learner-pilot",0,enrollment);
    return json({pilot:pilotView(enrollment,event.revision)},201);
  }
  if(!latest)throw new ApiError("Enroll before submitting pilot results.",409);
  if(input.expectedRevision!==latest.revision)throw new ApiError("This assessment changed. Reload the saved pilot before submitting.",409);
  let next:PilotEnrollment;
  try{next=completePilot(latest.payload as PilotEnrollment,input.stage,input.answers,input.minutes,input.clarity);}catch(error){throw new ApiError((error as Error).message,409);}
  const event=await appendTeachingEvent(db,user.userId,"pilot","learner-pilot",latest.revision,next);
  return json({pilot:pilotView(next,event.revision)},201);
 }catch(error){return failure(error);}
}
