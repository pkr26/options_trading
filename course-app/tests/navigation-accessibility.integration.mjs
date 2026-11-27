// Exercise real keyboard focus on either a local development server or a built Worker.
import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";

const base = new URL(process.env.LOCAL_API_BASE ?? "http://127.0.0.1:5173");
assert.equal(base.protocol, "http:");
assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(base.hostname));
const browser = await chromium.launch({channel: "chrome", headless: true});
try {
  const page = await browser.newPage({viewport: {width: 390, height: 844}});
  await page.route("**/api/learning", route => route.fulfill({json: {
    user: {name: "Learner", email: "learner@example.test"}, profile: {dailyMinutes: 15, timezone: "UTC"},
    notes: [], progress: [], attempts: [],
  }}));
  await page.route("**/api/resources", route => route.fulfill({json: []}));
  await page.goto(base.href);
  const trigger = page.getByRole("button", {name: "Open navigation", exact: true});
  const dialog = page.getByRole("dialog", {name: "Main navigation", exact: true});
  const courseButton = page.getByRole("button", {name: "The course", exact: true});
  const drawer = page.locator(".sidebar");
  const main = page.locator("#main-content");
  await expect(drawer.locator("nav")).toHaveAttribute("aria-busy", "false");
  await expect(trigger).toBeVisible();
  await expect(courseButton).toHaveCount(0);
  await page.getByRole("link", {name: "Skip to content", exact: true}).focus();
  await page.keyboard.press("Tab");
  await expect(trigger).toBeFocused();
  assert.equal(await drawer.evaluate(element => {
    element.querySelector("button").focus();
    return element.contains(document.activeElement);
  }), false, "A closed mobile drawer must also reject programmatic focus");

  async function openDrawer() {
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute("aria-modal", "true");
    await expect.poll(() => dialog.evaluate(element => element.contains(document.activeElement))).toBe(true);
    await expect(page.locator(".mobile-menu")).toHaveAttribute("aria-expanded", "true");
    assert.equal(await main.evaluate(element => {
      element.focus();
      return document.activeElement === element;
    }), false, "The open modal must keep focus out of the workspace");
  }
  await openDrawer();
  const controls = dialog.locator("button:enabled:visible:not([tabindex='-1']), a[href]:visible:not([tabindex='-1'])");
  assert.ok(await controls.count() > 2);
  await controls.first().focus();
  await page.keyboard.press("Shift+Tab");
  await expect(controls.last()).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(controls.first()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toHaveAttribute("aria-expanded", "false");

  await openDrawer();
  // Click the backdrop on the exposed side of the viewport.
  await page.locator(".sidebar-scrim").click({position: {x: 380, y: 120}});
  await expect(trigger).toBeFocused();
  await expect(dialog).toHaveCount(0);

  await openDrawer();
  await dialog.getByRole("button", {name: "The course", exact: true}).press("Enter");
  await expect(page).toHaveURL(/#course$/);
  await expect(main).toBeFocused();
  await expect(dialog).toHaveCount(0);

  await openDrawer();
  await page.setViewportSize({width: 1280, height: 850});
  await expect(dialog).toHaveCount(0);
  await expect(courseButton).toBeVisible();
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.locator(".sidebar-scrim")).toHaveCount(0);
  await page.setViewportSize({width: 390, height: 844});
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(courseButton).toHaveCount(0);
  await page.setViewportSize({width: 1280, height: 850});

  for(const viewport of [{width:390,height:667},{width:667,height:375}]){
    await page.setViewportSize(viewport);
    await openDrawer();
    const preferences=dialog.getByRole("button",{name:"Learning preferences"});
    await preferences.scrollIntoViewIfNeeded();
    assert.ok(await dialog.evaluate(node=>node.scrollTop)>0);
    const bounds=await preferences.boundingBox();
    assert.ok(bounds && bounds.y>=0 && bounds.y+bounds.height<=viewport.height+1);
    await preferences.click();
    await expect(page).toHaveURL(/#settings$/);
    await expect(page.getByRole("main")).toBeFocused();
  }

  const desktopPreferences = drawer.getByRole("button", {name: "Learning preferences", exact: true});
  for (const viewport of [{width: 1280, height: 720}, {width: 1024, height: 500}]) {
    await page.setViewportSize(viewport);
    await courseButton.click();
    await expect(page).toHaveURL(/#course$/);
    await expect(main).toBeFocused();
    await page.evaluate(() => window.scrollTo({top: 0, behavior: "instant"}));
    const end = await drawer.evaluate(element => {
      element.scrollTop = element.scrollHeight;
      return element.scrollTop;
    });
    assert.ok(end > 0, `The desktop sidebar must scroll at ${viewport.width}×${viewport.height}`);
    assert.equal(await page.evaluate(() => window.scrollY), 0);

    // Wheel gestures over the classroom should move its long course list independently.
    await page.mouse.move(viewport.width - 100, viewport.height / 2);
    await page.mouse.wheel(0, 350);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
    assert.equal(await drawer.evaluate(element => element.scrollTop), end);
    const classroomScroll = await page.evaluate(() => window.scrollY);
    await drawer.evaluate(element => { element.scrollTop = 0; });
    assert.equal(await page.evaluate(() => window.scrollY), classroomScroll);

    // Native Tab must reveal the complete control, including the point used for the click.
    await drawer.getByRole("button", {name: "Resource library", exact: true}).focus();
    await page.keyboard.press("Tab");
    await expect(desktopPreferences).toBeFocused();
    const point = await desktopPreferences.evaluate(button => {
      const bounds = button.getBoundingClientRect();
      const sidebar = button.closest("aside").getBoundingClientRect();
      const x = bounds.left + bounds.width / 2;
      const y = bounds.top + bounds.height / 2;
      if (bounds.top < Math.max(0, sidebar.top) || bounds.bottom > Math.min(innerHeight, sidebar.bottom)
        || bounds.left < Math.max(0, sidebar.left) || bounds.right > Math.min(innerWidth, sidebar.right)
        || !button.contains(document.elementFromPoint(x, y))) return null;
      return {x, y};
    });
    assert.ok(point, "Learning preferences must fit in the sidebar and accept pointer input after Tab");
    assert.equal(await page.evaluate(() => window.scrollY), classroomScroll);
    await page.mouse.click(point.x, point.y);
    await expect(page).toHaveURL(/#settings$/);
  }
  await page.setViewportSize({width:1280,height:850});
  const search = page.locator(".topbar .search-field input");
  const practice = page.getByRole("button", {name: "Practice lab", exact: true});
  await expect(practice).toBeEnabled();
  // Hold the frames scheduled by this navigation only. Keyboard events and rendering
  // still run normally, so the user's search interaction occurs before deferred focus.
  const held = await practice.evaluate(button => {
    const original = window.requestAnimationFrame;
    const originalCancel = window.cancelAnimationFrame;
    const pending = new Map();
    let nextId = -1;
    window.requestAnimationFrame = callback => { const id = nextId--; pending.set(id, callback); return id; };
    window.cancelAnimationFrame = id => { if (!pending.delete(id)) originalCancel.call(window, id); };
    try { button.focus(); button.click(); }
    finally { window.requestAnimationFrame = original; }
    window.releaseNavigationFocusFrame = () => {
      window.cancelAnimationFrame = originalCancel;
      for (const callback of pending.values()) callback(performance.now());
      delete window.releaseNavigationFocusFrame;
    };
    return pending.size;
  });
  assert.ok(held > 0, "The test must exercise an outstanding navigation frame");
  await search.focus();
  await page.keyboard.type("del");
  await expect(search).toHaveValue("del");
  await page.evaluate(() => window.releaseNavigationFocusFrame());
  await expect(search).toBeFocused();
  await page.keyboard.type("ta");
  await expect(search).toHaveValue("delta");
  assert.notEqual(await search.evaluate(input => getComputedStyle(input).outlineStyle), "none");
  console.log("Navigation accessibility passed: mobile focus and dismissal, responsive navigation, independent desktop scrolling, keyboard and pointer access to preferences, and uninterrupted search typing.");
} finally {
  await browser.close();
}
