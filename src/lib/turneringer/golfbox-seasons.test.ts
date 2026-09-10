import { test } from "node:test";
import assert from "node:assert/strict";
import type { PrismaClient } from "@/generated/prisma/client";
import type { GolfBoxScheduleEvent } from "@/lib/scrapers/golfbox";
import type { GolfBoxCustomerSource } from "@/lib/scrapers/golfbox-customers";
import { backfillGolfBoxSeasons, parseSeasonOptions } from "./golfbox-seasons";
import { upsertScheduleEvent } from "./golfbox-sync";

const now = new Date("2026-09-10T12:00:00Z");
const source: GolfBoxCustomerSource = { customerId: 1, label: "Syntetisk kilde", defaultTour: "junior-no", onlyMatching: /syntetisk/i };
const event: GolfBoxScheduleEvent = { competitionId: 42, name: "Syntetisk cup", type: "StrokePlay", startDate: new Date("2024-06-01T00:00:00Z"), endDate: null, venue: null, entryCloses: null, entryOpens: null };

test("historiske sesonger bruker Oslo-år og avviser ugyldige eller fremtidige intervaller", () => {
  assert.deepEqual(parseSeasonOptions([], now), { apply: false, from: 2010, to: 2025 });
  assert.equal(parseSeasonOptions([], new Date("2026-12-31T23:30:00Z")).to, 2026);
  assert.deepEqual(parseSeasonOptions(["--from=2022", "--to=2024", "--apply"], now), { apply: true, from: 2022, to: 2024 });
  for (const args of [["--from=no"], ["--from=2025abc"], ["--to=2026"], ["--from=2009"], ["--from=2025", "--to=2024"], ["--apply=false"], ["--from=2024", "--from=2023"]]) {
    assert.throws(() => parseSeasonOptions(args, now));
  }
});

test("forhåndsvisning skriver aldri og søker forbi tomme år med samme sesong- og kildefilter", async () => {
  const requested: number[] = [];
  const report = await backfillGolfBoxSeasons({ apply: false, from: 2023, to: 2025 }, {
    now, sources: [source],
    getSchedule: async (_id, year) => {
      requested.push(year);
      return year === 2024 ? [event, event, { ...event, competitionId: 43, name: "Klubbmesterskap" }, { ...event, competitionId: 44, startDate: now }, { ...event, competitionId: 45, startDate: null }] : [];
    },
    saveEvent: async () => { assert.fail("Dry-run må aldri skrive"); },
  });
  assert.deepEqual(requested, [2025, 2024, 2023]);
  assert.equal(report.years.reduce((sum, row) => sum + row.candidates, 0), 1);
  assert.equal(report.years.reduce((sum, row) => sum + row.saved, 0), 0);
  assert.deepEqual(report.failures, []);
});

test("apply krever eksplisitt lagring og rapporterer delvise kildefeil uten å miste eldre år", async () => {
  await assert.rejects(backfillGolfBoxSeasons({ apply: true, from: 2024, to: 2025 }, { now, sources: [source], getSchedule: async () => [] }));
  const saved: number[] = [];
  const report = await backfillGolfBoxSeasons({ apply: true, from: 2024, to: 2025 }, {
    now, sources: [source], getSchedule: async (_id, year) => { if (year === 2025) throw new Error("syntetisk feil"); return [event]; },
    saveEvent: async (_source, value, date) => { saved.push(value.competitionId); assert.equal(date, now); return { upserted: true }; },
  });
  assert.deepEqual(saved, [42]);
  assert.deepEqual(report.failures, [{ customerId: 1, year: 2025 }]);
  assert.equal(report.years[1].saved, 1);
});

test("kalenderhelper beholder eksisterende identitet og endrer aldri dato for resultatsync", async () => {
  let calls = 0;
  const prisma = { tournament: {
    findFirst: async ({ where }: { where: { sourceId: string } }) => { assert.equal(where.sourceId, "42"); return { id: "existing-id", slug: "bevart-slug", mergedIntoId: null }; },
    upsert: async ({ where, create, update }: { where: { id: string }; create: Record<string, unknown>; update: Record<string, unknown> }) => {
      calls++;
      assert.deepEqual(where, { id: "existing-id" });
      assert.equal(create.slug, "bevart-slug");
      assert.equal(update.sourceId, "42");
      assert.equal(update.name, "Syntetisk cup");
      assert.equal("lastSyncAt" in create, false);
      assert.equal("lastSyncAt" in update, false);
      assert.equal("slug" in update, false);
    },
  } } as unknown as PrismaClient;
  assert.deepEqual(await upsertScheduleEvent(prisma, source, event, now), { upserted: true, status: "COMPLETED" });
  assert.equal(calls, 1);
});

test("kalenderhelper hopper over sammenslåtte turneringer, manglende dato og feil kilde", async () => {
  const prisma = { tournament: { findFirst: async () => ({ id: "old", slug: "old", mergedIntoId: "canonical" }), upsert: async () => assert.fail("Skal ikke opprettes på nytt") } } as unknown as PrismaClient;
  for (const value of [event, { ...event, startDate: null }, { ...event, name: "Klubbmesterskap" }]) {
    assert.deepEqual(await upsertScheduleEvent(prisma, source, value, now), { upserted: false, status: null });
  }
});

test("nye turneringer med samme navn får ulike kilde-IDer i slugen", async () => {
  const slugs: string[] = [];
  const prisma = { tournament: { findFirst: async () => null, upsert: async ({ create }: { create: { slug: string } }) => { slugs.push(create.slug); } } } as unknown as PrismaClient;
  await upsertScheduleEvent(prisma, source, event, now);
  await upsertScheduleEvent(prisma, source, { ...event, competitionId: 43 }, now);
  assert.deepEqual(slugs, ["syntetisk-cup-2024-golfbox-42", "syntetisk-cup-2024-golfbox-43"]);
});
