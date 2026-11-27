import test from 'node:test';
import assert from 'node:assert/strict';
import {pilotView,pilotQuestions,completePilot,freezePilotBlueprint} from '../lib/learning-pilot.ts';
const enrollment=freezePilotBlueprint({id:'pilot',moduleIds:[4,10,14],version:'v1',enrolledAt:'2026-01-01T12:00:00Z',baselineAt:null,seed:0,results:[]});
const answerSet=questions=>Object.fromEntries(questions.map(question=>[question.id,0]));
test('pilot has no invented starting result and seals baseline before retention checks',()=>{
 const start=pilotView(enrollment,1,'2026-01-01T12:00:00Z');
 assert.equal(start.schedule[0].status,'available');assert.equal(start.schedule[1].status,'awaiting_baseline');
 assert.deepEqual(start.enrollment.results,[]);assert.equal(pilotQuestions(enrollment,'baseline','2026-01-01T12:00:00Z').length,9);
 assert.throws(()=>pilotQuestions(enrollment,'day7','2026-01-01T12:00:00Z'));
 const done=completePilot(enrollment,'baseline',answerSet(pilotQuestions(enrollment,'baseline','2026-01-01T12:00:00Z')),5,3,'2026-01-01T12:00:00Z');
 assert.equal(done.baselineAt,'2026-01-01T12:00:00Z');assert.equal(done.results.length,1);assert.equal(enrollment.results.length,0);
 assert.throws(()=>pilotQuestions(done,'baseline','2026-01-02T12:00:00Z'));
 assert.throws(()=>pilotQuestions(done,'day7','2026-01-08T11:59:59Z'));
 const seven=pilotQuestions(done,'day7','2026-01-08T12:00:00Z');assert.equal(seven.length,9);
 assert.notDeepEqual(seven.map(q=>q.prompt),pilotQuestions(enrollment,'baseline','2026-01-01T12:00:00Z').map(q=>q.prompt));
 assert.throws(()=>pilotQuestions(done,'day30','2026-01-08T12:00:00Z'));
 assert.equal(pilotView(done,2,'2026-01-15T12:00:00Z').schedule[1].status,'missed');
 assert.throws(()=>pilotQuestions(done,'day7','2026-01-15T12:00:00Z'));
 assert.equal(pilotQuestions(done,'day30','2026-01-31T12:00:00Z').length,9);
 assert.equal(pilotView(done,2,'2026-02-15T12:00:00Z').schedule[2].status,'missed');
});
test('pilot rejects forged, missing and invalid observations',()=>{
 const questions=pilotQuestions(enrollment,'baseline','2026-01-01T12:00:00Z'),answers=answerSet(questions);
 for(const changed of [{...answers,extra:0},{...answers,[questions[0].id]:Infinity},{}])assert.throws(()=>completePilot(enrollment,'baseline',changed,5,3,'2026-01-01T12:00:00Z'));
 for(const [minutes,clarity]of[[0,3],[-1,3],[5,0],[5,6],[NaN,3]])assert.throws(()=>completePilot(enrollment,'baseline',answers,minutes,clarity,'2026-01-01T12:00:00Z'));
 assert.equal(pilotView(null).enrollment,null);
});

test('a frozen pilot rejects unsupported question versions and changed blueprints',()=>{
 assert.ok(enrollment.blueprintSignature);
 assert.throws(()=>pilotQuestions({...enrollment,questionVersion:'future'},'baseline','2026-01-01T12:00:00Z'),/unsupported or changed/);
 assert.throws(()=>pilotQuestions({...enrollment,blueprintSignature:'altered'},'baseline','2026-01-01T12:00:00Z'),/unsupported or changed/);
 assert.throws(()=>pilotQuestions({...enrollment,seed:enrollment.seed+1},'baseline','2026-01-01T12:00:00Z'),/unsupported or changed/);
 const questions=pilotQuestions(enrollment,'baseline','2026-01-01T12:00:00Z');
 const done=completePilot(enrollment,'baseline',answerSet(questions),5,3,'2026-01-01T12:00:00Z',{confidence:40,assistance:'notes'});
 assert.equal(done.results[0].confidence,40);assert.equal(done.results[0].assistance,'notes');
 assert.throws(()=>freezePilotBlueprint(done),/cannot be refrozen/);
});

test('a previously frozen portfolio-risk form keeps its original items and grading',()=>{
  const old={id:'legacy',moduleIds:[4,10,24],version:'v1',enrolledAt:'2026-01-01T00:00:00.000Z',
    baselineAt:null,seed:1,results:[],questionVersion:'2026-11-14.2',blueprintSignature:'fnv1a-37b2e6fb'};
  const questions=pilotQuestions(old,'baseline',old.enrolledAt);
  const delta=questions.find(q=>q.id==='g24-s1-q1');
  assert.ok(delta);
  const enrolled=completePilot(old,'baseline',{...answerSet(questions),[delta.id]:100},10,4,old.enrolledAt);
  assert.equal(enrolled.results[0].feedback.find(item=>item.id===delta.id).correct,true);
  const fresh=freezePilotBlueprint({...old,results:[]});
  assert.notEqual(fresh.blueprintSignature,old.blueprintSignature);
});

test("the November 27 portfolio release retains its original three-stage M7/M11/M24 blueprint",()=>{
  let prior={...enrollment,moduleIds:[7,11,24],seed:1,questionVersion:"2026-11-27.1",blueprintSignature:"fnv1a-d8da1bcb"};
  for(const [stage,when] of [["baseline","2026-01-01T12:00:00Z"],["day7","2026-01-08T12:00:00Z"],["day30","2026-01-31T12:00:00Z"]]){
    const questions=pilotQuestions(prior,stage,when);
    assert.match(questions[0].id,/^g7-s/);
    assert.match(questions[6].id,/^g24v2-s/);
    prior=completePilot(prior,stage,answerSet(questions),5,3,when);
  }
  assert.equal(prior.results.length,3);
});
