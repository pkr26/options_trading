import test from 'node:test';
import assert from 'node:assert/strict';
import {copyFileSync, cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, appendFileSync} from 'node:fs';
import {execFileSync, spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const app=fileURLToPath(new URL('../',import.meta.url));
const root=resolve(app,'..');

test('the freshness check detects changed lessons and attachments without repairing outputs',()=>{
  const fixture=mkdtempSync(resolve(tmpdir(),'options-content-'));
  try {
    const isolatedApp=resolve(fixture,'course-app');
    mkdirSync(resolve(isolatedApp,'scripts'),{recursive:true});
    for(const entry of readdirSync(root)) {
      if(entry.endsWith('.md') && entry!=='MY_LEARNING_RECORD.md') copyFileSync(resolve(root,entry),resolve(fixture,entry));
    }
    for(const directory of ['beginner','labs','scripts']) cpSync(resolve(root,directory),resolve(fixture,directory),{recursive:true});
    copyFileSync(resolve(app,'README.md'),resolve(isolatedApp,'README.md'));
    const script=resolve(isolatedApp,'scripts/import-course.mjs');
    copyFileSync(resolve(app,'scripts/import-course.mjs'),script);
    execFileSync(process.execPath,[script],{cwd:isolatedApp,stdio:'pipe'});
    execFileSync(process.execPath,[script,'--check'],{cwd:isolatedApp,stdio:'pipe'});
    const generated=['content/course.json','content/library.json','public/labs/options_lab.py','public/downloads/options-course.zip'];
    const before=new Map(generated.map(file=>[file,readFileSync(resolve(isolatedApp,file))]));
    appendFileSync(resolve(fixture,'beginner/01_MARKETS.md'),'\nA new source explanation awaits import.\n');
    appendFileSync(resolve(fixture,'labs/options_lab.py'),'\n# A changed teaching attachment.\n');
    const result=spawnSync(process.execPath,[script,'--check'],{cwd:isolatedApp,encoding:'utf8'});
    assert.equal(result.status,1,result.stdout+result.stderr);
    assert.match(result.stderr,/content\/course\.json/);
    assert.match(result.stderr,/public\/labs\/options_lab\.py/);
    assert.match(result.stderr,/public\/downloads\/options-course\.zip/);
    for(const [file,bytes] of before) assert.deepEqual(readFileSync(resolve(isolatedApp,file)),bytes,`${file} must remain untouched in check mode`);
  } finally {rmSync(fixture,{recursive:true,force:true});}
});
