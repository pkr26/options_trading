/** Nonmutating advanced-course browser checks. Run against a local dev server. */
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { expect } from "@playwright/test";

const base = new URL(process.env.LOCAL_API_BASE ?? "http://127.0.0.1:5173");
assert.equal(base.protocol, "http:");
assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(base.hostname));
const browser = await chromium.launch({headless: true, executablePath: process.env.CHROME_EXECUTABLE ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"});
const record = {submissions: [], practice: []};
const answers = {recommendation: "Compare protection with reducing stock exposure before choosing a strategy.", analysis: "Reconcile the initial portfolio, premium, stock value and remaining cash under the same budget.", risks: "Allow for liquidity, assignment, funding requirements and model uncertainty.", revision: "", reflection: ""};
let conflictNext = false;
let expectedReceived;
let practicePosts = 0;
const results = {};
const context = await browser.newContext();
await context.route("**/api/learning", route => route.fulfill({json: {user: {name: "Test", email: "test@example.test"}, profile: {dailyMinutes: 15, timezone: "America/Phoenix"}, progress: [], attempts: [], notes: []}}));
await context.route("**/api/graduate", async route => {
  if (route.request().method() === "GET") return route.fulfill({json: record});
  const input = route.request().postDataJSON();
  expectedReceived = input.expectedRevision;
  if (conflictNext) {
    conflictNext = false;
    record.submissions.push({id: "other-tab", moduleId: input.moduleId, revision: 2, kind: "draft", answers: {...answers, recommendation: "Another browser tab saved this distinct recommendation."}, createdAt: "2026-11-14T15:00:00Z", contentVersion: "test-v1"});
    return route.fulfill({status: 409, json: {error: "A newer version is saved. Reload the record and compare it with your draft before saving again."}});
  }
  const submission = {id: `submission-${input.expectedRevision + 1}`, moduleId: input.moduleId, revision: input.expectedRevision + 1, kind: input.kind, answers: input.answers, createdAt: "2026-11-14T14:30:00Z", contentVersion: "test-v1"};
  record.submissions.push(submission);
  return route.fulfill({status: 201, json: {submission}});
});
await context.route("**/api/graduate/practice**", async route => {
  if (route.request().method() === "GET") return route.fulfill({json: {moduleId: 10, sequence: 0, questions: [
    {id: "p1", skill: "contracts", prompt: "One contract uses 100 shares and costs $2 per share. What is the premium?", unit: "dollars", hint: "Multiply the share premium by the multiplier."},
    {id: "p2", skill: "risk", prompt: "Cash falls from $500 to $300. How much cash was used?", unit: "dollars", hint: "Compare the two balances."},
    {id: "p3", skill: "valuation", prompt: "A stock at $52 and $50 strike call have how much intrinsic value?", unit: "dollars per share", hint: "Compare stock with strike."},
  ]}});
  practicePosts++;
  const input = route.request().postDataJSON();
  const expected = {p1: 200, p2: 200, p3: 2};
  const feedback = Object.entries(expected).map(([id, value]) => ({id, skill: id === "p1" ? "contracts" : id === "p2" ? "risk" : "valuation", prompt: `Explanation of ${id}`, unit: "dollars", hint: "", answer: input.answers[id], expected: value, correct: input.answers[id] === value, explanation: "Reconcile the supplied units and the stated input values."}));
  const attempt = {id: "practice-1", moduleId: 10, sequence: 0, score: 2, total: 3, feedback, createdAt: "2026-11-14T14:45:00Z"};
  record.practice.push(attempt);
  return route.fulfill({status: 201, json: {attempt}});
});
try {
  const page = await context.newPage();
  await page.goto(base.href + "#advanced/module/10/case");
  await expect(page.getByRole("heading", {name: "Write the reasoning.", exact: true})).toBeVisible();
  await expect(page.locator(".graduate-module-picker select")).toHaveValue("10");
  const textareas = page.locator(".graduate-writing textarea");
  await expect(textareas).toHaveCount(3);
  await textareas.nth(0).fill(answers.recommendation);
  await textareas.nth(1).fill(answers.analysis);
  await textareas.nth(2).fill(answers.risks);
  await page.getByRole("button", {name: "Commit initial answer & reveal update", exact: true}).click();
  await expect(page.locator(".graduate-writing textarea")).toHaveCount(5);
  await expect(page.locator(".graduate-history").getByText("Revision 1", {exact: false})).toBeVisible();
  assert.equal(record.submissions[0].answers.recommendation, answers.recommendation);
  results.initialCommitment = "Initial memo persisted before the staged update opened.";

  const edited = answers.recommendation + " Preserve these local edits after the conflict.";
  await page.locator(".graduate-writing textarea").nth(0).fill(edited);
  conflictNext = true;
  await page.getByRole("button", {name: "Save draft", exact: true}).click();
  await expect(page.getByRole("heading", {name: "A newer version was saved.", exact: true})).toBeVisible();
  await expect(page.locator(".graduate-writing textarea").nth(0)).toHaveValue(edited);
  await page.getByRole("button", {name: "Keep my edits for the next revision", exact: true}).click();
  await page.getByRole("button", {name: "Save draft", exact: true}).click();
  await expect(page.getByText("Saved revision 3", {exact: true})).toBeVisible();
  assert.equal(expectedReceived, 2);
  assert.equal(record.submissions.at(-1).answers.recommendation, edited);
  results.revisionConflict = "409 preserved local writing; explicit reconciliation saved a new revision.";

  const local = "An unsaved decision memo remains available when returning from another module.";
  await page.locator(".graduate-writing textarea").nth(0).fill(local);
  await page.locator(".graduate-module-picker select").selectOption("9");
  await page.locator(".graduate-module-picker select").selectOption("10");
  await expect(page.locator(".graduate-writing textarea").nth(0)).toHaveValue(local);
  results.moduleNavigation = "Unsaved memo text survived switching modules.";

  await page.locator(".graduate-tabs").getByRole("button", {name: "Fresh practice", exact: true}).click();
  await page.getByRole("button", {name: "Start a fresh practice set", exact: true}).click();
  const numeric = page.locator(".graduate-practice-question input");
  await expect(numeric).toHaveCount(3);
  await numeric.nth(0).fill("2");
  await numeric.nth(1).fill("200");
  await numeric.nth(2).fill("2");
  await page.getByRole("button", {name: "Check and save my answers", exact: true}).click();
  await expect(page.getByText("2 of 3 calculations correct", {exact: true})).toBeVisible();
  assert.equal(practicePosts, 1);
  await page.locator(".graduate-tabs").getByRole("button", {name: "My evidence", exact: true}).click();
  await expect(page.locator(".graduate-mistakes details")).toHaveCount(1);
  await page.locator(".graduate-mistakes summary").click();
  await expect(page.locator(".graduate-mistakes").getByText("Reconcile the supplied units and the stated input values.", {exact: true})).toBeVisible();
  results.feedback = "Graded practice persisted and the original mistake appeared in the journal.";

  await page.setViewportSize({width: 390, height: 844});
  await page.locator(".graduate-tabs").getByRole("button", {name: "Program", exact: true}).click();
  await expect(page.locator(".graduate-module-card")).toHaveCount(26);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), "The advanced program must fit a mobile viewport.");
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await page.screenshot({path: "/tmp/options-graduate-mobile.png", fullPage: false});
  results.mobile = "26-module pathway fits a 390px viewport without document overflow.";
  await page.setViewportSize({width: 1440, height: 1050});
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await page.screenshot({path: "/tmp/options-graduate-desktop.png", fullPage: false});

  const guest = await browser.newContext({viewport: {width: 390, height: 844}});
  await guest.route("**/api/graduate", route => route.fulfill({status: 401, json: {error: "Sign in to save your learning."}}));
  const guestPage = await guest.newPage();
  await guestPage.goto(base.href + "#advanced/module/10/seminar");
  await expect(guestPage.locator(".graduate-reading>h2")).toBeVisible();
  await expect(guestPage.locator(".graduate-record-status a")).toHaveAttribute("href", "/signin-with-chatgpt?return_to=%2F");
  await expect(guestPage.locator(".graduate-record-status a")).toHaveAttribute("target", "_top");
  results.guest = "Unsigned visitors can read the classroom and see the correct sign-in action.";
  await guest.close();
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}
