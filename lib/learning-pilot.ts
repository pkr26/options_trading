import { makeGraduatePractice, gradeGraduatePractice } from "./graduate-practice.ts";
import type { PilotEnrollment, PilotStage, PilotView } from "./teaching-types";

const day=86_400_000;
const stages: PilotStage[]=["baseline","day7","day30"];
export function pilotView(enrollment: PilotEnrollment|null, revision=0, now=new Date().toISOString()): PilotView {
  const clock=Date.parse(now);
  if(!Number.isFinite(clock))throw new RangeError("Use a valid assessment date.");
  return {enrollment,revision,schedule:stages.map(stage=>{
    if(!enrollment)return {stage,dueAt:null,status:"awaiting_baseline"};
    const completed=enrollment.results.find(result=>result.stage===stage);
    const anchor=enrollment.baselineAt?Date.parse(enrollment.baselineAt):null;
    const offset=stage==="baseline"?0:stage==="day7"?7:30;
    const due=stage==="baseline"?Date.parse(enrollment.enrolledAt):anchor===null?null:anchor+offset*day;
    const closes=stage==="day7"?14:45;
    return {stage,dueAt:due===null?null:new Date(due).toISOString(),status:completed?"completed":due===null?"awaiting_baseline":clock<due?"scheduled":stage!=="baseline"&&anchor!==null&&clock>=anchor+closes*day?"missed":"available"};
  })};
}
function stageSequence(enrollment:PilotEnrollment,stage:PilotStage){return enrollment.seed+stages.indexOf(stage)*31;}
export function pilotQuestions(enrollment:PilotEnrollment,stage:PilotStage,now=new Date().toISOString()) {
  if(!stages.includes(stage))throw new RangeError("Choose baseline, day7 or day30.");
  const entry=pilotView(enrollment,0,now).schedule.find(item=>item.stage===stage);
  if(entry?.status!=="available")throw new RangeError(entry?.status==="missed"?"The assessment window has closed; its missing result remains visible.":"This assessment is completed or not due yet.");
  return enrollment.moduleIds.flatMap(id=>makeGraduatePractice(id,stageSequence(enrollment,stage)));
}
export function completePilot(enrollment:PilotEnrollment,stage:PilotStage,answers:Record<string,number>,minutes:number,clarity:number,now=new Date().toISOString()):PilotEnrollment {
  const questions=pilotQuestions(enrollment,stage,now);
  if(!Number.isFinite(minutes)||minutes<=0||minutes>1000||!Number.isInteger(clarity)||clarity<1||clarity>5)throw new RangeError("Record positive minutes and a clarity rating from 1 to 5.");
  if(Object.keys(answers).length!==questions.length||questions.some(q=>!Object.hasOwn(answers,q.id)||!Number.isFinite(answers[q.id])))throw new RangeError("Answer every issued pilot question exactly once.");
  const feedback=enrollment.moduleIds.flatMap(id=>{
    const subset=Object.fromEntries(makeGraduatePractice(id,stageSequence(enrollment,stage)).map(q=>[q.id,answers[q.id]]));
    return gradeGraduatePractice(id,stageSequence(enrollment,stage),subset);
  });
  const result={stage,completedAt:now,score:feedback.filter(q=>q.correct).length,total:feedback.length,minutes,clarity,feedback};
  return {...enrollment,baselineAt:stage==="baseline"?now:enrollment.baselineAt,results:[...enrollment.results,result]};
}
