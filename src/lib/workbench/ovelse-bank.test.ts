import assert from "node:assert/strict";
import { before, mock, test } from "node:test";

type Rad = Record<string, unknown> & { id: string };
const bank: Rad[] = [];
const drillRader = [{ exerciseId: "system-1" }, { exerciseId: "system-1" }, { exerciseId: "egen-1" }, { exerciseId: null }];
let sisteDrillWhere: unknown = null;

const db = {
  exerciseDefinition: {
    create: async ({ data }: { data: Record<string, unknown> }) => { const rad = { id: `ny-${bank.length + 1}`, ...data }; bank.push(rad); return { id: rad.id }; },
    findMany: async () => bank.map((r) => ({ id: r.id, name: r.name, pyramidArea: r.pyramidArea, omraadeKode: r.omraadeKode ?? null,
      skillArea: r.skillArea ?? null, source: r.source, createdBy: r.createdBy ?? null, durationMin: r.durationMin ?? null })),
  },
  workbenchDrill: { findMany: async ({ where }: { where: unknown }) => { sisteDrillWhere = where; return drillRader; } },
};
mock.module("@/lib/prisma", { namedExports: { prisma: db } });
mock.module("./bank-referanser", { namedExports: { bankOvelseWhere: async () => ({}) } });

let api: typeof import("./ovelse-bank");
before(async () => { api = await import("./ovelse-bank"); });

const ovelse = {
  title: "Innspill 120 m, tre lengder",
  description: "Tre lengder, ti slag hver",
  durationMinutes: 25,
  videoUrl: "https://video.example/innspill",
  akFormel: { pyramid: "SLAG" as const, area: "INNSPILL_100" as const, motorikk: "LAV_HAST" as const, press: "ALENE" as const, label: "SLAG · Innspill",
    detaljer: { hastighetProsent: 75 as const, maaleutstyr: "MED_TRACKMAN" as const, mengde: { enhet: "SLAG" as const, antall: 30 }, mal: { malsetning: "7 av 10 innenfor 5 m" } } },
};

test("spillerens nye øvelse havner i banken som PLAYER/PRIVATE med spilleren som eier", async () => {
  const p = api.NyBankOvelseSchema.parse(ovelse);
  const { id } = await api.opprettBankOvelse({ id: "spiller-1", role: "PLAYER" }, "spiller-1", p);
  const rad = bank.find((r) => r.id === id)!;
  assert.equal(rad.source, "PLAYER");
  assert.equal(rad.visibility, "PRIVATE");
  assert.equal(rad.createdBy, "spiller-1");
  assert.equal(rad.name, "Innspill 120 m, tre lengder");
  assert.equal(rad.pyramidArea, "SLAG");
  assert.equal(rad.omraadeKode, "INNSPILL_100");
  assert.equal(rad.motorikk, "LAV_HAST");
  assert.equal(rad.press, "ALENE");
  assert.equal(rad.videoUrl, "https://video.example/innspill");
  assert.equal(rad.durationMin, 25);
  const detaljer = (rad.parametersJson as { akFormelV2: { detaljer: Record<string, unknown> } }).akFormelV2.detaljer;
  assert.equal(detaljer.maaleutstyr, "MED_TRACKMAN");
  assert.deepEqual(detaljer.mal, { malsetning: "7 av 10 innenfor 5 m" });
});

test("coachens nye øvelse havner i banken som COACH/COACH_PLAYERS med coachen som eier", async () => {
  const p = api.NyBankOvelseSchema.parse({ ...ovelse, videoUrl: "", akFormel: { pyramid: "TEK", area: "TEE", label: "TEK · Utslag" } });
  const { id } = await api.opprettBankOvelse({ id: "coach-1", role: "COACH" }, "spiller-1", p);
  const rad = bank.find((r) => r.id === id)!;
  assert.equal(rad.source, "COACH");
  assert.equal(rad.visibility, "COACH_PLAYERS");
  assert.equal(rad.createdBy, "coach-1");
  assert.equal(rad.videoUrl, null);
  assert.equal(rad.omraadeKode, "TEE_TOTAL", "Workbench-området TEE lagres som bankens TEE_TOTAL");
});

test("skjemaet avviser tomt navn og video uten https", () => {
  assert.equal(api.NyBankOvelseSchema.safeParse({ ...ovelse, title: " " }).success, false);
  assert.equal(api.NyBankOvelseSchema.safeParse({ ...ovelse, videoUrl: "http://usikker.example" }).success, false);
  assert.equal(api.NyBankOvelseSchema.safeParse({ ...ovelse, videoUrl: "javascript:alert(1)" }).success, false);
});

test("velgeren teller bruk i spillerens økter (ikke maler) og merker spillerens egne øvelser", async () => {
  bank.push({ id: "system-1", name: "Wedge til tre lengder", pyramidArea: "SLAG", source: "SYSTEM", omraadeKode: "PITCH" });
  bank.push({ id: "egen-1", name: "Chip til tre mål", pyramidArea: "SLAG", source: "PLAYER", createdBy: "spiller-1" });
  const liste = await api.hentVelgerOvelser({ id: "coach-1", role: "COACH" }, "spiller-1");
  assert.deepEqual(sisteDrillWhere, { exerciseId: { not: null }, session: { playerId: "spiller-1", isTemplate: false } });
  assert.equal(liste.find((o) => o.id === "system-1")?.brukt, 2);
  assert.equal(liste.find((o) => o.id === "egen-1")?.brukt, 1);
  assert.equal(liste.find((o) => o.id === "egen-1")?.egen, true);
  assert.equal(liste.find((o) => o.id === "system-1")?.egen, false);
  assert.equal(liste.find((o) => o.id === "system-1")?.omraade, "Pitch");
});
// Ingen ekte konto, bankrad eller database benyttes i disse enhetsprøvene.
