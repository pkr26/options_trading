"use client";

import { DEFAULT_STUDY_ZONE,formatStudyTime } from "@/lib/study-time";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDownToLine, ArrowRight, BookOpen, CheckCircle2, ChevronRight, ClipboardList, Clock3, FileText, FlaskConical, GraduationCap, Lightbulb, LoaderCircle, MessageSquare, RefreshCw, Save, Search, ShieldCheck, Target } from "lucide-react";
import graduateContent from "@/content/graduate.json";
import { MEMO_FIELD_LIMIT, MEMO_REQUIRED_MIN, memoLength, memoReady } from "@/lib/memo-limits";
import { competencyIds } from "@/lib/graduate-types";
import type { CompetencyId, GraduateAnswer, GraduateModule, GraduatePracticeAttempt, GraduatePracticeQuestion, GraduateState, GraduateSubmission } from "@/lib/graduate-types";
import type { TeachingState, RecordedReview } from "@/lib/teaching-types";
import Markdown from "./markdown";
import GraduateLabs from "./graduate-labs";
import TeachingStudio from "./teaching-studio";
import PortfolioResearchLabs from "./portfolio-research-labs";
import CapstoneArtifacts from "./capstone-artifacts";
import "./graduate-course.css";

const curriculum = graduateContent as GraduateModule[];
const labels: Record<CompetencyId, string> = { contracts: "Contracts & operations", valuation: "Valuation & models", execution: "Execution & liquidity", risk: "Portfolio risk", research: "Research & evidence", communication: "Decision communication" };
const fields: { key: keyof GraduateAnswer; title: string; help: string }[] = [
  { key: "recommendation", title: "Your initial recommendation", help: "State the objective, the action you recommend, and the strongest alternative. Commit your view before opening the update." },
  { key: "analysis", title: "Analysis and supporting calculations", help: "Show inputs, units, assumptions, alternatives, and enough working for another reader to reproduce your conclusion." },
  { key: "risks", title: "Risks and uncertainty", help: "Explain cash and position obligations, execution limits, missing information, and what would change your mind." },
  { key: "revision", title: "Your response to the update", help: "After the new information, explain what you would change or retain and why. Preserve your initial recommendation above." },
  { key: "reflection", title: "Defense, reflection, and reviewer notes", help: "Answer the defense prompts, identify the weakest assumption, and record feedback or corrections. Name a reviewer only when a review actually occurred." },
];
const blankAnswer = (): GraduateAnswer => ({ recommendation: "", analysis: "", risks: "", revision: "", reflection: "" });
type Pane = "program" | "seminar" | "case" | "practice" | "labs" | "evidence" | "teaching";
const panes = [
  { id: "program", name: "Program", icon: GraduationCap },
  { id: "seminar", name: "Classroom", icon: BookOpen },
  { id: "case", name: "Case studio", icon: ClipboardList },
  { id: "practice", name: "Fresh practice", icon: Target },
  { id: "teaching", name: "Teaching studio", icon: Lightbulb },
  { id: "labs", name: "Scenario labs", icon: FlaskConical },
  { id: "evidence", name: "My evidence", icon: FileText },
] as const;

type ApiFailure = Error & { status?: number };
async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  const value = await response.json();
  if (!response.ok) {
    const detail = value && typeof value === "object" && "error" in value && typeof value.error === "string" ? value.error : "Your learning record could not be loaded. Please try again.";
    const error: ApiFailure = new Error(detail);
    error.status = response.status;
    throw error;
  }
  return value as T;
}
const ordered = (items: GraduateSubmission[]) => [...items].sort((a, b) => b.revision - a.revision);
const number = (value: number) => Number.isInteger(value) ? String(value) : String(Number(value.toFixed(5)));
function readLocation() {
  const match = window.location.hash.match(/^#advanced\/module\/(\d+)(?:\/(program|seminar|case|practice|labs|evidence|teaching))?$/);
  return match && curriculum.some(module => module.id === Number(match[1])) ? { moduleId: Number(match[1]), pane: (match[2] ?? "seminar") as Pane } : null;
}

function MarkdownText({ body, onFileLink }: { body: string; onFileLink?: (file: string) => void }) {
  return <Markdown content={body} onFileLink={onFileLink} />;
}

export default function GraduateCourse({ onResource, onDirtyChange, timezone=DEFAULT_STUDY_ZONE }: { timezone?: string; onResource?: (file: string) => void; onDirtyChange?: (dirty: boolean) => void }) {
  const stamp=(iso:string)=>formatStudyTime(iso,timezone);
  const [pane, setPane] = useState<Pane>("program");
  const [selectedId, setSelectedId] = useState(10);
  const [search, setSearch] = useState("");
  const [record, setRecord] = useState<GraduateState>({ submissions: [], practice: [] });
  const [teachingEvidence,setTeachingEvidence]=useState<TeachingState|null>(null);
  const [loaded, setLoaded] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [drafts, setDrafts] = useState<Record<number, GraduateAnswer>>({});
  const [baseRevisions, setBaseRevisions] = useState<Record<number, number>>({});
  const [conflictId, setConflictId] = useState<number | null>(null);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [previewed, setPreviewed] = useState<number[]>([]);
  const [debriefs, setDebriefs] = useState<number[]>([]);
  const [visited, setVisited] = useState<number[]>([]);
  const [practice, setPractice] = useState<{ moduleId: number; sequence: number; questions: GraduatePracticeQuestion[] } | null>(null);
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, string>>({});
  const [practiceResult, setPracticeResult] = useState<GraduatePracticeAttempt | null>(null);
  const [hints, setHints] = useState<string[]>([]);
  const practiceModule = useRef(10);
  const practiceRequest = useRef(0);
  const changePracticeModule = useCallback((id: number) => {
    if (practiceModule.current === id) return;
    practiceModule.current = id;
    practiceRequest.current++;
    setPractice(null);
    setPracticeResult(null);
    setPracticeAnswers({});
    setHints([]);
    setBusy(current => current === "practice" || current === "grade" ? "" : current);
  }, []);
  const [reviewPrompt, setReviewPrompt] = useState(0);
  const [reviewResponse, setReviewResponse] = useState("");
  const [rehearsals, setRehearsals] = useState<Record<number, { prompt: number; response: string }>>({});

  const refresh = useCallback(async () => {
    try {
      const state = await api<GraduateState>("/api/graduate");
      setRecord(state); setSignedIn(true); setLoaded(true);
      return state;
    } catch (error) {
      if ((error as ApiFailure).status === 401) { setSignedIn(false); setLoaded(true); return null; }
      setMessage({ text: (error as Error).message, error: true }); setLoaded(false);
      return null;
    }
  }, []);
  useEffect(() => {
    let active = true;
    queueMicrotask(() => { if (active) void refresh(); });
    return () => { active = false; };
  }, [refresh]);
  useEffect(() => {
    function restore() {
      const location = readLocation();
      if (location) { changePracticeModule(location.moduleId); setSelectedId(location.moduleId); setPane(location.pane); }
    }
    const frame = window.requestAnimationFrame(restore);
    window.addEventListener("hashchange", restore);
    return () => { window.cancelAnimationFrame(frame); window.removeEventListener("hashchange", restore); };
  }, [changePracticeModule]);
  const dirty = Object.keys(drafts).length > 0 || reviewResponse.trim().length > 0 || Object.values(rehearsals).some(item => item.response.trim().length > 0) || (!!practice && !practiceResult && Object.values(practiceAnswers).some(value => value.trim()));
  useEffect(() => { onDirtyChange?.(dirty); }, [dirty, onDirtyChange]);
  useEffect(() => {
    if (!dirty) return;
    const beforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty]);

  const selected = curriculum.find(module => module.id === selectedId) ?? curriculum[0];
  const submissions = ordered(record.submissions.filter(item => item.moduleId === selected.id));
  const latest = submissions[0];
  const answer = drafts[selected.id] ?? latest?.answers ?? blankAnswer();
  const hasLocalEdits = drafts[selected.id] !== undefined;
  const hasCommitment = submissions.some(item => item.kind === "submission");
  const updateVisible = revealed.includes(selected.id);
  const debriefVisible = debriefs.includes(selected.id);
  const submittedModules = new Set(record.submissions.filter(item => item.kind === "submission").map(item => item.moduleId));
  const recordedReviews=(teachingEvidence?.events.filter(event=>event.kind==="review").map(event=>event.payload as RecordedReview))??[];
  const selectedPractice = record.practice.filter(item => item.moduleId === selected.id).sort((a, b) => b.sequence - a.sequence);
  const retentionChecks = curriculum.flatMap(module => {
    const attempts = record.practice.filter(item => item.moduleId === module.id).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    if (!attempts.length) return [];
    const first = attempts[0];
    const later = attempts.find(item => Date.parse(item.createdAt) - Date.parse(first.createdAt) >= 7 * 86400000);
    return [{ module, first, later }];
  });
  const mistakes = useMemo(() => record.practice.flatMap(attempt => attempt.feedback.filter(item => !item.correct).map(item => ({ ...item, attempt }))).sort((a, b) => b.attempt.createdAt.localeCompare(a.attempt.createdAt)), [record.practice]);

  function navigate(next: Pane) {
    setPane(next); setMessage(null);
    if(next === "teaching")window.dispatchEvent(new Event("teaching:refresh"));
    window.history.replaceState(null, "", `#advanced/module/${selectedId}/${next}`);
    window.requestAnimationFrame(() => document.getElementById("graduate-heading")?.focus({ preventScroll: true }));
  }
  function selectModule(id: number, next?: Pane) {
    if (id !== selectedId && practice && !practiceResult && Object.values(practiceAnswers).some(value => value.trim()) && !window.confirm("This calculation set has unsaved answers. Leave this practice set and discard those answers? Your decision memo drafts will remain available in this session.")) return;
    setRehearsals(previous => ({ ...previous, [selectedId]: { prompt: reviewPrompt, response: reviewResponse } }));
    changePracticeModule(id); setSelectedId(id); setReviewPrompt(rehearsals[id]?.prompt ?? 0); setReviewResponse(rehearsals[id]?.response ?? ""); setMessage(null);
    if (next) setPane(next);
    window.history.replaceState(null, "", `#advanced/module/${id}/${next ?? pane}`);
    window.requestAnimationFrame(() => document.getElementById("graduate-heading")?.focus({ preventScroll: true }));
  }
  function edit(key: keyof GraduateAnswer, value: string) {
    const id = selected.id;
    setBaseRevisions(previous => previous[id] === undefined ? { ...previous, [id]: latest?.revision ?? 0 } : previous);
    setDrafts(previous => ({ ...previous, [id]: { ...(previous[id] ?? latest?.answers ?? blankAnswer()), [key]: value } }));
  }
  async function save(kind: "draft" | "submission", revealAfter = false) {
    const id = selected.id;
    const payload = { ...answer };
    const expectedRevision = baseRevisions[id] ?? latest?.revision ?? 0;
    setBusy("save"); setMessage(null);
    try {
      const result = await api<{ submission: GraduateSubmission }>("/api/graduate", { method: "PUT", body: JSON.stringify({ moduleId: id, expectedRevision, kind, answers: payload }) });
      setRecord(previous => ({ ...previous, submissions: [...previous.submissions, result.submission] }));
      window.dispatchEvent(new Event("graduate:evidence-changed"));
      setBaseRevisions(previous => ({ ...previous, [id]: result.submission.revision }));
      setDrafts(previous => { const next = { ...previous }; delete next[id]; return next; });
      setConflictId(null);
      if (revealAfter) setRevealed(previous => [...new Set([...previous, id])]);
      setMessage({ text: kind === "draft" ? "Draft saved to your private learning record." : `Submission ${result.submission.revision} saved. Your previous versions remain in the evidence history.`, error: false });
    } catch (error) {
      if ((error as ApiFailure).status === 409) { setConflictId(id); await refresh(); }
      if ((error as ApiFailure).status === 401) setSignedIn(false);
      setMessage({ text: (error as Error).message, error: true });
    } finally { setBusy(""); }
  }
  async function startPractice() {
    const request = ++practiceRequest.current;
    setBusy("practice"); setMessage(null);
    try {
      const value = await api<{ moduleId: number; sequence: number; questions: GraduatePracticeQuestion[] }>(`/api/graduate/practice?moduleId=${selected.id}`);
      if (request !== practiceRequest.current) return;
      if (value.moduleId !== selected.id) throw new Error("The returned practice set belongs to another module. Request this set again.");
      setPractice(value); setPracticeResult(null); setPracticeAnswers({}); setHints([]);
    } catch (error) {
      if (request !== practiceRequest.current) return;
      if ((error as ApiFailure).status === 401) setSignedIn(false);
      setMessage({ text: (error as Error).message, error: true });
    } finally { if (request === practiceRequest.current) setBusy(""); }
  }
  async function submitPractice() {
    if (!practice || practice.moduleId !== practiceModule.current) return;
    const request = ++practiceRequest.current;
    setBusy("grade"); setMessage(null);
    try {
      const result = await api<{ attempt: GraduatePracticeAttempt }>("/api/graduate/practice", { method: "POST", body: JSON.stringify({ moduleId: practice.moduleId, sequence: practice.sequence, answers: Object.fromEntries(Object.entries(practiceAnswers).map(([key, value]) => [key, Number(value)])) }) });
      if (result.attempt.moduleId !== practice.moduleId || result.attempt.sequence !== practice.sequence) throw new Error("The saved result does not match the issued practice set.");
      if (request === practiceRequest.current) setPracticeResult(result.attempt);
      setRecord(previous => ({ ...previous, practice: [...previous.practice, result.attempt] }));
      window.dispatchEvent(new Event("graduate:evidence-changed"));
    } catch (error) { if (request === practiceRequest.current) setMessage({ text: (error as Error).message, error: true }); }
    finally { if (request === practiceRequest.current) setBusy(""); }
  }
  const practiceReady = !!practice && practice.questions.every(question => practiceAnswers[question.id]?.trim() && Number.isFinite(Number(practiceAnswers[question.id])));
  const overMemoLimit=fields.some(field=>memoLength(answer[field.key])>MEMO_FIELD_LIMIT);
  const initialReady = memoReady(answer) && !overMemoLimit;

  return <div className="graduate-course">
    <header className="graduate-hero">
      <div><p className="eyebrow"><GraduationCap size={15} /> ADVANCED OPTIONS PROGRAM</p><h1 id="graduate-heading" tabIndex={-1}>Learn to make a defensible decision.</h1><p>Study the theory, test the numbers, and explain your judgment. A rigorous pathway through options, portfolio risk, and research.</p></div>
      <div className="graduate-hero-mark" aria-hidden="true"><GraduationCap size={48} /><span>THINK · TEST · DEFEND</span></div>
    </header>
    <nav className="graduate-tabs" aria-label="Advanced course sections">{panes.map(({ id, name, icon: Icon }) => <button key={id} type="button" aria-current={pane === id ? "page" : undefined} className={pane === id ? "selected" : ""} onClick={() => navigate(id)}><Icon size={17} />{name}</button>)}</nav>
    {message && <div className={`graduate-notice${message.error ? " graduate-notice-error" : ""}`} role={message.error ? "alert" : "status"}><p>{message.text}</p><button type="button" className="text-button" onClick={() => setMessage(null)}>Dismiss</button></div>}
    {!loaded && <div className="graduate-record-status"><p>Your saved evidence is loading or unavailable. Course reading remains available.</p><button type="button" className="text-button" onClick={() => void refresh()}><RefreshCw size={14} />Reload saved evidence</button></div>}
    {loaded && !signedIn && <div className="graduate-record-status"><p>Explore the teaching and cases freely. Sign in to save submissions, use fresh graded practice, and build your evidence portfolio.</p><a className="button button-small button-secondary" href="/signin-with-chatgpt?return_to=%2F" target="_top">Sign in with ChatGPT</a></div>}

    {pane === "program" && <>
      <div className="graduate-stats"><div><strong>{curriculum.length}</strong><span>Advanced teaching modules</span></div><div><strong>{submittedModules.size}</strong><span>Modules with submitted work</span></div><div><strong>{record.practice.length}</strong><span>Saved calculation checks</span></div></div>
      <section className="graduate-feature panel"><div><p className="eyebrow">START WITH A COMPLETE SEMINAR</p><h2>The portfolio committee has a decision to make.</h2><p>Module 10 brings objectives, alternatives, costs, and uncertainty together. Work through a staged case, submit your recommendation, and defend the tradeoffs.</p><button type="button" className="button button-primary" onClick={() => selectModule(10, "seminar")}>Enter the Trade Design classroom<ArrowRight size={15} /></button></div><div className="graduate-feature-side"><ClipboardList size={30} /><strong>A decision before the outcome.</strong><p>First record what you know. Then consider new information and revise your view.</p></div></section>
      <div className="graduate-program-heading"><div><p className="eyebrow">YOUR ADVANCED PATHWAY</p><h2>Build the foundation. Then investigate.</h2><p>Prerequisites guide preparation. You can preview every module and return to a bridge lesson whenever needed.</p></div><label className="graduate-search"><Search size={16} /><span className="sr-only">Search advanced modules</span><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Find a module or skill" /></label></div>
      {[...new Set(curriculum.map(module => module.stage))].map(stage => {
        const matches = curriculum.filter(module => module.stage === stage && `${module.title} ${module.objective} ${module.competencies.join(" ")}`.toLowerCase().includes(search.toLowerCase()));
        if (!matches.length) return null;
        return <section className="graduate-stage" key={stage}><h3>{stage}</h3><div className="graduate-module-grid">{matches.map(module => <button type="button" className={`graduate-module-card panel${module.id === 10 ? " graduate-flagship" : ""}`} key={module.id} onClick={() => selectModule(module.id, "seminar")}><div className="graduate-card-top"><span className="graduate-module-number">{String(module.id).padStart(2, "0")}</span><span>{submittedModules.has(module.id) ? "Work submitted" : visited.includes(module.id) ? "Opened this session" : module.id === 10 ? "Flagship seminar" : "Open classroom"}</span></div><h3>{module.title}</h3><p>{module.objective}</p><div className="graduate-card-bottom"><span><Clock3 size={13} />{module.duration}</span><ChevronRight size={17} /></div></button>)}</div></section>;
      })}
      {!curriculum.some(module => `${module.title} ${module.objective} ${module.competencies.join(" ")}`.toLowerCase().includes(search.toLowerCase())) && <p className="graduate-empty">No matching modules. Try “risk”, “volatility”, or “research”.</p>}
      <section className="graduate-standard panel"><ShieldCheck size={24} /><div><h3>What counts as evidence?</h3><p>Reading, submitting work, passing a calculation check, and demonstrating retained understanding are different achievements. Written recommendations need review against the rubric. A submitted memo has not automatically passed an independent review.</p><a className="text-button graduate-download" href="/downloads/advanced-course.md" download><ArrowDownToLine size={14} />Download the advanced teaching materials</a></div></section>
    </>}

    {(pane === "seminar" || pane === "case" || pane === "practice") && <div className="graduate-module-picker"><label htmlFor="graduate-module">Current module</label><select id="graduate-module" value={selected.id} onChange={event => selectModule(Number(event.target.value))}>{curriculum.map(module => <option key={module.id} value={module.id}>{String(module.id).padStart(2, "0")} · {module.title}</option>)}</select><span className="outlined-tag">{selected.stage}</span></div>}

    {pane === "seminar" && <div className="graduate-classroom"><article className="graduate-reading panel"><p className="eyebrow">MODULE {String(selected.id).padStart(2, "0")} · CLASSROOM</p><h2>{selected.title}</h2><p className="graduate-objective">{selected.objective}</p><div className="graduate-chips">{selected.competencies.map(skill => <span className="tag" key={skill}>{labels[skill]}</span>)}</div>{selected.prerequisites.length > 0 && <p className="graduate-prerequisites">Prepare with {selected.prerequisites.map((id, index) => <span key={id}>{index > 0 ? ", " : ""}<button type="button" className="text-link" onClick={() => selectModule(id)}>Module {id}</button></span>)}. Previewing is always available.</p>}
        <div className="graduate-learning-loop"><Lightbulb size={20} /><p>Predict before calculating. Explain the units. Try the problem before revealing its solution. Keep the original answer when you make a correction.</p></div>
        {selected.sections.map((section, index) => <details className="graduate-lecture" key={`${selected.id}-${section.id}`} open={index === 0}><summary><span>{String(index + 1).padStart(2, "0")}</span>{section.title}</summary><div><MarkdownText body={section.body} onFileLink={onResource} /></div></details>)}
        <div className="button-row"><button type="button" className="button button-secondary" onClick={() => { setVisited(previous => [...new Set([...previous, selected.id])]); setMessage({ text: "Marked as opened for this session. Independent work and later checks provide separate evidence of understanding.", error: false }); }}><BookOpen size={15} />Mark opened this session</button><button type="button" className="button button-primary" onClick={() => navigate("case")}>Apply this in the case studio<ArrowRight size={15} /></button></div>
      </article><aside className="graduate-classroom-aside"><section className="graduate-aside-card panel"><p className="eyebrow">YOUR DELIVERABLE</p><h3>{selected.caseStudy.title}</h3><p>{selected.assignment.prompt}</p><ul>{selected.assignment.deliverables.map(item => <li key={item}>{item}</li>)}</ul><button type="button" className="text-button" onClick={() => navigate("case")}>Prepare your submission<ArrowRight size={14} /></button></section><section className="graduate-aside-card panel"><p className="eyebrow">PRIMARY REFERENCES</p><ul>{selected.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}<span className="sr-only"> (opens in a new tab)</span></a></li>)}</ul>{onResource && <button type="button" className="text-button" onClick={() => onResource(selected.sourceFile)}>Open the original teaching volume<ArrowRight size={14} /></button>}</section></aside></div>}

    {pane === "case" && <>
      <section className="graduate-case-intro panel"><p className="eyebrow">THE DECISION CASE · FICTIONAL TEACHING DATA</p><h2>{selected.caseStudy.title}</h2><div className="graduate-case-step"><span>01</span><div><h3>Read the briefing and exhibits</h3><MarkdownText body={selected.caseStudy.brief} onFileLink={onResource} /><MarkdownText body={selected.caseStudy.exhibits} onFileLink={onResource} /></div></div><div className="graduate-decision-prompt"><Target size={21} /><MarkdownText body={selected.caseStudy.decisionPrompt} onFileLink={onResource} /></div></section>
      <div className="graduate-case-layout"><section className="graduate-writing panel"><div className="section-row"><div><p className="eyebrow">YOUR DECISION MEMO</p><h2>Write the reasoning.</h2></div><span className="outlined-tag">{hasLocalEdits ? "Unsaved edits" : latest ? `Saved revision ${latest.revision}` : "New work"}</span></div><p className="graduate-writing-intro">Your initial answer matters. Save it before the case update, then create a later submission to show how your thinking developed.</p>
        {fields.filter(field => updateVisible || (field.key !== "revision" && field.key !== "reflection")).map(field => <label className="graduate-answer-field" key={field.key}><strong>{field.title}</strong><span>{field.help}</span><textarea value={answer[field.key]} aria-invalid={memoLength(answer[field.key])>MEMO_FIELD_LIMIT || undefined} rows={field.key === "analysis" ? 8 : 5} onChange={event => edit(field.key, event.target.value)} disabled={busy === "save"} /><small>{memoLength(answer[field.key]).toLocaleString("en-US")} / {MEMO_FIELD_LIMIT.toLocaleString("en-US")} characters</small></label>)}
        {conflictId === selected.id && <div className="graduate-conflict" role="alert"><h3>A newer version was saved.</h3><p>Your edits are still here. Compare them with the saved versions below. After reviewing, choose which version to keep.</p><div className="button-row"><button type="button" className="button button-secondary" onClick={() => { setBaseRevisions(previous => ({ ...previous, [selected.id]: latest?.revision ?? 0 })); setConflictId(null); setMessage({ text: "Your edits will be saved as a new version after the latest saved revision.", error: false }); }}>Keep my edits for the next revision</button><button type="button" className="text-button" onClick={() => { setDrafts(previous => { const next = { ...previous }; delete next[selected.id]; return next; }); setBaseRevisions(previous => ({ ...previous, [selected.id]: latest?.revision ?? 0 })); setConflictId(null); }}>Use the latest saved version</button></div></div>}
        {overMemoLimit&&<p role="alert">A memo field exceeds {MEMO_FIELD_LIMIT.toLocaleString("en-US")} characters. Shorten it to save the draft or submit.</p>}
        <div className="button-row"><button type="button" className="button button-secondary" disabled={!loaded || !signedIn || !!busy || overMemoLimit || conflictId === selected.id} onClick={() => void save("draft")}><Save size={15} />Save draft</button><button type="button" className="button button-primary" disabled={!loaded || !signedIn || !!busy || !initialReady || conflictId === selected.id} onClick={() => void save("submission", !updateVisible)}>{busy === "save" ? <LoaderCircle size={15} className="spin" /> : <CheckCircle2 size={15} />}{updateVisible ? "Submit this revision" : "Commit initial answer & reveal update"}</button></div><p className="graduate-caption">Write at least {MEMO_REQUIRED_MIN} characters in each of the recommendation, analysis and risk fields, excluding surrounding spaces. The minimum and field counters use Unicode code points. A reviewer uses the rubric to assess the reasoning.</p>
      </section><aside className="graduate-case-aside"><section className="graduate-aside-card panel"><p className="eyebrow">A GUIDED DEFENSE</p><h3>Prepare to be challenged.</h3><ol>{selected.caseStudy.defense.map(prompt => <li key={prompt}>{prompt}</li>)}</ol><p className="graduate-caption">Use these prompts with a peer, tutor, or independent reviewer. Record the actual response and feedback in your reflection.</p></section><section className="graduate-aside-card panel"><p className="eyebrow">EVALUATION STANDARD</p>{selected.caseStudy.rubric.map(item => <div className="graduate-rubric-item" key={item.dimension}><strong>{item.dimension}</strong><p>{item.excellent}</p></div>)}<p className="graduate-caption">Written work is saved for review. The app does not infer an academic grade from the length of a response.</p></section></aside></div>
      <section className="graduate-update panel"><div className="graduate-case-step"><span>02</span><div><h2>New information arrives.</h2>{updateVisible ? <><MarkdownText body={selected.caseStudy.update} onFileLink={onResource} /><p className="graduate-caption">{previewed.includes(selected.id) ? "Preview mode: the update was opened without a saved initial commitment. Treat subsequent work as informed practice." : "Your saved versions let you compare the initial recommendation with your later response."}</p><button type="button" className="text-button" onClick={() => document.querySelector<HTMLTextAreaElement>(".graduate-answer-field:nth-last-of-type(2) textarea")?.focus()}>Return to your response above<ArrowRight size={14} /></button></> : <><p>Save your initial recommendation to reveal the update and open the revision fields.</p>{hasCommitment && <button type="button" className="button button-primary" onClick={() => setRevealed(previous => [...new Set([...previous, selected.id])])}>Open update for my saved case<ArrowRight size={15} /></button>}<button type="button" className="text-button graduate-preview" onClick={() => { setRevealed(previous => [...new Set([...previous, selected.id])]); setPreviewed(previous => [...new Set([...previous, selected.id])]); }}>Preview update without a saved commitment</button><p className="graduate-caption">Preview is available for exploration. It does not establish an unseen assessment.</p></>}</div></div></section>
      {updateVisible && <section className="graduate-debrief panel"><div className="graduate-case-step"><span>03</span><div><h2>Debrief the decision.</h2><p>Write your revision before opening the analysis. Compare the reasoning and assumptions, then identify the correction you will carry into another case.</p><button type="button" className="button button-secondary" onClick={() => setDebriefs(previous => previous.includes(selected.id) ? previous.filter(id => id !== selected.id) : [...previous, selected.id])}>{debriefVisible ? "Hide debrief" : "Reveal debrief and annotated submissions"}<ChevronRight size={15} /></button></div></div>{debriefVisible && <div className="graduate-debrief-content"><MarkdownText body={selected.caseStudy.debrief} onFileLink={onResource} /><h3>Compare the quality of the reasoning</h3>{selected.caseStudy.samples.map(sample => <details className="graduate-sample" key={sample.level}><summary>{sample.level}</summary><MarkdownText body={sample.body} onFileLink={onResource} /></details>)}<div className="button-row"><button type="button" className="button button-primary" onClick={() => navigate("practice")}>Try a different calculation case<ArrowRight size={15} /></button></div></div>}</section>}
      {submissions.length > 0 && <section className="graduate-history panel"><h2>Your version history</h2><p>Every saved draft and submission is retained. Open an earlier version to compare your reasoning.</p>{submissions.map(item => <details key={item.id}><summary>Revision {item.revision} · {item.kind === "draft" ? "Draft" : "Submitted work"} · {stamp(item.createdAt)}</summary><p className="graduate-caption">Content version: {item.contentVersion}</p>{fields.map(field => item.answers[field.key] ? <div className="graduate-history-answer" key={field.key}><h3>{field.title}</h3><p>{item.answers[field.key]}</p></div> : null)}</details>)}</section>}
    </>}

    {pane === "practice" && <>
      <section className="graduate-practice-intro panel"><div><p className="eyebrow">FRESH NUMERICAL PRACTICE</p><h2>Show the working. Then check it.</h2><p>Three questions use a new set of inputs with each saved attempt. Calculate independently and enter the answer in the stated unit. Feedback and mistakes become part of your evidence record.</p></div><button type="button" className="button button-primary" disabled={!loaded || !signedIn || !!busy || (!!practice && !practiceResult)} onClick={() => void startPractice()}>{busy === "practice" ? <LoaderCircle size={16} className="spin" /> : <RefreshCw size={16} />}{practiceResult ? "Start another practice set" : practice ? "Complete the current set below" : "Start a fresh practice set"}</button></section>
      {practice && <section className="graduate-practice-set"><div className="section-row"><p className="graduate-caption">Module {practice.moduleId} · Practice sequence {practice.sequence}. Numerical performance is one part of understanding; use the case rubric to examine your judgment.</p>{!practiceResult && <button type="button" className="text-button" disabled={!!busy} onClick={() => { if (window.confirm("Discard this practice set and request the current set? Your saved attempts remain in the record.")) void startPractice(); }}>Discard set and reload</button>}</div>{practice.questions.map((question, index) => {
        const feedback = practiceResult?.feedback.find(item => item.id === question.id);
        return <fieldset className={`graduate-practice-question panel${feedback ? feedback.correct ? " graduate-correct" : " graduate-incorrect" : ""}`} key={question.id}><legend><span className="eyebrow">QUESTION {index + 1} · {labels[question.skill]}</span>{question.prompt}</legend><label><span>Your answer ({question.unit})</span><input type="number" step="any" inputMode="decimal" value={practiceAnswers[question.id] ?? ""} disabled={!!practiceResult || busy === "grade"} onChange={event => setPracticeAnswers(previous => ({ ...previous, [question.id]: event.target.value }))} /></label>{!practiceResult && <button type="button" className="text-button" onClick={() => setHints(previous => [...new Set([...previous, question.id])])}><Lightbulb size={14} />Show a hint</button>}{hints.includes(question.id) && !practiceResult && <p className="graduate-hint">{question.hint}</p>}{feedback && <div className="graduate-feedback"><strong>{feedback.correct ? "Calculation correct" : "Review this calculation"}</strong><p>Your answer: {number(feedback.answer)} {feedback.unit}. Expected: {number(feedback.expected)} {feedback.unit}.</p><p>{feedback.explanation}</p></div>}</fieldset>;
      })}{!practiceResult && <div className="button-row"><button type="button" className="button button-primary" disabled={!practiceReady || !!busy} onClick={() => void submitPractice()}>{busy === "grade" ? <LoaderCircle size={15} className="spin" /> : <CheckCircle2 size={15} />}Check and save my answers</button></div>}{practiceResult && <div className="graduate-practice-result" role="status"><strong>{practiceResult.score} of {practiceResult.total} calculations correct</strong><p>Your answers and feedback are saved. Explain any correction before attempting another case.</p></div>}</section>}
      <section className="graduate-guided-review panel"><div><p className="eyebrow">EXPLAIN IT WITHOUT NOTES</p><h2>A guided oral rehearsal.</h2><p>This rehearsal supplies prompts and a self-review checklist. Your written case and independent reviewer feedback provide the durable record.</p></div>{selected.reviewQuestions.length > 0 && <><div className="graduate-rehearsal-prompt"><MessageSquare size={20} /><p>{selected.reviewQuestions[reviewPrompt % selected.reviewQuestions.length]}</p></div><label className="graduate-answer-field"><strong>Your explanation in this session</strong><textarea rows={4} maxLength={6000} value={reviewResponse} onChange={event => setReviewResponse(event.target.value)} /></label><details className="graduate-self-review"><summary>Check the quality of your explanation</summary><ul><li>Have I stated the assumptions and correct units?</li><li>Can I support the claim with a worked example?</li><li>Have I identified a limitation or counterexample?</li><li>Can another person follow the reasoning without guessing?</li></ul><p>Copy a useful explanation into your case reflection to save it. This rehearsal text is temporary.</p></details><button type="button" className="text-button" onClick={() => { if (reviewResponse.trim() && !window.confirm("Move to the next question and clear this temporary answer? Copy it into your case reflection first if you want to save it.")) return; setReviewPrompt(previous => previous + 1); setReviewResponse(""); }}>Next defense question<ArrowRight size={14} /></button></>}</section>
      {selectedPractice.length > 0 && <section className="graduate-history panel"><h2>Checks for this module</h2>{selectedPractice.map(attempt => <details key={attempt.id}><summary>Sequence {attempt.sequence} · {attempt.score}/{attempt.total} correct · {stamp(attempt.createdAt)}</summary>{attempt.feedback.map(item => <div className="graduate-history-answer" key={item.id}><h3>{item.prompt}</h3><p>Your answer: {number(item.answer)} {item.unit}. Expected: {number(item.expected)} {item.unit}.</p><p>{item.explanation}</p></div>)}</details>)}</section>}
    </>}

    <div hidden={pane !== "teaching"}><TeachingStudio timezone={timezone} onModule={moduleId => selectModule(moduleId,"seminar")} onEvidence={setTeachingEvidence}/></div>
    <div hidden={pane !== "evidence"}><CapstoneArtifacts timezone={timezone}/></div>
    {pane === "labs" && <><GraduateLabs /><PortfolioResearchLabs /></>}

    {pane === "evidence" && <>
      <section className="graduate-evidence-intro panel"><div><p className="eyebrow">A PORTFOLIO OF YOUR THINKING</p><h2>Keep the evidence behind the conclusion.</h2><p>Inspect the source and findings of each recorded review in Teaching studio. Calculation scores show performance on those questions; later cases test retention and transfer.</p></div><a className="button button-secondary" href="/api/graduate/export"><ArrowDownToLine size={16} />Export advanced evidence</a></section>
      <section className="graduate-competencies"><h2>Evidence by competency</h2><div className="graduate-competency-grid">{competencyIds.map(skill => {
        const checks = record.practice.flatMap(attempt => attempt.feedback.filter(item => item.skill === skill));
        const correct = checks.filter(item => item.correct).length;
        const writing = record.submissions.filter(item => item.kind === "submission" && curriculum.find(module => module.id === item.moduleId)?.competencies.includes(skill));
        const reviewed=writing.filter(submission=>recordedReviews.some(review=>review.submissionId===submission.id));
        const external=reviewed.filter(submission=>recordedReviews.some(review=>review.submissionId===submission.id&&review.reviewerRole==="reported_external"));
        return <article className="graduate-competency panel" key={skill}><h3>{labels[skill]}</h3><p><strong>{checks.length ? `${correct}/${checks.length}` : "No"}</strong> calculation checks correct</p><p>{writing.length} written submission{writing.length === 1 ? "" : "s"} recorded</p><p>{reviewed.length} with attributed review · {external.length} reported external</p><span>{checks.length || writing.length ? "Inspect the review source and evidence in Teaching studio" : "Begin with a related module"}</span></article>;
      })}</div></section>
      {retentionChecks.length > 0 && <section className="graduate-retention panel"><p className="eyebrow">COME BACK TO AN UNFAMILIAR CASE</p><h2>Later checks of understanding</h2><p>Plan a fresh attempt at least seven days after your first check, and revisit again around day thirty. The dates below are study suggestions. A later score is evidence on that calculation set; it does not certify mastery.</p><div className="table-scroll"><table><thead><tr><th>Module</th><th>First check</th><th>Seven-day study point</th><th>Thirty-day study point</th><th>Later evidence</th></tr></thead><tbody>{retentionChecks.map(({ module, first, later }) => <tr key={module.id}><td><button type="button" className="text-link" onClick={() => selectModule(module.id, "practice")}>{module.id}. {module.title}</button></td><td>{first.score}/{first.total}</td><td>{stamp(new Date(Date.parse(first.createdAt) + 7 * 86400000).toISOString())}</td><td>{stamp(new Date(Date.parse(first.createdAt) + 30 * 86400000).toISOString())}</td><td>{later ? `${later.score}/${later.total} recorded ≥7 days later` : "No later check recorded"}</td></tr>)}</tbody></table></div></section>}
      <section className="graduate-mistakes panel"><div className="section-row"><div><p className="eyebrow">YOUR MISTAKE JOURNAL</p><h2>Turn an error into a better explanation.</h2></div><span className="outlined-tag">{mistakes.length} recorded corrections</span></div>{mistakes.length ? mistakes.map((item, index) => <details key={`${item.attempt.id}-${item.id}-${index}`}><summary>Module {item.attempt.moduleId} · {labels[item.skill]} · {stamp(item.attempt.createdAt)}</summary><p>{item.prompt}</p><p>Your answer: <strong>{number(item.answer)} {item.unit}</strong>. Expected: <strong>{number(item.expected)} {item.unit}</strong>.</p><p>{item.explanation}</p><button type="button" className="text-button" onClick={() => selectModule(item.attempt.moduleId, "practice")}>Return to this skill<ArrowRight size={14} /></button></details>) : <p className="graduate-empty">Missed calculation questions will appear here with your original answer and the explanation.</p>}</section>
      <section className="graduate-capstone panel"><p className="eyebrow">THE INDEPENDENT RESEARCH DEFENSE</p><h2>Build toward a capstone you can defend.</h2><p>Choose the evidence level that your data actually support. Use the final modules to develop the protocol, analysis, robustness checks, portfolio stress, and defense.</p><ol>{[{ id: 21, title: "Freeze the question and method" }, { id: 22, title: "Reconcile the data and accounting" }, { id: 23, title: "Challenge the result" }, { id: 24, title: "Stress the portfolio and funding" }, { id: 25, title: "Develop a focused specialization" }, { id: 26, title: "Submit and defend the evidence bundle" }].map(item => <li key={item.id}><span className={submittedModules.has(item.id) ? "graduate-milestone-recorded" : ""}>{submittedModules.has(item.id) ? <CheckCircle2 size={18} /> : <span className="graduate-milestone-dot" />}</span><button type="button" onClick={() => selectModule(item.id, "case")}>{item.title}<small>Module {item.id} · {submittedModules.has(item.id) ? "Submission recorded; see review desk" : "Prepare evidence"}</small></button><ChevronRight size={16} /></li>)}</ol><p className="graduate-caption">An independent reviewer should challenge a model assumption, operational event, data issue, and claimed result. Record the actual review and your response in the final case reflection.</p></section>
      <section className="graduate-history panel"><h2>All written submissions</h2>{record.submissions.length ? [...record.submissions].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(item => <details key={item.id}><summary>Module {item.moduleId} · Revision {item.revision} · {item.kind} · {stamp(item.createdAt)}</summary><p className="graduate-caption">Content version: {item.contentVersion}</p>{fields.map(field => item.answers[field.key] ? <div className="graduate-history-answer" key={field.key}><h3>{field.title}</h3><p>{item.answers[field.key]}</p></div> : null)}<button type="button" className="text-button" onClick={() => selectModule(item.moduleId, "case")}>Reopen case<ArrowRight size={14} /></button></details>) : <p className="graduate-empty">Save a draft or submit a decision memo to start your evidence portfolio.</p>}</section>
    </>}
  </div>;
}
