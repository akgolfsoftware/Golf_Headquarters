import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";

type Stored = { id: string; planId: string; log: { drillAggregates: unknown } };
let rows = new Map<string, Stored>();
let writes = 0;
let fail = false;
let viewer = "spiller-a";
let invalidReference = false;
mock.module("@/lib/auth/requirePortalUser", { namedExports: { requirePortalUser: async () => ({ id: viewer }) } });
mock.module("next/cache", { namedExports: { revalidatePath: () => {} } });
mock.module("@/lib/datagolf/stasjon-data", { namedExports: { hentStasjonSide: async () => ({
  valgtTak: { dgPlayerId: 1, name: "Proff A" },
  stasjon: { slag: { etikett: "Innspill" }, maalVerdi: 5, maalEnhet: "m", regel: "Ti baller", kilde: invalidReference ? "mangler" : "datagolf", manglerCarry: false, kildeTekst: "Justert referanse" },
}) } });
mock.module("@/lib/prisma", { namedExports: { prisma: {
  trainingPlanSession: { findFirst: async ({ where }: { where: { id: string; plan: { userId: string } } }) => {
    const r = rows.get(where.id);
    return r?.planId === `datagolf-praksis-${where.plan.userId}` ? r : null;
  } },
  $transaction: async (run: (tx: object) => Promise<unknown>) => {
    const next = new Map(rows);
    const result = await run({ trainingPlan: { upsert: async () => {} }, trainingPlanSession: {
      upsert: async ({ where, create }: { where: { id: string }; create: Omit<Stored, "log"> & { log: { create: Stored["log"] } } }) => {
        if (fail) throw new Error("syntetisk lagringsfeil");
        if (!next.has(where.id)) {
          writes++;
          next.set(where.id, { ...create, log: create.log.create });
        }
        return next.get(where.id);
      },
    } });
    rows = next; return result;
  },
} } });
let save: typeof import("@/app/portal/analysere/datagolf/actions").lagreDataGolfUtfordring;
before(async () => { save = (await import("@/app/portal/analysere/datagolf/actions")).lagreDataGolfUtfordring; });
beforeEach(() => { rows = new Map(); writes = 0; fail = false; viewer = "spiller-a"; invalidReference = false; });
const input = () => ({ attemptId: "e141256c-e12f-45a8-b018-81183a542ac7", tak: 1, slag: "innspill100", carry: 100,
  lie: "fairway", baller: [...Array(4).fill("inne"), ...Array(6).fill("ute")], target: 5,
  startedAt: new Date(Date.now() - 60_000).toISOString() });
test("fullføring og retry gir én lagret økt, endret resultat avvises", async () => {
  const v = input();
  assert.equal((await save(v)).ok, true);
  assert.equal((await save(v)).ok, true);
  assert.equal(writes, 1);
  assert.equal((await save({ ...v, baller: Array(10).fill("inne") })).ok, false);
});
test("annen bruker kan ikke overskrive økten med samme attemptId", async () => {
  const v = input(); await save(v);
  viewer = "spiller-b";
  await save({ ...v, userId: "spiller-a", baller: Array(10).fill("ute") });
  assert.equal(rows.size, 2);
  assert.equal(rows.get(`dg-spiller-a-${v.attemptId}`)?.planId, "datagolf-praksis-spiller-a");
});
test("ufullstendig økt, endret referanse og datamangler skrives ikke", async () => {
  assert.equal((await save({ ...input(), baller: ["inne"] })).ok, false);
  assert.equal((await save({ ...input(), target: 2 })).ok, false);
  invalidReference = true;
  assert.equal((await save(input())).ok, false);
  assert.equal(writes, 0);
});
test("lagringsfeil returnerer feil og kan forsøkes på nytt", async () => {
  const v = input(); fail = true;
  assert.equal((await save(v)).ok, false); assert.equal(rows.size, 0);
  fail = false;
  assert.equal((await save(v)).ok, true); assert.equal(rows.size, 1);
});
