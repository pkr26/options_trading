/** Nonmutating Teaching Studio browser checks, using explicit server fixtures. */
import assert from 'node:assert/strict';
import { readFileSync, mkdirSync } from 'node:fs';
import { chromium, expect } from '@playwright/test';
const base=new URL(process.env.LOCAL_API_BASE??'http://127.0.0.1:5173');
assert.ok(['127.0.0.1','localhost','[::1]'].includes(base.hostname));
assert.equal(base.protocol,'http:');
const modules=JSON.parse(readFileSync(new URL('../content/graduate.json',import.meta.url),'utf8'));
const now='2026-11-14T15:00:00.000Z';
const sid='81580474-6ce7-4564-8a79-7886972182ee';
const submission={id:'e8df3026-2dbe-4a42-9791-f09cb6eb29fa',moduleId:10,revision:1,kind:'submission',createdAt:now,contentVersion:'test-v1',contentSnapshot:modules[9],answers:{recommendation:'Compare the portfolio alternatives with explicit cash balances.',analysis:'Reconcile all cash balances and terminal wealth using the same initial resources.',risks:'Preserve uncertainty about execution, funding, and assignment requirements.',revision:'The changed cash mandate changes the feasible alternatives.',reflection:'Defend the calculations with reproducible working.'}};
const state={events:[],plan:{generatedAt:now,summary:'A recent contract-unit error calls for targeted remediation.',recommendations:[{moduleId:4,skill:'contracts',reason:'Reconcile the exercise cash before advancing.',priority:100,action:'remediate'}]},pilot:{enrollment:null,revision:0,schedule:[]}};
let session=null,conflictNext=false,reviewReceived=null;
const firstQuestion={id:'t1',skill:'contracts',prompt:'One standard option costs $2 per share. What cash is paid with multiplier100?',unit:'USD',hint:'Premium per share times100.'};
const transferQuestion={...firstQuestion,id:'t2',prompt:'A changed case costs $3 per share. What cash is paid with multiplier100?'};
function event(kind,entityId,payload,revision=1){const row={id:crypto.randomUUID(),kind,entityId,revision,payload:structuredClone(payload),createdAt:now};state.events.push(row);return row;}
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000}});
await context.route('**/api/learning',route=>route.fulfill({json:{user:{name:'Test',email:'test@example.test'},profile:{dailyMinutes:15,timezone:'America/Phoenix'},progress:[],notes:[],attempts:[]}}));
await context.route('**/api/graduate',route=>route.fulfill({json:{submissions:[submission],practice:[]}}));
await context.route('**/api/teaching',route=>route.fulfill({json:state}));
await context.route('**/api/teaching/tutor',async route=>{
 const input=route.request().postDataJSON();
 if(input.action==='start'){session={id:sid,moduleId:4,sequence:0,questionIndex:0,revision:1,phase:'question',hintLevel:0,question:firstQuestion,turns:[],teaching:'First separate per-share premium from contract cash.',nextStep:'Answer before opening help.',createdAt:now};}
 else if(conflictNext){conflictNext=false;session.revision++;event('tutor',sid,session,session.revision);return route.fulfill({status:409,json:{error:'A newer tutor revision is saved. Your unsent answer remains available for comparison.'}});}
 else{session.revision++;if(input.action==='hint'){session.hintLevel++;session.teaching='Multiply the per-share premium by the contract multiplier.';}else if(input.action==='explain'){session.teaching='The worked example uses $2 times100=$200. Now explain the units.';session.hintLevel=3;}else{const correct=input.answer===(session.phase==='transfer'?300:200);session.turns.push({prompt:session.question.prompt,answer:input.answer,correct,assisted:session.hintLevel>0,expected:session.phase==='transfer'?300:200,explanation:correct?'The premium and multiplier reconcile.':'You entered a per-share amount. Convert it into total contract cash.',at:now});if(!correct){session.phase='retry';session.teaching='You entered a per-share amount. Rebuild the contract cash from its units.';}else if(session.phase==='transfer'){session.phase='complete';session.question=null;session.nextStep='Bring this reasoning into the assignment ledger.';}else{session.phase='transfer';session.question=transferQuestion;session.hintLevel=0;session.teaching='Apply the correction to changed inputs.';}}}
 event('tutor',sid,session,session.revision);return route.fulfill({json:{session}});
});
await context.route('**/api/teaching/feedback',async route=>{
 const input=route.request().postDataJSON();assert.equal(input.submissionId,submission.id);
 const feedback={submissionId:submission.id,moduleId:10,version:'test-v1',summary:'Reconcile the comparison before defending the recommendation.',criteria:modules[9].caseStudy.rubric.map((item,i)=>({dimension:item.dimension,status:i===0?'needs_work':'review_needed',evidence:'Compare the portfolio alternatives',feedback:'Show how the quoted recommendation follows from the documented portfolio calculation.',nextQuestion:'Which cash obligation would change this recommendation?'})),alerts:[{claim:'explicit cash balances',explanation:'A claim to have considered cash needs a reproducible supporting ledger.'}],numericalChecks:[{label:'Portfolio cash reconciliation',status:'not_supplied',explanation:'No explicit dollar balance was supplied for this comparison.'}],nextActions:['Add the cash ledger and defend the strongest alternative.'],createdAt:now};
 return route.fulfill({json:{feedback,event:event('feedback',submission.id,feedback)}});
});
await context.route('**/api/teaching/review',async route=>{
 reviewReceived=route.request().postDataJSON();return route.fulfill({json:{event:event('review',submission.id,reviewReceived)}});
});
await context.route('**/api/teaching/pilot**',async route=>{
 if(route.request().method()==='GET'){return route.fulfill({json:{...state.pilot,stage:'baseline',questions:[{id:'p1',skill:'contracts',prompt:'Compute the cash premium for one standard contract at $2/share.',unit:'USD',hint:''},{id:'p2',skill:'risk',prompt:'Compute the difference between $500 and $300.',unit:'USD',hint:''},{id:'p3',skill:'valuation',prompt:'Compute intrinsic call value at stock52, strike50.',unit:'USD/share',hint:''}]}});}
 const input=route.request().postDataJSON();
 if(input.action==='enroll'){state.pilot={revision:1,enrollment:{id:'pilot1',moduleIds:input.moduleIds,version:'test-v1',enrolledAt:now,baselineAt:null,seed:0,results:[]},schedule:[{stage:'baseline',dueAt:now,status:'available'},{stage:'day7',dueAt:null,status:'awaiting_baseline'},{stage:'day30',dueAt:null,status:'awaiting_baseline'}]};}
 else{assert.equal(input.expectedRevision,1);state.pilot.revision=2;state.pilot.enrollment.baselineAt=now;state.pilot.enrollment.results=[{stage:'baseline',completedAt:now,score:3,total:3,minutes:input.minutes,clarity:input.clarity,feedback:[{id:'p1',prompt:'One contract at $2/share.',unit:'USD',hint:'',skill:'contracts',answer:200,expected:200,correct:true,explanation:'Multiply2 by100.'}]}];state.pilot.schedule=[{stage:'baseline',dueAt:now,status:'completed'},{stage:'day7',dueAt:'2026-11-21T15:00:00.000Z',status:'scheduled'},{stage:'day30',dueAt:'2026-12-14T15:00:00.000Z',status:'scheduled'}];}
 event('pilot','learner-pilot',state.pilot.enrollment,state.pilot.revision);return route.fulfill({json:{pilot:state.pilot}});
});
const results={};mkdirSync('outputs/teaching-studio',{recursive:true});
try{
 const page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(base.href+'#advanced/module/10/teaching');
 await expect(page.getByRole('heading',{name:'Teaching that responds to your reasoning.'})).toBeVisible();
 await page.getByRole('button',{name:'Begin recommended tutoring'}).click();
 await expect(page.getByLabel(/Your tutor answer/)).toBeVisible();
 await page.getByRole('button',{name:'Give me a hint',exact:true}).click();
 await expect(page.locator('.teaching-coaching')).toContainText('Multiply the per-share');
 await page.getByLabel(/Your tutor answer/).fill('2');
 await page.getByRole('button',{name:'Check this step',exact:true}).click();
 await expect(page.locator('.teaching-session-meta')).toContainText('Correct and try again');
 await expect(page.locator('.teaching-turns')).toContainText('Assisted practice');
 conflictNext=true;await page.getByLabel(/Your tutor answer/).fill('200');await page.getByRole('button',{name:'Check this step',exact:true}).click();
 await expect(page.locator('.teaching-notice[role=alert]')).toContainText('newer tutor revision');await expect(page.getByLabel(/Your tutor answer/)).toHaveValue('200');
 await page.getByRole('button',{name:'Check this step',exact:true}).click();
 await expect(page.locator('.teaching-session-meta')).toContainText('Transfer check');
 await page.getByLabel(/Your tutor answer/).fill('300');await page.getByRole('button',{name:'Check this step',exact:true}).click();
 await expect(page.locator('.teaching-session-meta')).toContainText('Session complete');
 results.tutor='Hint use, misconception correction, revision conflict, transfer, and saved history are visible.';
 await page.getByRole('button',{name:'Writing feedback',exact:true}).click();await page.getByRole('button',{name:'Evaluate this saved version'}).click();
 await expect(page.locator('.teaching-writing-feedback')).toContainText('No explicit dollar balance');
 await expect(page.locator('.teaching-feedback-criterion')).toHaveCount(4);
 results.feedback='Feedback identifies the exact saved submission, evidence, numerical gaps and follow-up questions.';
 await page.getByRole('button',{name:'Review desk',exact:true}).click();
 await page.getByLabel('Reviewer name',{exact:true}).fill('Test self-review');
 for(let i=1;i<=4;i++){await page.locator('.teaching-review-criterion').nth(i-1).getByRole('combobox').selectOption('2');await page.getByLabel(`Criterion ${i} quoted evidence`,{exact:true}).fill('Compare the portfolio alternatives');await page.getByLabel(`Criterion ${i} feedback`,{exact:true}).fill('Add a complete calculation supporting this claim and its uncertainty.');}
 await page.getByLabel('The reviewer’s challenge',{exact:true}).fill('Explain whether the updated mandate changes the cash obligations.');
 await page.getByLabel('The learner’s response',{exact:true}).fill('I will reconcile the cash flows and preserve the first decision before revising.');
 await page.getByRole('checkbox',{name:/I am recording a review/}).check();await page.getByRole('button',{name:'Save recorded review'}).click();
 await expect(page.locator('.teaching-review-history').filter({has:page.getByRole('heading',{name:'Recorded reviews',exact:true})})).toContainText('Self-review');assert.equal(reviewReceived.reviewerRole,'self');assert.equal(reviewReceived.criteria.length,4);
 results.review='A real-review declaration and exact rubric/evidence are recorded with self-review provenance.';
 await page.getByRole('button',{name:'Learning pilot',exact:true}).click();
 await expect(page.locator('.teaching-pilot-results')).toContainText('No pilot results');
 await page.getByLabel('Prior options experience',{exact:true}).selectOption('basic');await page.getByLabel(/I agree to this private learning pilot/).check();await page.getByRole('button',{name:'Enroll in the learning pilot'}).click();await page.getByRole('button',{name:'Open baseline',exact:true}).click();
 for(const [i,value]of[200,200,2].entries())await page.getByLabel(new RegExp(`Pilot answer ${i+1} `)).fill(String(value));
 await page.getByLabel('Actual assessment minutes',{exact:true}).fill('8');await page.getByLabel('Confidence in these answers (%)',{exact:true}).fill('60');await page.getByLabel('Assistance used for this assessment',{exact:true}).selectOption('none');await page.getByRole('button',{name:'Submit the observed assessment'}).click();
 await expect(page.locator('.teaching-pilot-results table')).toContainText('3/3');await expect(page.getByRole('button',{name:'Open day 7 check',exact:true})).toHaveCount(0);
 results.pilot='Only observed baseline results appear; scheduled retention stages remain unavailable early.';
 await page.getByRole('button',{name:'Adaptive tutor',exact:true}).click();await page.reload();
 await expect(page.locator('.teaching-session-meta')).toContainText('Session complete');
 await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:'outputs/teaching-studio/desktop.png'});
 await page.setViewportSize({width:390,height:844});await expect.poll(()=>page.locator('.sidebar').evaluate(element=>Math.round(element.getBoundingClientRect().right))).toBe(0);
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1));
 await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:'outputs/teaching-studio/mobile.png'});
 results.reload='Saved tutor state resumes after reload and the studio fits a390px viewport.';assert.deepEqual(errors,[]);
 console.log(JSON.stringify(results,null,2));
}finally{await browser.close();}
