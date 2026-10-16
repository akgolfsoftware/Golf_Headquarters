import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  avledRundeRegistrering,
  erKomplettSlagKjede,
  lesRundeDataQuality,
  lesRundeKilde,
  lesRundeSgKilde,
  lesRundeStatus,
  rundeRegistreringFelter,
} from "./kontrakt";

const hull18 = Array.from({ length: 18 }, (_, i) => ({
  holeNumber: i + 1,
  strokes: 4,
  putts: null,
  fairway: null,
  gir: null,
}));

const komplettSlag18 = hull18.flatMap((h) => [
  { holeNumber: h.holeNumber, distanceToPin: 360, isPenalty: false },
  { holeNumber: h.holeNumber, distanceToPin: 140, isPenalty: false },
  { holeNumber: h.holeNumber, distanceToPin: 8, isPenalty: false },
  { holeNumber: h.holeNumber, distanceToPin: 1, isPenalty: false },
]);

describe("runde/SG-kontrakt", () => {
  it("godtar bare kjente SG-kilder", () => {
    assert.equal(lesRundeSgKilde("manual"), "manual");
    assert.equal(lesRundeSgKilde("beregnet"), "beregnet");
    assert.equal(lesRundeSgKilde("estimert"), "estimert");
    assert.equal(lesRundeSgKilde("upgame"), null);
    assert.equal(lesRundeSgKilde(null), null);
  });

  it("godtar bare kjente lagrede metadata-verdier", () => {
    assert.equal(lesRundeKilde("upgame_csv"), "upgame_csv");
    assert.equal(lesRundeKilde("ekstern"), null);
    assert.equal(lesRundeStatus("komplett"), "komplett");
    assert.equal(lesRundeStatus("ferdig"), null);
    assert.equal(lesRundeDataQuality("hullscore_detaljer"), "hullscore_detaljer");
    assert.equal(lesRundeDataQuality("detaljert"), null);
  });

  it("krever scorekort, slag, avstand og scorematch for komplett kjede", () => {
    const komplett = erKomplettSlagKjede(hull18, komplettSlag18);
    assert.equal(komplett.komplett, true);
    assert.equal(komplett.antallKompletteHull, 18);
    assert.deepEqual(komplett.mangler, []);

    const utenAvstand = erKomplettSlagKjede(hull18, [
      ...komplettSlag18.slice(0, 3),
      { holeNumber: 1, distanceToPin: null, isPenalty: false },
      ...komplettSlag18.slice(4),
    ]);
    assert.equal(utenAvstand.komplett, false);
    assert.ok(utenAvstand.mangler.includes("avstand hull 1"));
  });

  it("klassifiserer total-only som delvis og ikke SG-grunnlag", () => {
    const status = avledRundeRegistrering({
      sgSource: null,
      holeScores: [],
      shots: [],
    });
    assert.equal(status.status, "delvis");
    assert.equal(status.dataQuality, "total_only");
    assert.equal(status.kanBeregneSg, false);
    assert.deepEqual(status.manglerForBeregnetSg, ["scorekort"]);
  });

  it("skiller scorekort med detaljer fra ren hullscore", () => {
    const status = avledRundeRegistrering({
      sgSource: null,
      holeScores: [{ holeNumber: 1, strokes: 4, putts: 2, fairway: true, gir: true }],
      shots: [],
    });
    assert.equal(status.status, "delvis");
    assert.equal(status.dataQuality, "hullscore_detaljer");
  });

  it("klassifiserer komplett slag-for-slag som beregnbart", () => {
    const status = avledRundeRegistrering({
      sgSource: "beregnet",
      holeScores: hull18,
      shots: komplettSlag18,
    });
    assert.equal(status.status, "komplett");
    assert.equal(status.dataQuality, "slag_for_slag_komplett");
    assert.equal(status.kanBeregneSg, true);
    assert.equal(status.antallKompletteHull, 18);
  });

  it("klassifiserer estimert SG som delvis selv om en syntetisk kjede finnes", () => {
    const status = avledRundeRegistrering({
      sgSource: "estimert",
      holeScores: hull18,
      shots: komplettSlag18,
      kilde: "etterregistrering",
    });
    assert.equal(status.status, "delvis");
    assert.equal(status.dataQuality, "hullscore");
    assert.equal(status.kanBeregneSg, false);
  });

  it("manuell SG er egen kvalitet og beskyttes mot overskriving", () => {
    const status = avledRundeRegistrering({
      sgSource: "manual",
      holeScores: hull18,
      shots: [],
    });
    assert.equal(status.status, "manuell_sg");
    assert.equal(status.dataQuality, "manuell_sg");
    assert.equal(status.kilde, "manuell");
    assert.equal(status.beskytterManuellSg, true);
  });

  it("importkilde gir importert status uten å late som SG kan beregnes", () => {
    const status = avledRundeRegistrering({
      sgSource: null,
      kilde: "upgame_csv",
      holeScores: [{ holeNumber: 1, strokes: 5, putts: 2, fairway: false, gir: false }],
      shots: [],
    });
    assert.equal(status.status, "importert");
    assert.equal(status.dataQuality, "hullscore_detaljer");
    assert.equal(status.kanBeregneSg, false);
  });

  it("bygger lagringsfelter fra registreringsstatus", () => {
    const sourceDate = new Date("2026-09-27T10:00:00.000Z");
    const status = avledRundeRegistrering({
      sgSource: null,
      holeScores: [],
      shots: [],
    });
    assert.deepEqual(
      rundeRegistreringFelter(status, {
        sourceDate,
        importMetadata: { format: "test" },
      }),
      {
        source: "etterregistrering",
        sourceDate,
        dataQuality: "total_only",
        status: "delvis",
        partialSave: false,
        importMetadata: { format: "test" },
      },
    );
  });
});
