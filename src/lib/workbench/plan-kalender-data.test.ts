import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";

let viewer = { id: "coach", role: "COACH" };
let access: { id: string; role: string } | null = viewer;
let busyRows: Array<Record<string, unknown>> = [];
let capturedUserId: string | undefined;
mock.module("./plan-tilgang", { namedExports: { planTilgang: async () => access } });
mock.module("@/lib/auth/coached", { namedExports: { harCoachTilgangTilSpiller: async () => true, harCoachLesetilgangTilSpiller: async () => true } });
mock.module("@/lib/prisma", { namedExports: { prisma: {
  groupSchedule: { findMany: async () => [] },
  playerBusyBlock: { findMany: async ({ where }: { where: { userId: string } }) => { capturedUserId = where.userId; return busyRows; } },
  workbenchTournamentPlan: { findMany: async () => [] },
} } });
let load: typeof import("./plan-kalender-data").lastPlanKalenderBlokker;
before(async () => { ({ lastPlanKalenderBlokker: load } = await import("./plan-kalender-data")); });
beforeEach(() => {
  viewer = { id: "coach", role: "COACH" };
  access = viewer;
  capturedUserId = undefined;
  busyRows = [{ id: "busy-1", userId: "player", title: "Privat helsedetalj", kind: "HELSE", recurring: "WEEKLY", isPrivate: true,
    startAt: new Date("2026-09-16T08:00:00Z"), endAt: new Date("2026-09-16T09:00:00Z") }];
});

test("eierens private ukentlige avtale låser ukevisningen uten å røpe tittel eller kategori til trener", async () => {
  const days = await load("player", "2026-09-14", false);
  assert.equal(capturedUserId, "player");
  const block = days[2].find(row => row.id.startsWith("busy-busy-1-"));
  assert.ok(block);
  assert.equal(block.title, "Opptatt");
  assert.equal(block.kind, "OPPTATT");
  assert.equal(block.startMinute, 600);
  assert.doesNotMatch(JSON.stringify(days), /Privat helsedetalj|HELSE/);
});

test("spilleren ser egen tittel, og manglende spillerrelasjon gir ingen personlige kalenderdata", async () => {
  viewer = { id: "player", role: "PLAYER" };
  access = viewer;
  const own = await load("player", "2026-09-14", true);
  assert.ok(own[2].some(row => row.title === "Privat helsedetalj" && row.kind === "OPPTATT"));
  access = null;
  const denied = await load("player", "2026-09-14", false);
  assert.equal(denied.flat().length, 0);
});
