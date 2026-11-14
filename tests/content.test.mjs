import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {dirname,resolve,posix} from 'node:path';
import {fileURLToPath} from 'node:url';

const app=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const root=resolve(app,'..');
const modules=JSON.parse(readFileSync(resolve(app,'content/course.json'),'utf8'));
const library=JSON.parse(readFileSync(resolve(app,'content/library.json'),'utf8'));

test('the imported course has 64 ordered lessons in eight complete modules',()=>{
  assert.equal(modules.length,8);
  assert.deepEqual(modules.flatMap(m=>m.lessons.map(l=>l.id)),Array.from({length:64},(_,i)=>i+1));
  for(const [i,module] of modules.entries()) {
    assert.equal(module.id,i+1);
    assert.equal(module.lessons.length,8);
    assert.ok(module.introduction.length>200,'preserve module assumptions/introduction');
    assert.ok(module.lessons.every(l=>l.moduleId===module.id));
    assert.match(module.checkpoint,/^## (?:Module|Checkpoint)/);
    assert.match(module.checkpoint,/<details>/);
  }
});

test('every lesson preserves teaching and a folded answer without absorbing later sections',()=>{
  for(const lesson of modules.flatMap(m=>m.lessons)) {
    assert.match(lesson.body,/worked (?:example|warm-up)/i,`Lesson ${lesson.id}: worked example`);
    assert.match(lesson.body,/try[ -]it/i,`Lesson ${lesson.id}: try-it question`);
    assert.match(lesson.body,/<details>\s*<summary>/i);
    assert.match(lesson.body,/<\/details>/i);
    assert.equal((lesson.body.match(/<details>/gi)??[]).length,(lesson.body.match(/<\/details>/gi)??[]).length);
    assert.doesNotMatch(lesson.body,/^##\s/m,`Lesson ${lesson.id}: following section leaked into lesson`);
    assert.doesNotMatch(lesson.title,/^[·:—–.-]/,`Lesson ${lesson.id}: heading separator`);
  }
  const last=modules.at(-1).lessons.at(-1);
  assert.equal(last.id,64);
  assert.doesNotMatch(last.body,/Module 8 checkpoint/);
  assert.match(modules.at(-1).checkpoint,/Module 8 checkpoint/);
});

test('full reference volumes and beginner study aids are available with distinct source paths',()=>{
  const files=new Set(library.map(r=>r.file));
  for(const file of ['README.md','beginner/README.md','beginner/GLOSSARY.md','beginner/WORKBOOK.md','beginner/REVIEW_PLAN.md','ADVANCED_FIRST_WEEK.md','ADVANCED_STUDY_GUIDE.md','LESSONS_01_FOUNDATIONS.md','LESSONS_02_BEHAVIOR.md','LESSONS_03_QUANT.md','LESSONS_04_RESEARCH.md','FOUNDATION_ASSESSMENTS.md','FOUNDATION_ANSWER_KEY.md','OPERATIONAL_CASEBOOK.md','RESEARCH_LAB.md','labs/README.md']) assert.ok(files.has(file),`${file}: missing resource`);
  assert.ok(!files.has('MY_LEARNING_RECORD.md'),'personal record must stay outside published course data');
  assert.equal(files.size,library.length);
  assert.match(modules[3].lessons[0].sourceFile,/^beginner\//);
  assert.match(modules[3].introduction,/\]\(beginner\/README\.md\)/,'source-relative beginner README link');
  assert.match(modules[3].introduction,/\]\(README\.md\)/,'distinct root README link');
});

test('Markdown links are normalized within the course root and content contains no active scripts',()=>{
  const sources=[...modules.flatMap(m=>[m.introduction,m.checkpoint,...m.lessons.map(l=>l.body)]),...library.map(r=>r.body)];
  for(const body of sources) {
    assert.doesNotMatch(body,/<script\b|javascript\s*:/i);
    for(const match of body.matchAll(/\]\(([^)\n]+)\)/g)) {
      const href=match[1];
      if(/^(?:[a-z][a-z\d+.-]*:|#|\/)/i.test(href)) continue;
      const target=href.split(/[?#]/)[0];
      assert.equal(posix.normalize(target),target,`noncanonical link ${href}`);
      assert.ok(!target.startsWith('../'),`escaped link ${href}`);
      if(target.endsWith('.md')) assert.ok(existsSync(resolve(root,target)),`missing Markdown target ${href}`);
    }
  }
});

test('hosted teaching attachments preserve source bytes at their linked paths',()=>{
  for(const [directory,pattern] of [['scripts',/\.py$/],['labs',/\.py$/],['labs/data',/\.(?:csv|json)$/]]) {
    const files=readdirSync(resolve(root,directory),{withFileTypes:true}).filter(entry=>entry.isFile()&&pattern.test(entry.name));
    assert.ok(files.length>0,`${directory}: no teaching fixtures`);
    for(const entry of files) {
      const file=`${directory}/${entry.name}`;
      assert.deepEqual(readFileSync(resolve(app,'public',file)),readFileSync(resolve(root,file)),`${file}: download differs from source`);
    }
  }
});

test('the offline ZIP contains only teaching files and omits personal records and app state',()=>{
  const zip=readFileSync(resolve(app,'public/downloads/options-course.zip'));
  const end=zip.length-22;
  assert.equal(zip.readUInt32LE(end),0x06054b50,'ZIP end record');
  const count=zip.readUInt16LE(end+10),offset=zip.readUInt32LE(end+16);
  const names=[];
  let cursor=offset;
  for(let i=0;i<count;i++) {
    assert.equal(zip.readUInt32LE(cursor),0x02014b50,'ZIP central entry');
    const nameSize=zip.readUInt16LE(cursor+28),extraSize=zip.readUInt16LE(cursor+30),commentSize=zip.readUInt16LE(cursor+32);
    const name=zip.subarray(cursor+46,cursor+46+nameSize).toString('utf8');
    names.push(name);
    assert.match(name,/^(?:[^/]+\.md|beginner\/[^/]+\.md|scripts\/[^/]+\.py|labs\/[^/]+\.py|labs\/data\/[^/]+\.(?:csv|json)|labs\/README\.md|course-app\/README\.md)$/);
    assert.doesNotMatch(name,/node_modules|\.env|\.wrangler|\.sites-runtime|(^|\/)\.\.(\/|$)/);
    const localOffset=zip.readUInt32LE(cursor+42);
    assert.equal(zip.readUInt32LE(localOffset),0x04034b50);
    const dataStart=localOffset+30+zip.readUInt16LE(localOffset+26)+zip.readUInt16LE(localOffset+28);
    const size=zip.readUInt32LE(cursor+24);
    const bytes=zip.subarray(dataStart,dataStart+size);
    if(name==='MY_LEARNING_RECORD.md') {
      assert.match(bytes.toString('utf8'),/^# Blank learning record for the offline course/);
      assert.notDeepEqual(bytes,readFileSync(resolve(root,name)),'original personal record must not enter download');
    } else if(name==='DOWNLOAD_README.md') {
      assert.match(bytes.toString('utf8'),/browser application source and dependencies are not included/);
    } else if(name==='course-app/README.md') {
      assert.match(bytes.toString('utf8'),/does not contain the frontend\/backend application source/);
    } else assert.deepEqual(bytes,readFileSync(resolve(root,name)),`${name}: ZIP bytes differ from course`);
    cursor+=46+nameSize+extraSize+commentSize;
  }
  assert.equal(cursor,end);
  assert.equal(new Set(names).size,names.length);
  for(const required of ['DOWNLOAD_README.md','MY_LEARNING_RECORD.md','course-app/README.md','README.md','beginner/01_MARKETS.md','beginner/08_PRACTICE.md','beginner/WORKBOOK.md','labs/README.md','labs/options_lab.py','labs/data/manifest.json','scripts/generate_foundation_cases.py']) assert.ok(names.includes(required),`${required}: missing from ZIP`);
});
