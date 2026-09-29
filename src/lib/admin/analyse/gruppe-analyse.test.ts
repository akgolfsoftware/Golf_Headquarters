import test from "node:test";
import assert from "node:assert/strict";
import { byggGruppeAnalyse, type OktInn } from "./gruppe-analyse";

const now = new Date("2026-09-30T12:00:00Z");
const okt = (userId: string, dagerSiden: number, min: number, status: OktInn["status"]): OktInn => ({
  userId,
  scheduledAt: new Date(now.getTime() - dagerSiden * 86_400_000),
  durationMin: min,
  status,
});

test("etterlevelse er gjennomførte minutter delt på forfalte planlagte minutter", () => {
  const d = byggGruppeAnalyse(
    [{ id: "g", navn: "Gruppe A", kategori: "A2", spillerIds: ["p1", "p2"] }],
    [{ id: "p1", navn: "Spiller 1" }, { id: "p2", navn: "Spiller 2" }],
    [okt("p1", 3, 60, "COMPLETED"), okt("p1", 2, 60, "PLANNED"), okt("p2", 5, 30, "COMPLETED")],
    now,
  );
  assert.equal(d.grupper[0].etterlevelsePct, Math.round((90 / 150) * 100));
  assert.equal(d.grupper[0].datadekningPct, 100);
});

test("fremtidige økter teller ikke", () => {
  const d = byggGruppeAnalyse(
    [{ id: "g", navn: "G", kategori: null, spillerIds: ["p1"] }],
    [{ id: "p1", navn: "S" }],
    [okt("p1", -2, 60, "PLANNED")],
    now,
  );
  assert.equal(d.grupper[0].etterlevelsePct, null);
  assert.equal(d.spillere[0].etterlevelsePct, null);
  assert.equal(d.grupper[0].datadekningPct, 0);
});

test("tom gruppe gir null, ikke 0", () => {
  const d = byggGruppeAnalyse([{ id: "g", navn: "G", kategori: null, spillerIds: [] }], [], [], now);
  assert.equal(d.grupper[0].datadekningPct, null);
  assert.equal(d.grupper[0].etterlevelsePct, null);
  assert.equal(d.samlet.etterlevelsePct, null);
});

test("rader sorteres alfabetisk, aldri etter tall", () => {
  const d = byggGruppeAnalyse(
    [],
    [{ id: "b", navn: "Bjørn" }, { id: "a", navn: "Anna" }],
    [okt("b", 1, 60, "COMPLETED"), okt("a", 1, 60, "SKIPPED")],
    now,
  );
  assert.deepEqual(d.spillere.map((s) => s.navn), ["Anna", "Bjørn"]);
});
