import test from "node:test";
import assert from "node:assert/strict";
import { makeGraduatePractice, gradeGraduatePractice } from "../lib/graduate-practice.ts";
import { europeanPrice, europeanSensitivities, strategyComparison, callAssignmentLedger, executionReplay, normalCdf } from "../lib/graduate-models.ts";

// Independent hand calculations at sequence 0; rounded answers emulate the learner.
const answers0 = [
  [20, 11.11, 4410], [-30, 200, 199], [599, 2, 42], [4000, -100, 4000],
  [800, 200, 700], [20, 2, 350], [98, 36, -4], [15.87, 10, 20],
  [0, 12, 1], [-20, 650, 3], [2.1, 422, 0], [10140, 11, 20],
  [-20, 33.33, 10000], [10, 2.16, 0.5], [12.5, 5, 1], [29, 200, 3],
  [7.24, 0.5, 62.5], [10.45, 76, 1], [29.15, 1, 2], [150, 3, -300],
  [20, 40, 22], [9897, 250, 10], [12, 20, -100], [100, -650, 2000],
  [500, 200, 300], [9800, 9, 19.8],
];
test("all 26 modules supply three private-key drills agreeing with independent sequence-0 calculations", () => {
  for (let m = 1; m <= 26; m++) {
    const questions = makeGraduatePractice(m, 0);
    assert.equal(questions.length, 3);
    assert.equal(new Set(questions.map(q => q.id)).size, 3);
    assert.ok(questions.every(q => q.prompt && q.hint && q.unit && !("expected" in q) && !("explanation" in q)));
    const submitted = Object.fromEntries(questions.map((q, i) => [q.id, answers0[m - 1][i]]));
    const result = gradeGraduatePractice(m, 0, submitted);
    assert.ok(result.every(q => q.correct && q.explanation), `module ${m}: ${JSON.stringify(result)}`);
  }
});
test("fresh sequences change values and call/put or shock direction conditions", () => {
  const a = makeGraduatePractice(3, 0), b = makeGraduatePractice(3, 1);
  assert.match(a[0].prompt, /long standard call/);
  assert.match(b[0].prompt, /long standard put/);
  const result = gradeGraduatePractice(3, 1, Object.fromEntries(b.map((q, i) => [q.id, [393, 2.05, 38.95][i]])));
  assert.ok(result.every(r => r.correct));
  for (let m = 1; m <= 26; m++) {
    const next = makeGraduatePractice(m, 47);
    assert.ok(next.every((q, i) => q.prompt !== makeGraduatePractice(m, 0)[i].prompt), `module ${m}`);
  }
  const q = makeGraduatePractice(18, 1);
  assert.ok(gradeGraduatePractice(18, 1, Object.fromEntries(q.map((r, i) => [r.id, [5.22, -76.2, 1][i]]))).every(r => r.correct));
});
test("numeric grading rejects missing, extra, inherited, nonfinite and nonnumeric answers", () => {
  const q = makeGraduatePractice(1, 0), valid = Object.fromEntries(q.map((r, i) => [r.id, answers0[0][i]]));
  const missing = { ...valid }; delete missing[q[0].id];
  assert.throws(() => gradeGraduatePractice(1, 0, missing));
  assert.throws(() => gradeGraduatePractice(1, 0, { ...valid, extra: 1 }));
  const inherited = Object.assign(Object.create({ [q[0].id]: 20 }), missing, { extra: 1 });
  assert.throws(() => gradeGraduatePractice(1, 0, inherited));
  for (const x of [NaN, Infinity, true, "20", null]) assert.throws(() => gradeGraduatePractice(1, 0, { ...valid, [q[0].id]: x }));
  for (const [m, s] of [[0, 0], [27, 0], [1.1, 0], [1, -1], [1, 1.5], [1, 1e7]]) assert.throws(() => makeGraduatePractice(m, s));
  assert.equal(gradeGraduatePractice(1, 0, { ...valid, [q[0].id]: 20.1 })[0].correct, false);
});
test("European prices match published standard benchmark numbers and put-call parity", () => {
  const p = { spot: 100, strike: 100, years: 1, volatility: 0.2, rate: 0.05, dividendYield: 0, right: "call" };
  assert.ok(Math.abs(europeanPrice(p) - 10.450583572185565) < 0.00002);
  assert.ok(Math.abs(europeanPrice({ ...p, right: "put" }) - 5.573526022256971) < 0.00002);
  for (const dividendYield of [0, 0.02, 0.08]) {
    const c = europeanPrice({ ...p, dividendYield }), put = europeanPrice({ ...p, dividendYield, right: "put" });
    assert.ok(Math.abs(c - put - (100 * Math.exp(-dividendYield) - 100 * Math.exp(-0.05))) < 1e-10);
  }
  const g = europeanSensitivities(p);
  assert.ok(Math.abs(g.delta - 0.636830651) < 0.0001);
  assert.ok(Math.abs(g.vega - 0.375240347) < 0.0001);
  assert.ok(g.gamma > 0 && g.theta < 0);
  assert.equal(europeanPrice({ ...p, spot: 110, years: 0 }), 10);
  assert.equal(europeanPrice({ ...p, spot: 0, right: "call" }), 0);
  assert.ok(Math.abs(europeanPrice({ ...p, volatility: 0 }) - (100 - 100 * Math.exp(-0.05))) < 1e-10);
  assert.throws(() => europeanPrice({ ...p, volatility: NaN }));
  assert.ok(Object.values(europeanSensitivities({...p,volatility:5})).every(Number.isFinite),"maximum supported volatility has a bounded vega difference");
  assert.ok(Object.values(europeanSensitivities({...p,spot:1e7})).every(Number.isFinite),"maximum supported spot uses backward differences");
  assert.ok(Math.abs(normalCdf(0) - 0.5) < 1e-8);
  for (const invalid of [NaN, Infinity, -Infinity]) assert.throws(() => normalCdf(invalid));
});
test("equal-budget strategy values reconcile protection cost, cap and cash feasibility", () => {
  const p = { initialStock: 100, finalStock: 80, budget: 11000, putStrike: 95, putPremium: 3, callStrike: 110, callPremium: 2, fees: 0 };
  const rows = strategyComparison(p);
  assert.deepEqual(rows.map(r => r.finalWealth), [11000, 9000, 10200, 10400]);
  assert.deepEqual(rows.map(r => r.profit), [0, -2000, -800, -600]);
  const up = strategyComparison({ ...p, finalStock: 120 });
  assert.deepEqual(up.map(r => r.finalWealth), [11000, 13000, 12700, 11900]);
  assert.equal(strategyComparison({ ...p, budget: 10000 })[2].feasible, false);
});
test("one-leg assignment retains short shares and the unexercised long option", () => {
  const l = callAssignmentLedger(100, 105, 2, 1000, 110, 6);
  assert.deepEqual(l, { openingCash: 1200, cash: 11200, shares: -100, shortCalls: 0, longCalls: 1, equity: 800, coverCash: 11000, longExerciseCash: 10500 });
  assert.throws(() => callAssignmentLedger(105, 100, 2, 1000, 110, 6));
});
test("execution records nonfills and partial fills, then acknowledged cancellation", () => {
  const none = executionReplay(2);
  assert.equal(none.filled, 0); assert.equal(none.cashPaid, 0); assert.equal(none.average, null);
  const one = executionReplay(2.1);
  assert.equal(one.filled, 1); assert.equal(one.cashPaid, 210); assert.equal(one.remaining, 0);
  assert.match(one.events.at(-1).note, /2 unfilled contracts cancelled/);
  const two = executionReplay(2.2);
  assert.equal(two.filled, 2); assert.equal(two.cashPaid, 430); assert.equal(two.average, 2.15);
  assert.equal(two.events[1].remaining, 2); assert.equal(two.events[2].remaining, 1);
});

test("generated questions retain finite keys and tolerate correct final rounding at varied sequence boundaries", () => {
  for (const sequence of [2, 3, 47, 96, 97, 193, 999, 1000000]) {
    for (let moduleId = 1; moduleId <= 26; moduleId++) {
      const questions = makeGraduatePractice(moduleId, sequence);
      const zeros = Object.fromEntries(questions.map(q => [q.id, 0]));
      const feedback = gradeGraduatePractice(moduleId, sequence, zeros);
      assert.ok(feedback.every(q => Number.isFinite(q.expected)), `module ${moduleId}, sequence ${sequence}`);
      const rounded = Object.fromEntries(feedback.map(q => [q.id, Number(q.expected.toFixed(2))]));
      assert.ok(gradeGraduatePractice(moduleId, sequence, rounded).every(q => q.correct), `rounded module ${moduleId}, sequence ${sequence}`);
    }
  }
});
