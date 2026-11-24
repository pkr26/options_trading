import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {randomUUID} from 'node:crypto';
const base=new URL(process.env.LOCAL_API_BASE??'http://127.0.0.1:5173');
assert.ok(['localhost','127.0.0.1','[::1]'].includes(base.hostname));assert.equal(base.protocol,'http:');
const owner='local_seedy',peer=`teaching_peer_${randomUUID()}`,tables=['teaching_events','graduate_submissions','graduate_practice'];
const value=v=>v===null?'NULL':typeof v==='number'?String(v):`CAST(X'${Buffer.from(String(v)).toString('hex')}' AS TEXT)`;
function sql(statement){return JSON.parse(execFileSync(process.execPath,['--import','./scripts/sites-env.mjs','./node_modules/wrangler/bin/wrangler.js','d1','execute','DB','--local','--config','dist/server/wrangler.json','--persist-to','.wrangler/state','--command',statement,'--json'],{encoding:'utf8',maxBuffer:16*1024*1024}))[0].results;}
let cookie='',checks=0;
async function call(path,method='GET',body,headers={}){const response=await fetch(new URL(path,base),{method,redirect:'manual',headers:{...(cookie?{Cookie:cookie}:{}),...(method==='GET'?{}:{Origin:base.origin,'Content-Type':'application/json'}),...headers},...(body===undefined?{}:{body:JSON.stringify(body)})}).catch(async error=>{if(method!=='GET')throw error;return fetch(new URL(path,base),{redirect:'manual',headers:cookie?{Cookie:cookie}:{}});});const text=await response.text();let data;try{data=JSON.parse(text);}catch{data=text;}return {response,data,text};}
function status(result,expected){assert.equal(result.response.status,expected,result.text.slice(0,400));checks++;return result.data;}
for(const path of ['/api/teaching','/api/teaching/pilot','/api/teaching/artifact','/api/teaching/export'])status(await call(path),401);
status(await call('/api/teaching/tutor','POST',{action:'start'}),401);
const sign=await call('/signin-with-chatgpt?return_to=/');status(sign,302);cookie=sign.response.headers.get('set-cookie').split(';',1)[0];
assert.equal(status(await call('/api/learning'),200).user.email,'seedy@sites.test');
const snapshot=Object.fromEntries(tables.map(table=>[table,sql(`SELECT * FROM ${table} WHERE user_id=${value(owner)}`)]));
try{
 for(const table of tables)sql(`DELETE FROM ${table} WHERE user_id=${value(owner)}`);
 sql(`INSERT INTO teaching_events VALUES (${value(randomUUID())},${value(peer)},'feedback','private',1,'{"secret":"PEER REVIEW"}','test','2026-11-14')`);
 const initial=status(await call('/api/teaching'),200);assert.deepEqual(initial.events,[]);assert.equal(initial.pilot.enrollment,null);assert.ok(initial.plan.recommendations.length);
 status(await call('/api/teaching/tutor','POST',{action:'start',moduleId:4,userId:peer}),400);
 status(await call('/api/teaching/tutor','POST',{action:'start',moduleId:4},{Origin:'https://example.invalid'}),403);
 let session=status(await call('/api/teaching/tutor','POST',{action:'start',moduleId:4}),201).session;
 assert.equal(session.revision,1);assert.ok(!('expected' in session.question));assert.equal(session.turns.length,0);
 session=status(await call('/api/teaching/tutor','POST',{action:'hint',sessionId:session.id,expectedRevision:1}),201).session;
 assert.equal(session.revision,2);assert.equal(session.hintLevel,1);
 status(await call('/api/teaching/tutor','POST',{action:'answer',sessionId:session.id,expectedRevision:1,answer:0}),409);
 session=status(await call('/api/teaching/tutor','POST',{action:'answer',sessionId:session.id,expectedRevision:2,answer:0}),201).session;
 assert.equal(session.turns.length,1);assert.equal(session.turns[0].correct,false);assert.ok(session.teaching);
 const expected=session.turns[0].expected,question=session.question.prompt;
 session=status(await call('/api/teaching/tutor','POST',{action:'answer',sessionId:session.id,expectedRevision:session.revision,answer:expected}),201).session;
 assert.equal(session.phase,'transfer');assert.notEqual(session.question.prompt,question);
 const races=await Promise.all([call('/api/teaching/tutor','POST',{action:'answer',sessionId:session.id,expectedRevision:session.revision,answer:0}),call('/api/teaching/tutor','POST',{action:'answer',sessionId:session.id,expectedRevision:session.revision,answer:0})]);
 assert.deepEqual(races.map(r=>r.response.status).sort(),[201,409]);checks+=2;
 const answers={recommendation:'I recommend the protective put rather than reducing shares because it meets the stated risk objective.',analysis:'The initial protective put leaves $9,999 cash. I compare the same $110,000 starting wealth and costs.',risks:'Liquidity, assignment, funding and quote assumptions need scrutiny. The proposed floor does not guarantee executable fills.',revision:'The revised mandate requires $8,000 cash and I must recompute feasibility.',reflection:'I will record the alternative, question the assumptions and preserve the first response.'};
 const submission=status(await call('/api/graduate','PUT',{moduleId:10,expectedRevision:0,kind:'submission',answers}),201).submission;
 status(await call('/api/teaching/feedback','POST',{submissionId:randomUUID()}),404);
 const assessed=status(await call('/api/teaching/feedback','POST',{submissionId:submission.id}),201);assert.equal(assessed.feedback.submissionId,submission.id);assert.ok(assessed.feedback.criteria.length>=3);
 assert.equal(assessed.feedback.contentVersion,submission.contentVersion);
 sql(`UPDATE graduate_submissions SET content_snapshot=${value(JSON.stringify({...submission.contentSnapshot,title:'Earlier version of the packet'}))} WHERE id=${value(submission.id)}`);
 status(await call('/api/teaching/feedback','POST',{submissionId:submission.id}),409);
 sql(`UPDATE graduate_submissions SET content_snapshot=${value(JSON.stringify(submission.contentSnapshot))} WHERE id=${value(submission.id)}`);
 const packet=status(await call(`/api/teaching/review?submissionId=${submission.id}`),200);assert.equal(packet.submissionId,submission.id);assert.deepEqual(packet.answers,answers);
 const review={submissionId:submission.id,reviewerName:'Learner review',reviewerRole:'self',decision:'revise',criteria:packet.case.caseStudy.rubric.map(row=>({dimension:row.dimension,score:1,evidence:'I recommend the protective put',feedback:'The cash calculation must be corrected and reconciled.'})),challenge:'Does the specified portfolio satisfy the immediate cash constraint?',response:'The stated remaining cash was wrong; recompute it and reconsider the recommendation.',reviewedAt:new Date().toISOString()};
 status(await call('/api/teaching/review','POST',{...review,criteria:review.criteria.map(c=>({...c,evidence:'invented quotation that is absent'}))}),400);
 status(await call('/api/teaching/review','POST',{...review,decision:'accepted'}),400);
 status(await call('/api/teaching/review','POST',review),201);
 status(await call('/api/teaching/review','POST',{...review,reviewerName:'Recorded reviewer example',reviewerRole:'reported_external'}),201);
 status(await call('/api/teaching/review','POST',{...review,reviewerName:'Second reviewer example',reviewerRole:'reported_external'}),201);
 status(await call('/api/teaching/pilot','POST',{action:'enroll',moduleIds:[4,4,14],consent:true,priorExperience:'basic'}),400);
 let pilot=status(await call('/api/teaching/pilot','POST',{action:'enroll',moduleIds:[4,10,14],consent:true,priorExperience:'basic'}),201).pilot;assert.equal(pilot.revision,1);assert.deepEqual(pilot.enrollment.results,[]);assert.ok(pilot.enrollment.blueprintSignature);assert.equal(pilot.enrollment.priorExperience,'basic');assert.equal(pilot.enrollment.priorExposure.tutorSessions,1);
 status(await call('/api/teaching/pilot','POST',{action:'enroll',moduleIds:[4,10,14],consent:true,priorExperience:'basic'}),409);
 status(await call('/api/teaching/pilot?stage=day7'),409);
 const form=status(await call('/api/teaching/pilot?stage=baseline'),200);assert.equal(form.questions.length,9);assert.ok(form.questions.every(q=>!('expected' in q)));
 const pilotBody={action:'submit',stage:'baseline',expectedRevision:1,answers:Object.fromEntries(form.questions.map(q=>[q.id,0])),minutes:7,clarity:3,confidence:40,assistance:'notes'};
 pilot=status(await call('/api/teaching/pilot','POST',pilotBody),201).pilot;assert.equal(pilot.enrollment.results.length,1);assert.equal(pilot.enrollment.results[0].confidence,40);assert.equal(pilot.enrollment.results[0].assistance,'notes');assert.equal(pilot.revision,2);assert.equal(pilot.schedule.find(s=>s.stage==='day7').status,'scheduled');
 status(await call('/api/teaching/pilot','POST',pilotBody),409);
 status(await call('/api/teaching/pilot?stage=day30'),409);
 const artifactBody={expectedRevision:0,kind:'protocol',title:'Frozen hypothesis',body:'I specify a falsifiable hypothesis, benchmark, data fields, execution costs and failure criteria.',sourceUrl:'https://www.optionseducation.org/'};
 status(await call('/api/teaching/artifact','POST',{...artifactBody,sourceUrl:'javascript:alert(1)'}),400);
 let artifact=status(await call('/api/teaching/artifact','POST',artifactBody),201).event;
 const artifactId=artifact.entityId;artifact=status(await call('/api/teaching/artifact','POST',{...artifactBody,artifactId,expectedRevision:1,body:artifactBody.body+' This revision adds a trial log.'}),201).event;assert.equal(artifact.revision,2);
 status(await call('/api/teaching/artifact','POST',{...artifactBody,artifactId,expectedRevision:1}),409);
 const state=status(await call('/api/teaching'),200);assert.ok(!JSON.stringify(state).includes('PEER REVIEW'));assert.ok(state.events.some(e=>e.kind==='tutor'));assert.equal(state.events.filter(e=>e.kind==='review').length,3);
 const exported=status(await call('/api/teaching/export'),200);assert.ok(exported.events.length>=state.events.length);assert.ok(exported.events.some(event=>event.kind==='tutor'&&event.revision===1));assert.ok(!JSON.stringify(exported).includes(peer));
 console.log(`${checks} teaching API checks passed: adaptive branching, race protection, exact-submission feedback, quoted review evidence, real-date pilot, capstone revisions and isolation.`);
}finally{
 for(const table of tables){sql(`DELETE FROM ${table} WHERE user_id IN (${value(owner)},${value(peer)})`);for(const row of snapshot[table])sql(`INSERT INTO ${table} (${Object.keys(row).join(',')}) VALUES (${Object.values(row).map(value).join(',')})`);}
 console.log('Portable teaching and graduate records restored.');
}
