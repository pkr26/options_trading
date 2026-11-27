import test from "node:test";
import assert from "node:assert/strict";
import { makeGraduatePractice, gradeGraduatePractice, practiceRelease, PRACTICE_RELEASE, PORTFOLIO_PRACTICE_RELEASE, LEGACY_PRACTICE_RELEASE } from "../lib/graduate-practice.ts";
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
test("Greek answer keys reproduce the quoted precision over the complete input cycle", () => {
  const sequences = [...Array.from({length: 97 * 4}, (_, i) => i), 999999, 1000000];
  for (const sequence of sequences) {
    for (const presentation of ["set", "standalone"]) {
      const questions = makeGraduatePractice(7, sequence, presentation);
      const [spot, vol, time] = questions.map(q => q.prompt);
      const [, delta, gamma] = spot.match(/delta (-?\d+\.\d{3}), gamma (\d+\.\d{4}) per \$1/);
      const move = Number(spot.match(/changes by (-?\d+) dollars per share/)[1]);
      const vega = Number(vol.match(/vega \$(\d+\.\d{3})\/share per IV percentage point/)[1]);
      const [, start, end] = vol.match(/changes from (\d+)% to (\d+)%/);
      const theta = -Number(time.match(/theta −\$(\d+\.\d{4})\/share\/day/)[1]);
      const contracts = Number(time.match(/value change for (\d+) contracts?\?/)[1]);
      const shares = questions.map(q => Number(q.prompt.match(/(\d+)-share multiplier/)[1]));
      const expected = [
        shares[0] * move * (Number(delta) + move * Number(gamma) / 2),
        shares[1] * vega * (Number(end) - Number(start)),
        shares[2] * theta * contracts,
      ];
      const answers = Object.fromEntries(questions.map((q, i) => [q.id, Number(expected[i].toFixed(2))]));
      const feedback = gradeGraduatePractice(7, sequence, answers, presentation);
      feedback.forEach((q, i) => {
        assert.equal(q.prompt, questions[i].prompt);
        assert.equal(q.correct, true, `sequence ${sequence}, ${q.id}`);
        assert.ok(Math.abs(q.expected - expected[i]) < 1e-10, `sequence ${sequence}, ${q.id}`);
      });
    }
  }
});
test("only Greek and portfolio practice forms carry revised identifiers", () => {
  assert.equal(PRACTICE_RELEASE, "2026-11-27.2");
  assert.equal(PORTFOLIO_PRACTICE_RELEASE, "2026-11-27.1");
  assert.equal(LEGACY_PRACTICE_RELEASE, "2026-11-14.2");
  for (let moduleId = 1; moduleId <= 26; moduleId++) {
    const release = {7: PRACTICE_RELEASE, 24: PORTFOLIO_PRACTICE_RELEASE}[moduleId] ?? LEGACY_PRACTICE_RELEASE;
    assert.equal(practiceRelease(moduleId), release);
    const prefix = `g${moduleId}${[7, 24].includes(moduleId) ? "v2" : ""}-s96-q`;
    assert.deepEqual(makeGraduatePractice(moduleId, 96).map(q => q.id), [prefix + 1, prefix + 2, prefix + 3]);
  }
});
test("portfolio practice distinguishes same-stock share delta from joint dollar P&L", () => {
  // The selected seeds include a positive, zero and negative same-stock exposure.
  for (const [sequence, netShares, jointPnl] of [[0, 100, -650], [1, 98, -762.25], [50, 0, -1550], [96, -92, -1658]]) {
    for (const presentation of ["set", "standalone"]) {
      const questions = makeGraduatePractice(24, sequence, presentation);
      assert.equal(questions[0].unit, "ALFA-share equivalents");
      assert.match(questions[0].prompt, /same underlying, stock ALFA/);
      assert.equal(questions[1].unit, "USD");
      assert.match(questions[1].prompt, /ALFA falls \$[\d.]+ per ALFA share and BRAVO rises \$[\d.]+ per BRAVO share/);
      const answers = Object.fromEntries(questions.map((q, i) => [q.id, [netShares, jointPnl, 2000][i]]));
      const result = gradeGraduatePractice(24, sequence, answers, presentation);
      assert.deepEqual(result.map(q => q.correct), [true, true, true], `sequence ${sequence}, ${presentation}`);
    }
  }
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
  assert.ok(Object.values(europeanSensitivities({...p,volatility:5})).every(Number.isFinite),"sensitivities are finite at maximum supported volatility");
  assert.ok(Object.values(europeanSensitivities({...p,spot:1e7})).every(Number.isFinite),"sensitivities are finite at maximum supported spot");
  assert.ok(Math.abs(normalCdf(0) - 0.5) < 1e-8);
  for (const invalid of [NaN, Infinity, -Infinity]) assert.throws(() => normalCdf(invalid));
});
test("European call and put Greeks match independent references across the pricing lab input range", () => {
  // Reference numbers calculated independently with Python math.erfc, the normal density,
  // and the analytic Black–Scholes–Merton Greeks. Vega is per percentage point.
  // Theta is the repriced one-calendar-day difference, including the last day to expiry.
  const fixtures = [
    {
      spot: 1, strike: 1, days: 1, volatility: 0.01, rate: 0, dividendYield: 0,
      gamma: 762.1781304240391, vega: 0.00020881592614357237,
      call: { delta: 0.5001044079654555, theta: -0.00020881593091104378 },
      put: { delta: -0.4998955920345445, theta: -0.00020881593091104378 },
    },
    {
      spot: 1, strike: 1, days: 1, volatility: 0.01, rate: 0.30, dividendYield: 0,
      gamma: 222.0477889164029, vega: 0.0000608350106620282,
      call: { delta: 0.9418544740889684, theta: -0.0008346189359867973 },
      put: { delta: -0.05814552591103166, theta: -0.000013038809687407338 },
    },
    {
      spot: 90, strike: 100, days: 30, volatility: 0.4, rate: 0.03, dividendYield: 0.07,
      gamma: 0.025861630368169665, vega: 0.06886987593934499,
      call: { delta: 0.18563649672778765, theta: -0.04408451619194942 },
      put: { delta: -0.8086265978663828, theta: -0.05304814177729611 },
    },
    {
      spot: 10000, strike: 10000, days: 3650, volatility: 2, rate: -0.10, dividendYield: 0.30,
      gamma: 1.2801306099054585e-8, vega: 0.25602612198109176,
      call: { delta: 0.049502982449980734, theta: 0.4005699413720549 },
      put: { delta: -0.0002840859178832076, theta: -7.455134437608649 },
    },
  ];

  for (const { spot, strike, days, volatility, rate, dividendYield, gamma, vega, call, put } of fixtures) {
    for (const [right, expected] of Object.entries({ call, put })) {
      const input = { spot, strike, years: days / 365, volatility, rate, dividendYield, right };
      const actual = europeanSensitivities(input);
      const scenario = JSON.stringify(input);
      assert.ok(Math.abs(actual.delta - expected.delta) < 8e-8, `delta: ${scenario}`);
      assert.ok(Math.abs(actual.gamma - gamma) <= gamma * 1e-10, `gamma: ${scenario}`);
      assert.ok(Math.abs(actual.vega - vega) <= vega * 1e-10, `vega per IV point: ${scenario}`);
      // The pricing engine's normal CDF is approximate. Error bounds are in dollars per share.
      const timeChangeTolerance = spot === 1 ? 5e-9 : 1e-6;
      assert.ok(Math.abs(actual.theta - expected.theta) < timeChangeTolerance, `one-day change: ${scenario}`);
    }
  }
});

test("a joint finite shock is repriced separately from the one-day time-only change", () => {
  const base = { spot: 100, strike: 100, years: 1, volatility: 0.2, rate: 0.05, dividendYield: 0, right: "call" };
  const shocked = { ...base, spot: 101, volatility: 0.22, years: 1 - 1 / 365 };
  const { price, theta } = europeanSensitivities(base);
  assert.ok(Math.abs(theta - (-0.01758056384502993)) < 1e-7);
  const jointChange = europeanPrice(shocked) - price;
  assert.ok(Math.abs(jointChange - 1.3741126757793012) < 3e-6);
});

test("equal-budget strategy values reconcile protection cost, cap and cash feasibility", () => {
  const p = { initialStock: 100, finalStock: 80, budget: 11000, putStrike: 95, putPremium: 3, callStrike: 110, callPremium: 2, fees: 0 };
  const rows = strategyComparison(p);
  assert.deepEqual(rows.map(r => r.quoteIssue), [null, null, null, null]);
  assert.deepEqual(rows.map(r => r.feasible), [true, true, true, true]);
  assert.deepEqual(rows.map(r => r.finalWealth), [11000, 9000, 10200, 10400]);
  assert.deepEqual(rows.map(r => r.profit), [0, -2000, -800, -600]);
  const up = strategyComparison({ ...p, finalStock: 120 });
  assert.deepEqual(up.map(r => r.finalWealth), [11000, 13000, 12700, 11900]);
  assert.equal(strategyComparison({ ...p, budget: 10000 })[2].feasible, false);
});
test("quote consistency is scoped to the legs in each strategy", () => {
  const standard = { initialStock: 100, finalStock: 0, budget: 0, putStrike: 95, putPremium: 3, callStrike: 110, callPremium: 200, fees: 0 };
  const rows = strategyComparison(standard);
  assert.deepEqual(rows.map(row => row.feasible), [true, false, false, false]);
  assert.deepEqual(rows.slice(0, 3).map(row => row.quoteIssue), [null, null, null]);
  assert.match(rows[3].quoteIssue, /call premium.*\$100 per-share upper bound/);
  assert.deepEqual([rows[3].outlay, rows[3].initialCash, rows[3].finalWealth], [-9700, 9700, 19200]);
  const funded = { ...standard, budget: 30000, callPremium: 2 };
  const highPut = strategyComparison({ ...funded, putPremium: 96 });
  assert.deepEqual(highPut.map(row => row.feasible), [true, true, false, false]);
  assert.match(highPut[2].quoteIssue, /put premium.*\$95 per-share upper bound/);
  assert.equal(highPut[3].quoteIssue, highPut[2].quoteIssue);
  const cheapPut = strategyComparison({ ...funded, initialStock: 80, putPremium: 14 });
  assert.match(cheapPut[2].quoteIssue, /put premium.*\$15 per-share lower bound/);
  assert.match(cheapPut[3].quoteIssue, /put premium/);
  const cheapCall = strategyComparison({ ...funded, initialStock: 120, callPremium: 9 });
  assert.deepEqual(cheapCall.slice(0, 3).map(row => row.quoteIssue), [null, null, null]);
  assert.match(cheapCall[3].quoteIssue, /call premium.*\$10 per-share lower bound/);
});
test("a standard collar must respect both strike bounds before fees, including equality", () => {
  const standard = { initialStock: 100, finalStock: 100, budget: 30000, putStrike: 95, putPremium: 3, callStrike: 110, callPremium: 2, fees: 0 };
  for (const [putPremium, callPremium, expected] of [[3, 10, /collar price.*\$95 per-share lower bound/], [14, 2, /collar price.*\$110 per-share upper bound/]]) {
    const rows = strategyComparison({ ...standard, putPremium, callPremium });
    assert.deepEqual(rows.map(row => row.feasible), [true, true, true, false]);
    assert.match(rows[3].quoteIssue, expected);
  }
  for (const [initialStock, putPremium, callPremium] of [[90, 5, 0], [115, 0, 5]]) {
    const collar = strategyComparison({ ...standard, initialStock, putPremium, callPremium, fees: 20 })[3];
    assert.equal(collar.quoteIssue, null);
    assert.equal(collar.feasible, true);
  }
  const equal = strategyComparison({ ...standard, putStrike: 100, callStrike: 100, putPremium: 3, callPremium: 3 })[3];
  assert.equal(equal.quoteIssue, null);
  assert.equal(equal.feasible, true);
  assert.equal(strategyComparison({ ...standard, putStrike: 100, callStrike: 100, putPremium: 3, callPremium: 4 })[3].feasible, false);
  for (const [putPremium, callPremium, cause] of [[3, 8, /positive call/], [12, 2, /positive put/], [12, 3, /strike convexity/]]) {
    const rows = strategyComparison({ ...standard, putPremium, callPremium });
    assert.deepEqual(rows.map(row => row.feasible), [true, true, true, false]);
    assert.match(rows[3].quoteIssue, cause);
  }
  for (const [putPremium, callPremium, row] of [[95, 2, 2], [3, 100, 3]]) {
    assert.match(strategyComparison({ ...standard, putPremium, callPremium })[row].quoteIssue, /strictly below/);
  }
  // A distribution with 10% probability at zero and 90% at 115/0.9 gives equal normalized put prices.
  const convexEquality = { ...standard, initialStock: 115, putStrike: 90, callStrike: 120, putPremium: 9, callPremium: 7 };
  assert.equal(strategyComparison(convexEquality)[3].quoteIssue, null);
  assert.equal(strategyComparison({ ...standard, putPremium: 95 - 1e-12 })[2].quoteIssue, null);
  assert.equal(strategyComparison({ ...standard, putPremium: 3, callPremium: 8 - 1e-12 })[3].quoteIssue, null);
});
test("exact-cost budgets fit while real cents and sub-cent shortfalls retain their sign", () => {
  const inputs = { initialStock: 100, finalStock: 100, budget: 9944.03, putStrike: 95, putPremium: 1.01, callStrike: 110, callPremium: 1.57, fees: 0.01 };
  const exact = strategyComparison(inputs)[3];
  assert.equal(exact.initialCash, 0);
  assert.equal(exact.feasible, true);
  for (const [budget, shortfall] of [[9944.02, 0.01], [9944.0299, 0.0001], [9944.02999999999, 1e-11]]) {
    const collar = strategyComparison({ ...inputs, budget })[3];
    assert.equal(collar.feasible, false);
    assert.ok(Math.abs(collar.initialCash + shortfall) < 1e-12);
  }
  for (const [row, budget] of [[1, 10000.01], [2, 10101.02]]) {
    assert.equal(strategyComparison({ ...inputs, budget })[row].initialCash, 0);
  }
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
