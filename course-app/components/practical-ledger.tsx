"use client";

import {formatStudyTime} from "@/lib/study-time";
import Markdown from "./markdown";
import {useCallback,useEffect,useState} from "react";
import type { PracticalCaseId,PracticalStage } from "@/lib/practical-cases";
import type { PracticalState,PracticalCaseState } from "@/lib/practical-state";

type Edit={answers:Record<string,string>;reasoning:string;assistance:""|"none"|"help";base:number};
const address=(id:PracticalCaseId,stage:PracticalStage)=>id+"/"+stage;
function savedEdit(record:PracticalCaseState,stage:PracticalStage):Edit{
  const draft=record.drafts?.[stage] ?? (record.draft?.stage===stage?record.draft:null);
  const previous=record.attempts.filter(attempt=>attempt.stage===stage).at(-1);
  return {answers:draft?.answers ?? Object.fromEntries(Object.entries(previous?.answers??{}).map(([k,v])=>[k,String(v)])),
    reasoning:draft?.reasoning??previous?.reasoning??"",assistance:draft?.assistance??"",base:record.revision};
}
async function getState(expectedOwnerId?:string,init?:RequestInit):Promise<PracticalState>{
  const response=await fetch("/api/practical",init);
  const result=await response.json() as PracticalState & {error?:string;code?:string;ownerId?:string};
  if(!response.ok)throw Object.assign(new Error(result.error??"The case record could not be loaded."),{status:response.status,code:result.code});
  if((result.signedIn && (!expectedOwnerId || result.ownerId!==expectedOwnerId)) || (!result.signedIn && expectedOwnerId))
    throw Object.assign(new Error("Your signed-in account changed. Reload this lesson to open its case record."),{code:"account_changed"});
  return result;
}
function watchRelease(dueAt:string,refresh:()=>Promise<void>){
  const deadline=Date.parse(dueAt);
  const delay=deadline-Date.now();
  const timer=window.setTimeout(refresh,Math.max(1000,Math.min(delay+250,2147483647)));
  const focus=()=>{if(Date.now()>=deadline)void refresh();};
  window.addEventListener("focus",focus);
  return ()=>{clearTimeout(timer);window.removeEventListener("focus",focus);};
}
export default function PracticalLedger({timezone,expectedOwnerId,solutionTitle,solutionBody,onChange}:{timezone:string;expectedOwnerId?:string;solutionTitle?:string;solutionBody?:string;onChange:()=>void}){
  const [record,setRecord]=useState<PracticalState|null>(null);
  const [id,setId]=useState<PracticalCaseId>("A");
  const [showSolutions,setShowSolutions]=useState(false);
  const [stage,setStage]=useState<PracticalStage>("initial");
  const [edits,setEdits]=useState<Record<string,Edit>>({});
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  const [retry,setRetry]=useState(0);
  const date=(iso:string)=>formatStudyTime(iso,timezone);
  useEffect(()=>{
    const controller=new AbortController();
    getState(expectedOwnerId,{signal:controller.signal}).then(value=>{
      if(controller.signal.aborted)return;
      setRecord(value);setError("");
      const due=value.cases.find(c=>c.forms.transfer&&!c.attempts.some(a=>a.stage==="transfer"));
      const next=due??value.cases.find(c=>c.draft)??value.cases.find(c=>!c.attempts.length)??value.cases[0];
      if(next){setId(next.id);setStage(due?"transfer":next.draft?.stage??"initial");}
    }).catch(err=>{if(!controller.signal.aborted)setError(err.message);}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});
    return ()=>controller.abort();
  },[retry,expectedOwnerId]);
  const refreshAvailability=useCallback(async()=>{
    try{const next=await getState(expectedOwnerId);
      setRecord(old=>!old||old.signedIn!==next.signedIn?next:{...next,initialSolutionsSeen:next.initialSolutionsSeen||old.initialSolutionsSeen,cases:next.cases.map(item=>{
        const prior=old.cases.find(c=>c.id===item.id);
        return prior&&prior.revision>item.revision?prior:item;
      })});setError("");}catch(err){setError((err as Error).message);}
  },[expectedOwnerId]);
  const selected=record?.cases.find(c=>c.id===id);
  const dueAt=selected?.dueAt;
  const locked=!!dueAt && !selected?.forms.transfer;
  useEffect(()=>{
    if(!locked||!dueAt)return;
    return watchRelease(dueAt,refreshAvailability);
  },[dueAt,locked,refreshAvailability]);
  if(!record||!selected)return <section className="panel practical-ledger"><h2>Case ledgers</h2>{loading?<p role="status">Opening the case ledgers…</p>:<><p role="alert">{error}</p><button className="button button-secondary" onClick={()=>{setLoading(true);setRetry(n=>n+1);}}>Reload case ledgers</button></>}</section>;

  const form=selected.forms[stage];
  const key=address(id,stage);
  const edit=edits[key]??savedEdit(selected,stage);
  const attempts=selected.attempts.filter(attempt=>attempt.stage===stage);
  const conflict=!!edits[key] && edit.base!==selected.revision;
  const change=(patch:Partial<Edit>)=>{setEdits(all=>({...all,[key]:{...edit,...patch}}));setMessage("");};
  async function save(action:"draft"|"submit"){
    if(busy||conflict)return;
    setBusy(true);setMessage("");setError("");
    try{
      const next=await getState(expectedOwnerId,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        id,stage,action,expectedOwnerId,expectedRevision:edit.base,answers:edit.answers,reasoning:edit.reasoning,assistance,
      })});
      setRecord(next);
      setEdits(all=>{const remaining={...all};delete remaining[key];return remaining;});
      setMessage(action==="draft"?"Saved case draft. You can return another day.":"Ledger graded. The saved attempt and feedback are in the attempt history.");
      onChange();
    }catch(err){
      const problem=err as Error&{status?:number;code?:string};
      if(problem.status===409 && problem.code!=="account_changed")await refreshAvailability();
      setError(problem.message);
    }finally{setBusy(false);}
  }
  function choose(caseId:PracticalCaseId,nextStage:PracticalStage){
    setId(caseId);setStage(nextStage);setMessage("");setError("");
  }
  const exposed=stage==="initial" && !!record.initialSolutionsSeen;
  const assistance=exposed?"help":edit.assistance;
  async function toggleSolutions(){
    if(showSolutions){setShowSolutions(false);return;}
    if(!record?.signedIn || record.initialSolutionsSeen){setShowSolutions(true);return;}
    setBusy(true);setError("");
    try{
      const response=await fetch("/api/practical/solutions",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({expectedOwnerId})});
      if(!response.ok)throw new Error(response.status===401||response.status===409?"Your account changed. Reload before opening the solutions.":"Could not record this disclosure. Try again to open the solutions.");
      setRecord(old=>old?{...old,initialSolutionsSeen:true}:old);setShowSolutions(true);
    }catch(e){setError((e as Error).message);}
    finally{setBusy(false);}
  }
  const complete=!!form&&form.fields.every(field=>edit.answers[field.key]?.trim()&&Number.isFinite(Number(edit.answers[field.key])))&&edit.reasoning.trim().length>0&&!!assistance;
  return <section className="panel practical-ledger" aria-label="Lesson 63 assessed ledgers">
    <h2>Case ledgers</h2><p>Work one case per day. Save a draft or submit a ledger for a field-by-field check. The first submission stays in your record. Seven days later, a changed case tests the same skill.</p>
    <div className="button-row" aria-label="Choose case">{record.cases.map(c=><button type="button" key={c.id} disabled={busy} className="button button-secondary" aria-pressed={id===c.id} onClick={()=>choose(c.id,c.draft?.stage??"initial")}>Case {c.id}</button>)}</div>
    <div className="button-row" aria-label="Choose assessment">{(["initial","transfer"] as const).map(s=><button type="button" key={s} disabled={busy} className="text-button" aria-pressed={stage===s} onClick={()=>choose(id,s)}>{s==="initial"?"Initial case":"Seven-day transfer"}</button>)}</div>
    {error&&<p role="alert">{error}</p>}{message&&<p role="status">{message}</p>}
    {!form?<p>{selected.dueAt?"The changed case opens "+date(selected.dueAt)+".":"Submit the initial ledger to schedule the changed case."}</p>:<>
      <h3>{form.title}</h3><p className="practical-scenario">{form.scenario}</p>
      <fieldset disabled={busy||!record.signedIn}><legend>Reconstruct the ledger</legend>
        <div className="practical-fields">{form.fields.map(field=><label key={field.key}><span>{field.label}</span><small>{field.unit}</small>
          <input aria-label={field.label} type="number" step="any" value={edit.answers[field.key]??""} onChange={e=>change({answers:{...edit.answers,[field.key]:e.target.value}})}/></label>)}</div>
        <p>{form.reasoningPrompt}</p><label>Explain your reasoning<textarea rows={3} maxLength={4000} value={edit.reasoning} onChange={e=>change({reasoning:e.target.value})}/></label>
        <label>Help used<select disabled={exposed} value={assistance} onChange={e=>change({assistance:e.target.value as Edit["assistance"]})}><option value="">Select how you worked</option><option value="none">I worked without help or solutions</option><option value="help">I used notes, solutions or help</option></select></label>
        {exposed&&<p>You opened the combined solutions. Subsequent initial entries are recorded with help.</p>}
        <p className="fine-print">Explain how the cash or position changed before submitting. The numerical checks are automatic. Your explanation is saved for review.</p>
      </fieldset>
      {!record.signedIn?<p><a href="/signin-with-chatgpt?return_to=%2F%23lesson%2F63" target="_top">Sign in to save and grade your ledger</a></p>:<>
        {conflict&&<div role="alert"><p>A newer version of this case was saved. Your inputs are still in the editor.</p>
          <details><summary>Compare the latest saved inputs</summary><dl>{form.fields.map(field=><div key={field.key}><dt>{field.label}</dt><dd>{savedEdit(selected,stage).answers[field.key]||"Blank"}</dd></div>)}</dl><p>{savedEdit(selected,stage).reasoning}</p></details>
          <button type="button" className="text-button" onClick={()=>{setEdits(all=>{const next={...all};delete next[key];return next;});setError("");}}>Use saved inputs</button>{" "}
          <button type="button" className="text-button" onClick={()=>{change({base:selected.revision});setError("");}}>Keep my inputs</button></div>}
        <div className="button-row"><button type="button" className="button button-secondary" disabled={busy||conflict||!assistance} onClick={()=>void save("draft")}>Save case draft</button>
          <button type="button" className="button button-primary" disabled={busy||conflict||!complete} onClick={()=>void save("submit")}>Grade ledger</button></div>
      </>}
    </>}
    {!!attempts.length&&<section aria-label="Attempt history"><h3>Attempt history</h3>{attempts.map((attempt,index)=><details key={index} open={index===attempts.length-1}>
      <summary>{index===0?"First attempt":"Correction "+index} · {attempt.checks.filter(c=>c.correct).length}/{attempt.checks.length} entries correct</summary>
      <p>{date(attempt.createdAt)} · {attempt.assistance==="none"?"Reported no help":"Help or solutions recorded"}</p>
      <dl>{attempt.checks.map(check=><div key={check.key}><dt>{attempt.form.fields.find(f=>f.key===check.key)?.label??check.key}</dt>
        <dd>{check.correct?"Correct":"Needs correction"} · Your entry {attempt.answers[check.key]}. Expected {check.expected}. {check.explanation}</dd></div>)}</dl>
      <p><strong>Your explanation</strong> {attempt.reasoning}</p>
    </details>)}</section>}
    {solutionBody&&<details className="answer-reveal" open={showSolutions}><summary aria-disabled={busy} onClick={event=>{event.preventDefault();if(!busy)void toggleSolutions();}}>{solutionTitle}</summary>
      {showSolutions&&<div className="answer-content"><Markdown content={solutionBody}/></div>}</details>}
    {solutionBody&&!showSolutions&&<p className="fine-print">{record.signedIn?"Opening the combined solutions records help for later initial entries in all four cases. Your earlier submissions keep their original status.":"If you use these solutions while signed out, report that help when you submit an initial ledger."}</p>}
  </section>;
}
