import test from "node:test";
import assert from "node:assert/strict";
import { formatStudyTime } from "../lib/study-time.ts";

const display = (instant, zone) => formatStudyTime(instant, zone).replace(/[\u00a0\u202f]/g, " ");

test("the saved zone determines the calendar date and fractional-hour offset; the default is Phoenix", () => {
  const instant = "2026-03-08T00:30:00.000Z";
  assert.equal(display(instant, "America/New_York"), "Mar 7, 2026, 7:30 PM GMT-5 (America/New_York)");
  assert.equal(display(instant, "Asia/Kolkata"), "Mar 8, 2026, 6:00 AM GMT+5:30 (Asia/Kolkata)");
  assert.equal(display(instant), "Mar 7, 2026, 5:30 PM GMT-7 (America/Phoenix)");
});

test("daylight-saving jumps and repeated wall times retain the offset for the actual instant", () => {
  const zone = "America/New_York";
  assert.equal(display("2026-03-08T06:59:00.000Z", zone), "Mar 8, 2026, 1:59 AM GMT-5 (America/New_York)");
  assert.equal(display("2026-03-08T07:01:00.000Z", zone), "Mar 8, 2026, 3:01 AM GMT-4 (America/New_York)");
  assert.equal(display("2026-11-01T05:30:00.000Z", zone), "Nov 1, 2026, 1:30 AM GMT-4 (America/New_York)");
  assert.equal(display("2026-11-01T06:30:00.000Z", zone), "Nov 1, 2026, 1:30 AM GMT-5 (America/New_York)");
});

test("an invalid saved zone falls back transparently, and an invalid instant cannot turn into a deadline", () => {
  const instant = "2026-03-08T00:30:00.000Z";
  assert.equal(display(instant, "invalid/fixture"), display(instant, "America/Phoenix"));
  assert.equal(display("invalid instant", "America/New_York"), "Date unavailable");
});
