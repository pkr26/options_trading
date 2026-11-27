/** Run against the loopback development service with its local D1 migrations applied. */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";

const base = new URL(process.env.LOCAL_API_BASE ?? "http://127.0.0.1:5173");
assert.equal(base.protocol, "http:");
assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(base.hostname));
const owner = "local_seedy";
const backup = "practical_saved_" + randomUUID();
const peer = "practical_peer_" + randomUUID();
const filter = "((kind='practical' AND entity_id IN ('A','B','C','D')) OR (kind='practical-solutions' AND entity_id='63'))";
const sql = statement => JSON.parse(execFileSync(process.execPath, [
  "--import", "./scripts/sites-env.mjs", "./node_modules/wrangler/bin/wrangler.js",
  "d1", "execute", "DB", "--local", "--config", "dist/server/wrangler.json",
  "--persist-to", ".wrangler/state", "--command", statement, "--json",
], { encoding: "utf8" }))[0].results;
let cookie = "";
let checks = 0;
async function call(path, body) {
  const response = await fetch(new URL(path, base), {
    method: body ? "POST" : "GET", redirect: "manual",
    headers: { ...(cookie ? { Cookie: cookie } : {}), ...(body ? { Origin: base.origin, "Content-Type": "application/json" } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { response, body: response.headers.get("content-type")?.includes("application/json") ? await response.json() : null };
}
function status(result, expected) {
  assert.equal(result.response.status, expected, JSON.stringify(result.body)?.slice(0, 600));
  checks++;
  return result.body;
}
const getD = state => state.cases.find(item => item.id === "D");
const endpoint = "/api/practical";
const solutions = "/api/practical/solutions";
const draft = { id: "D", stage: "initial", action: "draft", expectedRevision: 0, answers: {}, reasoning: "", assistance: "none" };
const guest = status(await call(endpoint), 200);
assert.equal(guest.signedIn, false);
assert.equal(guest.initialSolutionsSeen, false);
assert.deepEqual(guest.cases.map(item => item.id), ["A", "B", "C", "D"]);
assert.ok(guest.cases.every(item => item.forms.transfer === null && !item.attempts.length));
assert.doesNotMatch(JSON.stringify(guest), /"expected"|"checks"/);
status(await call(endpoint, draft), 401);
status(await call(solutions, {}), 401);
const sign = await call("/signin-with-chatgpt?return_to=/");
assert.equal(sign.response.status, 302);
cookie = sign.response.headers.get("set-cookie").split(";", 1)[0];
assert.equal(status(await call("/api/learning"), 200).user.email, "seedy@sites.test");

// Move only the portable learner's practical rows aside. Preserve every original timestamp and revision.
sql(`UPDATE teaching_events SET user_id='${backup}' WHERE user_id='${owner}' AND ${filter}`);
try {
  sql(`INSERT INTO teaching_events (id,user_id,kind,entity_id,revision,payload,version,created_at)
       VALUES ('${randomUUID()}','${peer}','practical-solutions','63',1,'{}','test','2026-01-01')`);
  const empty = status(await call(endpoint), 200);
  assert.equal(empty.signedIn, true);
  assert.equal(empty.initialSolutionsSeen, false);
  assert.equal(getD(empty).revision, 0);
  status(await call(endpoint, { ...draft, stage: "transfer" }), 409);
  status(await call(endpoint, { ...draft, userId: peer }), 400);
  const mismatch = status(await call(endpoint, { ...draft, expectedOwnerId: peer }), 409);
  assert.deepEqual(Object.keys(mismatch).sort(), ["code", "error"]);
  assert.equal(mismatch.code, "account_changed");
  assert.ok(!JSON.stringify(mismatch).includes(owner));
  assert.equal(getD(status(await call(endpoint), 200)).revision, 0);
  assert.equal(status(await call(solutions, { expectedOwnerId: peer }), 409).code, "account_changed");
  assert.equal(status(await call(endpoint), 200).initialSolutionsSeen, false);
  status(await call(endpoint, { ...draft, answers: { unknown: "1" } }), 400);
  const saved = status(await call(endpoint, { ...draft, expectedOwnerId: owner, reasoning: "My working draft." }), 201);
  assert.equal(getD(saved).draft.reasoning, "My working draft.");
  assert.equal(getD(status(await call(endpoint), 200)).draft.reasoning, "My working draft.");
  const answers = Object.fromEntries(getD(saved).forms.initial.fields.map(field => [field.key, "0"]));
  const first = { ...draft, expectedRevision: 1, action: "submit", answers, reasoning: "First ledger, before checking the solution." };
  const race = await Promise.all([call(endpoint, first), call(endpoint, first)]);
  assert.deepEqual(race.map(result => result.response.status).sort(), [201, 409]);
  const initial = getD(status(await call(endpoint), 200));
  assert.equal(initial.attempts.length, 1);
  assert.equal(initial.attempts[0].reasoning, first.reasoning);
  assert.equal(initial.attempts[0].assistance, "none");
  assert.equal(initial.draft, null);
  assert.equal(initial.forms.transfer, null);
  assert.equal(Date.parse(initial.dueAt) - Date.parse(initial.attempts[0].createdAt), 7 * 86400000);
  status(await call(endpoint, { ...first, stage: "transfer", expectedRevision: 2 }), 409);
  const before = status(await call(endpoint, { ...draft, id: "A" }), 201);
  assert.equal(before.cases[0].draft.assistance, "none");
  const reveals = await Promise.all([call(solutions, { expectedOwnerId: owner }), call(solutions, { expectedOwnerId: owner })]);
  for (const result of reveals) assert.deepEqual(status(result, 200), { recorded: true });
  const after = status(await call(endpoint), 200);
  assert.equal(after.initialSolutionsSeen, true);
  assert.equal(after.cases[0].draft.assistance, "help");
  assert.equal(getD(after).attempts[0].assistance, "none");
  const newDraft = status(await call(endpoint, { ...draft, id: "B", assistance: "none" }), 201);
  assert.equal(newDraft.cases[1].draft.assistance, "help");
  const digitsC = Object.fromEntries(after.cases[2].forms.initial.fields.map(field => [field.key, "0"]));
  const freshAssisted = status(await call(endpoint, { ...first, id: "C", expectedRevision: 0, answers: digitsC, assistance: "none" }), 201);
  assert.equal(freshAssisted.cases[2].attempts[0].assistance, "help");
  const corrected = Object.fromEntries(initial.attempts[0].checks.map(check => [check.key, String(check.expected)]));
  const revision = getD(status(await call(endpoint, { ...first, expectedRevision: 2, answers: corrected, reasoning: "My corrected ledger." }), 201));
  assert.deepEqual(revision.attempts[0], initial.attempts[0]);
  assert.equal(revision.attempts[1].allCorrect, true);
  assert.equal(revision.attempts[1].attemptType, "correction");
  assert.equal(revision.attempts[1].assistance, "help");

  // Advance the isolated fixture's first submission, not the request clock. Even guessed transfer payloads were refused above.
  const then = new Date(Date.now() - 8 * 86400000).toISOString();
  sql(`UPDATE teaching_events SET created_at='${then}' WHERE user_id='${owner}' AND kind='practical' AND entity_id='D' AND revision=2`);
  sql(`INSERT INTO teaching_events (id,user_id,kind,entity_id,revision,payload,version,created_at)
       SELECT '${randomUUID()}','${peer}',kind,'B',revision,payload,version,created_at FROM teaching_events
       WHERE user_id='${owner}' AND kind='practical' AND entity_id='D' AND revision=2`);
  const open = status(await call(endpoint), 200);
  assert.equal(open.cases.find(item => item.id === "B").attempts.length, 0);
  assert.deepEqual(open.cases.filter(item => item.forms.transfer).map(item => item.id), ["D"]);
  const form = getD(open).forms.transfer;
  const transfer = { ...first, stage: "transfer", expectedRevision: 3, answers: Object.fromEntries(form.fields.map(field => [field.key, "0"])), reasoning: "Independent transfer working." };
  const complete = getD(status(await call(endpoint, transfer), 201));
  assert.equal(complete.attempts[2].stage, "transfer");
  assert.equal(complete.attempts[2].independent, true);
  assert.equal(complete.attempts[2].assistance, "none");
  status(await call(endpoint, transfer), 409);
  const again = getD(status(await call(endpoint, { ...transfer, expectedRevision: 4 }), 201));
  assert.equal(again.attempts[3].attemptType, "correction");
  assert.equal(again.attempts[3].independent, false);
  assert.ok(status(await call("/api/teaching"), 200).events.every(event => !["practical", "practical-solutions"].includes(event.kind)));
  const exported = status(await call("/api/teaching/export"), 200);
  assert.equal(exported.events.filter(event => event.kind === "practical" && event.entityId === "D").length, 5);
  assert.equal(exported.events.filter(event => event.kind === "practical-solutions").length, 1);
  assert.equal(exported.events.find(event => event.kind === "practical" && event.entityId === "B").payload.assistance, "help");
  cookie = "";
  assert.deepEqual(status(await call(endpoint), 200), guest);
  console.log(`Passed ${checks} HTTP status checks plus concurrent submission, release, correction, export and owner isolation assertions.`);
} finally {
  sql(`DELETE FROM teaching_events WHERE user_id IN ('${owner}','${peer}') AND ${filter}`);
  sql(`UPDATE teaching_events SET user_id='${owner}' WHERE user_id='${backup}' AND ${filter}`);
}
