import * as currentForms from "./graduate-practice.ts";
import * as legacyForms from "./graduate-practice-2026-11-14.ts";
import type { PilotEnrollment, PilotStage, PilotView, PilotResult } from "./teaching-types";

const day=86_400_000;
const stages: PilotStage[]=["baseline","day7","day30"];
export const PILOT_QUESTION_VERSION=currentForms.PRACTICE_RELEASE;
function formsFor(enrollment: PilotEnrollment, moduleId:number) {
  if (enrollment.questionVersion === PILOT_QUESTION_VERSION) return currentForms;
  if (enrollment.questionVersion === currentForms.PORTFOLIO_PRACTICE_RELEASE)
    return moduleId===24 ? currentForms : legacyForms;
  if (enrollment.questionVersion === currentForms.LEGACY_PRACTICE_RELEASE) return legacyForms;
  throw new RangeError("This pilot uses an unsupported or changed question blueprint.");
}
// A version label plus a deterministic fingerprint detects accidental changes
// to wording, units, keys or grading before a later form is administered.
function blueprintSignature(enrollment:PilotEnrollment){
  const blueprint=stages.map(stage=>enrollment.moduleIds.map(id=>{
    const {makeGraduatePractice,gradeGraduatePractice}=formsFor(enrollment,id);
    const sequence=stageSequence(enrollment,stage),questions=makeGraduatePractice(id,sequence);
    const checks=gradeGraduatePractice(id,sequence,Object.fromEntries(questions.map(q=>[q.id,0])));
    return {questions,checks:checks.map(q=>({expected:q.expected,explanation:q.explanation}))};
  }));
  let hash=2166136261;
  for(const character of JSON.stringify({blueprint,grading:formsFor(enrollment,enrollment.moduleIds[0]).GRADUATE_GRADING_CONVENTION})){hash^=character.charCodeAt(0);hash=Math.imul(hash,16777619)>>>0;}
  return `fnv1a-${hash.toString(16).padStart(8,"0")}`;
}
export function freezePilotBlueprint(enrollment:PilotEnrollment):PilotEnrollment{
  if(enrollment.results.length||enrollment.baselineAt)throw new RangeError("A pilot that has started cannot be refrozen.");
  const versioned={...enrollment,questionVersion:PILOT_QUESTION_VERSION};
  return {...versioned,blueprintSignature:blueprintSignature(versioned)};
}
function assertBlueprint(enrollment:PilotEnrollment){
  if(enrollment.blueprintSignature!==blueprintSignature(enrollment))throw new RangeError("This pilot uses an unsupported or changed question blueprint. Preserve its original results and arrange a facilitator review; automatic follow-ups cannot silently use changed questions.");
}
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
  assertBlueprint(enrollment);
  if(!stages.includes(stage))throw new RangeError("Choose baseline, day7 or day30.");
  const entry=pilotView(enrollment,0,now).schedule.find(item=>item.stage===stage);
  if(entry?.status!=="available")throw new RangeError(entry?.status==="missed"?"The assessment window has closed; its missing result remains visible.":"This assessment is completed or not due yet.");
  return enrollment.moduleIds.flatMap(id=>formsFor(enrollment,id).makeGraduatePractice(id,stageSequence(enrollment,stage)));
}
export function completePilot(enrollment:PilotEnrollment,stage:PilotStage,answers:Record<string,number>,minutes:number,clarity:number,now=new Date().toISOString(),context:Pick<PilotResult,"confidence"|"assistance">={}):PilotEnrollment {
  const questions=pilotQuestions(enrollment,stage,now);
  if(!Number.isFinite(minutes)||minutes<=0||minutes>1000||!Number.isInteger(clarity)||clarity<1||clarity>5)throw new RangeError("Record positive minutes and a clarity rating from 1 to 5.");
  if(Object.keys(answers).length!==questions.length||questions.some(q=>!Object.hasOwn(answers,q.id)||!Number.isFinite(answers[q.id])))throw new RangeError("Answer every issued pilot question exactly once.");
  const feedback=enrollment.moduleIds.flatMap(id=>{
    const {makeGraduatePractice,gradeGraduatePractice}=formsFor(enrollment,id);
    const subset=Object.fromEntries(makeGraduatePractice(id,stageSequence(enrollment,stage)).map(q=>[q.id,answers[q.id]]));
    return gradeGraduatePractice(id,stageSequence(enrollment,stage),subset);
  });
  if(context.confidence!==undefined&&(!Number.isFinite(context.confidence)||context.confidence<0||context.confidence>100))throw new RangeError("Confidence must be between 0 and 100 percent.");
  if(context.assistance!==undefined&&!["none","notes","tutor","other","prefer_not_to_say"].includes(context.assistance))throw new RangeError("State the assistance actually used.");
  const result={stage,completedAt:now,score:feedback.filter(q=>q.correct).length,total:feedback.length,minutes,clarity,feedback,...context};
  return {...enrollment,baselineAt:stage==="baseline"?now:enrollment.baselineAt,results:[...enrollment.results,result]};
}
