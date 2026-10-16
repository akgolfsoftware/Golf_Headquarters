/**
 * Tjenester i AgencyOS (bookingplanen steg 2). Tjenestetyper er en delt
 * admin-ressurs uten per-coach eierskap; vernet er rollegrensen
 * `requireCoachActionUser` alene. Alle handlinger avviser PLAYER og
 * uinnlogget uten å skrive. COACH kan opprette (med unik, norsk-normalisert
 * slug), endre, slå av og slette; sletting avvises når bookinger finnes.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";

let bruker: { id: string; role: Rolle; name: string } | null = null;
let opptatteSlugs = new Set<string>();
let creates: Array<Record<string, unknown>> = [];
let updates: Array<{ id: string; data: Record<string, unknown> }> = [];
let deletes: string[] = [];
let auditWrites: Array<{ action: string }> = [];
let antallBookinger = 0;
let kjenteCoacher = new Set<string>(["coach-a"]);
let kjenteSteder = new Set<string>(["sted-gfgk"]);

function nullstill() {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  opptatteSlugs = new Set();
  creates = [];
  updates = [];
  deletes = [];
  auditWrites = [];
  antallBookinger = 0;
  kjenteCoacher = new Set(["coach-a"]);
  kjenteSteder = new Set(["sted-gfgk"]);
}

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
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
  namedExports: { audit: async (input: { action: string }) => { auditWrites.push(input); } },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      serviceType: {
        findUnique: async ({ where }: { where: { slug: string } }) =>
          opptatteSlugs.has(where.slug) ? { id: "opptatt" } : null,
        create: async ({ data }: { data: Record<string, unknown> }) => { creates.push(data); return { id: "tjeneste-ny" }; },
        update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => { updates.push({ id: where.id, data }); return { id: where.id }; },
        delete: async ({ where }: { where: { id: string } }) => { deletes.push(where.id); return { id: where.id }; },
      },
      user: {
        findFirst: async ({ where }: { where: { id: string } }) => (kjenteCoacher.has(where.id) ? { id: where.id } : null),
      },
      location: {
        findUnique: async ({ where }: { where: { id: string } }) => (kjenteSteder.has(where.id) ? { id: where.id } : null),
      },
      booking: { count: async () => antallBookinger },
    },
  },
});

async function actions() {
  return import("./tjeneste-actions");
}

const gyldig = {
  name: "Flex 50 min",
  description: "",
  priceOre: 150000,
  durationMin: 50,
  maxDeltakere: 1,
  coachUserId: null,
  locationId: "sted-gfgk",
  kategori: "drop-in",
  bufferForMin: 10,
  bufferEtterMin: 5,
  minVarselTimer: 24,
  maksDagerFram: 14,
  active: true,
};

test.beforeEach(() => nullstill());

test("opprettTjeneste avviser PLAYER uten å opprette", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { opprettTjeneste } = await actions();
  await assert.rejects(() => opprettTjeneste(gyldig));
  assert.equal(creates.length, 0);
});

test("opprettTjeneste avviser uinnlogget uten å opprette", async () => {
  bruker = null;
  const { opprettTjeneste } = await actions();
  await assert.rejects(() => opprettTjeneste(gyldig));
  assert.equal(creates.length, 0);
});

test("opprettTjeneste lagrer alle feltene med norsk-normalisert slug for COACH", async () => {
  const { opprettTjeneste } = await actions();
  const res = await opprettTjeneste({ ...gyldig, name: "Økt på Ærfuglveien" });
  assert.deepEqual(res, { ok: true, id: "tjeneste-ny" });
  assert.equal(creates.length, 1);
  const data = creates[0]!;
  assert.equal(data.slug, "oekt-pa-aerfuglveien");
  assert.equal(data.locationId, "sted-gfgk");
  assert.equal(data.bufferForMin, 10);
  assert.equal(data.bufferEtterMin, 5);
  assert.equal(data.minVarselTimer, 24);
  assert.equal(data.maksDagerFram, 14);
  assert.equal(data.kategori, "drop-in");
  assert.equal(data.description, null);
  assert.equal(auditWrites.at(-1)?.action, "service.created");
});

test("opprettTjeneste appender -2 og -3 når slug er opptatt", async () => {
  opptatteSlugs.add("flex-50-min");
  opptatteSlugs.add("flex-50-min-2");
  const { opprettTjeneste } = await actions();
  await opprettTjeneste(gyldig);
  assert.equal(creates[0]?.slug, "flex-50-min-3");
});

test("opprettTjeneste avviser ukjent sted, ukjent coach og ukjent kategori uten å skrive", async () => {
  const { opprettTjeneste } = await actions();
  const sted = await opprettTjeneste({ ...gyldig, locationId: "finnes-ikke" });
  assert.deepEqual(sted, { ok: false, feil: "Stedet finnes ikke." });
  const coach = await opprettTjeneste({ ...gyldig, coachUserId: "finnes-ikke" });
  assert.deepEqual(coach, { ok: false, feil: "Coachen finnes ikke." });
  const kategori = await opprettTjeneste({ ...gyldig, kategori: "tull" });
  assert.equal(kategori.ok, false);
  const navn = await opprettTjeneste({ ...gyldig, name: "!!!" });
  assert.equal(navn.ok, false);
  assert.equal(creates.length, 0);
});

test("oppdaterTjeneste avviser PLAYER og uinnlogget uten å oppdatere", async () => {
  const { oppdaterTjeneste } = await actions();
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  await assert.rejects(() => oppdaterTjeneste("tjeneste-a", gyldig));
  bruker = null;
  await assert.rejects(() => oppdaterTjeneste("tjeneste-a", gyldig));
  assert.equal(updates.length, 0);
});

test("oppdaterTjeneste oppdaterer for COACH og rører ikke slug", async () => {
  const { oppdaterTjeneste } = await actions();
  const res = await oppdaterTjeneste("tjeneste-a", { ...gyldig, priceOre: 170000, maxDeltakere: 2 });
  assert.deepEqual(res, { ok: true, id: "tjeneste-a" });
  assert.equal(updates.length, 1);
  assert.equal(updates[0]?.data.priceOre, 170000);
  assert.equal(updates[0]?.data.maxDeltakere, 2);
  assert.equal("slug" in updates[0]!.data, false);
  assert.equal(auditWrites.at(-1)?.action, "service.updated");
});

test("settTjenesteAktiv avviser PLAYER, og slår av for COACH", async () => {
  const { settTjenesteAktiv } = await actions();
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  await assert.rejects(() => settTjenesteAktiv("tjeneste-a", false));
  nullstill();
  await settTjenesteAktiv("tjeneste-a", false);
  assert.deepEqual(updates, [{ id: "tjeneste-a", data: { active: false } }]);
  assert.equal(auditWrites.at(-1)?.action, "service.deactivated");
});

test("slettTjeneste avviser uinnlogget, nekter når bookinger finnes, og sletter ellers", async () => {
  const { slettTjeneste } = await actions();
  bruker = null;
  await assert.rejects(() => slettTjeneste("tjeneste-a"));
  nullstill();
  antallBookinger = 3;
  const nekt = await slettTjeneste("tjeneste-a");
  assert.equal(nekt.ok, false);
  assert.equal(deletes.length, 0);
  antallBookinger = 0;
  const ok = await slettTjeneste("tjeneste-a");
  assert.deepEqual(ok, { ok: true, id: "tjeneste-a" });
  assert.deepEqual(deletes, ["tjeneste-a"]);
});
