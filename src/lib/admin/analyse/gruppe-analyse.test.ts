import test from "node:test";
import assert from "node:assert/strict";
import { byggGruppeAnalyse, gruppeScopeWhere, oktFraWorkbench, type OktInn } from "./gruppe-analyse";

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

test("coach ser grupper der hen er eier ELLER aktivt trener-medlem (som coachScopedPlayerWhere)", () => {
  const w = gruppeScopeWhere({ id: "c1", role: "COACH" });
  assert.deepEqual(w.OR, [
    { coachId: "c1" },
    { members: { some: { userId: "c1", role: { in: ["COACH", "ASSISTANT"] }, endedAt: null } } },
  ]);
  assert.equal(w.arkivertAt, null);
});

test("admin ser alle ikke-arkiverte grupper", () => {
  const w = gruppeScopeWhere({ id: "a1", role: "ADMIN" });
  assert.equal(w.OR, undefined);
  assert.equal(w.arkivertAt, null);
});

test("WorkbenchSession gir samme minutt-regel som Spiller 360 (statuskart og tidspunkt)", () => {
  const dato = new Date(Date.UTC(2026, 8, 28));
  const fullfort = oktFraWorkbench({ playerId: "p", date: dato, startMinute: 600, durationMinutes: 60, status: "COMPLETED" });
  const publisert = oktFraWorkbench({ playerId: "p", date: dato, startMinute: 720, durationMinutes: 60, status: "PUBLISHED" });
  assert.equal(fullfort.scheduledAt.toISOString(), "2026-09-28T10:00:00.000Z");
  assert.equal(publisert.status, "PLANNED");
  const d = byggGruppeAnalyse([], [{ id: "p", navn: "S" }], [fullfort, publisert], now);
  assert.equal(d.spillere[0].etterlevelsePct, 50);
});
