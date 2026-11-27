import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { databaseReady } from "../db/readiness.ts";

const folder = new URL("../drizzle/", import.meta.url);
const migrations = readdirSync(folder).filter(file => /^\d+.*\.sql$/.test(file)).sort()
  .map(file => readFileSync(new URL(file, folder), "utf8"));

// The production function generates and executes both SQL statements. This adapter
// runs them on actual SQLite and supplies D1's prepare/bind/batch interface.
function fixture(t, statements = migrations) {
  const db = new DatabaseSync(":memory:");
  t.after(() => db.close());
  for (const statement of statements) db.exec(statement);
  const adapter = {
    prepare(sql) { return { bind(...params) { return () => db.prepare(sql).all(...params); } }; },
    async batch(batch) { return batch.map(run => ({ success: true, results: run() })); },
  };
  return { db, ready: () => databaseReady(adapter) };
}

test("health rejects a fresh database and every incomplete migration boundary", async t => {
  const { db, ready } = fixture(t, []);
  assert.equal(await ready(), false);
  for (const [index, migration] of migrations.entries()) {
    db.exec(migration);
    assert.equal(await ready(), index === migrations.length - 1, `after migration ${index}`);
  }
});

test("health accepts a populated, read-only database with unrelated extra schema and no migration ledger", async t => {
  const { db, ready } = fixture(t);
  db.exec(`INSERT INTO notes(user_id,lesson_id,content,updated_at) VALUES ('private learner',1,'private writing','2026-11-27');
    CREATE TABLE unrelated(value TEXT); CREATE INDEX notes_extra_index ON notes(updated_at);
    ALTER TABLE teaching_events ADD COLUMN optional_extra TEXT; PRAGMA query_only=ON;`);
  assert.equal(await ready(), true);
});

test("partial notes migration, broken revision definition or missing teaching table keeps health unavailable", async t => {
  const { db, ready } = fixture(t);
  db.exec("ALTER TABLE notes DROP COLUMN revision");
  assert.equal(await ready(), false);
  db.exec("ALTER TABLE notes ADD COLUMN revision INTEGER DEFAULT 0 NOT NULL");
  assert.equal(await ready(), false);
  db.exec("ALTER TABLE notes DROP COLUMN revision; ALTER TABLE notes ADD COLUMN revision INTEGER DEFAULT 1");
  assert.equal(await ready(), false);
  db.exec("ALTER TABLE notes DROP COLUMN revision; ALTER TABLE notes ADD COLUMN revision TEXT DEFAULT 1 NOT NULL");
  assert.equal(await ready(), false);
  db.exec("ALTER TABLE notes DROP COLUMN revision; ALTER TABLE notes ADD COLUMN revision INTEGER DEFAULT 1 NOT NULL");
  assert.equal(await ready(), true);
  db.exec("ALTER TABLE teaching_events RENAME TO renamed_events; CREATE VIEW teaching_events AS SELECT * FROM renamed_events");
  assert.equal(await ready(), false);
});

test("new required writable columns must accept an ordinary note insert that omits them", async t => {
  const { db, ready } = fixture(t);
  const insert = db.prepare("INSERT INTO notes(user_id,lesson_id,content,updated_at) VALUES ('fixture',?,'my note','2026-11-27')");
  let id = 0;
  for (const definition of ["TEXT NOT NULL", "TEXT NOT NULL DEFAULT NULL", "TEXT NOT NULL DEFAULT (( nUlL /* still null */ ))"]) {
    db.exec(`ALTER TABLE notes ADD COLUMN migration_token ${definition}`);
    assert.equal(await ready(), false, definition);
    assert.throws(() => insert.run(++id), /NOT NULL/);
    db.exec("ALTER TABLE notes DROP COLUMN migration_token");
  }
  for (const definition of [
    "TEXT", "TEXT DEFAULT NULL", "TEXT NOT NULL DEFAULT 'NULL'", "TEXT NOT NULL DEFAULT ''",
    "INTEGER NOT NULL DEFAULT 0", "TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP",
    "TEXT NOT NULL DEFAULT (printf('tag-%d', 1))",
    "INTEGER GENERATED ALWAYS AS (length(content)) VIRTUAL NOT NULL",
  ]) {
    db.exec(`ALTER TABLE notes ADD COLUMN migration_token ${definition}`);
    assert.equal(await ready(), true, definition);
    assert.equal(insert.run(++id).changes, 1);
    db.exec("DELETE FROM notes; ALTER TABLE notes DROP COLUMN migration_token");
  }
});

test("writes require all four named unique indexes with their actual full keys", async t => {
  const { db, ready } = fixture(t);
  const indexes = db.prepare("SELECT name,sql FROM sqlite_schema WHERE type='index' AND sql IS NOT NULL").all();
  assert.equal(indexes.length, 4);
  for (const index of indexes) {
    db.exec(`DROP INDEX "${index.name}"`);
    assert.equal(await ready(), false, `missing ${index.name}`);
    db.exec(index.sql.replace("CREATE UNIQUE INDEX", "CREATE INDEX"));
    assert.equal(await ready(), false, `nonunique ${index.name}`);
    db.exec(`DROP INDEX "${index.name}"; ${index.sql}`);
  }
  const name = "graduate_submissions_owner_module_revision";
  for (const definition of [
    "graduate_submissions(user_id,revision,module_id)",
    "graduate_submissions(user_id,module_id,revision,kind)",
    "graduate_submissions(user_id,module_id,revision) WHERE revision > 0",
    "graduate_submissions(user_id COLLATE NOCASE,module_id,revision)",
    "graduate_submissions(lower(user_id),module_id,revision)",
    "graduate_practice(user_id,module_id,sequence)",
  ]) {
    db.exec(`DROP INDEX ${name}; CREATE UNIQUE INDEX ${name} ON ${definition}`);
    assert.equal(await ready(), false, definition);
  }
});

test("single and composite primary keys must retain the required columns, order and identity collation", async t => {
  const { db, ready } = fixture(t);
  db.exec("ALTER TABLE notes RENAME TO old_notes");
  const fields = "user_id TEXT NOT NULL,lesson_id INTEGER NOT NULL,content TEXT NOT NULL,updated_at TEXT NOT NULL,revision INTEGER NOT NULL DEFAULT 1";
  for (const key of ["", ", PRIMARY KEY(lesson_id,user_id)", ", PRIMARY KEY(user_id,lesson_id,revision)", ", PRIMARY KEY(user_id COLLATE NOCASE,lesson_id)"]) {
    db.exec(`CREATE TABLE notes(${fields}${key})`);
    assert.equal(await ready(), false, key);
    db.exec("DROP TABLE notes");
  }
  db.exec(`CREATE TABLE notes(${fields}, PRIMARY KEY(user_id,lesson_id))`);
  assert.equal(await ready(), true);
  db.exec("DROP TABLE profiles; CREATE TABLE profiles(user_id TEXT NOT NULL UNIQUE, daily_minutes INTEGER DEFAULT 15 NOT NULL, timezone TEXT DEFAULT 'America/Phoenix' NOT NULL)");
  assert.equal(await ready(), false);
});
