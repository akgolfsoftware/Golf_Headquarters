import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { harSkjulteLinjer, hentHendelser, timer } from "./maned-visning";
import { velgPeriode } from "./maned-periode-valg";
import type { MonthViewModel } from "@/lib/domain/workbench/types";

const dag = (date: string, inMonth: boolean, lines: MonthViewModel["weeks"][number]["days"][number]["lines"], restCount = 0) => ({ date, dayOfMonth: Number(date.slice(8)), inMonth, lines, restCount });
const maned = { weeks: [{ weekStart: "2026-09-28", weekNumber: 40, days: [
  dag("2026-09-30", false, [{ title: "Utenfor", durationMinutes: 60, pyramid: "TEK", hairline: true }]),
  dag("2026-10-10", true, [{ title: "Klubbturnering", durationMinutes: 240, pyramid: "TURN", hairline: true }]),
  dag("2026-10-08", true, [{ title: "Økt", durationMinutes: 60, pyramid: "FYS", hairline: false }, { title: "Wedge-test", durationMinutes: 60, pyramid: "SLAG", hairline: true }], 1),
] }] } as unknown as MonthViewModel;

describe("maned-visning", () => {
  it("timer viser tankestrek for null og norsk desimal ellers", () => {
    assert.equal(timer(0), "—");
    assert.equal(timer(150), "2,5 t");
    assert.equal(timer(120), "2 t");
  });
  it("hentHendelser tar bare hairline-linjer i måneden, kronologisk", () => {
    assert.deepEqual(hentHendelser(maned).map((h) => h.tittel), ["Wedge-test", "Klubbturnering"]);
  });
  it("harSkjulteLinjer sier fra når en dag har rest", () => {
    assert.equal(harSkjulteLinjer(maned), true);
  });
});

describe("velgPeriode", () => {
  const p = (start: string, slutt: string, fokus: string) => ({ type: "GRUNN", start, slutt, fokus, budsjett: null });
  it("velger perioden med flest dager i måneden", () => {
    const valgt = velgPeriode([p("2026-09-01", "2026-10-05", "A"), p("2026-10-06", "2026-12-20", "B")], "2026-10-01", "2026-10-31");
    assert.equal(valgt?.fokus, "B");
  });
  it("gir null uten overlapp", () => {
    assert.equal(velgPeriode([p("2026-01-01", "2026-02-01", "A")], "2026-10-01", "2026-10-31"), null);
  });
});
