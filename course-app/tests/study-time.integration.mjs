/** The profile is a writable browser fixture; no local or hosted learner rows are changed. */
import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";
import { practicalEvent, projectPracticalState } from "../lib/practical-state.ts";

const base = new URL(process.env.LOCAL_API_BASE ?? "http://127.0.0.1:5173");
assert.equal(base.protocol, "http:");
assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(base.hostname));
const ownerId = "timezone-fixture";
const profile = { dailyMinutes: 15, timezone: "America/New_York" };
const savedAt = "2026-03-08T00:30:00.000Z";
const beforeJump = "2026-03-08T06:59:00.000Z";
const afterJump = "2026-03-08T07:01:00.000Z";
const baseline = "2026-03-01T07:01:00.000Z";
const frozenClock = Date.parse("2026-03-08T07:00:00.000Z");
const memo = { id: "saved-memo", moduleId: 10, revision: 1, kind: "submission", createdAt: savedAt, contentVersion: "fixture",
  answers: { recommendation: "Keep enough cash on hand.", analysis: "Compare the alternatives.", risks: "Reconcile settlement.", revision: "", reflection: "" } };
const artifact = { id: "artifact-revision", entityId: "artifact", revision: 1, createdAt: beforeJump,
  payload: { kind: "protocol", title: "Saved protocol", body: "The portfolio protocol written during the fixture.", sourceUrl: "" } };
const pilot = { revision: 2, enrollment: { id: "pilot", moduleIds: [4,10,14], version: "fixture", seed: 1, enrolledAt: baseline, baselineAt: baseline,
  results: [{ stage: "baseline", completedAt: baseline, score: 6, total: 9, minutes: 15, clarity: 4, feedback: [] }] },
  schedule: [{ stage: "baseline", dueAt: baseline, status: "completed" }, { stage: "day7", dueAt: afterJump, status: "scheduled" }] };
const teaching = { events: [], plan: { generatedAt: savedAt, summary: "", recommendations: [{moduleId:10,skill:"risk",action:"retain",priority:70,reason:"A seven-day check is due.",evidenceAt:savedAt}] }, pilot };
const empty = projectPracticalState([], true, frozenClock).cases[0];
const initial = practicalEvent({ id: "A", expectedRevision: 0, stage: "initial", action: "submit", assistance: "none", reasoning: "My accounting.",
  answers: Object.fromEntries(empty.forms.initial.fields.map(field => [field.key, "0"])) }, empty);
const practical = { ...projectPracticalState([{ entityId: "A", revision: 1, createdAt: baseline, payload: initial }], true, frozenClock), ownerId };
const snapshot = JSON.stringify({ memo, artifact, pilot, practical });
const writes = [];

const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, timezoneId: "Pacific/Honolulu" });
  await context.route("**/api/**", async route => {
    const path = new URL(route.request().url()).pathname;
    if (route.request().method() !== "GET") {
      writes.push({ path, method: route.request().method(), data: route.request().postDataJSON() });
      if (path !== "/api/profile") return route.fulfill({ status: 405, json: { error: "Unexpected test mutation." } });
      Object.assign(profile, writes.at(-1).data);
      return route.fulfill({ json: { ok: true } });
    }
    const data = {
      "/api/learning": { user: { id: ownerId, name: "Fixture", email: "fixture@example.test" }, profile, progress: [], attempts: [],
        notes: [{ lessonId: 1, content: "A saved study note.", updatedAt: savedAt, revision: 1 }] },
      "/api/resources": [], "/api/graduate": { submissions: [memo], practice: [] }, "/api/teaching": teaching,
      "/api/teaching/artifact": { artifacts: [artifact] }, "/api/practical": practical,
    };
    if (!(path in data)) return route.fulfill({ status: 404, json: { error: "Unknown fixture." } });
    return route.fulfill({ json: data[path] });
  });
  const page = await context.newPage();
  await page.clock.setFixedTime(new Date(frozenClock));
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  const tab = name => page.locator(".graduate-tabs").getByRole("button", { name, exact: true });
  const sidebar = name => page.locator(".sidebar").getByRole("button", { name, exact: true });
  const memoDate = page.locator(".graduate-history summary").filter({ hasText: "Module 10" });
  const artifactDate = page.locator(".artifact-history summary");
  const pilotDate = page.locator(".teaching-stage-grid article").filter({ has: page.getByRole("heading", { name: "Day 7", exact: true }) });
  await page.goto(new URL("/#advanced/module/10/evidence", base).href);
  await expect(memoDate).toContainText("Mar 7, 2026, 7:30 PM GMT-5 (America/New_York)");
  await page.locator(".artifact-choice").filter({ hasText: "Saved protocol" }).click();
  await expect(artifactDate).toContainText("Mar 8, 2026, 1:59 AM GMT-5 (America/New_York)");
  await tab("Teaching studio").click();
  await expect(page.getByText(/A seven-day check is due/)).toContainText("Mar 7, 2026, 7:30 PM GMT-5 (America/New_York)");
  await page.getByRole("button", { name: "Learning pilot", exact: true }).click();
  await expect(pilotDate).toContainText("Mar 8, 2026, 3:01 AM GMT-4 (America/New_York)");

  await sidebar("Learning preferences").click();
  await expect(page.getByLabel("Your time zone")).toHaveValue("America/New_York");
  await page.getByLabel("Your time zone").selectOption("Asia/Kolkata");
  await page.getByRole("button", { name: "Save preferences", exact: true }).click();
  await expect(page.getByText("Your learning preferences are saved.")).toBeVisible();
  await sidebar("Advanced academy").click();
  // The previously selected pilot tab and artifact only remain selected if their panes stayed mounted.
  await expect(pilotDate).toBeVisible();
  await expect(pilotDate).toContainText("Mar 8, 2026, 12:31 PM GMT+5:30 (Asia/Kolkata)");
  await tab("My evidence").click();
  await expect(memoDate).toContainText("Mar 8, 2026, 6:00 AM GMT+5:30 (Asia/Kolkata)");
  await expect(artifactDate).toContainText("Mar 8, 2026, 12:29 PM GMT+5:30 (Asia/Kolkata)");
  await expect(artifactDate).toBeVisible();

  await sidebar("My notebook").click();
  await expect(page.locator(".note-date")).toContainText("Mar 8, 2026, 6:00 AM GMT+5:30 (Asia/Kolkata)");
  await page.evaluate(() => { window.location.hash = "#lesson/63"; });
  await page.getByRole("button", { name: "Case A", exact: true }).click();
  await page.getByRole("button", { name: "Seven-day transfer", exact: true }).click();
  await expect(page.locator(".practical-ledger")).toContainText("Mar 8, 2026, 12:31 PM GMT+5:30 (Asia/Kolkata)");
  assert.deepEqual(writes, [{ path: "/api/profile", method: "PUT", data: { dailyMinutes: 15, timezone: "Asia/Kolkata" } }]);
  assert.equal(JSON.stringify({ memo, artifact, pilot, practical }), snapshot);
  assert.deepEqual(errors, []);
  console.log("Saved zone and live preference change passed for graduate history, capstone, pilot, notebook and practical deadlines; UTC fixtures stayed intact.");
} finally { await browser.close(); }
