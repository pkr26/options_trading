import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { portfolioStream } from "../lib/portfolio-export.ts";

const dir = new URL("../drizzle/", import.meta.url);
const migrations = readdirSync(dir).filter(name => /^\d+.*\.sql$/.test(name)).sort();

function database(t, onPage) {
  const sqlite = new DatabaseSync(":memory:");
  t.after(() => sqlite.close());
  for (const file of migrations) sqlite.exec(readFileSync(new URL(file, dir), "utf8"));
  const insert = sqlite.prepare(`INSERT INTO attempts(rowid, id, user_id, module_id, variant, score, total, passed, created_at)
    VALUES (?, ?, 'owner', 1, 0, 1, 1, 1, '2026-11-27T00:00:00.000Z')`);
  // All rows predate sequence tracking and their 64-bit SQLite rowids cannot be
  // round-tripped through JS numbers. Both boundaries must survive D1 transport.
  for (let i = 0; i < 39; i++) insert.run(9007199254740993n + BigInt(i), `legacy-${i}`);
  const session = {
    prepare(sql) {
      return { bind(...values) {
        const run = () => ({ success: true, results: sqlite.prepare(sql).all(...values) });
        return { run, async all() { await onPage(); return run(); } };
      } };
    },
    async batch(statements) { return statements.map(statement => statement.run()); },
  };
  return { withSession(mode) { assert.equal(mode, "first-primary"); return session; } };
}

test("legacy NULL checkpoint cursor pages preserve large rowids and original missing evidence", async t => {
  let pages = 0;
  const stream = await portfolioStream(database(t, () => pages++), "owner", new AbortController().signal);
  const record = await new Response(stream).json();
  assert.equal(pages, 3);
  assert.deepEqual(record.records.attempts.map(row => row.id), Array.from({length: 39}, (_, i) => `legacy-${i}`));
  assert.ok(record.records.attempts.every(row => row.sequence === null && row.feedback === null && row.answers === null));
  assert.equal(record.index.counts.attempts, 39);
});

for (const interruption of ["cancel", "abort", "failure"]) {
  test(`export stops after an in-flight page on ${interruption}`, async t => {
    const pending = Promise.withResolvers();
    const release = Promise.withResolvers();
    const stopReason = new Error("test interruption");
    let pages = 0;
    const db = database(t, async () => {
      if (++pages === 2) {
        pending.resolve();
        await release.promise;
        if (interruption === "failure") throw stopReason;
      }
    });
    const abort = new AbortController();
    const reader = (await portfolioStream(db, "owner", abort.signal)).getReader();
    const decoder = new TextDecoder();
    let received = "";
    const consume = (async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) return;
        received += decoder.decode(value);
      }
    })();
    const completion = interruption === "cancel" ? consume : assert.rejects(consume, /test interruption/);
    await pending.promise;
    const cancelling = interruption === "cancel" ? reader.cancel() : undefined;
    if (interruption === "abort") abort.abort(stopReason);
    release.resolve();
    await Promise.all([completion, cancelling]);
    assert.equal(pages, 2);
    assert.match(received, /"id":"legacy-15"/);
    assert.doesNotMatch(received, /"id":"legacy-16"|"index":\{"counts"/);
    assert.throws(() => JSON.parse(received), SyntaxError);
  });
}
