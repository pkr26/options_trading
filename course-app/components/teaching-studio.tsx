"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDownToLine, ArrowRight, BookOpen, CheckCircle2, ClipboardCheck, Clock3, Lightbulb, LoaderCircle, MessageSquare, RefreshCw, Save, Target } from "lucide-react";
import curriculumData from "@/content/graduate.json";
import type { GraduateModule, GraduateState, GraduateSubmission } from "@/lib/graduate-types";
import type { PilotStage, PilotView, RecordedReview, TeachingEvidence, TeachingState, TutorSession, WritingFeedback } from "@/lib/teaching-types";
import ReviewCalibration from "./review-calibration";
import "./teaching-studio.css";

const curriculum = curriculumData as GraduateModule[];
const tabs = [
  { id: "tutor", label: "Adaptive tutor", icon: MessageSquare },
  { id: "feedback", label: "Writing feedback", icon: ClipboardCheck },
  { id: "review", label: "Review desk", icon: BookOpen },
  { id: "pilot", label: "Learning pilot", icon: Clock3 },
] as const;
type Tab = typeof tabs[number]["id"];
type ApiFailure = Error & { status?: number };
type VersionedPilot = PilotView & { revision?: number };
type ReviewDraft = { reviewerName: string; reviewerRole: "self" | "reported_external"; decision: "revise" | "accepted"; criteria: RecordedReview["criteria"]; challenge: string; response: string; confirmed: boolean };
const emptyState: TeachingState = { events: [], plan: { generatedAt: "", recommendations: [], summary: "Your next teaching step will use your saved work and practice history." }, pilot: { enrollment: null, schedule: [], revision: 0 } };
const stamp = (date: string) => new Date(date).toLocaleString("en-US", { timeZone: "America/Phoenix", dateStyle: "medium", timeStyle: "short" });
const moduleTitle = (id: number) => curriculum.find(item => item.id === id)?.title ?? `Module ${id}`;
const isObject = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === "object";
function tutorPayload(event: TeachingEvidence): TutorSession | null {
  const payload = isObject(event.payload) && "session" in event.payload ? event.payload.session : event.payload;
  return isObject(payload) && typeof payload.id === "string" && typeof payload.moduleId === "number" && typeof payload.phase === "string" ? payload as TutorSession : null;
}
function feedbackPayload(event: TeachingEvidence): WritingFeedback | null {
  const payload = isObject(event.payload) && "feedback" in event.payload ? event.payload.feedback : event.payload;
  return isObject(payload) && typeof payload.submissionId === "string" && Array.isArray(payload.criteria) ? payload as WritingFeedback : null;
}
function reviewPayload(event: TeachingEvidence): RecordedReview | null {
  const payload = isObject(event.payload) && "review" in event.payload ? event.payload.review : event.payload;
  return isObject(payload) && typeof payload.submissionId === "string" && typeof payload.reviewerName === "string" ? payload as RecordedReview : null;
}
async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  const value: unknown = await response.json();
  if (!response.ok) {
    const error: ApiFailure = new Error(isObject(value) && typeof value.error === "string" ? value.error : "The teaching record could not be loaded. Please try again.");
    error.status = response.status; throw error;
  }
  return value as T;
}
function newReview(submission: GraduateSubmission): ReviewDraft {
  const snapshot = (submission as GraduateSubmission & { contentSnapshot?: GraduateModule }).contentSnapshot;
  const teaching = snapshot ?? curriculum.find(item => item.id === submission.moduleId);
  return { reviewerName: "", reviewerRole: "self", decision: "revise", criteria: (teaching?.caseStudy.rubric ?? []).map(item => ({ dimension: item.dimension, score: 0, evidence: "", feedback: "" })), challenge: "", response: "", confirmed: false };
}

export default function TeachingStudio({ onModule, onEvidence }: { onModule?: (moduleId: number) => void; onEvidence?: (state: TeachingState) => void }) {
  const [tab, setTab] = useState<Tab>("tutor");
  const [record, setRecord] = useState<TeachingState>(emptyState);
  const [submissions, setSubmissions] = useState<GraduateSubmission[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState<{ error: boolean; text: string } | null>(null);
  const [selectedModule, setSelectedModule] = useState(10);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [liveSession, setLiveSession] = useState<TutorSession | null>(null);
  const [tutorAnswer, setTutorAnswer] = useState("");
  const [selectedSubmissionId, setSelectedSubmissionId] = useState("");
  const [feedback, setFeedback] = useState<WritingFeedback | null>(null);
  const [reviewDrafts, setReviewDrafts] = useState<Record<string, ReviewDraft>>({});
  const [pilot, setPilot] = useState<VersionedPilot | null>(null);
  const [pilotAnswers, setPilotAnswers] = useState<Record<string, string>>({});
  const [pilotMinutes, setPilotMinutes] = useState("");
  const [pilotClarity, setPilotClarity] = useState("3");
  const [pilotConfidence,setPilotConfidence]=useState("");
  const [pilotAssistance,setPilotAssistance]=useState("");
  const [priorExperience,setPriorExperience]=useState("");
  const [pilotConsent,setPilotConsent]=useState(false);
  const [pilotConflict, setPilotConflict] = useState(false);
  const loadRevision = useRef(0);

  const reload = useCallback(async () => {
    const requestRevision = ++loadRevision.current;
    try {
      const [teaching, graduate] = await Promise.all([api<TeachingState>("/api/teaching"), api<GraduateState>("/api/graduate")]);
      if (requestRevision !== loadRevision.current) return null;
      setRecord(teaching); setSubmissions(graduate.submissions.filter(item => item.kind === "submission")); setSignedIn(true); setLoaded(true);
      onEvidence?.(teaching);
      setPilot(previous => previous?.questions?.length ? previous : teaching.pilot);
      return teaching;
    } catch (error) {
      if (requestRevision !== loadRevision.current) return null;
      if ((error as ApiFailure).status === 401) { setSignedIn(false); setLoaded(true); return null; }
      setNotice({ error: true, text: (error as Error).message }); setLoaded(false); return null;
    }
  }, [onEvidence]);
  useEffect(() => {
    let active = true;
    const refreshRecord = () => { if (active) void reload(); };
    queueMicrotask(refreshRecord);
    window.addEventListener("graduate:evidence-changed", refreshRecord);
    window.addEventListener("teaching:refresh", refreshRecord);
    return () => { active = false; window.removeEventListener("graduate:evidence-changed", refreshRecord); window.removeEventListener("teaching:refresh", refreshRecord); };
  }, [reload]);
  const dirty = !!tutorAnswer.trim() || Object.values(pilotAnswers).some(value => value.trim()) || Object.keys(reviewDrafts).length > 0;
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn); return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const sessions = useMemo(() => {
    const latest = new Map<string, TutorSession>();
    for (const event of record.events.filter(item => item.kind === "tutor")) {
      const session = tutorPayload(event);
      if (session && (!latest.has(session.id) || latest.get(session.id)!.revision < session.revision)) latest.set(session.id, session);
    }
    return [...latest.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [record.events]);
  const session = liveSession ?? sessions.find(item => item.id === selectedSessionId) ?? sessions[0] ?? null;
  const selectedSubmission = submissions.find(item => item.id === selectedSubmissionId) ?? submissions.filter(item => item.kind === "submission").sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? submissions[0];
  const selectedFeedback = feedback?.submissionId === selectedSubmission?.id ? feedback : record.events.filter(item => item.kind === "feedback").sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(feedbackPayload).find(item => item?.submissionId === selectedSubmission?.id) ?? null;
  const review = selectedSubmission ? reviewDrafts[selectedSubmission.id] ?? newReview(selectedSubmission) : null;
  const pilotState = pilot ?? record.pilot;
  const revision = (pilotState as VersionedPilot).revision ?? Math.max(0, ...record.events.filter(item => item.kind === "pilot").map(item => item.revision));
  const reviews = record.events.filter(item => item.kind === "review").sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  async function run<T>(key: string, action: () => Promise<T>, success?: string): Promise<T | null> {
    setBusy(key); setNotice(null);
    try { const result = await action(); if (success) setNotice({ error: false, text: success }); return result; }
    catch (error) {
      if ((error as ApiFailure).status === 401) setSignedIn(false);
      if ((error as ApiFailure).status === 409) { await reload(); if (key === "pilot") setPilotConflict(true); }
      setNotice({ error: true, text: (error as Error).message }); return null;
    } finally { setBusy(""); }
  }
  async function startTutor(moduleId?: number) {
    const result = await run("tutor", () => api<{ session: TutorSession }>("/api/teaching/tutor", { method: "POST", body: JSON.stringify({ action: "start", ...(moduleId === undefined ? {} : { moduleId }) }) }));
    if (result) { setLiveSession(result.session); setSelectedSessionId(result.session.id); setTutorAnswer(""); await reload(); }
  }
  async function tutorAction(action: "answer" | "hint" | "explain") {
    if (!session) return;
    const result = await run("tutor", () => api<{ session: TutorSession }>("/api/teaching/tutor", { method: "POST", body: JSON.stringify({ action, sessionId: session.id, expectedRevision: session.revision, ...(action === "answer" ? { answer: Number(tutorAnswer) } : {}) }) }));
    if (result) { setLiveSession(result.session); if (action === "answer") setTutorAnswer(""); await reload(); }
    else { setLiveSession(null); setSelectedSessionId(session.id); }
  }
  async function evaluate() {
    if (!selectedSubmission) return;
    const result = await run("feedback", () => api<{ feedback: WritingFeedback; event: TeachingEvidence }>("/api/teaching/feedback", { method: "POST", body: JSON.stringify({ submissionId: selectedSubmission.id }) }));
    if (result) { setFeedback(result.feedback); await reload(); }
  }
  function editReview(change: Partial<ReviewDraft>) {
    if (selectedSubmission && review) { setSelectedSubmissionId(selectedSubmission.id); setReviewDrafts(previous => ({ ...previous, [selectedSubmission.id]: { ...review, ...change } })); }
  }
  async function saveReview() {
    if (!selectedSubmission || !review) return;
    const { confirmed, ...fields } = review; if (!confirmed) return;
    const result = await run("review", () => api<{ event: TeachingEvidence }>("/api/teaching/review", { method: "POST", body: JSON.stringify({ submissionId: selectedSubmission.id, ...fields, reviewedAt: new Date().toISOString() }) }), "Review saved with its stated source and supporting evidence.");
    if (result) { setReviewDrafts(previous => { const next = { ...previous }; delete next[selectedSubmission.id]; return next; }); await reload(); }
  }
  async function enrollPilot() {
    const result = await run("pilot", () => api<{ pilot: VersionedPilot }>("/api/teaching/pilot", { method: "POST", body: JSON.stringify({ action: "enroll", moduleIds: [4, 10, 14],consent:pilotConsent,priorExperience }) }));
    if (result) { setPilot(result.pilot); await reload(); }
  }
  async function openPilot(stage: PilotStage) {
    if (pilotState.stage === stage && pilotState.questions?.length) return;
    const result = await run("pilot", () => api<VersionedPilot>(`/api/teaching/pilot?stage=${stage}`));
    if (result) { setPilot(result); setPilotAnswers({}); setPilotConfidence(""); setPilotAssistance(""); setPilotMinutes(""); setPilotConflict(false); }
  }
  async function submitPilot() {
    if (!pilotState.stage || !pilotState.questions) return;
    const result = await run("pilot", () => api<{ pilot: VersionedPilot }>("/api/teaching/pilot", { method: "POST", body: JSON.stringify({ action: "submit", stage: pilotState.stage, expectedRevision: revision, answers: Object.fromEntries(Object.entries(pilotAnswers).map(([key, value]) => [key, Number(value)])), minutes: Number(pilotMinutes), clarity: Number(pilotClarity),confidence:Number(pilotConfidence),assistance:pilotAssistance }) }), "Your observed result is saved. Later stages will open on their scheduled dates.");
    if (result) { setPilot(result.pilot); setPilotAnswers({}); setPilotMinutes("");setPilotConfidence("");setPilotAssistance(""); await reload(); }
  }
  const reviewReady = !!review && review.confirmed && review.reviewerName.trim().length > 1 && review.challenge.trim().length >= 20 && review.response.trim().length >= 20 && review.criteria.every(item => item.evidence.trim().length >= 5 && item.feedback.trim().length >= 15 && (review.decision !== "accepted" || item.score >= 2));
  const pilotReady = !!pilotState.questions?.length && pilotState.questions.every(question => pilotAnswers[question.id]?.trim() && Number.isFinite(Number(pilotAnswers[question.id]))) && Number(pilotMinutes) > 0 && pilotConfidence!==""&&Number(pilotConfidence)>=0&&Number(pilotConfidence)<=100&&pilotAssistance!=="";
  const submissionPicker = <label className="teaching-field teaching-submission-picker"><strong>Saved work to examine</strong><select value={selectedSubmission?.id ?? ""} onChange={event => { setSelectedSubmissionId(event.target.value); setFeedback(null); }}>{submissions.map(item => <option key={item.id} value={item.id}>Module {item.moduleId} · Revision {item.revision} · {item.kind} · {stamp(item.createdAt)}</option>)}</select></label>;

  return <section className="teaching-studio">
    <header className="teaching-heading"><div><p className="eyebrow">YOUR NEXT STEP, INFORMED BY YOUR WORK</p><h2>Teaching that responds to your reasoning.</h2><p>Practice with feedback, examine a written decision, record a real review, and measure what you retain.</p></div><a className="button button-secondary" href="/api/teaching/export"><ArrowDownToLine size={16} />Export teaching record</a></header>
    <nav className="teaching-tabs" aria-label="Teaching studio sections">{tabs.map(({ id, label, icon: Icon }) => <button type="button" key={id} aria-current={tab === id ? "page" : undefined} className={tab === id ? "selected" : ""} onClick={() => { setTab(id); setNotice(null); }}><Icon size={17} />{label}</button>)}</nav>
    {notice && <div className={`teaching-notice ${notice.error ? "teaching-error" : ""}`} role={notice.error ? "alert" : "status"}><p>{notice.text}</p><button type="button" className="text-button" onClick={() => setNotice(null)}>Dismiss</button></div>}
    {!loaded && <div className="teaching-notice"><p>The teaching record is loading or unavailable. Reload to recover your saved sessions.</p><button type="button" className="text-button" onClick={() => void reload()}><RefreshCw size={15} />Reload teaching record</button></div>}
    {loaded && !signedIn && <div className="teaching-notice"><p>Sign in to use adaptive sessions, request feedback, record reviews, and start a learning pilot.</p><a className="button button-small button-secondary" href="/signin-with-chatgpt?return_to=%2F" target="_top">Sign in with ChatGPT</a></div>}

    {tab === "tutor" && <>
      <section className="teaching-plan panel"><div><p className="eyebrow">AN EVIDENCE-BASED STUDY PLAN</p><h3>Choose the next useful challenge.</h3><p>{record.plan.summary}</p></div><button type="button" className="button button-primary" disabled={!signedIn || !!busy} onClick={() => void startTutor()}>Begin recommended tutoring<ArrowRight size={16} /></button>{record.plan.recommendations.length > 0 && <ol>{record.plan.recommendations.map((item, index) => <li key={`${item.moduleId}-${item.skill}-${index}`}><div><span className={`teaching-action teaching-action-${item.action}`}>{item.action}</span><strong>Module {item.moduleId}: {moduleTitle(item.moduleId)}</strong><p>{item.reason}</p></div><div className="teaching-plan-actions"><button type="button" className="text-button" disabled={!signedIn || !!busy} onClick={() => void startTutor(item.moduleId)}>Work on this<ArrowRight size={14} /></button>{onModule && <button type="button" className="text-button" onClick={() => onModule(item.moduleId)}>Open lesson<BookOpen size={14} /></button>}</div></li>)}</ol>}</section>
      <section className="teaching-tutor panel"><div className="teaching-section-heading"><div><p className="eyebrow">PREDICT · EXPLAIN · TRANSFER</p><h3>A tutor that follows your answers.</h3></div><span className="outlined-tag">Rules-based teaching</span></div><p>Each answer changes the next step. Hints, corrections, retries, and changed-input transfer questions remain visible in your session record.</p><div className="teaching-controls"><label className="teaching-field"><strong>Practice a particular module</strong><select value={selectedModule} onChange={event => setSelectedModule(Number(event.target.value))}>{curriculum.map(item => <option key={item.id} value={item.id}>{item.id} · {item.title}</option>)}</select></label><button type="button" className="button button-secondary" disabled={!signedIn || !!busy} onClick={() => void startTutor(selectedModule)}>Start selected module</button></div>
        {sessions.length > 0 && <label className="teaching-field"><strong>Resume a saved tutor session</strong><select value={session?.id ?? ""} onChange={event => { setSelectedSessionId(event.target.value); setLiveSession(null); }}>{sessions.map(item => <option key={item.id} value={item.id}>Module {item.moduleId} · {item.phase} · {stamp(item.createdAt)}</option>)}</select></label>}
        {session && <div className="teaching-session"><div className="teaching-session-meta"><span>Module {session.moduleId}</span><span>Saved revision {session.revision}</span><span>{session.phase === "complete" ? "Session complete" : session.phase === "transfer" ? "Transfer check" : session.phase === "retry" ? "Correct and try again" : "Independent attempt"}</span></div>{session.teaching && <div className="teaching-coaching"><Lightbulb size={20} /><p>{session.teaching}</p></div>}{session.question ? <><h4>{session.question.prompt}</h4><form onSubmit={event => { event.preventDefault(); if (tutorAnswer.trim() && Number.isFinite(Number(tutorAnswer))) void tutorAction("answer"); }}><label className="teaching-field"><strong>Your tutor answer ({session.question.unit})</strong><input type="number" step="any" inputMode="decimal" value={tutorAnswer} disabled={!!busy} onChange={event => setTutorAnswer(event.target.value)} /></label><div className="button-row"><button className="button button-primary" disabled={!!busy || !tutorAnswer.trim() || !Number.isFinite(Number(tutorAnswer))}>{busy === "tutor" ? <LoaderCircle size={15} className="spin" /> : <Target size={15} />}Check this step</button><button type="button" className="button button-secondary" disabled={!!busy} onClick={() => void tutorAction("hint")}><Lightbulb size={15} />Give me a hint</button><button type="button" className="text-button" disabled={!!busy} onClick={() => void tutorAction("explain")}>Show a worked explanation</button></div></form></> : <div className="teaching-complete"><CheckCircle2 size={24} /><div><h4>Use the explanation in a new situation.</h4><p>{session.nextStep}</p><button type="button" className="text-button" disabled={!!busy} onClick={() => void startTutor()}>Continue with the recommended next step<ArrowRight size={14} /></button></div></div>}{session.question && session.nextStep && <p className="teaching-caption">{session.nextStep}</p>}{session.turns.length > 0 && <div className="teaching-turns"><h4>Your attempt history</h4>{session.turns.map((turn, index) => <details key={`${session.id}-${index}`} open={index === session.turns.length - 1}><summary>Attempt {index + 1} · {turn.correct ? "Correct" : "Correction needed"} · {turn.assisted ? "Assisted practice" : "Before hints"}</summary><p>{turn.prompt}</p><p>Your answer: <strong>{turn.answer}</strong>. Expected: <strong>{turn.expected}</strong>.</p><p>{turn.explanation}</p></details>)}</div>}</div>}
      </section>
    </>}

    {tab === "feedback" && <section className="teaching-writing panel"><p className="eyebrow">FORMATIVE FEEDBACK ON A SAVED DECISION</p><h3>Make the reasoning easier to defend.</h3><p>The feedback examines the exact saved version you choose. It identifies evidence, unsupported claims, missing reasoning, and explicit calculations. It is automated instructional feedback; an independent review remains a separate record.</p>{submissions.length ? <>{submissionPicker}<button type="button" className="button button-primary" disabled={!!busy || !signedIn} onClick={() => void evaluate()}>{busy === "feedback" ? <LoaderCircle size={15} className="spin" /> : <ClipboardCheck size={15} />}Evaluate this saved version</button><SavedWriting submission={selectedSubmission} />{selectedFeedback && <div className="teaching-writing-feedback"><div className="teaching-feedback-summary"><h4>Your revision brief</h4><p>{selectedFeedback.summary}</p><span className="teaching-caption">Feedback version {selectedFeedback.version} · {stamp(selectedFeedback.createdAt)}</span></div>{selectedFeedback.alerts.length > 0 && <div className="teaching-alerts"><h4>Claims to revisit</h4>{selectedFeedback.alerts.map((item, index) => <div key={index}><blockquote>{item.claim}</blockquote><p>{item.explanation}</p></div>)}</div>}{selectedFeedback.criteria.map((item, index) => <article className="teaching-feedback-criterion" key={`${item.dimension}-${index}`}><div className="teaching-section-heading"><h4>{item.dimension}</h4><span className={`teaching-evidence-status teaching-status-${item.status}`}>{item.status === "evidence_found" ? "Evidence located" : item.status === "needs_work" ? "Develop this argument" : "Review needed"}</span></div>{item.evidence && <blockquote>{item.evidence}</blockquote>}<p>{item.feedback}</p><p className="teaching-followup"><strong>Explain next:</strong> {item.nextQuestion}</p></article>)}{selectedFeedback.numericalChecks.length > 0 && <div className="teaching-numeric-checks"><h4>Explicit numerical checks</h4>{selectedFeedback.numericalChecks.map((item, index) => <div key={index}><strong>{item.label}</strong><span className={`teaching-evidence-status teaching-status-${item.status}`}>{item.status.replaceAll("_", " ")}</span><p>{item.explanation}</p></div>)}</div>}<h4>Next revision</h4><ol className="teaching-next-actions">{selectedFeedback.nextActions.map((item, index) => <li key={index}>{item}</li>)}</ol>{onModule && selectedSubmission && <button type="button" className="button button-secondary" onClick={() => onModule(selectedSubmission.moduleId)}>Return to the case and revise<ArrowRight size={15} /></button>}</div>}</> : <div className="teaching-empty"><ClipboardCheck size={28} /><p>Submit a case decision memo first. It will appear here with its original version and answers.</p>{onModule && <button type="button" className="text-button" onClick={() => onModule(10)}>Begin the Trade Design case<ArrowRight size={14} /></button>}</div>}</section>}

    {tab === "review" && <>
      <section className="teaching-review panel"><p className="eyebrow">A TRACEABLE REVIEW OF THE WORK</p><h3>Record the challenge and the response.</h3><p>Download the packet for a reviewer, then record the review that actually occurred. Self-review and external feedback reported by the learner remain distinct. This record does not verify a reviewer’s identity or credentials.</p>{submissions.length && review && selectedSubmission ? <>{submissionPicker}<a className="button button-secondary" href={`/api/teaching/review?submissionId=${encodeURIComponent(selectedSubmission.id)}`}><ArrowDownToLine size={15} />Download this review packet</a><SavedWriting submission={selectedSubmission} /><div className="teaching-review-fields"><label className="teaching-field"><strong>Reviewer name</strong><input value={review.reviewerName} maxLength={120} onChange={event => editReview({ reviewerName: event.target.value })} /></label><label className="teaching-field"><strong>Review source</strong><select value={review.reviewerRole} onChange={event => editReview({ reviewerRole: event.target.value as ReviewDraft["reviewerRole"] })}><option value="self">My own self-review</option><option value="reported_external">External review I am recording</option></select></label><label className="teaching-field"><strong>Review decision</strong><select value={review.decision} onChange={event => editReview({ decision: event.target.value as ReviewDraft["decision"] })}><option value="revise">Revision requested</option><option value="accepted">Accepted by the stated reviewer</option></select></label></div><p className="teaching-caption">Scores: 0 = absent or incorrect; 1 = incomplete; 2 = supported with stated limitations; 3 = reproducible and defended. Quote the actual saved work as evidence for each criterion.</p>{review.criteria.map((item, index) => <fieldset className="teaching-review-criterion" key={item.dimension}><legend>{item.dimension}</legend><label className="teaching-field"><strong>Criterion {index + 1} score</strong><select aria-label={`Criterion ${index + 1} score`} value={item.score} onChange={event => editReview({ criteria: review.criteria.map((row, i) => i === index ? { ...row, score: Number(event.target.value) } : row) })}>{[0, 1, 2, 3].map(score => <option key={score} value={score}>{score}</option>)}</select></label><label className="teaching-field"><strong>Criterion {index + 1} quoted evidence</strong><textarea rows={3} maxLength={1200} value={item.evidence} onChange={event => editReview({ criteria: review.criteria.map((row, i) => i === index ? { ...row, evidence: event.target.value } : row) })} /></label><label className="teaching-field"><strong>Criterion {index + 1} feedback</strong><textarea rows={3} maxLength={2000} value={item.feedback} onChange={event => editReview({ criteria: review.criteria.map((row, i) => i === index ? { ...row, feedback: event.target.value } : row) })} /></label></fieldset>)}<label className="teaching-field"><strong>The reviewer’s challenge</strong><textarea rows={3} maxLength={3000} value={review.challenge} onChange={event => editReview({ challenge: event.target.value })} /></label><label className="teaching-field"><strong>The learner’s response</strong><textarea rows={3} maxLength={3000} value={review.response} onChange={event => editReview({ response: event.target.value })} /></label><label className="teaching-confirm"><input type="checkbox" checked={review.confirmed} onChange={event => editReview({ confirmed: event.target.checked })} /><span>I am recording a review that actually took place, with its source accurately stated.</span></label><button type="button" className="button button-primary" disabled={!!busy || !signedIn || !reviewReady} onClick={() => void saveReview()}>{busy === "review" ? <LoaderCircle size={15} className="spin" /> : <Save size={15} />}Save recorded review</button><p className="teaching-caption">Unsaved review writing stays available while you switch studio tabs. Save before leaving or reloading.</p></> : <div className="teaching-empty"><BookOpen size={28} /><p>A saved case submission supplies the packet and rubric for this review.</p></div>}</section>
      <ReviewCalibration reviews={reviews.map(reviewPayload).filter((item):item is RecordedReview=>!!item)}/><section className="teaching-review-history panel"><h3>Recorded reviews</h3>{reviews.length ? reviews.map(event => { const item = reviewPayload(event); return item ? <details key={event.id}><summary>{item.reviewerRole === "self" ? "Self-review" : "Reported external review"} · {item.reviewerName} · {item.decision === "accepted" ? "Accepted by stated reviewer" : "Revision requested"}</summary><p className="teaching-caption">{stamp(item.reviewedAt)} · Submission {item.submissionId}</p>{item.criteria.map((criterion, index) => <div key={index}><h4>{criterion.dimension}: {criterion.score}/3</h4><blockquote>{criterion.evidence}</blockquote><p>{criterion.feedback}</p></div>)}<p><strong>Challenge:</strong> {item.challenge}</p><p><strong>Response:</strong> {item.response}</p></details> : null; }) : <p>No reviews have been recorded.</p>}</section>
    </>}

    {tab === "pilot" && <>
      {pilotConflict && <section className="teaching-notice teaching-error"><div><h4>The saved pilot changed.</h4><p>Your unsent answers remain here. Copy them before returning to the latest saved schedule.</p><details><summary>Show my unsent assessment answers</summary>{Object.entries(pilotAnswers).map(([key,value]) => <p key={key}>{key}: {value}</p>)}</details></div><button type="button" className="button button-secondary" onClick={() => { setPilot(record.pilot); setPilotConflict(false); }}>Use the current pilot record</button></section>}
      <section className="teaching-pilot-intro panel"><p className="eyebrow">MEASURE LEARNING OVER TIME</p><h3>Keep a baseline. Return after 7 and 30 days.</h3><div className="button-row"><a className="button button-secondary" href="/downloads/pilot-participant-forms.zip">Download learner packets without keys</a><a className="button button-secondary" href="/downloads/validation-guide.md">Download review and rating guide</a><a className="text-button" href="/downloads/options-course.zip">Facilitator course and instructor keys</a></div><p>The pilot freezes a small assessment covering contract operations, Trade Design, and inference. Later checks use changed inputs on the same skills. Only real completed assessments appear as results; dates are anchored to your baseline completion.</p>{!pilotState.enrollment ? <><p>Enrollment creates your private pilot record. Start with the baseline before using the tutor for these assessment skills.</p><label className="teaching-field"><strong>Prior options experience</strong><select aria-label="Prior options experience" value={priorExperience} onChange={event=>setPriorExperience(event.target.value)}><option value="">Choose your experience</option><option value="new">New to options</option><option value="basic">Some basic study</option><option value="experienced">Substantial prior study or experience</option><option value="prefer_not_to_say">Prefer not to say</option></select></label><label className="teaching-confirm"><input type="checkbox" checked={pilotConsent} onChange={event=>setPilotConsent(event.target.checked)}/><span>I agree to this private learning pilot recording my answers, dates, study exposure, self-reported time, confidence and assistance. The cases are fictional; no personal finances are required. I may stop participating and export my record.</span></label><button type="button" className="button button-primary" disabled={!signedIn || !!busy || !pilotConsent || !priorExperience} onClick={() => void enrollPilot()}>Enroll in the learning pilot<ArrowRight size={15} /></button></> : <div className="teaching-pilot-meta"><strong>Enrollment saved</strong><span>{stamp(pilotState.enrollment.enrolledAt)}</span><span>Modules {pilotState.enrollment.moduleIds.join(", ")}</span><span>Protocol {pilotState.enrollment.version}</span><span>Prior experience: {pilotState.enrollment.priorExperience??"Not recorded"}</span>{pilotState.enrollment.priorExposure&&<span>Before enrollment: {pilotState.enrollment.priorExposure.practiceSets} practice sets, {pilotState.enrollment.priorExposure.submittedMemos} submitted memos, {pilotState.enrollment.priorExposure.tutorSessions} tutor sessions</span>}</div>}</section>
      {pilotState.enrollment && <section className="teaching-pilot-schedule panel"><h3>Your assessment schedule</h3><div className="teaching-stage-grid">{pilotState.schedule.map(item => <article key={item.stage}><span className="eyebrow">{item.stage === "baseline" ? "INITIAL ASSESSMENT" : item.stage === "day7" ? "7-DAY RETENTION" : "30-DAY RETENTION"}</span><h4>{item.stage === "baseline" ? "Baseline" : item.stage === "day7" ? "Day 7" : "Day 30"}</h4><p>{item.status === "missed" ? "This assessment window has closed" : item.status === "awaiting_baseline" ? "Scheduled after baseline completion" : item.dueAt ? stamp(item.dueAt) : "Available when enrolled"}</p><span className="teaching-stage-status">{item.status.replaceAll("_", " ")}</span>{item.status === "available" && <button type="button" className="button button-small button-secondary" disabled={!!busy} onClick={() => void openPilot(item.stage)}>Open {item.stage === "baseline" ? "baseline" : item.stage === "day7" ? "day 7 check" : "day 30 check"}</button>}</article>)}</div></section>}
      {pilotState.questions?.length ? <section className="teaching-pilot-assessment panel"><p className="eyebrow">{pilotState.stage?.toUpperCase()} · YOUR FIRST ANSWERS</p><h3>Work without the answer key.</h3><p>Use the stated units. Save your actual time and clarity rating with the result. Feedback opens after submission.</p>{pilotState.questions.map((question, index) => <fieldset key={question.id}><legend>{index + 1}. {question.prompt}</legend><label className="teaching-field"><strong>Pilot answer {index + 1} ({question.unit})</strong><input type="number" step="any" inputMode="decimal" value={pilotAnswers[question.id] ?? ""} disabled={!!busy} onChange={event => setPilotAnswers(previous => ({ ...previous, [question.id]: event.target.value }))} /></label></fieldset>)}<div className="teaching-review-fields"><label className="teaching-field"><strong>Actual assessment minutes</strong><input type="number" min="0.1" max="600" step="0.1" value={pilotMinutes} onChange={event => setPilotMinutes(event.target.value)} /></label><label className="teaching-field"><strong>How clear were the questions?</strong><select value={pilotClarity} onChange={event => setPilotClarity(event.target.value)}>{[1, 2, 3, 4, 5].map(value => <option key={value} value={value}>{value} — {value === 1 ? "Very unclear" : value === 5 ? "Very clear" : ""}</option>)}</select></label></div><div className="teaching-review-fields"><label className="teaching-field"><strong>Confidence in these answers (%)</strong><input aria-label="Confidence in these answers (%)" type="number" min="0" max="100" value={pilotConfidence} onChange={event=>setPilotConfidence(event.target.value)}/></label><label className="teaching-field"><strong>Assistance used for this assessment</strong><select aria-label="Assistance used for this assessment" value={pilotAssistance} onChange={event=>setPilotAssistance(event.target.value)}><option value="">Choose what you used</option><option value="none">No assistance</option><option value="notes">Notes or reference material</option><option value="tutor">Tutor or another person</option><option value="other">Other assistance</option><option value="prefer_not_to_say">Prefer not to say</option></select></label></div><button type="button" className="button button-primary" disabled={!!busy || !pilotReady} onClick={() => void submitPilot()}>{busy === "pilot" ? <LoaderCircle size={15} className="spin" /> : <CheckCircle2 size={15} />}Submit the observed assessment</button></section> : null}
      <section className="teaching-pilot-results panel"><h3>Your observed learning record</h3>{pilotState.enrollment?.results.length ? <><div className="table-scroll"><table><caption>These are this learner’s observations, not a controlled estimate of course effectiveness.</caption><thead><tr><th scope="col">Stage</th><th scope="col">Completed</th><th scope="col">Correct</th><th scope="col">Minutes</th><th scope="col">Clarity</th><th scope="col">Confidence</th><th scope="col">Assistance</th></tr></thead><tbody>{pilotState.enrollment.results.map(item => <tr key={item.stage}><th scope="row">{item.stage === "baseline" ? "Baseline" : item.stage === "day7" ? "Day 7" : "Day 30"}</th><td>{stamp(item.completedAt)}</td><td>{item.score}/{item.total}</td><td>{item.minutes}</td><td>{item.clarity}/5</td><td>{item.confidence===undefined?"Not recorded":`${item.confidence}%`}</td><td>{item.assistance??"Not recorded"}</td></tr>)}</tbody></table></div>{pilotState.enrollment.results.length > 1 && <p className="teaching-comparison">Compared with baseline: {pilotState.enrollment.results.filter(item => item.stage !== "baseline").map(item => { const initial = pilotState.enrollment!.results.find(result => result.stage === "baseline"); const difference = initial ? item.score / item.total * 100 - initial.score / initial.total * 100 : 0; return `${item.stage === "day7" ? "day 7" : "day 30"} ${difference >= 0 ? "+" : ""}${difference.toFixed(1)} percentage points`; }).join("; ")}. Differences can reflect prior knowledge, practice, assistance, and other influences.</p>}{pilotState.enrollment.results.map(item => <details key={item.stage}><summary>{item.stage === "baseline" ? "Baseline" : item.stage === "day7" ? "Day 7" : "Day 30"} answer record</summary>{item.feedback.map(question => <div key={question.id}><h4>{question.prompt}</h4><p>Your answer: {question.answer} {question.unit}. Expected: {question.expected} {question.unit}.</p><p>{question.explanation}</p></div>)}</details>)}</> : <div className="teaching-empty"><Clock3 size={28} /><p>No pilot results have been recorded. Complete the baseline to begin measuring your learning.</p></div>}</section>
    </>}
  </section>;
}

function SavedWriting({ submission }: { submission?: GraduateSubmission }) {
  return submission ? <details className="teaching-original"><summary>Read the exact saved writing · Revision {submission.revision}</summary>{Object.entries(submission.answers).filter(([, value]) => value.trim()).map(([key, value]) => <div key={key}><h4>{key[0].toUpperCase() + key.slice(1)}</h4><p>{value}</p></div>)}</details> : null;
}
