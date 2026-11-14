/**
 * Nonmutating browser regressions for time transitions, failed-read recovery,
 * text contrast, and keyboard focus. API responses are mocked in each context.
 * Start the local dev server, then run: node tests/ui-regressions.integration.mjs
 */
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { expect } from "@playwright/test";

const base = new URL(process.env.LOCAL_API_BASE ?? "http://127.0.0.1:5173");
assert.equal(base.protocol, "http:");
assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(base.hostname), "Use a loopback development server.");
const browser = await chromium.launch({headless: true, executablePath: process.env.CHROME_EXECUTABLE ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"});
const state = {
  user: {name: "Audit", email: "audit@example.test"},
  profile: {dailyMinutes: 15, timezone: "America/Phoenix"},
  notes: [], attempts: [],
  progress: [
    {lessonId: 1, completedAt: "2026-11-14T10:00:00Z", nextReviewAt: "2026-11-15T12:00:00Z", reviewCount: 0, reviewRevision: 0},
    {lessonId: 2, completedAt: "2026-11-14T10:01:00Z", nextReviewAt: "2026-11-17T12:00:00Z", reviewCount: 0, reviewRevision: 0},
  ],
};
const results = {};

async function navigate(page, label) {
  await page.locator(".sidebar .nav-item").filter({hasText: label}).click();
}
async function measuredText(page, selector) {
  const value = await page.locator(selector).evaluate(element => {
    const css = getComputedStyle(element);
    let node = element, background = "";
    while (node) {
      const color = getComputedStyle(node).backgroundColor;
      if (color !== "rgba(0, 0, 0, 0)" && color !== "transparent") {background = color; break;}
      node = node.parentElement;
    }
    return {text: element.textContent.trim(), color: css.color, background, fontSize: Number.parseFloat(css.fontSize)};
  });
  const luminance = color => color.match(/[\d.]+/g).slice(0, 3).map(Number).map(n => n / 255)
    .map(n => n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4)
    .reduce((sum, n, index) => sum + n * [.2126, .7152, .0722][index], 0);
  const [low, high] = [luminance(value.color), luminance(value.background)].sort((a, b) => a - b);
  return {...value, contrastRatio: (high + .05) / (low + .05)};
}

try {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.clock.install({time: new Date("2026-11-14T12:00:00Z")});
  let learningRequests = 0;
  await page.route("**/api/learning", async route => {learningRequests++; await route.fulfill({json: state});});
  await page.goto(base.href);
  await page.locator(".loading-line").waitFor({state: "hidden"});
  await navigate(page, "Review & remember");
  await expect(page.getByRole("heading", {name: "You're all caught up.", exact: true})).toBeVisible();

  // An open review screen must change without a network refresh or navigation.
  await page.clock.fastForward(2 * 86_400_000);
  await expect(page.locator(".review-row")).toHaveCount(1);
  assert.equal(learningRequests, 1);
  results.reviewTimer = "A due review appeared in the open screen without a reload.";

  // A suspended tab can return after the next scheduled review has become due.
  await page.clock.setSystemTime(new Date("2026-11-18T12:00:00Z"));
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(page.locator(".review-row")).toHaveCount(2);
  results.reviewFocus = "Returning focus recomputed newly due reviews.";

  await navigate(page, "The course");
  await page.locator(".lesson-row").first().click();
  results.contrast = {chapterAssumptions: await measuredText(page, ".module-context>summary")};
  await navigate(page, "Practice lab");
  results.contrast.contractAssumptions = await measuredText(page, ".lab-assumption span");
  results.contrast.payoffLimitations = await measuredText(page, ".lab-results>.fine-print");
  for (const measurement of Object.values(results.contrast)) {
    assert.ok(measurement.contrastRatio >= 4.5, `${measurement.text}: contrast ${measurement.contrastRatio}`);
    assert.ok(measurement.fontSize >= 12, `${measurement.text}: ${measurement.fontSize}px`);
  }
  const search = page.locator(".topbar .search-field input");
  await search.focus();
  await search.fill("delta");
  await expect(search).toBeFocused();
  assert.notEqual(await search.evaluate(element => getComputedStyle(element).outlineStyle), "none");
  results.searchFocus = "Searching retains focus with a visible outline.";
  await context.close();

  const resourceContext = await browser.newContext();
  const resourcePage = await resourceContext.newPage();
  await resourcePage.route("**/api/learning", route => route.fulfill({json: {...state, progress: []}}));
  let listRequests = 0;
  await resourcePage.route("**/api/resources", async route => {
    listRequests++;
    await route.fulfill(listRequests === 1 ? {status: 503, json: {error: "Temporary library failure"}} : {json: [{file: "SOURCES.md", title: "Source library"}]});
  });
  let resourceRequests = 0;
  await resourcePage.route("**/api/resources?file=*", async route => {
    resourceRequests++;
    await route.fulfill(resourceRequests === 1 ? {status: 503, json: {error: "Temporary resource failure"}} : {json: {file: "SOURCES.md", title: "Source library", body: "# Source library\n\nRecovered reference content."}});
  });
  await resourcePage.goto(base.href);
  await expect(resourcePage.getByRole("alert")).toContainText("Temporary library failure");
  await resourcePage.getByRole("button", {name: "Retry", exact: true}).click();
  await expect(resourcePage.getByRole("alert")).toHaveCount(0);
  assert.equal(listRequests, 2);
  await navigate(resourcePage, "Resource library");
  await resourcePage.getByRole("button", {name: "Explore sources", exact: true}).click();
  await expect(resourcePage.getByRole("alert")).toContainText("Temporary resource failure");
  await resourcePage.getByRole("button", {name: "Retry", exact: true}).click();
  await expect(resourcePage.locator(".resource-article")).toContainText("Recovered reference content.");
  await expect(resourcePage.getByRole("alert")).toHaveCount(0);
  assert.equal(resourceRequests, 2);
  results.retry = {listRequests, resourceRequests, recovered: true};
  await resourceContext.close();
  console.log(JSON.stringify(results, null, 2));
  console.log("Passed nonmutating UI regressions for review time/focus, resource retries, contrast, and search focus.");
} finally {
  await browser.close();
}
