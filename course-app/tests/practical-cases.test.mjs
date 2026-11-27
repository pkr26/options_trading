import test from "node:test";
import assert from "node:assert/strict";
import { getPracticalForm, gradePractical } from "../lib/practical-cases.ts";

// Independent cash books in integer cents. A positive balance is cash held by the
// account. Contract premiums and marks multiply the per-share quote by 100.
const usd = cents => cents / 100;
const aInitial = {
  intrinsic: (51 - 50) * 100,
  exercisePayment: 50 * 100,
  netResult: usd(-18000 - 100 - 500000 + 510000 - 100),
  breakEven: usd((500000 + 18000 + 100 + 100) / 100),
};
const aTransfer = {
  exercisePayment: 52 * 100, shortfall: 5200 - 4800,
  saleReceipt: usd(22000 - 100), netResult: usd(-23000 - 100 + 22000 - 100), shares: 0,
};
// Independent starting books for both tickets. Bids/asks in one exercise do
// not decrement the other ticket's available size. Only executed contracts cost a fee.
const bInitial = {
  t1Filled: 0, t1Unfilled: 2, t1Open: 0, t1Fees: 0, t1Cash: 0,
  t2Filled: 1, t2Unfilled: 1, t2Open: 1, t2Fees: usd(75), t2Cash: usd(110 * 100 + 75),
};
const bTransfer = {
  t1Filled: 2, t1Unfilled: 1, t1Open: 3 - 2, t1Fees: usd(2 * 75), t1Cash: usd(2 * (140 * 100 - 75)),
  t2Filled: 0, t2Unfilled: 3, t2Open: 3, t2Fees: 0, t2Cash: 0,
};
const cEntry = 2 * (95 * 100 + 65), cSale = 2 * (125 * 100 - 65);
const cInitial = {
  cashAfterEntry: usd(200000 - cEntry), exitReceipt: usd(cSale),
  finalCash: usd(200000 - cEntry + cSale), realized: usd(cSale - cEntry),
};
const costPerPut = 120 * 100 + 50, receiptPerClosedPut = 150 * 100 - 75;
const postSaleCash = 150000 - 3 * costPerPut + 2 * receiptPerClosedPut;
const cTransfer = {
  cashAfterEntry: usd(150000 - 3 * costPerPut), finalCash: usd(postSaleCash),
  realized: usd(2 * (receiptPerClosedPut - costPerPut)), openContracts: 3 - 2,
  openValue: usd(90 * 100), equity: usd(postSaleCash + 90 * 100),
};
const dInitial = {
  entryCredit: usd(14000 - 4000), assignmentPayment: 30 * 100,
  cash: usd(600000 + 14000 - 4000 - 300000), shares: 100, openContracts: 1, openValue: usd(15 * 100),
  equity: usd(310000 + 280000 + 1500), equityChange: usd(310000 + 280000 + 1500 - 600000),
};
const dTransfer = {
  entryCredit: usd(16000 - 5500), assignmentReceipt: 42 * 100,
  cash: usd(750000 + 16000 - 5500 + 420000), shares: -100, openContracts: 1, openValue: usd(45 * 100),
  equity: usd(1180500 - 460000 + 4500), equityChange: usd(1180500 - 460000 + 4500 - 750000),
};
const ledgers = {
  A: { initial: aInitial, transfer: aTransfer }, B: { initial: bInitial, transfer: bTransfer },
  C: { initial: cInitial, transfer: cTransfer }, D: { initial: dInitial, transfer: dTransfer },
};

for (const [id, stages] of Object.entries(ledgers)) {
  for (const [stage, answers] of Object.entries(stages)) {
    test(`case ${id} ${stage} grades every field against its independent cash and position book`, () => {
      const form = getPracticalForm(id, stage);
      assert.deepEqual(Object.keys(form).sort(), ["id", "stage", "title", "scenario", "fields", "reasoningPrompt"].sort());
      assert.equal(form.id, id);
      assert.equal(form.stage, stage);
      assert.match(form.scenario, /expire January 15, 2027/);
      assert.match(form.scenario, /American-style, physically settled and unadjusted/);
      assert.match(form.scenario, /100 premium multiplier and a 100-share deliverable/);
      assert.ok(form.reasoningPrompt && form.title);
      for (const f of form.fields) {
        assert.deepEqual(Object.keys(f).sort(), ["key", "label", "unit"]);
        assert.ok(f.label && ["USD", "USD/share", "contracts", "shares"].includes(f.unit));
      }
      assert.deepEqual(form.fields.map(f => f.key).sort(), Object.keys(answers).sort());
      const checks = gradePractical(id, stage, answers);
      assert.deepEqual(checks.map(c => c.key), form.fields.map(f => f.key));
      for (const check of checks) {
        assert.equal(check.expected, answers[check.key]);
        assert.equal(check.correct, true);
        assert.ok(check.explanation.length > 15);
      }
      const wrong = Object.fromEntries(form.fields.map(({key, unit}) => [key, answers[key] + (unit.startsWith("USD") ? 0.01 : 0.001)]));
      assert.ok(gradePractical(id, stage, wrong).every(c => !c.correct));
    });
  }
}

test("grading rejects missing, extra, inherited, nonfinite or coerced fields", () => {
  const { intrinsic, ...missing } = aInitial;
  const inherited = Object.assign(Object.create({ intrinsic }), missing);
  for (const answers of [null, [], true, missing, inherited, {...aInitial, [Symbol("extra")]: 0}, {...aInitial, extra: 0}, {...missing, extra: intrinsic}]) {
    assert.throws(() => gradePractical("A", "initial", answers), TypeError);
  }
  for (const value of ["100", null, true, NaN, Infinity, -Infinity]) {
    assert.throws(() => gradePractical("A", "initial", {...aInitial, intrinsic: value}), TypeError);
  }
  for (const [id, stage] of [["Z", "initial"], ["constructor", "initial"], ["A", "post"]]) {
    assert.throws(() => getPracticalForm(id, stage), RangeError);
    assert.throws(() => gradePractical(id, stage, aInitial), RangeError);
  }
});

test("money grading accepts rounding noise and requires the correct cent; counts are exact", () => {
  for (const sign of [1, -1]) {
    const near = gradePractical("A", "initial", {...aInitial, breakEven: 51.82 + sign * 0.0049});
    const offByOneCent = gradePractical("A", "initial", {...aInitial, breakEven: 51.82 + sign * 0.01});
    assert.equal(near.find(c => c.key === "breakEven").correct, true);
    assert.equal(offByOneCent.find(c => c.key === "breakEven").correct, false);
    const wrongCount = gradePractical("D", "transfer", {...dTransfer, shares: -100 + sign * 0.000001});
    assert.equal(wrongCount.find(c => c.key === "shares").correct, false);
  }
});

test("public forms are fresh copies and every transfer requires a different operation", () => {
  const form = getPracticalForm("A", "initial");
  form.fields[0].label = "altered";
  assert.notEqual(getPracticalForm("A", "initial").fields[0].label, "altered");
  assert.match(getPracticalForm("A", "transfer").scenario, /sale to close.*stipulated fill/);
  assert.match(getPracticalForm("B", "transfer").scenario, /Reset the three-contract position and quote/);
  assert.match(getPracticalForm("B", "transfer").reasoningPrompt, /deliverable and quote timestamp are missing/);
  assert.match(getPracticalForm("C", "transfer").scenario, /only two sell to close/);
  assert.match(getPracticalForm("D", "transfer").scenario, /only the short call is assigned/);
});
