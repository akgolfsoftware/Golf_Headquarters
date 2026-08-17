import { test } from "node:test";
import assert from "node:assert/strict";
import {
  deriveRoundDates,
  golfBoxLeaderboardScope,
  partitionLiveRecentAndBackfill,
} from "./golfbox-sync";

test("deriveRoundDates: én dag", () => {
  const d = new Date(Date.UTC(2026, 7, 6));
  assert.deepEqual(deriveRoundDates(d, null), ["2026-08-06"]);
});

test("deriveRoundDates: flere dager", () => {
  const s = new Date(Date.UTC(2026, 7, 6));
  const e = new Date(Date.UTC(2026, 7, 8));
  assert.deepEqual(deriveRoundDates(s, e), [
    "2026-08-06",
    "2026-08-07",
    "2026-08-08",
  ]);
});

test("golfBoxLeaderboardScope: har en gren for COMPLETED uten resultater uansett alder", () => {
  const now = new Date(Date.UTC(2026, 7, 17));
  const scope = golfBoxLeaderboardScope(now);
  const or = scope.OR as Array<Record<string, unknown>>;
  assert.ok(
    or.some(
      (clause) =>
        clause.status === "COMPLETED" &&
        typeof clause.publicEntries === "object" &&
        clause.publicEntries !== null &&
        "none" in (clause.publicEntries as Record<string, unknown>),
    ),
    "forventet en { status: COMPLETED, publicEntries: { none: {} } }-gren",
  );
});

test("partitionLiveRecentAndBackfill: gammel COMPLETED-turnering havner i backfill, ikke kuttes bort", () => {
  const now = new Date(Date.UTC(2026, 7, 17));
  const gammelUtenResultater = {
    status: "COMPLETED",
    endDate: new Date(Date.UTC(2026, 5, 1)), // 2,5 måned gammel
  };
  const { liveOrRecent, backfill } = partitionLiveRecentAndBackfill(
    [gammelUtenResultater],
    now,
  );
  assert.deepEqual(liveOrRecent, []);
  assert.deepEqual(backfill, [gammelUtenResultater]);
});

test("partitionLiveRecentAndBackfill: IN_PROGRESS og nylig COMPLETED havner i liveOrRecent", () => {
  const now = new Date(Date.UTC(2026, 7, 17));
  const pagaende = { status: "IN_PROGRESS", endDate: null };
  const nyligFerdig = {
    status: "COMPLETED",
    endDate: new Date(Date.UTC(2026, 7, 15)), // 2 dager siden
  };
  const { liveOrRecent, backfill } = partitionLiveRecentAndBackfill(
    [pagaende, nyligFerdig],
    now,
  );
  assert.deepEqual(liveOrRecent, [pagaende, nyligFerdig]);
  assert.deepEqual(backfill, []);
});

test("partitionLiveRecentAndBackfill: blandet liste sorteres riktig i begge bøtter", () => {
  const now = new Date(Date.UTC(2026, 7, 17));
  const nylig = { status: "COMPLETED", endDate: new Date(Date.UTC(2026, 7, 16)) };
  const gammel = { status: "COMPLETED", endDate: new Date(Date.UTC(2026, 0, 1)) };
  const { liveOrRecent, backfill } = partitionLiveRecentAndBackfill(
    [nylig, gammel],
    now,
  );
  assert.deepEqual(liveOrRecent, [nylig]);
  assert.deepEqual(backfill, [gammel]);
});
