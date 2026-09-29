/** Planlagt mot gjennomført tid per uke (TN-01 «Spillere som trenger deg», TN-02 Plan-fanen). */
import assert from "node:assert/strict";
import { test } from "node:test";

import { isoUke, mandagFor, naivOsloNaa, ukeEtterlevelse, underTerskelToUker, type EtterlevelseOkt } from "./etterlevelse";

const dag = (s: string) => new Date(`${s}T00:00:00.000Z`);
const okt = (dato: string, startMinutt: number, varighet: number, status: string): EtterlevelseOkt => ({ dato: dag(dato), startMinutt, varighet, status });
const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);

// Lørdag 26.09.2026 kl. 12:00 i Oslo (sommertid, UTC+2).
const NAA = new Date("2026-09-26T10:00:00.000Z");

test("naivOsloNaa gir Oslo-veggklokke, ikke UTC", () => {
  assert.equal(new Date(naivOsloNaa(NAA)).toISOString(), "2026-09-26T12:00:00.000Z");
});

test("kl. 00:30 norsk tid er ny dag selv om UTC fortsatt er i går", () => {
  assert.equal(iso(naivOsloNaa(new Date("2026-09-27T22:30:00.000Z"))), "2026-09-28");
});

test("mandagFor finner mandagen i uka", () => {
  assert.equal(iso(mandagFor(dag("2026-09-27").getTime())), "2026-09-21");
  assert.equal(iso(mandagFor(dag("2026-09-21").getTime())), "2026-09-21");
});

test("isoUke gir uke 39 for 21.–27.09.2026", () => {
  assert.equal(isoUke(dag("2026-09-21").getTime()), 39);
  assert.equal(isoUke(dag("2026-09-27").getTime()), 39);
});

test("teller bare økter med passert sluttid, og bare COMPLETED som gjennomført", () => {
  const [uke] = ukeEtterlevelse([
    okt("2026-09-21", 8 * 60, 60, "COMPLETED"),
    okt("2026-09-22", 8 * 60, 90, "PUBLISHED"),
    okt("2026-09-26", 11 * 60, 30, "COMPLETED"), // slutter 11:30, før 12:00
    okt("2026-09-26", 13 * 60, 60, "PUBLISHED"), // fremtidig
    okt("2026-09-23", 8 * 60, 60, "CANCELLED"), // ikke plan
    okt("2026-09-24", 8 * 60, 60, "DRAFT"), // ikke plan
  ], NAA, 1);
  assert.deepEqual(uke, { mandag: "2026-09-21", ukenr: 39, planlagt: 180, gjennomfort: 90, planlagtHeleUka: 240, prosent: 50 });
});

test("gir null når ingen økter er forfalt, aldri 0 %", () => {
  const [uke] = ukeEtterlevelse([okt("2026-09-27", 9 * 60, 60, "PUBLISHED")], NAA, 1);
  assert.equal(uke.prosent, null);
});

test("legger eldste uke først og ignorerer økter utenfor vinduet", () => {
  const uker = ukeEtterlevelse([okt("2026-09-14", 60, 60, "COMPLETED"), okt("2026-08-01", 60, 60, "COMPLETED")], NAA, 2);
  assert.deepEqual(uker.map((u) => u.ukenr), [38, 39]);
  assert.equal(uker[0].prosent, 100);
  assert.equal(uker[1].prosent, null);
});

const u = (prosent: number | null) => ({ mandag: "", ukenr: 0, planlagt: 0, gjennomfort: 0, planlagtHeleUka: 0, prosent });

test("underTerskelToUker slår ut når de to siste ukene begge er under 70 %", () => {
  assert.equal(underTerskelToUker([u(90), u(62), u(58)]), true);
});

test("underTerskelToUker slår ikke ut på nøyaktig 70 %", () => {
  assert.equal(underTerskelToUker([u(69), u(70)]), false);
});

test("en uke uten forfalte økter bryter rekken", () => {
  assert.equal(underTerskelToUker([u(40), u(null)]), false);
});
