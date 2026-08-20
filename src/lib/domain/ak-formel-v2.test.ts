import { test } from "node:test";
import assert from "node:assert/strict";

import {
  OMRAADER,
  OMRAADE_KODER,
  belastningFraMiljo,
  erOmraadeKode,
  formelStreng,
  fraGammelOmraadekode,
  motorikkFraLFase,
  omraadeFamilie,
  pressFraPrPress,
} from "@/lib/domain/ak-formel-v2";

test("fasitens 19 områder — seks puttebånd og tre FYS-områder", () => {
  assert.equal(OMRAADE_KODER.length, 19);
  assert.equal(OMRAADER.length, 19);

  const putt = OMRAADE_KODER.filter((k) => k.startsWith("PUTT_"));
  assert.deepEqual(putt, [
    "PUTT_0_3",
    "PUTT_3_5",
    "PUTT_5_10",
    "PUTT_10_25",
    "PUTT_25_40",
    "PUTT_40_PLUSS",
  ]);

  const fys = OMRAADE_KODER.filter((k) => omraadeFamilie(k) === "FYS");
  assert.deepEqual(fys, ["STYRKE", "KONDISJON", "BEVEGELIGHET"]);
});

test("putteavstander i fot, resten i meter", () => {
  for (const o of OMRAADER) {
    if (o.familie === "PUTT") assert.equal(o.enhet, "ft", o.kode);
    else if (o.familie === "FYS" || o.familie === "BANE") assert.equal(o.enhet, null, o.kode);
    else assert.equal(o.enhet, "m", o.kode);
  }
});

test("formelstrengen hopper over akser som ikke gjelder", () => {
  // Putt har ingen motorikk — leddet skal utebli helt, ikke bli «null».
  assert.equal(
    formelStreng({
      pyramide: "TEK",
      omraade: "PUTT_5_10",
      motorikk: null,
      belastning: "TRENINGSOMRAADE",
      press: "ALENE",
    }),
    "TEK_PUTT_5_10_TRENINGSOMRAADE_ALENE",
  );
  assert.equal(
    formelStreng({
      pyramide: "TEK",
      omraade: "TEE_TOTAL",
      motorikk: "LAV_HAST",
      belastning: "INNENDORS",
      press: "ALENE",
    }),
    "TEK_TEE_TOTAL_LAV_HAST_INNENDORS_ALENE",
  );
});

test("v1-broene mapper som Anders godkjente 20.08", () => {
  // De tre kroppsdel-fasene er alle uten ball.
  assert.equal(motorikkFraLFase("L_KROPP"), "UTEN_BALL");
  assert.equal(motorikkFraLFase("L_ARM"), "UTEN_BALL");
  assert.equal(motorikkFraLFase("L_KOLLE"), "UTEN_BALL");
  assert.equal(motorikkFraLFase("L_BALL"), "LAV_HAST");
  assert.equal(motorikkFraLFase("L_AUTO"), "AUTO");
  assert.equal(motorikkFraLFase(null), null);

  assert.equal(belastningFraMiljo("M0"), "INNENDORS");
  assert.equal(belastningFraMiljo("M1"), "INNENDORS");
  assert.equal(belastningFraMiljo("M2"), "TRENINGSOMRAADE");
  assert.equal(belastningFraMiljo("M3"), "TRENINGSOMRAADE");
  assert.equal(belastningFraMiljo("M4"), "BANE");
  assert.equal(belastningFraMiljo("M5"), "KONKURRANSE");

  assert.equal(pressFraPrPress("PR1"), "ALENE");
  assert.equal(pressFraPrPress("PR2"), "ALENE");
  assert.equal(pressFraPrPress("PR3"), "OBSERVERT");
  assert.equal(pressFraPrPress("PR4"), "KONKURRANSE");
  assert.equal(pressFraPrPress("PR5"), "TURNERING");
});

test("gamle områdekoder plasseres, ukjente gjettes aldri", () => {
  assert.equal(fraGammelOmraadekode("TEE"), "TEE_TOTAL");
  assert.equal(fraGammelOmraadekode("CHIP"), "CHIP");
  assert.equal(fraGammelOmraadekode("INNSPILL_0_50"), "INNSPILL_50");
  // De tre gamle båndene 10-15/15-25 faller i det nye 10-25.
  assert.equal(fraGammelOmraadekode("PUTT_10_15"), "PUTT_10_25");
  assert.equal(fraGammelOmraadekode("PUTT_15_25"), "PUTT_10_25");
  // 25-40 finnes nå som eget bånd og treffer direkte.
  assert.equal(fraGammelOmraadekode("PUTT_25_40"), "PUTT_25_40");
  assert.equal(fraGammelOmraadekode("MOBILITET"), "BEVEGELIGHET");
  // Fri tekst uten treff skal bli null — å gjette gir falske kategorier.
  assert.equal(fraGammelOmraadekode("Tee Total (driver og 3-tre)"), null);
  assert.equal(fraGammelOmraadekode(""), null);
  assert.equal(fraGammelOmraadekode(null), null);
});

test("erOmraadeKode skiller fasitkoder fra fri tekst", () => {
  assert.equal(erOmraadeKode("PUTT_25_40"), true);
  assert.equal(erOmraadeKode("PUTT_10_40"), false);
  assert.equal(erOmraadeKode("MOBILITET"), false);
  assert.equal(erOmraadeKode(undefined), false);
});
