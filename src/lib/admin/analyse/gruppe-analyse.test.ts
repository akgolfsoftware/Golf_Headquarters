import test from "node:test";
import assert from "node:assert/strict";
import { byggEnGruppeAnalyse, oktFraWorkbench, type OktInn } from "./gruppe-analyse";

const now = new Date("2026-09-30T12:00:00Z");
const okt = (userId: string, dagerSiden: number, min: number, status: OktInn["status"], akse = "TEK"): OktInn => ({
  userId, scheduledAt: new Date(now.getTime() - dagerSiden * 86_400_000), durationMin: min, status, akse,
});

test("etterlevelse er gjennomførte minutter delt på forfalte planlagte minutter", () => {
  const d = byggEnGruppeAnalyse(["p1", "p2"], [okt("p1", 3, 60, "COMPLETED"), okt("p1", 2, 60, "PLANNED"), okt("p2", 5, 30, "COMPLETED", "FYS")], now);
  assert.equal(d.etterlevelsePct, Math.round((90 / 150) * 100));
  assert.equal(d.gjennomfortMin, 90);
  assert.equal(d.planlagtMin, 150);
  assert.deepEqual(d.dekning, [true, true]);
  assert.equal(d.perAkse.find((a) => a.akse === "FYS")?.pct, 100);
  assert.equal(d.perAkse.find((a) => a.akse === "TEK")?.pct, 50);
  assert.equal(d.perAkse.find((a) => a.akse === "SLAG")?.pct, null);
});

test("fremtidige økter teller ikke, og spillere utenfor gruppa telles ikke", () => {
  const d = byggEnGruppeAnalyse(["p1"], [okt("p1", -2, 60, "PLANNED"), okt("x", 2, 60, "COMPLETED")], now);
  assert.equal(d.etterlevelsePct, null);
  assert.deepEqual(d.dekning, [false]);
});

test("tom gruppe gir null, ikke 0", () => {
  const d = byggEnGruppeAnalyse([], [], now);
  assert.equal(d.antallSpillere, 0);
  assert.equal(d.etterlevelsePct, null);
});

test("Workbench-status og dato oversettes riktig", () => {
  const o = oktFraWorkbench({ playerId: "p", date: new Date(Date.UTC(2026, 8, 28)), startMinute: 600, durationMinutes: 45, status: "PUBLISHED", pyramid: "SLAG" });
  assert.equal(o.status, "PLANNED");
  assert.equal(o.scheduledAt.toISOString(), "2026-09-28T10:00:00.000Z");
  assert.equal(o.akse, "SLAG");
});
