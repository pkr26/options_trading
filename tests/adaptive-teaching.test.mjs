import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTutorPlan, startTutorSession, advanceTutorSession } from '../lib/adaptive-teaching.ts';
import { makeGraduatePractice, gradeGraduatePractice } from '../lib/graduate-practice.ts';
import { evaluateWriting } from '../lib/writing-feedback.ts';

const now='2026-11-14T15:00:00.000Z';
test('current written reasoning gaps change the study plan and superseded feedback does not',()=>{
  const answers={recommendation:'Choose the option.',analysis:'A list of conclusions with no calculation.',risks:'risk, model, liquidity',revision:'',reflection:''};
  const submission={id:'memo',moduleId:4,revision:1,kind:'submission',answers,createdAt:now,contentVersion:'v1'};
  const feedback=evaluateWriting(4,answers,'memo',now);
  const plan=buildTutorPlan({submissions:[submission],practice:[],feedback:[feedback]},now);
  assert.equal(plan.recommendations[0].moduleId,4);assert.match(plan.recommendations[0].reason,/submitted memo/);
  const revised={...submission,id:'revision',revision:2};
  const next=buildTutorPlan({submissions:[submission,revised],practice:[],feedback:[feedback]},now);
  assert.ok(!next.recommendations.some(item=>item.moduleId===4&&/submitted memo/.test(item.reason)));
});
function attempt(moduleId, sequence, values, createdAt=now) {
  const qs=makeGraduatePractice(moduleId,sequence);
  const feedback=gradeGraduatePractice(moduleId,sequence,Object.fromEntries(qs.map((q,i)=>[q.id,values[i]])));
  return {id:`a-${moduleId}-${sequence}`,moduleId,sequence,score:feedback.filter(q=>q.correct).length,total:3,createdAt,feedback};
}
test('an assignment unit error is diagnosed, preserved and followed by an unassisted changed transfer',()=>{
  const original=startTutorSession(4,0,'assignment-session',now);
  assert.equal(original.revision,1);
  assert.equal(original.turns.length,0);
  assert.equal('expected' in original.question,false);
  const miss=advanceTutorSession(original,{action:'answer',answer:40},now);
  assert.equal(miss.phase,'retry');
  assert.match(miss.teaching,/one hundredth/);
  assert.equal(miss.turns[0].answer,40);
  assert.equal(miss.turns[0].assisted,false);
  const corrected=advanceTutorSession(miss,{action:'answer',answer:4000},now);
  assert.equal(corrected.phase,'transfer');
  assert.equal(corrected.sequence,1);
  assert.equal(corrected.turns[1].assisted,true);
  assert.notEqual(corrected.question.prompt,original.question.prompt);
  // Changed case: two 100-share puts assigned at $41 require $8,200 cash.
  const transferred=advanceTutorSession(corrected,{action:'answer',answer:8200},now);
  assert.equal(transferred.phase,'question');
  assert.equal(transferred.questionIndex,1);
  assert.equal(transferred.turns.at(-1).assisted,false);
  const shares=advanceTutorSession(transferred,{action:'answer',answer:-200},now);
  const finished=advanceTutorSession(shares,{action:'answer',answer:4100},now);
  assert.equal(finished.phase,'complete');
  assert.equal(finished.question,null);
  assert.equal(finished.turns.length,5);
  assert.match(finished.nextStep,/not an independent/);
  assert.equal(original.turns.length,0,'transitions do not mutate the earlier evidence');
  assert.throws(()=>advanceTutorSession(finished,{action:'hint'},now));
});
test('hints and explicit worked explanations remain assisted and cannot silently count as fresh success',()=>{
  const session=startTutorSession(3,1,'hint-session',now);
  const hint=advanceTutorSession(session,{action:'hint'},now);
  assert.equal(hint.revision,2);
  assert.equal(hint.hintLevel,1);
  assert.equal(hint.turns.length,0);
  const helped=advanceTutorSession(hint,{action:'answer',answer:393},now);
  assert.equal(helped.phase,'transfer');
  assert.equal(helped.turns[0].assisted,true);
  assert.equal(helped.questionIndex,0);
  const explanation=advanceTutorSession(startTutorSession(4,0,'worked-session',now),{action:'explain'},now);
  assert.match(explanation.teaching,/4000\.00 USD/);
  assert.equal(explanation.hintLevel,3);
  assert.equal(explanation.phase,'retry');
});
test('all modules support a key-free issued question and reject malformed or tampered tutor state',()=>{
  for(let moduleId=1;moduleId<=26;moduleId++) {
    const session=startTutorSession(moduleId,0,`session-${moduleId}`,now);
    assert.equal(session.moduleId,moduleId);
    assert.ok(session.question.prompt);
    assert.ok(!('expected' in session.question));
    assert.throws(()=>advanceTutorSession({...session,question:{...session.question,prompt:'forged question'}},{action:'answer',answer:1},now));
  }
  const session=startTutorSession(4,0,'guards',now);
  for(const answer of [NaN,Infinity,'4000',null,1e15])assert.throws(()=>advanceTutorSession(session,{action:'answer',answer},now));
  assert.throws(()=>advanceTutorSession(session,{action:'hint',answer:4000},now));
  assert.throws(()=>startTutorSession(27,0,'bad',now));
  assert.throws(()=>startTutorSession(4,-1,'bad',now));
  assert.throws(()=>startTutorSession(4,0,'',now));
});
test('the plan responds to critical unresolved evidence without treating a high aggregate score as mastery',()=>{
  const missed=attempt(4,0,[40,-100,4000]);
  const plan=buildTutorPlan({submissions:[],practice:[missed]},now);
  assert.equal(plan.recommendations[0].moduleId,4);
  assert.equal(plan.recommendations[0].action,'remediate');
  assert.equal(plan.recommendations[0].skill,'contracts');
  assert.match(plan.recommendations[0].reason,/1 unresolved/);
  const corrected=attempt(4,1,[8200,-200,4100]);
  const later=buildTutorPlan({submissions:[],practice:[missed,corrected]},now);
  assert.equal(later.recommendations.some(r=>r.moduleId===4&&r.action==='remediate'),false);
  assert.equal(buildTutorPlan({submissions:[],practice:[]},now).recommendations[0].moduleId,1);
});
test('seven and thirty day recommendations use observed dates rather than imagined retention results',()=>{
  const first=attempt(4,0,[4000,-100,4000],'2026-10-01T15:00:00.000Z');
  const day7=attempt(4,1,[8200,-200,4100],'2026-10-08T15:00:00.000Z');
  const seven=buildTutorPlan({submissions:[],practice:[first]},'2026-10-08T15:00:00.000Z');
  assert.match(seven.recommendations.find(r=>r.moduleId===4).reason,/7-day/);
  const thirty=buildTutorPlan({submissions:[],practice:[first,day7]},now);
  assert.match(thirty.recommendations.find(r=>r.moduleId===4).reason,/30-day/);
  const day30=attempt(4,2,[12600,-300,4200],'2026-11-01T15:00:00.000Z');
  const retained=buildTutorPlan({submissions:[],practice:[first,day7,day30]},now);
  assert.equal(retained.recommendations.some(r=>r.moduleId===4&&r.action==='retain'),false);
});
test('prerequisite recommendations inspect the latest attempt even when server rows arrive out of order',()=>{
  const target=attempt(18,0,[0,0,0]);
  const latestPrerequisite=attempt(17,0,[7.24,0.5,62.5],now);
  const olderPrerequisite=attempt(17,1,[0,0,0],'2026-11-13T15:00:00.000Z');
  const plan=buildTutorPlan({submissions:[],practice:[target,latestPrerequisite,olderPrerequisite]},now);
  assert.ok(plan.recommendations.some(r=>r.moduleId===18&&r.action==='remediate'));
  assert.equal(plan.recommendations.some(r=>r.moduleId===17&&r.action==='prepare'),false);
});
