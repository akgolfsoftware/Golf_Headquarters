import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";
import type { Prisma } from "@/generated/prisma/client";

let kategori: string | null = "H";
let tom = false;
const kall: Prisma.PlanTemplateFindManyArgs[] = [];
const mal = (id: string) => ({
  id, name: "Syntetisk mal", description: null, kategori: "H", lPhase: "TURNERING",
  varighetUker: 1, ukentligOktAntall: 3, disciplinFordeling: { SPILL: 1 }, usageCount: 4,
  get effectivenessAvg() { throw Error("Gammel effekt må ikke leses"); },
});
function kontroller(args: Prisma.PlanTemplateFindManyArgs) {
  kall.push(args);
  assert.equal(args.where?.approved, true, "utkast skal ikke kunne anbefales");
  assert.ok(args.select, "bruk en eksplisitt feltliste");
  assert.equal(args.select.effectivenessAvg, undefined);
  assert.equal(args.select.effectiveness, undefined);
  assert.deepEqual(args.orderBy, [{ usageCount: "desc" }, { name: "asc" }, { id: "asc" }]);
}
mock.module("@/lib/prisma", { namedExports: { prisma: {
  wagrSnapshot: { findUnique: async () => null },
  periodBlock: { findFirst: async () => ({ lPhase: "SPESIAL" }) },
  planTemplate: {
    findFirst: async (args: Prisma.PlanTemplateFindFirstArgs) => { kontroller(args); return tom ? null : mal("valgt"); },
    findMany: async (args: Prisma.PlanTemplateFindManyArgs) => { kontroller(args); return tom ? [] : [mal("valgt"), mal("alternativ")]; },
  },
} } });
mock.module("@/lib/domain/spiller-kategori", { namedExports: {
  hentSpillerAkKategori: async () => kategori, akTilNgfKategori: (k: string) => k,
} });
mock.module("@/lib/ai-plan/generate", { namedExports: { genererPlan() { throw Error("Ingen sky-modell i anbefalingsprøven"); } } });
mock.module("@/lib/workbench/v2-sync", { namedExports: { upsertV2ForPlanSession() { throw Error("Ingen skriving"); } } });
let anbefal: typeof import("./index").anbefalMalCore;
before(async () => { ({ anbefalMalCore: anbefal } = await import("./index")); });
beforeEach(() => { kall.length = 0; kategori = "H"; tom = false; });
const spiller = { id: "syntetisk-spiller", name: "Test", hcp: 8, tier: "PRO" };

test("turneringsvalg bruker godkjente maler i riktig kategori/fase, uten felles effekttall", async () => {
  const res = await anbefal(spiller, { maltype: "TURNERING" });
  assert.deepEqual(kall[0].where, { kategori: "H", lPhase: "TURNERING", approved: true });
  assert.deepEqual(kall[1].where, { kategori: "H", approved: true });
  assert.equal(res.anbefalt?.templateId, "valgt");
  assert.deepEqual(res.alternativer.map(a => a.templateId), ["alternativ"]);
  assert.ok(!JSON.stringify(res).includes("effectiveness"));
});
test("aktiv planfase beholdes uten å bruke udokumentert effekt som rangering", async () => {
  await anbefal(spiller, { maltype: "GENERELL" });
  assert.equal(kall[0].where?.lPhase, "SPESIAL");
});
test("ingen godkjente maler gir tomt svar, ikke tilbakefall til utkast", async () => {
  tom = true;
  assert.deepEqual(await anbefal(spiller, { maltype: "GENERELL" }), { anbefalt: null, alternativer: [] });
});
test("ukjent kategori gir ikke gjettet anbefaling eller felles maloppslag", async () => {
  kategori = null;
  assert.deepEqual(await anbefal(spiller, { maltype: "GENERELL" }), { anbefalt: null, alternativer: [] });
  assert.equal(kall.length, 0);
});
