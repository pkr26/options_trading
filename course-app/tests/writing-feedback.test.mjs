import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateWriting } from '../lib/writing-feedback.ts';
import { MEMO_FIELD_LIMIT } from '../lib/memo-limits.ts';
const blank=()=>({recommendation:'',analysis:'',risks:'',revision:'',reflection:''});
const now='2026-11-14T15:00:00.000Z';
test('every module has tailored formative prompts grounded in its actual rubric without fabricated grades',()=>{
  const followups=new Set();
  for(let moduleId=1;moduleId<=26;moduleId++) {
    const report=evaluateWriting(moduleId,blank(),`s-${moduleId}`,now);
    assert.equal(report.criteria.length,4);
    assert.equal(report.moduleId,moduleId);
    assert.equal(report.submissionId,`s-${moduleId}`);
    assert.equal(report.createdAt,now);
    assert.match(report.summary,/rules-based formative/);
    assert.match(report.summary,/not an academic grade/);
    assert.equal('score' in report,false);
    assert.equal(report.criteria.at(-1).status,'review_needed','initial work need not pretend to have seen the update');
    followups.add(report.criteria[0].nextQuestion);
  }
  assert.equal(followups.size,26);
});
test('feedback quotes concrete argument passages and separates detected evidence from correctness',()=>{
  const answers={
    recommendation:'I recommend reducing stock rather than the collar because preserving cash meets the immediate mandate.',
    analysis:'Initial wealth = $110,000. C cash = $5,990. D cash = $7,980. C floor = $100,990. D floor = $102,980. D cap = $117,980.',
    risks:'If the cash mandate changes, the collar would need a new funding ledger before implementation.',
    revision:'I now retain fewer shares because the updated cash requirement makes the specified collar infeasible. Updated C cash = $5,490. Updated D cash = $6,980.',
    reflection:'The reviewer should challenge whether the remaining concentration fits the mandate.',
  };
  const report=evaluateWriting(10,answers,'memo',now);
  assert.ok(report.criteria.every(c=>c.status==='evidence_found'));
  assert.match(report.criteria[1].evidence,/rather than the collar/);
  assert.match(report.criteria[0].feedback,/has not verified/);
  assert.equal(report.alerts.length,0);
  assert.ok(report.numericalChecks.every(c=>c.status==='consistent'),JSON.stringify(report.numericalChecks));
});
test('specific wrong cash assertions receive a reproducible correction; omitted numbers are not called errors',()=>{
  const report=evaluateWriting(10,{...blank(),analysis:'Initial wealth = $110,000. C cash = $6,000. D floor = $102,980.',revision:'Updated D cash = $7,000.'},'wrong',now);
  const initial=report.numericalChecks.find(c=>c.label==='Initial C protective-put cash');
  assert.equal(initial.status,'contradiction');
  assert.match(initial.explanation,/5,990/);
  assert.match(initial.explanation,/\$6,000/);
  assert.equal(report.numericalChecks.find(c=>c.label==='Updated D collar cash').status,'contradiction');
  assert.equal(report.numericalChecks.find(c=>c.label==='Initial D collar cap').status,'not_supplied');
  assert.equal(report.criteria[0].status,'needs_work');
  assert.ok(report.nextActions.some(action=>/Reconcile Initial C/.test(action)));
});
test('unsafe affirmative claims trigger specific teaching, while negated and questioned claims do not',()=>{
  const unsafe=evaluateWriting(7,{...blank(),risks:'Theta is guaranteed income. Delta is a guaranteed probability of profit. The midpoint always gives a fill.'},'',now);
  assert.ok(unsafe.alerts.length>=2);
  assert.ok(unsafe.alerts.some(a=>/Theta/.test(a.claim)));
  assert.match(unsafe.alerts[0].explanation,/net profit/);
  const cautious=evaluateWriting(7,{...blank(),risks:'Theta is not guaranteed income. Delta is not a probability of profit. A midpoint does not guarantee a fill. Is premium income guaranteed?'},'',now);
  assert.deepEqual(cautious.alerts,[]);
  const neutral=evaluateWriting(7,{...blank(),risks:'The word guaranteed appears in the teaching packet. Explain the premium separately from profit.'},'',now);
  assert.deepEqual(neutral.alerts,[]);
});
test('mere risk lists and keyword stuffing are not treated as evaluated reasoning',()=>{
  const report=evaluateWriting(24,{...blank(),recommendation:'Objective alternative cash risk portfolio mandate.',analysis:'cash cash funding portfolio',risks:'Liquidity, correlation, funding, loss.',revision:'New update revision.'},'',now);
  assert.ok(report.criteria.every(c=>c.status==='needs_work'));
  assert.ok(report.criteria.every(c=>c.evidence===''));
  assert.ok(report.nextActions.length>1);
  assert.throws(()=>evaluateWriting(0,blank()));
  assert.throws(()=>evaluateWriting(4,{...blank(),analysis:'x'.repeat(6001)}));
});
test('initial formative feedback does not reveal the staged cash update or its answer',()=>{
  const report=evaluateWriting(10,{...blank(),analysis:'Initial wealth = $110,000. C cash = $5,990.'},'initial',now);
  const output=JSON.stringify(report);
  assert.doesNotMatch(output,/5,490|6,980|8,000/);
  assert.match(report.numericalChecks.find(c=>c.label==='Updated C protective-put cash').explanation,/deferred/);
});
test('feedback accepts maximum-size Unicode writing and old short submissions, and returns intact code points in excerpts', () => {
  const lead='I choose cash rather than the collar because ';
  const recommendation=lead+'🌱'.repeat(MEMO_FIELD_LIMIT-Array.from(lead).length);
  const full={recommendation,analysis:'🌱'.repeat(MEMO_FIELD_LIMIT),risks:'🌱'.repeat(MEMO_FIELD_LIMIT),revision:'',reflection:''};
  const report=evaluateWriting(10,full,'saved');
  const evidence=report.criteria[1].evidence;
  assert.match(evidence,/🌱.*…$/);
  assert.equal(evidence.isWellFormed(),true);
  assert.throws(()=>evaluateWriting(10,{...full,analysis:full.analysis+'x'},'overlong'),TypeError);
  assert.equal(evaluateWriting(10,{...full,recommendation:'🌱'.repeat(10)},'legacy').submissionId,'legacy');
});
