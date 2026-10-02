import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";

type Plan = { id: string; userId: string; year: number; startDate: Date; endDate: Date };
type Blokk = { id: string; seasonPlanId: string; [key: string]: unknown };
const dato = (s: string) => new Date(`${s}T00:00:00Z`);
let planer: Plan[];
let blokker: Blokk[];
let writes: number;
let reads: number;
let txFeil: boolean;
let txOptions: unknown;
let me: { id: string; role: string };
let coachTilgang: boolean;
const revalidert: string[] = [];
const nyPeriode = { lPhase: "GRUNN", startDato: "2027-01-04", sluttDato: "2027-02-28", fokus: "Syntetisk fokus", ukevolumMin: 0, budsjett: { TEK: 0 } };

const db = {
  seasonPlan: {
    findFirst: async ({ where }: { where: { id?: string; userId: string; year?: number } }) => {
      reads++;
      return planer.find(p => p.userId === where.userId && (!where.id || p.id === where.id) && (where.year === undefined || p.year === where.year)) ?? null;
    },
    create: async ({ data }: { data: Omit<Plan, "id"> }) => { writes++; const plan = { id: "ny-plan", ...data }; planer.push(plan); return plan; },
  },
  periodBlock: {
    findFirst: async ({ where }: { where: { id: string; seasonPlanId?: string; seasonPlan?: { userId: string } } }) => {
      reads++;
      return blokker.find(b => b.id === where.id && (!where.seasonPlanId || b.seasonPlanId === where.seasonPlanId)
        && (!where.seasonPlan || planer.some(p => p.id === b.seasonPlanId && p.userId === where.seasonPlan!.userId))) ?? null;
    },
    create: async ({ data }: { data: Omit<Blokk, "id"> & { seasonPlanId: string } }) => { writes++; const b = { ...data, id: "ny-periode" }; blokker.push(b); return b; },
    updateMany: async ({ where, data }: { where: { id: string; seasonPlanId: string }; data: Record<string, unknown> }) => {
      const b = blokker.find(b => b.id === where.id && b.seasonPlanId === where.seasonPlanId);
      if (!b) return { count: 0 }; writes++; Object.assign(b, data); return { count: 1 };
    },
    update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
      const b = blokker.find(b => b.id === where.id); if (!b) throw new Error("Mangler testperiode"); writes++; Object.assign(b, data); return b;
    },
  },
};
mock.module("@/lib/prisma", { namedExports: { prisma: { ...db, $transaction: async (fn: (tx: typeof db) => Promise<unknown>, options: unknown) => {
  txOptions = options; if (txFeil) throw new Error("Syntetisk konflikt"); return fn(db);
} } } });
mock.module("@/lib/auth/requirePortalUser", { namedExports: { requirePortalUser: async () => me } });
mock.module("@/lib/auth/coached", { namedExports: { harCoachTilgangTilSpiller: async () => coachTilgang } });
mock.module("@/lib/admin/stallen-data", { namedExports: { loadStallen: async () => [] } });
mock.module("next/cache", { namedExports: { revalidatePath: (path: string) => { revalidert.push(path); } } });
let core: typeof import("./periode-core");
let actions: typeof import("./wb-actions");
before(async () => { core = await import("./periode-core"); actions = await import("./wb-actions"); });
beforeEach(() => {
  planer = [
    { id: "plan-2026", userId: "spiller", year: 2026, startDate: dato("2026-10-01"), endDate: dato("2027-04-30") },
    { id: "plan-2027", userId: "spiller", year: 2027, startDate: dato("2027-01-01"), endDate: dato("2027-12-31") },
    { id: "fremmed-plan", userId: "annen", year: 2027, startDate: dato("2027-01-01"), endDate: dato("2027-12-31") },
  ];
  blokker = [{ id: "periode-2026", seasonPlanId: "plan-2026" }, { id: "periode-2027", seasonPlanId: "plan-2027" }];
  writes = 0; reads = 0; txFeil = false; txOptions = undefined; me = { id: "spiller", role: "PLAYER" }; coachTilgang = false; revalidert.length = 0;
});

test("ekte action oppretter januarperioden i valgt sesong over årsskiftet og bevarer tallverdien 0", async () => {
  const r = await actions.saveSeasonPeriod({ playerId: "spiller", seasonPlanId: "plan-2026", data: nyPeriode });
  assert.deepEqual(r, { ok: true, data: { periodId: "ny-periode" } });
  const b = blokker.at(-1)!;
  assert.equal(b.seasonPlanId, "plan-2026"); assert.equal(b.weeklyVolMin, 0); assert.deepEqual(b.weeklySessionBudget, { TEK: 0 });
  assert.equal(planer.length, 3); assert.deepEqual(txOptions, { isolationLevel: "Serializable" }); assert.ok(revalidert.length > 0);
});
test("begge sesonggrenser godtas og datoer utenfor avvises uten skriving", async () => {
  for (const data of [{ ...nyPeriode, startDato: "2026-09-30" }, { ...nyPeriode, sluttDato: "2027-05-01" }]) {
    assert.equal((await core.opprettPeriodeCore("spiller", data, "plan-2026")).ok, false);
  }
  assert.equal(writes, 0);
  assert.equal((await core.opprettPeriodeCore("spiller", { ...nyPeriode, startDato: "2026-10-01", sluttDato: "2027-04-30" }, "plan-2026")).ok, true);
});
test("fremmed, manglende og ugyldig eksplisitt plan-ID kan aldri autoopprette en plan", async () => {
  for (const id of ["fremmed-plan", "mangler", "", " "]) {
    assert.equal((await actions.saveSeasonPeriod({ playerId: "spiller", seasonPlanId: id, data: nyPeriode })).ok, false);
  }
  assert.equal(writes, 0); assert.equal(planer.length, 3); assert.equal(revalidert.length, 0);
});
test("redigering avviser periode fra annen årsplan og grenser utenfor valgt plan", async () => {
  assert.equal((await actions.saveSeasonPeriod({ playerId: "spiller", seasonPlanId: "plan-2026", periodId: "periode-2027", data: nyPeriode })).ok, false);
  assert.equal((await actions.saveSeasonPeriod({ playerId: "spiller", seasonPlanId: "plan-2026", periodId: "periode-2026", data: { ...nyPeriode, sluttDato: "2027-05-01" } })).ok, false);
  assert.equal(writes, 0);
  assert.equal((await actions.saveSeasonPeriod({ playerId: "spiller", seasonPlanId: "plan-2026", periodId: "periode-2026", data: nyPeriode })).ok, true);
  assert.equal(blokker[0].seasonPlanId, "plan-2026"); assert.deepEqual(blokker[0].startDate, dato("2027-01-04"));
});
test("uekte kalenderdato og omvendt datospenn avvises før lesing av valgt plan", async () => {
  for (const data of [{ ...nyPeriode, startDato: "2027-02-30" }, { ...nyPeriode, sluttDato: "2026-12-01" }]) {
    assert.equal((await core.opprettPeriodeCore("spiller", data, "plan-2026")).ok, false);
  }
  assert.equal(reads, 0); assert.equal(writes, 0);
});
test("historiske kall uten plan-ID beholder kalenderårsvalg og eksisterende periodetilknytning", async () => {
  assert.equal((await actions.saveSeasonPeriod({ playerId: "spiller", data: nyPeriode })).ok, true);
  assert.equal(blokker.at(-1)?.seasonPlanId, "plan-2027");
  assert.equal((await actions.saveSeasonPeriod({ playerId: "spiller", periodId: "periode-2026", data: nyPeriode })).ok, true);
  assert.equal(blokker[0].seasonPlanId, "plan-2026"); assert.equal(txOptions, undefined);
});
test("historisk første periode autooppretter fremdeles årsplan ved manglende kalenderår", async () => {
  assert.equal((await core.opprettPeriodeCore("spiller", { ...nyPeriode, startDato: "2028-01-04", sluttDato: "2028-02-28" })).ok, true);
  assert.equal(planer.at(-1)?.year, 2028); assert.equal(blokker.at(-1)?.seasonPlanId, "ny-plan");
});
test("action avviser fremmed spiller og coach uten tilgang før database; autorisert coach kan lagre", async () => {
  me = { id: "fremmed", role: "PLAYER" };
  assert.equal((await actions.saveSeasonPeriod({ playerId: "spiller", seasonPlanId: "plan-2026", data: nyPeriode })).ok, false);
  me = { id: "coach", role: "COACH" };
  assert.equal((await actions.saveSeasonPeriod({ playerId: "spiller", seasonPlanId: "plan-2026", data: nyPeriode })).ok, false);
  assert.equal(reads, 0); assert.equal(writes, 0);
  coachTilgang = true;
  assert.equal((await actions.saveSeasonPeriod({ playerId: "spiller", seasonPlanId: "plan-2026", data: nyPeriode })).ok, true);
});
test("ny eksplisitt plansti avviser PARENT/GUEST selv ved egen ID før database", async () => {
  for (const role of ["PARENT", "GUEST"]) {
    me = { id: "spiller", role };
    assert.equal((await actions.saveSeasonPeriod({ playerId: "spiller", seasonPlanId: "plan-2026", data: nyPeriode })).ok, false);
  }
  assert.equal(reads, 0); assert.equal(writes, 0);
});
test("transaksjonskonflikt gir ingen bekreftet lagring eller revalidering og samme input kan gjentas", async () => {
  txFeil = true;
  assert.equal((await actions.saveSeasonPeriod({ playerId: "spiller", seasonPlanId: "plan-2026", data: nyPeriode })).ok, false);
  assert.equal(writes, 0); assert.equal(revalidert.length, 0);
  txFeil = false;
  assert.equal((await actions.saveSeasonPeriod({ playerId: "spiller", seasonPlanId: "plan-2026", data: nyPeriode })).ok, true);
  assert.equal(writes, 1);
});
