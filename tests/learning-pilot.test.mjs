import test from 'node:test';
import assert from 'node:assert/strict';
import {pilotView,pilotQuestions,completePilot} from '../lib/learning-pilot.ts';
const enrollment={id:'pilot',moduleIds:[4,10,14],version:'v1',enrolledAt:'2026-01-01T12:00:00Z',baselineAt:null,seed:0,results:[]};
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
