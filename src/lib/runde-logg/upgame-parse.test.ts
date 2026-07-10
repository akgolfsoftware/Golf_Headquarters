/**
 * Fikstur-test for UpGame/aggregat-CSV-parsing (steg 2 i SG-planen).
 * Dekker begge skilletegn (; og ,), norske og engelske kolonnenavn,
 * bool-varianter, og ærlighetsreglene: manglende score → hoppet over,
 * manglende par → antar 4 med advarsel, hull utenfor 1–18 → ignorert.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  KOLONNE_MAP,
  type KolonneNøkkel,
  detekterKolonne,
  parseCSV,
  parseBool,
  konverterRaderTilHoleScores,
} from "@/lib/runde-logg/upgame-parse";

function autoMapping(headers: string[]): Record<KolonneNøkkel, string | null> {
  const m = {} as Record<KolonneNøkkel, string | null>;
  for (const nøkkel of Object.keys(KOLONNE_MAP) as KolonneNøkkel[]) {
    m[nøkkel] = detekterKolonne(headers, nøkkel);
  }
  return m;
}

/* Norsk UpGame-stil: semikolon, ja/nei, CRLF */
const CSV_SEMIKOLON = [
  "Hull;Par;Score;Putter;FIR;GIR",
  "1;4;5;2;ja;nei",
  "2;3;3;1;;ja",
  "3;5;6;3;nei;nei",
].join("\r\n");

/* Engelsk stil: komma, 1/0, quoted headers */
const CSV_KOMMA = [
  '"hole","par","strokes","putts","fairway","green"',
  "1,4,4,2,1,1",
  "2,3,4,2,0,0",
].join("\n");

describe("UpGame CSV-parsing", () => {
  it("semikolon-CSV med norske kolonner gir riktige HoleScore-input", () => {
    const { headers, rader } = parseCSV(CSV_SEMIKOLON);
    assert.deepEqual(headers, ["Hull", "Par", "Score", "Putter", "FIR", "GIR"]);
    const { hull, advarsel } = konverterRaderTilHoleScores(rader, autoMapping(headers));
    assert.equal(advarsel, null);
    assert.deepEqual(hull, [
      { holeNumber: 1, par: 4, strokes: 5, putts: 2, fairway: true, gir: false },
      { holeNumber: 2, par: 3, strokes: 3, putts: 1, fairway: null, gir: true },
      { holeNumber: 3, par: 5, strokes: 6, putts: 3, fairway: false, gir: false },
    ]);
  });

  it("komma-CSV med engelske kolonner og 1/0-bools gir riktige HoleScore-input", () => {
    const { headers, rader } = parseCSV(CSV_KOMMA);
    const { hull, advarsel } = konverterRaderTilHoleScores(rader, autoMapping(headers));
    assert.equal(advarsel, null);
    assert.deepEqual(hull, [
      { holeNumber: 1, par: 4, strokes: 4, putts: 2, fairway: true, gir: true },
      { holeNumber: 2, par: 3, strokes: 4, putts: 2, fairway: false, gir: false },
    ]);
  });

  it("ærlighet: manglende score hopper over hullet, manglende par antar 4 — begge med advarsel", () => {
    const csv = ["hull;par;score", "1;4;", "2;;5", "3;4;4"].join("\n");
    const { headers, rader } = parseCSV(csv);
    const { hull, advarsel } = konverterRaderTilHoleScores(rader, autoMapping(headers));
    assert.deepEqual(
      hull.map((h) => ({ n: h.holeNumber, par: h.par, s: h.strokes })),
      [
        { n: 2, par: 4, s: 5 },
        { n: 3, par: 4, s: 4 },
      ],
    );
    assert.ok(advarsel?.includes("Hull 1: mangler score"), `advarsel: ${advarsel}`);
    assert.ok(advarsel?.includes("Hull 2: mangler par"), `advarsel: ${advarsel}`);
  });

  it("hull utenfor 1–18 og tomme linjer ignoreres; mangler hull-kolonne → tom liste", () => {
    const csv = ["hull,score", "0,4", "19,4", "", "7,4"].join("\n");
    const { headers, rader } = parseCSV(csv);
    const { hull } = konverterRaderTilHoleScores(rader, autoMapping(headers));
    assert.deepEqual(hull.map((h) => h.holeNumber), [7]);

    const utenHull = konverterRaderTilHoleScores(rader, { ...autoMapping(headers), hullNr: null });
    assert.deepEqual(utenHull.hull, []);
    assert.equal(utenHull.advarsel, "Mangler hull-nummer-kolonne");
  });

  it("parseBool tåler norske og engelske varianter", () => {
    assert.equal(parseBool("Ja"), true);
    assert.equal(parseBool("x"), true);
    assert.equal(parseBool("NEI"), false);
    assert.equal(parseBool("-"), false);
    assert.equal(parseBool("kanskje"), null);
    assert.equal(parseBool(undefined), null);
  });
});
