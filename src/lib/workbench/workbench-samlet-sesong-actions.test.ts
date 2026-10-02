import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";
import { Prisma } from "@/generated/prisma/client";

const dato = (d: string) => new Date(`${d}T00:00:00Z`);
let viewer = { id: "syntetisk-coach", role: "COACH" };
let tilgang = true, authFeil = false, staleRace = false, txFeil = false;
let plan = { id: "syntetisk-plan", userId: "syntetisk-spiller", startDate: dato("2026-01-01"), endDate: dato("2026-12-31"),
  updatedAt: new Date("2026-10-02T10:00:00Z"), notes: "Syntetisk notat beholdes", name: "Syntetisk årsplan",
  periodBlocks: [{ id: "syntetisk-periode", startDate: dato("2026-03-01"), endDate: dato("2026-06-30"), focus: "Syntetisk fokus" }] };
type Plan = typeof plan;
const kall: { navn: string; where?: unknown; data?: unknown }[] = [];
const revaliderte: string[] = [];
mock.module("@/lib/auth/requirePortalUser", { namedExports: { requirePortalUser: async () => {
  if (authFeil) throw new Error("Syntetisk samtykke-/innloggingsvakt"); return viewer;
} } });
mock.module("@/lib/auth/coached", { namedExports: { harCoachTilgangTilSpiller: async (_viewer: unknown, id: string) => {
  assert.equal(id, "syntetisk-spiller"); return tilgang;
} } });
mock.module("next/cache", { namedExports: { revalidatePath: (path: string) => { revaliderte.push(path); } } });
const tx = { seasonPlan: {
  findFirst: async ({ where }: { where: { id: string; userId: string } }) => {
    kall.push({ navn: "les", where }); return plan.id === where.id && plan.userId === where.userId ? structuredClone(plan) : null;
  },
  updateMany: async ({ where, data }: { where: { id: string; userId: string; updatedAt: Date };
    data: { startDate: Date; endDate: Date; updatedAt: Date } }) => {
    kall.push({ navn: "skriv", where, data });
    if (staleRace || plan.id !== where.id || plan.userId !== where.userId || plan.updatedAt.getTime() !== where.updatedAt.getTime()) return { count: 0 };
    plan = { ...plan, ...data }; return { count: 1 };
  },
} };
mock.module("@/lib/prisma", { namedExports: { prisma: {
  $transaction: async (callback: (transaction: typeof tx) => Promise<unknown>, options: { isolationLevel: string }) => {
    assert.equal(options.isolationLevel, Prisma.TransactionIsolationLevel.Serializable);
    if (txFeil) throw new Error("Syntetisk serialiseringsfeil");
    return callback(tx);
  },
} } });
let save: typeof import("./workbench-samlet-sesong-actions").saveSeasonBounds;
before(async () => { ({ saveSeasonBounds: save } = await import("./workbench-samlet-sesong-actions")); });
beforeEach(() => {
  viewer = { id: "syntetisk-coach", role: "COACH" }; tilgang = true; authFeil = false; staleRace = false; txFeil = false;
  plan = { id: "syntetisk-plan", userId: "syntetisk-spiller", startDate: dato("2026-01-01"), endDate: dato("2026-12-31"),
    updatedAt: new Date("2026-10-02T10:00:00Z"), notes: "Syntetisk notat beholdes", name: "Syntetisk årsplan",
    periodBlocks: [{ id: "syntetisk-periode", startDate: dato("2026-03-01"), endDate: dato("2026-06-30"), focus: "Syntetisk fokus" }] };
  kall.length = 0; revaliderte.length = 0;
});
const input = { playerId: "syntetisk-spiller", seasonPlanId: "syntetisk-plan", startDato: "2026-02-01", sluttDato: "2026-08-31",
  expectedUpdatedAt: "2026-10-02T10:00:00.000Z" };

test("sesonggrenser kan oppdateres når perioder finnes, uten å endre notes/navn/perioder", async () => {
  const original = structuredClone(plan);
  const r = await save(input); assert.ok(r.ok);
  assert.equal(r.data.startDate, "2026-02-01"); assert.equal(r.data.endDate, "2026-08-31");
  assert.ok(Date.parse(r.data.updatedAt) > original.updatedAt.getTime());
  assert.equal(plan.notes, original.notes); assert.equal(plan.name, original.name); assert.deepEqual(plan.periodBlocks, original.periodBlocks);
  assert.deepEqual(Object.keys(kall.find(k => k.navn === "skriv")?.data ?? {}).sort(), ["endDate", "startDate", "updatedAt"]);
  assert.deepEqual(revaliderte, ["/admin/workbench/syntetisk-spiller", "/portal/planlegge/workbench"]);
});
test("grenser som utelukker start eller slutt av eksisterende periode avvises uten skriving", async () => {
  for (const verdi of [{ startDato: "2026-03-02" }, { sluttDato: "2026-06-29" }]) {
    const original: Plan = structuredClone(plan);
    const r = await save({ ...input, ...verdi }); assert.equal(r.ok, false);
    if (!r.ok) assert.match(r.error, /omfatte alle eksisterende perioder/);
    assert.deepEqual(plan, original); assert.equal(kall.filter(k => k.navn === "skriv").length, 0); assert.deepEqual(revaliderte, []);
  }
});
test("autentisering/samtykke, annen spiller og coach uten tilgang avvises før lesing", async () => {
  authFeil = true; await assert.rejects(save(input), /samtykke/); assert.equal(kall.length, 0);
  authFeil = false; viewer = { id: "syntetisk-annen", role: "PLAYER" };
  assert.equal((await save(input)).ok, false); assert.equal(kall.length, 0);
  viewer = { id: "syntetisk-coach", role: "COACH" }; tilgang = false;
  assert.equal((await save(input)).ok, false); assert.equal(kall.length, 0);
});
test("spiller kan endre egen plan, men fremmed plan-ID gir ingen skriving", async () => {
  viewer = { id: "syntetisk-spiller", role: "PLAYER" };
  assert.equal((await save({ ...input, seasonPlanId: "fremmed-plan" })).ok, false);
  assert.equal(kall.filter(k => k.navn === "skriv").length, 0);
  assert.deepEqual(kall[0].where, { id: "fremmed-plan", userId: "syntetisk-spiller" });
  assert.equal((await save(input)).ok, true);
});
test("PARENT/GUEST avvises ved direkte serverhandling også for egen userId", async () => {
  for (const role of ["PARENT", "GUEST"]) {
    viewer = { id: "syntetisk-spiller", role };
    assert.equal((await save(input)).ok, false);
    assert.equal(kall.length, 0); assert.equal(revaliderte.length, 0);
  }
});
test("ugyldig kalenderdato, omvendte grenser og ukjent inputfelt avvises uten lesing", async () => {
  for (const verdi of [{ startDato: "2026-02-29" }, { startDato: "2026-03-32" },
    { startDato: "2026-09-01", sluttDato: "2026-08-31" }, { expectedUpdatedAt: "feil" }, { notes: "skal ikke endres" }]) {
    assert.equal((await save({ ...input, ...verdi })).ok, false);
  }
  assert.equal(kall.length, 0); assert.deepEqual(revaliderte, []);
});
test("utdatert versjon avvises; vellykket versjon kan brukes ved neste lagring", async () => {
  const r = await save(input); assert.ok(r.ok);
  const etter = structuredClone(plan);
  const stale = await save({ ...input, sluttDato: "2026-09-30" }); assert.equal(stale.ok, false);
  if (!stale.ok) assert.match(stale.error, /endret siden/); assert.deepEqual(plan, etter);
  const retry = await save({ ...input, sluttDato: "2026-09-30", expectedUpdatedAt: r.data.updatedAt }); assert.ok(retry.ok);
  assert.equal(plan.endDate.toISOString().slice(0, 10), "2026-09-30");
});
test("samtidig endring mellom lesing og skriving gir stale, doble eier-/versjonsfiltre beholdes", async () => {
  staleRace = true;
  const original = structuredClone(plan); const r = await save(input); assert.equal(r.ok, false); assert.deepEqual(plan, original);
  if (!r.ok) assert.match(r.error, /endret siden/);
  assert.deepEqual(kall.find(k => k.navn === "skriv")?.where, { id: input.seasonPlanId, userId: input.playerId, updatedAt: new Date(input.expectedUpdatedAt) });
  assert.deepEqual(revaliderte, []);
});
test("transaksjonsfeil bekreftes aldri som lagret og samme inndata kan prøves igjen", async () => {
  txFeil = true;
  const original = structuredClone(plan); const r = await save(input); assert.equal(r.ok, false); assert.deepEqual(plan, original);
  assert.deepEqual(revaliderte, []); txFeil = false;
  assert.equal((await save(input)).ok, true); assert.equal(plan.notes, original.notes);
});
