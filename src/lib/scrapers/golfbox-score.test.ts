/**
 * GolfBox score-pipeline: alltid brutto, aldri netto-klasser.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  erNettoKlasse,
  extractRoundScore,
  golfboxKlasseNavn,
} from "./golfbox";

test("erNettoKlasse: ender på N / Net / Netto", () => {
  assert.equal(erNettoKlasse("Scratch N"), true);
  assert.equal(erNettoKlasse("Herrer N"), true);
  assert.equal(erNettoKlasse("Amatør-N"), true);
  assert.equal(erNettoKlasse("Class (N)"), true);
  assert.equal(erNettoKlasse("Senior Net"), true);
  assert.equal(erNettoKlasse("Netto"), true);
  assert.equal(erNettoKlasse("  damer n  "), true);
});

test("erNettoKlasse: brutto-klasser passerer", () => {
  assert.equal(erNettoKlasse("Scratch"), false);
  assert.equal(erNettoKlasse("Herrer"), false);
  assert.equal(erNettoKlasse("Junior GU16"), false);
  assert.equal(erNettoKlasse("Norge"), false); // ender ikke på N som klasse-suffix
  assert.equal(erNettoKlasse(""), false);
  assert.equal(erNettoKlasse(null), false);
});

test("extractRoundScore: ActualText (brutto), ikke NetText", () => {
  assert.equal(
    extractRoundScore({
      ResultSum: { ActualText: "72", NetText: "68", ActualValue: 720000, NetValue: 680000 },
    }),
    72,
  );
  assert.equal(
    extractRoundScore({ ResultSum: { ActualValue: 750000 } }),
    75,
  );
  // Kun netto-felt → null (vi henter ikke netto)
  assert.equal(extractRoundScore({ ResultSum: { NetText: "68", NetValue: 680000 } }), null);
  assert.equal(extractRoundScore(null), null);
  assert.equal(extractRoundScore({}), null);
});

test("golfboxKlasseNavn: Name-felt eller dict-nøkkel", () => {
  assert.equal(golfboxKlasseNavn({ Name: "Scratch N" }, "0"), "Scratch N");
  assert.equal(golfboxKlasseNavn({}, "Herrer"), "Herrer");
  assert.equal(golfboxKlasseNavn({ ClassName: "Junior" }), "Junior");
});
