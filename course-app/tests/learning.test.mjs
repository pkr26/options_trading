import test from "node:test";
import assert from "node:assert/strict";
import { buildQuiz } from "../lib/quiz-bank.ts";
import { gradeQuestions, reviewDate } from "../lib/learning.ts";

// Independently calculated answer texts: rotations and correctIndex must agree
// with these facts, rather than using the bank's own key to define correctness.
const shared = {
  index: "A measure that tracks a defined group of securities",
  limit: "Your limit caps the price if filled; a fill is not guaranteed",
  call: "The right to buy shares at the strike under the contract terms",
  put: "The right to sell shares at the strike under the contract terms",
  series: "Same underlying, call/put type, strike, exact expiry and adjustment terms",
  close: "Removes your long call position when the sale fills",
  uncovered: "No finite upper limit",
  itm: "It is in the money but loses money after premium",
  gamma: "How delta changes as the underlying price changes",
  theta: "No; stock, volatility and other inputs may change",
  ivFall: "Yes; a fall in implied volatility and time effects can outweigh the stock effect",
  iv: "A volatility input inferred from option market prices and a model",
  expiry: "No; exercise procedures can create a share purchase and funding needs",
  adjusted: "Use its exact OCC adjustment terms and separate premium and deliverable calculations",
  covered: "No; shares can still lose most of their value",
  joint: "No; the positions may lose together",
  nonfill: "No trade P&L; retain the unfilled decision in the log",
  quote: "Source, timestamp, delay, contract terms, bid/ask and displayed sizes",
  assigned: "A short-stock position plus the remaining long call and cash/funding obligations",
  practice: "Knowledge and simulation practice; live profitability remains unproven",
};

const canonical = [
  [
    ["$100", "10%", shared.index, "$19.80 bid", shared.limit],
    [shared.call, shared.put, "$240", shared.series, shared.close],
    ["$400", "$300", "$52", shared.uncovered, shared.itm],
    ["About +$0.40", shared.gamma, shared.theta, shared.ivFall, shared.iv],
    ["Pay $5000; receive 100 shares", "Pay $5000; receive 100 shares", "Yes", shared.expiry, shared.adjusted],
    ["$200", "$400", shared.covered, "$700", "$4000"],
    ["−$4 per trial", "25%", "Zero contracts", shared.joint, "No"],
    ["$38", shared.nonfill, shared.quote, shared.assigned, shared.practice],
  ],
  [
    ["$84", "10%", shared.index, "$9.90 bid", shared.limit],
    [shared.call, shared.put, "$180", shared.series, shared.close],
    ["$500", "$200", "$63", shared.uncovered, shared.itm],
    ["About +$0.35", shared.gamma, shared.theta, shared.ivFall, shared.iv],
    ["Pay $4000; receive 100 shares", "Pay $4000; receive 100 shares", "Yes", shared.expiry, shared.adjusted],
    ["$300", "$700", shared.covered, "$1200", "$8000"],
    ["−$4 per trial", "100%", "Zero contracts", shared.joint, "No"],
    ["$68", shared.nonfill, shared.quote, shared.assigned, shared.practice],
  ],
];

test("both variants provide all 8×5 questions with unique, valid choices and canonical keys", () => {
  const ids = new Set();
  for (let variant = 0; variant < 2; variant++) {
    for (let moduleId = 1; moduleId <= 8; moduleId++) {
      const questions = buildQuiz(moduleId, variant);
      assert.equal(questions.length, 5);
      for (const [index, question] of questions.entries()) {
        assert.ok(!ids.has(question.id), question.id);
        ids.add(question.id);
        assert.ok(question.prompt.trim());
        assert.ok(question.explanation.trim());
        assert.equal(question.options.length, 4);
        assert.equal(new Set(question.options).size, 4);
        assert.ok(question.options.every(option => typeof option === "string" && option.trim()));
        assert.ok(Number.isInteger(question.correctIndex));
        assert.ok(question.correctIndex >= 0 && question.correctIndex < 4);
        assert.equal(question.options[question.correctIndex], canonical[variant][moduleId - 1][index], question.id);
      }
    }
  }
  assert.equal(ids.size, 80);
});

test("numeric variants change the arithmetic instead of merely moving choices", () => {
  for (const moduleId of [1, 2, 3, 4, 5, 6, 7, 8]) {
    const first = buildQuiz(moduleId, 0);
    const second = buildQuiz(moduleId, 1);
    assert.ok(first.some((q, index) => q.prompt !== second[index].prompt), `module ${moduleId}`);
  }
  for (const [moduleId, variant] of [[0, 0], [9, 0], [1.5, 0], [1, -1], [1, 2]]) {
    assert.throws(() => buildQuiz(moduleId, variant));
  }
});

test("grading requires every answer and returns complete feedback for an imperfect attempt", () => {
  const questions = buildQuiz(3, 0);
  const answers = Object.fromEntries(questions.map((q, index) => [q.id, q.options.indexOf(canonical[0][2][index])]));
  const perfect = gradeQuestions(questions, answers);
  assert.equal(perfect.score, 5);
  assert.equal(perfect.total, 5);
  assert.equal(perfect.passed, true);
  const imperfectAnswers = {...answers, [questions[0].id]: (answers[questions[0].id] + 1) % 4};
  const imperfect = gradeQuestions(questions, imperfectAnswers);
  assert.equal(imperfect.score, 4);
  assert.equal(imperfect.passed, false);
  assert.equal(imperfect.feedback[0].correct, false);
  assert.equal(imperfect.feedback[0].selected, imperfectAnswers[questions[0].id]);
  assert.equal(imperfect.feedback[0].options[imperfect.feedback[0].correctIndex], "$400");
  assert.ok(imperfect.feedback.every(q => q.explanation));
});

test("grading rejects missing, extra, invalid, or inherited answers", () => {
  const questions = buildQuiz(1, 0);
  const valid = Object.fromEntries(questions.map(q => [q.id, 0]));
  const missing = {...valid};
  delete missing[questions[0].id];
  assert.throws(() => gradeQuestions(questions, missing));
  assert.throws(() => gradeQuestions(questions, {...valid, unrelated: 1}));
  assert.throws(() => gradeQuestions(questions, {...missing, unrelated: 1}));
  for (const invalid of [-1, 4, 1.5, "1", true, null, Number.NaN, Infinity]) {
    assert.throws(() => gradeQuestions(questions, {...valid, [questions[0].id]: invalid}));
  }
  const inherited = Object.assign(Object.create({[questions[0].id]: 0}), missing, {unrelated: 0});
  assert.equal(Object.keys(inherited).length, questions.length);
  assert.throws(() => gradeQuestions(questions, inherited));
  for (const invalid of [null, undefined, [], "answers"]) assert.throws(() => gradeQuestions(questions, invalid));
});

test("review scheduling advances on recall, resets on a miss, and caps the interval", () => {
  const now = new Date("2026-11-14T12:00:00.000Z");
  assert.equal(reviewDate(0, true, now), "2026-11-15T12:00:00.000Z");
  assert.equal(reviewDate(1, true, now), "2026-11-17T12:00:00.000Z");
  assert.equal(reviewDate(2, true, now), "2026-11-21T12:00:00.000Z");
  assert.equal(reviewDate(3, true, now), "2026-11-28T12:00:00.000Z");
  assert.equal(reviewDate(4, true, now), "2026-12-14T12:00:00.000Z");
  assert.equal(reviewDate(99, true, now), "2026-12-14T12:00:00.000Z");
  assert.equal(reviewDate(3, false, now), "2026-11-15T12:00:00.000Z");
  for (const invalid of [-1, 1.5, Infinity, Number.NaN]) assert.throws(() => reviewDate(invalid, true, now));
});
