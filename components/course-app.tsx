"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDownToLine, ArrowLeft, ArrowRight, BookOpen, Bookmark, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Clock3, ExternalLink, FileCheck2, FileText, FlaskConical, GraduationCap, LayoutDashboard, Leaf, ListChecks, LoaderCircle, LockKeyhole, Menu, NotebookPen, RefreshCw, Search, Settings2, ShieldCheck, Sparkles, Sprout, Target, X } from "lucide-react";
import { lessons, modules } from "@/lib/course";
import type { LearningState, Lesson, Quiz, QuizResult } from "@/lib/types";
import Markdown from "./markdown";
import PayoffLab from "./payoff-lab";
import GraduateCourse from "./graduate-course";

type View = "overview"|"course"|"lesson"|"checkpoint"|"review"|"notebook"|"practice"|"resources"|"settings"|"graduate";
type Resource = { file: string; title: string; body?: string };
type Notice = { text: string; kind: "error"|"success"; auth?: boolean; retry?: () => void; retryLabel?: string };
const navigation = [
  {id:"overview",label:"My learning",icon:LayoutDashboard},
  {id:"course",label:"The course",icon:BookOpen},
  {id:"graduate",label:"Advanced academy",icon:GraduationCap},
  {id:"review",label:"Review & remember",icon:RefreshCw},
  {id:"notebook",label:"My notebook",icon:NotebookPen},
  {id:"practice",label:"Practice lab",icon:FlaskConical},
  {id:"resources",label:"Resource library",icon:Bookmark},
] as const;
const moduleIcons=[Sprout,FileText,Target,Sparkles,Clock3,ListChecks,ShieldCheck,GraduationCap];
const num=(n:number)=>String(n).padStart(2,"0");
const shortTitle=(s:string)=>s.replace(/^Part \d+:\s*/i,"");
const descriptionFor=(id:number)=>[
  "Start with shares, prices, and how markets work.","Get to know calls, puts, and the contract terms.","See where an option's value comes from.","Explore time, volatility, and the Greeks.","Follow the shares, cash, and important deadlines.","Build positions by understanding their parts.","Learn to protect your ability to keep learning.","Bring your knowledge together in simulation.",
][id-1]??"One small lesson at a time.";

async function request<T>(url:string, init?:RequestInit):Promise<T> {
  const response=await fetch(url,{...init,headers:{"Content-Type":"application/json",...init?.headers}});
  const data=await response.json();
  if(!response.ok) {
    const message=data&&typeof data==="object"&&"error" in data&&typeof data.error==="string"?data.error:"Something went wrong. Please try again.";
    const error=new Error(message) as Error&{status?:number};error.status=response.status;throw error;
  }
  return data as T;
}

function JourneyIllustration() {
  return <svg className="journey-illustration" viewBox="0 0 330 250" role="img" aria-label="An illustrated notebook and a growing plant, representing steady learning">
    <circle cx="185" cy="125" r="108" fill="#e3e8cf"/><circle cx="285" cy="44" r="4" fill="#8b9c72"/><circle cx="52" cy="177" r="3" fill="#bbcc9f"/>
    <path d="M45 217h258" stroke="#bccba7" strokeWidth="2" strokeLinecap="round"/>
    <g transform="translate(58 53) rotate(-10 75 80)"><rect x="10" y="13" width="137" height="166" rx="8" fill="#163e32"/><rect width="136" height="165" rx="7" fill="#f9f7e8" stroke="#a7b18e" strokeWidth="1.5"/><path d="M21 0v164" stroke="#d2d7bc"/><path d="M36 36h78M36 47h53M36 108h74M36 120h62M36 132h70" stroke="#c9cfb8" strokeWidth="3" strokeLinecap="round"/><path d="M38 89l18-14 17 5 27-25 13 2" fill="none" stroke="#447354" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><circle cx="113" cy="57" r="4" fill="#d78c57"/><path d="M13 17H-3m16 24H-3m16 24H-3m16 24H-3m16 24H-3m16 24H-3" stroke="#667e60" strokeWidth="3" strokeLinecap="round"/></g>
    <path d="M244 184v-65" stroke="#2b6649" strokeWidth="3"/><path d="M244 151c-31 0-40-19-35-28 18-4 34 7 35 28Z" fill="#6f9460"/><path d="M244 134c26-2 40-23 32-33-24-1-34 17-32 33Z" fill="#2f694d"/><path d="M244 114c-18-7-22-27-13-32 16 7 17 20 13 32Z" fill="#a0b282"/><path d="M220 179h48l-7 35h-34Z" fill="#cf8457"/><path d="M216 179h56v7h-56Z" fill="#dfa176"/>
    <path d="m258 53 3-9 3 9 9 3-9 3-3 9-3-9-9-3Z" fill="#b5bd92"/>
  </svg>;
}

function ProgressRing({percent,size=74}:{percent:number;size?:number}) {
  const radius=28,circ=2*Math.PI*radius;
  return <div className="progress-ring" style={{width:size,height:size}}><svg viewBox="0 0 70 70" aria-hidden="true"><circle cx="35" cy="35" r={radius} fill="none" stroke="#e5e9df" strokeWidth="5"/><circle cx="35" cy="35" r={radius} fill="none" stroke="#397354" strokeWidth="5" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ*(1-percent/100)} transform="rotate(-90 35 35)"/></svg><strong>{percent}<small>%</small></strong></div>;
}

export default function CourseApp({initialName=""}:{initialName?:string}) {
  const [view,setView]=useState<View>("overview");
  const [graduateOpened,setGraduateOpened]=useState(false);
  const [navigationReady,setNavigationReady]=useState(false);
  const [data,setData]=useState<LearningState|null>(null);
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState("");
  const [notice,setNotice]=useState<Notice|null>(null);
  const [mobileOpen,setMobileOpen]=useState(false);
  const [selectedId,setSelectedId]=useState(1);
  const [expandedModule,setExpandedModule]=useState(1);
  const [search,setSearch]=useState("");
  const [resourceSearch,setResourceSearch]=useState("");
  const [selectedResource,setSelectedResource]=useState<string|null>(null);
  const [library,setLibrary]=useState<Resource[]>([]);
  const [resourceLoading,setResourceLoading]=useState(false);
  const [drafts,setDrafts]=useState<Record<number,string>>({});
  const [lessonTried,setLessonTried]=useState(false);
  const [quizModule,setQuizModule]=useState(1);
  const [quiz,setQuiz]=useState<Quiz|null>(null);
  const [answers,setAnswers]=useState<Record<string,number>>({});
  const [result,setResult]=useState<QuizResult|null>(null);
  const [reviewId,setReviewId]=useState<number|null>(null);
  const [reviewRevealed,setReviewRevealed]=useState(false);
  const [dailyMinutesDraft,setDailyMinutes]=useState<number|null>(null);
  const [timezoneDraft,setTimezone]=useState<string|null>(null);
  const dailyMinutes=dailyMinutesDraft??data?.profile.dailyMinutes??15;
  const timezone=timezoneDraft??data?.profile.timezone??"America/Phoenix";
  const [now,setNow]=useState(0);
  const activeResource=useRef<string|null>(null);
  useEffect(()=>{
    const restoreAdvanced=()=>{if(window.location.hash.startsWith("#advanced/")){setGraduateOpened(true);setView("graduate");}};
    queueMicrotask(()=>{setNavigationReady(true);restoreAdvanced();});
    window.addEventListener("hashchange",restoreAdvanced);
    return()=>window.removeEventListener("hashchange",restoreAdvanced);
  },[]);

  const showError=useCallback((error:unknown,retry?:()=>void,retryLabel="Retry")=>{
    const e=error as Error&{status?:number};
    setNotice({text:e.message??"We couldn't finish that. Please try again.",kind:"error",auth:e.status===401,retry,retryLabel});
  },[]);
  const refresh=useCallback(async()=>{
    const state=await request<LearningState>("/api/learning");
    setData(state);setNow(Date.now());return state;
  },[]);
  const reloadLearning=useCallback(async function reload(){
    setLoading(true);setNotice(null);
    try{await refresh();}catch(error){showError(error,reload,"Reload learning record");}finally{setLoading(false);}
  },[refresh,showError]);
  const reloadLibrary=useCallback(async function reload(){
    setNotice(null);
    try{setLibrary(await request<Resource[]>("/api/resources"));}catch(error){showError(error,reload);}
  },[showError]);
  useEffect(()=>{
    let active=true;
    request<LearningState>("/api/learning").then(state=>{if(active){setData(state);setNow(Date.now());}}).catch(error=>{
      if(active&&(error as Error&{status?:number}).status!==401)showError(error,reloadLearning,"Reload learning record");
    }).finally(()=>{if(active)setLoading(false);});
    return()=>{active=false;};
  },[reloadLearning,showError]);
  useEffect(()=>{
    let active=true;
    request<Resource[]>("/api/resources").then(resources=>{if(active)setLibrary(resources);}).catch(error=>{if(active)showError(error,reloadLibrary);});
    return()=>{active=false;};
  },[reloadLibrary,showError]);
  useEffect(()=>{
    const updateClock=()=>setNow(Date.now());
    const whenVisible=()=>{if(document.visibilityState==="visible")updateClock();};
    const timer=window.setInterval(updateClock,30_000);
    window.addEventListener("focus",updateClock);
    document.addEventListener("visibilitychange",whenVisible);
    return()=>{window.clearInterval(timer);window.removeEventListener("focus",updateClock);document.removeEventListener("visibilitychange",whenVisible);};
  },[]);
  useEffect(()=>{
    const closeOnEscape=(event:KeyboardEvent)=>{if(event.key==="Escape")setMobileOpen(false);};
    window.addEventListener("keydown",closeOnEscape);
    return()=>window.removeEventListener("keydown",closeOnEscape);
  },[]);
  const completed=useMemo(()=>new Set(data?.progress.map(p=>p.lessonId)??[]),[data]);
  const passed=useMemo(()=>new Set(data?.attempts.filter(a=>a.passed).map(a=>a.moduleId)??[]),[data]);
  const due=useMemo(()=>data?.progress.filter(p=>new Date(p.nextReviewAt).getTime()<=now).sort((a,b)=>a.nextReviewAt.localeCompare(b.nextReviewAt))??[],[data,now]);
  const currentLesson=lessons.find(l=>l.id===selectedId)??lessons[0];
  const currentModule=modules.find(m=>m.id===currentLesson.moduleId)??modules[0];
  const nextLesson=lessons.find(l=>!completed.has(l.id));
  const pendingCheckpoint=modules.find(m=>m.lessons.every(l=>completed.has(l.id))&&!passed.has(m.id));
  const percent=Math.round(completed.size/lessons.length*100);
  const displayName=data?.user.name||initialName;
  const firstName=displayName&&!displayName.includes("@")?displayName.split(" ")[0]:"";
  const initials=displayName?displayName[0].toUpperCase():"Y";
  const activeNavigation=view==="lesson"||view==="checkpoint"?"course":view;
  const noteContent=(id:number)=>drafts[id]??data?.notes.find(n=>n.lessonId===id)?.content??"";
  const noteDirty=(id:number)=>noteContent(id)!==(data?.notes.find(n=>n.lessonId===id)?.content??"");
  const canComplete=(lesson:Lesson)=>!!data&&(lesson.id===1||completed.has(lesson.id-1))&&(lesson.id===modules.find(m=>m.id===lesson.moduleId)?.lessons[0].id?(lesson.moduleId===1||passed.has(lesson.moduleId-1)):true);
  const focusContent=()=>window.requestAnimationFrame(()=>document.getElementById("main-content")?.focus({preventScroll:true}));
  const closeResource=()=>{activeResource.current=null;setSelectedResource(null);setResourceLoading(false);};
  const clearAdvancedHash=()=>{if(window.location.hash.startsWith("#advanced/"))window.history.replaceState(null,"",window.location.pathname+window.location.search);};
  const go=(next:View)=>{if(next==="graduate")setGraduateOpened(true);else clearAdvancedHash();activeResource.current=null;setNow(Date.now());setView(next);setMobileOpen(false);setNotice(null);if(next!=="course")setSearch("");if(next==="resources")closeResource();window.scrollTo({top:0,behavior:"smooth"});focusContent();};
  const openLesson=(id:number)=>{clearAdvancedHash();activeResource.current=null;setSelectedId(id);setLessonTried(false);setView("lesson");setMobileOpen(false);setNotice(null);window.scrollTo({top:0,behavior:"smooth"});focusContent();};
  const openResource=(file:string)=>{
    clearAdvancedHash();
    activeResource.current=file;setSelectedResource(file);setView("resources");setMobileOpen(false);setNotice(null);window.scrollTo({top:0,behavior:"smooth"});focusContent();
    if(library.some(resource=>resource.file===file&&resource.body!==undefined)){setResourceLoading(false);return;}
    async function load(){
      if(activeResource.current!==file)return;
      setResourceLoading(true);setNotice(null);
      try{
        const resource=await request<Resource>(`/api/resources?file=${encodeURIComponent(file)}`);
        if(activeResource.current===file)setLibrary(previous=>previous.some(item=>item.file===resource.file)?previous.map(item=>item.file===resource.file?resource:item):[...previous,resource]);
      }catch(error){if(activeResource.current===file)showError(error,load);}
      finally{if(activeResource.current===file)setResourceLoading(false);}
    }
    void load();
  };
  const fileLink=(file:string)=>{
    const path=decodeURIComponent(file.split("#")[0]).replace(/^\.\//,"");
    const base=path.split("/").pop()??path;
    if(base==="MY_LEARNING_RECORD.md"){go("notebook");return;}
    const linkedModule=modules.find(m=>m.sourceFile===path||m.file===path);
    if(linkedModule){openLesson(linkedModule.lessons[0].id);return;}
    const exact=library.find(r=>r.file===path);
    const fallback=library.filter(r=>r.file.split("/").pop()===base);
    const resource=exact??(fallback.length===1?fallback[0]:undefined);
    if(resource){openResource(resource.file);return;}
    if(base==="START_HERE.md"||base==="HOW_TO_STUDY.md"){go("overview");return;}
    openResource(path);
  };
  const mutate=async(key:string,url:string,body:unknown,method="POST")=>{
    setBusy(key);setNotice(null);
    try{await request(url,{method,body:JSON.stringify(body)});await refresh();return true;}
    catch(e){showError(e,reloadLearning,"Reload learning record");return false;}finally{setBusy("");}
  };
  const completeLesson=async()=>{
    const success=await mutate("complete","/api/progress",{lessonId:currentLesson.id,action:"complete"});
    if(success){setNotice({text:"Lesson completed. Your progress and next review are saved.",kind:"success"});}
  };
  const saveNote=async(id:number)=>{
    const success=await mutate("note","/api/notes",{lessonId:id,content:noteContent(id)},"PUT");
    if(success)setNotice({text:"Your note is saved in your notebook.",kind:"success"});
  };
  const startQuiz=async(moduleId:number)=>{
    activeResource.current=null;setQuizModule(moduleId);setQuiz(null);setResult(null);setAnswers({});setView("checkpoint");setBusy("quiz-load");setNotice(null);window.scrollTo({top:0,behavior:"smooth"});
    try{setQuiz(await request<Quiz>(`/api/quiz?moduleId=${moduleId}`));}catch(e){showError(e,()=>startQuiz(moduleId),"Reload checkpoint");}finally{setBusy("");}
  };
  const submitQuiz=async()=>{
    if(!quiz)return;setBusy("quiz-submit");setNotice(null);
    try{const graded=await request<QuizResult>("/api/quiz",{method:"POST",body:JSON.stringify({moduleId:quiz.moduleId,variant:quiz.variant,revision:quiz.revision,answers})});setResult(graded);await refresh();window.scrollTo({top:0,behavior:"smooth"});}catch(e){showError(e,()=>startQuiz(quiz.moduleId),"Reload checkpoint");}finally{setBusy("");}
  };
  const review=async(recalled:boolean)=>{
    if(!reviewId)return;const revision=data?.progress.find(item=>item.lessonId===reviewId)?.reviewRevision;
    const success=await mutate("review","/api/progress",{lessonId:reviewId,action:"review",recalled,reviewRevision:revision});
    if(success){setReviewId(null);setReviewRevealed(false);setNotice({text:recalled?"Review saved. We'll bring this idea back at a longer interval.":"Review saved. This idea will return soon for more practice.",kind:"success"});}
  };

  const renderNoteEditor=(lessonId:number)=><section className="study-note panel"><div className="section-row"><h3><NotebookPen size={16}/>Your own words</h3><span className="tiny muted">{noteDirty(lessonId)?"Unsaved":"Saved notes"}</span></div><p>Explain the idea. Record your answer or a question to come back to.</p><label className="sr-only" htmlFor={`note-${lessonId}`}>Notes for lesson {lessonId}</label><textarea id={`note-${lessonId}`} maxLength={10000} rows={7} placeholder="The idea as I understand it…" value={noteContent(lessonId)} onChange={e=>setDrafts(prev=>({...prev,[lessonId]:e.target.value}))}/><div className="note-footer"><span>{noteContent(lessonId).length.toLocaleString()} / 10,000</span><button className="button button-small button-secondary" disabled={!data||!!busy||!noteDirty(lessonId)} onClick={()=>saveNote(lessonId)}>{busy==="note"?<LoaderCircle size={14} className="spin"/>:<Check size={14}/>}Save note</button></div>{!data&&<p className="fine-print">Sign in to save. Your draft stays here while this page is open.</p>}</section>;

  return <div className="app-shell">
    <a className="skip-link" href="#main-content">Skip to content</a>
    {mobileOpen&&<button className="sidebar-scrim" aria-label="Close navigation" onClick={()=>setMobileOpen(false)}/>}
    <aside className={`sidebar ${mobileOpen?"sidebar-open":""}`} aria-label="Main navigation">
      <button className="brand" onClick={()=>go("overview")} aria-label="First Principles home"><span className="brand-mark"><span>f</span><i/></span><span>first principles<small>OPTIONS, FROM ZERO.</small></span></button>
      <div className="sidebar-course"><span className="sidebar-course-icon"><Leaf size={16}/></span><div><strong>Options Academy</strong><span>Foundations to advanced study</span></div><ChevronDown size={14}/></div>
      <p className="nav-caption">YOUR CLASSROOM</p>
      <nav aria-busy={!navigationReady}>{navigation.map(item=><button key={item.id} disabled={!navigationReady} className={`nav-item ${activeNavigation===item.id?"active":""}`} onClick={()=>go(item.id)} aria-current={activeNavigation===item.id?"page":undefined}><item.icon size={18}/><span>{item.label}</span>{item.id==="review"&&due.length>0&&<span className="nav-count">{due.length}</span>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="gentle-card"><span className="gentle-icon"><Sprout size={22}/></span><strong>Small steps. Strong foundations.</strong><p>Understanding comes before trading. You&apos;re right where you need to be.</p></div><button className={`nav-item ${view==="settings"?"active":""}`} onClick={()=>go("settings")}><Settings2 size={18}/><span>Learning preferences</span></button><div className="sidebar-person"><span className="avatar">{initials}</span><div><strong>{firstName||"Your learning space"}</strong><span>{data?"Personal learning account":"Ready when you are"}</span></div>{!data&&<a href="/signin-with-chatgpt?return_to=%2F" target="_top" className="sign-in-link">Sign in</a>}</div></div>
    </aside>

    <div className="workspace">
      <header className="topbar"><div className="topbar-context"><button className="icon-button mobile-menu" aria-label="Open navigation" aria-expanded={mobileOpen} onClick={()=>setMobileOpen(v=>!v)}><Menu size={21}/></button><span className="topbar-breadcrumb">Your classroom <ChevronRight size={12}/><strong>{view==="lesson"?`Lesson ${num(currentLesson.id)}`:view==="checkpoint"?"Checkpoint":navigation.find(n=>n.id===view)?.label??"Preferences"}</strong></span></div><div className="topbar-actions"><label className="search-field"><Search size={16}/><span className="sr-only">Search lessons</span><input placeholder="Find a lesson…" value={search} onChange={e=>{setSearch(e.target.value);setView("course");}}/><kbd>⌕</kbd></label><span className="learning-badge"><span/>At your pace</span><button className="avatar avatar-small" onClick={()=>go("settings")} aria-label="Open your learning preferences">{initials}</button></div></header>
      <main id="main-content" className={`main-content ${view==="lesson"?"reader-main":""}`} tabIndex={-1}>
        {notice&&<div className={`notice notice-${notice.kind}`} role={notice.kind==="error"?"alert":"status"}>{notice.kind==="error"?<CircleHelp size={18}/>:<CheckCircle2 size={18}/>}<span>{notice.text}{notice.auth&&<> <a href="/signin-with-chatgpt?return_to=%2F" target="_top">Sign in with ChatGPT</a> to save your progress.</>}</span>{notice.kind==="error"&&!notice.auth&&notice.retry&&<button disabled={!!busy} onClick={notice.retry}>{notice.retryLabel??"Retry"}</button>}<button className="icon-button" aria-label="Dismiss message" onClick={()=>setNotice(null)}><X size={15}/></button></div>}
        {loading&&<div className="loading-line" role="status"><LoaderCircle size={15} className="spin"/>Opening your learning record…</div>}

        {view==="overview"&&<>
          <div className="page-heading"><div><p className="eyebrow">A LITTLE LEARNING, EVERY DAY</p><h1>{firstName?`Welcome, ${firstName}.`:"A good place to begin."}</h1><p>You don&apos;t need to know anything yet. We&apos;ll build from here.</p></div><span className="outlined-tag"><Sprout size={14}/>Absolute beginner friendly</span></div>
          <div className="dashboard-top"><section className="hero-card"><div className="hero-copy"><span className="hero-label"><span/>{completed.size>0?"YOUR NEXT SMALL STEP":"YOUR JOURNEY STARTS HERE"}</span><h2>Big understanding.<br/>Small lessons.</h2><p>One clear idea. One simple example.<br/>A little more confidence, every day.</p><button className="button button-primary" onClick={()=>pendingCheckpoint?startQuiz(pendingCheckpoint.id):nextLesson?openLesson(nextLesson.id):go("review")}>{pendingCheckpoint?"Take your checkpoint":completed.size===lessons.length?"Review what you've learned":completed.size>0?"Continue learning":"Start my first lesson"}<ArrowRight size={17}/></button><span className="hero-meta"><Clock3 size={13}/>5–10 minutes<span className="dot-separator">·</span>No account or real money needed to read</span></div><JourneyIllustration/></section>
          <section className="panel today-card"><div className="section-row"><p className="eyebrow">YOUR LEARNING PACE</p><span className="sun-icon">☀</span></div><div className="today-progress"><ProgressRing percent={percent}/><div><strong>{completed.size} <span>/ {lessons.length}</span></strong><p>lessons completed</p></div></div><div className="progress-track"><span style={{width:`${percent}%`}}/></div><p className="today-description">{completed.size===0?"Your first lesson is a small step. A strong foundation starts with showing up.":`${passed.size} of ${modules.length} checkpoints passed. Keep choosing understanding over speed.`}</p><button className="text-button" onClick={()=>go("settings")}><Clock3 size={14}/>{data?.profile.dailyMinutes??15} minutes a day<ChevronRight size={14}/></button></section></div>
          <div className="stat-grid"><div className="stat-card"><span className="stat-icon sage"><BookOpen size={20}/></span><div><strong>{modules.length} chapters</strong><span>A clear path from the very basics</span></div></div><div className="stat-card"><span className="stat-icon peach"><RefreshCw size={20}/></span><div><strong>{due.length} {due.length===1?"idea":"ideas"} to revisit</strong><span>{due.length?"A little recall makes learning stick":"Reviews appear after you learn"}</span></div>{due.length>0&&<button className="icon-button" aria-label="Open due reviews" onClick={()=>go("review")}><ArrowRight size={18}/></button>}</div><div className="stat-card"><span className="stat-icon sand"><NotebookPen size={20}/></span><div><strong>{data?.notes.filter(n=>n.content.trim()).length??0} saved notes</strong><span>Your understanding, in your words</span></div></div></div>
          <div className="section-heading"><div><p className="eyebrow">THE ROAD AHEAD</p><h2>Your learning path</h2></div><button className="text-button" onClick={()=>go("course")}>Explore all lessons<ArrowRight size={15}/></button></div>
          <div className="module-grid">{modules.map(module=>{
            const Icon=moduleIcons[(module.id-1)%moduleIcons.length];const count=module.lessons.filter(l=>completed.has(l.id)).length;const active=nextLesson?.moduleId===module.id;
            return <button className={`module-card ${active?"module-card-current":""}`} key={module.id} onClick={()=>{setExpandedModule(module.id);go("course");}}><div className="module-card-top"><span className={`module-icon module-color-${module.id%4}`}><Icon size={21}/></span><span className="module-status">{passed.has(module.id)?<><Check size={12}/>Complete</>:active?"UP NEXT":`CHAPTER ${num(module.id)}`}</span></div><h3>{shortTitle(module.title)}</h3><p>{descriptionFor(module.id)}</p><div className="module-card-bottom"><span>{module.lessons.length} little lessons</span><span>{count>0?`${count}/${module.lessons.length}`:<ArrowUpIndicator/>}</span></div>{count>0&&<div className="module-mini-track"><span style={{width:`${count/module.lessons.length*100}%`}}/></div>}</button>;
          })}</div>
          <div className="bottom-guide"><div className="guide-icon"><GraduationCap size={23}/></div><div><strong>Continue into the Advanced Academy.</strong><p>26 case seminars, interactive laboratories, portfolio decisions, and an evidence portfolio.</p></div><button className="text-button" onClick={()=>go("graduate")}>Explore advanced study<ArrowRight size={14}/></button></div>
          <div className="bottom-guide"><div className="guide-icon"><ShieldCheck size={23}/></div><div><strong>Learn the “why” before the “buy.”</strong><p>This is a learning space. No signals, profit promises, or real-money orders.</p></div><button className="text-button" onClick={()=>openResource("VERIFICATION_REPORT.md")}>How this course was checked<ArrowRight size={14}/></button></div>
        </>}

        {graduateOpened&&<div hidden={view!=="graduate"}><GraduateCourse onResource={openResource}/></div>}

        {view==="course"&&<>
          <div className="page-heading"><div><p className="eyebrow">YOUR BEGINNER JOURNEY</p><h1>The course, one idea at a time.</h1><p>{lessons.length} small lessons. {modules.length} checkpoints. A foundation you can explain.</p></div><div className="course-progress-label"><ProgressRing percent={percent} size={52}/><span>{completed.size} lessons<br/><strong>completed</strong></span></div></div>
          {search&&<div className="search-results-heading"><Search size={17}/><span>Lessons matching “{search}”</span><button className="text-button" onClick={()=>setSearch("")}>Clear search</button></div>}
          <div className="course-list">{modules.filter(m=>!search||m.lessons.some(l=>(l.title+" "+l.body).toLowerCase().includes(search.toLowerCase()))).map(module=>{
            const Icon=moduleIcons[(module.id-1)%moduleIcons.length];const count=module.lessons.filter(l=>completed.has(l.id)).length;const expanded=expandedModule===module.id||!!search;
            return <section className={`chapter-panel panel ${expanded?"chapter-expanded":""}`} key={module.id}><button className="chapter-toggle" onClick={()=>setExpandedModule(expandedModule===module.id?0:module.id)} aria-expanded={expanded}><span className={`module-icon module-color-${module.id%4}`}><Icon size={23}/></span><span className="chapter-heading"><span className="eyebrow">CHAPTER {num(module.id)}<span className="chapter-count">{count}/{module.lessons.length} complete</span></span><strong>{module.title}</strong><span>{descriptionFor(module.id)}</span></span>{passed.has(module.id)?<CheckCircle2 size={22} className="positive"/>:<ChevronDown size={19} className={expanded?"rotate-up":""}/>}</button>{expanded&&<div className="chapter-lessons">{module.lessons.filter(l=>!search||(l.title+" "+l.body).toLowerCase().includes(search.toLowerCase())).map(l=><button className={`lesson-row ${completed.has(l.id)?"lesson-row-complete":""}`} key={l.id} onClick={()=>openLesson(l.id)}><span className="lesson-number">{completed.has(l.id)?<Check size={15}/>:num(l.id)}</span><span className="lesson-row-title">{l.title}</span><span className="lesson-time"><Clock3 size={12}/>{l.minutes} min</span><ChevronRight size={15}/></button>)}<div className="chapter-checkpoint"><div><FileCheck2 size={20}/><span><strong>Put it into your own words</strong><small>{passed.has(module.id)?"Checkpoint passed — revisit anytime":count===module.lessons.length?"Your chapter checkpoint is ready":"Complete these 8 lessons to open the checkpoint"}</small></span></div><button className="button button-small button-secondary" disabled={count<module.lessons.length||!data||!!busy} onClick={()=>startQuiz(module.id)}>{passed.has(module.id)?"Practice again":"Take checkpoint"}<ArrowRight size={13}/></button></div></div>}</section>;
          })}</div>{search&&!modules.some(m=>m.lessons.some(l=>(l.title+" "+l.body).toLowerCase().includes(search.toLowerCase())))&&<Empty icon={Search} title="No lessons found" text="Try a term such as call, shares, or premium."/>}
        </>}

        {view==="lesson"&&<>
          <div className="reader-top"><button className="text-button" onClick={()=>{setExpandedModule(currentModule.id);go("course");}}><ArrowLeft size={15}/>All lessons</button><span>CHAPTER {num(currentModule.id)} <span className="dot-separator">·</span> {currentModule.title}</span></div>
          <div className="lesson-stepping" aria-label="Lessons in this chapter">{currentModule.lessons.map(l=><button key={l.id} aria-current={selectedId===l.id?"step":undefined} className={`${l.id===selectedId?"current ":""}${completed.has(l.id)?"done":""}`} onClick={()=>openLesson(l.id)} aria-label={`Lesson ${l.id}: ${l.title}`}>{completed.has(l.id)?<Check size={13}/>:num(l.id)}</button>)}<span>{currentModule.lessons.findIndex(l=>l.id===selectedId)+1} of 8</span></div>
          <div className="reader-layout"><article className="lesson-article"><div className="lesson-heading"><p className="eyebrow">LESSON {num(currentLesson.id)}<span><Clock3 size={12}/>{currentLesson.minutes} MINUTES</span>{completed.has(currentLesson.id)&&<span className="positive"><CheckCircle2 size={12}/>COMPLETED</span>}</p><h1>{currentLesson.title}</h1><p>Take your time. Write an answer before revealing the solution.</p></div><details className="module-context"><summary>Chapter assumptions & study notes</summary><Markdown content={currentModule.introduction} onFileLink={fileLink} compact/></details><Markdown content={currentLesson.body} onFileLink={fileLink}/><div className="lesson-completion">{completed.has(currentLesson.id)?<><span className="completion-check"><CheckCircle2 size={22}/><span><strong>One more idea understood.</strong><small>Your completion is saved. A review will help it stay with you.</small></span></span>{currentLesson.id===currentModule.lessons.at(-1)?.id?<button className="button button-primary" disabled={!!busy||!data} onClick={()=>startQuiz(currentModule.id)}>Chapter checkpoint<ArrowRight size={16}/></button>:<button className="button button-primary" onClick={()=>openLesson(currentLesson.id+1)}>Next small lesson<ArrowRight size={16}/></button>}</>:<><label className="completion-confirm"><input type="checkbox" checked={lessonTried} onChange={e=>setLessonTried(e.target.checked)}/><span>I&apos;ve worked the example and tried the question in my own words.</span></label><button className="button button-primary" disabled={!lessonTried||!canComplete(currentLesson)||!!busy} onClick={completeLesson}>{busy==="complete"?<LoaderCircle size={16} className="spin"/>:<Check size={16}/>}Mark lesson complete</button>{!data?<p className="fine-print"><a href="/signin-with-chatgpt?return_to=%2F" target="_top">Sign in with ChatGPT</a> to save your progress.</p>:!canComplete(currentLesson)&&<p className="fine-print">You can preview this idea. Complete the previous lesson and earlier chapter checkpoints to record it in order.</p>}</>}</div><div className="reader-pagination"><button className="text-button" disabled={currentLesson.id===1} onClick={()=>openLesson(currentLesson.id-1)}><ChevronLeft size={15}/>Previous lesson</button><button className="text-button" disabled={currentLesson.id===lessons.at(-1)?.id} onClick={()=>openLesson(currentLesson.id+1)}>Preview next lesson<ChevronRight size={15}/></button></div></article><aside className="reader-aside">{renderNoteEditor(currentLesson.id)}<div className="reader-tip"><Sprout size={20}/><h3>A small habit that helps</h3><p>Close the lesson. Explain its one idea as if you were teaching a friend. If you get stuck, that&apos;s your next place to practice.</p></div></aside></div>
        </>}

        {view==="checkpoint"&&<>
          <div className="page-heading"><div><p className="eyebrow">CHAPTER {num(quizModule)} CHECKPOINT</p><h1>Let&apos;s see what stayed with you.</h1><p>Five questions. No timer. Understanding is the goal.</p></div><button className="text-button" onClick={()=>go("course")}><ArrowLeft size={15}/>Back to the course</button></div>
          {busy==="quiz-load"&&<div className="panel empty-state"><LoaderCircle className="spin" size={24}/><p>Preparing your checkpoint questions…</p></div>}
          {!quiz&&busy!=="quiz-load"&&<Empty icon={FileCheck2} title="Your checkpoint will appear here" text="Complete all eight lessons in this chapter and sign in to take its checkpoint."><button className="button button-secondary" onClick={()=>startQuiz(quizModule)}>Try opening checkpoint<RefreshCw size={15}/></button></Empty>}
          {result&&<section className={`checkpoint-result ${result.passed?"checkpoint-pass":"checkpoint-practice"}`} role="status"><span className="result-icon">{result.passed?<GraduationCap size={29}/>:<Sprout size={29}/>}</span><div><p className="eyebrow">{result.score} OF {result.total} CORRECT</p><h2>{result.passed?"A strong foundation. Keep going.":"A useful place to practice."}</h2><p>{result.passed?(quizModule===modules.at(-1)?.id?"Your final checkpoint is saved. Keep reviewing and use the optional deeper study when you are ready.":"Your checkpoint is saved and the next chapter is ready."):"Read the explanations below. Revisit the ideas you missed, then try the alternate form."}</p><div className="button-row">{result.passed&&modules.find(m=>m.id===quizModule+1)&&<button className="button button-primary" onClick={()=>openLesson(modules.find(m=>m.id===quizModule+1)!.lessons[0].id)}>Start the next chapter<ArrowRight size={15}/></button>}<button className="button button-secondary" disabled={!!busy} onClick={()=>startQuiz(quizModule)}>Try an alternate version<RefreshCw size={14}/></button></div></div></section>}
          {quiz&&<div className="quiz-form"><p className="fine-print">Two forms alternate. Once you have seen them, use them as review and ask your tutor for unseen cases.</p>{quiz.questions.map((q,i)=>{const graded=result?.feedback.find(f=>f.id===q.id);return <fieldset className={`panel quiz-question ${graded?(graded.correct?"question-correct":"question-incorrect"):""}`} key={q.id}><legend><span>QUESTION {num(i+1)}</span>{q.prompt}</legend><div className="quiz-options">{q.options.map((option,index)=><label key={index} className={`quiz-option ${answers[q.id]===index?"option-selected":""} ${graded?.correctIndex===index?"option-correct":""}`}><input type="radio" name={q.id} value={index} checked={answers[q.id]===index} disabled={!!result||!!busy} onChange={()=>setAnswers(prev=>({...prev,[q.id]:index}))}/><span className="option-letter">{String.fromCharCode(65+index)}</span><span>{option}</span>{graded?.correctIndex===index&&<CheckCircle2 size={17}/>}</label>)}</div>{graded&&<div className="question-feedback"><strong>{graded.correct?"That's right.":"Let's work through it."}</strong><p>{graded.explanation}</p></div>}</fieldset>;})}{!result&&<div className="quiz-submit"><p>{Object.keys(answers).length} / {quiz.questions.length} answered. Your first attempt will be saved.</p><button className="button button-primary" disabled={Object.keys(answers).length!==quiz.questions.length||!!busy} onClick={submitQuiz}>{busy==="quiz-submit"?<LoaderCircle className="spin" size={16}/>:<FileCheck2 size={16}/>}Check my understanding</button></div>}</div>}
        </>}

        {view==="review"&&<>
          <div className="page-heading"><div><p className="eyebrow">MAKE UNDERSTANDING LAST</p><h1>A little recall goes a long way.</h1><p>Bring an idea back to mind before you read it again.</p></div><span className="outlined-tag"><RefreshCw size={14}/>{due.length} due for review</span></div>
          {reviewId?(()=>{const lesson=lessons.find(l=>l.id===reviewId)!;return <div className="review-session panel"><button className="text-button" onClick={()=>{setReviewId(null);setReviewRevealed(false);}}><ArrowLeft size={14}/>Back to reviews</button><p className="eyebrow">RECALL LESSON {num(lesson.id)}</p><h2>{lesson.title}</h2><div className="recall-prompt"><CircleHelp size={23}/><div><strong>Before revealing the lesson…</strong><p>Explain the main idea without notes. Can you work a tiny example and label its units?</p></div></div>{!reviewRevealed?<button className="button button-primary" onClick={()=>setReviewRevealed(true)}>I&apos;ve tried — reveal the lesson<ChevronDown size={15}/></button>:<><Markdown content={lesson.body} onFileLink={fileLink}/><div className="review-actions"><p>How did recall go? Choose honestly so your next review comes at a useful time.</p><div className="button-row"><button className="button button-secondary" disabled={!!busy} onClick={()=>review(false)}><RefreshCw size={16}/>Needs more practice</button><button className="button button-primary" disabled={!!busy} onClick={()=>review(true)}><Check size={16}/>I remembered it</button></div></div></>}</div>;})():due.length?<div className="panel review-list">{due.map(p=>{const lesson=lessons.find(l=>l.id===p.lessonId);if(!lesson)return null;return <button className="review-row" key={p.lessonId} onClick={()=>{setReviewId(p.lessonId);setReviewRevealed(false);}}><span className="lesson-number">{num(p.lessonId)}</span><span><strong>{lesson.title}</strong><small>Review {p.reviewCount+1} · A few minutes of recall</small></span><span className="tag">Ready to revisit</span><ArrowRight size={17}/></button>;})}</div>:<Empty icon={Sprout} title={completed.size?"You're all caught up.":"Your first review starts with a lesson."} text={completed.size?"New reviews will appear when they're due. You can keep learning or revisit a completed lesson in the course.":"Complete a lesson and we'll bring it back for recall. Reviews start the following day."}><button className="button button-primary" onClick={()=>nextLesson?openLesson(nextLesson.id):go("course")}>{completed.size?"Keep learning":"Start with lesson 01"}<ArrowRight size={15}/></button></Empty>}
          <div className="bottom-guide"><RefreshCw size={23}/><div><strong>Recognition is easier than recall.</strong><p>Try first, then reveal. Reviews grow from 1 to 3, 7, 14, and 30 days when you remember an idea.</p></div></div>
        </>}

        {view==="notebook"&&<>
          <div className="page-heading"><div><p className="eyebrow">YOUR UNDERSTANDING, IN YOUR WORDS</p><h1>A notebook for your discoveries.</h1><p>Keep your explanations, first attempts, and questions together.</p></div>{data&&<a className="button button-secondary" href="/api/export?format=json" download><ArrowDownToLine size={16}/>Export my learning</a>}</div>
          {(data?.notes.filter(n=>n.content.trim()).length??0)===0?<Empty icon={NotebookPen} title="Your notebook is a blank page." text="Every lesson has a place for your own words. Write an explanation, try the question, or save something you want to ask."><button className="button button-primary" onClick={()=>openLesson(nextLesson?.id??1)}>Open a lesson<ArrowRight size={15}/></button></Empty>:<div className="notebook-grid">{data?.notes.filter(n=>n.content.trim()).map(note=>{const lesson=lessons.find(l=>l.id===note.lessonId);return <section className="panel notebook-entry" key={note.lessonId}><div className="section-row"><p className="eyebrow">LESSON {num(note.lessonId)}</p><button className="text-button" onClick={()=>openLesson(note.lessonId)}>Open lesson<ArrowRight size={13}/></button></div><h2>{lesson?.title}</h2><p className="note-date">Saved {new Date(note.updatedAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric",timeZone:data.profile.timezone})}</p><p className="saved-note-text">{note.content}</p></section>;})}</div>}
        </>}

        {view==="practice"&&<><div className="page-heading"><div><p className="eyebrow">A PLACE TO ASK “WHAT IF?”</p><h1>See the idea take shape.</h1><p>Explore a simple payoff with imaginary numbers. Start after lesson 24.</p></div><span className="outlined-tag"><FlaskConical size={14}/>No real-money trading</span></div><PayoffLab/></>}

        {view==="resources"&&<>
          {selectedResource?(()=>{const resource=library.find(r=>r.file===selectedResource);return <><button className="text-button back-resource" onClick={closeResource}><ArrowLeft size={15}/>Resource library</button>{resourceLoading?<div className="panel empty-state" role="status"><LoaderCircle size={24} className="spin"/><p>Opening your reference…</p></div>:resource?.body!==undefined?<article className="panel resource-article"><Markdown content={resource.body} onFileLink={fileLink}/></article>:<Empty icon={FileText} title="This resource is available in the course files" text="Open the source document to read the full reference."><a className="button button-secondary" href={`/api/resources?file=${encodeURIComponent(selectedResource)}&download=1`} target="_blank" rel="noreferrer">Open document<ExternalLink size={14}/></a></Empty>}</>;})():<><div className="page-heading"><div><p className="eyebrow">LOOK A LITTLE DEEPER</p><h1>Good sources. Clear explanations.</h1><p>Keep these references nearby. Read only what helps your current lesson.</p></div></div><div className="resource-feature panel"><span className="resource-feature-icon"><ShieldCheck size={31}/></span><div><p className="eyebrow">UNDERSTANDING YOU CAN CHECK</p><h2>Built on the mechanics, not the hype.</h2><p>Lessons draw on SEC, OCC/OIC, FINRA, and exchange materials. The source library and verification report show the evidence and the limits.</p></div><button className="button button-secondary" onClick={()=>openResource("SOURCES.md")}>Explore sources<ArrowRight size={15}/></button></div><label className="resource-search search-field"><Search size={17}/><span className="sr-only">Search resources</span><input placeholder="Search the library…" value={resourceSearch} onChange={e=>setResourceSearch(e.target.value)}/></label><div className="resource-grid">{library.filter(r=>(r.title+" "+r.file).toLowerCase().includes(resourceSearch.toLowerCase())).map((resource,i)=>{const Icon=/source|verification/i.test(resource.file)?ShieldCheck:/glossary/i.test(resource.file)?BookOpen:/workbook|math/i.test(resource.file)?NotebookPen:FileText;return <button className="panel resource-card" key={resource.file} onClick={()=>openResource(resource.file)}><span className={`module-icon module-color-${i%4}`}><Icon size={21}/></span><h3>{resource.title}</h3><span className="text-button">Open reference<ArrowRight size={14}/></span></button>;})}</div>{!library.some(r=>(r.title+" "+r.file).toLowerCase().includes(resourceSearch.toLowerCase()))&&<Empty icon={Search} title="No matching references" text="Try sources, glossary, risk, or math."/>}<section className="resource-download"><div><h3>Keep the teaching files with you</h3><p>Download the course, workbook, references, and Python labs for offline study.</p></div><a className="button button-secondary" href="/downloads/options-course.zip" download><ArrowDownToLine size={15}/>Download the course · ZIP</a></section><div className="primary-sources"><h3>Go straight to the primary source</h3><div><a href="https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-63" target="_blank" rel="noopener noreferrer">SEC · Options introduction<ExternalLink size={14}/></a><a href="https://www.optionseducation.org/" target="_blank" rel="noopener noreferrer">OCC / OIC · Options education<ExternalLink size={14}/></a><a href="https://www.finra.org/investors/insights/trading-options-understanding-assignment" target="_blank" rel="noopener noreferrer">FINRA · Exercise & assignment<ExternalLink size={14}/></a></div></div></>}
        </>}

        {view==="settings"&&<>
          <div className="page-heading"><div><p className="eyebrow">MAKE SPACE FOR LEARNING</p><h1>Your pace is the right pace.</h1><p>A small, repeatable habit is enough to get started.</p></div></div><div className="settings-layout"><section className="panel settings-panel"><h2>Your daily intention</h2><p>This is a study preference, not a deadline or a reminder schedule.</p><fieldset><legend>How much time would you like to set aside?</legend><div className="pace-options">{[5,10,15,20,30].map(value=><button type="button" className={dailyMinutes===value?"selected":""} key={value} onClick={()=>setDailyMinutes(value)} aria-pressed={dailyMinutes===value}><strong>{value}</strong><span>minutes</span></button>)}</div></fieldset><label htmlFor="timezone-setting">Your time zone</label><select id="timezone-setting" value={timezone} onChange={e=>setTimezone(e.target.value)}>{Array.from(new Set([timezone,"America/Phoenix","America/Los_Angeles","America/Denver","America/Chicago","America/New_York","Europe/London","Europe/Paris","Asia/Kolkata","Asia/Singapore","Australia/Sydney","UTC"])).map(zone=><option key={zone} value={zone}>{zone.replaceAll("_"," ")}</option>)}</select><p className="fine-print">Used to display dates in your learning record.</p><button className="button button-primary" disabled={!data||!!busy} onClick={async()=>{const ok=await mutate("settings","/api/profile",{dailyMinutes,timezone},"PUT");if(ok)setNotice({text:"Your learning preferences are saved.",kind:"success"});}}>{busy==="settings"?<LoaderCircle className="spin" size={16}/>:<Check size={16}/>}Save preferences</button>{!data&&<p className="fine-print"><a href="/signin-with-chatgpt?return_to=%2F" target="_top">Sign in</a> to save preferences and learning progress.</p>}</section><div><section className="panel account-panel"><span className="panel-icon"><LockKeyhole size={20}/></span><h2>Your learning belongs to you.</h2><p>Progress, notes, and checkpoint attempts are saved to your signed-in learning account.</p>{data?<><div className="account-details"><strong>{data.user.name||"Learner"}</strong><span>{data.user.email}</span></div><div className="export-links"><a href="/api/export?format=json" download><ArrowDownToLine size={15}/>Export full record · JSON</a><a href="/api/export?format=csv" download><ArrowDownToLine size={15}/>Export progress · CSV</a></div></>:<a className="button button-secondary" href="/signin-with-chatgpt?return_to=%2F" target="_top">Sign in with ChatGPT<ArrowRight size={15}/></a>}</section><div className="reader-tip"><Sprout size={21}/><h3>Taking longer is allowed.</h3><p>You can reread a lesson, repeat a question, or take a day off. The course moves forward when your understanding does.</p></div></div></div>
        </>}
        <footer className="app-footer"><span><span className="footer-mark">f.</span>First principles. Lasting understanding.</span><span>U.S. listed options · Education & simulation</span></footer>
      </main>
    </div>
  </div>;
}

function ArrowUpIndicator(){return <ArrowRight size={15}/>;}
function Empty({icon:Icon,title,text,children}:{icon:typeof BookOpen;title:string;text:string;children?:React.ReactNode}) {return <section className="panel empty-state"><span className="empty-icon"><Icon size={30}/></span><h2>{title}</h2><p>{text}</p>{children}</section>;}
