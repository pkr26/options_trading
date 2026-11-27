import { getTableConfig } from "drizzle-orm/sqlite-core";
import * as schema from "./schema.ts";

// The application schema supplies the names and constraints. Keep unrelated additive
// tables and indexes out of the readiness query and never read learner rows.
const required = Object.values(schema).map(table => {
  const config = getTableConfig(table);
  const composite = config.primaryKeys.flatMap(key => key.columns.map(column => column.name));
  const primary = composite.length ? composite : config.columns.filter(column => column.primary).map(column => column.name);
  const uniqueIndexes = config.indexes.filter(index => index.config.unique).map(({ config: index }) => ({
    name: index.name,
    columns: index.columns.map(column => "name" in column ? column.name : null),
  }));
  return { name: config.name, columns: config.columns, primary, uniqueIndexes };
});
const tableNames = required.map(table => table.name);
const indexNames = required.flatMap(table => table.uniqueIndexes.map(index => index.name));
const placeholders = (names: string[]) => names.map(() => "?").join(", ");
const tableFilter = `t.type = 'table' AND t.name IN (${placeholders(tableNames)})`;

const columnSql = `SELECT t.name AS tableName, c.name, c.type, c."notnull" AS required,
    c.dflt_value AS defaultValue, c.pk
  FROM sqlite_schema t CROSS JOIN pragma_table_info(t.name) c
  WHERE ${tableFilter}`;
const indexSql = `SELECT t.name AS tableName, i.name AS indexName, i.origin, i."unique" AS isUnique,
    i.partial, x.seqno, x.name, x.coll, x."desc" AS descending
  FROM sqlite_schema t CROSS JOIN pragma_index_list(t.name) i CROSS JOIN pragma_index_xinfo(i.name) x
  WHERE ${tableFilter} AND (i.origin = 'pk' OR i.name IN (${placeholders(indexNames)})) AND x."key" = 1
  ORDER BY t.name, i.name, x.seqno`;

type ColumnRow = { tableName: string; name: string; type: string; required: number; defaultValue: string | null; pk: number };
type IndexRow = { tableName: string; indexName: string; origin: string; isUnique: number; partial: number;
  seqno: number; name: string | null; coll: string; descending: number };

function hasDefault(stored: string | null, expected: unknown) {
  if (expected === undefined) return true;
  if (typeof expected === "number") return stored !== null && stored.trim() !== "" && Number(stored) === expected;
  if (typeof expected === "string") return stored === "'" + expected.replaceAll("'", "''") + "'";
  return false;
}
function hasInsertDefault(stored: string | null) {
  if (stored === null) return false;
  // Reject an explicit NULL literal, including a parenthesized or commented spelling.
  // Expression defaults, CHECKs and triggers may be data-dependent; readiness does
  // not execute deployment-provided expressions or insert a probe learner record.
  const value = stored.replace(/\/\*[\s\S]*?\*\/|--[^\r\n]*/g, "").trim();
  return !/^(?:\(\s*)*null(?:\s*\))*$/i.test(value);
}
function matchesIndex(rows: IndexRow[], columns: (string | null)[]) {
  return rows.length === columns.length && rows.every((row, i) =>
    row.seqno === i && row.name !== null && row.name === columns[i] && row.isUnique === 1 &&
    row.partial === 0 && row.coll === "BINARY" && row.descending === 0);
}

export async function databaseReady(db: D1Database): Promise<boolean> {
  const [columnResult, indexResult] = await db.batch([
    db.prepare(columnSql).bind(...tableNames),
    db.prepare(indexSql).bind(...tableNames, ...indexNames),
  ]);
  if (!columnResult.success || !indexResult.success) return false;
  const columns = columnResult.results as ColumnRow[];
  const indexes = indexResult.results as IndexRow[];
  return required.every(table => {
    const actual = columns.filter(column => column.tableName === table.name);
    const complete = table.columns.every(column => {
      const row = actual.find(item => item.name === column.name);
      return row && row.type.toLowerCase() === column.getSQLType().toLowerCase() &&
        row.required === Number(column.notNull) && hasDefault(row.defaultValue, column.default);
    });
    if (!complete) return false;
    // table_info exposes ordinary writable columns and omits generated columns.
    // Unexpected PK definitions (including rowid aliases) are checked separately below.
    const blockingColumn = actual.some(row => row.required === 1 &&
      !table.columns.some(column => column.name === row.name) && !hasInsertDefault(row.defaultValue));
    if (blockingColumn) return false;
    const primary = actual.filter(column => column.pk > 0).sort((a, b) => a.pk - b.pk);
    if (primary.length !== table.primary.length || primary.some((column, i) => column.name !== table.primary[i])) return false;
    const tableIndexes = indexes.filter(row => row.tableName === table.name);
    const primaryIndex = tableIndexes.filter(row => row.origin === "pk");
    // SQLite implements single INTEGER primary keys with rowid rather than a separate index.
    if (primaryIndex.length && !matchesIndex(primaryIndex, table.primary)) return false;
    return table.uniqueIndexes.every(index => matchesIndex(tableIndexes.filter(row => row.indexName === index.name), index.columns));
  });
}
