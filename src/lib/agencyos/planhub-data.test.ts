import assert from "node:assert/strict";
import { before, mock, test } from "node:test";
import type { Prisma } from "@/generated/prisma/client";
let sporring: Prisma.PlanTemplateFindManyArgs | undefined;
const mal = {
  id: "syntetisk-mal", name: "Testmal", description: null, kategori: "H", lPhase: "GRUNN",
  varighetUker: 1, ukentligOktAntall: 3, usageCount: 2, approved: false,
  disciplinFordeling: { SPILL: 1 }, sessions: [],
  get effectivenessAvg() { throw Error("Effekttall må ikke leses"); },
  _count: { sessions: 0, get effectiveness() { throw Error("Ikke tell andre spilleres evalueringer"); } },
};
mock.module("@/lib/prisma", { namedExports: { prisma: {
  user: { findMany: async () => [] },
  workbenchSession: { findMany: async () => [], findFirst: async () => null },
  planTemplate: { findMany: async (args: Prisma.PlanTemplateFindManyArgs) => { sporring = args; return [mal]; } },
  oktMal: { findMany: async () => [] },
  exerciseDefinition: { findMany: async () => [], count: async () => 0 },
} } });
let hent: typeof import("./planhub-data").hentPlanhub;
before(async () => { ({ hentPlanhub: hent } = await import("./planhub-data")); });
test("maladministrasjon beholder utkast og bruksantall uten å hente eller sende felles effekt", async () => {
  const res = await hent({ id: "syntetisk-coach", role: "COACH" });
  assert.ok(sporring?.select);
  assert.equal(sporring.select.effectivenessAvg, undefined);
  assert.deepEqual(sporring.select._count, { select: { sessions: true } });
  assert.equal(res.ukemaler[0].godkjent, false, "utkast må fortsatt kunne administreres");
  assert.equal(res.ukemaler[0].usageCount, 2);
  assert.ok(!JSON.stringify(res).includes("effekt"));
});
