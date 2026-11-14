/**
 * Local-only API integration exercise. Start portable development and apply the
 * local migration first. Run separately from browser tests:
 *   node --experimental-strip-types tests/api.integration.mjs
 * Never applies migrations. Existing local_seedy rows are restored in finally.
 */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { buildQuiz } from "../lib/quiz-bank.ts";

const appRoot = fileURLToPath(new URL("../", import.meta.url));
const base = new URL(process.env.LOCAL_API_BASE ?? "http://127.0.0.1:5173");
assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(base.hostname), "Integration tests require a loopback development server.");
assert.equal(base.protocol, "http:", "Use the local HTTP development service.");
assert.ok(existsSync(new URL("../dist/server/wrangler.json", import.meta.url)), "Build and apply the local migration before integration testing.");

const owner = "local_seedy";
const peer = `integration_peer_${randomUUID()}`;
const peerAttempt = randomUUID();
const tableNames = ["profiles", "progress", "notes", "attempts"];
let cookie = "";
let checks = 0;
function sqlValue(value) {
  if (value === null) return "NULL";
  if (typeof value === "number") { assert.ok(Number.isFinite(value)); return String(value); }
  return `CAST(X'${Buffer.from(String(value), "utf8").toString("hex")}' AS TEXT)`;
}
function database(sql) {
  const output = execFileSync(process.execPath, [
    "--import", "./scripts/sites-env.mjs", "./node_modules/wrangler/bin/wrangler.js",
    "d1", "execute", "DB", "--local", "--config", "dist/server/wrangler.json",
    "--persist-to", ".wrangler/state", "--command", sql, "--json",
  ], {cwd: appRoot, encoding: "utf8", maxBuffer: 4 * 1024 * 1024});
  const parsed = JSON.parse(output);
  assert.ok(parsed.every(result => result.success !== false), "Local database statement failed.");
  return parsed;
}
async function request(path, {method = "GET", body, headers = {}, signed = true, type = "application/json"} = {}) {
  const response = await fetch(new URL(path, base), {
    method, redirect: "manual",
    headers: {
      ...(signed && cookie ? {Cookie: cookie} : {}),
      ...(method !== "GET" ? {Origin: base.origin, "Content-Type": type} : {}),
      ...headers,
    },
    ...(body === undefined ? {} : {body: typeof body === "string" ? body : JSON.stringify(body)}),
  });
  const text = await response.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return {response, data, text};
}
function status(result, expected, label) {
  assert.equal(result.response.status, expected, `${label}: ${result.text.slice(0, 250)}`);
  checks++;
}
const unsigned = await request("/api/learning", {signed: false});
status(unsigned, 401, "Unsigned learning state");
const signIn = await request("/signin-with-chatgpt?return_to=/", {signed: false});
status(signIn, 302, "Portable sign-in");
const setCookie = signIn.response.headers.get("set-cookie");
assert.ok(setCookie?.includes("__sites_local_auth="));
cookie = setCookie.split(";", 1)[0];
const signed = await request("/api/learning");
status(signed, 200, "Signed learning state and ready database");
assert.equal(signed.data.user.email, "seedy@sites.test", "Only the portable test identity may be changed.");

const snapshot = Object.fromEntries(tableNames.map(table => [table,
  database(`SELECT * FROM ${table} WHERE user_id=${sqlValue(owner)}`)[0].results,
]));
let fixtureStarted = false;
try {
  const now = "2026-11-14T12:00:00.000Z";
  const statements = tableNames.map(table => `DELETE FROM ${table} WHERE user_id=${sqlValue(owner)}`);
  statements.push(
    `INSERT INTO profiles (user_id,daily_minutes,timezone) VALUES (${sqlValue(peer)},7,'UTC')`,
    `INSERT INTO progress (user_id,lesson_id,completed_at,next_review_at,review_count) VALUES (${sqlValue(peer)},1,${sqlValue(now)},${sqlValue(now)},9)`,
    `INSERT INTO notes (user_id,lesson_id,content,updated_at) VALUES (${sqlValue(peer)},1,'PRIVATE PEER NOTE',${sqlValue(now)})`,
    `INSERT INTO attempts (id,user_id,module_id,variant,score,total,passed,created_at) VALUES (${sqlValue(peerAttempt)},${sqlValue(peer)},1,0,5,5,1,${sqlValue(now)})`,
  );
  fixtureStarted = true;
  database(statements.join(";"));

  let state = await request("/api/learning");
  status(state, 200, "Empty owner state");
  assert.deepEqual(state.data.progress, []);
  assert.deepEqual(state.data.notes, []);
  assert.deepEqual(state.data.attempts, []);
  assert.deepEqual(state.data.profile, {dailyMinutes: 15, timezone: "America/Phoenix"});
  status(await request("/api/progress", {method: "POST", body: {lessonId: 2, action: "complete"}}), 409, "Peer progress cannot satisfy completion order");
  status(await request("/api/quiz?moduleId=1"), 409, "Checkpoint requires own eight lessons");
  status(await request("/api/notes", {method: "PUT", body: {lessonId: 65, content: "invalid"}}), 400, "Invalid note lesson");
  status(await request("/api/notes", {method: "PUT", body: {lessonId: 1, content: "x".repeat(10001)}}), 400, "Oversize note");
  status(await request("/api/profile", {method: "PUT", body: {dailyMinutes: 10, timezone: "Not/A_Timezone"}}), 400, "Invalid timezone");
  status(await request("/api/notes", {method: "PUT", body: {lessonId: 1, content: "bad origin"}, headers: {Origin: "https://example.invalid"}}), 403, "Cross-origin mutation");
  status(await request("/api/notes", {method: "PUT", body: "plain", type: "text/plain"}), 415, "Wrong request content type");

  const note = '=SUM(A1:A2), "paper only"\nKeep the losing case.';
  status(await request("/api/notes", {method: "PUT", body: {lessonId: 1, content: "first note"}}), 200, "Create own note");
  status(await request("/api/notes", {method: "PUT", body: {lessonId: 1, content: note}}), 200, "Update own note");
  status(await request("/api/profile", {method: "PUT", body: {dailyMinutes: 10, timezone: "America/Phoenix"}}), 200, "Persist profile");
  for (let lessonId = 1; lessonId <= 8; lessonId++) {
    status(await request("/api/progress", {method: "POST", body: {lessonId, action: "complete"}}), 200, `Complete lesson ${lessonId}`);
  }
  state = await request("/api/learning");
  assert.equal(state.data.progress.length, 8);
  assert.equal(state.data.notes.length, 1);
  assert.equal(state.data.notes[0].content, note);
  assert.equal(state.data.profile.dailyMinutes, 10);
  const completedAt = state.data.progress.find(row => row.lessonId === 8).completedAt;
  status(await request("/api/progress", {method: "POST", body: {lessonId: 8, action: "complete"}}), 200, "Completion is idempotent");
  state = await request("/api/learning");
  assert.equal(state.data.progress.length, 8);
  assert.equal(state.data.progress.find(row => row.lessonId === 8).completedAt, completedAt);
  status(await request("/api/progress", {method: "POST", body: {lessonId: 9, action: "complete"}}), 409, "Peer checkpoint pass cannot unlock owner's module");

  let quiz = await request("/api/quiz?moduleId=1");
  status(quiz, 200, "Fetch first checkpoint form");
  assert.equal(quiz.data.variant, 0);
  assert.equal(quiz.data.questions.length, 5);
  assert.ok(quiz.data.questions.every(q => !("correctIndex" in q) && !("explanation" in q)));
  status(await request("/api/quiz", {method: "POST", body: {moduleId: 1, variant: 0, answers: {}}}), 400, "Missing answers rejected");
  const wrong = Object.fromEntries(buildQuiz(1, 0).map(q => [q.id, (q.correctIndex + 1) % 4]));
  status(await request("/api/quiz", {method: "POST", body: {moduleId: 1, variant: 0, answers: {...wrong, extra: 0}}}), 400, "Extra answers rejected");
  const failed = await request("/api/quiz", {method: "POST", body: {moduleId: 1, variant: 0, answers: wrong}});
  status(failed, 200, "Grade unsuccessful form zero");
  assert.equal(failed.data.score, 0);
  assert.equal(failed.data.passed, false);
  status(await request("/api/progress", {method: "POST", body: {lessonId: 9, action: "complete"}}), 409, "Failed own checkpoint cannot unlock module");
  status(await request("/api/quiz", {method: "POST", body: {moduleId: 1, variant: 0, answers: wrong}}), 409, "Stale form rejected");
  quiz = await request("/api/quiz?moduleId=1");
  status(quiz, 200, "Fetch alternate checkpoint form");
  assert.equal(quiz.data.variant, 1);
  const correct = Object.fromEntries(buildQuiz(1, 1).map(q => [q.id, q.correctIndex]));
  const passed = await request("/api/quiz", {method: "POST", body: {moduleId: 1, variant: 1, answers: correct}});
  status(passed, 200, "Grade successful alternate form");
  assert.equal(passed.data.score, 5);
  assert.equal(passed.data.passed, true);
  status(await request("/api/progress", {method: "POST", body: {lessonId: 9, action: "complete"}}), 200, "Own checkpoint unlocks lesson nine");
  status(await request("/api/progress", {method: "POST", body: {lessonId: 1, action: "review", recalled: true}}), 200, "Recall review");
  state = await request("/api/learning");
  assert.equal(state.data.progress.find(row => row.lessonId === 1).reviewCount, 1);
  status(await request("/api/progress", {method: "POST", body: {lessonId: 1, action: "review", recalled: false}}), 200, "Miss resets review count");
  state = await request("/api/learning");
  assert.equal(state.data.progress.find(row => row.lessonId === 1).reviewCount, 0);
  assert.deepEqual(state.data.attempts.map(row => row.score).sort((a, b) => a - b), [0, 5]);

  const json = await request("/api/export");
  status(json, 200, "JSON export");
  assert.equal(json.data.notes[0].content, note);
  assert.equal(json.data.progress.length, 9);
  assert.equal(json.data.attempts.length, 2);
  assert.ok(!json.text.includes(peer));
  assert.ok(!json.text.includes("PRIVATE PEER NOTE"));
  assert.ok(!json.text.includes('"userId"'));
  assert.match(json.response.headers.get("content-disposition"), /\.json/);
  const csv = await request("/api/export?format=csv");
  status(csv, 200, "CSV export");
  assert.match(csv.response.headers.get("content-type"), /text\/csv/);
  assert.match(csv.text, /"'=SUM\(A1:A2\), ""paper only""\nKeep the losing case\."/);
  assert.ok(!csv.text.includes("PRIVATE PEER NOTE"));
  status(await request("/api/export?format=html"), 400, "Unknown export format rejected");
  status(await request("/api/export", {signed: false}), 401, "Unsigned export rejected");

  for (const table of tableNames) {
    const rows = database(`SELECT * FROM ${table} WHERE user_id=${sqlValue(peer)}`)[0].results;
    assert.equal(rows.length, 1, `Peer ${table} unchanged`);
  }
  assert.equal(database(`SELECT content FROM notes WHERE user_id=${sqlValue(peer)}`)[0].results[0].content, "PRIVATE PEER NOTE");
  console.log(`Passed ${checks} local HTTP status checks plus persistence, grading, review, export, and two-user isolation assertions.`);
} finally {
  if (fixtureStarted) {
    const restore = tableNames.map(table => `DELETE FROM ${table} WHERE user_id IN (${sqlValue(owner)},${sqlValue(peer)})`);
    for (const table of tableNames) {
      for (const row of snapshot[table]) {
        const columns = Object.keys(row);
        assert.ok(columns.every(column => /^[a-z_]+$/.test(column)));
        restore.push(`INSERT INTO ${table} (${columns.join(",")}) VALUES (${columns.map(column => sqlValue(row[column])).join(",")})`);
      }
    }
    database(restore.join(";"));
    console.log("Restored prior portable test-user records and removed the temporary peer.");
  }
}
