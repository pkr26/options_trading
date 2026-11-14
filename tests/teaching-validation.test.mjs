import test from 'node:test';
import assert from 'node:assert/strict';
import {artifactInput,tutorInput,reviewInput,pilotInput} from '../lib/teaching-validation.ts';
test('teaching mutations reject forged progress, cross-user fields and unsafe artifacts',()=>{
 assert.equal(tutorInput.parse({action:'start',moduleId:4}).moduleId,4);
 assert.throws(()=>tutorInput.parse({action:'start',moduleId:27}));
 assert.throws(()=>tutorInput.parse({action:'start',moduleId:4,userId:'other'}));
 assert.throws(()=>tutorInput.parse({action:'answer',sessionId:'123',expectedRevision:1,answer:Infinity}));
 const artifact={expectedRevision:0,kind:'protocol',title:'Frozen question',body:'A falsifiable hypothesis and comparator.',sourceUrl:'https://example.com/research'};
 assert.equal(artifactInput.parse(artifact).kind,'protocol');
 for(const sourceUrl of ['javascript:alert(1)','http://example.com','file:///private/key'])assert.throws(()=>artifactInput.parse({...artifact,sourceUrl}));
 assert.throws(()=>pilotInput.parse({action:'enroll',moduleIds:[4,4,14]}));
 assert.throws(()=>pilotInput.parse({action:'submit',stage:'day7',expectedRevision:1,answers:{},minutes:5,clarity:3,completedAt:'2020-01-01'}));
 assert.throws(()=>reviewInput.parse({verifiedExpert:true}));
});
