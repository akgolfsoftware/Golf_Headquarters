import { test } from "node:test";
import assert from "node:assert/strict";
import { lesTurneringsresultat, type OffentligResultat } from "./turneringsresultat";
import { importerteRundeTall } from "@/lib/datagolf/player-tool";
import { byggTurneringshistorikk, type TurneringsRad } from "./turneringshistorikk";

const entry = (): OffentligResultat => ({ status: "FINISHED", position: 2, scoreToPar: 2, totalScore: 146,
  rounds: { version: 2, source: "GOLFBOX", complete: true, grossRanking: true, fetchedAt: "2026-09-10T10:00:00.000Z", positionText: "T2",
    roundScores: [72, 74], roundToPar: [0, 2], roundHoles: [18, 18], roundCompleted: [true, true] }, roundDetails: [] });
const rad = (): TurneringsRad => ({ ...lesTurneringsresultat(entry()), turneringId: "turnering-a", navn: "Syntetisk turnering", kilde: "GOLFBOX", tour: "junior-no", startDato: new Date("2026-09-01"), status: "FINISHED" });

test("brutto, mot par, delt klasseplassering og rundenummer holdes adskilt", () => {
  const r = lesTurneringsresultat(entry());
  assert.equal(r.brutto, 146);
  assert.equal(r.motPar, 2);
  assert.equal(r.plasseringTekst, "T2");
  assert.equal(r.fullstendig, true);
  assert.deepEqual(r.runder.map(r => r.motPar), [0, 2]);
});

test("live og delvis henting blir ikke dokumentert sluttresultat", () => {
  const live = lesTurneringsresultat({ ...entry(), status: "TEED_OFF" });
  assert.equal(live.brutto, null); assert.equal(live.plassering, null);
  const partial = entry();
  partial.rounds = { ...partial.rounds as object, complete: false };
  assert.equal(lesTurneringsresultat(partial).fullstendig, false);
  assert.equal(lesTurneringsresultat(partial).brutto, null);
});

test("nettoplassering blir ikke bruttoplassering; eldre data får ikke fullføringsbevis", () => {
  const net = entry(); net.rounds = { ...net.rounds as object, grossRanking: false };
  assert.equal(lesTurneringsresultat(net).plassering, null);
  assert.equal(lesTurneringsresultat(net).motPar, null);
  const legacy = lesTurneringsresultat({ ...entry(), rounds: { roundScores: [72] }, roundDetails: [{ roundNumber: 2, score: 74, toPar: 2, source: "GOLFBOX" }] });
  assert.equal(legacy.runder[0].nummer, 2);
  assert.equal(legacy.runder[0].fullfort, null);
  assert.equal(legacy.fullstendig, false);
});

test("GolfBox kan gi eget rundesnitt uten å dikte fairwaytreff eller GIR", () => {
  const result = importerteRundeTall([rad()], 12);
  assert.equal(result.score.value, 73); assert.equal(result.count, 2);
  assert.deepEqual(result.accuracy, { value: null, count: 0 });
  assert.deepEqual(result.gir, { value: null, count: 0 });
  assert.equal(importerteRundeTall([{ ...rad(), runder: [{ nummer: 1, brutto: 36, motPar: 0, hull: 9, fullfort: true }] }], 12).count, 0);
  assert.equal(importerteRundeTall([{ ...rad(), runder: [{ nummer: 1, brutto: 72, motPar: 0, hull: 18, fullfort: false }] }], 12).count, 0);
});

test("kun sluttplasseringer inngår i beste resultat", () => {
  const result = byggTurneringshistorikk([rad(), { ...rad(), turneringId: "live", status: "TEED_OFF", plassering: 1 }], true);
  assert.equal(result.bestePlassering, 2); assert.equal(result.medPlassering, 1);
});

test("summen og alle rundefeltene må stemme før brutto kalles fullstendig", () => {
  assert.equal(lesTurneringsresultat({ ...entry(), totalScore: 147 }).brutto, null);
  const short = entry(); short.rounds = { ...short.rounds as object, roundToPar: [0] };
  assert.equal(lesTurneringsresultat(short).fullstendig, false);
  assert.equal(lesTurneringsresultat({ ...entry(), klasseNavn: "Herrer netto", rounds: {} }).plassering, null);
});
