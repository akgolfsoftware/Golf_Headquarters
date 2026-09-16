/**
 * R-I: admin/settings/periode-navn/actions.ts. Delt admin-ressurs (fri-
 * tekst-periodenavn koblet til periodetype) uten per-coach eierskap —
 * vernet er rollegrensen alene, for alle tre handlinger. `normaliserNavn`/
 * `ukjenteNavn` (rene funksjoner) importeres direkte. Dekker at oppslaget
 * beregner «ukjente navn» riktig (ekskluderer navn som allerede har en
 * lagret mapping) og at lagring/sletting normaliserer navnet (trim +
 * lowercase) før det brukes som nøkkel.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";

let bruker: { id: string; role: Rolle; name: string } | null = {
  id: "coach-a",
  role: "COACH",
  name: "Coach A",
};

let mappinger: Array<{ navn: string; periodeType: string }> = [
  { navn: "sommersamling", periodeType: "TRENINGSSAMLING" },
];
let perioder: Array<{ name: string }> = [
  { name: "Sommersamling" }, // gjenkjent via mapping over
  { name: "Vintertreff" }, // ukjent
  { name: "GRUNN" }, // gjenkjent av den hardkodede ordboken (periode-navn.ts)
];

let upserts: Array<{ where: { navn: string }; create: unknown; update: unknown }> = [];
let deletes: Array<{ navn: string }> = [];
let auditWrites: Array<{ action: string; target: string }> = [];

function nullstill() {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  mappinger = [{ navn: "sommersamling", periodeType: "TRENINGSSAMLING" }];
  perioder = [{ name: "Sommersamling" }, { name: "Vintertreff" }, { name: "GRUNN" }];
  upserts = [];
  deletes = [];
  auditWrites = [];
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
  namedExports: {
    audit: async (input: { action: string; target: string }) => {
      auditWrites.push(input);
    },
  },
});
const prismaMock: Record<string, unknown> = {};
mock.module("@/lib/prisma", { namedExports: { prisma: prismaMock } });
Object.assign(prismaMock, {
  periodeNavnMapping: {
    findMany: async () => mappinger,
    upsert: async (input: { where: { navn: string }; create: unknown; update: unknown }) => {
      upserts.push(input);
      return { navn: input.where.navn };
    },
    deleteMany: async ({ where }: { where: { navn: string } }) => {
      deletes.push(where);
      return { count: 1 };
    },
  },
  trainingPeriod: {
    findMany: async () => perioder,
  },
});

async function actions() {
  return import("./actions");
}

test.beforeEach(() => {
  nullstill();
});

test("hentPeriodeNavnOversikt avviser PLAYER", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { hentPeriodeNavnOversikt } = await actions();
  await assert.rejects(() => hentPeriodeNavnOversikt());
});

test("hentPeriodeNavnOversikt avviser uinnlogget", async () => {
  bruker = null;
  const { hentPeriodeNavnOversikt } = await actions();
  await assert.rejects(() => hentPeriodeNavnOversikt());
});

test("hentPeriodeNavnOversikt returnerer lagrede mappinger med label og kun reelt ukjente navn", async () => {
  const { hentPeriodeNavnOversikt } = await actions();
  const oversikt = await hentPeriodeNavnOversikt();
  assert.equal(oversikt.lagrede.length, 1);
  assert.equal(oversikt.lagrede[0]?.periodeTypeLabel, "Treningssamling");
  // "Sommersamling" er dekket av mappingen, "GRUNN" er hardkodet kjent —
  // kun "Vintertreff" skal stå igjen som ukjent.
  assert.deepEqual(oversikt.ukjente, ["Vintertreff"]);
});

test("leggTilPeriodeNavnMapping avviser PLAYER uten å lagre", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { leggTilPeriodeNavnMapping } = await actions();
  await assert.rejects(() => leggTilPeriodeNavnMapping({ navn: "Høstsamling", periodeType: "TRENINGSSAMLING" }));
  assert.equal(upserts.length, 0);
});

test("leggTilPeriodeNavnMapping avviser uinnlogget uten å lagre", async () => {
  bruker = null;
  const { leggTilPeriodeNavnMapping } = await actions();
  await assert.rejects(() => leggTilPeriodeNavnMapping({ navn: "Høstsamling", periodeType: "TRENINGSSAMLING" }));
  assert.equal(upserts.length, 0);
});

test("leggTilPeriodeNavnMapping avviser ugyldig periodeType", async () => {
  const { leggTilPeriodeNavnMapping } = await actions();
  await assert.rejects(() =>
    leggTilPeriodeNavnMapping({ navn: "Høstsamling", periodeType: "UKJENT" as never }),
  );
  assert.equal(upserts.length, 0);
});

test("leggTilPeriodeNavnMapping normaliserer navnet (trim + lowercase) som upsert-nøkkel", async () => {
  const { leggTilPeriodeNavnMapping } = await actions();
  const svar = await leggTilPeriodeNavnMapping({ navn: "  Høstsamling  ", periodeType: "TRENINGSSAMLING" });
  assert.equal(svar.ok, true);
  assert.equal(upserts.length, 1);
  assert.equal(upserts[0]?.where.navn, "høstsamling");
  assert.equal(auditWrites.at(-1)?.action, "periode_navn_mapping.lagret");
});

test("slettPeriodeNavnMapping avviser PLAYER uten å slette", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { slettPeriodeNavnMapping } = await actions();
  await assert.rejects(() => slettPeriodeNavnMapping("Sommersamling"));
  assert.equal(deletes.length, 0);
});

test("slettPeriodeNavnMapping avviser uinnlogget uten å slette", async () => {
  bruker = null;
  const { slettPeriodeNavnMapping } = await actions();
  await assert.rejects(() => slettPeriodeNavnMapping("Sommersamling"));
  assert.equal(deletes.length, 0);
});

test("slettPeriodeNavnMapping normaliserer navnet før sletting", async () => {
  const { slettPeriodeNavnMapping } = await actions();
  const svar = await slettPeriodeNavnMapping("  Sommersamling  ");
  assert.equal(svar.ok, true);
  assert.equal(deletes[0]?.navn, "sommersamling");
  assert.equal(auditWrites.at(-1)?.action, "periode_navn_mapping.slettet");
});
