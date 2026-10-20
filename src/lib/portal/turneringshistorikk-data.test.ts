import { before, mock, test } from "node:test";
import assert from "node:assert/strict";
import type { Spillerprofil } from "@/lib/profil-kobling/typer";

// Kun fiktive personer og turneringer.
const event = { id: "event-a", name: "Syntetisk cup", sourceOrigin: "DATAGOLF", tour: "pga", startDate: new Date("2026-09-01"), officialUrl: null };
let profil: Spillerprofil | null = null;
let profilKall: { userId: string; inkluderGolfId?: boolean; db: unknown }[] = [];
let entryNotesFilter: unknown = null;
let dataGolfLeses = 0;

const profilMedTurnering = (): Spillerprofil => ({
  person: { name: "Pia Egenes", birth_year: 2009 }, sesonger: [], monster: [], runder: [],
  turneringer: [{ tournament_id: 11, turnering: "Olyo-test", start_date: "2026-06-12", year: 2026, kilde: "olyo", series: null,
    klasse: "G17", plassering: 2, total_score: 150, to_par: 6, runder: [{ runde: 1, score: 75, til_par: 3, mot_felt: null }, { runde: 2, score: 75, til_par: 3, mot_felt: null }] }],
});

mock.module("@/lib/profil-kobling/data", { namedExports: {
  hentSpillerprofil: async (userId: string, opts: { inkluderGolfId?: boolean }, db: unknown) => { profilKall.push({ userId, inkluderGolfId: opts.inkluderGolfId, db }); return profil; },
} });
const manuell = { id: "manual-b", tournament: null, manualName: "Egen cup", manualDate: new Date("2026-10-01"), entryStatus: "PLANNED", category: "Junior" };
mock.module("@/lib/prisma", { namedExports: { prisma: {
  user: { findUnique: async () => { dataGolfLeses++; return { publicPlayerId: "public-a" }; } },
  publicPlayerEntry: { findMany: async () => [{ status: "FINISHED", position: 9, scoreToPar: 1, totalScore: 285, rounds: {}, roundDetails: [], klasseNavn: "Brutto", tournament: event }] },
  tournamentEntry: { findMany: async ({ where }: { where: { userId: string; AND: unknown } }) => {
    assert.equal(where.userId, "user-a"); entryNotesFilter = where.AND; return [manuell];
  } },
} } });
let load: typeof import("./turneringshistorikk-data").hentTurneringshistorikk;
before(async () => { load = (await import("./turneringshistorikk-data")).hentTurneringshistorikk; });

test("resultater kommer fra den felles profilen, egne planer kommer i tillegg", async () => {
  profil = profilMedTurnering(); profilKall = []; dataGolfLeses = 0;
  const h = await load("user-a");
  assert.equal(h.antall, 2); assert.equal(h.bestePlassering, 2);
  assert.ok(h.aar[0].turneringer.some((t) => t.turneringId === "dashboard:11" && t.brutto === 150));
  assert.equal(h.aar[0].turneringer.find((t) => t.turneringId === "manual-b")?.status, "PLANNED");
  assert.equal(profilKall.length, 1);
  assert.equal(profilKall[0].inkluderGolfId, undefined);
});

test("automatiske speilrader filtreres bort så resultatene ikke telles to ganger", async () => {
  profil = profilMedTurnering();
  await load("user-a");
  assert.deepEqual(entryNotesFilter, [{ OR: [{ notes: null }, { notes: { not: "Automatisk fra turneringsresultat" } }] }]);
});

test("Data Golf leses ikke uten uttrykkelig tillatelse", async () => {
  profil = profilMedTurnering(); dataGolfLeses = 0;
  const h = await load("user-a");
  assert.equal(dataGolfLeses, 0);
  assert.ok(!h.aar.flatMap((a) => a.turneringer).some((t) => t.kilde === "DATAGOLF"));
});

test("Data Golf tas med bare når kalleren ber om det, og dobbeltteller ikke profilen", async () => {
  profil = profilMedTurnering();
  const h = await load("user-a", undefined, { medDataGolf: true });
  const alle = h.aar.flatMap((a) => a.turneringer);
  assert.ok(alle.some((t) => t.turneringId === "event-a"));
  assert.equal(alle.filter((t) => t.navn === "Olyo-test").length, 1);
});

test("ukoblet spiller får egne registreringer og ingen offisielle resultater", async () => {
  profil = null;
  const h = await load("user-a");
  assert.equal(h.antall, 1); assert.equal(h.bestePlassering, null);
});

test("WANG-lesing sender den delingskontrollerte klienten videre til profilleseren", async () => {
  profil = profilMedTurnering(); profilKall = [];
  const transactionDb = {
    user: { findUnique: async () => null }, publicPlayerEntry: { findMany: async () => [] },
    tournamentEntry: { findMany: async () => [] }, $queryRaw: async () => [],
  } as unknown as Parameters<typeof load>[1];
  const h = await load("user-a", transactionDb);
  assert.equal(profilKall[0].db, transactionDb);
  assert.equal(h.antall, 1);
});
