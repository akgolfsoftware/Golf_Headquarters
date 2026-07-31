import { test } from "node:test";
import assert from "node:assert/strict";
import { parseGolfBox, parseGolfBoxDate } from "./golfbox";
import { deriveStatus, classifyTour } from "./golfbox-customers";

test("parseGolfBoxDate: GolfBox-format", () => {
  const d = parseGolfBoxDate("20260806T000000");
  assert.ok(d);
  assert.equal(d!.toISOString().slice(0, 10), "2026-08-06");
  assert.equal(parseGolfBoxDate(null), null);
  assert.equal(parseGolfBoxDate("bad"), null);
});

test("parseGolfBox: !0/!1 → boolean", () => {
  const raw = '{"EnableOnlineEntry":!0,"EntryWindowOpen":!1}';
  const parsed = parseGolfBox<{
    EnableOnlineEntry: boolean;
    EntryWindowOpen: boolean;
  }>(raw);
  assert.equal(parsed.EnableOnlineEntry, true);
  assert.equal(parsed.EntryWindowOpen, false);
});

test("deriveStatus: upcoming / in progress / completed", () => {
  const now = new Date("2026-07-29T12:00:00Z");
  assert.equal(
    deriveStatus(new Date("2026-08-06T00:00:00Z"), null, now),
    "UPCOMING",
  );
  assert.equal(
    deriveStatus(
      new Date("2026-07-28T00:00:00Z"),
      new Date("2026-07-30T00:00:00Z"),
      now,
    ),
    "IN_PROGRESS",
  );
  assert.equal(
    deriveStatus(
      new Date("2026-07-01T00:00:00Z"),
      new Date("2026-07-03T00:00:00Z"),
      now,
    ),
    "COMPLETED",
  );
});

test("classifyTour: Srixon / Olyo / NM", () => {
  assert.equal(classifyTour("Srixon Tour #6", "amateur-no").sourceOrigin, "SRIXON");
  assert.equal(classifyTour("Olyo Juniortour Øst", "junior-no").sourceOrigin, "OLYO");
  assert.equal(
    classifyTour("Norgesmesterskapet 2026", "amateur-no").sourceOrigin,
    "NM",
  );
});

test("schedule-entry med EntryCloses kan parses via parseGolfBoxDate", () => {
  // Speiler feltet GolfBox GetSchedule returnerer under SignupInformation
  const entryCloses = parseGolfBoxDate("20260727T120000");
  assert.ok(entryCloses);
  assert.equal(entryCloses!.toISOString().slice(0, 10), "2026-07-27");
});
