import { getTableColumns, getTableName } from "drizzle-orm";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";
import { attempts, graduatePractice, graduateSubmissions, notes, profiles, progress, teachingEvents } from "../db/schema.ts";

const mutable = { profile: profiles, progress, notes };
const histories = { attempts, graduateSubmissions, graduatePractice, teachingEvents };
type History = keyof typeof histories;
type RawRow = Record<string, string | number | null>;

// Match the existing owner-prefixed indexes. Legacy checkpoint attempts can share
// a NULL sequence, so use the index's implicit rowid suffix to break those ties.
const order: Record<History, string[]> = {
  attempts: ["module_id", "sequence", "rowid"],
  graduateSubmissions: ["module_id", "revision"],
  graduatePractice: ["module_id", "sequence"],
  teachingEvents: ["kind", "entity_id", "revision"],
};
const historyNames = Object.keys(histories) as History[];
const pageSize = 16;

function publicFields(table: SQLiteTable) {
  return Object.entries(getTableColumns(table)).filter(([name]) => name !== "userId");
}
function selectFields(table: SQLiteTable) {
  return publicFields(table).map(([, column]) => column.name).join(", ");
}
function publicRow(table: SQLiteTable, row: RawRow) {
  return Object.fromEntries(publicFields(table).map(([name, column]) => {
    const value = row[column.name];
    return [name, value === null ? null : column.mapFromDriverValue(value)];
  }));
}

const interpretation = {
  scope: "This file includes your saved course records at the export time. Work kept only in your browser stays on that device.",
  currentRecords: "Profile, progress and notes show the latest saved values. An empty section means there was no saved record.",
  histories: "Attempts, graduate memo drafts and submissions, graduate practice and teaching events retain their stored revisions, versions, feedback and snapshots. Older checkpoints may have null answers, feedback or version fields.",
  teachingEvents: "Read each kind and entityId in revision order. Pilot and tutor revisions may contain earlier observations. Count distinct measurements within a case or pilot when interpreting learning outcomes.",
  practical: "Lesson 63 distinguishes initial work, later corrections and transfer. The practical-solutions event records access to the combined initial solutions. Use recorded assistance and stage for each submission.",
  assessment: "Automated checks are formative. Reviews preserve the source reported by the learner. Missing assessments remain unmeasured.",
  index: "Counts give the number of stored rows in each section and for each observed teaching event kind.",
};

function afterCursor(section: History, cursor: RawRow | undefined) {
  if (!cursor) return { clause: "", values: [] };
  if (section === "attempts" && cursor.sequence === null) {
    // SQLite row comparisons with NULL evaluate to unknown within the same module.
    return {
      clause: " AND module_id >= ? AND (module_id > ? OR sequence IS NOT NULL OR rowid > CAST(? AS INTEGER))",
      values: [cursor.module_id, cursor.module_id, cursor.rowid],
    };
  }
  const keys = order[section];
  const placeholders = keys.map(key => key === "rowid" ? "CAST(? AS INTEGER)" : "?");
  return { clause: ` AND (${keys.join(", ")}) > (${placeholders.join(", ")})`, values: keys.map(key => cursor[key]) };
}

async function* historyRows(session: D1DatabaseSession, owner: string, section: History, cutoff: string | number | null, stopped: () => boolean) {
  if (cutoff === null) return;
  const table = histories[section];
  const fields = selectFields(table);
  let cursor: RawRow | undefined;
  while (!stopped()) {
    const after = afterCursor(section, cursor);
    // Keep 64-bit SQLite rowids as decimal text across the D1/JavaScript boundary.
    const sql = `SELECT ${fields}, CAST(rowid AS TEXT) AS rowid FROM ${getTableName(table)}
      WHERE user_id = ? AND rowid <= CAST(? AS INTEGER)${after.clause}
      ORDER BY ${order[section].map(key => key === "rowid" ? `${getTableName(table)}.rowid` : key).join(", ")} LIMIT ?`;
    const { results } = await session.prepare(sql).bind(owner, cutoff, ...after.values, pageSize).all<RawRow>();
    for (const row of results) {
      if (stopped()) return;
      yield row;
    }
    if (results.length < pageSize) return;
    cursor = results[results.length - 1];
  }
}

export async function portfolioStream(database: D1Database, owner: string, signal: AbortSignal) {
  signal.throwIfAborted();
  const session = database.withSession("first-primary");
  // All mutable state and all high-water marks share one read transaction. Subsequent
  // pages use that same D1 session and can only see immutable rows inside its cutoffs.
  // The four history tables are append-only and use SQLite-assigned rowids.
  const limits = historyNames.map(name =>
    `(SELECT CAST(MAX(rowid) AS TEXT) FROM ${getTableName(histories[name])} WHERE user_id = ?1) AS ${name}`);
  const mutableSections = Object.entries(mutable);
  const [boundary, ...snapshot] = await session.batch<RawRow>([
    session.prepare(`SELECT strftime('%Y-%m-%dT%H:%M:%fZ', 'now') AS exportedAt, ${limits.join(", ")}`).bind(owner),
    ...mutableSections.map(([name, table]) => session.prepare(
      `SELECT ${selectFields(table)} FROM ${getTableName(table)} WHERE user_id = ?${name === "profile" ? "" : " ORDER BY lesson_id"}`
    ).bind(owner)),
  ]);
  signal.throwIfAborted();
  const cutoffs = boundary.results[0];
  let stopped = false;

  async function* document() {
    const counts: Record<string, number> = {};
    const teachingKinds: Record<string, number> = Object.create(null);
    const header = JSON.stringify({ formatVersion: 1, exportedAt: cutoffs.exportedAt, interpretation });
    yield header.slice(0, -1) + ',"records":{';
    for (const [i, [name, table]] of mutableSections.entries()) {
      const rows = snapshot[i].results;
      counts[name] = rows.length;
      yield (i ? "," : "") + JSON.stringify(name) + ":[";
      for (const [j, row] of rows.entries()) yield (j ? "," : "") + JSON.stringify(publicRow(table, row));
      yield "]";
    }
    for (const name of historyNames) {
      counts[name] = 0;
      yield "," + JSON.stringify(name) + ":[";
      for await (const row of historyRows(session, owner, name, cutoffs[name], () => stopped)) {
        if (name === "teachingEvents") {
          const kind = String(row.kind);
          teachingKinds[kind] = (teachingKinds[kind] ?? 0) + 1;
        }
        yield (counts[name]++ ? "," : "") + JSON.stringify(publicRow(histories[name], row));
      }
      yield "]";
    }
    const totalRecords = Object.values(counts).reduce((total, count) => total + count, 0);
    yield '},"index":' + JSON.stringify({ counts, teachingKinds, totalRecords }) + "}";
  }

  const chunks = document();
  const encoder = new TextEncoder();
  let onAbort: () => void;
  function stop() {
    stopped = true;
    signal.removeEventListener("abort", onAbort);
  }
  return new ReadableStream<Uint8Array>({
    start(controller) {
      onAbort = () => {
        stop();
        controller.error(signal.reason);
        void chunks.return(undefined);
      };
      signal.addEventListener("abort", onAbort, { once: true });
    },
    async pull(controller) {
      try {
        const next = await chunks.next();
        if (stopped) return;
        if (next.done) { stop(); controller.close(); }
        else controller.enqueue(encoder.encode(next.value));
      } catch (error) {
        if (!stopped) { stop(); controller.error(error); }
      }
    },
    async cancel() {
      stop();
      await chunks.return(undefined);
    },
  });
}
