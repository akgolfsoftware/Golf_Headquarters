import { before, beforeEach, mock, test } from "node:test";
import assert from "node:assert/strict";
import { SG_ALLE_FELT, type ManuellSgVerdier } from "./manuell-sg";
import type { LogRoundManualInput } from "@/app/portal/mal/runder/ny/actions";

type Row = ManuellSgVerdier & { id: string; userId: string; courseId: string; score: number; notes: string | null; playedAt: Date; sgSource: string | null; holeScores: Record<string, unknown>[] };
const nullSg = (): ManuellSgVerdier => Object.fromEntries(SG_ALLE_FELT.map((f) => [f.key, null])) as ManuellSgVerdier;
let viewer = "spiller-a";
let guardError = false;
let fail = false;
let failHoles = false;
let rows = new Map<string, Row>();
let writes = 0;
let synks: string[] = [];
let paths: string[] = [];
const matches = (row: Row, where: Record<string, unknown>) => Object.entries(where).every(([key, value]) => value === undefined || row[key as keyof Row] === value);
mock.module("@/lib/auth/requirePortalUser", { namedExports: { requirePortalUser: async (opts: unknown) => {
  assert.deepEqual(opts, { kreverTilgang: "TALENT" });
  if (guardError) throw new Error("guardian-consent-required"); return { id: viewer };
} } });
mock.module("next/navigation", { namedExports: { redirect: (url: string) => { throw new Error(`REDIRECT:${url}`); } } });
mock.module("next/cache", { namedExports: { revalidatePath: (path: string) => { paths.push(path); } } });
mock.module("@/lib/portal/bane-bro", { namedExports: { sikreBaneBro: async () => {} } });
mock.module("@/lib/portal-stats/sg-bro", { namedExports: { synkroniserSgFraRunder: async (id: string) => { synks.push(id); } } });
mock.module("@/lib/prisma", { namedExports: { prisma: {
  courseDefinition: { findUnique: async ({ where }: { where: { id: string } }) => where.id === "bane-a" ? { par: 72 } : null },
  round: {
    updateMany: async ({ where, data }: { where: Record<string, unknown>; data: Partial<Row> }) => {
      if (fail) throw new Error("offline");
      const row = rows.get(where.id as string);
      if (!row || !matches(row, where)) return { count: 0 };
      rows.set(row.id, { ...row, ...data }); writes++; return { count: 1 };
    },
    findFirst: async ({ where }: { where: Record<string, unknown> }) => [...rows.values()].find((r) => matches(r, where)) ?? null,
  },
  $transaction: async (fn: (tx: unknown) => Promise<unknown>) => {
    if (fail) throw new Error("offline");
    const next = structuredClone(rows);
    let count = 0;
    const result = await fn({ round: {
      findUnique: async ({ where }: { where: { id: string } }) => next.get(where.id) ?? null,
      create: async ({ data }: { data: Row }) => {
        const id = data.id ?? `runde-${next.size}`;
        assert.equal(next.has(id), false);
        next.set(id, { ...data, id, holeScores: [] }); count++; return { id };
      },
    }, holeScore: { createMany: async ({ data }: { data: Record<string, unknown>[] }) => {
      if (failHoles) throw new Error("scorekort-feil");
      for (const d of data) next.get(d.roundId as string)!.holeScores.push(d);
    } } });
    rows = next; writes += count; return result;
  },
} } });

let create: typeof import("@/app/portal/mal/runder/ny/actions").logRoundManual;
let edit: typeof import("@/app/portal/mal/runder/[id]/sg-actions").lagreManuellRundeSg;
before(async () => {
  create = (await import("@/app/portal/mal/runder/ny/actions")).logRoundManual;
  edit = (await import("@/app/portal/mal/runder/[id]/sg-actions")).lagreManuellRundeSg;
});
beforeEach(() => { rows = new Map(); viewer = "spiller-a"; guardError = false; fail = false; failHoles = false; writes = 0; synks = []; paths = []; });
const input = (): LogRoundManualInput => ({ courseId: "bane-a", playedAt: "2026-09-10", score: 72, requestId: "d3f8c1b8-c91a-461f-b8b1-8d4a3a8d48d3" });
const created = async (sg: Partial<ManuellSgVerdier>) => {
  await assert.rejects(create({ ...input(), ...sg }), /REDIRECT:.*lagret=1/);
  return [...rows.values()][0];
};

test("opprett full manuell SG, lagre alle 21 felt og prøv samme innsending igjen", async () => {
  const all = Object.fromEntries(SG_ALLE_FELT.map((f) => [f.key, 0])) as ManuellSgVerdier;
  Object.assign(all, { sgOtt: 0.5, sgApp: -1, sgArg: 0.25, sgPutt: -0.5, sgTotal: -0.75, sgLob: -0.25, sgPutt40plus: -0.5 });
  const row = await created(all);
  for (const f of SG_ALLE_FELT) assert.equal(row[f.key], all[f.key]);
  assert.equal(row.sgSource, "manual"); assert.equal(row.userId, "spiller-a");
  await created(all); assert.equal(rows.size, 1); assert.equal(writes, 1);
  await assert.rejects(create({ ...input(), ...all, score: 73 }), /allerede lagret/);
  assert.deepEqual(synks, ["spiller-a", "spiller-a"]);
  assert.ok(paths.includes("/portal"));
});

test("bare total, én nullkategori og bare avansert får ingen oppdiktet fordeling", async () => {
  for (const sg of [{ sgTotal: -3 }, { sgPutt: 0 }, { sgLob: -0.25 }]) {
    rows = new Map();
    const row = await created(sg);
    assert.equal(row.sgSource, "manual"); assert.equal(row.sgOtt, null);
    assert.equal(row.sgApp, null); assert.equal(row.sgApp50, null);
    assert.equal(row.sgTotal, "sgTotal" in sg ? sg.sgTotal : null);
  }
});

test("ugyldig SG og totalavvik avvises før noen skriving", async () => {
  await assert.rejects(create({ ...input(), sgLob: Infinity }), /Lob/);
  await assert.rejects(create({ ...input(), sgTotal: 3, sgOtt: 1, sgApp: 0, sgArg: 0, sgPutt: 0 }), /summen/);
  await assert.rejects(create({ ...input(), score: -1 }), /Kontroller/);
  await assert.rejects(create({ ...input(), playedAt: "2026-02-31" }), /Kontroller/);
  assert.equal(writes, 0);
});

test("runde og hull er atomiske: en scorekortfeil gir ingen halv lagring", async () => {
  const hull = Array.from({ length: 9 }, (_, i) => ({ nr: i + 1, par: 4, strokes: 4, putts: null, gir: null, fairway: null }));
  failHoles = true;
  await assert.rejects(create({ ...input(), sgTotal: 0, hullDetaljer: hull }), /scorekort/);
  assert.equal(rows.size, 0);
  failHoles = false;
  await assert.rejects(create({ ...input(), sgTotal: 0, hullDetaljer: hull }), /REDIRECT/);
  const row = [...rows.values()][0]; assert.equal(row.score, 36); assert.equal(row.holeScores.length, 9);
});

test("redigering beholder detaljene, oppdaterer total og tillater korrigering til null", async () => {
  const row = await created({ sgPutt: -1, sgLob: -0.1 });
  const expected = Object.fromEntries(SG_ALLE_FELT.map((f) => [f.key, row[f.key]])) as ManuellSgVerdier;
  const result = await edit(row.id, { ...expected, sgOtt: 0, sgApp: 0, sgArg: 0, sgPutt: 0 }, expected);
  assert.ok(result.ok); assert.equal(result.verdier.sgTotal, 0);
  assert.equal(rows.get(row.id)?.sgLob, -0.1);
  const snapshot = result.verdier;
  const cleared = await edit(row.id, { ...snapshot, sgLob: null }, snapshot);
  assert.ok(cleared.ok); assert.equal(rows.get(row.id)?.sgLob, null);
});

test("en annen spiller kan verken endre eller få innholdet i en runde", async () => {
  const row = await created({ sgTotal: 1 }); viewer = "spiller-b";
  const result = await edit(row.id, { sgTotal: 9 }, { ...nullSg(), sgTotal: 1 });
  assert.equal(result.ok, false); assert.equal(rows.get(row.id)?.sgTotal, 1);
  assert.equal(writes, 1);
});

test("en gammel fane kan ikke overskrive nyere verdier; gjentatt vellykket lagring er trygg", async () => {
  const row = await created({ sgTotal: 1 }); const expected = { ...nullSg(), sgTotal: 1 };
  assert.equal((await edit(row.id, { sgTotal: 2 }, expected)).ok, true);
  assert.equal((await edit(row.id, { sgTotal: 2 }, expected)).ok, true);
  assert.equal((await edit(row.id, { sgTotal: 3 }, expected)).ok, false);
  assert.equal(rows.get(row.id)?.sgTotal, 2);
});

test("lagringsfeil, tomt skjema og ufullstendig snapshot skriver ingenting", async () => {
  const row = await created({ sgTotal: 0 }); const expected = { ...nullSg(), sgTotal: 0 };
  fail = true; assert.equal((await edit(row.id, { sgTotal: -1 }, expected)).ok, false);
  fail = false; assert.equal((await edit(row.id, {}, expected)).ok, false);
  assert.equal((await edit(row.id, { sgTotal: -1 }, {})).ok, false);
  assert.equal(rows.get(row.id)?.sgTotal, 0);
  assert.equal((await edit(row.id, { sgTotal: -1 }, expected)).ok, true);
});

test("innlogging og samtykke kontrolleres før databasearbeid", async () => {
  guardError = true;
  await assert.rejects(create(input()), /guardian-consent/);
  await assert.rejects(edit("runde", { sgTotal: 1 }, nullSg()), /guardian-consent/);
  assert.equal(writes, 0);
});

test("manuelle tall kan ikke overskrives av den eksisterende automatiske SG-motoren", async () => {
  const { avgjorSgSkriving } = await import("@/lib/domain/sg-skriving");
  const row = await created({ sgLob: -0.25 });
  assert.deepEqual(avgjorSgSkriving(row.sgSource, { total: 4, ott: 1, app: 1, arg: 1, putt: 1 }, null), { handling: "ingen", grunn: "manuell" });
  assert.deepEqual(avgjorSgSkriving(row.sgSource, null, null), { handling: "ingen", grunn: "manuell" });
});
