import assert from "node:assert/strict";
import { before, mock, test } from "node:test";
import type { WorkbenchMode } from "@/lib/domain/workbench/types";

let tilgang = false;
let sessionLookups = 0;
mock.module("@/lib/auth/requirePortalUser", {
  namedExports: { requirePortalUser: async () => ({ id: "coach-1", role: "COACH" }) },
});
mock.module("@/lib/auth/coached", {
  namedExports: { harCoachTilgangTilSpiller: async () => tilgang },
});
mock.module("@/lib/admin/stallen-data", { namedExports: { loadStallen: async () => [] } });
mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      workbenchSession: {
        findMany: async () => {
          sessionLookups += 1;
          return [];
        },
      },
      exerciseDefinition: { findMany: async () => { sessionLookups += 1; return []; } },
      trainingPlan: { findMany: async () => { sessionLookups += 1; return []; } },
      user: { findUnique: async () => { sessionLookups += 1; return { schoolYear: "VG1" }; } },
      playerBusyBlock: { findMany: async (args: { where: { userId: string } }) => {
        sessionLookups += 1;
        assert.equal(args.where.userId, "spiller-egen");
        return [{ id: "privat", title: "Privat detalj", kind: "HELSE", isPrivate: true, recurring: null,
          startAt: new Date("2026-09-16T06:00:00Z"), endAt: new Date("2026-09-16T07:00:00Z") }];
      } },
      schoolScheduleEntry: { findMany: async (args: { where: { OR: unknown[] } }) => {
        sessionLookups += 1;
        assert.deepEqual(args.where.OR, [{ classYear: "VG1" }, { classYear: null }]);
        return [];
      } },
    },
  },
});

let loadWeek: typeof import("./wb-actions").loadWeek;
let loadSources: typeof import("./wb-actions").loadSources;
let loadMonth: typeof import("./wb-actions").loadMonth;
let loadPeriod: typeof import("./wb-actions").loadPeriod;
let loadYear: typeof import("./wb-actions").loadYear;
let loadStallFollowup: typeof import("./wb-actions").loadStallFollowup;
let loadWorkbenchLive: typeof import("./wb-actions").loadWorkbenchLive;
let loadMinCalendar: typeof import("./wb-actions").loadMinCalendar;
before(async () => {
  ({ loadWeek, loadSources, loadMonth, loadPeriod, loadYear, loadStallFollowup, loadWorkbenchLive, loadMinCalendar } = await import("./wb-actions"));
});

const mode: WorkbenchMode = { kind: "AGENCY", subjectId: "spiller-fremmed", sources: ["OEKTER"] };

test("Workbench uke lastes ikke uten stalltilgang", async () => {
  tilgang = false;
  sessionLookups = 0;
  const uke = await loadWeek({ weekStart: "2026-09-14", mode, playerId: "spiller-fremmed" });
  assert.equal(uke.ok, false);
  if (!uke.ok) assert.match(uke.error, /tilgang/i);
  assert.equal(sessionLookups, 0);
});

test("Workbench-kilder lastes ikke uten stalltilgang", async () => {
  tilgang = false;
  sessionLookups = 0;
  const kilder = await loadSources({ playerId: "spiller-fremmed", weekStart: "2026-09-14" });
  assert.equal(kilder.ok, false);
  if (!kilder.ok) assert.match(kilder.error, /tilgang/i);
  assert.equal(sessionLookups, 0);
});

test("Workbench periode lastes ikke uten stalltilgang", async () => {
  tilgang = false;
  sessionLookups = 0;
  const periode = await loadPeriod({ year: 2026, mode, playerId: "spiller-fremmed" });
  assert.equal(periode.ok, false);
  if (!periode.ok) assert.match(periode.error, /tilgang/i);
  assert.equal(sessionLookups, 0);
});

test("Workbench måned lastes ikke uten stalltilgang", async () => {
  tilgang = false;
  sessionLookups = 0;
  const maned = await loadMonth({ monthStart: "2026-09-01", mode, playerId: "spiller-fremmed" });
  assert.equal(maned.ok, false);
  if (!maned.ok) assert.match(maned.error, /tilgang/i);
  assert.equal(sessionLookups, 0);
});

test("Workbench år lastes ikke uten stalltilgang", async () => {
  tilgang = false;
  sessionLookups = 0;
  const aar = await loadYear({ year: 2026, mode, playerId: "spiller-fremmed" });
  assert.equal(aar.ok, false);
  if (!aar.ok) assert.match(aar.error, /tilgang/i);
  assert.equal(sessionLookups, 0);
});

test("Workbench Stall lastes ikke uten stalltilgang", async () => {
  tilgang = false;
  sessionLookups = 0;
  const stall = await loadStallFollowup({ weekStart: "2026-09-14", playerId: "spiller-fremmed" });
  assert.equal(stall.ok, false);
  if (!stall.ok) assert.match(stall.error, /tilgang/i);
  assert.equal(sessionLookups, 0);
});

test("Workbench Live lastes ikke uten stalltilgang", async () => {
  tilgang = false;
  sessionLookups = 0;
  const live = await loadWorkbenchLive({ weekStart: "2026-09-14", playerId: "spiller-fremmed" });
  assert.equal(live.ok, false);
  if (!live.ok) assert.match(live.error, /tilgang/i);
  assert.equal(sessionLookups, 0);
});

test("Workbench Min kalender lastes ikke uten stalltilgang", async () => {
  tilgang = false;
  sessionLookups = 0;
  const calendar = await loadMinCalendar({ weekStart: "2026-09-14", playerId: "spiller-fremmed" });
  assert.equal(calendar.ok, false);
  if (!calendar.ok) assert.match(calendar.error, /tilgang/i);
  assert.equal(sessionLookups, 0);
});

test("egen spillers opptattid hentes etter tilgangskontroll og anonymiseres", async () => {
  tilgang = true;
  sessionLookups = 0;
  const uke = await loadWeek({ weekStart: "2026-09-14", mode: { ...mode, subjectId: "spiller-egen" }, playerId: "spiller-egen" });
  assert.equal(uke.ok, true);
  assert.equal(sessionLookups, 4);
  if (uke.ok) {
    assert.equal(uke.data.days[2].lockedBlocks[0].title, "Opptatt");
    assert.doesNotMatch(JSON.stringify(uke.data), /Privat detalj|HELSE/);
  }
});
