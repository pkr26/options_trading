// Run against the local portable dev server. Only its sign-in redirect is real.
import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";

const base = new URL(process.env.LOCAL_API_BASE ?? "http://127.0.0.1:5173");
assert.equal(base.protocol, "http:");
assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(base.hostname));
const browser = await chromium.launch({ channel: "chrome", headless: true });

try {
  const context = await browser.newContext();
  const accounts = new Map([["rae@example.test", new Map()], ["sam@example.test", new Map()]]);
  let owner = "rae@example.test";
  const writes = [];
  await context.route("**/api/learning", async route => {
    const cookie = (await route.request().allHeaders()).cookie ?? "";
    if (!cookie.split(/;\s*/).includes("__sites_local_auth=1")) {
      return route.fulfill({status: 401, json: {error: "Sign in to save your learning."}});
    }
    return route.fulfill({json: {
      user: {name: owner.split("@")[0], email: owner}, profile: {dailyMinutes: 15, timezone: "UTC"},
      notes: Array.from(accounts.get(owner).values()), attempts: [], progress: [],
    }});
  });
  await context.route("**/api/notes", route => {
    const {lessonId, content, expectedRevision} = route.request().postDataJSON();
    const notes = accounts.get(owner);
    const previous = notes.get(lessonId);
    const revision = previous?.revision ?? 0;
    writes.push({owner, lessonId, content, expectedRevision});
    if (revision !== expectedRevision) {
      return route.fulfill({status: 409, json: {error: "Compare your changes with the saved note.", note: previous}});
    }
    const note = {lessonId, content, revision: revision + 1, updatedAt: new Date().toISOString()};
    notes.set(lessonId, note);
    return route.fulfill({json: {ok: true, revision: note.revision, updatedAt: note.updatedAt}});
  });

  const lessonUrl = new URL("/#lesson/2", base).href;
  const input = page => page.getByLabel("Notes for lesson 2", {exact: true});
  const editor = page => page.locator(".study-note");
  async function save(page, expectedStatus) {
    const received = page.waitForResponse(r => r.url().endsWith("/api/notes") && r.request().method() === "PUT");
    await editor(page).getByRole("button", {name: "Save note", exact: true}).click();
    assert.equal((await received).status(), expectedStatus);
    if (expectedStatus === 200) await expect(editor(page).getByRole("status")).toContainText("saved");
  }

  const first = await context.newPage();
  await first.goto(lessonUrl);
  const guestDraft = "Before sign-in I calculated the premium for two contracts.";
  await input(first).fill(guestDraft);
  await first.reload();
  await expect(input(first)).toHaveValue(guestDraft);
  await first.getByRole("button", {name: /^Lesson 3:/}).click();
  await expect(first).toHaveURL(/#lesson\/3$/);
  await expect(first.getByLabel("Notes for lesson 3", {exact: true})).toHaveValue("");
  await first.goBack();
  await expect(first).toHaveURL(lessonUrl);
  await expect(input(first)).toHaveValue(guestDraft);

  const signIn = editor(first).getByRole("link", {name: "Sign in", exact: true});
  const returnHref = await signIn.getAttribute("href");
  assert.equal(new URL(returnHref, base).searchParams.get("return_to"), "/#lesson/2");
  const redirect = first.waitForResponse(r => new URL(r.url()).pathname === "/signin-with-chatgpt");
  await signIn.click();
  assert.equal((await redirect).status(), 302);
  await expect(first).toHaveURL(lessonUrl);
  await editor(first).getByRole("button", {name: "Restore my draft from before sign-in"}).click();
  await expect(input(first)).toHaveValue(guestDraft);
  assert.equal(writes.length, 0, "Guest recovery requires an explicit account save");
  await save(first, 200);

  const second = await context.newPage();
  await second.goto(lessonUrl);
  await expect(input(second)).toHaveValue(guestDraft);
  await input(second).fill("A second tab has an independent draft.");
  await input(first).fill("First tab calculated the $100 share obligation.");
  await save(first, 200);
  await save(second, 409);
  await expect(input(second)).toHaveValue("A second tab has an independent draft.");
  await second.reload();
  await expect(editor(second).getByRole("alert")).toContainText("First tab calculated the $100 share obligation.");
  await editor(second).getByRole("button", {name: "Use latest saved text"}).click();
  await expect(input(second)).toHaveValue("First tab calculated the $100 share obligation.");
  assert.equal(writes.length, 3);

  await input(second).fill("Second tab revised the funding ledger.");
  await input(first).fill("First tab checked the quantity again.");
  await save(first, 200);
  await save(second, 409);
  await expect(editor(second).getByRole("alert")).toContainText("First tab checked the quantity again.");
  await editor(second).getByRole("button", {name: "Keep my edits for the next save"}).click();
  await expect(input(second)).toHaveValue("Second tab revised the funding ledger.");
  assert.equal(writes.length, 5);
  await save(second, 200);
  assert.deepEqual(writes.map(w => w.expectedRevision), [0, 1, 1, 2, 2, 3]);
  await first.reload();
  await expect(input(first)).toHaveValue("Second tab revised the funding ledger.");

  await input(first).fill("Temporary edit that is fully undone.");
  await input(first).fill("Second tab revised the funding ledger.");
  await expect(editor(first).getByRole("button", {name:"Save note"})).toBeDisabled();
  await input(second).fill("Updated independently after the undo.");
  await save(second, 200);
  await first.reload();
  await expect(input(first)).toHaveValue("Updated independently after the undo.");
  await expect(editor(first).getByRole("alert")).toHaveCount(0);

  const privateDraft = "Rae's unfinished assignment calculation.";
  await input(first).fill(privateDraft);
  owner = "sam@example.test";
  await first.reload();
  await expect(input(first)).toHaveValue("");
  await expect(editor(first).getByRole("button", {name: /Restore my draft/})).toHaveCount(0);
  owner = "rae@example.test";
  await first.reload();
  await expect(input(first)).toHaveValue(privateDraft);
  assert.equal(accounts.get("sam@example.test").size, 0);
  console.log("Beginner note continuity passed: guest sign-in and lesson history, both conflict choices, explicit resave, and owner-scoped draft recovery.");
} finally {
  await browser.close();
}
