import test from 'node:test';
import assert from 'node:assert/strict';
import {portfolioStress,makeResearchCase,gradeResearchCase,researchIssueIds} from '../lib/portfolio-research-models.ts';
const input={positions:[{label:'A',spot:100,shares:100,contracts:2,delta:.55,gamma:.03,vega:.12,loading:1},{label:'B',spot:80,shares:100,contracts:-1,delta:-.35,gamma:.02,vega:.1,loading:.8}],marketShockPercent:-10,ivShockPoints:12,initialEquity:50000,liquidCash:5000,cashObligation:1500,additionalCollateral:4000,exitCost:250,lossLimit:2000};
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
test('joint portfolio exposures and funding reconcile with independent hand calculations',()=>{
 const r=portfolioStress(input);
 near(r.rows[0].localPnl,-1512);near(r.rows[1].localPnl,-1024.96);
 near(r.deltaPnl,-2964);near(r.gammaPnl,259.04);near(r.vegaPnl,168);near(r.localPnl,-2536.96);
 near(r.markedEquity,47463.04);near(r.conservativeLiquidationEstimate,47213.04);
 assert.equal(r.grossCashRequired,5750);assert.equal(r.cashShortfall,750);assert.equal(r.cashHeadroom,-750);
 assert.equal(r.lossLimitBreached,true);assert.equal(r.approximationWarning,true);
 // Increasing collateral is a gross liquidity requirement, not an additional trading loss.
 const collateral=portfolioStress({...input,additionalCollateral:6000});near(collateral.localPnl,r.localPnl);assert.equal(collateral.cashShortfall,2750);
});
test('zero shocks preserve equity while liquidation costs and funding remain separate',()=>{
 const r=portfolioStress({...input,marketShockPercent:0,ivShockPoints:0,lossLimit:250});
 assert.equal(r.localPnl,0);assert.equal(r.markedEquity,50000);assert.equal(r.conservativeLiquidationEstimate,49750);assert.equal(r.lossLimitBreached,false);assert.equal(r.approximationWarning,false);
});
test('portfolio calculations reject impossible or nonfinite teaching inputs',()=>{
 for(const patch of [{marketShockPercent:NaN},{exitCost:-1},{ivShockPoints:Infinity},{positions:[]},{positions:[{...input.positions[0],contracts:.5}]},{positions:[{...input.positions[0],spot:0}]}])assert.throws(()=>portfolioStress({...input,...patch}));
});
test('research case audit catches all four distinct traps and reconciles costs exactly once',()=>{
 const c=makeResearchCase(0);assert.equal(c.quoteTime,'10:00:02');assert.equal(c.grossPnl,500);assert.equal(c.modeledCosts,600);
 const r=gradeResearchCase(0,{lookahead:true,holdout:true,costs:true,benchmark:true});assert.equal(r.score,4);assert.equal(r.netPnl,-100);assert.equal(r.netDifference,-200);
 const clean=gradeResearchCase(15,{lookahead:false,holdout:false,costs:false,benchmark:false});assert.equal(clean.score,4);
 assert.ok(clean.feedback.every(f=>f.explanation.length>60));
});
test('every research issue varies independently across the sixteen teaching configurations',()=>{
 for(let seed=0;seed<16;seed++){
  const selected=Object.fromEntries(researchIssueIds.map((id,i)=>[id,(seed&(1<<i))===0]));
  assert.equal(gradeResearchCase(seed,selected).score,4);
 }
 assert.throws(()=>makeResearchCase(-1));assert.throws(()=>gradeResearchCase(0,{lookahead:true}));
});
