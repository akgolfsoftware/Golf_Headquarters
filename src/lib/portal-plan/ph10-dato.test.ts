/** PH-10 Plan: datoregning, lag og opptatt tid. Kjør med: npm test */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  aksererDag, erIso, filtrerHeldag, filtrerOkter, flytt, isoUke, krasjMed, mandagAv, maanedsUker, ALLE_LAG, utvidAvtaler,
} from "./ph10-dato";
import type { PlanHeldag, PlanOkt } from "./ph10-typer";

const okt = (p: Partial<PlanOkt>): PlanOkt => ({
  id: "o", dato: "2026-09-28", tid: "08:00", min: 60, akse: "tek", tittel: "T", sted: null, status: "Planlagt", href: "#", startHref: null, ovelser: [], ...p,
});

test("erIso avviser ugyldige datoer", () => {
  assert.equal(erIso("2026-09-28"), true);
  assert.equal(erIso("2026-02-30"), false);
  assert.equal(erIso("28.09.2026"), false);
  assert.equal(erIso(undefined), false);
});

test("mandagAv og ISO-uke stemmer med kalenderen", () => {
  assert.equal(mandagAv("2026-09-27"), "2026-09-21");
  assert.equal(mandagAv("2026-09-28"), "2026-09-28");
  assert.equal(isoUke("2026-09-26"), 39);
  assert.equal(isoUke("2026-09-28"), 40);
  assert.equal(isoUke("2026-01-01"), 1);
  assert.equal(isoUke("2026-12-31"), 53);
});

test("månedsrutenettet er hele uker som berører måneden", () => {
  const uker = maanedsUker(2026, 8);
  assert.deepEqual(uker, ["2026-08-31", "2026-09-07", "2026-09-14", "2026-09-21", "2026-09-28"]);
  assert.equal(maanedsUker(2026, 1).length, 5);
});

test("flytt går riktig vei på hvert nivå", () => {
  assert.equal(flytt("dag", "2026-09-30", 1), "2026-10-01");
  assert.equal(flytt("uke", "2026-09-30", -1), "2026-09-23");
  assert.equal(flytt("maaned", "2026-09-30", 1), "2026-10-01");
  assert.equal(flytt("maaned", "2026-01-15", -1), "2025-12-01");
  assert.equal(flytt("aar", "2026-09-30", 1), "2027-01-01");
});

test("lag: fysisk og turnering skjules, golf står alltid", () => {
  const liste = [okt({ id: "a", akse: "fys" }), okt({ id: "b", akse: "turn" }), okt({ id: "c", akse: "slag" })];
  assert.deepEqual(filtrerOkter(liste, ALLE_LAG).map((o) => o.id), ["a", "b", "c"]);
  assert.deepEqual(filtrerOkter(liste, { ...ALLE_LAG, fys: false, turn: false }).map((o) => o.id), ["c"]);
  const h: PlanHeldag[] = [
    { id: "1", art: "turnering", fra: "2026-10-03", til: "2026-10-04", tittel: "T", meta: null, turneringId: null, detaljer: [] },
    { id: "2", art: "samling", fra: "2026-10-06", til: "2026-10-10", tittel: "S", meta: null, turneringId: null, detaljer: [] },
    { id: "3", art: "skole", fra: "2026-10-05", til: "2026-10-05", tittel: "Fri", meta: null, turneringId: null, detaljer: [] },
  ];
  assert.deepEqual(filtrerHeldag(h, { ...ALLE_LAG, turn: false, opptatt: false }).map((x) => x.id), ["2"]);
});

test("krasj gjelder bare planlagte økter som overlapper", () => {
  const skole = [{ id: "s", dato: "2026-09-28", tid: "08:15", min: 405, art: "skole" as const, tittel: "Skole" }];
  assert.equal(krasjMed(okt({ tid: "09:00", min: 60 }), skole)?.id, "s");
  assert.equal(krasjMed(okt({ tid: "15:00", min: 60 }), skole), null);
  assert.equal(krasjMed(okt({ tid: "09:00", status: "Gjennomført" }), skole), null);
  assert.equal(krasjMed(okt({ dato: "2026-09-29", tid: "09:00" }), skole), null);
});

test("aksene per dag kommer i pyramiderekkefølge", () => {
  const liste = [okt({ akse: "slag" }), okt({ akse: "fys" }), okt({ akse: "slag" }), okt({ dato: "2026-09-29", akse: "turn" })];
  assert.deepEqual(aksererDag(liste, "2026-09-28"), ["fys", "slag"]);
});

test("egne avtaler: enkelt, ukentlig og over midnatt", () => {
  const enkel = { id: "a", title: "Tannlege", kind: "AVTALE", recurring: "NONE", startAt: new Date("2026-09-30T17:30:00Z"), endAt: new Date("2026-09-30T18:30:00Z") };
  const ukentlig = { id: "b", title: "Jobb", kind: "JOBB", recurring: "WEEKLY", startAt: new Date("2026-09-25T15:30:00Z"), endAt: new Date("2026-09-25T18:30:00Z") };
  const natt = { id: "c", title: "Reise", kind: "REISE", recurring: "NONE", startAt: new Date("2026-10-02T20:00:00Z"), endAt: new Date("2026-10-03T06:00:00Z") };
  const ut = utvidAvtaler([enkel, ukentlig, natt], "2026-09-28", "2026-10-04");
  const tannlege = ut.find((x) => x.tittel === "Tannlege");
  assert.deepEqual([tannlege?.dato, tannlege?.tid, tannlege?.min], ["2026-09-30", "19:30", 60]);
  const jobb = ut.filter((x) => x.tittel === "Jobb");
  assert.deepEqual(jobb.map((x) => x.dato), ["2026-10-02"]);
  assert.equal(jobb[0].min, 180);
  const reise = ut.filter((x) => x.tittel === "Reise");
  assert.deepEqual(reise.map((x) => [x.dato, x.tid, x.min]), [["2026-10-02", "22:00", 120], ["2026-10-03", "00:00", 480]]);
});
