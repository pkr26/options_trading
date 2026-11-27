// Reordered API responses on direct beginner checkpoint and resource URLs.
import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";
import { buildQuiz } from "../lib/quiz-bank.ts";
import { gradeQuestions } from "../lib/learning.ts";

const base = new URL(process.env.LOCAL_API_BASE ?? "http://127.0.0.1:5173");
assert.equal(base.protocol, "http:");
assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(base.hostname));
const browser = await chromium.launch({channel: "chrome", headless: true});

async function release(page, gate, request) {
  const received = page.waitForResponse(response => response.request() === request);
  gate.resolve();
  await (await received).finished();
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

try {
  const context = await browser.newContext();
  await context.route("**/api/learning", route => route.fulfill({json: {
    user: {name: "Learner", email: "learner@example.test"}, profile: {dailyMinutes: 15, timezone: "UTC"},
    attempts: [], progress: [], notes: [],
  }}));
  const page = await context.newPage();
  const oldGet = Promise.withResolvers(), oldPost = Promise.withResolvers();
  const submissions = [];
  await page.route("**/api/quiz**", async route => {
    const request = route.request();
    if (request.method() === "GET") {
      const moduleId = Number(new URL(request.url()).searchParams.get("moduleId"));
      if (moduleId === 1) await oldGet.promise;
      const questions = buildQuiz(moduleId, 0).map(({id, prompt, options}) => ({id, prompt, options}));
      return route.fulfill({json: {moduleId, variant: 0, revision: 0, questions}});
    }
    const {moduleId, variant, answers} = request.postDataJSON();
    submissions.push(moduleId);
    const feedback = gradeQuestions(buildQuiz(moduleId, variant), answers);
    await oldPost.promise;
    return route.fulfill({json: feedback});
  });

  const requestedGet = page.waitForRequest(request => request.url().endsWith("/api/quiz?moduleId=1"));
  await page.goto(new URL("/#checkpoint/1", base).href);
  const firstRequest = await requestedGet;
  await page.evaluate(() => { window.location.hash = "checkpoint/2"; });
  const questions = page.locator(".quiz-question");
  await expect(questions.first()).toContainText(buildQuiz(2, 0)[0].prompt);
  await release(page, oldGet, firstRequest);
  await expect(questions.first()).toContainText(buildQuiz(2, 0)[0].prompt);

  for (const question of await questions.all()) await question.getByRole("radio").first().check();
  const requestedPost = page.waitForRequest(request => request.method() === "POST" && request.url().endsWith("/api/quiz"));
  await page.getByRole("button", {name: "Check my understanding", exact: true}).click();
  const submitted = await requestedPost;
  assert.equal(submitted.postDataJSON().moduleId, 2);
  await page.evaluate(() => { window.location.hash = "checkpoint/3"; });
  await expect(questions.first()).toContainText(buildQuiz(3, 0)[0].prompt);
  const newChoice = questions.first().getByRole("radio").nth(1);
  await newChoice.check();
  await release(page, oldPost, submitted);
  assert.deepEqual(submissions, [2]);
  await expect(page).toHaveURL(/#checkpoint\/3$/);
  await expect(questions.first()).toContainText(buildQuiz(3, 0)[0].prompt);
  await expect(newChoice).toBeChecked();
  await expect(newChoice).toBeEnabled();
  await expect(page.locator(".checkpoint-result, .question-feedback")).toHaveCount(0);

  const resourcePage = await context.newPage();
  const catalog = Promise.withResolvers();
  const listing = {file: "SOURCES.md", title: "Sources", category: "Reference"};
  await resourcePage.route("**/api/resources", async route => {
    await catalog.promise;
    return route.fulfill({json: [listing]});
  });
  await resourcePage.route("**/api/resources?file=SOURCES.md", route =>
    route.fulfill({json: {...listing, body: "# Source library\n\nRead the contract terms in the original source."}}));
  const requestedCatalog = resourcePage.waitForRequest(request => new URL(request.url()).pathname === "/api/resources" && !new URL(request.url()).search);
  await resourcePage.goto(new URL("/#resource/SOURCES.md", base).href);
  const article = resourcePage.locator(".resource-article");
  await expect(article).toContainText("Read the contract terms in the original source.");
  await release(resourcePage, catalog, await requestedCatalog);
  await expect(resourcePage).toHaveURL(/#resource\/SOURCES\.md$/);
  await expect(article).toContainText("Read the contract terms in the original source.");
  await expect(resourcePage.getByRole("link", {name: "Open document"})).toHaveCount(0);
  console.log("Beginner direct navigation passed: reordered checkpoint GET and POST, editable answers, and resource body retained after a late catalog.");
} finally {
  await browser.close();
}
