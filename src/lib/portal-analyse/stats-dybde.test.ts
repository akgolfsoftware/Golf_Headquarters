import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { byggTrening, treningSteder, UTEN_STED, type TreningOkt } from "./trening-stats";
import { byggResultater, motParTekst, type ResultatRundeInn } from "./resultater-data";
import { byggPH14 } from "@/lib/portal-tester/ph14-tester-data";
import type { TestRow } from "@/lib/portal-tester/tester-data";
import type { TurneringsRad } from "@/lib/domain/turneringshistorikk";

const NAA = new Date("2026-10-05T12:00:00Z");
const okt = (dagerSiden: number, akse: TreningOkt["akse"], status: TreningOkt["status"], min = 60, sted: string | null = "Range"): TreningOkt =>
  ({ start: new Date(NAA.getTime() - dagerSiden * 86_400_000).toISOString(), min, status, akse, sted });

describe("byggTrening (PH-17)", () => {
  it("gjennomført mot plan per akse, bare siste fire uker og passert sluttid", () => {
    const s = byggTrening([
      okt(2, "TEK", "COMPLETED"), okt(3, "TEK", "SKIPPED"), okt(4, "FYS", "COMPLETED", 90, "Styrkerom"),
      okt(40, "TEK", "COMPLETED"), // utenfor vinduet
      { ...okt(0, "SLAG", "PLANNED"), start: new Date(NAA.getTime() + 3_600_000).toISOString() }, // fremtidig
    ], NAA);
    assert.equal(s.gjortMin, 150);
    assert.equal(s.planMin, 210);
    assert.equal(s.pct, 71);
    assert.deepEqual(s.akser.find((a) => a.akse === "TEK"), { akse: "TEK", gjortMin: 60, planMin: 120 });
    assert.deepEqual(s.akser.find((a) => a.akse === "SLAG"), { akse: "SLAG", gjortMin: 0, planMin: 0 });
    assert.deepEqual(s.sted, [{ navn: "Styrkerom", min: 90 }, { navn: "Range", min: 60 }]);
  });
  it("filter på akse og sted, og økter uten sted får egen rad", () => {
    const okter = [okt(2, "TEK", "COMPLETED", 60, null), okt(3, "FYS", "COMPLETED", 30, "Styrkerom")];
    assert.deepEqual(byggTrening(okter, NAA, { akse: ["TEK"], sted: [] }).akser.map((a) => a.akse), ["TEK"]);
    assert.equal(byggTrening(okter, NAA, { akse: [], sted: [UTEN_STED] }).gjortMin, 60);
    assert.deepEqual(treningSteder(okter), [UTEN_STED, "Styrkerom"]);
  });
  it("ingen økter gir null i prosent, aldri 0 %", () => {
    assert.equal(byggTrening([], NAA).pct, null);
  });
});

const par18 = Array.from({ length: 18 }, () => ({ par: 4 }));
const runde = (i: number, score: number, hull = par18): ResultatRundeInn =>
  ({ id: `r${i}`, playedAt: new Date(Date.UTC(2026, 8, 30 - i)), score, roundType: "trening", courseName: "Bane", holeScores: hull });
const turn = (navn: string, klasse: string, r: number[], plass: number | null, status = "FINISHED"): TurneringsRad => ({
  turneringId: navn, navn, kilde: "GOLFBOX", tour: null, startDato: new Date("2026-09-01"), plassering: plass, motPar: null,
  status, brutto: null, klasse, runder: r.map((b, i) => ({ nummer: i + 1, brutto: b, motPar: b - 72, hull: 18, fullfort: true })),
});

describe("byggResultater", () => {
  it("snitt som i Stats: siste 10 18-hullsrunder, minst 4, 9-hullsrunder teller ikke", () => {
    const tre = [runde(0, 72), runde(1, 74), runde(2, 73)];
    assert.equal(byggResultater(tre, []).snitt, null);
    const d = byggResultater([...tre, runde(3, 75), runde(4, 36, par18.slice(0, 9))], []);
    assert.equal(d.snitt, 73.5);
    assert.equal(d.antallSnittRunder, 4);
  });
  it("nettoklasser tas ikke med, og plassering teller bare for fullførte", () => {
    const d = byggResultater([], [turn("A", "Herrer", [72, 73], 3), turn("B", "Herrer Netto", [66], 1), turn("C", "G19", [80], 40, "CUT")]);
    assert.deepEqual(d.turneringer.map((t) => t.navn), ["A", "C"]);
    assert.equal(d.turneringer[0]!.sum, 145);
    assert.equal(d.turneringer[1]!.plass, null);
    assert.deepEqual(d.bestePlassering, { plass: 3, navn: "A" });
    assert.equal(d.runder.filter((r) => r.type === "turn").length, 3);
  });
  it("mot par vises med riktig fortegn", () => {
    assert.equal(motParTekst(0), "E");
    assert.equal(motParTekst(3), "+3");
    assert.equal(motParTekst(-2), "−2");
    assert.equal(motParTekst(null), "—");
  });
});

const testRad = (id: string, history: number[], o: Partial<TestRow> = {}): TestRow => {
  const n = history.length, d = n > 1 ? history[n - 1]! - history[n - 2]! : null;
  return {
    id, name: id, axis: "slag", rule: "", latest: n ? String(history[n - 1]) : null, latestRaw: n ? history[n - 1]! : null, latestDate: null,
    delta: d == null ? null : { text: "", tone: "flat" }, attempts: n, history, lowerIsBetter: false,
    verdict: d == null ? "new" : d > 0 ? "gain" : d < 0 ? "drop" : "hold", href: `/t/${id}`, hubGruppe: "andre",
    scoringKind: "fallback", shotsCount: 0, forfallDato: null, latestAt: n ? "2026-09-28T10:00:00Z" : null, ...o,
  };
};

describe("byggPH14", () => {
  it("teller tester bedre enn forrige måling og finner siste rekord", () => {
    const d = byggPH14([testRad("a", [1, 2]), testRad("b", [3, 2]), testRad("c", [5]), testRad("d", [])], NAA);
    assert.equal(d.bedre, 1);
    assert.equal(d.sammenlignbare, 2);
    assert.equal(d.tatt, 3);
    assert.equal(d.sisteRekord?.navn, "a");
    assert.equal(d.rader.find((r) => r.id === "d")!.vis, null);
  });
  it("lavere er bedre gir rekord på laveste verdi, og frist i fortiden er ikke neste testdag", () => {
    const d = byggPH14([
      testRad("p", [0.09, 0.06], { lowerIsBetter: true, forfallAt: "2026-09-01T10:00:00Z" }),
      testRad("q", [], { forfallAt: "2026-10-19T10:00:00Z" }),
    ], NAA);
    assert.equal(d.rader[0]!.rekord, true);
    assert.equal(d.nesteTestdag?.navn, "q");
    assert.equal(d.nesteTestdag?.dag, 19);
  });
});
