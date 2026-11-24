/** Nonmutating browser exercises; all writes are intercepted. */
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {chromium,expect} from '@playwright/test';
const base=new URL(process.env.LOCAL_API_BASE??'http://127.0.0.1:5173');
assert.equal(base.protocol,'http:');assert.ok(['localhost','127.0.0.1','[::1]'].includes(base.hostname));
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000}});
const artifacts=[];let race=false,lastExpected;
await context.route('**/api/learning',route=>route.fulfill({json:{user:{name:'Test',email:'test@example.test'},profile:{dailyMinutes:15,timezone:'America/Phoenix'},progress:[],attempts:[],notes:[]}}));
await context.route('**/api/graduate',route=>route.fulfill({json:{submissions:[],practice:[]}}));
await context.route('**/api/teaching',route=>route.fulfill({json:{events:[],plan:{generatedAt:'2026-11-14',recommendations:[],summary:''},pilot:{enrollment:null,schedule:[]}}}));
await context.route('**/api/teaching/artifact',async route=>{
 if(route.request().method()==='GET')return route.fulfill({json:{artifacts}});
 const input=route.request().postDataJSON();lastExpected=input.expectedRevision;
 if(race){race=false;artifacts.push({id:'other',entityId:'artifact-1',revision:2,createdAt:'2026-11-14T15:01:00Z',payload:{kind:'protocol',title:'Saved elsewhere',body:'Another tab preserved a different research protocol.',sourceUrl:''}});return route.fulfill({status:409,json:{error:'A newer revision was saved. Compare before saving.'}});}
 const event={id:`a-${input.expectedRevision+1}`,entityId:input.artifactId??'artifact-1',revision:input.expectedRevision+1,createdAt:'2026-11-14T15:02:00Z',payload:{kind:input.kind,title:input.title,body:input.body,sourceUrl:input.sourceUrl??''}};
 artifacts.push(event);return route.fulfill({status:201,json:{event}});
});
try{
 const page=await context.newPage();await page.goto(base.href+'#advanced/module/10/evidence');
 await expect(page.getByRole('heading',{name:'Keep the work behind the capstone.'})).toBeVisible();
 await page.getByLabel('Artifact title',{exact:true}).fill('Frozen comparison protocol');
 await page.getByLabel('Evidence, methods and reproduction notes',{exact:false}).fill('Freeze the rule, source manifest, comparator, timestamp filters, costs and all variants before opening later data.');
 await page.getByRole('button',{name:'Save artifact revision',exact:true}).click();
 await expect(page.locator('.artifact-editor .tag')).toHaveText('Saved');assert.equal(artifacts.length,1);
 const revised='This revised protocol preserves rejected variants and specifies a chronological later period for evaluation.';
 await page.getByLabel('Evidence, methods and reproduction notes',{exact:false}).fill(revised);race=true;
 await page.getByRole('button',{name:'Save artifact revision',exact:true}).click();
 await expect(page.getByRole('button',{name:'Keep my draft after comparing'})).toBeVisible();
 await expect(page.getByLabel('Evidence, methods and reproduction notes',{exact:false})).toHaveValue(revised);
 await page.getByRole('button',{name:'Keep my draft after comparing'}).click();
 await page.getByRole('button',{name:'Save artifact revision',exact:true}).click();
 await expect(page.locator('.artifact-editor .tag')).toHaveText('Saved');assert.equal(lastExpected,2);assert.equal(artifacts.at(-1).revision,3);
 await page.getByRole('button',{name:'New artifact',exact:true}).click();
 await page.getByLabel('Artifact title',{exact:true}).fill('Unsaved data audit');
 await page.getByLabel('Evidence, methods and reproduction notes',{exact:false}).fill('This draft tracks missing exit quotes without deleting held positions.');
 await page.locator('.artifact-choice').first().click();await page.getByRole('button',{name:'New artifact',exact:true}).click();
 await expect(page.getByLabel('Artifact title',{exact:true})).toHaveValue('Unsaved data audit');
 await page.getByRole('button',{name:'Scenario labs',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Stress the whole account.'})).toBeVisible();
 await page.locator('.pr-prediction textarea').fill('The account can have positive equity and still lack the cash needed for a gross funding event.');
 await page.getByRole('button',{name:'Reveal portfolio stress'}).click();
 await expect(page.locator('.pr-flag')).toContainText('$750.00');
 await expect(page.locator('.pr-metrics')).toContainText('$47,213.04');
 await page.getByRole('button',{name:'Research critique',exact:true}).click();
 for(const radio of await page.getByLabel('Present in this packet',{exact:true}).all())await radio.check();
 await page.getByRole('button',{name:'Check my research audit'}).click();
 await expect(page.getByRole('heading',{name:'4/4 issue classifications correct'})).toBeVisible();
 await page.getByRole('button',{name:'Try another research packet'}).click();
 await expect(page.locator('.pr-audit-feedback')).toHaveCount(0);
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>document.fonts.ready);
 await expect.poll(()=>page.locator('.sidebar').evaluate(e=>Math.round(e.getBoundingClientRect().right))).toBe(0);
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1));
 mkdirSync('outputs/portfolio-artifact-qa',{recursive:true});await page.screenshot({path:'outputs/portfolio-artifact-qa/research-mobile.png'});
 console.log('Portfolio/artifact browser checks passed: immutable artifact saves, conflict recovery, retained drafts, joint funding stress, four research traps, mobile layout.');
}finally{await browser.close();}
