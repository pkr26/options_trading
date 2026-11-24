import test from 'node:test';
import assert from 'node:assert/strict';
import {reviewCalibration} from '../lib/review-calibration.ts';
const make=(name,score,other={})=>({submissionId:'one',reviewerName:name,reviewerRole:'reported_external',decision:score>=2?'accepted':'revise',criteria:[{dimension:'Cash',score,evidence:'quoted working',feedback:'Reconcile the stated cash ledger.'}],challenge:'A concrete funding challenge.',response:'A concrete cash reconciliation.',reviewedAt:'2026-11-14T12:00:00Z',...other});
test('calibration compares distinct reported external raters on the same exact work',()=>{
 const rows=reviewCalibration([make('Ada',3),make('Ben',1),make('Self',0,{reviewerRole:'self'}),make('Other work',0,{submissionId:'two'})]);
 assert.equal(rows.length,1);assert.deepEqual(rows[0].reviewers,['Ada','Ben']);assert.equal(rows[0].criteria[0].range,2);assert.equal(rows[0].decisionConflict,true);
});
test('a later rating does not manufacture another independent reviewer',()=>{
 assert.equal(reviewCalibration([make('Ada',1),make(' ADA ',3,{reviewedAt:'2026-11-14T13:00:00Z'})]).length,0);
 const rows=reviewCalibration([make('Ada',1),make('Ada',3,{reviewedAt:'2026-11-14T13:00:00Z'}),make('Ben',2)]);
 assert.equal(rows[0].criteria[0].minimum,2);assert.equal(rows[0].criteria[0].maximum,3);
});
