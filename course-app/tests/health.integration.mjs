// Build first. Every database operation uses this test's new temporary D1 directory.
import assert from "node:assert/strict";
import {execFileSync,spawn} from "node:child_process";
import {mkdtempSync,readdirSync,readFileSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {fileURLToPath} from "node:url";
import {createServer} from "node:net";
import {once} from "node:events";
import {setTimeout as delay} from "node:timers/promises";

const root=fileURLToPath(new URL("../",import.meta.url));
const temporary=mkdtempSync(join(tmpdir(),"options-health-"));
const args=["--import","./scripts/sites-env.mjs","./node_modules/wrangler/bin/wrangler.js"];
const config=["--config","dist/server/wrangler.json","--local","--persist-to",temporary];
const reservation=createServer();
reservation.listen(0,"127.0.0.1");
await once(reservation,"listening");
const port=reservation.address().port;
await new Promise(resolve=>reservation.close(resolve));
const base=new URL("/api/health",`http://127.0.0.1:${port}`);
const server=spawn(process.execPath,[...args,"dev",...config,"--ip","127.0.0.1","--port",String(port),"--inspector-port","0"],{cwd:root,stdio:"ignore",detached:true});
const stopped=once(server,"exit");
const database=(...operation)=>execFileSync(process.execPath,[...args,"d1","execute","DB",...config,...operation],{cwd:root,stdio:"pipe"});
async function check(expected){
  const response=await fetch(base);
  assert.equal(response.status,expected);
  assert.match(response.headers.get("cache-control")??"",/no-store/i);
  const data=await response.json();
  assert.equal(data.status,expected===200?"ok":"unavailable");
  if(expected===200)assert.equal(data.database,"ready");
  else assert.deepEqual(Object.keys(data),["status"]);
}
try {
  for(let attempt=0;;attempt++){
    try {await fetch(base);break;} catch(error){if(attempt>=100||server.exitCode!==null)throw error;await delay(100);}
  }
  await check(503);
  const migrations=readdirSync(join(root,"drizzle")).filter(file=>file.endsWith(".sql")).sort();
  for(const [index,file] of migrations.entries()){
    database("--file",join(root,"drizzle",file));
    await check(index===migrations.length-1?200:503);
  }
  database("--command","ALTER TABLE notes ADD COLUMN migration_token TEXT NOT NULL");
  await check(503);
  database("--command","ALTER TABLE notes DROP COLUMN migration_token");
  await check(200);
  // Populated records are untouched by the probe.
  database("--command","INSERT INTO notes(user_id,lesson_id,content,updated_at) VALUES ('health-fixture',1,'local only','2026-01-01T00:00:00Z')");
  await check(200);
  database("--command","DROP INDEX teaching_events_owner_kind_entity_revision");
  await check(503);
  const definition=readFileSync(join(root,"drizzle","0003_workable_whirlwind.sql"),"utf8").match(/CREATE UNIQUE INDEX[^;]+;/)[0];
  database("--command",definition);
  await check(200);
  console.log(`Built Worker readiness verified on an empty D1, all ${migrations.length} migrations, populated data, missing index and repair.`);
} finally {
  if(server.exitCode===null){
    try{process.kill(-server.pid,"SIGTERM");}catch{/* Already stopped. */}
    await Promise.race([stopped,delay(3000)]);
    if(server.exitCode===null&&server.signalCode===null){try{process.kill(-server.pid,"SIGKILL");}catch{/* Already stopped. */}}
  }
  rmSync(temporary,{recursive:true,force:true});
}
