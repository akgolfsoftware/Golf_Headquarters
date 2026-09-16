/**
 * R-I: admin/(legacy)/services/actions.ts. Tjenestetyper (priser/varighet
 * som vises på booking-siden) er en delt admin-ressurs uten per-coach
 * eierskap — vernet er rollegrensen (`requireCoachActionUser`) alene. Alle
 * tre handlinger skal avvise PLAYER/uinnlogget uten å skrive. Dekker også
 * `createService` sin unik-slug-logikk: kolliderer den normaliserte
 * slug-en med en eksisterende, appendes `-2`, `-3` osv. til den er ledig.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";

let bruker: { id: string; role: Rolle; name: string } | null = {
  id: "coach-a",
  role: "COACH",
  name: "Coach A",
};

/** Slugs som allerede finnes (simulerer unik-constraint-sjekken). */
let opptatteSlugs = new Set<string>();

let serviceCreates: Array<{ slug: string; name: string; priceOre: number }> = [];
let serviceUpdates: Array<{ id: string; data: unknown }> = [];
let serviceDeletes: string[] = [];
let auditWrites: Array<{ action: string }> = [];
let redirectKall: string[] = [];

function nullstill() {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  opptatteSlugs = new Set();
  serviceCreates = [];
  serviceUpdates = [];
  serviceDeletes = [];
  auditWrites = [];
  redirectKall = [];
}

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("next/navigation", {
  namedExports: {
    redirect: (url: string) => {
      redirectKall.push(url);
      throw new Error("NEXT_REDIRECT");
    },
  },
});
mock.module("@/lib/auth/action-guards", {
  namedExports: {
    requireCoachActionUser: async () => {
      if (!bruker) throw new Error("unauthenticated");
      if (bruker.role !== "COACH" && bruker.role !== "ADMIN") throw new Error("forbidden");
      return bruker;
    },
  },
});
mock.module("@/lib/audit", {
  namedExports: {
    audit: async (input: { action: string }) => {
      auditWrites.push(input);
    },
  },
});
const prismaMock: Record<string, unknown> = {};
mock.module("@/lib/prisma", { namedExports: { prisma: prismaMock } });
Object.assign(prismaMock, {
  serviceType: {
    findUnique: async ({ where }: { where: { slug: string } }) =>
      opptatteSlugs.has(where.slug) ? { id: "opptatt", slug: where.slug } : null,
    create: async ({ data }: { data: { slug: string; name: string; priceOre: number } }) => {
      serviceCreates.push(data);
      return { id: "tjeneste-ny" };
    },
    update: async ({ where, data }: { where: { id: string }; data: unknown }) => {
      serviceUpdates.push({ id: where.id, data });
      return { id: where.id };
    },
    delete: async ({ where }: { where: { id: string } }) => {
      serviceDeletes.push(where.id);
      return { id: where.id };
    },
  },
});

async function actions() {
  return import("./actions");
}

const gyldigTjeneste = { name: "60 min privattime", priceOre: 100000, durationMin: 60, active: true };

test.beforeEach(() => {
  nullstill();
});

test("createService avviser PLAYER uten å opprette tjeneste", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { createService } = await actions();
  await assert.rejects(() => createService(gyldigTjeneste));
  assert.equal(serviceCreates.length, 0);
});

test("createService avviser uinnlogget uten å opprette tjeneste", async () => {
  bruker = null;
  const { createService } = await actions();
  await assert.rejects(() => createService(gyldigTjeneste));
  assert.equal(serviceCreates.length, 0);
});

test("createService avviser navn som normaliserer til tom slug", async () => {
  const { createService } = await actions();
  await assert.rejects(() => createService({ ...gyldigTjeneste, name: "!!!" }), /invalid-slug/);
  assert.equal(serviceCreates.length, 0);
});

test("createService oppretter tjeneste med norsk-normalisert slug for COACH", async () => {
  const { createService } = await actions();
  await createService({ ...gyldigTjeneste, name: "Økt på Ærfuglveien" });
  assert.equal(serviceCreates.length, 1);
  // NFD-normalisering dekomponerer å/æ FØR å/æ-reglene kjører, så den
  // kombinerende diakritiske ringen strippes og bare "a" står igjen —
  // "på" blir "pa", ikke "paa". Faktisk oppførsel, ikke ønsket her.
  assert.equal(serviceCreates[0]?.slug, "oekt-pa-aerfuglveien");
  assert.equal(auditWrites.at(-1)?.action, "service.created");
});

test("createService appender -2 når slug allerede finnes", async () => {
  opptatteSlugs.add("60-min-privattime");
  const { createService } = await actions();
  await createService(gyldigTjeneste);
  assert.equal(serviceCreates[0]?.slug, "60-min-privattime-2");
});

test("createService appender videre til -3 når -2 også er opptatt", async () => {
  opptatteSlugs.add("60-min-privattime");
  opptatteSlugs.add("60-min-privattime-2");
  const { createService } = await actions();
  await createService(gyldigTjeneste);
  assert.equal(serviceCreates[0]?.slug, "60-min-privattime-3");
});

test("updateService avviser PLAYER uten å oppdatere", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { updateService } = await actions();
  await assert.rejects(() => updateService("tjeneste-a", gyldigTjeneste));
  assert.equal(serviceUpdates.length, 0);
});

test("updateService avviser uinnlogget uten å oppdatere", async () => {
  bruker = null;
  const { updateService } = await actions();
  await assert.rejects(() => updateService("tjeneste-a", gyldigTjeneste));
  assert.equal(serviceUpdates.length, 0);
});

test("updateService oppdaterer for COACH", async () => {
  const { updateService } = await actions();
  await updateService("tjeneste-a", { ...gyldigTjeneste, priceOre: 150000 });
  assert.equal(serviceUpdates.length, 1);
  assert.equal((serviceUpdates[0]?.data as { priceOre: number }).priceOre, 150000);
});

test("deleteService avviser PLAYER uten å slette", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { deleteService } = await actions();
  await assert.rejects(() => deleteService("tjeneste-a"));
  assert.equal(serviceDeletes.length, 0);
});

test("deleteService avviser uinnlogget uten å slette", async () => {
  bruker = null;
  const { deleteService } = await actions();
  await assert.rejects(() => deleteService("tjeneste-a"));
  assert.equal(serviceDeletes.length, 0);
});

test("deleteService sletter og redirecter for COACH", async () => {
  const { deleteService } = await actions();
  await assert.rejects(() => deleteService("tjeneste-a"), /NEXT_REDIRECT/);
  assert.deepEqual(serviceDeletes, ["tjeneste-a"]);
  assert.deepEqual(redirectKall, ["/admin/services"]);
});
