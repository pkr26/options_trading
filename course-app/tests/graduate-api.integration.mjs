import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';

const base=new URL(process.env.LOCAL_API_BASE??'http://127.0.0.1:5173');
assert.ok(['127.0.0.1','localhost','[::1]'].includes(base.hostname));
assert.equal(base.protocol,'http:');
const owner='local_seedy', peer=`graduate_peer_${randomUUID()}`;
const tables=['graduate_submissions','graduate_practice'];
const value=v=>v===null?'NULL':typeof v==='number'?String(v):`CAST(X'${Buffer.from(String(v)).toString('hex')}' AS TEXT)`;
function sql(statement){return JSON.parse(execFileSync(process.execPath,['--import','./scripts/sites-env.mjs','./node_modules/wrangler/bin/wrangler.js','d1','execute','DB','--local','--config','dist/server/wrangler.json','--persist-to','.wrangler/state','--command',statement,'--json'],{encoding:'utf8',maxBuffer:8*1024*1024}))[0].results;}
let cookie='',checks=0;
async function call(path,method='GET',body,extra={}){
 const response=await fetch(new URL(path,base),{method,redirect:'manual',headers:{...(cookie?{Cookie:cookie}:{}),...(method==='GET'?{}:{Origin:base.origin,'Content-Type':'application/json'}),...extra},...(body===undefined?{}:{body:JSON.stringify(body)})});
 const text=await response.text(); let data;try{data=JSON.parse(text);}catch{data=text;} return {response,data,text};
}
function status(result,expected){assert.equal(result.response.status,expected,result.text.slice(0,300));checks++;return result.data;}
status(await call('/api/graduate'),401);
status(await call('/api/graduate/practice?moduleId=10'),401);
status(await call('/api/graduate/export'),401);
const sign=await call('/signin-with-chatgpt?return_to=/');status(sign,302);cookie=sign.response.headers.get('set-cookie').split(';',1)[0];
assert.equal(status(await call('/api/learning'),200).user.email,'seedy@sites.test');
const snapshot=Object.fromEntries(tables.map(table=>[table,sql(`SELECT * FROM ${table} WHERE user_id=${value(owner)}`)]));
try{
 for(const table of tables)sql(`DELETE FROM ${table} WHERE user_id=${value(owner)}`);
 sql(`INSERT INTO graduate_submissions VALUES (${value(randomUUID())},${value(peer)},10,1,'submission','{}','test','{}','2026-11-01')`);
 let state=status(await call('/api/graduate'),200);assert.deepEqual(state,{submissions:[],practice:[]});
 const answers={recommendation:'Protect the mandate with a budgeted comparison.',analysis:'Calculate all terminal cash and position balances.',risks:'Stress funding, liquidity, model and operational risks.',revision:'',reflection:''};
 const body={moduleId:10,expectedRevision:0,kind:'submission',answers};
 status(await call('/api/graduate','PUT',{...body,userId:peer}),400);
 status(await call('/api/graduate','PUT',body,{Origin:'https://example.invalid'}),403);
 status(await call('/api/graduate','PUT',{...body,answers:{...answers,analysis:'x'}}),400);
 status(await call('/api/graduate','PUT',{...body,answers:{...answers,analysis:'x'.repeat(70000)}}),413);
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
 console.log(`${checks} advanced API checks passed: authentication, isolation, immutable revisions, race protection, grading, export.`);
}finally{
 for(const table of tables){
  sql(`DELETE FROM ${table} WHERE user_id IN (${value(owner)},${value(peer)})`);
  for(const row of snapshot[table])sql(`INSERT INTO ${table} (${Object.keys(row).join(',')}) VALUES (${Object.values(row).map(value).join(',')})`);
 }
 console.log('Portable learner records restored.');
}
