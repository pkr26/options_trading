"use client";

import { useState, useSyncExternalStore } from "react";
import { Check, LoaderCircle, NotebookPen } from "lucide-react";
import type { Note } from "@/lib/types";

type Draft = { text: string; baseRevision: number };
const memory = new Map<string, string>();
const subscribers = new Set<() => void>();
const subscribe = (listener: () => void) => {
  subscribers.add(listener);
  return () => { subscribers.delete(listener); };
};
const serverSnapshot = () => "";
function read(key: string) {
  if (memory.has(key)) return memory.get(key)!;
  try { return sessionStorage.getItem(key) ?? ""; } catch { return ""; }
}
function write(key: string, draft: Draft | null) {
  const raw = draft ? JSON.stringify(draft) : "";
  memory.set(key, raw);
  try {
    if (raw) sessionStorage.setItem(key, raw);
    else sessionStorage.removeItem(key);
  } catch { /* The in-memory copy still supports navigation. */ }
  subscribers.forEach(listener => listener());
}
function parse(raw: string): Draft | null {
  if (!raw) return null;
  try {
    const d = JSON.parse(raw);
    return typeof d?.text === "string" && Number.isSafeInteger(d.baseRevision) && d.baseRevision >= 0 ? d : null;
  } catch { return null; }
}

type Props = { lessonId: number; owner: string | null; expectedOwnerId?: string; saved?: Note; signInHref: string; onSaved: (note: Note | null) => void };
export default function LessonNote({ lessonId, owner, expectedOwnerId, saved, signInHref, onSaved }: Props) {
  const guestKey = `options-note/guest/${lessonId}`;
  const key = owner ? `options-note/account/${encodeURIComponent(owner)}/${lessonId}` : guestKey;
  const draft = parse(useSyncExternalStore(subscribe, () => read(key), serverSnapshot));
  const guestDraft = parse(useSyncExternalStore(subscribe, () => read(guestKey), serverSnapshot));
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const text = draft?.text ?? saved?.content ?? "";
  const revision = saved?.revision ?? 0;
  const conflict = !!draft && draft.baseRevision !== revision && text !== (saved?.content ?? "");
  const dirty = text !== (saved?.content ?? "");
  async function save() {
    if (!owner || !draft || busy || conflict) return;
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch("/api/notes", {method:"PUT",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({lessonId,content:text,expectedOwnerId,expectedRevision:draft.baseRevision})});
      const result = await response.json() as { error?: string; note?: Note | null; revision?: number; updatedAt?: string };
      if (!response.ok) {
        if (response.status === 409 && result.note !== undefined) onSaved(result.note);
        throw new Error(result.error || "Your note could not be saved. Try again.");
      }
      if (result.revision === undefined || !result.updatedAt) throw new Error("Could not confirm the save. Your draft is available to retry.");
      onSaved({lessonId,content:text,revision:result.revision,updatedAt:result.updatedAt});
      const pending = parse(read(key));
      if (pending && pending.baseRevision === draft.baseRevision) {
        write(key, pending.text === text ? null : {...pending,baseRevision:result.revision});
      }
      setNotice("Your note is saved in your notebook.");
    } catch(error) { setNotice((error as Error).message); }
    finally { setBusy(false); }
  }
  return <section className="study-note panel">
    <div className="section-row"><h3><NotebookPen size={16}/>Your own words</h3><span className="tiny muted">{dirty ? "Unsaved" : "Saved notes"}</span></div>
    <p>Explain the idea. Record your answer or a question to come back to.</p>
    {owner && guestDraft && !draft && <button type="button" className="text-button" onClick={() => {write(key,{text:guestDraft.text,baseRevision:revision});write(guestKey,null);}}>Restore my draft from before sign-in</button>}
    <label className="sr-only" htmlFor={`note-${lessonId}`}>Notes for lesson {lessonId}</label>
    <textarea id={`note-${lessonId}`} maxLength={10000} rows={7} placeholder="The idea as I understand it…" value={text} onChange={e=>{
      setNotice("");
      const value=e.target.value;
      write(key,!busy && value===(saved?.content ?? "") ? null : {text:value,baseRevision:draft?.baseRevision ?? revision});
    }}/>
    {conflict && <div role="alert"><strong>A newer note was saved.</strong><p>Latest saved text</p><blockquote>{saved?.content || "(empty note)"}</blockquote>
      <button type="button" className="text-button" onClick={()=>{write(key,null);setNotice("");}}>Use latest saved text</button>{" "}
      <button type="button" className="text-button" onClick={()=>{write(key,{text,baseRevision:revision});setNotice("");}}>Keep my edits for the next save</button>
    </div>}
    <div className="note-footer"><span>{text.length.toLocaleString()} / 10,000</span>
      <button type="button" className="button button-small button-secondary" disabled={!owner||busy||!dirty||conflict} onClick={save}>{busy?<LoaderCircle size={14} className="spin"/>:<Check size={14}/>}Save note</button></div>
    {notice && <p role="status">{notice}</p>}
    {!owner && <p className="fine-print"><a href={signInHref} target="_top">Sign in</a> to save. This tab keeps your draft through a refresh.</p>}
  </section>;
}
