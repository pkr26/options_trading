import assert from "node:assert/strict";
import test from "node:test";
import { practicalEvent, practicalInput, projectPracticalState } from "../lib/practical-state.ts";

const start = Date.parse("2026-11-01T08:00:00.000Z");
const due = start + 7 * 86400000;
const row = (payload, revision, at, entityId = "A") => ({ entityId, revision, createdAt: new Date(at).toISOString(), payload });
const initial = (rows = [], now = start) => projectPracticalState(rows, true, now).cases[0];
const request = patch => practicalInput.parse({
  id: "A", stage: "initial", action: "draft", expectedRevision: 0, answers: {},
  reasoning: "", assistance: "none", ...patch,
});
const zeros = form => Object.fromEntries(form.fields.map(field => [field.key, "0"]));

test("guest preview has only initial prompts, even when given existing learner history", () => {
  const event = practicalEvent(request({ answers: zeros(initial().forms.initial), action: "submit", reasoning: "Owned explanation." }), initial());
  const state = projectPracticalState([row(event, 1, start)], false, due);
  assert.equal(state.signedIn, false);
  assert.deepEqual(state.cases.map(item => item.id), ["A", "B", "C", "D"]);
  for (const item of state.cases) {
    assert.equal(item.forms.transfer, null);
    assert.deepEqual(item.attempts, []);
    assert.equal(item.dueAt, null);
    assert.equal(item.revision, 0);
  }
  assert.doesNotMatch(JSON.stringify(state), /"expected"|"checks"|Owned explanation/);
});

test("incomplete draft persists, corrected ledgers preserve first answers, and transfer is gated to the millisecond", () => {
  const form = initial().forms.initial;
  const firstDraft = practicalEvent(request({ answers: { [form.fields[0].key]: "-" }, assistance: "help" }), initial());
  const rows = [row(firstDraft, 1, start - 10000)];
  assert.equal(initial(rows).draft.answers[form.fields[0].key], "-");
  assert.equal(initial(rows, due).forms.transfer, null);
  const first = practicalEvent(request({ action: "submit", expectedRevision: 1, answers: zeros(form), reasoning: "First explanation." }), initial(rows));
  rows.push(row(first, 2, start));
  assert.equal(first.assistance, "help");
  assert.equal(first.attemptType, "first");
  assert.equal(initial(rows).dueAt, new Date(due).toISOString());
  const corrected = Object.fromEntries(first.checks.map(check => [check.key, String(check.expected)]));
  const correction = practicalEvent(request({ action: "submit", expectedRevision: 2, reasoning: "Corrected working.", answers: corrected }), initial(rows));
  rows.push(row(correction, 3, start + 1000));
  assert.equal(correction.allCorrect, true);
  assert.equal(correction.attemptType, "correction");
  assert.equal(initial(rows).attempts[0].reasoning, "First explanation.");
  assert.deepEqual(initial(rows).attempts[0].answers, Object.fromEntries(form.fields.map(field => [field.key, 0])));
  assert.deepEqual(initial(rows).attempts[0].form, form);
  assert.equal(initial(rows).dueAt, new Date(due).toISOString());
  assert.equal(initial(rows, due - 1).forms.transfer, null);
  assert.throws(() => practicalEvent(request({ expectedRevision: 3, stage: "transfer" }), initial(rows, due - 1)), { status: 409 });
  assert.ok(initial(rows, due).forms.transfer);
  assert.equal(projectPracticalState(rows, true, due).cases[1].forms.transfer, null);
  const firstTransfer = practicalEvent(request({ action: "submit", stage: "transfer", expectedRevision: 3,
    answers: zeros(initial(rows, due).forms.transfer), reasoning: "Fresh transfer working." }), initial(rows, due));
  rows.push(row(firstTransfer, 4, due));
  assert.equal(firstTransfer.independent, true);
  const transferCorrection = practicalEvent(request({ action: "submit", stage: "transfer", expectedRevision: 4,
    answers: zeros(initial(rows, due).forms.transfer), reasoning: "Retry." }), initial(rows, due));
  assert.equal(transferCorrection.independent, false);
  assert.equal(transferCorrection.attemptType, "correction");
});

test("both stage drafts resume, and disclosed transfer assistance survives edits", () => {
  const attempt = practicalEvent(request({ action: "submit", answers: zeros(initial().forms.initial), reasoning: "My reasoning." }), initial());
  const rows = [row(attempt, 1, start)];
  for (const [i, stage] of ["initial", "transfer", "transfer"].entries()) {
    const draft = practicalEvent(request({ expectedRevision: i + 1, stage, reasoning: stage, assistance: i === 1 ? "help" : "none" }), initial(rows, due));
    rows.push(row(draft, i + 2, due));
  }
  const state = initial(rows, due);
  assert.equal(state.draft.stage, "transfer");
  assert.equal(state.drafts.initial.reasoning, "initial");
  assert.equal(state.drafts.transfer.assistance, "help");
  const transfer = practicalEvent(request({ action: "submit", stage: "transfer", expectedRevision: 4,
    reasoning: "I used help.", answers: zeros(state.forms.transfer) }), state);
  assert.equal(transfer.assistance, "help");
  assert.equal(transfer.independent, false);
  const next = initial([...rows, row(transfer, 5, due)], due);
  assert.equal(next.draft.stage, "initial");
  assert.equal(next.drafts.transfer, undefined);
});

test("mutations require explicit assistance, current revision, issued keys, genuine numbers and a written explanation", () => {
  const state = initial();
  assert.throws(() => request({ assistance: undefined }));
  assert.throws(() => request({ userId: "other" }));
  assert.throws(() => practicalEvent(request({ expectedRevision: 1 }), state), { status: 409 });
  assert.throws(() => practicalEvent(request({ answers: { invented: "10" } }), state), { status: 400 });
  const input = { action: "submit", reasoning: "My working.", answers: zeros(state.forms.initial) };
  assert.throws(() => practicalEvent(request({ ...input, reasoning: "  " }), state), { status: 400 });
  assert.throws(() => practicalEvent(request({ ...input, answers: {} }), state), { status: 400 });
  for (const s of ["", "  ", "Infinity", "0x40", "1/2", "1e309"]) {
    assert.throws(() => practicalEvent(request({ ...input, answers: { ...input.answers, [state.forms.initial.fields[0].key]: s } }), state), { status: 400 });
  }
});
