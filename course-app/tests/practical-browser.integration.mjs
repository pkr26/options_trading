// Local UI journey using the real practical grading/state transitions, an in-memory
// event store and a fixture clock. The HTTP integration suite covers actual D1.
import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";
import { getPracticalForm } from "../lib/practical-cases.ts";
import { practicalEvent, practicalInput, projectPracticalState } from "../lib/practical-state.ts";

const base = new URL(process.env.LOCAL_API_BASE ?? "http://127.0.0.1:5173");
assert.equal(base.protocol, "http:");
assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(base.hostname));
const browser = await chromium.launch({ channel: "chrome", headless: true });
const range = "5–10 minutes per case, on four separate days";
const initial = getPracticalForm("A", "initial");
const transfer = getPracticalForm("A", "transfer");
const rows = [];
let now = Date.parse("2026-11-01T12:00:00Z");
let solutionsSeen = false;
const record = () => projectPracticalState(rows, true, now, solutionsSeen);
const learning = {
  user: { id: "fixture-learner", name: "Learner", email: "learner@example.test" },
  profile: { dailyMinutes: 15, timezone: "UTC" }, notes: [],
  progress: Array.from({ length: 62 }, (_, i) => ({
    lessonId: i + 1, completedAt: new Date(now).toISOString(), nextReviewAt: "2026-12-01T12:00:00Z",
    reviewCount: 0, reviewRevision: 0,
  })),
  attempts: Array.from({ length: 7 }, (_, i) => ({
    id: "checkpoint-" + (i + 1), moduleId: i + 1, variant: 0, score: 5, total: 5, passed: true,
    createdAt: new Date(now).toISOString(), sequence: 1, answers: null, feedback: null,
    courseVersion: null, questionVersion: null,
  })),
};

try {
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.clock.setFixedTime(new Date(now));
  await context.route("**/api/learning", route => route.fulfill({json: learning}));
  await context.route("**/api/practical", async route => {
    if (route.request().method() === "POST") {
      const input = practicalInput.parse(route.request().postDataJSON());
      const state = record().cases.find(item => item.id === input.id);
      const payload = practicalEvent(input, state);
      rows.push({ entityId: input.id, revision: state.revision + 1, payload, createdAt: new Date(now).toISOString() });
      return route.fulfill({status: 201, json: {...record(),ownerId:learning.user.id}});
    }
    return route.fulfill({json: {...record(),ownerId:learning.user.id}});
  });

  await page.goto(base.href);
  await expect(page.locator(".hero-meta")).toContainText(range);
  await page.getByRole("button", {name: "Explore all lessons", exact: true}).click();
  const chapter = page.locator(".chapter-panel").filter({hasText: "Practice and put it together"});
  if (await chapter.locator(".chapter-toggle").getAttribute("aria-expanded") === "false") {
    await chapter.locator(".chapter-toggle").click();
  }
  const capstone = chapter.locator(".lesson-row").filter({hasText: "Put the pieces together in four small cases"});
  await expect(capstone.locator(".lesson-time")).toHaveText(range);
  await capstone.click();
  await expect(page).toHaveURL(/#lesson\/63$/);
  await expect(page.locator(".lesson-heading")).toContainText(range);

  const ledger = page.locator(".practical-ledger");
  const button = name => ledger.getByRole("button", {name, exact: true});
  const answer = (form, key) => ledger.getByLabel(form.fields.find(field => field.key === key).label);
  const reason = ledger.getByLabel("Explain your reasoning");
  const assist = ledger.getByLabel("Help used");
  async function write(action) {
    const received = page.waitForResponse(response => new URL(response.url()).pathname === "/api/practical" && response.request().method() === "POST");
    await button(action).click();
    assert.equal((await received).status(), 201);
  }
  async function fill(form, answers) {
    for (const [key, value] of Object.entries(answers)) await answer(form, key).fill(String(value));
  }

  for (const id of ["A", "B", "C", "D"]) {
    await button("Case " + id).click();
    await expect(ledger).toContainText(getPracticalForm(id, "initial").title);
  }
  await button("Case A").click();
  await answer(initial, "exercisePayment").fill("5000");
  const draftReason = "The full strike payment is due before proceeds from selling the shares arrive.";
  await reason.fill(draftReason);
  await assist.selectOption("none");
  await write("Save case draft");
  await expect(ledger).toContainText(/saved case draft|case draft saved/i);
  await page.reload();
  await expect(answer(initial, "exercisePayment")).toHaveValue("5000");
  await expect(reason).toHaveValue(draftReason);
  await expect(answer(initial, "netResult")).toHaveValue("");

  await fill(initial, {intrinsic: 100, exercisePayment: 5000, netResult: 82, breakEven: 51.82});
  await assist.selectOption("none");
  await write("Grade ledger");
  await expect(ledger).toContainText("First attempt");
  assert.equal(record().cases[0].attempts[0].allCorrect, false);
  await fill(initial, {intrinsic: 100, exercisePayment: 5000, netResult: -82, breakEven: 51.82});
  await reason.fill("The premium and fees exceed intrinsic value, so the signed result is a loss of $82.");
  await assist.selectOption("help");
  await write("Grade ledger");
  await page.reload();
  await button("Case A").click();
  const history = ledger.getByRole("region", {name: "Attempt history"});
  const first = history.locator("details").filter({hasText: "First attempt"});
  await expect(first.locator("summary")).toContainText("3/4 entries correct");
  await first.locator("summary").click();
  await expect(first.getByText(draftReason, {exact: false})).toBeVisible();
  await expect(first.locator("dd").filter({hasText: "Needs correction"})).toContainText("Your entry 82. Expected -82.");
  await expect(history.locator("summary").filter({hasText: "Correction 1"})).toContainText("4/4 entries correct");
  assert.deepEqual(record().cases[0].attempts.map(a => [a.answers.netResult, a.allCorrect, a.assistance]),
    [[82, false, "none"], [-82, true, "help"]]);

  const disclosure = ledger.locator("summary").filter({hasText: "Complete numeric solutions and safety pass"});
  const keyExcerpt = "The $100 credit does not fund the $3,000 exercise obligation.";
  const keyParagraph = page.locator(".lesson-article p").filter({hasText: keyExcerpt});
  const requestedDisclosure = Promise.withResolvers();
  const allowDisclosure = Promise.withResolvers();
  await context.route("**/api/practical/solutions", async route => {
    requestedDisclosure.resolve(route.request());
    await allowDisclosure.promise;
    solutionsSeen = true;
    return route.fulfill({json: {recorded: true}});
  });
  await expect(keyParagraph).toHaveCount(0);
  await disclosure.click();
  const exposureRequest = await requestedDisclosure.promise;
  assert.equal(exposureRequest.method(), "POST");
  assert.equal(exposureRequest.postDataJSON().expectedOwnerId, learning.user.id);
  await expect(disclosure.locator("..")).not.toHaveAttribute("open", "");
  await expect(keyParagraph).toHaveCount(0);
  allowDisclosure.resolve();
  await expect(keyParagraph).toBeVisible();
  await expect(assist).toBeDisabled();
  await expect(assist).toHaveValue("help");
  await page.reload();
  await expect(keyParagraph).toHaveCount(0);
  for (const id of ["A", "B", "C", "D"]) {
    await button("Case " + id).click();
    await expect(assist).toBeDisabled();
    await expect(assist).toHaveValue("help");
  }
  await button("Case A").click();
  await expect(first.locator("summary")).toContainText("3/4 entries correct");
  await first.locator("summary").click();
  await expect(first.getByText(/Reported no help/)).toBeVisible();
  await expect(history.locator("summary").filter({hasText: "Correction 1"})).toContainText("4/4 entries correct");

  now += 7 * 86_400_000 - 1;
  await page.clock.setFixedTime(new Date(now));
  await page.reload();
  await button("Case A").click();
  await button("Seven-day transfer").click();
  await expect(ledger).toContainText("The changed case opens");
  await expect(answer(transfer, "shortfall")).toHaveCount(0);
  assert.equal(record().cases[0].forms.transfer, null);
  now += 1;
  await page.clock.setFixedTime(new Date(now));
  await page.reload();
  await button("Seven-day transfer").click();
  await expect(ledger).toContainText(transfer.title);
  await expect(answer(transfer, "shortfall")).toHaveValue("");
  await expect(assist).toBeEnabled();
  await expect(assist).toHaveValue("");
  await fill(transfer, {exercisePayment: 5200, shortfall: 400, saleReceipt: 219, netResult: -12, shares: 0});
  await reason.fill("Sell to close because exercise needs $400 more cash. Receive $219 and hold no stock. Entry cost was $231.");
  await assist.selectOption("none");
  await write("Grade ledger");
  const later = record().cases[0].attempts.at(-1);
  assert.deepEqual([later.stage, later.independent, later.allCorrect], ["transfer", true, true]);
  await page.reload();
  await button("Case A").click();
  await button("Seven-day transfer").click();
  await expect(ledger).toContainText(transfer.title);
  await expect(ledger.getByRole("region", {name: "Attempt history"})).toContainText("5/5 entries correct");
  assert.equal(record().cases[0].attempts.length, 3);

  const delayed = await context.newPage();
  const identityRequested = Promise.withResolvers();
  const releaseIdentity = Promise.withResolvers();
  await delayed.route("**/api/learning", async route => {
    identityRequested.resolve();
    await releaseIdentity.promise;
    return route.fulfill({json: learning});
  });
  let practicalReads = 0;
  delayed.on("request", request => {
    if (new URL(request.url()).pathname === "/api/practical" && request.method() === "GET") practicalReads++;
  });
  await delayed.goto(new URL("/#lesson/63", base).href, {waitUntil: "domcontentloaded"});
  await identityRequested.promise;
  await expect(delayed.locator(".lesson-heading")).toContainText("four small cases");
  // Let hydration and the reader's effects settle while the account response is held.
  await delayed.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  assert.equal(practicalReads, 0, "The practical must wait for the reader's resolved identity");
  await expect(delayed.locator(".practical-ledger :is(input,textarea,select):enabled")).toHaveCount(0);
  releaseIdentity.resolve();
  const bound = delayed.locator(".practical-ledger");
  await bound.getByRole("button", {name: "Case B", exact: true}).click();
  const b = getPracticalForm("B", "initial");
  const filled = bound.getByLabel(b.fields.find(field => field.key === "t1Filled").label);
  const boundReasoning = "Ticket one is below the ask and receives no fill.";
  await filled.fill("0");
  await bound.getByLabel("Explain your reasoning").fill(boundReasoning);
  await expect(bound.getByLabel("Help used")).toBeDisabled();
  const sent = delayed.waitForRequest(request => new URL(request.url()).pathname === "/api/practical" && request.method() === "POST");
  await bound.getByRole("button", {name: "Save case draft", exact: true}).click();
  const saved = (await sent).postDataJSON();
  assert.equal(saved.expectedOwnerId, learning.user.id);
  assert.deepEqual([saved.id, saved.answers.t1Filled, saved.reasoning, saved.assistance], ["B", "0", boundReasoning, "help"]);
  await expect(bound.getByRole("status")).toContainText("Saved case draft");
  await expect(filled).toHaveValue("0");
  await delayed.reload();
  await expect(filled).toHaveValue("0");
  await expect(bound.getByLabel("Explain your reasoning")).toHaveValue(boundReasoning);
  await delayed.close();

  const mismatch = await context.newPage();
  let mismatchWrites = 0;
  await mismatch.route("**/api/practical", route => {
    if (route.request().method() === "POST") mismatchWrites++;
    return route.fulfill({json: {...record(), ownerId: "other-fixture-learner"}});
  });
  await mismatch.goto(new URL("/#lesson/63", base).href);
  const refused = mismatch.locator(".practical-ledger");
  await expect(refused.getByRole("alert")).toContainText("Your signed-in account changed");
  await expect(refused.getByRole("button", {name: "Case B", exact: true})).toHaveCount(0);
  await expect(refused.locator("input,textarea,select")).toHaveCount(0);
  await expect(refused).not.toContainText(boundReasoning);
  await expect(refused).not.toContainText(b.title);
  assert.equal(mismatchWrites, 0);
  await mismatch.close();

  assert.deepEqual(errors, []);
  console.log("Passed Lesson 63 browser journey: course timing, four cases, resumed draft, first and corrected ledgers, acknowledged solution disclosure, delayed changed case, independent transfer, delayed identity and mismatched-record handling.");
} finally {
  await browser.close();
}
