import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {writeFileSync} from 'node:fs';
const require=createRequire(new URL('../../course-app/package.json',import.meta.url));
const {chromium}=require('playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_EXECUTABLE??'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const base='http://127.0.0.1:5173';
const evidence={};
async function measuredText(page,selector) {
 const value=await page.locator(selector).evaluate(el=>{
  const css=getComputedStyle(el);let node=el;let background='';
  while(node){const bg=getComputedStyle(node).backgroundColor;if(bg!=='rgba(0, 0, 0, 0)'&&bg!=='transparent'){background=bg;break;}node=node.parentElement;}
  return {text:el.textContent.trim(),color:css.color,background,fontSize:css.fontSize};
 });
 const luminance=css=>css.match(/[\d.]+/g).slice(0,3).map(Number).map(n=>n/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4).reduce((sum,n,i)=>sum+n*[.2126,.7152,.0722][i],0);
 const [lo,hi]=[luminance(value.color),luminance(value.background)].sort((a,b)=>a-b);
 return {...value,contrastRatio:(hi+.05)/(lo+.05)};
}
try {
 const context=await browser.newContext();
 const page=await context.newPage();
 await page.clock.install({time:new Date('2026-11-14T12:00:00Z')});
 const state={user:{name:'Audit',email:'audit@example.test'},profile:{dailyMinutes:15,timezone:'America/Phoenix'},notes:[],attempts:[],progress:[{lessonId:1,completedAt:'2026-11-14T10:00:00Z',nextReviewAt:'2026-11-15T12:00:00Z',reviewCount:0}]};
 let learningRequests=0;
 await page.route('**/api/learning',async route=>{learningRequests++;await route.fulfill({json:state});});
 await page.goto(base);
 await page.locator('.loading-line').waitFor({state:'hidden'});
 await page.locator('.sidebar .nav-item').filter({hasText:'Review & remember'}).click();
 await page.getByRole('heading',{name:"You're all caught up.",exact:true}).waitFor();
 await page.clock.setSystemTime(new Date('2026-11-16T12:00:00Z'));
 await page.getByRole('button',{name:'My learning',exact:true}).click();
 await page.locator('.sidebar .nav-item').filter({hasText:'Review & remember'}).click();
 assert.equal(await page.locator('.review-row').count(),0);
 evidence.review={afterDueTime:{browserTime:await page.evaluate(()=>new Date().toISOString()),reviewRows:0,learningRequests},expectedReviewRows:1};
 await page.reload();
 await page.locator('.loading-line').waitFor({state:'hidden'});
 await page.locator('.sidebar .nav-item').filter({hasText:'Review & remember'}).click();
 await page.locator('.review-row').waitFor();
 evidence.review.afterReload={reviewRows:await page.locator('.review-row').count(),learningRequests};
 await page.getByRole('button',{name:'The course',exact:true}).click();
 await page.locator('.lesson-row').first().click();
 evidence.contrast={chapterAssumptions:await measuredText(page,'.module-context>summary')};
 await page.getByRole('button',{name:'Practice lab',exact:true}).click();
 evidence.contrast.contractAssumptions=await measuredText(page,'.lab-assumption span');
 evidence.contrast.payoffLimitations=await measuredText(page,'.lab-results>.fine-print');
 assert.ok(Object.values(evidence.contrast).every(v=>v.contrastRatio<4.5));
 await context.close();

 const resourceContext=await browser.newContext();
 const resourcePage=await resourceContext.newPage();
 const emptyState={...state,progress:[]};
 await resourcePage.route('**/api/learning',route=>route.fulfill({json:emptyState}));
 await resourcePage.route('**/api/resources',route=>route.fulfill({json:[{file:'SOURCES.md',title:'Source library'}]}));
 let resourceRequests=0;
 await resourcePage.route('**/api/resources?file=*',async route=>{
  resourceRequests++;
  await route.fulfill(resourceRequests===1?{status:503,json:{error:'Temporary resource failure'}}:{json:{file:'SOURCES.md',title:'Source library',body:'# Source library\n\nRecovered reference content.'}});
 });
 await resourcePage.goto(base);
 await resourcePage.locator('.loading-line').waitFor({state:'hidden'});
 await resourcePage.getByRole('button',{name:'Resource library',exact:true}).click();
 await resourcePage.getByRole('button',{name:'Explore sources',exact:true}).click();
 await resourcePage.getByRole('alert').waitFor();
 await resourcePage.getByRole('button',{name:'Retry',exact:true}).click();
 await resourcePage.getByRole('alert').waitFor({state:'hidden'});
 assert.equal(resourceRequests,1);
 assert.equal(await resourcePage.locator('.resource-article').count(),0);
 evidence.retry={afterRetry:{resourceRequests,resourceArticleCount:0,errorVisible:false},expectedResourceRequests:2};
 await resourcePage.getByRole('button',{name:'Resource library',exact:true}).last().click();
 await resourcePage.getByRole('button',{name:'Explore sources',exact:true}).click();
 await resourcePage.locator('.resource-article').waitFor();
 evidence.retry.afterReopening={resourceRequests,resourceArticleCount:await resourcePage.locator('.resource-article').count()};
 await resourceContext.close();
 writeFileSync(new URL('./ui-evidence.json',import.meta.url),JSON.stringify(evidence,null,2)+'\n');
 console.log(JSON.stringify(evidence,null,2));
} finally {await browser.close();}
