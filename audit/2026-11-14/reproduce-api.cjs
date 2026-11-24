const fs=require('node:fs');
const vm=require('node:vm');
const {createRequire}=require('node:module');
const app=require('node:path').resolve(__dirname,'../../course-app');
const req=createRequire(app+'/package.json');
const ts=req('typescript');
const {z,ZodError}=req('zod');
function load(relative, globals={}){
 let source=fs.readFileSync(app+'/'+relative,'utf8').replace(/^import .*;\r?\n/gm,'');
 const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const exports={};const context={exports,Request,Response,URL,Intl,Date,console,crypto:globalThis.crypto,...globals};
 vm.runInNewContext(js,context,{filename:relative});return exports;
}
const user={userId:'isolated-audit',displayName:'Audit',email:'audit@example.test'};
let db={};
const api=load('lib/api.ts',{getChatGPTUser:async()=>user,getDb:()=>db,ZodError});
const learning=load('lib/learning.ts');
const quizzes=load('lib/quiz-bank.ts');
const common={z,...api,...learning,...quizzes,and:(...args)=>args,eq:(...args)=>args};
(async()=>{
 const noteT={},captured=[];
 db={insert:()=>({values:r=>({onConflictDoUpdate:async()=>captured.push(r)})})};
 const notes=load('app/api/notes/route.ts',{...common,notes:noteT});
 const oversized=JSON.stringify({lessonId:1,content:'valid note',ignored:'x'.repeat(100000)});
 const noLength=new Request('http://audit.test/api/notes',{method:'PUT',headers:{'content-type':'application/json'},body:oversized});
 const response=await notes.PUT(noLength);
 console.log(JSON.stringify({test:'headerless 100K note request',bytes:Buffer.byteLength(oversized),contentLength:noLength.headers.get('content-length'),status:response.status,persistedFields:Object.keys(captured[0])}));
 const unicode=JSON.stringify({lessonId:1,content:'学'.repeat(10000)});
 const unicodeRequest=new Request('http://audit.test/api/notes',{method:'PUT',headers:{'content-type':'application/json','content-length':String(Buffer.byteLength(unicode))},body:unicode});
 const unicodeResponse=await notes.PUT(unicodeRequest);
 console.log(JSON.stringify({test:'valid 10000-code-unit note',bytes:Buffer.byteLength(unicode),status:unicodeResponse.status,result:await unicodeResponse.json()}));
 const progressT={},attemptsT={},stored=[];
 db={select:()=>({from:t=>({where:async()=>t===progressT?Array.from({length:8},(_,i)=>({lessonId:i+1})):stored.map(r=>({...r}))})}),insert:()=>({values:async r=>stored.push(r)})};
 const quiz=load('app/api/quiz/route.ts',{...common,progress:progressT,attempts:attemptsT});
 const answers=Object.fromEntries(quizzes.buildQuiz(1,0).map(q=>[q.id,q.correctIndex]));
 function quizRequest(){return new Request('http://audit.test/api/quiz',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({moduleId:1,variant:0,answers})})}
 const quizResponses=await Promise.all([quiz.POST(quizRequest()),quiz.POST(quizRequest())]);
 console.log(JSON.stringify({test:'same-form concurrent quiz submissions',statuses:quizResponses.map(r=>r.status),storedVariants:stored.map(r=>r.variant),nextVariant:stored.length%2}));
 let current={userId:user.userId,lessonId:1,reviewCount:0,completedAt:new Date().toISOString(),nextReviewAt:new Date().toISOString()};
 db={select:()=>({from:()=>({where:async()=>[{...current}]})}),update:()=>({set:patch=>({where:async()=>{current={...current,...patch}}})})};
 const progress=load('app/api/progress/route.ts',{...common,progress:progressT,attempts:attemptsT});
 function reviewRequest(){return new Request('http://audit.test/api/progress',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({lessonId:1,action:'review',recalled:true})})}
 const reviewResponses=await Promise.all([progress.POST(reviewRequest()),progress.POST(reviewRequest())]);
 console.log(JSON.stringify({test:'two concurrent recall successes',statuses:reviewResponses.map(r=>r.status),storedReviewCount:current.reviewCount}));
})().catch(e=>{console.error(e);process.exitCode=1});
