/**
 * SG-skrivepresedens — tester (AP0.3).
 *
 * Ren funksjon, ingen mocks: dette er nettopp grunnen til at beslutningen ble
 * flyttet ut av server-actionen. Reglene den låser er de som beskytter
 * spillerens tall: håndtastet SG skal aldri kunne bli overskrevet av en
 * automatisk reberegning, og halvferdige kjeder skal aldri etterlate stale
 * tall som ser ekte ut.
 *
 * Kjør med: npm test
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  avgjorSgSkriving,
  TOMME_SG_FELTER,
  type SgHovedtall,
  type SgGranulaer,
} from "./sg-skriving";

const SG: SgHovedtall = { total: -2.41, ott: -1.09, app: -0.52, arg: 0.23, putt: -1.03 };

const GRAN: SgGranulaer = {
  sgTee: -1.03,
  sgApp100: -0.15,
  sgBunker: 0.23,
  sgPutt0_3: 0.08,
};

describe("avgjorSgSkriving", () => {
  it("manuell SG overskrives ALDRI — heller ikke av en komplett kjede", () => {
    const b = avgjorSgSkriving("manual", SG, GRAN);
    assert.equal(b.handling, "ingen");
    assert.equal(b.grunn, "manuell");
  });

  it("manuell SG nullstilles heller ikke av en ufullstendig kjede", () => {
    const b = avgjorSgSkriving("manual", null, null);
    assert.equal(b.handling, "ingen");
    assert.equal(b.grunn, "manuell");
  });

  it("komplett kjede skriver hovedtall + kilde «beregnet»", () => {
    const b = avgjorSgSkriving(null, SG, GRAN);
    assert.equal(b.handling, "skriv");
    assert.equal(b.grunn, "beregnet");
    assert.ok(b.handling === "skriv");
    assert.equal(b.felter.sgTotal, -2.41);
    assert.equal(b.felter.sgOtt, -1.09);
    assert.equal(b.felter.sgPutt, -1.03);
    assert.equal(b.felter.sgSource, "beregnet");
  });

  it("granulære buckets som mangler skrives som null, ikke utelates", () => {
    const b = avgjorSgSkriving(null, SG, GRAN);
    assert.ok(b.handling === "skriv");
    assert.equal(b.felter.sgTee, -1.03);
    assert.equal(b.felter.sgApp100, -0.15);
    // Ikke satt i GRAN → må være eksplisitt null, ellers ville et gammelt
    // tall blitt stående i databasen (Prisma tolker undefined som «ikke rør»).
    assert.equal(b.felter.sgApp200, null);
    assert.equal(b.felter.sgPitch, null);
    assert.equal(b.felter.sgPutt40plus, null);
    // Alle 21 feltene skal være med i skrivingen.
    assert.equal(Object.keys(b.felter).length, Object.keys(TOMME_SG_FELTER).length);
  });

  it("komplett kjede uten granulære tall skriver fortsatt hovedtallene", () => {
    const b = avgjorSgSkriving(null, SG, null);
    assert.ok(b.handling === "skriv");
    assert.equal(b.felter.sgTotal, -2.41);
    assert.equal(b.felter.sgTee, null);
  });

  it("ufullstendig kjede nullstiller tall som VAR beregnet", () => {
    const b = avgjorSgSkriving("beregnet", null, null);
    assert.equal(b.handling, "skriv");
    assert.equal(b.grunn, "nullstill");
    assert.ok(b.handling === "skriv");
    assert.deepEqual(b.felter, TOMME_SG_FELTER);
    assert.equal(b.felter.sgSource, null);
  });

  it("ufullstendig kjede uten tidligere tall rører ikke raden", () => {
    const b = avgjorSgSkriving(null, null, null);
    assert.equal(b.handling, "ingen");
    assert.equal(b.grunn, "ufullstendig-uten-tidligere");
  });

  it("nullstillingen deler ikke objekt med TOMME_SG_FELTER (ingen mutasjonsfelle)", () => {
    const b = avgjorSgSkriving("beregnet", null, null);
    assert.ok(b.handling === "skriv");
    assert.notEqual(b.felter, TOMME_SG_FELTER);
  });
});
