import assert from "node:assert/strict";
import { mock, test } from "node:test";

const brukerId = "syntetisk-spiller-a";
const generertFra = "syntetisk-plan-speil";
type Rad = { id: string; status: string; title: string; eierId: string; generertFra?: string | null; generertFraId?: string | null };
type Args = { where: { id?: string; status?: string; plan?: { userId: string }; studentId?: string; generertFra?: string; generertFraId?: string }; data: { status: string } };
let plan: Rad | null;
let v2: Rad | null;
let speilFeiler: boolean;
let mistetStatusRace: boolean;
let varselFeiler: boolean;
let tilgangFeiler: boolean;
let transaksjoner: number;
let tilgangskall: number;
let varsler: unknown[];
let revalideringer: string[];
let skrivinger: Array<{ modell: string; args: Args }>;

mock.module("next/cache", { namedExports: { revalidatePath: (path: string) => { revalideringer.push(path); } } });
mock.module("@/lib/auth/requirePortalUser", { namedExports: { requirePortalUser: async () => {
  tilgangskall++;
  if (tilgangFeiler) throw new Error("Syntetisk avvist tilgang");
  return { id: brukerId, name: "Testspiller" };
} } });
mock.module("@/lib/workbench/v2-sync", { namedExports: {
  GENERERT_FRA: generertFra,
  resolveCoachIdForPlayer: async () => "syntetisk-coach",
} });
mock.module("@/lib/prisma", { namedExports: { prisma: {
  $transaction: async (callback: (tx: unknown) => Promise<unknown>) => {
    transaksjoner++;
    // Modell av transaksjonsgrensen: kopier blir først synlige ved commit.
    const state = { plan: plan ? { ...plan } : null, v2: v2 ? { ...v2 } : null };
    let writes = 0;
    const model = (key: "plan" | "v2") => ({
      findFirst: async ({ where }: Args) => {
        const rad = state[key];
        if (!rad || rad.id !== where.id || rad.eierId !== (where.plan?.userId ?? where.studentId)) return null;
        return { ...rad };
      },
      updateMany: async (args: Args) => {
        writes++;
        skrivinger.push({ modell: key, args });
        if (writes === 1 && mistetStatusRace) return { count: 0 };
        if (writes === 2 && speilFeiler) throw new Error("Syntetisk speilfeil");
        const rad = state[key];
        if (!rad || (args.where.id && rad.id !== args.where.id)) return { count: 0 };
        if (args.where.status && rad.status !== args.where.status) return { count: 0 };
        if (args.where.generertFra && rad.generertFra !== args.where.generertFra) return { count: 0 };
        if (args.where.generertFraId && rad.generertFraId !== args.where.generertFraId) return { count: 0 };
        if (args.where.plan && rad.eierId !== args.where.plan.userId) return { count: 0 };
        rad.status = args.data.status;
        return { count: 1 };
      },
    });
    const res = await callback({ trainingPlanSession: model("plan"), trainingSessionV2: model("v2") });
    plan = state.plan; v2 = state.v2;
    return res;
  },
  notification: { create: async (input: unknown) => {
    if (varselFeiler) throw new Error("Syntetisk varselfeil");
    varsler.push(input);
  } },
} } });

test.beforeEach(() => {
  plan = { id: "plan-test", title: "Testøkt", status: "PLANNED", eierId: brukerId };
  v2 = { id: "v2-test", title: "Testøkt", status: "PLANNED", eierId: brukerId, generertFra, generertFraId: "plan-test" };
  speilFeiler = mistetStatusRace = varselFeiler = tilgangFeiler = false;
  transaksjoner = tilgangskall = 0;
  varsler = []; revalideringer = []; skrivinger = [];
});

for (const kilde of ["plan", "v2"] as const) {
  const id = `${kilde}-test`;
  for (const status of ["COMPLETED", "SKIPPED"] as const) {
    test(`${kilde}: ${status} lagres på begge sider og nytt forsøk er idempotent`, async () => {
      const { markerOktStatus } = await import("./okt-status-actions");
      assert.deepEqual(await markerOktStatus({ id, kilde, status }), { ok: true });
      assert.equal(plan?.status, status);
      assert.equal(v2?.status, status);
      assert.equal(varsler.length, status === "SKIPPED" ? 1 : 0);
      assert.equal(skrivinger[0].args.where.status, "PLANNED");
      await markerOktStatus({ id, kilde, status });
      assert.equal(skrivinger.length, 2);
      assert.equal(varsler.length, status === "SKIPPED" ? 1 : 0);
    });
  }
  test(`${kilde}: speilfeil ruller tilbake og nytt forsøk fullfører begge sider`, async () => {
    speilFeiler = true;
    const { markerOktStatus } = await import("./okt-status-actions");
    await assert.rejects(() => markerOktStatus({ id, kilde, status: "SKIPPED" }), /speilfeil/);
    assert.equal(plan?.status, "PLANNED");
    assert.equal(v2?.status, "PLANNED");
    assert.equal(varsler.length, 0);
    assert.equal(revalideringer.length, 0);
    speilFeiler = false;
    await markerOktStatus({ id, kilde, status: "SKIPPED" });
    assert.equal(plan?.status, "SKIPPED");
    assert.equal(v2?.status, "SKIPPED");
    assert.equal(varsler.length, 1);
  });
  test(`${kilde}: tapt betinget skriving lager verken speilendring eller varsel`, async () => {
    mistetStatusRace = true;
    const { markerOktStatus } = await import("./okt-status-actions");
    assert.deepEqual(await markerOktStatus({ id, kilde, status: "SKIPPED" }), { ok: true });
    assert.equal(skrivinger.length, 1);
    assert.equal(varsler.length, 0);
    assert.equal(revalideringer.length, 0);
  });
  test(`${kilde}: annen eiers økt avvises uten skriving`, async () => {
    if (kilde === "plan" && plan) plan.eierId = "syntetisk-spiller-b";
    if (kilde === "v2" && v2) v2.eierId = "syntetisk-spiller-b";
    const { markerOktStatus } = await import("./okt-status-actions");
    assert.deepEqual(await markerOktStatus({ id, kilde, status: "COMPLETED" }), { ok: false, error: "Økten finnes ikke" });
    assert.equal(skrivinger.length, 0);
  });
}

test("manglende v2-speil tillater eksisterende planflyt", async () => {
  v2 = null;
  const { markerOktStatus } = await import("./okt-status-actions");
  assert.deepEqual(await markerOktStatus({ id: "plan-test", kilde: "plan", status: "COMPLETED" }), { ok: true });
  assert.equal(plan?.status, "COMPLETED");
});

test("selvstendig v2-økt skriver ikke en tilfeldig planøkt", async () => {
  if (v2) v2.generertFra = null;
  const { markerOktStatus } = await import("./okt-status-actions");
  await markerOktStatus({ id: "v2-test", kilde: "v2", status: "COMPLETED" });
  assert.equal(v2?.status, "COMPLETED");
  assert.equal(plan?.status, "PLANNED");
});

test("varselfeil etter commit ruller ikke tilbake økten", async () => {
  varselFeiler = true;
  const { markerOktStatus } = await import("./okt-status-actions");
  assert.deepEqual(await markerOktStatus({ id: "plan-test", kilde: "plan", status: "SKIPPED" }), { ok: true });
  assert.equal(plan?.status, "SKIPPED");
  assert.equal(v2?.status, "SKIPPED");
  assert.ok(revalideringer.includes("/portal"));
});

test("ugyldig input og avvist tilgang skriver ingenting", async () => {
  const { markerOktStatus } = await import("./okt-status-actions");
  assert.equal((await markerOktStatus({ id: "", kilde: "plan", status: "COMPLETED" })).ok, false);
  assert.equal(tilgangskall, 0);
  tilgangFeiler = true;
  await assert.rejects(() => markerOktStatus({ id: "plan-test", kilde: "plan", status: "COMPLETED" }));
  assert.equal(transaksjoner, 0);
});
