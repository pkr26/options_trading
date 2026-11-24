import test from "node:test";
import assert from "node:assert/strict";
import { csvCell, exportLearningCsv } from "../lib/export.ts";

function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted && char === '"' && text[i + 1] === '"') { cell += '"'; i++; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { row.push(cell); cell = ""; }
    else if (char === "\r" && text[i + 1] === "\n" && !quoted) {
      row.push(cell); rows.push(row); row = []; cell = ""; i++;
    } else cell += char;
  }
  assert.equal(quoted, false);
  return rows;
}

test("CSV fields preserve commas, quotes and multiline notes with consistent columns", () => {
  const csv = exportLearningCsv({
    formatVersion: 1, courseVersion: "2026-11-14", exportedAt: "2026-11-14T12:00:00Z",
    profile: [{dailyMinutes: 15, timezone: "America/Phoenix"}],
    progress: [{lessonId: 2, completedAt: "2026-11-13T12:00:00Z", nextReviewAt: "2026-11-14T12:00:00Z", reviewCount: 0}],
    notes: [{lessonId: 2, content: 'Ask "why", then calculate.\nKeep the first attempt.', updatedAt: "2026-11-14T11:00:00Z"}],
    attempts: [{id: "attempt-1", moduleId: 1, variant: 0, score: 4, total: 5, passed: false, createdAt: "2026-11-14T11:30:00Z"}],
  });
  const [headers, ...rows] = parseCsv(csv);
  assert.equal(rows.length, 5);
  assert.ok(rows.every(row => row.length === headers.length));
  const objects = rows.map(row => Object.fromEntries(headers.map((header, i) => [header, row[i]])));
  assert.equal(objects.find(row => row.record_type === "note").content, 'Ask "why", then calculate.\nKeep the first attempt.');
  assert.equal(objects.find(row => row.record_type === "attempt").passed, "false");
  assert.equal(objects.find(row => row.record_type === "progress").review_count, "0");
  assert.equal(objects.find(row => row.record_type === "profile").timezone, "America/Phoenix");
  assert.equal(headers.includes("user_id"), false);
});

test("user note formula prefixes are neutralized before spreadsheet use", () => {
  for (const value of ["=1+1", "+SUM(A1:A2)", "-2+3", "@SUM(A1:A2)", "  =1+1", "\t=1+1", "\r=1+1", "\n=1+1", "\u0000=1+1"]) {
    const [cells] = parseCsv(csvCell(value) + "\r\n");
    assert.equal(cells[0], "'" + value);
  }
  assert.equal(csvCell('A "normal", note'), '"A ""normal"", note"');
  assert.equal(csvCell(null), '""');
  assert.equal(csvCell(0), '"0"');
});

test("exports retain new checkpoint evidence while representing legacy unknowns honestly", () => {
  const feedback = [{id:"m1v0q1",prompt:"A question",options:["A","B","C","D"],selected:1,correctIndex:0,correct:false,explanation:"Why A"}];
  const csv = exportLearningCsv({formatVersion:2,courseVersion:"2026-11-14.2",exportedAt:"2026-11-14T12:00:00Z",profile:[],progress:[],notes:[],attempts:[
    {id:"legacy",moduleId:1,variant:0,score:4,total:5,passed:false,createdAt:"2026-11-01T00:00:00Z",sequence:null,answers:null,feedback:null,courseVersion:null,questionVersion:null},
    {id:"new",moduleId:1,variant:1,score:0,total:5,passed:false,createdAt:"2026-11-14T00:00:00Z",sequence:1,answers:{m1v0q1:1},feedback,courseVersion:"2026-11-14.2",questionVersion:"v1"},
  ]});
  const [header,...rows] = parseCsv(csv);
  const records = rows.map(row => Object.fromEntries(header.map((key,i)=>[key,row[i]])));
  assert.equal(records.find(row=>row.id==="legacy").answers_json, "");
  const current=records.find(row=>row.id==="new");
  assert.deepEqual(JSON.parse(current.answers_json), {m1v0q1:1});
  assert.deepEqual(JSON.parse(current.feedback_json), feedback);
  assert.equal(current.course_version,"2026-11-14.2");
  assert.equal(current.question_version,"v1");
  assert.equal(current.attempt_sequence,"1");
});
