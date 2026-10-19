import assert from "node:assert/strict";
import { mock, test } from "node:test";

let roundReads = 0;
mock.module("@/lib/prisma", { namedExports: { prisma: {
  datagolfTak: { findUnique: async () => ({ dgPlayerId: 1, name: "Hovland, Viktor", primaryTour: "pga", dgRank: 9, asOf: new Date("2026-10-12"),
    sgTotal: 1.9, sgOtt: 0.6, sgApp: 0.9, sgArg: 0.2, sgPutt: 0.2, bands: [] }) },
  pgaPlayerSeason: { findMany: async () => [] },
} } });
mock.module("@/lib/admin/datagolf/coach-data", { namedExports: {
  hentKatalog: async () => ({ rader: [{ dgId: 1, navn: "Viktor Hovland", land: "NOR", tour: "pga", sgTotal: 1.9, dgRang: 9, owgr: 9, norsk: true }], turer: ["pga"] }),
  visNavn: (n: string) => n,
} });

const tx = {
  round: { findMany: async () => { roundReads++; return []; } },
  planAction: { findMany: async () => [] },
};
const spillere = [{ id: "spiller-a", navn: "Spiller A" }];

async function mod() { return import("./spiller-mot-proff-data"); }

test("DG-05: en spiller (ikke coach) avvises og ingen spillerdata leses", async () => {
  roundReads = 0; let delingSpurt = false;
  const { hentDgSpillerVisning } = await mod();
  for (const role of ["PLAYER", "PARENT", "GUEST"] as const) {
    const v = await hentDgSpillerVisning({ bruker: { id: "spiller-b", role }, spillere, spillerId: "spiller-a",
      medSpiller: async (_id, les) => { delingSpurt = true; return les(tx as never); } });
    assert.equal(v, null, role);
  }
  assert.equal(delingSpurt, false); assert.equal(roundReads, 0);
});

test("DG-05: treneren får bare tall for en spiller som deler (medSpiller gir null = ingen deling)", async () => {
  roundReads = 0;
  const { hentDgSpillerVisning } = await mod();
  const uten = await hentDgSpillerVisning({ bruker: { id: "trener", role: "ADMIN" }, spillere, spillerId: "spiller-a", medSpiller: async () => null });
  assert.equal(uten?.spiller, null); assert.equal(uten?.gap, null); assert.equal(uten?.proff?.navn, "Hovland, Viktor");
  const ukjent = await hentDgSpillerVisning({ bruker: { id: "trener", role: "ADMIN" }, spillere, spillerId: "ikke-delt",
    medSpiller: async (_id, les) => les(tx as never) });
  assert.equal(ukjent?.spiller, null); assert.equal(roundReads, 0);
  const med = await hentDgSpillerVisning({ bruker: { id: "trener", role: "ADMIN" }, spillere, spillerId: "spiller-a",
    medSpiller: async (_id, les) => les(tx as never) });
  assert.equal(med?.spiller?.id, "spiller-a"); assert.equal(roundReads, 1);
  assert.ok(med?.gap?.rader.every((r) => r.gap === null), "uten runder er alle gap «—»");
});
