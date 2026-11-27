import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { MEMO_BODY_BYTES, MEMO_FIELD_LIMIT } from '../lib/memo-limits.ts';

const base=new URL(process.env.LOCAL_API_BASE??'http://127.0.0.1:5173');
assert.ok(['127.0.0.1','localhost','[::1]'].includes(base.hostname));
assert.equal(base.protocol,'http:');
const owner='local_seedy', peer=`graduate_peer_${randomUUID()}`;
const tables=['graduate_submissions','graduate_practice'];
const value=v=>v===null?'NULL':typeof v==='number'?String(v):`CAST(X'${Buffer.from(String(v)).toString('hex')}' AS TEXT)`;
function sql(statement){return JSON.parse(execFileSync(process.execPath,['--import','./scripts/sites-env.mjs','./node_modules/wrangler/bin/wrangler.js','d1','execute','DB','--local','--config','dist/server/wrangler.json','--persist-to','.wrangler/state','--command',statement,'--json'],{encoding:'utf8',maxBuffer:8*1024*1024}))[0].results;}
let cookie='',checks=0;
async function call(path,method='GET',body,extra={}){
 const streaming=body instanceof ReadableStream;
 const response=await fetch(new URL(path,base),{method,redirect:'manual',headers:{...(cookie?{Cookie:cookie}:{}),...(method==='GET'?{}:{Origin:base.origin,'Content-Type':'application/json'}),...extra},...(body===undefined?{}:{body:streaming?body:JSON.stringify(body)}),...(streaming?{duplex:'half'}:{})});
 const text=await response.text(); let data;try{data=JSON.parse(text);}catch{data=text;} return {response,data,text};
}
function streamJson(value, escapeSurrogates=false) {
 const json=JSON.stringify(value);
 const wire=escapeSurrogates ? json.replace(/[\uD800-\uDFFF]/g, unit=>"\\u"+unit.charCodeAt(0).toString(16)) : json;
 const bytes=new TextEncoder().encode(wire);
 let offset=0;
 return new ReadableStream({pull(controller){
  if(offset===bytes.length){controller.close();return;}
  const end=Math.min(offset+4096,bytes.length);
  controller.enqueue(bytes.subarray(offset,end));offset=end;
 }});
}
function status(result,expected){assert.equal(result.response.status,expected,result.text.slice(0,300));checks++;return result.data;}
status(await call('/api/graduate'),401);
status(await call('/api/graduate/practice?moduleId=10'),401);
status(await call('/api/graduate/export'),401);
const sign=await call('/signin-with-chatgpt?return_to=/');status(sign,302);cookie=sign.response.headers.get('set-cookie').split(';',1)[0];
assert.equal(status(await call('/api/learning'),200).user.email,'seedy@sites.test');
const snapshot=Object.fromEntries(tables.map(table=>[table,sql(`SELECT * FROM ${table} WHERE user_id=${value(owner)}`)]));
const feedbackSubmissionIds=[];
try{
 for(const table of tables)sql(`DELETE FROM ${table} WHERE user_id=${value(owner)}`);
 sql(`INSERT INTO graduate_submissions VALUES (${value(randomUUID())},${value(peer)},10,1,'submission','{}','test','{}','2026-11-01')`);
 let state=status(await call('/api/graduate'),200);assert.deepEqual(state,{submissions:[],practice:[]});
 const answers={recommendation:'Protect the mandate with a budgeted comparison.',analysis:'Calculate all terminal cash and position balances.',risks:'Stress funding, liquidity, model and operational risks.',revision:'',reflection:''};
 const body={moduleId:10,expectedRevision:0,kind:'submission',answers};
 status(await call('/api/graduate','PUT',{...body,userId:peer}),400);
 status(await call('/api/graduate','PUT',body,{Origin:'https://example.invalid'}),403);
 status(await call('/api/graduate','PUT',{...body,answers:{...answers,analysis:'x'}}),400);
 status(await call('/api/graduate','PUT',{...body,answers:{...answers,analysis:'x'.repeat(MEMO_FIELD_LIMIT+1)}}),400);
 const oversized={...body,answers:{...answers,analysis:'x'.repeat(MEMO_BODY_BYTES)}};
 for(const data of [oversized,streamJson(oversized)]) {
  assert.match(status(await call('/api/graduate','PUT',data),413).error,/384 KiB/);
 }
 const saves=await Promise.all([call('/api/graduate','PUT',body),call('/api/graduate','PUT',body)]);
 assert.deepEqual(saves.map(result=>result.response.status).sort(),[201,409]);checks+=2;
 state=status(await call('/api/graduate'),200);assert.equal(state.submissions.length,1);assert.equal(state.submissions[0].revision,1);assert.equal(state.submissions[0].contentSnapshot.id,10);assert.ok(!('userId' in state.submissions[0]));
 const original=state.submissions[0].answers.recommendation;
 const revised=status(await call('/api/graduate','PUT',{...body,expectedRevision:1,answers:{...answers,revision:'The new cash requirement changes my recommendation.'}}),201).submission;
 assert.equal(revised.revision,2);
 state=status(await call('/api/graduate'),200);assert.equal(state.submissions.length,2);assert.equal(state.submissions.find(row=>row.revision===1).answers.recommendation,original);
 const practice=status(await call('/api/graduate/practice?moduleId=10'),200);assert.equal(practice.sequence,0);assert.equal(practice.questions.length,3);assert.ok(practice.questions.every(q=>!('expected' in q)&&!('answer' in q)));
 const responses=Object.fromEntries(practice.questions.map(q=>[q.id,0]));
 status(await call('/api/graduate/practice','POST',{moduleId:10,sequence:0,answers:responses,score:3}),400);
 status(await call('/api/graduate/practice','POST',{moduleId:10,sequence:0,answers:{a:0,b:0,c:0}}),400);
 const practiceBody={moduleId:10,sequence:0,answers:responses};
 const grades=await Promise.all([call('/api/graduate/practice','POST',practiceBody),call('/api/graduate/practice','POST',practiceBody)]);
 assert.deepEqual(grades.map(result=>result.response.status).sort(),[201,409]);checks+=2;
 const attempt=grades.find(result=>result.response.status===201).data.attempt;
 assert.equal(attempt.score,attempt.feedback.filter(q=>q.correct).length);
 assert.ok(attempt.feedback.every(q=>Number.isFinite(q.expected)&&q.explanation));
 status(await call('/api/graduate/practice','POST',practiceBody),409);
 assert.equal(status(await call('/api/graduate/practice?moduleId=10'),200).sequence,1);
 status(await call('/api/graduate/practice?moduleId=27'),400);
 const exported=status(await call('/api/graduate/export'),200);assert.equal(exported.submissions.length,2);assert.equal(exported.practice.length,1);assert.ok(!JSON.stringify(exported).includes(peer));
 const oldGreekAnswers={'g7-s0-q1':98,'g7-s0-q2':36,'g7-s0-q3':-4};
 const oldGreek=status(await call('/api/graduate/practice','POST',{moduleId:7,sequence:0,answers:oldGreekAnswers}),201).attempt;
 assert.equal(oldGreek.questionVersion,'2026-11-14.2');assert.equal(oldGreek.score,3);
 assert.deepEqual(oldGreek.feedback.map(q=>q.id),Object.keys(oldGreekAnswers));
 assert.match(oldGreek.feedback[0].prompt,/delta 0\.45, gamma 0\.04 per/);
 const greek=status(await call('/api/graduate/practice?moduleId=7'),200);
 assert.equal(greek.sequence,1);assert.match(greek.questions[0].prompt,/delta -0\.351, gamma 0\.0401 per/);
 const greekAnswers={'g7v2-s1-q1':123.35,'g7v2-s1-q2':-36.3,'g7v2-s1-q3':-8.02};
 assert.deepEqual(greek.questions.map(q=>q.id),Object.keys(greekAnswers));
 const mixed={...greekAnswers,'g7-s1-q2':-36.3};delete mixed['g7v2-s1-q2'];
 status(await call('/api/graduate/practice','POST',{moduleId:7,sequence:1,answers:mixed}),400);
 const gradedGreek=status(await call('/api/graduate/practice','POST',{moduleId:7,sequence:1,answers:greekAnswers}),201).attempt;
 assert.equal(gradedGreek.questionVersion,'2026-11-27.2');assert.equal(gradedGreek.score,3);
 assert.deepEqual(gradedGreek.feedback.map(q=>q.prompt),greek.questions.map(q=>q.prompt));
 const portfolio=status(await call('/api/graduate/practice?moduleId=24'),200);
 const portfolioAnswers={'g24v2-s0-q1':100,'g24v2-s0-q2':-650,'g24v2-s0-q3':2000};
 assert.deepEqual(portfolio.questions.map(q=>q.id),Object.keys(portfolioAnswers));
 const gradedPortfolio=status(await call('/api/graduate/practice','POST',{moduleId:24,sequence:0,answers:portfolioAnswers}),201).attempt;
 assert.equal(gradedPortfolio.questionVersion,'2026-11-27.1');assert.equal(gradedPortfolio.score,3);
 const international=[];
 for(const [revision,character] of ['学','\u0001','🌱'].entries()){
  const text=character.repeat(MEMO_FIELD_LIMIT);
  const full=Object.fromEntries(Object.keys(answers).map(key=>[key,text]));
  const memo={moduleId:9,kind:'submission',expectedRevision:revision,answers:full};
  assert.ok(Buffer.byteLength(JSON.stringify(memo)) > 64*1024);
  const saved=status(await call('/api/graduate','PUT',revision?streamJson(memo,character==='🌱'):memo),201).submission;
  assert.deepEqual(saved.answers,full);
  international.push(saved);
 }
 const recovered=status(await call('/api/graduate'),200).submissions;
 for(const saved of international) assert.deepEqual(recovered.find(row=>row.id===saved.id)?.answers,saved.answers);
 const maxMemo=international.at(-1);
 feedbackSubmissionIds.push(maxMemo.id);
 const feedback=status(await call('/api/teaching/feedback','POST',{submissionId:maxMemo.id}),201);
 assert.equal(feedback.feedback.submissionId,maxMemo.id);
 assert.equal(feedback.event.payload.contentVersion,maxMemo.contentVersion);

 const short={recommendation:'🌱'.repeat(19),analysis:'🌱'.repeat(20),risks:'🌱'.repeat(20),revision:'',reflection:''};
 const newMemo={moduleId:8,expectedRevision:0,kind:'submission',answers:short};
 status(await call('/api/graduate','PUT',newMemo),400);
 const draft=status(await call('/api/graduate','PUT',{...newMemo,kind:'draft'}),201).submission;
 const boundary=status(await call('/api/graduate','PUT',{...newMemo,expectedRevision:1,answers:{...short,recommendation:'🌱'.repeat(20)}}),201).submission;
 assert.deepEqual(draft.answers,short);
 assert.equal(Array.from(boundary.answers.recommendation).length,20);
 // Model a previously accepted short non-BMP commitment; historical feedback must not apply the new submission minimum.
 const legacyId=randomUUID();
 sql(`INSERT INTO graduate_submissions (id,user_id,module_id,revision,kind,answers,content_version,content_snapshot,created_at)
   SELECT ${value(legacyId)}, user_id, module_id, 3, 'submission', ${value(JSON.stringify(short))}, content_version, content_snapshot, created_at
   FROM graduate_submissions WHERE id=${value(boundary.id)} AND user_id=${value(owner)}`);
 feedbackSubmissionIds.push(legacyId);
 const history=status(await call('/api/graduate'),200).submissions;
 assert.deepEqual(history.find(row=>row.id===legacyId)?.answers,short);
 assert.equal(status(await call('/api/teaching/feedback','POST',{submissionId:legacyId}),201).feedback.submissionId,legacyId);
 console.log(`${checks} advanced API checks passed: authentication, isolation, immutable revisions, race protection, grading, export.`);
}finally{
 if(feedbackSubmissionIds.length)sql(`DELETE FROM teaching_events WHERE user_id=${value(owner)} AND kind='feedback' AND entity_id IN (${feedbackSubmissionIds.map(value).join(',')})`);
 for(const table of tables){
  sql(`DELETE FROM ${table} WHERE user_id IN (${value(owner)},${value(peer)})`);
  for(const row of snapshot[table])sql(`INSERT INTO ${table} (${Object.keys(row).join(',')}) VALUES (${Object.values(row).map(value).join(',')})`);
 }
 console.log('Portable learner records restored.');
}
