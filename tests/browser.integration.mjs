/**
 * Local-only browser smoke test. Run after build/local migration/dev startup:
 *   node --experimental-strip-types tests/browser.integration.mjs
 * Requires Playwright and an installed Chromium-compatible browser. Existing
 * portable test-user rows are restored; run separately from manual UI writes.
 */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { expect } from "@playwright/test";
import { buildQuiz } from "../lib/quiz-bank.ts";

const appRoot = fileURLToPath(new URL("../", import.meta.url));
const base = new URL(process.env.LOCAL_API_BASE ?? "http://127.0.0.1:5173");
assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(base.hostname), "Only a loopback development service can be tested.");
assert.equal(base.protocol, "http:");
const owner = "local_seedy";
const tableNames = ["profiles", "progress", "notes", "attempts"];
const output = new URL("../outputs/browser-smoke/", import.meta.url);
mkdirSync(output, {recursive: true});
let checks = 0;
function sqlValue(value) {
  if (value === null) return "NULL";
  if (typeof value === "number") { assert.ok(Number.isFinite(value)); return String(value); }
  return `CAST(X'${Buffer.from(String(value), "utf8").toString("hex")}' AS TEXT)`;
}
function database(sql) {
  const data = JSON.parse(execFileSync(process.execPath, [
    "--import", "./scripts/sites-env.mjs", "./node_modules/wrangler/bin/wrangler.js",
    "d1", "execute", "DB", "--local", "--config", "dist/server/wrangler.json",
    "--persist-to", ".wrangler/state", "--command", sql, "--json",
  ], {cwd: appRoot, encoding: "utf8", maxBuffer: 4 * 1024 * 1024}));
  assert.ok(data.every(result => result.success !== false));
  return data;
}
const browser = await chromium.launch({headless: true, executablePath: process.env.CHROME_EXECUTABLE ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"});
const context = await browser.newContext({viewport: {width: 1440, height: 1000}, deviceScaleFactor: 1});
const page = await context.newPage();
const errors = [];
page.on("pageerror", error => errors.push(error.message));
let snapshot;
let fixtureStarted = false;
async function api(path, body) {
  const response = body === undefined
    ? await context.request.get(new URL(path, base).href)
    : await context.request.post(new URL(path, base).href, {data: body});
  assert.ok(response.ok(), `${path}: ${response.status()} ${await response.text()}`);
  return response.json();
}
async function screenshot(name) {
  await page.locator(".loading-line").waitFor({state: "hidden"});
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({path: fileURLToPath(new URL(`${name}.png`, output)), fullPage: true, animations: "disabled"});
}
async function navigation(name) {
  if (await page.getByRole("button", {name: "Open navigation", exact: true}).isVisible()) {
    await page.getByRole("button", {name: "Open navigation", exact: true}).click();
  }
  await page.locator(".sidebar .nav-item").filter({hasText: name}).click();
}
async function noHorizontalOverflow(label) {
  const widths = await page.evaluate(() => ({viewport: window.innerWidth, document: document.documentElement.scrollWidth}));
  assert.ok(widths.document <= widths.viewport + 1, `${label}: document width ${widths.document}, viewport ${widths.viewport}`);
  checks++;
}
try {
  await page.goto(new URL("/signin-with-chatgpt?return_to=/", base).href);
  const initial = await api("/api/learning");
  assert.equal(initial.user.email, "seedy@sites.test", "Only the portable local test user may be modified.");
  for (const path of ["/downloads/options-course.zip", "/labs/options_lab.py", "/scripts/generate_foundation_cases.py"]) {
    const download = await context.request.get(new URL(path, base).href);
    assert.equal(download.status(), 200, path);
    assert.ok((await download.body()).byteLength > 1000, path);
  }
  checks++;
  snapshot = Object.fromEntries(tableNames.map(table => [table,
    database(`SELECT * FROM ${table} WHERE user_id=${sqlValue(owner)}`)[0].results,
  ]));
  fixtureStarted = true;
  database(tableNames.map(table => `DELETE FROM ${table} WHERE user_id=${sqlValue(owner)}`).join(";"));
  await page.reload();
  await expect(page.getByRole("heading", {name: "Welcome, Seedy."})).toBeVisible();
  await expect(page.getByRole("button", {name: "Start my first lesson", exact: true})).toBeEnabled();
  await screenshot("dashboard-desktop");
  checks++;

  await page.getByRole("button", {name: "Start my first lesson", exact: true}).click();
  const noteInput = page.getByLabel("Notes for lesson 1", {exact: true});
  await expect(noteInput).toBeVisible();
  const note = "A share is a small ownership piece. I tried the example.";
  await noteInput.click();
  await noteInput.pressSequentially(note, {delay: 12});
  await expect(noteInput).toBeFocused();
  await expect(noteInput).toHaveValue(note);
  const noteSaved = page.waitForResponse(response => response.url().endsWith("/api/notes") && response.request().method() === "PUT");
  await page.getByRole("button", {name: "Save note", exact: true}).click();
  assert.equal((await noteSaved).status(), 200);
  await expect(page.getByRole("status")).toContainText("Your note is saved");
  checks++;
  await page.reload();
  await navigation("My notebook");
  await expect(page.locator(".saved-note-text")).toHaveText(note);
  await page.getByRole("button", {name: "Open lesson", exact: true}).click();
  await expect(noteInput).toHaveValue(note);
  await page.getByRole("checkbox").check();
  const completed = page.waitForResponse(response => response.url().endsWith("/api/progress") && response.request().method() === "POST");
  await page.getByRole("button", {name: "Mark lesson complete", exact: true}).click();
  assert.equal((await completed).status(), 200);
  await expect(page.getByText("One more idea understood.", {exact: true})).toBeVisible();
  assert.equal((await api("/api/learning")).progress.length, 1);
  await screenshot("reader-desktop");
  checks++;

  for (let lessonId = 2; lessonId <= 8; lessonId++) await api("/api/progress", {lessonId, action: "complete"});
  await page.reload();
  await page.getByRole("button", {name: "Take your checkpoint", exact: true}).click();
  for (const question of buildQuiz(1, 0)) {
    await page.locator(`input[name="${question.id}"][value="${(question.correctIndex + 1) % 4}"]`).check();
  }
  await page.getByRole("button", {name: "Check my understanding", exact: true}).click();
  await expect(page.getByRole("heading", {name: "A useful place to practice.", exact: true})).toBeVisible();
  await expect(page.locator(".question-feedback")).toHaveCount(5);
  await page.getByRole("button", {name: "Try an alternate version", exact: true}).click();
  for (const question of buildQuiz(1, 1)) await page.locator(`input[name="${question.id}"][value="${question.correctIndex}"]`).check();
  await page.getByRole("button", {name: "Check my understanding", exact: true}).click();
  await expect(page.getByRole("heading", {name: "A strong foundation. Keep going.", exact: true})).toBeVisible();
  assert.deepEqual((await api("/api/learning")).attempts.map(a => a.score).sort((a, b) => a - b), [0, 5]);
  checks++;

  database(`UPDATE progress SET next_review_at='2026-01-01T00:00:00.000Z' WHERE user_id=${sqlValue(owner)} AND lesson_id=1`);
  await page.reload();
  await navigation("Review & remember");
  await page.locator(".review-row").first().click();
  await page.getByRole("button", {name: "I've tried — reveal the lesson", exact: true}).click();
  await page.getByRole("button", {name: "I remembered it", exact: true}).click();
  await expect(page.getByRole("status")).toContainText("Review saved");
  assert.equal((await api("/api/learning")).progress.find(p => p.lessonId === 1).reviewCount, 1);
  checks++;
  await navigation("My notebook");
  await expect(page.locator(".saved-note-text")).toHaveText(note);
  await navigation("Resource library");
  await page.getByRole("button", {name: "Explore sources", exact: true}).click();
  await expect(page.locator(".resource-article")).toBeVisible();
  assert.ok((await page.locator(".resource-article").innerText()).length > 500);
  checks++;

  await navigation("Practice lab");
  await page.getByLabel(/^Strike price/).fill("50");
  await page.getByLabel(/^Premium paid/).fill("2");
  await page.getByLabel(/^Stock at expiration/).fill("55");
  await page.getByLabel(/^Total fees/).fill("0");
  await expect(page.locator(".lab-profit strong")).toHaveText("+$300.00");
  await page.getByRole("button", {name: "Long put", exact: true}).click();
  await page.getByLabel(/^Stock at expiration/).fill("45");
  await expect(page.locator(".lab-profit strong")).toHaveText("+$300.00");
  await page.getByLabel(/^Total fees/).fill("2");
  await expect(page.locator(".lab-profit strong")).toHaveText("+$298.00");
  await page.getByLabel(/^Premium paid/).fill("-1");
  await expect(page.getByRole("alert")).toContainText("Check your numbers");
  await page.getByLabel(/^Premium paid/).fill("2");
  await screenshot("practice-desktop");
  checks++;

  await navigation("Learning preferences");
  await page.locator(".pace-options button").filter({hasText: "10"}).click();
  await page.getByLabel("Your time zone", {exact: true}).selectOption("America/Phoenix");
  await page.getByRole("button", {name: "Save preferences", exact: true}).click();
  await expect(page.getByRole("status")).toContainText("Your learning preferences are saved");
  assert.equal((await api("/api/learning")).profile.dailyMinutes, 10);
  checks++;

  await page.setViewportSize({width: 390, height: 844});
  await page.reload();
  await expect(page.getByRole("heading", {name: "Welcome, Seedy."})).toBeVisible();
  await noHorizontalOverflow("Mobile dashboard");
  await screenshot("dashboard-mobile");
  await page.getByRole("button", {name: "Open navigation", exact: true}).click();
  await expect(page.getByRole("button", {name: "Open navigation", exact: true})).toHaveAttribute("aria-expanded", "true");
  await page.getByRole("button", {name: "The course", exact: true}).click();
  await expect(page.getByRole("button", {name: "Open navigation", exact: true})).toHaveAttribute("aria-expanded", "false");
  await noHorizontalOverflow("Mobile course");
  await screenshot("course-mobile");
  await page.locator(".lesson-row").first().click();
  await expect(page.getByRole("heading", {level: 1})).toBeVisible();
  await noHorizontalOverflow("Mobile reader");
  await screenshot("reader-mobile");
  await navigation("Practice lab");
  await noHorizontalOverflow("Mobile practice");
  await screenshot("practice-mobile");
  await navigation("Learning preferences");
  await noHorizontalOverflow("Mobile settings");
  assert.deepEqual(errors, [], "Browser page errors");
  console.log(`Passed ${checks} browser smoke stages covering typing focus, save/reload, completion, quizzes, reviews, references, payoff arithmetic, preferences, and mobile layout.`);
  console.log(`Screenshots: ${fileURLToPath(output)}`);
} catch (error) {
  await screenshot("failure").catch(() => {});
  throw error;
} finally {
  await browser.close();
  if (fixtureStarted && snapshot) {
    const restore = tableNames.map(table => `DELETE FROM ${table} WHERE user_id=${sqlValue(owner)}`);
    for (const table of tableNames) {
      for (const row of snapshot[table]) {
        const columns = Object.keys(row);
        assert.ok(columns.every(column => /^[a-z_]+$/.test(column)));
        restore.push(`INSERT INTO ${table} (${columns.join(",")}) VALUES (${columns.map(column => sqlValue(row[column])).join(",")})`);
      }
    }
    database(restore.join(";"));
    console.log("Restored prior portable test-user records.");
  }
}
