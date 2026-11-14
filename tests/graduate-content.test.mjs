import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
const modules=JSON.parse(readFileSync(new URL('../content/graduate.json',import.meta.url),'utf8'));
const skills=new Set(['contracts','valuation','execution','risk','research','communication']);
test('all advanced modules supply distinct teaching, staged decisions and assessable work',()=>{
 assert.deepEqual(modules.map(m=>m.id),Array.from({length:26},(_,i)=>i+1));
 assert.equal(new Set(modules.map(m=>m.caseStudy.title)).size,26);
 for(const m of modules){
  assert.ok(m.objective.length>35,`module ${m.id}: clear objective`);
  assert.ok(m.sections.length>=2,`module ${m.id}: supported teaching`);
  assert.ok(m.sections.reduce((n,s)=>n+s.body.length,0)>1000,`module ${m.id}: substantial instruction`);
  assert.ok(m.prerequisites.every(id=>Number.isInteger(id)&&id>0&&id<m.id),`module ${m.id}: coherent prerequisites`);
  assert.ok(m.competencies.length&&m.competencies.every(s=>skills.has(s)));
  for(const field of ['brief','exhibits','decisionPrompt','update','debrief'])assert.ok(m.caseStudy[field].length>60,`module ${m.id}: ${field}`);
  assert.ok(m.caseStudy.defense.length>=3);
  assert.ok(m.caseStudy.rubric.length>=3);
  assert.ok(m.caseStudy.samples.length>=3);
  assert.ok(m.assignment.deliverables.length>=3);
  assert.ok(m.reviewQuestions.length>=2);
  assert.ok(m.sources.length>=1&&m.sources.every(s=>s.url.startsWith('https://')));
  assert.ok(existsSync(resolve('..',m.sourceFile)),`module ${m.id}: primary course text`);
  assert.doesNotMatch(JSON.stringify(m),/<script\b|javascript\s*:/i);
 }
});
test('the flagship trade-design seminar and capstone include the evidence needed for a defense',()=>{
 const flagship=modules.find(m=>m.id===10);
 assert.ok(JSON.stringify(flagship).split(/\s+/).length>1500,'substantial flagship seminar');
 assert.match(JSON.stringify(flagship),/cash|funding/i);
 assert.match(JSON.stringify(flagship),/collar|protective put/i);
 assert.match(JSON.stringify(modules.at(-1)),/reproduc|audit|defen/i);
});
