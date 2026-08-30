/**
 * GolfBox score-pipeline: alltid brutto, aldri netto-klasser.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  erNettoKlasse,
  extractRoundScore,
  golfboxKlasseNavn,
  sumHoleScores,
  parseCompetitionClasses,
  velgBruttoKlasser,
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

// Bygg et HoleScores-dict slik GolfBox leverer det (H1..H18 + H-OUT/H-IN).
function lagHoleScores(scores: (number | null)[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  scores.forEach((s, i) => {
    out[`H${i + 1}`] = { Score: s == null ? { Text: null, Value: null } : { Text: String(s), Value: s } };
  });
  out["H-OUT"] = { Score: { Text: null, Value: null } };
  out["H-IN"] = { Score: { Text: null, Value: null } };
  return out;
}

test("sumHoleScores: summerer H1–H18, hopper over H-OUT/H-IN", () => {
  const scores = [4, 3, 5, 3, 5, 4, 2, 5, 4, 6, 3, 4, 4, 4, 4, 4, 5, 3]; // = 72
  assert.equal(sumHoleScores({ HoleScores: lagHoleScores(scores), IsCompleted: true }), 72);
});

test("sumHoleScores: ufullstendig runde (hull uten score) → null", () => {
  const scores = [4, 3, 5, null, 5, 4, 2, 5, 4, 6, 3, 4, 4, 4, 4, 4, 5, 3];
  assert.equal(sumHoleScores({ HoleScores: lagHoleScores(scores) }), null);
});

test("sumHoleScores: IsCompleted=false eller manglende data → null", () => {
  const scores = Array(18).fill(4);
  assert.equal(sumHoleScores({ HoleScores: lagHoleScores(scores), IsCompleted: false }), null);
  assert.equal(sumHoleScores({}), null);
  assert.equal(sumHoleScores(null), null);
  assert.equal(sumHoleScores({ HoleScores: {} }), null); // < 9 hull
});

test("extractRoundScore: fallback til hullsum når ResultSum mangler (Olyo/Østlandstour)", () => {
  const scores = Array(18).fill(4); // = 72
  assert.equal(extractRoundScore({ HoleScores: lagHoleScores(scores), IsCompleted: true }), 72);
  // Kun netto i ResultSum + komplette hullscorer → hullsummen er brutto
  assert.equal(
    extractRoundScore({
      ResultSum: { NetText: "68", NetValue: 680000 },
      HoleScores: lagHoleScores(scores),
    }),
    72,
  );
});

test("parseCompetitionClasses + velgBruttoKlasser: alle spillerklasser, også netto-navngitte (egne felt-lister)", () => {
  const raw = {
    CompetitionData: {
      Classes: [
        { Id: 1, Name: "G19 Brutto", ShortName: "G19" },
        { Id: 2, Name: "G19 Netto", ShortName: "G19N" },
        { Id: 3, Name: "J19 Brutto", ShortName: "J19", ClassType: "PlayerClass" },
        { Id: 4, Name: "Jenter 13-15 Netto", ShortName: "J15N" },
        { Id: 5, Name: "G12-klassen", ShortName: "G12" },
        { Id: 6, Name: "Lag", ShortName: "LAG", ClassType: "TeamClass" },
      ],
    },
  };
  const alle = parseCompetitionClasses(raw);
  assert.equal(alle.length, 6);
  // Netto-navngitte klasser (2, 4) er egne påmeldingslister (f.eks. Østlandstour
  // «Damer netto») og skal hentes på lik linje med brutto-klassene — kun
  // lagklasser (TeamClass) ekskluderes. AK-regelen «alltid brutto» håndheves i
  // stedet på score-nivå (extractRoundScore), ikke ved å droppe hele klassen.
  const brutto = velgBruttoKlasser(alle).map((c) => c.id);
  assert.deepEqual(brutto, [1, 2, 3, 4, 5]);
});

test("parseCompetitionClasses: manglende/ugyldig CompetitionData → tom liste", () => {
  assert.deepEqual(parseCompetitionClasses({}), []);
  assert.deepEqual(parseCompetitionClasses(null), []);
  assert.deepEqual(parseCompetitionClasses({ CompetitionData: { Classes: "x" } }), []);
});

test("golfboxKlasseNavn: Name-felt eller dict-nøkkel", () => {
  assert.equal(golfboxKlasseNavn({ Name: "Scratch N" }, "0"), "Scratch N");
  assert.equal(golfboxKlasseNavn({}, "Herrer"), "Herrer");
  assert.equal(golfboxKlasseNavn({ ClassName: "Junior" }), "Junior");
});
