// Run from course-app against the loopback service sharing its migrated local D1.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getPlatformProxy } from "wrangler";
import { portfolioStream } from "../lib/portfolio-export.ts";

const base = new URL(process.env.LOCAL_API_BASE ?? "http://127.0.0.1:5173");
assert.equal(base.protocol, "http:");
assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(base.hostname));
const endpoint = "/api/export/portfolio";
const owner = "local_seedy", prefix = "portfolio-" + randomUUID(), peer = prefix + "-peer";
const stamp = "2026-01-12T13:14:15.000Z";
const names = {
  profile: ["profiles", "user_id"], progress: ["progress", "lesson_id"], notes: ["notes", "lesson_id"],
  attempts: ["attempts", "module_id,sequence,rowid"],
  graduateSubmissions: ["graduate_submissions", "module_id,revision"],
  graduatePractice: ["graduate_practice", "module_id,sequence"],
  teachingEvents: ["teaching_events", "kind,entity_id,revision"],
};
const directory = mkdtempSync(join(tmpdir(), "portfolio-export-"));
const quote = value => "'" + String(value).replaceAll("'", "''") + "'";
function execute(statements) {
  const file = join(directory, "fixture.sql");
  writeFileSync(file, statements.join(";\n") + ";\n");
  return JSON.parse(execFileSync(process.execPath, [
    "--import", "./scripts/sites-env.mjs", "./node_modules/wrangler/bin/wrangler.js", "d1", "execute", "DB",
    "--local", "--config", "dist/server/wrangler.json", "--persist-to", ".wrangler/state", "--file", file, "--json",
  ], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 })).map(result => result.results);
}
function readOwner(who) {
  const rows = execute(Object.values(names).map(([table, order]) =>
    `SELECT * FROM ${table} WHERE user_id=${quote(who)} ORDER BY ${order}`));
  return Object.fromEntries(Object.keys(names).map((key, index) => [key, rows[index]]));
}
const jsonColumns = new Set(["answers", "feedback", "content_snapshot", "payload"]);
function publicRow(row) {
  const fields = [];
  for (const [column, value] of Object.entries(row)) {
    if (column === "user_id") continue;
    const key = column.replace(/_([a-z])/g, (_, next) => next.toUpperCase());
    const decoded = value !== null && jsonColumns.has(column) ? JSON.parse(value) : column === "passed" ? Boolean(value) : value;
    fields.push([key, decoded]);
  }
  return Object.fromEntries(fields);
}
function insert(table, row) {
  const encode = value => value === null ? "NULL" : typeof value === "number" ? String(value) : quote(typeof value === "object" ? JSON.stringify(value) : value);
  return `INSERT INTO ${table} (${Object.keys(row).join(",")}) VALUES (${Object.values(row).map(encode).join(",")})`;
}
const originalModule = JSON.parse(readFileSync("content/graduate.json", "utf8"))[6];
function payload(kind, n, who) {
  const marker = `${who === peer ? peer : prefix} original #${n}: quote "risk", newline\nand Unicode Δ`;
  switch (kind) {
    case "tutor": return { phase: "retry", turns: [{ correct: false, assisted: true, prompt: marker }] };
    case "feedback": return { criteria: [{ status: "needs_work", evidence: marker }] };
    case "review": return { reviewerRole: "reported_external", decision: "revise", challenge: marker };
    case "artifact": return { kind: "protocol", title: "Frozen protocol", body: marker };
    case "pilot": return { priorExposure: { practiceSets: 2 }, blueprintSignature: marker,
      baselineAt: n < kinds.length ? null : stamp, results: n < kinds.length ? [] : [{stage: "baseline", score: 2, minutes: 8, assistance: "notes"}] };
    case "practical": {
      if (n < kinds.length) return {stage: "initial", action: "draft", answers: {exercisePayment: ""}, reasoning: marker};
      return {stage: n >= 3 * kinds.length ? "transfer" : "initial", action: "submit", answers: {exercisePayment: 5000},
        checks: [{key: "exercisePayment", expected: 5000, correct: true, explanation: marker}], reasoning: marker, assistance: "none",
        attemptType: n >= 2 * kinds.length ? "correction" : "first", allCorrect: true, independent: true};
    }
    case "practical-solutions": return { lessonId: 63, resource: "initial-solutions" };
    default: throw new Error("unknown teaching fixture");
  }
}
const kinds = ["tutor", "feedback", "review", "pilot", "artifact", "practical", "practical-solutions"];
const moduleId = 7;
function nextValue(rows, key) {
  return Math.max(-1, ...rows.filter(r => r.module_id === moduleId && r[key] !== null).map(r => r[key])) + 1;
}
function historyStatements(who, n, prior) {
  const id = `${prefix}-${who === peer ? "peer" : "owner"}-${n}`;
  const kind = kinds[n % kinds.length];
  const entity = `${prefix}-${kind}`;
  const version = `historical-release-${n}`;
  const snapshot = { ...originalModule, title: `Archived packet #${n}`,
    sections: [{id: "archived", title: "Original text", body: `Historical decision #${n}.\nEarlier contract terms and point-in-time rubric.`}] };
  const answers = {recommendation: `Historical recommendation #${n}`, analysis: "Costs quoted in dollars", risks: "Fill uncertain", revision: "", reflection: ""};
  const question = { id: "q1", prompt: "Supplied classroom terms", options: ["A", "B"], selected: 1, correctIndex: 0, correct: false, explanation: "The first choice matches the record." };
  // A full 16-row page ends inside a tie of historical NULL sequences.
  const legacy = n < 19;
  return [
    insert("attempts", {id: id + "-checkpoint", user_id: who, module_id: moduleId, variant: n % 2, score: 0, total: 1, passed: 0, created_at: stamp,
      sequence: legacy ? null : nextValue(prior.attempts, "sequence") + n, answers: legacy ? null : {q1: 1}, feedback: legacy ? null : [question], course_version: legacy ? null : version, question_version: legacy ? null : version}),
    insert("graduate_submissions", {id: id + "-memo", user_id: who, module_id: moduleId, revision: Math.max(1, nextValue(prior.graduateSubmissions, "revision")) + n,
      kind: n % 2 ? "submission" : "draft", answers, content_version: version, content_snapshot: snapshot, created_at: stamp}),
    insert("graduate_practice", {id: id + "-practice", user_id: who, module_id: moduleId, sequence: nextValue(prior.graduatePractice, "sequence") + n, score: 0, total: 1,
      feedback: [{ id: "historical-greek", prompt: "Archived prompt", answer: n, expected: n + 1, correct: false, explanation: "See the supplied archived quote." }], content_version: version, question_version: version, created_at: stamp}),
    insert("teaching_events", {id: id + "-event", user_id: who, kind, entity_id: entity, revision: 1 + Math.floor(n / kinds.length),
      payload: payload(kind, n, who), version, created_at: stamp}),
  ];
}
function mutableStatements(who, lessonId, hasProfile) {
  const statements = [
    insert("progress", {user_id: who, lesson_id: lessonId, completed_at: stamp, next_review_at: "2026-01-19", review_count: 2, review_revision: 4}),
    insert("notes", {user_id: who, lesson_id: lessonId, content: `${who === peer ? peer : prefix} note with a line break\nand "quotes"`, updated_at: stamp, revision: 8}),
  ];
  if (!hasProfile) statements.push(insert("profiles", {user_id: who, daily_minutes: 17, timezone: "America/Phoenix"}));
  return statements;
}
let cookie = "";
function get(path, authenticated = true) {
  return fetch(new URL(path, base), { redirect: "manual", headers: authenticated && cookie ? {Cookie: cookie} : {} });
}
function downloadHeaders(response, filename) {
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /application\/json/i);
  assert.match(response.headers.get("cache-control") ?? "", /\bprivate\b/i);
  assert.match(response.headers.get("cache-control") ?? "", /\bno-store\b/i);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("content-disposition"), `attachment; filename="${filename}"`);
}
function verifyDocument(doc, raw) {
  assert.equal(doc.formatVersion, 1);
  assert.equal(new Date(doc.exportedAt).toISOString(), doc.exportedAt);
  assert.ok(doc.interpretation && typeof doc.interpretation === "object");
  assert.deepEqual(Object.keys(doc.records).sort(), Object.keys(names).sort());
  const counts = {};
  const teachingKinds = {};
  for (const [name, rows] of Object.entries(raw)) {
    counts[name] = rows.length;
    assert.equal(doc.records[name].length, rows.length, name);
    rows.forEach((r, i) => assert.deepEqual(doc.records[name][i], publicRow(r), `${name} original database row ${i}`));
  }
  for (const r of raw.teachingEvents) teachingKinds[r.kind] = (teachingKinds[r.kind] ?? 0) + 1;
  assert.deepEqual(doc.index.counts, counts);
  assert.deepEqual(doc.index.teachingKinds, teachingKinds);
  assert.equal(doc.index.totalRecords, Object.values(counts).reduce((a, b) => a + b, 0));
  const serialized = JSON.stringify(doc);
  assert.ok(!serialized.includes(peer), "peer data leaked into export");
  assert.ok(!serialized.includes(owner), "internal owner identifier leaked into export");
  assert.doesNotMatch(serialized, /"(?:userId|user_id|_rowid_|rowid)"\s*:/i);
}
async function readRemainder(reader, first) {
  const chunks = [first.value];
  while (true) {
    const {done, value} = await reader.read();
    if (done) return JSON.parse(Buffer.concat(chunks).toString("utf8"));
    chunks.push(value);
  }
}
let before, lessonId, proxy, seeded = false;
try {
  const guest = await get(endpoint, false);
  assert.equal(guest.status, 401);
  assert.match(guest.headers.get("cache-control") ?? "", /no-store/);
  const sign = await get("/signin-with-chatgpt?return_to=/", false);
  assert.equal(sign.status, 302);
  cookie = sign.headers.get("set-cookie").split(";", 1)[0];
  const account = await get("/api/learning");
  assert.equal(account.status, 200);
  assert.equal((await account.json()).user.id, owner);

  before = readOwner(owner);
  const peerBefore = readOwner(peer);
  assert.ok(Object.values(peerBefore).every(rows => !rows.length));
  lessonId = 1;
  const used = new Set([...before.progress, ...before.notes].map(row => row.lesson_id));
  while (used.has(lessonId)) lessonId++;
  const seed = [
    ...mutableStatements(owner, lessonId, before.profile.length > 0),
    ...mutableStatements(peer, lessonId, false),
    ...historyStatements(peer, 0, peerBefore),
  ];
  // Each append-only section crosses two 16-row page boundaries. All dates are
  // tied, and every teaching kind has multiple revisions of one entity.
  const historyCount = 35;
  for (let i = 0; i < historyCount; i++) seed.push(...historyStatements(owner, i, before));
  seeded = true;
  execute(seed);
  const frozen = readOwner(owner);
  const response = await get(endpoint);
  downloadHeaders(response, "options-academy-portfolio.json");
  const reader = response.body.getReader();
  const first = await reader.read();
  assert.ok(!first.done && first.value.length);
  // An HTTP client or proxy may already have buffered an entire small download.
  // Pause the production projector itself after its header, on the same local D1,
  // before its generators can advance from the mutable section to a history page.
  proxy = await getPlatformProxy({configPath: "dist/server/wrangler.json", persist: {path: ".wrangler/state/v3"}, envFiles: [], remoteBindings: false});
  const projected = await portfolioStream(proxy.env.DB, owner, new AbortController().signal);
  const projectedReader = projected.getReader();
  const projectedFirst = await projectedReader.read();
  assert.ok(Buffer.from(projectedFirst.value).toString("utf8").endsWith('"records":{'));
  // Backdate all four appends so a time-only fence would admit them. The
  // already-started download must also retain the earlier note and revision.
  execute([
    ...historyStatements(owner, historyCount, before),
    `UPDATE notes SET content=${quote(prefix + " later note")}, revision=9 WHERE user_id=${quote(owner)} AND lesson_id=${lessonId} AND revision=8`,
  ]);
  verifyDocument(await readRemainder(reader, first), frozen);
  verifyDocument(await readRemainder(projectedReader, projectedFirst), frozen);
  const latest = readOwner(owner);
  for (const name of ["attempts", "graduateSubmissions", "graduatePractice", "teachingEvents"]) {
    assert.equal(latest[name].length, frozen[name].length + 1, name);
  }
  const second = await get(endpoint);
  downloadHeaders(second, "options-academy-portfolio.json");
  verifyDocument(await second.json(), latest);
  assert.equal(latest.notes.find(r => r.lesson_id === lessonId).revision, 9);
  const legacyRoutes = [
    ["/api/export?format=json", "options-academy-learning.json", 2, "attempts", "attempts"],
    ["/api/graduate/export", "options-academy-advanced-evidence.json", 1, "submissions", "graduateSubmissions"],
    ["/api/teaching/export", "options-academy-teaching-evidence.json", 1, "events", "teachingEvents"],
  ];
  for (const [path, filename, version, list, key] of legacyRoutes) {
    const legacy = await get(path);
    downloadHeaders(legacy, filename);
    const data = await legacy.json();
    assert.equal(data.formatVersion, version);
    const expectedIds = latest[key].filter(r => r.id.startsWith(prefix)).map(r => r.id).sort();
    assert.deepEqual(data[list].filter(r => r.id.startsWith(prefix)).map(r => r.id).sort(), expectedIds);
    assert.ok(!JSON.stringify(data).includes(peer));
  }
  const csv = await get("/api/export?format=csv");
  assert.equal(csv.status, 200);
  assert.match(csv.headers.get("content-type"), /text\/csv/);
  assert.match(csv.headers.get("content-disposition"), /options-academy-learning\.csv/);
  const csvText = await csv.text();
  assert.ok(csvText.includes(prefix + " later note") && !csvText.includes(peer));
  console.log(`Verified ${Object.keys(names).length} local D1 tables, ${kinds.length} teaching kinds, ${historyCount} fixtures in each paged history, two snapshot boundaries and four legacy downloads.`);
} finally {
  try {
    if (seeded) {
      const cleanup = [];
      for (const key of ["attempts", "graduateSubmissions", "graduatePractice", "teachingEvents"]) {
        cleanup.push(`DELETE FROM ${names[key][0]} WHERE user_id IN (${quote(owner)},${quote(peer)}) AND id GLOB ${quote(prefix + "-*")}`);
      }
      for (const table of ["notes", "progress"]) cleanup.push(`DELETE FROM ${table} WHERE user_id IN (${quote(owner)},${quote(peer)}) AND lesson_id=${lessonId}`);
      cleanup.push(`DELETE FROM profiles WHERE user_id=${quote(peer)}`);
      if (!before.profile.length) cleanup.push(`DELETE FROM profiles WHERE user_id=${quote(owner)} AND daily_minutes=17 AND timezone='America/Phoenix'`);
      execute(cleanup);
      assert.deepEqual(readOwner(owner), before, "pre-existing learner records changed");
      assert.ok(Object.values(readOwner(peer)).every(rows => !rows.length));
    }
  } finally {
    if (proxy) await proxy.dispose();
    rmSync(directory, {recursive: true, force: true});
  }
}
