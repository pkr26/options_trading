import test from 'node:test';
import assert from 'node:assert/strict';
import { graduateSubmissionInput, graduatePracticeInput } from '../lib/graduate-validation.ts';
import { MEMO_REQUIRED_MIN, MEMO_FIELD_LIMIT, memoLength, memoReady } from '../lib/memo-limits.ts';
import { execFileSync } from 'node:child_process';

const answers = {recommendation:'Compare the portfolio alternatives.', analysis:'Reconcile the cash flows and contract units.', risks:'Test the funding and liquidity assumptions.', revision:'', reflection:''};
test('initial commitments can precede revision; drafts retain incomplete work', () => {
  assert.equal(graduateSubmissionInput.parse({moduleId:10, expectedRevision:0, kind:'submission', answers}).answers.revision, '');
  assert.equal(graduateSubmissionInput.parse({moduleId:10, expectedRevision:0, kind:'draft', answers:{...answers,recommendation:''}}).kind, 'draft');
  assert.throws(() => graduateSubmissionInput.parse({moduleId:10, expectedRevision:0, kind:'submission', answers:{...answers,analysis:'42'}}));
  for(const mutation of [{moduleId:27},{moduleId:0},{expectedRevision:-1},{expectedRevision:0.5},{userId:'peer'}]) {
    assert.throws(() => graduateSubmissionInput.parse({moduleId:10,expectedRevision:0,kind:'submission',answers,...mutation}));
  }
});
test('numeric responses reject forged scores, nonfinite answers and malformed questions', () => {
  const input={moduleId:2,sequence:0,answers:{a:1,b:2,c:3}};
  assert.equal(graduatePracticeInput.parse(input).sequence,0);
  for(const mutation of [{score:3},{answers:{a:1}},{answers:{a:1,b:2,c:Infinity}},{sequence:-1},{moduleId:NaN}]) {
    assert.throws(() => graduatePracticeInput.parse({...input,...mutation}));
  }
});
test('memo readiness agrees at the trimmed minimum and drafts retain their existing Unicode field allowance', () => {
  const exact = Object.fromEntries(Object.keys(answers).map(key => [key, 'x'.repeat(MEMO_REQUIRED_MIN)]));
  const parse = (values,kind='submission') => graduateSubmissionInput.safeParse({moduleId:10,expectedRevision:0,kind,answers:values});
  assert.ok(memoReady(exact) && parse(exact).success);
  for (const key of ['recommendation','analysis','risks']) {
    for(const character of ['x','🌱']) {
      const tooShort = {...exact, [key]:' '+ character.repeat(MEMO_REQUIRED_MIN-1) +' '};
      assert.equal(memoReady(tooShort),false);
      assert.equal(parse(tooShort).success,false);
      assert.equal(parse(tooShort,'draft').success,true);
      const enough = {...exact, [key]:character.repeat(MEMO_REQUIRED_MIN)};
      assert.ok(memoReady(enough) && parse(enough).success);
    }
  }
  // Existing Zod field maxima count Unicode code points, including for non-browser clients.
  const emoji = '🌱'.repeat(MEMO_FIELD_LIMIT);
  assert.equal(memoLength(emoji), MEMO_FIELD_LIMIT);
  assert.equal(memoLength('e\u0301'), 2);
  assert.ok(parse({...exact,reflection:emoji}).success);
  assert.equal(parse({...exact,reflection:emoji+'x'},'draft').success,false);
  assert.ok(parse(Object.fromEntries(Object.keys(answers).map(key=>[key,''])),'draft').success);
});
test('additive migrations preserve existing learners and reject duplicate evidence revisions', () => {
  const program = `
import sqlite3,pathlib
c=sqlite3.connect(':memory:')
files=sorted(pathlib.Path('drizzle').glob('*.sql'))
for f in files[:2]: c.executescript(f.read_text())
c.execute("INSERT INTO profiles VALUES ('existing',15,'America/Phoenix')")
c.execute("INSERT INTO notes VALUES ('existing',1,'preserved explanation','2026-11-01')")
for f in files[2:]: c.executescript(f.read_text())
assert c.execute("SELECT content,revision FROM notes WHERE user_id='existing'").fetchone()==('preserved explanation',1)
assert c.execute("SELECT COUNT(*) FROM graduate_submissions").fetchone()[0]==0
row=('one','existing',10,1,'submission','{}','v1','{}','2026-11-14')
c.execute('INSERT INTO graduate_submissions VALUES (?,?,?,?,?,?,?,?,?)',row)
try:
 c.execute('INSERT INTO graduate_submissions VALUES (?,?,?,?,?,?,?,?,?)',('two',)+row[1:])
 raise AssertionError('duplicate revision accepted')
except sqlite3.IntegrityError: pass
c.execute('INSERT INTO graduate_submissions VALUES (?,?,?,?,?,?,?,?,?)',('peer','other',10)+row[3:])
assert c.execute("SELECT COUNT(*) FROM graduate_submissions WHERE user_id='existing'").fetchone()[0]==1
print('migration preservation and owner-scoped revision uniqueness verified')
`;
  assert.match(execFileSync('python3',['-c',program],{encoding:'utf8'}),/verified/);
});
