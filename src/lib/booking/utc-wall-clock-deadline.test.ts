import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

// Egne prosesser kontrollerer begge servermiljøer uten å endre global TZ i testløperen.
for (const tz of ["UTC", "Europe/Oslo", "America/New_York"]) {
  test(`lagret bookingfrist beholder Oslo-veggklokken i ${tz}`, () => {
    const result = spawnSync(process.execPath, ["--import", "tsx", "-e", `
      const assert = require("node:assert/strict");
      const { cancellationDeadlineFromUtcWallClock } = require("./src/lib/booking/policy.ts");
      const { naivOsloTilTidspunkt } = require("./src/lib/google-calendar-tid.ts");
      for (const [start, expected] of [
        ["2026-10-10T10:30:00Z", "2026-10-09T10:30:00.000Z"],
        ["2026-03-29T10:30:00Z", "2026-03-28T09:30:00.000Z"],
        ["2026-10-25T10:30:00Z", "2026-10-24T11:30:00.000Z"],
        ["2027-01-01T00:30:00Z", "2026-12-31T00:30:00.000Z"],
      ]) assert.equal(cancellationDeadlineFromUtcWallClock(new Date(start)).toISOString(), expected);
      assert.throws(() => cancellationDeadlineFromUtcWallClock(new Date("2026-03-29T02:30:00Z")), /finnes ikke/);
      assert.equal(naivOsloTilTidspunkt(new Date("2026-10-25T02:30:00Z"), "utc").toISOString(), "2026-10-25T00:30:00.000Z");
      assert.throws(() => cancellationDeadlineFromUtcWallClock(new Date(NaN)), /Ugyldig/);
    `], { cwd: process.cwd(), env: { ...process.env, TZ: tz }, encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr || result.stdout);
  });
}
